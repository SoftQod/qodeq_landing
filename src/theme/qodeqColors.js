/** Фон лендинга — единый для всех секций (#0D0D0D = rgb(13, 13, 13)) */
export const QODEQ_BG = 'rgb(13, 13, 13)';
export const QODEQ_BG_HEX = '#0D0D0D';

export const qodeqRgba = (alpha) => `rgba(13, 13, 13, ${alpha})`;

export const heroTheme = {
  bg: QODEQ_BG,
  primary: '#ECECEC',
  secondary: 'rgba(236, 236, 236, 0.72)',
  muted: 'rgba(142, 142, 142, 0.9)',
  border: 'rgba(255, 255, 255, 0.28)',
  borderHover: 'rgba(255, 255, 255, 0.55)',
  accent: '#10A37F',
  accentGlow: '#14C896'
};

/** Якорь области с кубами — центр hero */
export const HERO_CUBE_FOCUS = {
  x: '50%',
  y: '50%'
};
