import { useMemo } from 'react';

/** Базовая сетка 5×7: «1» — кубик */
const LETTERS = {
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '10000', '10000', '11111']
};

const WORD = 'QODEQ';

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
    y: Math.sin(angle) * dist,
    rot: (stable01(letterIndex, salt, seedA + seedB, 13) - 0.5) * 34
  };
}

function filled(grid, r, c) {
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length) {
    return false;
  }
  return grid[r][c] === '1';
}

/**
 * Размер блока от формы буквы: на острых выпуклых углах и кончиках — меньше,
 * чтобы силуэт визуально сгладился (антиалиасинг по кирпичикам).
 */
function silhouetteSizing(grid, r, c, letterIndex, salt) {
  const u = filled(grid, r - 1, c);
  const d = filled(grid, r + 1, c);
  const l = filled(grid, r, c - 1);
  const ri = filled(grid, r, c + 1);
  const s = (u ? 1 : 0) + (d ? 1 : 0) + (l ? 1 : 0) + (ri ? 1 : 0);

  const micro = () => 0.96 + stable01(letterIndex, r, c, 300 + salt) * 0.08;

  /** Сдвиг центра в сторону «толщины» буквы (доли baseUnit) */
  const nudgeFromEmpties = () => {
    let nx = 0;
    let ny = 0;
    if (!u) {
      ny += 1;
    }
    if (!d) {
      ny -= 1;
    }
    if (!l) {
      nx += 1;
    }
    if (!ri) {
      nx -= 1;
    }
    const len = Math.hypot(nx, ny) || 1;
    return { x: nx / len, y: ny / len };
  };

  if (s === 4) {
    return { mul: 1.0 * micro(), nx: 0, ny: 0 };
  }
  if (s === 3) {
    return { mul: 0.93 * micro(), nx: 0, ny: 0 };
  }

  if (s === 2) {
    const oppositeBar =
      (u && d && !l && !ri) || (l && ri && !u && !d);
    if (oppositeBar) {
      return { mul: 0.87 * micro(), nx: 0, ny: 0 };
    }
    const { x, y } = nudgeFromEmpties();
    const mul = 0.48 + stable01(letterIndex, r, c, 400 + salt) * 0.14;
    return { mul: mul * micro(), nx: x * 0.16, ny: y * 0.16 };
  }

  if (s === 1) {
    let nx = 0;
    let ny = 0;
    if (u) {
      ny -= 1;
    }
    if (d) {
      ny += 1;
    }
    if (l) {
      nx -= 1;
    }
    if (ri) {
      nx += 1;
    }
    const len = Math.hypot(nx, ny) || 1;
    const mul = 0.4 + stable01(letterIndex, r, c, 500 + salt) * 0.1;
    return { mul: mul * micro(), nx: (nx / len) * 0.14, ny: (ny / len) * 0.14 };
  }

  return { mul: 0.42, nx: 0, ny: 0 };
}

/** Равномерная сетка — форма буквы читается; сглаживание только размерами углов */
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

  const colEdges = buildUniformEdges(cols, baseUnit * 0.98);
  const rowEdges = buildUniformEdges(rows, baseUnit * 0.96);

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

      const { mul, nx, ny } = silhouetteSizing(grid, r, c, letterIndex, salt);

      const jitterX = (stable01(letterIndex, r, c, 50 + salt) - 0.5) * baseUnit * 0.12;
      const jitterY = (stable01(letterIndex, r, c, 60 + salt) - 0.5) * baseUnit * 0.12;

      let width = baseUnit * mul;
      let height = baseUnit * mul;

      const minS = baseUnit * 0.38;
      const maxS = baseUnit * 1.12;
      width = Math.min(maxS, Math.max(minS, width));
      height = Math.min(maxS, Math.max(minS, height));

      const nudgePxX = nx * baseUnit;
      const nudgePxY = ny * baseUnit;

      let left = pad + cx - width * 0.5 + nudgePxX + jitterX;
      let top = pad + cy - height * 0.5 + nudgePxY + jitterY + lift;

      left = Math.max(0, left);
      top = Math.max(0, top);

      const { x: ox, y: oy, rot } = exitVector(letterIndex, salt, r * 17 + c, r + c * 31);

      const delay =
        letterIndex * 88 +
        (salt % 96) * 7.5 +
        Math.round(stable01(letterIndex, salt, r, 90) * 42);

      const settleRot = (stable01(letterIndex, r, c, 200 + salt) - 0.5) * 16;

      blocks.push({
        id: `${letterIndex}-${r}-${c}-${salt}`,
        left,
        top,
        width,
        height,
        ox,
        oy,
        rot,
        delay,
        settleRot
      });
    });
  });

  let maxR = 0;
  let maxB = 0;
  blocks.forEach((b) => {
    maxR = Math.max(maxR, b.top + b.height);
    maxB = Math.max(maxB, b.left + b.width);
  });

  const rawW = colEdges[colEdges.length - 1];
  const rawH = rowEdges[rowEdges.length - 1];
  const width = Math.max(maxB, pad * 2 + rawW) + pad;
  const height = Math.max(maxR, pad * 2 + rawH) + pad * 1.2 + Math.abs(lift);

  return { width, height, blocks, lift };
}

/** 3D-блок: куб по min стороне, растягивается до width×height */
function VoxelBrick3D({
  width,
  height,
  entered,
  ox,
  oy,
  rot,
  delay,
  settleRot,
  accent,
  accentHover
}) {
  const cell = Math.min(width, height);
  const h = cell * 0.495;
  const perspectivePx = Math.max(200, Math.round(Math.max(width, height) * 26));
  const sx = width / cell;
  const sy = height / cell;

  const faceCommon = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: cell,
    height: cell,
    marginLeft: -cell * 0.5,
    marginTop: -cell * 0.5,
    boxSizing: 'border-box',
    backfaceVisibility: 'hidden',
    border: '1px solid rgba(0,0,0,0.45)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
  };

  const faces = [
    {
      t: `rotateY(0deg) translateZ(${h}px)`,
      bg: `linear-gradient(155deg, #0a4536 0%, ${accent} 40%, #031510 100%)`
    },
    {
      t: `rotateY(180deg) translateZ(${h}px)`,
      bg: 'linear-gradient(165deg, #021c17 0%, #010807 100%)'
    },
    {
      t: `rotateY(90deg) translateZ(${h}px)`,
      bg: `linear-gradient(180deg, #0b5643 0%, ${accentHover} 38%, #021a14 100%)`
    },
    {
      t: `rotateY(-90deg) translateZ(${h}px)`,
      bg: 'linear-gradient(180deg, #063d30 0%, #021510 100%)'
    },
    {
      t: `rotateX(90deg) translateZ(${h}px)`,
      bg: 'linear-gradient(145deg, #1a8f72 0%, #0d5c48 45%, #07362a 100%)'
    },
    {
      t: `rotateX(-90deg) translateZ(${h}px)`,
      bg: 'linear-gradient(180deg, #010d0b 0%, #000000 100%)'
    }
  ];

  const transition = `transform 1.92s cubic-bezier(0.12, 0.88, 0.18, 1) ${delay}ms, opacity 0.88s cubic-bezier(0.25, 0.82, 0.32, 1) ${delay}ms`;

  return (
    <div
      style={{
        width,
        height,
        perspective: `${perspectivePx}px`,
        perspectiveOrigin: '50% 42%',
        transformStyle: 'preserve-3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      <div
        style={{
          width: cell,
          height: cell,
          transformStyle: 'preserve-3d',
          transform: entered
            ? `translate3d(0,0,0) rotate(${settleRot.toFixed(2)}deg)`
            : `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`,
          opacity: entered ? 1 : 0,
          transition,
          willChange: 'transform, opacity'
        }}
      >
        <div
          style={{
            width: cell,
            height: cell,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(-20deg) rotateY(34deg) scale3d(${sx.toFixed(3)}, ${sy.toFixed(3)}, 1)`
          }}
        >
          <div
            style={{
              width: cell,
              height: cell,
              position: 'relative',
              transformStyle: 'preserve-3d'
            }}
          >
            {faces.map((face, i) => (
              <div
                key={i}
                style={{
                  ...faceCommon,
                  transform: face.t,
                  background: face.bg
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const VoxelHeroTitle = ({ entered, isTinyMobile, isSmallMobile, isMobile, colors }) => {
  const { expandFactor, baseUnit, letterGap, letterPad } = useMemo(() => {
    if (isTinyMobile) {
      return { expandFactor: 2, baseUnit: 5.5, letterGap: 4, letterPad: 2.5 };
    }
    if (isSmallMobile) {
      return { expandFactor: 2, baseUnit: 6.8, letterGap: 5, letterPad: 3 };
    }
    if (isMobile) {
      return { expandFactor: 2, baseUnit: 8, letterGap: 6, letterPad: 3.5 };
    }
    return { expandFactor: 3, baseUnit: 6.6, letterGap: 7, letterPad: 4 };
  }, [isTinyMobile, isSmallMobile, isMobile]);

  const lettersLayout = useMemo(() => {
    const globalSaltRef = { i: 0 };
    return WORD.split('').map((char, letterIndex) =>
      buildLetterBlocks(char, letterIndex, baseUnit, expandFactor, letterPad, globalSaltRef)
    );
  }, [baseUnit, expandFactor, letterPad]);

  const accent = colors.accent;
  const accentHover = colors.accentHover ?? '#0E8C6F';

  return (
    <div
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: letterGap,
        margin: 0,
        padding: '12px 8px 8px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {lettersLayout.map((letter, letterIndex) => (
        <div
          key={`${WORD[letterIndex]}-${letterIndex}`}
          style={{
            position: 'relative',
            width: letter.width,
            height: letter.height,
            flexShrink: 0
          }}
        >
          {letter.blocks.map((b) => (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                pointerEvents: 'none'
              }}
            >
              <VoxelBrick3D
                width={b.width}
                height={b.height}
                entered={entered}
                ox={b.ox}
                oy={b.oy}
                rot={b.rot}
                delay={b.delay}
                settleRot={b.settleRot}
                accent={accent}
                accentHover={accentHover}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
