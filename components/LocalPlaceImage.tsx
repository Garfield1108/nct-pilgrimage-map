import { ReactNode, useEffect, useState } from 'react';

type LocalPlaceImageProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className: string;
  wrapperClassName?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  emptyFallback?: ReactNode;
};

export default function LocalPlaceImage({
  src,
  fallbackSrc,
  alt,
  className,
  wrapperClassName = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  emptyFallback = null
}: LocalPlaceImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
    setFailed(false);
  }, [src, fallbackSrc]);

  if (failed) {
    return <>{emptyFallback}</>;
  }

  return (
    <div className={`local-place-image-shell ${wrapperClassName} ${loaded ? 'is-loaded' : ''}`}>
      {!loaded ? <span className="local-place-image-skeleton" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- local thumbnails are pre-generated at build time */}
      <img
        src={currentSrc}
        alt={alt}
        className={`local-place-image ${className}`}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          transform: 'none',
          display: 'block',
          margin: 'auto'
        }}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setLoaded(false);
            return;
          }

          setFailed(true);
        }}
      />
    </div>
  );
}
