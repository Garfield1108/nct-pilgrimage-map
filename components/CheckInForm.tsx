'use client';

import { FormEvent, useState } from 'react';

type Props = {
  onSubmit: (files: File[], note: string, force: boolean) => Promise<{ warned: boolean }>;
  title: string;
  hint: string;
  needImageText: string;
  submitErrorText: string;
  duplicateWarnText: string;
  submittingText: string;
  submitText: string;
};

export default function CheckInForm({
  onSubmit,
  title,
  hint,
  needImageText,
  submitErrorText,
  duplicateWarnText,
  submittingText,
  submitText
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!files.length) {
      setError(needImageText);
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
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#647b5f]">{title}</p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="block w-full rounded-2xl border border-[#d7e6c9] bg-[#f8fcf3] p-2 text-xs text-[#4a6144]"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 200))}
        placeholder={hint}
        rows={3}
        className="w-full rounded-2xl border border-[#d7e6c9] bg-[#f8fcf3] px-3 py-2 text-sm text-[#2b3827] outline-none transition focus:border-[#9ad26f] focus:ring-2 focus:ring-[#b7ff7a]/35"
      />

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-[#8dbb6f] bg-[#a8ff60] px-5 py-2 text-sm font-semibold text-[#22301f] transition hover:bg-[#98f56b]"
      >
        {loading ? submittingText : submitText}
      </button>
    </form>
  );
}
