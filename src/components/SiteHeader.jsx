import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { heroTheme as theme } from 'theme/qodeqColors';

const navItems = [
  { label: 'Home', type: 'route', to: '/' },
  { label: 'Bots', type: 'route', to: '/bots' },
  { label: 'Platform', type: 'section', id: 'reveal-blocks' },
  { label: 'Contact', type: 'section', id: 'terminal-echo' }
];

export const SiteHeader = ({
  activeSection = '',
  isMobile = false,
  pad,
  position = 'absolute',
  fadeStyle = {},
  enlarged = false,
  uiScale: enlargedUiScale = 1
}) => {
  const uiScale = enlarged ? enlargedUiScale : 1;
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const goSection = (id) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate({ pathname: '/', hash: `#${id}` });
  };

  const isActive = (item) => {
    if (item.type === 'route' && item.to === '/bots') {
      return pathname === '/bots';
    }
    if (item.type === 'route' && item.to === '/') {
      return pathname === '/' && (activeSection === 'hero-main' || !activeSection);
    }
    if (item.type === 'section') {
      return pathname === '/' && activeSection === item.id;
    }
    return false;
  };

  const linkStyle = (active, hovered) => ({
    margin: 0,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: (isMobile ? 10 : 11) * uiScale,
    fontWeight: 400,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: active || hovered ? theme.primary : theme.muted,
    transition: 'color 220ms ease',
    fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
  });

  return (
    <header
      style={{
        position,
        top: position === 'absolute' ? 0 : undefined,
        left: 0,
        right: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: pad,
        boxSizing: 'border-box',
        gap: 16,
        background: position === 'sticky' ? theme.bg : 'transparent',
        ...fadeStyle
      }}
    >
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: isMobile ? `${18 * uiScale}px ${22 * uiScale}px` : `${32 * uiScale}px ${40 * uiScale}px`
        }}
        aria-label="Main"
      >
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} isActive={isActive(item)} linkStyle={linkStyle} goSection={goSection} />
        ))}
      </nav>

      <button
        type="button"
        onClick={() => goSection('terminal-echo')}
        style={{
          flexShrink: 0,
          margin: 0,
          padding: isMobile
            ? `${10 * uiScale}px ${20 * uiScale}px`
            : `${12 * uiScale}px ${28 * uiScale}px`,
          borderRadius: '999px',
          border: `1px solid ${theme.border}`,
          background: 'transparent',
          color: theme.primary,
          fontSize: (isMobile ? 10 : 11) * uiScale,
          fontWeight: 400,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'border-color 220ms ease, background 220ms ease',
          fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
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
  );
};

function NavItem({ item, isActive, linkStyle, goSection }) {
  const [hovered, setHovered] = useState(false);

  if (item.type === 'route') {
    return (
      <Link
        to={item.to}
        style={linkStyle(isActive, hovered)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => goSection(item.id)}
      style={linkStyle(isActive, hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.label}
    </button>
  );
}
