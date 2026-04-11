'use client';

type Props = {
  isFavorite: boolean;
  visited: boolean;
  onToggleFavorite: () => void;
  onToggleVisited: () => void;
  wantLabel: string;
  visitedLabel: string;
};

function SaveIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3.3l1.95 3.95 4.35.63-3.15 3.08.74 4.34L10 13.25 6.11 15.3l.74-4.34L3.7 7.88l4.35-.63L10 3.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VisitedIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10.4l3.7 3.7L16 5.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.2 16.1h9.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function WantVisitedButtons({
  isFavorite,
  visited,
  onToggleFavorite,
  onToggleVisited,
  wantLabel,
  visitedLabel
}: Props) {
  return (
    <div className="action-rail sugar-action-rail compact-action-rail">
      <button type="button" onClick={onToggleFavorite} className={`paper-action-btn sugar-action-card save-btn ${isFavorite ? 'active' : 'inactive'}`}>
        <span className="action-swatch action-swatch-candy" aria-hidden>
          <SaveIcon className="h-4 w-4" />
        </span>
        <span className="action-card-title">{wantLabel}</span>
      </button>

      <button type="button" onClick={onToggleVisited} className={`paper-action-btn sugar-action-card visited-btn ${visited ? 'active' : 'inactive'}`}>
        <span className="action-swatch action-swatch-puppy" aria-hidden>
          <VisitedIcon className="h-4 w-4" />
        </span>
        <span className="action-card-title">{visitedLabel}</span>
      </button>
    </div>
  );
}
