import { Theme } from '@/types/enums';

// Theme changes must be instant: flip the classes on <html> directly and
// persist the cookie from the client so SSR renders the right theme on the
// next document load. A server action here would make Next re-render (and
// re-fetch) the entire page on the server just to change a class.
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const dark = theme === 'dark';

  root.classList.toggle('dark', dark);
  root.classList.toggle('highcharts-dark', dark);
  root.classList.toggle('highcharts-light', !dark);
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
};
