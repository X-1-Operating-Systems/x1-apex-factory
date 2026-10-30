import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'x1-studio-theme';

export function applyStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const dark = stored ? stored === 'dark' : Boolean(prefersDark);
  document.documentElement.classList.toggle('dark', dark);
  return dark ? 'dark' : 'light';
}

export default function ThemeToggle({ compact = false }) {
  const [mode, setMode] = useState(() => (localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'));

  useEffect(() => {
    const applied = applyStoredTheme();
    setMode(applied);
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-accent ${
        compact ? 'h-9 w-9 justify-center' : 'h-9 px-3'
      }`}
    >
      {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      {!compact && <span className="text-[12px] font-medium">{mode === 'dark' ? 'Light' : 'Dark'}</span>}
    </button>
  );
}