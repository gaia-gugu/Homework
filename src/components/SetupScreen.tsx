import { useState } from 'react';
import { AVATAR_EMOJIS } from '../constants';
import './SetupScreen.css';

interface Props {
  onSetup: (name: string, emoji: string) => void;
}

export function SetupScreen({ onSetup }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🦊');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSetup(trimmed, emoji);
  }

  return (
    <div className="setup-screen">
      <div className="setup-card anim-bounce-in">
        <div className="setup-hero">
          <span className="setup-selected-emoji">{emoji}</span>
          <h1>Let's get started! 🌟</h1>
          <p>Tell us your name and pick an animal friend</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="setup-field">
            <label htmlFor="kid-name">Your name</label>
            <input
              id="kid-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What's your name?"
              maxLength={20}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="setup-field">
            <label>Pick your animal friend</label>
            <div className="avatar-grid">
              {AVATAR_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`avatar-btn${emoji === e ? ' selected' : ''}`}
                  onClick={() => setEmoji(e)}
                  aria-label={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="setup-submit"
            disabled={!name.trim()}
          >
            Let's Go! 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
