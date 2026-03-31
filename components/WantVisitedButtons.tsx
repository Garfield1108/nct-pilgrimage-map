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
    <div className="action-row">
      <button type="button" onClick={onToggleFavorite} className={`paper-action-btn save-btn ${isFavorite ? 'active' : 'inactive'}`}>
        <span className="btn-dot" aria-hidden>
          ★
        </span>
        {wantLabel}
      </button>

      <button type="button" onClick={onToggleVisited} className={`paper-action-btn visited-btn ${visited ? 'active' : 'inactive'}`}>
        <span className="btn-dot" aria-hidden>
          ✓
        </span>
        {visitedLabel}
      </button>
    </div>
  );
}
