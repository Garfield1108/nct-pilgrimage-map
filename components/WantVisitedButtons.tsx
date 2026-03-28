'use client';

type Props = {
  isFavorite: boolean;
  visited: boolean;
  onToggleFavorite: () => void;
  onToggleVisited: () => void;
  wantLabel: string;
  visitedLabel: string;
};

export default function WantVisitedButtons({
  isFavorite,
  visited,
  onToggleFavorite,
  onToggleVisited,
  wantLabel,
  visitedLabel
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onToggleFavorite}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          isFavorite
            ? 'bg-[#a8ff60] text-[#22301d] shadow-[0_12px_24px_rgba(152,245,107,0.35)]'
            : 'bg-[#9ff36c] text-[#23321f] hover:bg-[#98f56b] hover:shadow-[0_8px_20px_rgba(152,245,107,0.28)]'
        }`}
      >
        {wantLabel}
      </button>
      <button
        type="button"
        onClick={onToggleVisited}
        className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
          visited
            ? 'border-[#8cb66d] bg-[#ebf9dc] text-[#2d4327]'
            : 'border-[#c7dcb6] bg-[#f9fdf3] text-[#4a6144] hover:bg-[#f0f8e7]'
        }`}
      >
        {visitedLabel}
      </button>
    </div>
  );
}
