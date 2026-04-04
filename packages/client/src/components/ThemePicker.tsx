import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, X } from 'lucide-react';

export default function ThemePicker() {
  const { theme, setThemeById, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="theme-picker-btn"
        title="Change Theme"
        aria-label="Change Theme"
      >
        <Palette size={20} />
      </button>

      {open && (
        <div className="theme-overlay" onClick={() => setOpen(false)}>
          <div
            className="theme-panel animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="theme-panel-header">
              <h3>Choose Theme</h3>
              <button onClick={() => setOpen(false)} className="theme-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="theme-grid">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeById(t.id);
                    setOpen(false);
                  }}
                  className={`theme-card ${theme.id === t.id ? 'theme-card-active' : ''}`}
                >
                  <div className="theme-preview">
                    <div
                      className="theme-swatch-primary"
                      style={{ backgroundColor: t.primary }}
                    />
                    <div
                      className="theme-swatch-secondary"
                      style={{ backgroundColor: t.secondary }}
                    />
                  </div>
                  <span className="theme-label">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
