import { useRef, useState } from 'react'
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'

interface JsonUploadPrefillProps {
  // Called with the parsed JSON object once a file is successfully read
  // and parsed -- the caller is responsible for actually applying it
  // (typically via react-hook-form's `reset(data)`), since different
  // forms need different transforms (e.g. turning a JSON string array
  // into a comma-separated text-input value).
  onLoad: (data: Record<string, any>) => void
  // Shown in the "Download a template" link -- points at a static
  // example file in /public documenting the exact expected shape for
  // this specific content type.
  templateUrl: string
}

// Deliberately NOT a drag-and-drop zone or anything fancier -- this is a
// low-traffic internal admin tool, not a public-facing upload feature.
// A plain file input covers the actual need (paste a prepared JSON file,
// see the form fill in, review, then Save as normal) without extra UI
// surface area to maintain.
export function JsonUploadPrefill({ onLoad, templateUrl }: JsonUploadPrefillProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset the input value so selecting the SAME file twice in a row
    // still fires this handler -- browsers otherwise skip the change
    // event if the file path hasn't changed since last time.
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Expected a single JSON object (e.g. { "title": ..., "content": ... }), not an array or a plain value.')
      }

      onLoad(parsed)
      setStatus('success')
      setErrorMessage(null)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof SyntaxError
          ? 'That file isn\'t valid JSON -- check for a missing comma or bracket.'
          : err instanceof Error ? err.message : 'Could not read that file.'
      )
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
          <UploadCloud className="w-4 h-4 flex-shrink-0" />
          <span>Upload a JSON file to pre-fill the fields below — you'll still review and save manually.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={templateUrl}
            download
            className="text-xs font-medium text-[#1a63ef] hover:underline whitespace-nowrap"
          >
            Download template
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-surface-300 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors whitespace-nowrap"
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Fields pre-filled from the uploaded file — review before saving.
        </div>
      )}
      {status === 'error' && errorMessage && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMessage}
        </div>
      )}
    </div>
  )
}
