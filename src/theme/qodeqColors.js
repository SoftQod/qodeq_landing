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

/** Прозрачность точек сетки hero */
export const HERO_DOT_ALPHA = 0.26;

/** Растяжение кубов относительно базового масштаба (шире / выше) */
export const HERO_CUBE_STRETCH = {
  x: 1.34,
  y: 1.26
};

/**
 * Единый масштаб UI hero от размера viewport (пропорционально min(w, h)).
 * @param {number} viewportWidth
 * @param {number} [viewportHeight]
 * @param {boolean} [isMobile]
 */
export function getHeroProportionalScale(viewportWidth, viewportHeight = 900, isMobile = false) {
  const minDim = Math.min(viewportWidth || 1440, viewportHeight || 900);
  const scale = minDim / 1024;
  const clamped = Math.max(0.72, Math.min(1.18, scale));
  return isMobile ? clamped * 0.9 : clamped;
}

/** Доп. множитель углового UI (шапка, теги, кнопки, рамки Spline) — +50% */
export const HERO_CORNER_BOOST = 1.5;

/** Анимация появления частей Hero */
export const HERO_ANIM = {
  enterDelayMs: 0,
  partDurationMs: 260,
  partStaggerMs: 22,
  liftPx: 8
};

/**
 * Масштаб нижних блоков hero — сильнее ужимается по ширине, чтобы не было переносов.
 * @param {number} viewportWidth
 * @param {number} [viewportHeight]
 * @param {boolean} [isMobile]
 */
export function getHeroBottomBlockScale(viewportWidth, viewportHeight = 900, isMobile = false) {
  const w = viewportWidth || 1440;
  const base = getHeroProportionalScale(w, viewportHeight, isMobile) * HERO_CORNER_BOOST;

  if (isMobile) {
    return base * 0.88;
  }

  if (w >= 1680) {
    return base;
  }
  if (w >= 1400) {
    return base * (0.86 + ((w - 1400) / 280) * 0.14);
  }
  if (w >= 1200) {
    return base * (0.74 + ((w - 1200) / 200) * 0.12);
  }
  if (w >= 1024) {
    return base * (0.64 + ((w - 1024) / 176) * 0.1);
  }
  return base * Math.max(0.56, 0.56 + ((w - 900) / 124) * 0.08);
}

/** Горизонтальные отступы секций главной (ScrollReveal, Story и т.д.) */
export const LANDING_GUTTER_X = '7vw';

/** Padding для hero / шапки на главной — совпадает с нижними секциями */
export const landingPagePad = (isMobile) => {
  const gutter = isMobile ? 'max(20px, env(safe-area-inset-right))' : LANDING_GUTTER_X;
  const gutterLeft = isMobile ? 'max(20px, env(safe-area-inset-left))' : LANDING_GUTTER_X;

  if (isMobile) {
    return `max(16px, env(safe-area-inset-top)) ${gutter} max(22px, env(safe-area-inset-bottom)) ${gutterLeft}`;
  }

  return `max(24px, env(safe-area-inset-top)) ${gutter} max(32px, env(safe-area-inset-bottom)) ${gutterLeft}`;
};
