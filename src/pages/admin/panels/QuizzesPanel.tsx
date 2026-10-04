import { useState } from 'react';
import { quizService } from '../../../services/quiz.service';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import type { QuizImportQuestion, QuizQuestionDraft } from '../../../types/quiz.types';

function importJsonToDraftQuestions(raw: QuizImportQuestion[]): QuizQuestionDraft[] {
  return raw.map((q, i) => {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${i + 1} ("${q.question_text}") does not have exactly 4 options`);
    }
    if (q.correct_index < 0 || q.correct_index > 3) {
      throw new Error(`Question ${i + 1} has an invalid correct_index`);
    }
    return {
      question_text: q.question_text,
      time_limit_seconds: q.time_limit_seconds,
      points: q.points ?? 1,
      options: q.options.map((text, idx) => ({ option_text: text, is_correct: idx === q.correct_index })),
    };
  });
}

const emptyQuestion = (): QuizQuestionDraft => ({
  question_text: '',
  time_limit_seconds: 20,
  points: 1,
  options: [
    { option_text: '', is_correct: true },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ],
});

export default function QuizzesPanel() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Upload PRE-FILLS the form below — it does not replace manual entry.
  // Every field stays editable afterward, and more questions can be
  // added by hand or by uploading again (appends rather than overwrites).
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as QuizImportQuestion[];
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array of questions');
      const imported = importJsonToDraftQuestions(parsed);
      setQuestions((prev) => [...prev, ...imported]);
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse file');
    }
    e.target.value = ''; // allow re-uploading the same filename
  }

  function addBlankQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestionDraft>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, option_text: text } : o)) }
          : q
      )
    );
  }

  function setCorrect(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oIndex })) } : q
      )
    );
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      for (const q of questions) {
        if (q.options.filter((o) => o.is_correct).length !== 1) {
          throw new Error(`Each question needs exactly one correct option ("${q.question_text}")`);
        }
        if (q.options.some((o) => !o.option_text.trim())) {
          throw new Error(`Every option needs text ("${q.question_text}")`);
        }
      }
      await quizService.create({
        title, slug, description,
        negative_marking: negativeMarking,
        status: publishNow ? 'published' : 'draft',
        questions,
      });
      setSaved(true);
      setTitle('');
      setSlug('');
      setDescription('');
      setNegativeMarking(false);
      setPublishNow(true);
      setQuestions([]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 max-w-xl">
        <Input label="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Thermodynamics Basics" />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. thermodynamics-basics" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional short description shown on the quiz list and detail page" />

        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-surface-300 dark:border-surface-700"
            checked={negativeMarking}
            onChange={(e) => setNegativeMarking(e.target.checked)}
          />
          Negative marking (wrong answers deduct that question's points; skipped questions are never penalized)
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-surface-300 dark:border-surface-700"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
          />
          Publish immediately (unchecked saves it as a draft, hidden from the public quiz list)
        </label>
      </div>

      <div className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-4 max-w-xl">
        <label className="block text-sm text-surface-600 dark:text-surface-400 mb-2">
          Upload questions JSON to pre-fill the form below (ask any AI agent to generate an array
          matching the <code className="px-1 rounded bg-surface-100 dark:bg-surface-800">QuizImportQuestion[]</code> type
          from <code className="px-1 rounded bg-surface-100 dark:bg-surface-800">src/types/quiz.types.ts</code> —
          exactly 4 options + <code className="px-1 rounded bg-surface-100 dark:bg-surface-800">correct_index</code> per question).
          Fields stay editable after upload, and you can still add questions by hand.
        </label>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
          className="text-sm text-surface-700 dark:text-surface-300"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-600 dark:text-green-400">Quiz saved.</p>}

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="relative border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-white dark:bg-surface-900">
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              aria-label="Remove question"
              className="absolute top-3 right-3 text-surface-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="pr-8 space-y-3">
              <Input
                label={`Question ${qi + 1}`}
                value={q.question_text}
                onChange={(e) => updateQuestion(qi, { question_text: e.target.value })}
                placeholder="Question text"
              />
              <div className="flex gap-4">
                <Input
                  label="Time (sec)"
                  type="number"
                  min={1}
                  value={q.time_limit_seconds}
                  onChange={(e) => updateQuestion(qi, { time_limit_seconds: Number(e.target.value) })}
                  className="w-28"
                />
                <Input
                  label="Points"
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })}
                  className="w-28"
                />
              </div>
              <div className="space-y-2">
                {q.options.map((o, oi) => (
                  <label key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={o.is_correct}
                      onChange={() => setCorrect(qi, oi)}
                      className="h-4 w-4 border-surface-300 dark:border-surface-700"
                    />
                    <Input
                      value={o.option_text}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={addBlankQuestion}>
          Add question manually
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          isLoading={saving}
          disabled={!title.trim() || !slug.trim() || questions.length === 0}
        >
          Save Quiz
        </Button>
      </div>
    </div>
  );
}
