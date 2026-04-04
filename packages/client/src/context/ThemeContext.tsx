import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'indigo',
    name: 'Indigo & Teal',
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    primaryDark: '#4f46e5',
    secondary: '#14b8a6',
    secondaryLight: '#ccfbf1',
  },
  {
    id: 'rose',
    name: 'Rose & Amber',
    primary: '#f43f5e',
    primaryLight: '#ffe4e6',
    primaryDark: '#e11d48',
    secondary: '#f59e0b',
    secondaryLight: '#fef3c7',
  },
  {
    id: 'emerald',
    name: 'Emerald & Blue',
    primary: '#10b981',
    primaryLight: '#d1fae5',
    primaryDark: '#059669',
    secondary: '#3b82f6',
    secondaryLight: '#dbeafe',
  },
  {
    id: 'violet',
    name: 'Violet & Pink',
    primary: '#8b5cf6',
    primaryLight: '#ede9fe',
    primaryDark: '#7c3aed',
    secondary: '#ec4899',
    secondaryLight: '#fce7f3',
  },
  {
    id: 'slate',
    name: 'Slate & Orange',
    primary: '#475569',
    primaryLight: '#e2e8f0',
    primaryDark: '#334155',
    secondary: '#f97316',
    secondaryLight: '#ffedd5',
  },
];

interface ThemeContextType {
  theme: ThemeOption;
  setThemeById: (id: string) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeVars(theme: ThemeOption) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-light', theme.primaryLight);
  root.style.setProperty('--color-primary-dark', theme.primaryDark);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-secondary-light', theme.secondaryLight);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeOption>(() => {
    const stored = localStorage.getItem('theme-id');
    return THEMES.find((t) => t.id === stored) || THEMES[0];
  });

  useEffect(() => {
    applyThemeVars(theme);
    localStorage.setItem('theme-id', theme.id);
  }, [theme]);

  const setThemeById = (id: string) => {
    const found = THEMES.find((t) => t.id === id);
    if (found) setTheme(found);
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeById, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
