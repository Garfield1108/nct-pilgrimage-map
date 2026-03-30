'use client';

import { FormEvent, useState } from 'react';

type Props = {
  onSubmit: (files: File[], note: string, force: boolean) => Promise<{ warned: boolean }>;
  title: string;
  hint: string;
  imageOptionalText: string;
  needContentText: string;
  submitErrorText: string;
  duplicateWarnText: string;
  submittingText: string;
  submitText: string;
};

export default function CheckInForm({
  onSubmit,
  title,
  hint,
  imageOptionalText,
  needContentText,
  submitErrorText,
  duplicateWarnText,
  submittingText,
  submitText
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContent = note.trim().length > 0 || files.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasContent) {
      setError(needContentText);
      return;
    }

    setLoading(true);
    try {
      const firstTry = await onSubmit(files, note, false);
      if (firstTry.warned) {
        const proceed = window.confirm(duplicateWarnText);
        if (!proceed) {
          setLoading(false);
          return;
        }
        await onSubmit(files, note, true);
      }
      setFiles([]);
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : submitErrorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 panel-fade">
      <p className="paper-kicker">{title}</p>
      <p className="text-xs text-[#667d60]">{imageOptionalText}</p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="paper-input block w-full p-2 text-xs"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 200))}
        placeholder={hint}
        rows={3}
        className="paper-input w-full px-3 py-2 text-sm outline-none"
      />

      {error ? <p className="text-xs text-[#9c3b3b]">{error}</p> : null}

      <button type="submit" disabled={loading || !hasContent} className="paper-button-primary">
        {loading ? submittingText : submitText}
      </button>
    </form>
  );
}
