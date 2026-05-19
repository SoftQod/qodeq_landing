import { useEffect, useRef, useState } from 'react';
import { heroTheme as theme } from 'theme/qodeqColors';

const DURATION_MS = 3000;
const FADE_OUT_MS = 650;

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
}

export const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const finishedRef = useRef(false);

  useEffect(() => {
    lockScroll();
    const enterTimer = window.setTimeout(() => setEntered(true), 40);

    const start = performance.now();
    let rafId = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - (1 - t) ** 2.2;
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;

      window.setTimeout(() => {
        setExiting(true);
        window.setTimeout(() => {
          setMounted(false);
          unlockScroll();
          onComplete?.();
        }, FADE_OUT_MS);
      }, 180);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(enterTimer);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      unlockScroll();
    };
  }, [onComplete]);

  if (!mounted) {
    return null;
  }

  const opacity = exiting ? 0 : entered ? 1 : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading QODEQ, ${progress} percent`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: theme.primary,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        opacity,
        transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        pointerEvents: 'all',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'min(92vw, 420px)',
          padding: '0 24px',
          transform: entered ? 'translateY(0)' : 'translateY(18px)',
          opacity: entered ? 1 : 0,
          transition: 'opacity 800ms cubic-bezier(0.22, 1, 0.36, 1) 100ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 100ms'
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(2.75rem, 12vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: theme.primary
          }}
        >
          QODEQ
        </p>
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: theme.muted
          }}
        >
          AI Platform
        </p>

        <div
          style={{
            width: '100%',
            marginTop: 'clamp(36px, 8vh, 52px)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: theme.muted
            }}
          >
            <span>Loading</span>
            <span style={{ color: theme.accent, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
          </div>
          <div
            style={{
              position: 'relative',
              height: 3,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentGlow} 100%)`,
                boxShadow: `0 0 24px rgba(16, 163, 127, 0.45)`,
                transition: 'width 80ms linear'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
