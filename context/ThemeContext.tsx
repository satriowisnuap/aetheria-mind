'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aetheria-theme') as Theme | null;
    const initial = saved === 'light' ? 'light' : 'dark';
    setTheme(initial);
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(`theme-${initial}`);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aetheria-theme', next);
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${next}`);
      return next;
    });
  };

  if (!mounted) {
    return (
      <div className="theme-dark" style={{ background: '#000000', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
