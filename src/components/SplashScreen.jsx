import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const pre = document.getElementById('pre-splash');
    if (pre) pre.remove();

    const t1 = setTimeout(() => setPhase('hold'), 1200);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onFinish(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`splash-overlay ${phase === 'exit' ? 'splash-exit' : ''}`}>
      <div className="splash-bg-orb" />
      <div className="splash-content">
        <svg className="splash-logo" viewBox="0 0 100 100" width="120" height="120">
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5b8dff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path className="splash-path" style={{ animationDelay: '0.3s' }} d="M 50 10 C 24 18, 8 50, 16 84" stroke="url(#sg)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path className="splash-path" style={{ animationDelay: '0.45s' }} d="M 50 10 C 76 18, 92 50, 84 84" stroke="url(#sg)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path className="splash-path" style={{ animationDelay: '0.6s' }} d="M 44 26 C 34 32, 24 52, 28 80" stroke="url(#sg)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path className="splash-path" style={{ animationDelay: '0.75s' }} d="M 56 26 C 66 32, 76 52, 72 80" stroke="url(#sg)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path className="splash-path" style={{ animationDelay: '0.9s' }} d="M 20 52 Q 50 46, 80 52" stroke="url(#sg)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </svg>
        <div className="splash-title">Aditya</div>
      </div>
    </div>
  );
}
