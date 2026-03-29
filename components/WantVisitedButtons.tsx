'use client';

type Props = {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  wantLabel: string;
  visitedSoonLabel: string;
};

export default function WantVisitedButtons({
  isFavorite,
  onToggleFavorite,
  wantLabel,
  visitedSoonLabel
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onToggleFavorite}
        className={`paper-button-primary ${
          isFavorite ? 'ring-2 ring-[#8fcc60]/40' : ''
        }`}
      >
        {wantLabel}
      </button>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="paper-button-muted"
        title={visitedSoonLabel}
      >
        {visitedSoonLabel}
      </button>
    </div>
  );
}
