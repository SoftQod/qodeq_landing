import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSpline } from 'components/HeroSpline';
import { SiteHeader } from 'components/SiteHeader';
import { heroEnterStyle, HERO_PART } from 'components/heroEnterStyle';
import {
  getHeroBottomBlockScale,
  getHeroProportionalScale,
  HERO_CORNER_BOOST,
  HERO_CUBE_FOCUS,
  HERO_DOT_ALPHA,
  heroTheme as theme,
  landingPagePad,
  qodeqRgba
} from 'theme/qodeqColors';

const tags = ['CHATBOT', 'CALL CENTER', 'PAYMENT', 'QA', 'AUTOMATION'];

export const LiquidHeroScene = () => {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth || 1440 : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight || 900 : 900
  }));
  const viewportWidth = viewport.width;
  const [activeSection, setActiveSection] = useState('hero-main');
  const navigate = useNavigate();
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [splineReady, setSplineReady] = useState(false);
  const isMobile = viewportWidth <= 900;

  useEffect(() => {
    const t = window.requestAnimationFrame(() => setUiVisible(true));
    return () => window.cancelAnimationFrame(t);
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
    const onResize = () => {
      setViewport({
        width: window.innerWidth || 1440,
        height: window.innerHeight || 900
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pad = landingPagePad(isMobile);
  const heroScale = getHeroProportionalScale(viewport.width, viewport.height, isMobile);
  const cornerScale = getHeroBottomBlockScale(viewport.width, viewport.height, isMobile);
  const headerScale = getHeroProportionalScale(viewport.width, viewport.height, isMobile) * HERO_CORNER_BOOST;

  const cubeFocusX = HERO_CUBE_FOCUS.x;
  const cubeFocusY = HERO_CUBE_FOCUS.y;

  const enter = (order, visible = uiVisible) => heroEnterStyle(visible, order);

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
            radial-gradient(circle at center, rgba(16, 163, 127, ${HERO_DOT_ALPHA}) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          backgroundPosition: `${cubeFocusX} ${cubeFocusY}`,
          ...enter(HERO_PART.bgDots)
        }}
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, ...enter(HERO_PART.spline, uiVisible && splineReady) }}>
        <HeroSpline onReady={() => setSplineReady(true)} />
      </div>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 85% 70% at ${cubeFocusX} ${cubeFocusY}, transparent 50%, ${qodeqRgba(0.28)} 100%)`,
          ...enter(HERO_PART.vignette)
        }}
      />

      <SiteHeader
        activeSection={activeSection}
        isMobile={isMobile}
        pad={pad}
        position="absolute"
        fadeStyle={enter(HERO_PART.header)}
        enlarged
        uiScale={headerScale}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
          width: '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          justifyContent: 'space-between',
          gap: (isMobile ? 24 : 32) * heroScale,
          padding: pad,
          paddingTop: (isMobile ? 78 : 92) * heroScale,
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            pointerEvents: 'none',
            maxWidth: isMobile ? '100%' : '52%'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile
                ? `clamp(${2.4 * heroScale}rem, ${12 * heroScale}vw, ${3.2 * heroScale}rem)`
                : `clamp(${3 * heroScale}rem, ${6.8 * heroScale}vw, ${5.5 * heroScale}rem)`,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              textTransform: 'none',
              color: theme.primary,
              ...enter(HERO_PART.title)
            }}
          >
            <span style={{ display: 'block' }}>QODEQ</span>
            <span style={{ display: 'block', marginTop: '0.06em' }}>AI Platform</span>
          </h1>
          <p
            style={{
              margin: `${18 * heroScale}px 0 0`,
              fontSize: isMobile
                ? (9 * cornerScale)
                : `clamp(7px, ${0.52 * cornerScale}vw, ${10 * cornerScale}px)`,
              fontWeight: 400,
              letterSpacing: isMobile ? '0.16em' : '0.18em',
              textTransform: 'uppercase',
              color: theme.secondary,
              lineHeight: 1.5,
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              ...enter(HERO_PART.tags)
            }}
          >
            {tags.join('  \\  ')}
          </p>
        </div>

        <div
          style={{
            pointerEvents: 'none',
            maxWidth: isMobile ? '100%' : 340 * cornerScale,
            marginLeft: isMobile ? 0 : 'auto',
            textAlign: isMobile ? 'left' : 'right'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: isMobile
                ? 11 * cornerScale
                : `clamp(9px, ${0.62 * cornerScale}vw, ${12 * cornerScale}px)`,
              lineHeight: 1.5,
              fontStyle: 'italic',
              color: theme.secondary,
              maxWidth: isMobile ? '100%' : 380 * cornerScale,
              marginLeft: isMobile ? 0 : 'auto',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              ...enter(HERO_PART.description)
            }}
          >
            Qodeq — AI platform automating operations in iGaming
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: 10 * cornerScale,
              marginTop: 22 * cornerScale,
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              pointerEvents: 'auto',
              ...enter(HERO_PART.actions)
            }}
          >
            <PillButton
              label="Contact Us"
              onClick={() => scrollTo('terminal-echo')}
              hover={hoverPrimary}
              onEnter={() => setHoverPrimary(true)}
              onLeave={() => setHoverPrimary(false)}
              isMobile={isMobile}
              scale={cornerScale}
            />
            <PillButton
              label="Get Started"
              showPlus
              accent
              onClick={() => navigate('/bots')}
              hover={hoverSecondary}
              onEnter={() => setHoverSecondary(true)}
              onLeave={() => setHoverSecondary(false)}
              isMobile={isMobile}
              scale={cornerScale}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

function PillButton({ label, onClick, hover, onEnter, onLeave, isMobile, showPlus, accent, scale = 1 }) {
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
        paddingLeft: (isMobile ? 18 : 22) * scale,
        paddingRight: showPlus ? (isMobile ? 6 : 8) * scale : (isMobile ? 18 : 22) * scale,
        paddingTop: (isMobile ? 6 : 7) * scale,
        paddingBottom: (isMobile ? 6 : 7) * scale,
        borderRadius: '999px',
        border: `1px solid ${hover ? theme.borderHover : theme.border}`,
        background: hover ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: theme.primary,
        fontSize: (isMobile ? 10 : 11) * scale,
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
            width: (isMobile ? 26 : 28) * scale,
            height: (isMobile ? 26 : 28) * scale,
            marginLeft: (isMobile ? 6 : 8) * scale,
            borderRadius: '50%',
            background: theme.accent,
            color: theme.bg,
            fontSize: 15 * scale,
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
