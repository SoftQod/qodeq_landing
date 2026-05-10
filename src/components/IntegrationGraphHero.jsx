import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const darkTheme = {
  background: '#0D0D0D',
  primary: '#ECECEC',
  secondary: '#ACACAC',
  border: '#2D2D2D',
  surface: '#1A1A1A',
  hover: '#2A2A2A'
};

const satellites = [
  { id: 'chatbot', label: 'Chatbot', x: 20, y: 22, color: '#33C27F' },
  { id: 'paymentbot', label: 'PaymentBot', x: 80, y: 22, color: '#F05E5E' },
  { id: 'callbot', label: 'CallBot', x: 20, y: 74, color: '#4E8DFF' },
  { id: 'qabot', label: 'QABot', x: 80, y: 74, color: '#F4CF52' }
];

const graphNodes = {
  chatbot: [
    [0, -8],
    [-7, 3],
    [2, 8],
    [8, -1]
  ],
  paymentbot: [
    [-8, 0],
    [-2, -7],
    [5, -3],
    [8, 5],
    [-1, 8]
  ],
  callbot: [
    [-8, 4],
    [-3, -5],
    [3, -7],
    [8, 0],
    [2, 8]
  ],
  qabot: [
    [-8, 0],
    [-4, -6],
    [1, -2],
    [5, -8],
    [8, 2],
    [0, 8]
  ]
};

const pointsToPath = (points) => points.map((p) => `${p[0]},${p[1]}`).join(' ');

export const IntegrationGraphHero = () => {
  const [coreHover, setCoreHover] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  const corePoints = useMemo(
    () => [
      [0, -23],
      [14, -18],
      [24, -6],
      [20, 16],
      [4, 24],
      [-14, 20],
      [-24, 5],
      [-20, -14],
      [-6, -24]
    ],
    []
  );

  const coreEdges = useMemo(
    () => [
      [0, 2],
      [0, 4],
      [1, 3],
      [1, 6],
      [2, 5],
      [3, 7],
      [4, 8],
      [5, 7],
      [6, 8]
    ],
    []
  );

  return (
    <main
      id="hero-main"
      style={{
        width: '100%',
        height: '100vh',
        minHeight: 680,
        position: 'relative',
        overflow: 'hidden',
        background: darkTheme.background
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(75% 60% at 50% 48%, rgba(30,60,100,0.18), rgba(13,13,13,0.96) 70%)'
        }}
      />

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {coreHover &&
          satellites.map((s) => (
            <motion.line
              key={`ray-${s.id}`}
              x1="50"
              y1="50"
              x2={s.x}
              y2={s.y}
              stroke={s.color}
              strokeOpacity="0.92"
              strokeWidth="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
            />
          ))}

        {satellites.map((sat) => {
          const points = graphNodes[sat.id];
          return (
            <g key={sat.id} transform={`translate(${sat.x} ${sat.y})`}>
              <motion.polygon
                points={pointsToPath(points)}
                fill="none"
                stroke={sat.color}
                strokeWidth="0.25"
                initial={{ opacity: 0.45 }}
                animate={{ opacity: coreHover ? 1 : 0.72 }}
                transition={{ duration: 0.25 }}
              />
              {points.map((pt, i) => (
                <circle key={`${sat.id}-pt-${i}`} cx={pt[0]} cy={pt[1]} r="0.45" fill={sat.color} />
              ))}
              <text
                x="0"
                y="13"
                textAnchor="middle"
                fill={darkTheme.secondary}
                style={{ fontSize: 2.15, letterSpacing: '0.28em', textTransform: 'uppercase' }}
              >
                {sat.label}
              </text>
            </g>
          );
        })}

        <g transform="translate(50 50)" onMouseEnter={() => setCoreHover(true)} onMouseLeave={() => setCoreHover(false)} filter="url(#coreGlow)">
          <motion.polygon
            points={pointsToPath(corePoints)}
            fill="rgba(10, 14, 20, 0.12)"
            stroke="#4DA3FF"
            strokeOpacity="0.95"
            strokeWidth="0.24"
            animate={{ rotate: 360, scale: coreHover ? 1.035 : 1 }}
            transition={{ rotate: { duration: 26, ease: 'linear', repeat: Infinity }, scale: { duration: 0.3 } }}
          />

          {coreEdges.map(([a, b], idx) => (
            <line
              key={`edge-${idx}`}
              x1={corePoints[a][0]}
              y1={corePoints[a][1]}
              x2={corePoints[b][0]}
              y2={corePoints[b][1]}
              stroke="#67B3FF"
              strokeOpacity={coreHover ? 0.8 : 0.46}
              strokeWidth="0.16"
            />
          ))}

          {corePoints.map((p, i) => (
            <circle key={`core-pt-${i}`} cx={p[0]} cy={p[1]} r="0.42" fill="#8CC6FF" fillOpacity={coreHover ? 1 : 0.72} />
          ))}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '9vh',
          pointerEvents: 'none',
          color: darkTheme.primary,
          fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
        }}
      >
        <h1
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
            fontSize: 'clamp(24px, 6.8vw, 86px)',
            fontWeight: 300,
            letterSpacing: '0.32em',
            textTransform: 'uppercase'
          }}
        >
          QODEQ
        </h1>
        <p style={{ margin: 0, marginBottom: 18, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.74 }}>
          Qodeq - AI platform automating operations in iGaming
        </p>
        <button
          type="button"
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          style={{
            pointerEvents: 'auto',
            border: `1px solid ${darkTheme.border}`,
            background: buttonHover
              ? 'linear-gradient(135deg, #10334d, #1A1A1A)'
              : `linear-gradient(135deg, ${darkTheme.hover}, ${darkTheme.surface})`,
            color: darkTheme.primary,
            padding: '10px 28px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            clipPath: 'polygon(9% 0, 100% 0, 91% 100%, 0 100%)',
            boxShadow: buttonHover ? '0 0 20px rgba(77,163,255,0.3)' : 'none'
          }}
        >
          Join the abyss
        </button>
      </div>
    </main>
  );
};
