import { useEffect, useRef, useMemo, memo } from 'react';

const SCATTER_DUR_MS = 1680;
const HORIZONTAL_DUR_MS = 2100;
const SCATTER_HORIZ_OVERLAP_MS = 280;
/** Пауза между словами при появлении из взрыва */
const REVEAL_WORD_GAP_MS = 210;
/** Шаг между точками внутри слова */
const REVEAL_DOT_STEP_MS = 2.4;
/** Быстрый fade-in при появлении точки */
const REVEAL_FADE_MS = 110;
/** Плавное появление подсветки на финальной фазе */
const GLOW_FADE_MS = 1100;

function stable01(a, b, c, d) {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + d * 43.758) * 43758.5453;
  return x - Math.floor(x);
}

function scatterOffset(letterIndex, salt) {
  const angle = stable01(letterIndex, salt, 31, 41) * Math.PI * 2;
  const dist = 420 + stable01(letterIndex, salt, 32, 42) * 720;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist
  };
}

/** CSS cubic-bezier(0,0,x1,y1,x2,y2,1,1) — t по оси времени [0,1] */
function easeBezier(t, x1, y1, x2, y2) {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  let lo = 0;
  let hi = 1;
  let u = t;
  for (let i = 0; i < 14; i += 1) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    if (Math.abs(x - t) < 1e-5) {
      break;
    }
    if (x < t) {
      lo = u;
    } else {
      hi = u;
    }
    u = (lo + hi) * 0.5;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}

const easeScatter = (t) => easeBezier(t, 0.12, 0.85, 0.22, 1);
const easeHoriz = (t) => easeBezier(t, 0.14, 1, 0.32, 1);

function parseAccentRgb(accentHex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(accentHex).trim());
  if (!m) {
    return { r: 16, g: 163, b: 127 };
  }
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

function shadeRgb(r, g, b, factor) {
  return {
    r: Math.max(0, Math.min(255, Math.round(r * factor))),
    g: Math.max(0, Math.min(255, Math.round(g * factor))),
    b: Math.max(0, Math.min(255, Math.round(b * factor)))
  };
}

function buildNavWordsData(navWords, centerX, centerY, spreadX, spreadY) {
  return navWords.map((item, wordIndex) => {
    const rgb = parseAccentRgb(item.color ?? '#22C55E');
    const edge = shadeRgb(rgb.r, rgb.g, rgb.b, 0.28);
    const deep = shadeRgb(rgb.r, rgb.g, rgb.b, 0.12);
    const anchorX = centerX + item.ox * spreadX;
    const anchorY = centerY + item.oy * spreadY;
    const w = item.layout.width;
    const h = item.layout.height;
    const wordLeft = anchorX - w * 0.5;
    const wordTop = anchorY - h * 0.5;
    const centerLeft = centerX - w * 0.5;
    const centerTop = centerY - h * 0.5;

    const dots = item.layout.blocks.map((b, i) => {
      const { x: sx, y: sy } = scatterOffset(wordIndex * 97 + i, b.delay + wordIndex * 997);
      return {
        localX: b.left + b.size * 0.5,
        localY: b.top + b.size * 0.5,
        r: b.size * 0.5,
        sx,
        sy,
        revealDelay: wordIndex * REVEAL_WORD_GAP_MS + i * REVEAL_DOT_STEP_MS
      };
    });

    return {
      panelIndex: item.panelIndex,
      label: item.label,
      color: item.color ?? '#22C55E',
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      edgeR: edge.r,
      edgeG: edge.g,
      edgeB: edge.b,
      deepR: deep.r,
      deepG: deep.g,
      deepB: deep.b,
      w,
      h,
      wordLeft,
      wordTop,
      centerLeft,
      centerTop,
      dots
    };
  });
}

function getWordPose(word, displayPhase, tSinceScatter, tSinceHoriz) {
  if (displayPhase < 2) {
    return null;
  }

  if (displayPhase === 2) {
    const scatterP = easeScatter(Math.min(1, tSinceScatter / SCATTER_DUR_MS));
    return {
      left: word.centerLeft,
      top: word.centerTop,
      scatterP
    };
  }

  const scatterAtHoriz = easeScatter(
    Math.min(1, (SCATTER_DUR_MS - SCATTER_HORIZ_OVERLAP_MS) / SCATTER_DUR_MS)
  );
  const horizP =
    displayPhase >= 4 ? 1 : easeHoriz(Math.min(1, Math.max(0, tSinceHoriz) / HORIZONTAL_DUR_MS));

  return {
    left: word.centerLeft + (word.wordLeft - word.centerLeft) * horizP,
    top: word.centerTop + (word.wordTop - word.centerTop) * horizP,
    scatterP: scatterAtHoriz * (1 - horizP)
  };
}

function getDotMotion(displayPhase, tSinceScatter, tSinceHoriz, pose, dot) {
  if (displayPhase === 2) {
    const localT = tSinceScatter - dot.revealDelay;
    if (localT < 0) {
      return null;
    }
    const scatterDur = Math.max(480, SCATTER_DUR_MS - dot.revealDelay * 0.42);
    return {
      scatterP: easeScatter(Math.min(1, localT / scatterDur)),
      alpha: Math.min(1, localT / REVEAL_FADE_MS)
    };
  }

  return {
    scatterP: pose.scatterP,
    alpha: 1
  };
}

function drawNavFrame(ctx, words, displayPhase, tSinceScatter, tSinceHoriz, tSinceGlow, dpr) {
  const W = ctx.canvas.width / dpr;
  const H = ctx.canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (displayPhase < 2) {
    return;
  }

  const lite = displayPhase === 2 || displayPhase === 3;
  const glowP =
    displayPhase >= 4 ? 1 - (1 - Math.min(1, Math.max(0, tSinceGlow) / GLOW_FADE_MS)) ** 3 : 0;

  for (let wi = 0; wi < words.length; wi += 1) {
    const word = words[wi];
    const pose = getWordPose(word, displayPhase, tSinceScatter, tSinceHoriz);
    if (!pose) {
      continue;
    }

    if (glowP > 0) {
      ctx.shadowBlur = 14 * glowP;
      ctx.shadowColor = `rgba(${word.r}, ${word.g}, ${word.b}, ${(0.42 * glowP).toFixed(4)})`;
    }

    for (let di = 0; di < word.dots.length; di += 1) {
      const dot = word.dots[di];
      const motion = getDotMotion(displayPhase, tSinceScatter, tSinceHoriz, pose, dot);
      if (!motion) {
        continue;
      }

      const cx = pose.left + dot.localX + dot.sx * motion.scatterP;
      const cy = pose.top + dot.localY + dot.sy * motion.scatterP;

      if (lite) {
        ctx.globalAlpha = motion.alpha;
        ctx.beginPath();
        ctx.arc(cx, cy, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${word.r}, ${word.g}, ${word.b})`;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        const grad = ctx.createRadialGradient(
          cx - dot.r * 0.28,
          cy - dot.r * 0.28,
          0,
          cx,
          cy,
          dot.r
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
        grad.addColorStop(0.42, `rgb(${word.r}, ${word.g}, ${word.b})`);
        grad.addColorStop(0.88, `rgb(${word.edgeR}, ${word.edgeG}, ${word.edgeB})`);
        grad.addColorStop(1, `rgb(${word.deepR}, ${word.deepG}, ${word.deepB})`);
        ctx.globalAlpha = motion.alpha;
        ctx.beginPath();
        ctx.arc(cx, cy, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    if (glowP > 0) {
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  }
}

export const NavWordsCanvas = memo(function NavWordsCanvas({
  navWords,
  entered,
  phase,
  canInteract = false,
  wrapW,
  wrapH,
  centerX,
  centerY,
  spreadX,
  spreadY,
  onNavigate
}) {
  const canvasRef = useRef(null);
  const timesRef = useRef({ scatter: 0, horiz: 0, glow: 0 });
  const phaseRef = useRef(phase);
  const enteredRef = useRef(entered);

  const wordsData = useMemo(
    () => buildNavWordsData(navWords, centerX, centerY, spreadX, spreadY),
    [navWords, centerX, centerY, spreadX, spreadY]
  );

  const displayPhase = !entered ? 0 : Math.max(phase, 1);
  const interactive = canInteract && displayPhase >= 3;

  phaseRef.current = phase;
  enteredRef.current = entered;

  useEffect(() => {
    if (phase === 2) {
      timesRef.current.scatter = performance.now();
    }
    if (phase === 3) {
      timesRef.current.horiz = performance.now();
    }
    if (phase === 4) {
      timesRef.current.glow = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !entered) {
      return undefined;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(wrapW * dpr);
    canvas.height = Math.round(wrapH * dpr);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return undefined;
    }

    let alive = true;
    let raf = 0;

    const paint = () => {
      if (!alive) {
        return;
      }

      const dp = !enteredRef.current ? 0 : Math.max(phaseRef.current, 1);
      const now = performance.now();
      const tSinceScatter = dp >= 2 ? now - timesRef.current.scatter : 0;
      const tSinceHoriz = dp >= 3 ? now - timesRef.current.horiz : 0;
      const tSinceGlow = dp >= 4 ? now - timesRef.current.glow : 0;

      drawNavFrame(ctx, wordsData, dp, tSinceScatter, tSinceHoriz, tSinceGlow, dpr);

      const animating =
        dp === 2 ||
        (dp === 3 && tSinceHoriz < HORIZONTAL_DUR_MS + 32) ||
        (dp >= 4 && tSinceGlow < GLOW_FADE_MS + 32);

      if (animating) {
        raf = requestAnimationFrame(paint);
      }
    };

    if (displayPhase >= 2) {
      paint();
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [entered, displayPhase, wordsData, wrapW, wrapH]);

  const handleClick = (e) => {
    if (!interactive) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * wrapW;
    const y = ((e.clientY - rect.top) / rect.height) * wrapH;
    const now = performance.now();
    const tSinceHoriz = phase >= 3 ? now - timesRef.current.horiz : 0;

    for (let i = 0; i < wordsData.length; i += 1) {
      const word = wordsData[i];
      const pose = getWordPose(word, displayPhase, now - timesRef.current.scatter, tSinceHoriz);
      if (!pose) {
        continue;
      }
      if (
        x >= pose.left &&
        x <= pose.left + word.w &&
        y >= pose.top &&
        y <= pose.top + word.h
      ) {
        onNavigate(word.panelIndex);
        return;
      }
    }
  };

  return (
    <nav aria-label="Product bots" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-hidden={!interactive}
        onClick={handleClick}
        style={{
          position: 'absolute',
          inset: 0,
          width: wrapW,
          height: wrapH,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          touchAction: interactive ? 'manipulation' : 'none'
        }}
      />
      {interactive &&
        wordsData.map((word) => (
          <a
            key={word.label}
            href="#horizontal-flow"
            className="sr-only"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(word.panelIndex);
            }}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          >
            {word.label}
          </a>
        ))}
    </nav>
  );
});
