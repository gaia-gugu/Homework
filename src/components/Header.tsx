import { useEffect, useRef, useState } from 'react';
import './Header.css';

interface Props {
  kidName: string;
  kidEmoji: string;
  totalStars: number;
  onReset: () => void;
}

export function Header({ kidName, kidEmoji, totalStars, onReset }: Props) {
  const prevStars = useRef(totalStars);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (totalStars > prevStars.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prevStars.current = totalStars;
      return () => clearTimeout(t);
    }
    prevStars.current = totalStars;
  }, [totalStars]);

  return (
    <header className="app-header">
      <div className="header-identity">
        <span className="header-avatar">{kidEmoji}</span>
        <div>
          <span className="header-greeting">Hi, {kidName}!</span>
          <span className="header-subtitle">Let's crush your homework 💪</span>
        </div>
      </div>
      <div className="header-right">
        <div className={`star-counter${pulse ? ' pulse' : ''}`}>
          <span className="star-icon">⭐</span>
          <span className="star-count">{totalStars}</span>
        </div>
        <button className="reset-btn" onClick={onReset} aria-label="Change profile">
          👤
        </button>
      </div>
    </header>
  );
}
