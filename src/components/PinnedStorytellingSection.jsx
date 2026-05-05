import { useEffect, useMemo, useRef, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    primary: '#ECECEC',
    secondary: '#ACACAC',
    muted: '#8E8E8E',
    border: '#2D2D2D',
    divider: '#363636',
    hover: '#2A2A2A',
    accent: '#10A37F',
    accentHover: '#0E8C6F'
  }
};

const steps = [
  {
    id: '01',
    title: 'Online casinos and betting companies',
    text: 'AI automation for player support, operations, and high-volume request handling.'
  },
  {
    id: '02',
    title: 'Fintech and payment services',
    text: 'Fast response flows for payment checks, status updates, and customer interactions.'
  },
  {
    id: '03',
    title: 'Call centers and support departments',
    text: 'Scalable assistant layer for support teams with better routing and quicker resolutions.'
  }
];

const sectionStyle = {
  position: 'relative',
  background: darkTheme.colors.background,
  color: darkTheme.colors.primary
};

const stickyStyle = {
  position: 'sticky',
  top: 0,
  height: '100vh',
  display: 'grid',
  gridTemplateColumns: '1.05fr 0.95fr',
  gap: '4vw',
  alignItems: 'center',
  padding: '0 7vw'
};

const leftColumnStyle = {
  display: 'grid',
  gap: '22px',
  maxWidth: '700px'
};

const rightColumnStyle = {
  justifySelf: 'stretch',
  width: '100%'
};

const visualCardStyle = {
  border: `1px solid ${darkTheme.colors.border}`,
  background: `linear-gradient(155deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface} 55%, ${darkTheme.colors.background})`,
  borderRadius: '24px',
  minHeight: 'clamp(280px, 40vh, 430px)',
  padding: '32px',
  boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
  display: 'grid',
  alignContent: 'space-between'
};

const cardStackStyle = {
  position: 'relative',
  minHeight: 'clamp(280px, 40vh, 430px)'
};

export const PinnedStorytellingSection = () => {
  const sectionRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [progress, setProgress] = useState(0);
  const [introVisible, setIntroVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollPerStepVh = 46;
  const isNarrow = viewportWidth <= 900;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 1200);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const node = sectionRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const scrollable = node.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const current = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(current / scrollable);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntroVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const progressIndex = useMemo(() => {
    const maxIndex = steps.length - 1;
    return Math.min(maxIndex, Math.max(0, Math.round(progress * maxIndex)));
  }, [progress]);

  useEffect(() => {
    setActiveIndex(progressIndex);
  }, [progressIndex]);

  const stickyStyleResponsive = isNarrow
    ? {
        ...stickyStyle,
        gridTemplateColumns: '1fr',
        gap: 'clamp(18px, 5vw, 28px)',
        padding: 'clamp(14px, 4vw, 22px) clamp(14px, 4vw, 22px)',
        alignItems: 'stretch'
      }
    : stickyStyle;

  const leftColumnResponsive = isNarrow ? { ...leftColumnStyle, maxWidth: '100%', minWidth: 0 } : leftColumnStyle;

  const visualCardResponsive = isNarrow
    ? {
        ...visualCardStyle,
        padding: 'clamp(18px, 4vw, 28px)',
        minHeight: 'clamp(220px, 38vh, 360px)',
        borderRadius: '18px'
      }
    : visualCardStyle;

  const cardStackResponsive = isNarrow
    ? { ...cardStackStyle, minHeight: 'clamp(220px, 38vh, 360px)' }
    : cardStackStyle;

  return (
    <section
      ref={sectionRef}
      style={{
        ...sectionStyle,
        height: `calc(100vh + ${(steps.length - 1) * scrollPerStepVh}vh)`,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div
        className={`story-intro-animate ${introVisible ? 'is-visible' : ''}`}
        style={stickyStyleResponsive}
      >
        <div
          className={`story-col-left ${introVisible ? 'is-visible' : ''}`}
          style={leftColumnResponsive}
        >
          <div style={{ fontSize: 12, letterSpacing: '0.22em', opacity: 0.56 }}>
            AUDIENCE
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 6vw, 76px)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              overflowWrap: 'break-word'
            }}
          >
            Who is it for
          </h2>
          <p
            style={{
              margin: '4px 0 2px',
              color: darkTheme.colors.secondary,
              fontSize: 'clamp(16px, 1.4vw, 24px)',
              lineHeight: 1.45
            }}
          >
            Qodeq is suitable for:
          </p>
          <div style={{ display: 'grid', gap: '14px', marginTop: '8px' }}>
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={step.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 16,
                    padding: isNarrow ? '14px 14px' : '16px 18px',
                    borderColor: isActive ? darkTheme.colors.accent : darkTheme.colors.border,
                    background: isActive ? darkTheme.colors.hover : darkTheme.colors.surface,
                    opacity: isActive ? 1 : 0.52,
                    transform: `translateX(${isActive ? 0 : -8}px)`,
                    transition: 'all 320ms ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.62 }}>
                    {step.id}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 'clamp(16px, 3.8vw, 26px)',
                      textTransform: 'uppercase',
                      letterSpacing: isNarrow ? '0.06em' : '0.11em',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className={`story-col-right ${introVisible ? 'is-visible' : ''}`}
          style={{ ...rightColumnStyle, minWidth: 0 }}
        >
          <div style={cardStackResponsive}>
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={step.id}
                  style={{
                    ...visualCardResponsive,
                    position: 'absolute',
                    inset: 0,
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? 'translateY(0px) scale(1)'
                      : 'translateY(24px) scale(0.97)',
                    filter: isActive ? 'blur(0px)' : 'blur(4px)',
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition:
                      'opacity 480ms ease, transform 560ms cubic-bezier(0.2, 0.9, 0.2, 1), filter 420ms ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.58 }}>
                      STEP {step.id}
                    </div>
                    <h3
                      style={{
                        margin: '14px 0 12px',
                        fontSize: 'clamp(24px, 3.6vw, 44px)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 300
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        maxWidth: 560,
                        color: darkTheme.colors.secondary,
                        lineHeight: 1.7,
                        fontSize: 'clamp(15px, 1.5vw, 20px)'
                      }}
                    >
                      {step.text}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                      gap: 10
                    }}
                  >
                    {steps.map((lineStep, lineIndex) => (
                      <div
                        key={`${step.id}-${lineStep.id}`}
                        style={{
                          height: 4,
                          borderRadius: 999,
                          background:
                            lineIndex <= index
                              ? darkTheme.colors.accent
                              : darkTheme.colors.divider,
                          boxShadow:
                            lineIndex <= index
                              ? '0 0 12px rgba(16,163,127,0.32)'
                              : 'none',
                          transition: 'all 280ms ease'
                        }}
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <style>
        {`
          .story-intro-animate {
            opacity: 0;
            transform: translateY(34px) scale(0.985);
            filter: blur(8px);
            clip-path: polygon(0 16%, 100% 0, 100% 100%, 0 100%);
            transition: opacity 980ms ease-out, transform 1150ms cubic-bezier(0.22, 1, 0.36, 1), filter 980ms ease-out, clip-path 1150ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .story-intro-animate.is-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          .story-col-left,
          .story-col-right {
            opacity: 0;
            transition: opacity 860ms ease-out, transform 1060ms cubic-bezier(0.22, 1, 0.36, 1), filter 860ms ease-out;
          }
          .story-col-left {
            transform: translateX(-20px);
            filter: blur(4px);
          }
          .story-col-right {
            transform: translateX(22px) scale(0.99);
            filter: blur(5px);
          }
          .story-col-left.is-visible,
          .story-col-right.is-visible {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
          .story-col-left.is-visible {
            transition-delay: 170ms;
          }
          .story-col-right.is-visible {
            transition-delay: 280ms;
          }
        `}
      </style>
    </section>
  );
};
