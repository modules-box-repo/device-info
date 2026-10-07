// Handles theme switching

const KEY = 'device-info-theme';
const BAR = { dark: '#080808', light: '#f6f8f7' };

export function currentTheme() {
  return document.documentElement.dataset.theme || 'dark';
}

export function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', BAR[next]);

  try {
    localStorage.setItem(KEY, next);
  } catch {}

  return next;
}

export function toggleTheme() {
  return applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

export function restoreTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {}

  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  return applyTheme(stored || (prefersLight ? 'light' : 'dark'));
}