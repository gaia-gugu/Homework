import { useRef, useState, useEffect } from 'react';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PinInput({ length = 4, onComplete, disabled, error }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[i] = digit;
    setValues(next);
    if (digit && i < length - 1) inputs.current[i + 1]?.focus();
    if (next.every(v => v !== '') && next.filter(v => v !== '').length === length) {
      onComplete(next.join(''));
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (text.length === length) {
      const next = text.split('');
      setValues(next);
      inputs.current[length - 1]?.focus();
      onComplete(text);
    }
  }

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {values.map((v, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={v}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all
              ${error ? 'border-red-400 bg-red-50' : v ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}
              focus:border-primary-500 focus:ring-2 focus:ring-primary-200
              disabled:opacity-50`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
    </div>
  );
}
