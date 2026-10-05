import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { House, ListChecks } from 'lucide-react';
import { quizService } from '../../services/quiz.service';
import type { AttemptQuestion, AttemptReviewQuestion, LeaderboardEntry } from '../../types/quiz.types';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Palette status per question. 'upcoming' covers both "not yet reached"
// and "currently on screen" — the current index gets a ring highlight
// separately so it's still visually distinct without a 4th color.
type QuestionStatus = 'upcoming' | 'answered' | 'skipped';

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [question, setQuestion] = useState<AttemptQuestion | null>(null);
  const [deadline, setDeadline] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<QuestionStatus[]>([]);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    correctCount: number;
    totalQuestions: number;
    review: AttemptReviewQuestion[];
  } | null>(null);
  const [openReviewIndex, setOpenReviewIndex] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileRequired, setProfileRequired] = useState(false);
  const answeredRef = useRef(false); // guards against double-submit (click + timeout both firing)

  useEffect(() => {
    if (!quizId) return;
    // Members only — this route is wrapped in RequireAuth
    // (src/routes/index.tsx), so we can always rely on the session
    // cookie being present by the time this page renders.
    quizService.detail(quizId).then((d) => setQuizTitle(d.title)).catch(() => {});
    quizService
      .startAttempt(quizId)
      .then((res) => {
        setAttemptId(res.attempt_id);
        setQuestion(res.question);
        setDeadline(new Date(res.question_deadline).getTime());
        setStatuses(Array(res.question.total).fill('upcoming'));
      })
      .catch((err) => {
        if (err?.response?.data?.code === 'MEMBER_PROFILE_REQUIRED') {
          setProfileRequired(true);
        }
        setError(err?.response?.data?.message ?? 'Failed to start quiz');
      });
  }, [quizId]);

  useEffect(() => {
    if (!deadline) return;
    answeredRef.current = false;
    setSelectedOption(null); // clear any picked-but-not-yet-submitted option when a new question loads
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) submitAnswer(null); // auto-advance on timeout
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  async function submitAnswer(optionId: string | null) {
    if (answeredRef.current || !attemptId || !question) return;
    answeredRef.current = true;

    const answeredIndex = question.index;
    setStatuses((prev) => {
      const next = [...prev];
      next[answeredIndex] = optionId ? 'answered' : 'skipped';
      return next;
    });

    const res = await quizService.answer(attemptId, question.question_id, optionId);
    if (res.completed) {
      setResult({
        score: res.final_score,
        total: res.total_points,
        correctCount: res.correct_count,
        totalQuestions: res.total_questions,
        review: res.review,
      });
      setQuestion(null);
      if (quizId) {
        quizService.leaderboard(quizId).then(setLeaderboard).catch(() => setLeaderboard([]));
      }
    } else {
      setQuestion(res.next_question);
      setDeadline(new Date(res.next_question_deadline).getTime());
    }
  }

  // pt-24 clears the fixed Navbar (h-16) — matches BlogListPage.tsx and
  // every other public page under PublicLayout. Applied to every return
  // path (error/result/loading/question) so none render underneath it.
  if (error) {
    return (
      <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 text-center">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          {profileRequired && (
            <Link
              to="/dashboard/profile"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Complete your profile
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <section className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
              Congrats, You have successfully attempted the quiz!
            </h1>
            <p className="text-surface-500 mt-2">See where you stand on the leaderboard below.</p>
            <div className="inline-flex flex-col items-center rounded-xl border border-primary-200 bg-primary-50 px-8 py-4 mt-5 dark:border-primary-900 dark:bg-primary-950/30">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Your score</span>
              <span className="text-2xl font-bold text-primary-800 dark:text-primary-200">
                {result.score} / {result.total} marks
              </span>
              <span className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                {result.correctCount} of {result.totalQuestions} questions correct
              </span>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <section className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-white dark:bg-surface-900">
              <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 font-medium text-sm text-surface-900 dark:text-white">
                Leaderboard
              </div>

              {leaderboard === null ? (
                <p className="p-4 text-sm text-surface-500">Loading…</p>
              ) : leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-surface-500">No attempts have been made yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800 text-left text-surface-500">
                      <th className="px-4 py-2 font-normal">#</th>
                      <th className="px-4 py-2 font-normal">Name</th>
                      <th className="px-4 py-2 font-normal text-right">Marks</th>
                      <th className="px-4 py-2 font-normal text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => {
                      const isYou = entry.attempt_id === attemptId;
                      return (
                        <tr
                          key={entry.attempt_id}
                          className={`border-b border-surface-200 dark:border-surface-800 last:border-0 ${
                            isYou ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                          }`}
                        >
                          <td className="px-4 py-2 text-surface-500">{i + 1}</td>
                          <td className="px-4 py-2 text-surface-900 dark:text-white">
                            {entry.display_name}
                            {isYou && <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(you)</span>}
                          </td>
                          <td className="px-4 py-2 text-right text-surface-900 dark:text-white">
                            {entry.score} / {entry.total_points}
                          </td>
                          <td className="px-4 py-2 text-right text-surface-500">
                            {formatTime(entry.time_taken_seconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            <section className="border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 p-5">
              <h2 className="text-sm font-medium text-surface-900 dark:text-white mb-4">Answer key</h2>
              <div className="grid grid-cols-5 gap-2">
                {result.review.map((item, i) => {
                  const isOpen = openReviewIndex === i;
                  const colorClass = item.selected_option_text === null
                    ? 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200'
                    : item.is_correct
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white';
                  const alignmentClass = i % 5 === 0
                    ? 'left-0'
                    : i % 5 === 4
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2';

                  return (
                    <div key={item.question_id} className="relative group">
                      <button
                        type="button"
                        aria-label={`Review question ${i + 1}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenReviewIndex(isOpen ? null : i)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-900 ${colorClass}`}
                      >
                        {i + 1}
                      </button>
                      <div
                        role="tooltip"
                        className={`absolute ${alignmentClass} top-full z-20 mt-2 w-60 rounded-lg border border-surface-200 bg-white p-3 text-xs text-surface-700 shadow-lg transition-opacity dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 ${
                          isOpen
                            ? 'visible opacity-100'
                            : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'
                        }`}
                      >
                        <p className="font-medium text-surface-900 dark:text-white">{item.question_text}</p>
                        <p className="mt-2">
                          <span className="font-medium">Your answer: </span>
                          {item.selected_option_text ?? ''}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium">Correct answer: </span>
                          {item.correct_option_text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 space-y-1.5 text-xs text-surface-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Correct
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Incorrect
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-surface-200 dark:bg-surface-700 inline-block" /> Unattempted
                </div>
              </div>
            </section>
          </div>

          <nav aria-label="After quiz actions" className="mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/quizzes"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Attempt other Quizzes</span>
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-center text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-900"
            >
              <House className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Go to Home</span>
            </Link>
          </nav>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 text-center">
        <p className="text-surface-500">Loading question…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">{quizTitle}</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ── Left: active question ─────────────────────────────── */}
          <div className="md:col-span-2 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 p-5">
            <div className="flex justify-between text-sm text-surface-500 mb-2">
              <span>
                Question {question.index + 1} of {question.total}
              </span>
              <span className="font-mono">{secondsLeft}s</span>
            </div>
            <h3 className="text-lg font-medium mb-4 text-surface-900 dark:text-white">{question.question_text}</h3>

            <div className="grid gap-2 mb-5">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`border rounded-lg p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-surface-900 dark:text-white'
                        : 'border-surface-200 dark:border-surface-800 text-surface-900 dark:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    {opt.option_text}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => submitAnswer(selectedOption)}
                disabled={!selectedOption}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Select
              </button>
              <button
                onClick={() => submitAnswer(null)}
                className="px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>

          {/* ── Right: question palette ───────────────────────────── */}
          <div className="border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 p-5">
            <h4 className="text-sm font-medium text-surface-900 dark:text-white mb-4">Questions</h4>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {statuses.map((status, i) => {
                const isCurrent = i === question.index;
                const colorClass =
                  status === 'answered'
                    ? 'bg-green-500 text-white'
                    : status === 'skipped'
                    ? 'bg-red-500 text-white'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300';
                return (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${colorClass} ${
                      isCurrent ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-surface-900' : ''
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5 text-xs text-surface-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-surface-200 dark:bg-surface-700 inline-block" /> Not attempted
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Skipped
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
