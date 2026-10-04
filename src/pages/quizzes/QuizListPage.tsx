import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardCheck } from 'lucide-react';
import { quizService } from '../../services/quiz.service';

interface QuizSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number;
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizService.list().then((data) => {
      setQuizzes(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="pb-6 border-b border-surface-200 dark:border-surface-800 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-surface-500 mt-1">Test your knowledge with quizzes from the ChemEng community.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-label="Loading quizzes">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-56 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-surface-300 dark:border-surface-700 rounded-2xl">
            <ClipboardCheck className="w-8 h-8 mx-auto text-surface-400 mb-3" />
            <p className="font-semibold text-surface-800 dark:text-surface-200">No quizzes published yet</p>
            <p className="text-sm text-surface-500 mt-1">Check back soon for a new challenge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quizzes/${quiz.id}`}
                className="group min-h-56 flex flex-col justify-between gap-6 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {quiz.title}
                  </h2>
                  {quiz.description && (
                    <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-400 mt-2 line-clamp-3">{quiz.description}</p>
                  )}
                </div>
                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-surface-500">{quiz.question_count} questions</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    View quiz <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
