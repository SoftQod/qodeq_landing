import { QODEQ_BG, QODEQ_BG_HEX } from 'theme/qodeqColors';

/** Палитра лендинга для перекраски Spline-сцены */
export const QODEQ_THEME = {
  background: QODEQ_BG,
  backgroundHex: QODEQ_BG_HEX,
  surface: '#1A1A1A',
  surfaceLight: '#2D2D2D',
  muted: '#363636',
  accent: '#10A37F',
  accentGlow: '#14C896',
  accentHover: '#0E8C6F'
};

function parseRgb(cssColor) {
  if (!cssColor || typeof cssColor !== 'string') {
    return null;
  }
  const hex = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(cssColor.trim());
  if (hex) {
    return {
      r: parseInt(hex[1], 16),
      g: parseInt(hex[2], 16),
      b: parseInt(hex[3], 16)
    };
  }
  const rgb = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(cssColor);
  if (rgb) {
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  }
  return null;
}

function luminance(cssColor) {
  const c = parseRgb(cssColor);
  if (!c) {
    return 0.2;
  }
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isNearBlack(cssColor) {
  const c = parseRgb(cssColor);
  if (!c) {
    return true;
  }
  return c.r <= 18 && c.g <= 18 && c.b <= 18;
}

function saturation(cssColor) {
  const c = parseRgb(cssColor);
  if (!c) {
    return 0;
  }
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) {
    return 0;
  }
  return (max - min) / max;
}

function requestRender(app) {
  try {
    app.requestRender?.();
  } catch {
    /* ignore */
  }
}

/** Фон canvas / active page — hex надёжнее для Spline runtime */
function getRenderer(app) {
  return app?._renderer ?? app?.renderer ?? app?._sharedAssetsManager?._renderer;
}

function forceRendererClearColor(app) {
  try {
    const renderer = getRenderer(app);
    if (renderer?.setClearColor) {
      renderer.setClearColor(0x0d0d0d, 1);
    }
  } catch {
    /* ignore */
  }
}

export function setSplineBackground(app) {
  if (!app) {
    return;
  }
  try {
    app.setBackgroundColor(QODEQ_THEME.backgroundHex);
  } catch {
    try {
      app.setBackgroundColor(QODEQ_THEME.background);
    } catch {
      /* ignore */
    }
  }
  forceRendererClearColor(app);
  requestRender(app);
}

function paintMaterialLayers(obj, targetColor) {
  const material = obj.material;
  if (!material?.layers?.length) {
    return;
  }

  for (let i = 0; i < material.layers.length; i += 1) {
    const layer = material.layers[i];
    if (layer?.type !== 'color') {
      continue;
    }
    const current = layer.color || '';
    if (isNearBlack(current) || luminance(current) < 0.12) {
      layer.color = targetColor;
    }
  }
}

function paintObject(obj) {
  const name = String(obj.name || '').toLowerCase();

  if (/text|typography|label|title|string|copy|heading|paragraph|font|ui|button/i.test(name)) {
    try {
      obj.hide();
    } catch {
      obj.visible = false;
    }
    return;
  }

  if (/background|backdrop|environment|floor|ground|plane|wall|scene root|grid/i.test(name)) {
    try {
      obj.color = QODEQ_THEME.backgroundHex;
    } catch {
      /* ignore */
    }
    paintMaterialLayers(obj, QODEQ_THEME.backgroundHex);
    return;
  }

  if (/light|lamp|glow|point|directional|spot/i.test(name)) {
    try {
      obj.color = QODEQ_THEME.accent;
    } catch {
      /* ignore */
    }
    return;
  }

  let current = '';
  try {
    current = obj.color || '';
  } catch {
    current = '';
  }

  const lum = luminance(current);
  const sat = saturation(current);
  let next = QODEQ_THEME.muted;

  if (isNearBlack(current) || lum < 0.09) {
    next = QODEQ_THEME.backgroundHex;
  } else if (sat > 0.35 && lum > 0.35) {
    next = lum > 0.6 ? QODEQ_THEME.accentGlow : QODEQ_THEME.accent;
  } else if (lum > 0.55) {
    next = QODEQ_THEME.surfaceLight;
  } else if (lum > 0.2) {
    next = QODEQ_THEME.surface;
  }

  try {
    obj.color = next;
  } catch {
    /* ignore */
  }

  if (isNearBlack(current) || lum < 0.15) {
    paintMaterialLayers(obj, next);
  }
}

/**
 * Подгоняет камеру и canvas под весь viewport.
 * @param {import('@splinetool/runtime').Application} app
 */
export function fitSplineToViewport(app) {
  if (!app) {
    return;
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  try {
    app.setSize(w, h);
  } catch {
    /* ignore */
  }

  setSplineBackground(app);

  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);
  const zoom = Math.max(1.75, Math.min(3.2, (minDim / 480) * 1.05 + (maxDim / 1400) * 0.4));

  try {
    app.setZoom(zoom);
  } catch {
    /* ignore */
  }
}

/**
 * Перекрашивает объекты сцены под QODEQ.
 * @param {import('@splinetool/runtime').Application} app
 */
export function applySplineQodeqTheme(app) {
  if (!app) {
    return;
  }

  setSplineBackground(app);

  const objects = app.getAllObjects?.() ?? [];
  for (let i = 0; i < objects.length; i += 1) {
    paintObject(objects[i]);
  }

  requestRender(app);
}

/**
 * Полная синхронизация темы (фон + объекты), вызывать после load/rendered/resize.
 * @param {import('@splinetool/runtime').Application} app
 */
export function syncSplineQodeqTheme(app) {
  fitSplineToViewport(app);
  applySplineQodeqTheme(app);
}
