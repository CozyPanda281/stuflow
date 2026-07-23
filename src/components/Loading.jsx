export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div className="loading-page">
      <div className={`loading-spinner${size === 'lg' ? ' loading-spinner-lg' : ''}`} />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
}

export function LoadingSkeleton({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {items.map((_, i) => (
        <div key={i} className="skeleton">
          {type === 'card' && (
            <>
              <div className="skeleton-line skeleton-line-sm" />
              <div className="skeleton-line skeleton-line-lg" />
              <div className="skeleton-line skeleton-line-md" style={{ marginBottom: 0 }} />
            </>
          )}
          {type === 'period' && (
            <>
              <div className="skeleton-line skeleton-line-sm" style={{ width: '30%' }} />
              <div className="skeleton-line skeleton-line-lg" />
              <div className="skeleton-line skeleton-line-md" style={{ width: '50%', marginBottom: 0 }} />
            </>
          )}
          {type === 'stat' && (
            <>
              <div className="skeleton-block" />
              <div className="skeleton-line skeleton-line-sm" style={{ margin: '0 auto' }} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Loading({ type = 'spinner', ...props }) {
  if (type === 'skeleton') return <LoadingSkeleton {...props} />;
  return <LoadingSpinner {...props} />;
}
