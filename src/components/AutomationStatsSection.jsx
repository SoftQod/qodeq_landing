import { useEffect, useMemo, useRef, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    primary: '#ECECEC',
    muted: '#8E8E8E',
    vessel: 'rgba(255,255,255,0.1)',
    waterDeep: '#051f18',
    water: '#10A37F',
    waterBright: '#1ad4a4',
    accent: '#10A37F'
  }
};

const ringMetrics = [
  {
    id: 'chatbot',
    tag: 'Chatbot',
    value: 60,
    caption: 'Requests processed by automation',
    delay: 0
  },
  {
    id: 'call',
    tag: 'Call center',
    value: 80,
    caption: 'Calls handled by voice bot',
    delay: 0.07
  },
  {
    id: 'payment',
    tag: 'Payment',
    value: 70,
    caption: 'Payment tickets resolved',
    delay: 0.14
  },
  {
    id: 'qa',
    tag: 'QA',
    value: 80,
    caption: 'Quality checks with AI',
    delay: 0.21
  }
];

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const VB = 240;
const CX = VB / 2;
const CY = VB / 2;
const R_VESSEL = 92;
const R_IN = 82;
const STROKE = 6;
const BOTTOM = CY + R_IN;
const TOP = CY - R_IN;
const INNER_H = BOTTOM - TOP;
const LEFT = CX - R_IN;
const RIGHT = CX + R_IN;
const INNER_W = RIGHT - LEFT;

/** Одна замкнутая фигура: дно → правый угол → волна по поверхности → левый угол → замыкание */
function buildLiquidPath(fillRatio, wavePhase) {
  if (fillRatio <= 0.0001) {
    return '';
  }

  const liquidH = INNER_H * fillRatio;
  const surfaceBase = BOTTOM - liquidH;
  const amp = 3.2;
  const waveCycles = 2.75;
  const steps = 72;

  const parts = [`M ${LEFT} ${BOTTOM}`, `L ${RIGHT} ${BOTTOM}`];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = RIGHT - t * INNER_W;
    const nx = ((x - LEFT) / INNER_W) * Math.PI * 2 * waveCycles;
    const y = surfaceBase + Math.sin(nx + wavePhase) * amp;
    parts.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  parts.push(`L ${LEFT} ${BOTTOM} Z`);
  return parts.join(' ');
}

const LiquidRing = ({ metric, animT, wavePhase }) => {
  const { value, tag, caption, delay, id } = metric;
  const g = easeOutCubic(animT);
  const t0 = Math.min(1, Math.max(0, (g - delay) / Math.max(0.04, 1 - delay)));
  const fillRatio = (value / 100) * t0;
  const display = Math.round(value * t0);
  const clipId = `liquid-clip-${id}`;
  const gradId = `liquid-grad-${id}`;

  const pathD = useMemo(
    () => buildLiquidPath(fillRatio, wavePhase),
    [fillRatio, wavePhase]
  );

  return (
    <div className="automation-rings__cell">
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          aspectRatio: '1',
          filter: 'drop-shadow(0 26px 52px rgba(0,0,0,0.55))'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VB} ${VB}`}
          aria-hidden
          style={{ display: 'block' }}
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={CX} cy={CY} r={R_IN} />
            </clipPath>
            <linearGradient
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1={CX}
              y1={BOTTOM + 4}
              x2={CX}
              y2={TOP - 4}
            >
              <stop offset="0%" stopColor={darkTheme.colors.waterDeep} />
              <stop offset="55%" stopColor={darkTheme.colors.water} />
              <stop offset="100%" stopColor={darkTheme.colors.waterBright} />
            </linearGradient>
          </defs>

          <circle
            cx={CX}
            cy={CY}
            r={R_VESSEL}
            fill="none"
            stroke={darkTheme.colors.vessel}
            strokeWidth={STROKE}
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_VESSEL - STROKE / 2 - 1}
            fill="none"
            stroke="rgba(16,163,127,0.12)"
            strokeWidth={1}
          />

          <g clipPath={`url(#${clipId})`}>
            <rect x={LEFT - 4} y={TOP - 4} width={INNER_W + 8} height={INNER_H + 8} fill="#050505" />
            {pathD ? (
              <path d={pathD} fill={`url(#${gradId})`} stroke="none" />
            ) : null}
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '14%'
          }}
        >
          <div
            style={{
              fontSize: 'clamp(36px, min(20cqw, 14vw), 128px)',
              fontWeight: 200,
              letterSpacing: '-0.03em',
              color: darkTheme.colors.primary,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              textShadow: '0 2px 28px rgba(0,0,0,0.8)'
            }}
          >
            {display}
            <span style={{ fontSize: '0.52em', opacity: 0.82 }}>%</span>
          </div>
        </div>
      </div>
      <span
        style={{
          marginTop: 'clamp(20px, 3vh, 32px)',
          fontSize: 11,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: darkTheme.colors.accent
        }}
      >
        {tag}
      </span>
      <p
        style={{
          margin: '12px 0 0',
          fontSize: 'clamp(13px, 1.65vw, 16px)',
          lineHeight: 1.5,
          color: darkTheme.colors.muted,
          textAlign: 'center',
          maxWidth: '18em'
        }}
      >
        {caption}
      </p>
    </div>
  );
};

export const AutomationStatsSection = () => {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const hasStartedFillRef = useRef(false);
  const [animT, setAnimT] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const fillRafRef = useRef(0);
  const waveRafRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
          setInView(true);
        }
      },
      { threshold: [0, 0.15, 0.22, 0.35], rootMargin: '0px 0px -10% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hasStartedFillRef.current) {
      return undefined;
    }
    hasStartedFillRef.current = true;
    const duration = 3200;
    let start = 0;

    const tick = (now) => {
      if (!start) {
        start = now;
      }
      const raw = Math.min((now - start) / duration, 1);
      setAnimT(raw);
      if (raw < 1) {
        fillRafRef.current = requestAnimationFrame(tick);
      }
    };

    fillRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (fillRafRef.current) {
        cancelAnimationFrame(fillRafRef.current);
      }
    };
  }, [inView]);

  /** Общая фаза волны для всех колец — без рассинхрона между блоками */
  useEffect(() => {
    if (!inView) {
      return undefined;
    }

    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setWavePhase((p) => p + dt * 2.4);
      waveRafRef.current = requestAnimationFrame(loop);
    };

    waveRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (waveRafRef.current) {
        cancelAnimationFrame(waveRafRef.current);
      }
    };
  }, [inView]);

  return (
    <section
      ref={rootRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'min(115vh, 1100px)',
        padding: 'clamp(48px, 10vh, 100px) clamp(16px, 4vw, 56px)',
        paddingBottom: 'clamp(64px, 12vh, 120px)',
        background: darkTheme.colors.background,
        overflow: 'hidden',
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <style>
        {`
          .automation-stats__body {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 0;
          }
          .automation-rings__row {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: stretch;
            justify-content: center;
            width: 100%;
            max-width: min(1880px, 100%);
            margin: 0 auto;
            gap: clamp(10px, 1.8vw, 28px);
            box-sizing: border-box;
          }
          @media (max-width: 920px) {
            .automation-rings__row {
              flex-wrap: wrap;
              justify-content: center;
              row-gap: clamp(18px, 5vw, 36px);
            }
            .automation-rings__cell {
              flex: 1 1 200px;
              max-width: 440px;
              width: 100%;
            }
          }
          @media (max-width: 480px) {
            .automation-rings__cell {
              flex: 1 1 100%;
              max-width: min(340px, 100%);
            }
          }
          .automation-rings__cell {
            flex: 1 1 0;
            min-width: 0;
            max-width: 440px;
            display: flex;
            flex-direction: column;
            align-items: center;
            container-type: inline-size;
          }
        `}
      </style>

      <div
        style={{
          flexShrink: 0,
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: darkTheme.colors.muted,
          textAlign: 'center',
          marginBottom: 'clamp(20px, 4vh, 40px)'
        }}
      >
        Automation impact
      </div>

      <div className="automation-stats__body">
        <div className="automation-rings__row">
          {ringMetrics.map((m) => (
            <LiquidRing key={m.id} metric={m} animT={animT} wavePhase={wavePhase} />
          ))}
        </div>
      </div>
    </section>
  );
};
