import { useEffect, useState } from 'react';
import { HeroSpline } from 'components/HeroSpline';
import { HERO_CUBE_FOCUS, heroTheme as theme, qodeqRgba } from 'theme/qodeqColors';

const topNavLinks = [
  { label: 'Home', id: 'hero-main' },
  { label: 'Bots', id: 'horizontal-flow' },
  { label: 'Platform', id: 'reveal-blocks' },
  { label: 'Contact', id: 'terminal-echo' }
];

const tags = ['CHATBOT', 'CALL CENTER', 'PAYMENT', 'QA', 'AUTOMATION'];

export const LiquidHeroScene = () => {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth || 1440 : 1440
  );
  const [activeSection, setActiveSection] = useState('hero-main');
  const [hoverNav, setHoverNav] = useState('');
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const isMobile = viewportWidth <= 900;

  useEffect(() => {
    const t = window.setTimeout(() => setUiVisible(true), 500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const sections = [
      'hero-main',
      'reveal-blocks',
      'horizontal-flow',
      'automation-stats',
      'story-steps',
      'dotted-flow',
      'terminal-echo'
    ];

    const updateActive = () => {
      const vh = window.innerHeight || 1;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

      if (scrollY >= maxScroll - 3) {
        setActiveSection('terminal-echo');
        return;
      }

      const y = vh * 0.45;
      let current = 'hero-main';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= y) {
          current = id;
        }
      });
      setActiveSection(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 1440);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pad = isMobile
    ? 'max(16px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(22px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))'
    : 'max(24px, env(safe-area-inset-top)) max(36px, env(safe-area-inset-right)) max(32px, env(safe-area-inset-bottom)) max(36px, env(safe-area-inset-left))';

  const cubeFocusX = HERO_CUBE_FOCUS.x;
  const cubeFocusY = HERO_CUBE_FOCUS.y;

  const uiFade = (delay = 0) => ({
    opacity: uiVisible ? 1 : 0,
    transform: uiVisible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 700ms ease ${delay}ms, transform 820ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
  });

  return (
    <main
      id="hero-main"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        height: '100dvh',
        overflow: 'hidden',
        background: theme.bg,
        boxSizing: 'border-box',
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        color: theme.primary
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundColor: theme.bg,
          backgroundImage: `
            radial-gradient(circle at center, rgba(16, 163, 127, 0.11) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          backgroundPosition: `${cubeFocusX} ${cubeFocusY}`
        }}
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <HeroSpline />
      </div>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 85% 70% at ${cubeFocusX} ${cubeFocusY}, transparent 50%, ${qodeqRgba(0.28)} 100%)`
        }}
      />

      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: pad,
          paddingRight: isMobile ? undefined : 'clamp(28px, 4vw, 40px)',
          maxWidth: isMobile ? '100%' : 'min(1180px, calc(100% - 48px))',
          margin: isMobile ? 0 : '0 auto',
          boxSizing: 'border-box',
          gap: 16,
          ...uiFade(0)
        }}
      >
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: isMobile ? '18px 22px' : '32px 40px'
          }}
          aria-label="Main"
        >
          {topNavLinks.map((link) => {
            const active = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                onMouseEnter={() => setHoverNav(link.id)}
                onMouseLeave={() => setHoverNav('')}
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 400,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: active || hoverNav === link.id ? theme.primary : theme.muted,
                  transition: 'color 220ms ease'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => scrollTo('terminal-echo')}
          style={{
            flexShrink: 0,
            margin: 0,
            padding: isMobile ? '10px 20px' : '12px 28px',
            borderRadius: '999px',
            border: `1px solid ${theme.border}`,
            background: 'transparent',
            color: theme.primary,
            fontSize: isMobile ? 10 : 11,
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'border-color 220ms ease, background 220ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.borderHover;
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Let&apos;s Talk!
        </button>
      </header>

      <div
        style={{
          position: 'absolute',
          left: isMobile ? 0 : '50%',
          right: isMobile ? 0 : 'auto',
          bottom: 0,
          zIndex: 30,
          width: isMobile ? '100%' : 'min(1180px, calc(100% - 48px))',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          justifyContent: 'space-between',
          gap: isMobile ? 24 : 32,
          padding: pad,
          paddingTop: isMobile ? 72 : 88,
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            pointerEvents: 'none',
            maxWidth: isMobile ? '100%' : '52%',
            paddingRight: isMobile ? 0 : 16,
            ...uiFade(80)
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 'clamp(2.4rem, 12vw, 3.2rem)' : 'clamp(3rem, 6.8vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              textTransform: 'none',
              color: theme.primary
            }}
          >
            <span style={{ display: 'block' }}>QODEQ</span>
            <span style={{ display: 'block', marginTop: '0.06em' }}>AI Platform</span>
          </h1>
          <p
            style={{
              margin: 'clamp(18px, 3vh, 28px) 0 0',
              fontSize: isMobile ? 9 : 10,
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: theme.secondary,
              lineHeight: 1.6
            }}
          >
            {tags.join('  \\  ')}
          </p>
        </div>

        <div
          style={{
            pointerEvents: 'none',
            maxWidth: isMobile ? '100%' : 340,
            marginLeft: isMobile ? 0 : 'auto',
            paddingLeft: isMobile ? 0 : 12,
            textAlign: isMobile ? 'left' : 'right',
            ...uiFade(160)
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? 11 : 12,
              lineHeight: 1.65,
              fontStyle: 'italic',
              color: theme.secondary,
              maxWidth: 340,
              marginLeft: isMobile ? 0 : 'auto'
            }}
          >
            Qodeq — AI platform automating operations in iGaming
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 22,
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              pointerEvents: 'auto'
            }}
          >
            <PillButton
              label="Contact Us"
              onClick={() => scrollTo('terminal-echo')}
              hover={hoverPrimary}
              onEnter={() => setHoverPrimary(true)}
              onLeave={() => setHoverPrimary(false)}
              isMobile={isMobile}
            />
            <PillButton
              label="Get Started"
              showPlus
              accent
              onClick={() => scrollTo('horizontal-flow')}
              hover={hoverSecondary}
              onEnter={() => setHoverSecondary(true)}
              onLeave={() => setHoverSecondary(false)}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

function PillButton({ label, onClick, hover, onEnter, onLeave, isMobile, showPlus, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        margin: 0,
        padding: 0,
        paddingLeft: isMobile ? 18 : 22,
        paddingRight: showPlus ? (isMobile ? 6 : 8) : isMobile ? 18 : 22,
        paddingTop: isMobile ? 10 : 12,
        paddingBottom: isMobile ? 10 : 12,
        borderRadius: '999px',
        border: `1px solid ${hover ? theme.borderHover : theme.border}`,
        background: hover ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: theme.primary,
        fontSize: isMobile ? 10 : 11,
        fontWeight: 400,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'border-color 220ms ease, background 220ms ease, box-shadow 220ms ease',
        boxShadow: hover && accent ? `0 0 20px rgba(16, 163, 127, 0.25)` : 'none'
      }}
    >
      <span>{label}</span>
      {showPlus && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            marginLeft: isMobile ? 8 : 10,
            borderRadius: '50%',
            background: theme.accent,
            color: theme.bg,
            fontSize: 18,
            fontWeight: 300,
            lineHeight: 1,
            flexShrink: 0
          }}
          aria-hidden
        >
          +
        </span>
      )}
    </button>
  );
}
