// This is the exact shape to paste into a prompt for any AI agent
// generating quiz questions — e.g.:
//   "Generate 10 chemical engineering thermodynamics questions as a
//    JSON array matching this TypeScript type: <paste QuizImportQuestion[]>
//    Exactly 4 options per question, exactly one correct."

export interface QuizImportQuestion {
  question_text: string;
  time_limit_seconds: number;   // e.g. 20
  points?: number;              // defaults to 1 if omitted
  options: [string, string, string, string]; // exactly 4
  correct_index: 0 | 1 | 2 | 3; // which of the 4 is correct
}

export type QuizImportFile = QuizImportQuestion[];

// ── What the admin form / API actually works with ────────────────
export interface QuizOption {
  option_text: string;
  is_correct: boolean;
}

export interface QuizQuestionDraft {
  question_text: string;
  time_limit_seconds: number;
  points: number;
  options: QuizOption[]; // length 4, enforced in the UI
}

export interface QuizDraft {
  title: string;
  slug: string;
  description?: string;
  negative_marking: boolean;
  status: 'draft' | 'published';
  questions: QuizQuestionDraft[];
}

// ── Quiz detail — feeds the intermediate page shown after clicking a
//    quiz from the list, before starting an attempt.
export interface QuizDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  negative_marking: boolean;
  question_count: number;
  total_points: number;
  points_per_question: number | null;        // null when questions aren't uniform
  time_per_question_seconds: number | null;  // null when questions aren't uniform
}

// ── Attempt-taking (one question at a time from the server) ──────
export interface AttemptQuestion {
  question_id: string;
  question_text: string;
  time_limit_seconds: number;
  points: number;
  options: { id: string; option_text: string }[]; // no is_correct — never sent to client
  index: number;   // 0-based position in quiz
  total: number;   // total question count
}

export interface StartAttemptResponse {
  attempt_id: string;
  question: AttemptQuestion;
  question_deadline: string; // ISO timestamp, server-computed
}

export interface AttemptReviewQuestion {
  question_id: string;
  question_text: string;
  selected_option_text: string | null;
  correct_option_text: string;
  is_correct: boolean;
}

export type AnswerResponse =
  | {
      correct: boolean;
      completed: false;
      next_question: AttemptQuestion;
      next_question_deadline: string;
    }
  | {
      correct: boolean;
      completed: true;
      final_score: number;
      total_points: number;
      correct_count: number;
      total_questions: number;
      review: AttemptReviewQuestion[];
    };

export interface LeaderboardEntry {
  attempt_id: string;
  display_name: string;
  score: number;
  total_points: number;
  completed_at: string;
  time_taken_seconds: number;
  correct_count: number;      // added
  total_questions: number;    // added
}
