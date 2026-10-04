import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { quizService } from '../../services/quiz.service'
import type { QuizDetail, LeaderboardEntry } from '../../types/quiz.types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function QuizDetailPage() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) return
    quizService.detail(quizId).then(setQuiz).catch(() => setError('Quiz not found'))
    quizService.leaderboard(quizId).then(setLeaderboard).catch(() => setLeaderboard([]))
  }, [quizId])

  // pt-24 clears the fixed Navbar (h-16) — matches BlogListPage.tsx and
  // every other public page under PublicLayout. Applied to every return
  // path here (error/loading/loaded) so none of them render underneath it.
  if (error) {
    return (
      <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </main>
    )
  }
  if (!quiz) {
    return (
      <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 text-center">
        <p className="text-surface-500">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white mb-4">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-surface-600 dark:text-surface-400 mb-6">{quiz.description}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Left: quiz info table ─────────────────────────────── */}
          <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-white dark:bg-surface-900">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <td className="px-4 py-3 text-surface-500">Topic</td>
                  <td className="px-4 py-3 font-medium text-right text-surface-900 dark:text-white">{quiz.title}</td>
                </tr>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <td className="px-4 py-3 text-surface-500">Number of questions</td>
                  <td className="px-4 py-3 font-medium text-right text-surface-900 dark:text-white">{quiz.question_count}</td>
                </tr>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <td className="px-4 py-3 text-surface-500">Marks per question</td>
                  <td className="px-4 py-3 font-medium text-right text-surface-900 dark:text-white">
                    {quiz.points_per_question !== null ? quiz.points_per_question : 'Varies by question'}
                  </td>
                </tr>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <td className="px-4 py-3 text-surface-500">Time per question</td>
                  <td className="px-4 py-3 font-medium text-right text-surface-900 dark:text-white">
                    {quiz.time_per_question_seconds !== null
                      ? `${quiz.time_per_question_seconds}s`
                      : 'Varies by question'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-surface-500">Negative marking</td>
                  <td className="px-4 py-3 font-medium text-right text-surface-900 dark:text-white">
                    {quiz.negative_marking ? 'Yes' : 'No'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
              <Link
                to={`/quizzes/${quiz.id}/attempt`}
                className="block w-full text-center px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Start Quiz
              </Link>
            </div>
          </div>

          {/* ── Right: leaderboard ────────────────────────────────── */}
          <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-white dark:bg-surface-900">
            <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 font-medium text-sm text-surface-900 dark:text-white">
              Leaderboard
            </div>

            {leaderboard === null ? (
              <p className="p-4 text-sm text-surface-500">Loading…</p>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-surface-500">No attempts have been made yet.</p>
                <p className="text-sm text-surface-400 mt-1">Be the first to complete this quiz.</p>
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
                  {leaderboard.map((entry, i) => (
                    <tr key={entry.attempt_id} className="border-b border-surface-200 dark:border-surface-800 last:border-0">
                      <td className="px-4 py-2 text-surface-500">{i + 1}</td>
                      <td className="px-4 py-2 text-surface-900 dark:text-white">{entry.display_name}</td>
                      <td className="px-4 py-2 text-right text-surface-900 dark:text-white">
                        {entry.score} / {entry.total_points}
                      </td>
                      <td className="px-4 py-2 text-right text-surface-500">
                        {formatTime(entry.time_taken_seconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
