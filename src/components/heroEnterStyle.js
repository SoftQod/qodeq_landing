import { HERO_ANIM } from 'theme/qodeqColors';

/** Стили поочерёдного появления частей Hero */
export function heroEnterStyle(visible, order = 0) {
  const delay = HERO_ANIM.enterDelayMs + order * HERO_ANIM.partStaggerMs;
  const { partDurationMs, liftPx } = HERO_ANIM;

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${liftPx}px)`,
    transition: `opacity ${partDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${partDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
  };
}

/** Порядок появления слоёв Hero */
export const HERO_PART = {
  bgDots: 0,
  spline: 1,
  vignette: 2,
  header: 3,
  title: 4,
  tags: 5,
  description: 6,
  actions: 7
};
