import { useEffect, useState } from 'react';
import { VoxelHeroTitle } from 'components/VoxelHeroTitle';

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

const containerStyle = {
  width: '100%',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: darkTheme.colors.background,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  padding: 'max(16px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))'
};

const anchorNavWrapStyle = {
  position: 'fixed',
  top: '50%',
  left: '28px',
  transform: 'translateY(-50%)',
  display: 'block',
  pointerEvents: 'auto',
  zIndex: 30,
  padding: '0',
  border: 'none',
  background: 'transparent',
  backdropFilter: 'none',
  clipPath: 'none'
};

const anchorRailStyle = {
  position: 'relative',
  width: '2px',
  height: '430px',
  marginLeft: '10px',
  background: darkTheme.colors.divider,
  borderRadius: '999px'
};

const subtitleStyle = {
  margin: 0,
  marginTop: 'clamp(12px, 2.5vh, 28px)',
  fontSize: 'clamp(10px, 1.1vw, 13px)',
  fontWeight: 400,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  opacity: 0.72,
  color: darkTheme.colors.secondary,
  textAlign: 'center',
  maxWidth: 'min(92vw, 520px)'
};

const buttonStyle = {
  border: `1px solid ${darkTheme.colors.border}`,
  borderRadius: '0',
  background: `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`,
  color: darkTheme.colors.primary,
  padding: '10px 28px',
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  pointerEvents: 'auto',
  position: 'relative',
  clipPath: 'polygon(9% 0, 100% 0, 91% 100%, 0 100%)',
  overflow: 'hidden',
  marginTop: 'clamp(20px, 3.5vh, 40px)',
  transition: 'transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease'
};

const anchors = [
  { id: 'hero-main', label: 'Hero' },
  { id: 'reveal-blocks', label: 'Blocks' },
  { id: 'horizontal-flow', label: 'Flow' },
  { id: 'automation-stats', label: 'Stats' },
  { id: 'story-steps', label: 'Story' },
  { id: 'dotted-flow', label: 'Dotted' },
  { id: 'terminal-echo', label: 'Feedback' }
];

export const LiquidHeroScene = () => {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth || 1440 : 1440
  );
  const [activeAnchor, setActiveAnchor] = useState('hero-main');
  const [hoveredAnchor, setHoveredAnchor] = useState('');
  const [isButtonHover, setIsButtonHover] = useState(false);
  const [entered, setEntered] = useState(false);
  const isTablet = viewportWidth <= 1200;
  const isMobile = viewportWidth <= 900;
  const isSmallMobile = viewportWidth <= 640;
  const isTinyMobile = viewportWidth <= 400;

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const updateActiveAnchor = () => {
      const viewportHeight = window.innerHeight || 1;
      const docEl = document.documentElement;
      const maxScrollY = Math.max(0, docEl.scrollHeight - viewportHeight);
      const scrollY = window.scrollY ?? docEl.scrollTop ?? 0;

      const lastAnchor = anchors[anchors.length - 1];
      const lastNode = document.getElementById(lastAnchor.id);
      if (lastNode && maxScrollY > 0 && scrollY >= maxScrollY - 3) {
        const lastRect = lastNode.getBoundingClientRect();
        if (lastRect.bottom > 0 && lastRect.top < viewportHeight) {
          setActiveAnchor(lastAnchor.id);
          return;
        }
      }

      const activationY = viewportHeight * 0.5;
      let currentId = anchors[0].id;
      anchors.forEach((anchor) => {
        const node = document.getElementById(anchor.id);
        if (!node) {
          return;
        }
        const rect = node.getBoundingClientRect();
        if (rect.top <= activationY) {
          currentId = anchor.id;
        }
      });

      setActiveAnchor(currentId);
    };

    updateActiveAnchor();
    window.addEventListener('scroll', updateActiveAnchor, { passive: true });
    window.addEventListener('resize', updateActiveAnchor);
    return () => {
      window.removeEventListener('scroll', updateActiveAnchor);
      window.removeEventListener('resize', updateActiveAnchor);
    };
  }, []);

  const scrollToAnchor = (targetId) => {
    const node = document.getElementById(targetId);
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 1440);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const heroTextMul = isMobile ? 1 : Math.min(1, Math.max(0.62, 0.62 + 0.38 * ((viewportWidth - 520) / (2720 - 520))));

  return (
    <main id="hero-main" style={containerStyle}>
      <nav
        style={{
          ...anchorNavWrapStyle,
          left: isTablet ? (isMobile ? '14px' : '20px') : anchorNavWrapStyle.left,
          opacity: isMobile ? 0 : 1,
          pointerEvents: isMobile ? 'none' : 'auto'
        }}
      >
        <div style={anchorRailStyle}>
          {anchors.map((anchor, index) => {
            const isActive = activeAnchor === anchor.id;
            const isHovered = hoveredAnchor === anchor.id;
            const topPercent = anchors.length > 1 ? (index / (anchors.length - 1)) * 100 : 0;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToAnchor(anchor.id)}
                onMouseEnter={() => setHoveredAnchor(anchor.id)}
                onMouseLeave={() => setHoveredAnchor('')}
                style={{
                  position: 'absolute',
                  top: `${topPercent}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                  borderRadius: '50%',
                  border: `1px solid ${darkTheme.colors.border}`,
                  background: isActive
                    ? darkTheme.colors.accent
                    : isHovered
                      ? darkTheme.colors.secondary
                      : darkTheme.colors.muted,
                  boxShadow:
                    isActive || isHovered ? '0 0 16px rgba(255,255,255,0.35)' : '0 0 0 rgba(0,0,0,0)',
                  cursor: 'pointer',
                  transition: 'all 220ms ease',
                  padding: 0
                }}
                aria-label={anchor.label}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '50%',
                    transform: isHovered
                      ? 'translateY(-50%) translateX(0)'
                      : 'translateY(-50%) translateX(-8px)',
                    color: darkTheme.colors.primary,
                    fontSize: `${Math.max(11, Math.round(14 * heroTextMul))}px`,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    opacity: isHovered ? 0.95 : 0,
                    filter: isHovered ? 'blur(0px)' : 'blur(4px)',
                    textShadow: isHovered ? '0 0 12px rgba(16,163,127,0.45)' : '0 0 0 rgba(0,0,0,0)',
                    transition:
                      'opacity 260ms ease, transform 340ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease, text-shadow 260ms ease',
                    pointerEvents: 'none'
                  }}
                >
                  {anchor.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
          width: '100%',
          maxWidth: '100%',
          textAlign: 'center',
          fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
          color: darkTheme.colors.primary
        }}
      >
        <h1
          style={{
            margin: 0,
            padding: 0,
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span className="sr-only">QODEQ</span>
          <VoxelHeroTitle
            entered={entered}
            isTinyMobile={isTinyMobile}
            isSmallMobile={isSmallMobile}
            isMobile={isMobile}
            colors={darkTheme.colors}
          />
        </h1>
        <p
          style={{
            ...subtitleStyle,
            opacity: entered ? subtitleStyle.opacity : 0,
            transform: entered ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 780ms ease 1100ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 1100ms'
          }}
        >
          Qodeq - AI platform automating operations in iGaming
        </p>
        <button
          onMouseEnter={() => setIsButtonHover(true)}
          onMouseLeave={() => setIsButtonHover(false)}
          type="button"
          style={{
            ...buttonStyle,
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(22px)',
            transition:
              'opacity 680ms ease 1400ms, transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 1400ms, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease',
            fontSize: isMobile
              ? isTinyMobile
                ? '9px'
                : isSmallMobile
                  ? '9.5px'
                  : '10.25px'
              : `${Math.max(9, Math.round(11 * heroTextMul))}px`,
            padding: isMobile
              ? isTinyMobile
                ? '8px 18px'
                : isSmallMobile
                  ? '8px 20px'
                  : '9px 22px'
              : `${Math.round(10 * heroTextMul)}px ${Math.round(26 * heroTextMul)}px`,
            boxShadow: isButtonHover ? '0 0 24px rgba(16,163,127,0.28)' : '0 0 0 rgba(0,0,0,0)',
            borderColor: isButtonHover ? darkTheme.colors.accentHover : darkTheme.colors.border,
            background: isButtonHover
              ? `linear-gradient(135deg, ${darkTheme.colors.accentHover}, ${darkTheme.colors.hover})`
              : `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 14,
              height: 14,
              borderTop: `1px solid ${darkTheme.colors.secondary}`,
              borderLeft: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 14,
              height: 14,
              borderRight: `1px solid ${darkTheme.colors.secondary}`,
              borderBottom: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          Join the abyss
        </button>
      </div>
    </main>
  );
};
