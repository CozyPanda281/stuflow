import { useState, useEffect, useRef } from 'react';

export default function PageTransition({ children, className = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? 'page-enter' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
