// theme/config.ts
export type ThemeName = 'dark' | 'light';

export const themeTokens = {
  // CONFIGURATION MODE SOMBRE (Le style Pro Dark de Claude)
  dark: {
    name: 'dark' as ThemeName,
    bgBody: 'bg-slate-950',
    bgCard: 'bg-slate-900',
    bgSoft: 'bg-slate-900/80',
    border: 'border-slate-800',
    textMain: 'text-white',
    textMuted: 'text-gray-400',
    textSoft: 'text-gray-500',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500',
    accentBgSoft: 'bg-cyan-500/10',
    accentBorderSoft: 'border-cyan-500/40',
    hover: 'bg-slate-800',
    inputBg: 'bg-slate-950',
  },
  
  // CONFIGURATION MODE CLAIR
  light: {
    name: 'light' as ThemeName,
    bgBody: 'bg-slate-50',
    bgCard: 'bg-white',
    bgSoft: 'bg-slate-100',
    border: 'border-slate-200',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    textSoft: 'text-slate-400',
    accent: 'text-cyan-600',
    accentBg: 'bg-cyan-600',
    accentBgSoft: 'bg-cyan-50',
    accentBorderSoft: 'border-cyan-200',
    hover: 'bg-slate-100',
    inputBg: 'bg-white',
  },
};