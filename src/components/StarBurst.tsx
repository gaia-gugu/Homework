import { useEffect } from 'react';
import './StarBurst.css';

interface Props {
  starsWon: number;
  onDone: () => void;
}

const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (360 / 28) * i;
  const dist = 80 + Math.random() * 120;
  const dx = Math.round(Math.cos((angle * Math.PI) / 180) * dist);
  const dy = Math.round(Math.sin((angle * Math.PI) / 180) * dist);
  const rot = Math.round(Math.random() * 720 - 360);
  const delay = Math.random() * 0.15;
  const size = 0.8 + Math.random() * 0.8;
  const icons = ['⭐', '✨', '🌟', '💫'];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  return { dx, dy, rot, delay, size, icon };
});

export function StarBurst({ starsWon, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="starburst-overlay" onClick={onDone}>
      <div className="starburst-particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="burst-particle"
            style={{
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animationDelay: `${p.delay}s`,
              fontSize: `${p.size * 1.5}rem`,
            } as React.CSSProperties}
          >
            {p.icon}
          </span>
        ))}
      </div>

      <div className="starburst-message anim-bounce-in">
        <div className="burst-emoji">🎉</div>
        <div className="burst-title">Amazing!</div>
        <div className="burst-stars">
          {'⭐'.repeat(starsWon)}
          <span>+{starsWon} {starsWon === 1 ? 'star' : 'stars'}!</span>
        </div>
        <div className="burst-subtitle">Keep it up! 💪</div>
      </div>
    </div>
  );
}
