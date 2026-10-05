import { Request, Response, NextFunction } from 'express';
import { pool, withTransaction } from '../lib/db';

// ── Admin: create quiz with questions ───────────────────────────
// All-or-nothing: a failure partway through inserting questions/options
// rolls the whole quiz back instead of leaving a half-built one behind.
export async function createQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, slug, description, negative_marking, status, questions } = req.body;

    if (!title?.trim() || !slug?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and slug are required.' });
    }
    if (status !== undefined && status !== 'draft' && status !== 'published') {
      return res.status(400).json({ success: false, message: "Status must be 'draft' or 'published'." });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required.' });
    }
    for (const q of questions) {
      if (!q.question_text?.trim()) {
        return res.status(400).json({ success: false, message: 'Every question needs text.' });
      }
      if (!Number.isInteger(q.time_limit_seconds) || q.time_limit_seconds <= 0) {
        return res.status(400).json({ success: false, message: `Question "${q.question_text}" needs a positive whole-number time limit.` });
      }
      if (q.points !== undefined && (!Number.isInteger(q.points) || q.points <= 0)) {
        return res.status(400).json({ success: false, message: `Question "${q.question_text}" needs positive whole-number points.` });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({ success: false, message: `Question "${q.question_text}" must have exactly 4 options.` });
      }
      if (q.options.filter((o: any) => o.is_correct).length !== 1) {
        return res.status(400).json({ success: false, message: `Question "${q.question_text}" must have exactly 1 correct option.` });
      }
    }

    const quiz = await withTransaction(async (client) => {
      const quizResult = await client.query(
        `INSERT INTO quizzes (title, slug, description, negative_marking, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title.trim(), slug.trim(), description ?? null, !!negative_marking, status ?? 'draft']
      );
      const created = quizResult.rows[0];

      for (const [i, q] of questions.entries()) {
        const qResult = await client.query(
          `INSERT INTO quiz_questions (quiz_id, question_text, time_limit_seconds, points, order_index)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [created.id, q.question_text, q.time_limit_seconds, q.points ?? 1, i]
        );
        const questionId = qResult.rows[0].id;
        for (const [j, opt] of q.options.entries()) {
          await client.query(
            `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
             VALUES ($1, $2, $3, $4)`,
            [questionId, opt.option_text, !!opt.is_correct, j]
          );
        }
      }
      return created;
    });

    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

// ── Public: list published quizzes ──────────────────────────────
export async function listQuizzes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `SELECT z.id, z.title, z.slug, z.description, COUNT(q.id) AS question_count
       FROM quizzes z LEFT JOIN quiz_questions q ON q.quiz_id = z.id
       WHERE z.status = 'published'
       GROUP BY z.id ORDER BY z.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ── Public: quiz detail — feeds the intermediate page shown after
//    clicking a quiz from the list, before starting an attempt.
//    points_per_question / time_per_question_seconds come back null
//    when questions aren't uniform, so the frontend can show "varies"
//    instead of a single misleading number.
export async function getQuizDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: quizId } = req.params;
    const quizResult = await pool.query(
      `SELECT id, title, slug, description, negative_marking
       FROM quizzes WHERE id = $1 AND status = 'published'`,
      [quizId]
    );
    if (quizResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Quiz not found' });
    const quiz = quizResult.rows[0];

    const statsResult = await pool.query(
      `SELECT COUNT(*) AS question_count,
              COALESCE(SUM(points), 0) AS total_points,
              MIN(points) AS min_points, MAX(points) AS max_points,
              MIN(time_limit_seconds) AS min_time, MAX(time_limit_seconds) AS max_time
       FROM quiz_questions WHERE quiz_id = $1`,
      [quizId]
    );
    const stats = statsResult.rows[0];

    res.json({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      negative_marking: quiz.negative_marking,
      question_count: parseInt(stats.question_count, 10),
      total_points: parseInt(stats.total_points, 10),
      points_per_question: stats.min_points === stats.max_points ? Number(stats.min_points) : null,
      time_per_question_seconds: stats.min_time === stats.max_time ? Number(stats.min_time) : null,
    });
  } catch (err) {
    next(err);
  }
}

// ── helper: fetch one question (no answer key) + total count ────
async function fetchAttemptQuestion(quizId: string, index: number) {
  const totalResult = await pool.query(`SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1`, [quizId]);
  const total = parseInt(totalResult.rows[0].count, 10);
  if (index >= total) return { question: null, total };

  const qResult = await pool.query(
    `SELECT id, question_text, time_limit_seconds, points FROM quiz_questions
     WHERE quiz_id = $1 ORDER BY order_index OFFSET $2 LIMIT 1`,
    [quizId, index]
  );
  const question = qResult.rows[0];
  const optResult = await pool.query(
    `SELECT id, option_text FROM quiz_options WHERE question_id = $1 ORDER BY order_index`,
    [question.id]
  );

  return {
    question: {
      question_id: question.id,
      question_text: question.question_text,
      time_limit_seconds: question.time_limit_seconds,
      points: question.points,
      options: optResult.rows,
      index,
      total,
    },
    total,
  };
}

// ── Attempt: start ───────────────────────────────────────────────
// Members only — requireUserSession on this route (quiz.routes.ts)
// guarantees req.userId is set before this handler ever runs.
export async function startAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: quizId } = req.params;
    const userId = req.userId!;

    const quiz = await pool.query(`SELECT id FROM quizzes WHERE id = $1 AND status = 'published'`, [quizId]);
    if (quiz.rows.length === 0) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { question } = await fetchAttemptQuestion(quizId, 0);
    if (!question) return res.status(400).json({ success: false, message: 'Quiz has no questions' });

    const attempt = await pool.query(
      `INSERT INTO quiz_attempts (quiz_id, user_id, current_question_index, current_question_started_at, total_points)
       VALUES ($1, $2, 0, now(), (SELECT COALESCE(SUM(points),0) FROM quiz_questions WHERE quiz_id = $1))
       RETURNING id, current_question_started_at`,
      [quizId, userId]
    );

    const deadline = new Date(
      new Date(attempt.rows[0].current_question_started_at).getTime() + question.time_limit_seconds * 1000
    );

    res.status(201).json({
      attempt_id: attempt.rows[0].id,
      question,
      question_deadline: deadline.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

// ── Attempt: answer current question, server advances or finishes ─
export async function answerQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { attemptId } = req.params;
    const { question_id, selected_option_id } = req.body; // selected_option_id may be null (timeout)

    const attemptResult = await pool.query(
      `SELECT qa.*, q.negative_marking FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id WHERE qa.id = $1`,
      [attemptId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status !== 'in_progress') return res.status(409).json({ success: false, message: 'Attempt already completed' });

    const qResult = await pool.query(
      `SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index OFFSET $2 LIMIT 1`,
      [attempt.quiz_id, attempt.current_question_index]
    );
    const currentQuestion = qResult.rows[0];
    if (!currentQuestion || currentQuestion.id !== question_id) {
      return res.status(409).json({ success: false, message: 'Answer does not match the current question — possible replay or stale client' });
    }

    // Server re-checks the clock — the client's countdown is UX only.
    const elapsed = (Date.now() - new Date(attempt.current_question_started_at).getTime()) / 1000;
    const withinTime = elapsed <= currentQuestion.time_limit_seconds + 3; // small grace for network latency

    let isCorrect = false;
    if (withinTime && selected_option_id) {
      const optResult = await pool.query(
        `SELECT is_correct FROM quiz_options WHERE id = $1 AND question_id = $2`,
        [selected_option_id, question_id]
      );
      isCorrect = optResult.rows[0]?.is_correct ?? false;
    }

    await pool.query(
      `INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct)
       VALUES ($1, $2, $3, $4) ON CONFLICT (attempt_id, question_id) DO NOTHING`,
      [attemptId, question_id, withinTime ? selected_option_id : null, isCorrect]
    );

    // Negative marking only applies to an attempted-and-wrong answer —
    // never to a skipped/timed-out question (selected_option_id null).
    const wasAttempted = withinTime && !!selected_option_id;
    const scoreDelta = isCorrect
      ? currentQuestion.points
      : (attempt.negative_marking && wasAttempted ? -currentQuestion.points : 0);
    const nextIndex = attempt.current_question_index + 1;
    const { question: nextQuestion } = await fetchAttemptQuestion(attempt.quiz_id, nextIndex);

    if (!nextQuestion) {
      const finalScoreResult = await pool.query(
        `UPDATE quiz_attempts SET score = score + $1, status = 'completed', completed_at = now()
         WHERE id = $2 RETURNING score, total_points`,
        [scoreDelta, attemptId]
      );
      const correctCountResult = await pool.query(
        `SELECT COUNT(*) FROM quiz_answers WHERE attempt_id = $1 AND is_correct = true`,
        [attemptId]
      );
      const totalQuestionsResult = await pool.query(
        `SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1`,
        [attempt.quiz_id]
      );
      const reviewResult = await pool.query(
        `SELECT qq.id AS question_id, qq.question_text,
                selected_option.option_text AS selected_option_text,
                correct_option.option_text AS correct_option_text,
                COALESCE(qa.is_correct, false) AS is_correct
         FROM quiz_questions qq
         LEFT JOIN quiz_answers qa
           ON qa.question_id = qq.id AND qa.attempt_id = $1
         LEFT JOIN quiz_options selected_option
           ON selected_option.id = qa.selected_option_id
          AND selected_option.question_id = qq.id
         LEFT JOIN quiz_options correct_option
           ON correct_option.question_id = qq.id AND correct_option.is_correct = true
         WHERE qq.quiz_id = $2
         ORDER BY qq.order_index`,
        [attemptId, attempt.quiz_id]
      );
      return res.json({
        correct: isCorrect,
        completed: true,
        final_score: finalScoreResult.rows[0].score,
        total_points: finalScoreResult.rows[0].total_points,
        correct_count: parseInt(correctCountResult.rows[0].count, 10),
        total_questions: parseInt(totalQuestionsResult.rows[0].count, 10),
        review: reviewResult.rows,
      });
    }

    await pool.query(
      `UPDATE quiz_attempts
       SET score = score + $1, current_question_index = $2, current_question_started_at = now()
       WHERE id = $3`,
      [scoreDelta, nextIndex, attemptId]
    );

    const deadline = new Date(Date.now() + nextQuestion.time_limit_seconds * 1000);
    res.json({
      correct: isCorrect,
      completed: false,
      next_question: nextQuestion,
      next_question_deadline: deadline.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

// ── Toppers / leaderboard ────────────────────────────────────────
export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: quizId } = req.params;
    const result = await pool.query(
    `SELECT qa.id AS attempt_id,
            COALESCE(u.full_name, qa.guest_name) AS display_name,
            qa.score, qa.total_points, qa.completed_at,
            EXTRACT(EPOCH FROM (qa.completed_at - qa.started_at))::INT AS time_taken_seconds,
            (SELECT COUNT(*) FROM quiz_answers WHERE attempt_id = qa.id AND is_correct = true)::INT AS correct_count,
            (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id)::INT AS total_questions
    FROM quiz_attempts qa
    LEFT JOIN users u ON u.id = qa.user_id
    WHERE qa.quiz_id = $1 AND qa.status = 'completed'
    ORDER BY qa.score DESC, time_taken_seconds ASC
    LIMIT 20`,
    [quizId]
  );                                        
    // Empty array when nobody has completed this quiz yet — the frontend
    // (QuizDetailPage) renders a clean "no attempts yet" message for that
    // case rather than an empty table.
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}