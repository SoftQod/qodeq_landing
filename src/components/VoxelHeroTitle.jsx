import { useMemo, useEffect, useState, memo, useRef } from 'react';
import { NavWordsCanvas } from 'components/NavWordsCanvas';

/** Базовая сетка 5×7: «1» — точка */
const LETTERS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100']
};

const WORD = 'QODEQ';

/** Навигация из «взрыва» — индекс панели в HorizontalScrollSection */
export const HERO_BOT_NAV = [
  { label: 'Chatbot', text: 'CHATBOT', panelIndex: 0, ox: -1, oy: -1, color: '#22C55E' },
  { label: 'Call Center Bot', text: 'CALL CENTER BOT', panelIndex: 1, ox: 1, oy: -1, color: '#3B82F6' },
  { label: 'Payment Bot', text: 'PAYMENT BOT', panelIndex: 2, ox: -1, oy: 1, color: '#EF4444' },
  { label: 'QA Bot', text: 'QA BOT', panelIndex: 3, ox: 1, oy: 1, color: '#FACC15' }
];

const BOT_PANEL_COUNT = 4;

function scrollToBotPanel(panelIndex) {
  const wrap = document.getElementById('horizontal-flow');
  const section = wrap?.querySelector('section');
  if (!section) {
    wrap?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const maxIndex = Math.max(1, BOT_PANEL_COUNT - 1);
  const scrollable = Math.max(0, section.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, panelIndex / maxIndex));
  const top = section.offsetTop + progress * scrollable;
  window.scrollTo({ top, behavior: 'smooth' });
}

const ENTER_DUR_MS = 1920;
/** Разлёт: дольше и мягче ease-out в конце размаха */
const SCATTER_DUR_MS = 1680;
/** Сборка в строку — плавно, почти без разброса старта между точками */
const HORIZONTAL_DUR_MS = 2100;
/** Насколько раньше начать горизонтальную сборку относительно конца разлёта (непрерывное движение) */
const SCATTER_HORIZ_OVERLAP_MS = 280;
const GLOW_FADE_MS = 1100;
const SCATTER_EASE = 'cubic-bezier(0.12, 0.85, 0.22, 1)';
const HORIZ_EASE = 'cubic-bezier(0.14, 1, 0.32, 1)';

/** Временные метки разлёта / горизонтали (мс от старта эффекта роста) */
function getRebuildGrowthWindow(maxDelay) {
  const assembleEnd = maxDelay + ENTER_DUR_MS + 24;
  const tScatter = assembleEnd;
  const tHoriz = tScatter + SCATTER_DUR_MS - SCATTER_HORIZ_OVERLAP_MS;
  const tGrowEnd = tHoriz + HORIZONTAL_DUR_MS;
  return { tScatter, tHoriz, tGrowEnd };
}

function expandGrid(rows, factor) {
  if (factor <= 1) {
    return rows;
  }
  const out = [];
  for (const row of rows) {
    const chs = row.split('');
    for (let repY = 0; repY < factor; repY += 1) {
      let newRow = '';
      for (const ch of chs) {
        newRow += ch.repeat(factor);
      }
      out.push(newRow);
    }
  }
  return out;
}

function stable01(a, b, c, d) {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + d * 43.758) * 43758.5453;
  return x - Math.floor(x);
}

function exitVector(letterIndex, salt, seedA, seedB) {
  const angle = stable01(letterIndex, salt, seedA, 11) * Math.PI * 2;
  const dist = 820 + stable01(letterIndex, salt, seedB, 12) * 1100;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist
  };
}

function scatterOffset(letterIndex, salt) {
  const angle = stable01(letterIndex, salt, 31, 41) * Math.PI * 2;
  const dist = 420 + stable01(letterIndex, salt, 32, 42) * 720;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist
  };
}

function buildUniformEdges(count, step) {
  const edges = [0];
  for (let k = 0; k < count; k += 1) {
    edges.push(edges[k] + step);
  }
  return edges;
}

function buildLetterBlocks(char, letterIndex, baseUnit, expandFactor, pad, globalSaltRef) {
  const grid = expandGrid(LETTERS[char] ?? [], expandFactor);
  if (!grid.length) {
    return { width: 0, height: 0, blocks: [], lift: 0 };
  }

  const rows = grid.length;
  const cols = grid[0].length;

  const colStep = baseUnit * 0.98;
  const rowStep = baseUnit * 0.96;
  const colEdges = buildUniformEdges(cols, colStep);
  const rowEdges = buildUniformEdges(rows, rowStep);

  const cellW = colEdges[1] - colEdges[0];
  const cellH = rowEdges[1] - rowEdges[0];
  const dot = Math.min(cellW, cellH) * 0.78;

  const lift = (Math.sin(letterIndex * 1.7 + 0.4) - Math.cos(letterIndex * 0.9)) * (baseUnit * 0.22);

  const blocks = [];

  grid.forEach((row, r) => {
    row.split('').forEach((bit, c) => {
      if (bit !== '1') {
        return;
      }

      const salt = globalSaltRef.i;
      globalSaltRef.i += 1;

      const cx = (colEdges[c] + colEdges[c + 1]) * 0.5;
      const cy = (rowEdges[r] + rowEdges[r + 1]) * 0.5;

      const left = pad + cx - dot * 0.5;
      const top = pad + cy - dot * 0.5 + lift;

      const { x: ox, y: oy } = exitVector(letterIndex, salt, r * 17 + c, r + c * 31);

      const delay =
        letterIndex * 88 +
        (salt % 96) * 7.5 +
        Math.round(stable01(letterIndex, salt, r, 90) * 42);

      blocks.push({
        id: `${letterIndex}-${r}-${c}-${salt}`,
        left: Math.max(0, left),
        top: Math.max(0, top),
        size: dot,
        ox,
        oy,
        delay
      });
    });
  });

  let maxR = 0;
  let maxB = 0;
  blocks.forEach((b) => {
    maxR = Math.max(maxR, b.top + b.size);
    maxB = Math.max(maxB, b.left + b.size);
  });

  const rawW = colEdges[colEdges.length - 1];
  const rawH = rowEdges[rowEdges.length - 1];
  const width = Math.max(maxB, pad * 2 + rawW) + pad;
  const height = Math.max(maxR, pad * 2 + rawH) + pad * 1.2 + Math.abs(lift);

  return { width, height, blocks, lift };
}

/** Горизонтальное слово из нескольких букв (для навигации) — ровная сетка без lift */
function buildNavLetterBlocks(char, letterIndex, baseUnit, expandFactor, pad, globalSaltRef) {
  const grid = expandGrid(LETTERS[char] ?? [], expandFactor);
  if (!grid.length) {
    return { width: 0, height: 0, blocks: [] };
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const colStep = baseUnit;
  const rowStep = baseUnit;
  const colEdges = buildUniformEdges(cols, colStep);
  const rowEdges = buildUniformEdges(rows, rowStep);
  const cellW = colEdges[1] - colEdges[0];
  const cellH = rowEdges[1] - rowEdges[0];
  const dot = Math.min(cellW, cellH) * 0.84;
  const blocks = [];

  grid.forEach((row, r) => {
    row.split('').forEach((bit, c) => {
      if (bit !== '1') {
        return;
      }

      const salt = globalSaltRef.i;
      globalSaltRef.i += 1;
      const cx = (colEdges[c] + colEdges[c + 1]) * 0.5;
      const cy = (rowEdges[r] + rowEdges[r + 1]) * 0.5;
      const left = pad + cx - dot * 0.5;
      const top = pad + cy - dot * 0.5;

      blocks.push({
        id: `${letterIndex}-${r}-${c}-${salt}`,
        left: Math.max(0, left),
        top: Math.max(0, top),
        size: dot,
        delay: letterIndex * 48 + salt * 3
      });
    });
  });

  let maxR = 0;
  let maxB = 0;
  blocks.forEach((b) => {
    maxR = Math.max(maxR, b.top + b.size);
    maxB = Math.max(maxB, b.left + b.size);
  });

  const rawW = colEdges[colEdges.length - 1];
  const rawH = rowEdges[rowEdges.length - 1];
  const width = Math.max(maxB, pad * 2 + rawW) + pad;
  const height = Math.max(maxR, pad * 2 + rawH) + pad;

  return { width, height, blocks };
}

/** Горизонтальное слово из нескольких букв (для навигации) */
function buildWordBlocks(text, wordIndex, baseUnit, expandFactor, letterPad, letterGap, globalSaltRef) {
  const upper = text.toUpperCase();
  const letterEntries = [];
  let letterIdx = 0;

  const chars = upper.split('');
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    if (ch === ' ') {
      letterEntries.push({ space: true });
      continue;
    }
    const letter = buildNavLetterBlocks(
      ch,
      wordIndex * 200 + letterIdx,
      baseUnit,
      expandFactor,
      letterPad,
      globalSaltRef
    );
    letterIdx += 1;
    if (letter.width) {
      letterEntries.push({ letter });
    }
  }

  let maxH = 0;
  letterEntries.forEach((entry) => {
    if (entry.letter) {
      maxH = Math.max(maxH, entry.letter.height);
    }
  });

  const blocks = [];
  let xCursor = 0;

  for (let i = 0; i < letterEntries.length; i += 1) {
    const entry = letterEntries[i];
    if (entry.space) {
      xCursor += baseUnit * 0.55;
      continue;
    }
    const { letter } = entry;
    const yOff = (maxH - letter.height) * 0.5;
    const xOff = xCursor;
    for (let bi = 0; bi < letter.blocks.length; bi += 1) {
      const b = letter.blocks[bi];
      blocks.push({
        ...b,
        id: `nav${wordIndex}-${b.id}`,
        left: b.left + xOff,
        top: b.top + yOff
      });
    }
    xCursor += letter.width + letterGap;
  }

  const width = xCursor > 0 ? Math.max(0, xCursor - letterGap) : 0;
  return { width, height: maxH, blocks };
}

const TitleDotBlock = memo(function TitleDotBlock({
  size,
  accent,
  ox,
  oy,
  delay,
  vx,
  vy,
  hx,
  hy,
  sx,
  sy,
  phase,
  entered
}) {
  const displayPhase = !entered ? 0 : Math.max(phase, 1);

  const outerLeft = displayPhase >= 3 ? hx : vx;
  const outerTop = displayPhase >= 3 ? hy : vy;

  let tx = 0;
  let ty = 0;
  let opacity = 1;

  if (displayPhase === 0) {
    tx = ox;
    ty = oy;
    opacity = 0;
  } else if (displayPhase === 1) {
    tx = 0;
    ty = 0;
    opacity = 1;
  } else if (displayPhase === 2) {
    tx = sx;
    ty = sy;
    opacity = 1;
  } else {
    tx = 0;
    ty = 0;
    opacity = 1;
  }

  const enterTrans = `transform ${ENTER_DUR_MS}ms cubic-bezier(0.12, 0.88, 0.18, 1) ${delay}ms, opacity 0.88s cubic-bezier(0.25, 0.82, 0.32, 1) ${delay}ms`;
  const scatterTrans = `transform ${SCATTER_DUR_MS}ms ${SCATTER_EASE}`;
  const horizOuterTrans = `transform ${HORIZONTAL_DUR_MS}ms ${HORIZ_EASE}`;
  const horizInnerTrans = `transform ${HORIZONTAL_DUR_MS}ms ${HORIZ_EASE}`;
  const outerTransition = displayPhase >= 3 ? horizOuterTrans : 'none';
  const midTransition =
    displayPhase === 0 || displayPhase === 1
      ? enterTrans
      : displayPhase === 2
        ? scatterTrans
        : horizInnerTrans;
  const lite = displayPhase === 2 || displayPhase === 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        transform: `translate3d(${outerLeft.toFixed(2)}px, ${outerTop.toFixed(2)}px, 0)`,
        pointerEvents: 'none',
        overflow: 'visible',
        transition: outerTransition
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          boxSizing: 'border-box',
          background: lite
            ? accent
            : `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.5) 0%, ${accent} 42%, #9A9A9A 88%, #2E2E2E 100%)`,
          boxShadow: lite ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.4)',
          transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(var(--dotScale, 1))`,
          transformOrigin: '0 0',
          opacity,
          transition: `${midTransition}, background 400ms ease, box-shadow 400ms ease`,
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      />
    </div>
  );
});

function buildCanvasDots(lettersLayout, letterGap, horizontalWordScale) {
  if (!lettersLayout.length) {
    return { dots: [], canvasW: 0, canvasH: 0, maxDelay: 0 };
  }

  const S = horizontalWordScale;

  const maxLetterW = Math.max(...lettersLayout.map((l) => l.width));
  let vertY = 0;
  const vertOrigin = lettersLayout.map((letter) => {
    const xOff = (maxLetterW - letter.width) * 0.5;
    const y = vertY;
    vertY += letter.height + letterGap;
    return { xOff, y };
  });
  const vertTotalH = vertY - letterGap;

  const maxLetterHHoriz = Math.max(...lettersLayout.map((l) => l.height * S));
  let horizX = 0;
  const horOrigin = lettersLayout.map((letter) => {
    const x = horizX;
    const scaledH = letter.height * S;
    const yOff = (maxLetterHHoriz - scaledH) * 0.5;
    horizX += letter.width * S + letterGap * S;
    return { x, yOff };
  });
  const horizTotalW = horizX - letterGap * S;

  const canvasW = Math.max(maxLetterW, horizTotalW);
  const canvasH = Math.max(vertTotalH, maxLetterHHoriz);
  const padVX = (canvasW - maxLetterW) * 0.5;
  const padVY = (canvasH - vertTotalH) * 0.5;
  const padHX = (canvasW - horizTotalW) * 0.5;
  const padHY = (canvasH - maxLetterHHoriz) * 0.5;

  const dots = [];
  let maxDelay = 0;

  lettersLayout.forEach((letter, letterIndex) => {
    const vo = vertOrigin[letterIndex];
    const ho = horOrigin[letterIndex];

    letter.blocks.forEach((b) => {
      maxDelay = Math.max(maxDelay, b.delay);
      const { x: sx, y: sy } = scatterOffset(letterIndex, b.delay + letterIndex * 997);
      dots.push({
        ...b,
        vx: padVX + vo.xOff + b.left,
        vy: padVY + vo.y + b.top,
        hx: padHX + ho.x + b.left * S,
        hy: padHY + ho.yOff + b.top * S,
        sx,
        sy
      });
    });
  });

  return { dots, canvasW, canvasH, maxDelay };
}

export const VoxelHeroTitle = ({ entered, isTinyMobile, isSmallMobile, isMobile, onAnimationComplete, canInteract }) => {
  const { expandFactor, baseUnit, letterGap, letterPad, horizontalWordScale } = useMemo(() => {
    if (isTinyMobile) {
      return {
        expandFactor: 2,
        baseUnit: 5.5,
        letterGap: 4,
        letterPad: 2.5,
        horizontalWordScale: 1.42
      };
    }
    if (isSmallMobile) {
      return {
        expandFactor: 2,
        baseUnit: 6.8,
        letterGap: 5,
        letterPad: 3,
        horizontalWordScale: 1.55
      };
    }
    if (isMobile) {
      return {
        expandFactor: 2,
        baseUnit: 8,
        letterGap: 6,
        letterPad: 3.5,
        horizontalWordScale: 1.72
      };
    }
    return {
      expandFactor: 2,
      baseUnit: 6.6,
      letterGap: 7,
      letterPad: 4,
      horizontalWordScale: 1.9
    };
  }, [isTinyMobile, isSmallMobile, isMobile]);

  const navSizing = useMemo(() => {
    if (isTinyMobile) {
      return { navBaseUnit: 3.6, navExpandFactor: 1, navLetterGap: 2.2, navLetterPad: 1.55 };
    }
    if (isSmallMobile) {
      return { navBaseUnit: 4.05, navExpandFactor: 1, navLetterGap: 2.45, navLetterPad: 1.75 };
    }
    if (isMobile) {
      return { navBaseUnit: 4.55, navExpandFactor: 1, navLetterGap: 2.75, navLetterPad: 1.95 };
    }
    return { navBaseUnit: 5.8, navExpandFactor: 1, navLetterGap: 3.4, navLetterPad: 2.35 };
  }, [isTinyMobile, isSmallMobile, isMobile]);

  const navWords = useMemo(() => {
    const globalSaltRef = { i: 20000 };
    return HERO_BOT_NAV.map((item, wordIndex) => ({
      ...item,
      layout: buildWordBlocks(
        item.text,
        wordIndex,
        navSizing.navBaseUnit,
        navSizing.navExpandFactor,
        navSizing.navLetterPad,
        navSizing.navLetterGap,
        globalSaltRef
      )
    }));
  }, [navSizing]);

  const lettersLayout = useMemo(() => {
    const globalSaltRef = { i: 0 };
    return WORD.split('').map((char, letterIndex) =>
      buildLetterBlocks(char, letterIndex, baseUnit, expandFactor, letterPad, globalSaltRef)
    );
  }, [baseUnit, expandFactor, letterPad]);

  const { dots, canvasW, canvasH, maxDelay } = useMemo(
    () => buildCanvasDots(lettersLayout, letterGap, horizontalWordScale),
    [lettersLayout, letterGap, horizontalWordScale]
  );

  const [phase, setPhase] = useState(0);
  const dotsRootRef = useRef(null);
  const onCompleteRef = useRef(onAnimationComplete);
  const completedRef = useRef(false);

  onCompleteRef.current = onAnimationComplete;

  const rebuildWindow = useMemo(() => getRebuildGrowthWindow(maxDelay), [maxDelay]);

  useEffect(() => {
    const root = dotsRootRef.current;
    const setScale = (v) => {
      if (root) {
        root.style.setProperty('--dotScale', v);
      }
    };

    if (!entered) {
      setScale('1');
      return undefined;
    }

    const { tScatter, tHoriz } = rebuildWindow;
    /** Рост только на участке разлёта; к началу сборки в строку масштаб уже максимальный */
    const growSpan = Math.max(1, tHoriz - tScatter);
    const anchor = performance.now();
    const smax = horizontalWordScale;
    let raf = 0;
    let alive = true;

    setScale('1');

    const tick = () => {
      if (!alive) {
        return;
      }
      const elapsed = performance.now() - anchor;
      const linear = (elapsed - tScatter) / growSpan;
      const t = Math.min(1, Math.max(0, linear));
      const eased = 1 - (1 - t) ** 3;
      const scale = 1 + eased * (smax - 1);
      setScale(scale.toFixed(6));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setScale(String(smax));
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      setScale('1');
    };
  }, [entered, rebuildWindow, horizontalWordScale]);

  useEffect(() => {
    if (!entered) {
      setPhase(0);
      completedRef.current = false;
      return undefined;
    }

    const assembleEnd = maxDelay + ENTER_DUR_MS + 24;
    const tScatter = assembleEnd;
    const tHoriz = tScatter + SCATTER_DUR_MS - SCATTER_HORIZ_OVERLAP_MS;
    const tDone = tHoriz + HORIZONTAL_DUR_MS + 40;

    const idScatter = window.setTimeout(() => setPhase(2), tScatter);
    const idHoriz = window.setTimeout(() => setPhase(3), tHoriz);
    const idDone = window.setTimeout(() => setPhase(4), tDone);

    return () => {
      window.clearTimeout(idScatter);
      window.clearTimeout(idHoriz);
      window.clearTimeout(idDone);
    };
  }, [entered, maxDelay]);

  const titleColor = '#FFFFFF';

  useEffect(() => {
    const root = dotsRootRef.current;
    if (!root) {
      return undefined;
    }

    if (phase < 4) {
      root.style.filter = 'none';
      return undefined;
    }

    const start = performance.now();
    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) {
        return;
      }
      const t = Math.min(1, (performance.now() - start) / GLOW_FADE_MS);
      const eased = 1 - (1 - t) ** 3;
      root.style.filter = `drop-shadow(0 0 ${(22 * eased).toFixed(2)}px rgba(255, 255, 255, ${(0.34 * eased).toFixed(4)}))`;
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  const navSpreadX = isMobile ? (isTinyMobile ? 118 : isSmallMobile ? 138 : 158) : 340;
  const navSpreadY = isMobile ? (isTinyMobile ? 92 : isSmallMobile ? 108 : 124) : 228;
  const maxNavW = Math.max(...navWords.map((n) => n.layout.width), 0);
  const maxNavH = Math.max(...navWords.map((n) => n.layout.height), 0);
  const wrapPadX = Math.max(navSpreadX + (isMobile ? 36 : 56), maxNavW * 0.4 + 16);
  const wrapPadYTop = Math.max(navSpreadY + (isMobile ? 32 : 48), maxNavH * 0.4 + 14);
  const wrapPadYBottom = Math.max(navSpreadY * 0.58 + (isMobile ? 20 : 28), maxNavH * 0.28 + 10);
  const wrapW = canvasW + wrapPadX * 2;
  const wrapH = canvasH + wrapPadYTop + wrapPadYBottom;
  const centerX = wrapPadX + canvasW * 0.5;
  const centerY = wrapPadYTop + canvasH * 0.5;

  return (
    <div
      style={{
        position: 'relative',
        width: wrapW,
        height: wrapH,
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <div
        ref={dotsRootRef}
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: wrapPadX,
          top: wrapPadYTop,
          width: canvasW,
          height: canvasH,
          padding: '12px 8px 8px',
          boxSizing: 'content-box',
          '--dotScale': 1,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {dots.map((d) => (
          <TitleDotBlock
            key={d.id}
            size={d.size}
            accent={titleColor}
            ox={d.ox}
            oy={d.oy}
            delay={d.delay}
            vx={d.vx}
            vy={d.vy}
            hx={d.hx}
            hy={d.hy}
            sx={d.sx}
            sy={d.sy}
            phase={phase}
            entered={entered}
          />
        ))}
      </div>
      <NavWordsCanvas
        navWords={navWords}
        entered={entered}
        phase={phase}
        canInteract={Boolean(canInteract)}
        wrapW={wrapW}
        wrapH={wrapH}
        centerX={centerX}
        centerY={centerY}
        spreadX={navSpreadX}
        spreadY={navSpreadY}
        onNavigate={scrollToBotPanel}
      />
    </div>
  );
};
