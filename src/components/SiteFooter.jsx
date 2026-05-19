import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TbBrandGithub, TbBrandLinkedin, TbBrandTelegram, TbMail } from 'react-icons/tb';

const theme = {
  bg: '#0D0D0D',
  text: '#ECECEC',
  muted: '#8E8E8E',
  border: '#2D2D2D',
  accent: '#10A37F',
  accentHover: '#0E8C6F'
};

const FOOTER_LINKS = [
  { id: 'hero-main', label: 'Hero' },
  { id: 'reveal-blocks', label: 'Blocks' },
  { id: 'horizontal-flow', label: 'Bots flow' },
  { id: 'bots', label: 'Bots', path: '/bots' },
  { id: 'automation-stats', label: 'Stats' },
  { id: 'story-steps', label: 'Story' },
  { id: 'dotted-flow', label: 'Dotted' },
  { id: 'terminal-echo', label: 'Feedback' }
];

const CONTACT_EMAIL = 'hello@qodeq.com';

/** Иконки + внешние URL — замени на боевые адреса компании. */
const FOOTER_ICON_LINKS = [
  { href: `mailto:${CONTACT_EMAIL}`, label: 'Email', icon: 'mail', external: false },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', icon: 'linkedin', external: true },
  { href: 'https://t.me/', label: 'Telegram', icon: 'telegram', external: true },
  { href: 'https://github.com/', label: 'GitHub', icon: 'github', external: true }
];

/** Текстовые ссылки (privacy, docs…) — href пока заглушки. */
const FOOTER_EXTRA_LINKS = [
  { href: '#', label: 'Privacy' },
  { href: '#', label: 'Terms' },
  { href: '#', label: 'Documentation' }
];

const accentRuleStyle = {
  height: '3px',
  width: '100%',
  background: `linear-gradient(90deg, transparent 0%, ${theme.accent} 28%, ${theme.accent} 72%, transparent 100%)`,
  opacity: 0.88
};

const FOOTER_ICON_COMPONENTS = {
  mail: TbMail,
  linkedin: TbBrandLinkedin,
  telegram: TbBrandTelegram,
  github: TbBrandGithub
};

/** Колонка футера: на всю высоту строки сетки, контент по центру по вертикали. */
const footerColumnShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box'
};

function FooterSocialIcon({ name }) {
  const Icon = FOOTER_ICON_COMPONENTS[name];
  if (!Icon) {
    return null;
  }
  return <Icon aria-hidden size={22} style={{ display: 'block', flexShrink: 0 }} />;
}

export const SiteFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToId = (targetId) => {
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: `#${targetId}` });
      return;
    }
    const node = document.getElementById(targetId);
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onFooterLink = (item, e) => {
    if (item.path) {
      return;
    }
    e.preventDefault();
    scrollToId(item.id);
  };

  const resetIconBtn = (el) => {
    el.style.color = theme.muted;
    el.style.borderColor = theme.border;
    el.style.boxShadow = 'none';
    el.style.background = 'transparent';
  };

  const hoverIconBtn = (el) => {
    el.style.color = theme.accent;
    el.style.borderColor = `${theme.accent}66`;
    el.style.boxShadow = `0 0 28px rgba(16, 163, 127, 0.18)`;
    el.style.background = 'rgba(16, 163, 127, 0.06)';
  };

  return (
    <footer
      className="site-footer-root"
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        padding: '0 clamp(14px, 4vw, 56px) clamp(20px, 3vw, 32px)',
        marginTop: 'auto',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        .site-footer-root * {
          box-sizing: border-box;
        }
        @media (max-width: 720px) {
          .site-footer-main-grid {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: clamp(28px, 7vw, 40px) !important;
            padding-left: max(12px, env(safe-area-inset-left)) !important;
            padding-right: max(12px, env(safe-area-inset-right)) !important;
          }
          .site-footer-brand-title {
            letter-spacing: clamp(0.18em, 3vw, 0.32em) !important;
          }
          .site-footer-legal-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .site-footer-legal-cluster {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .site-footer-mail {
            max-width: 100%;
            overflow-wrap: anywhere;
          }
        }
      `}</style>
      <div style={accentRuleStyle} aria-hidden="true" />

      <div
        className="site-footer-main-grid"
        style={{
          margin: '0 auto',
          width: 'min(1100px, 100%)',
          maxWidth: '100%',
          minWidth: 0,
          paddingTop: 'clamp(48px, 6.5vw, 80px)',
          paddingLeft: 'clamp(12px, 3vw, 24px)',
          paddingRight: 'clamp(12px, 3vw, 24px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 'clamp(36px, 6vw, 72px)',
          alignItems: 'stretch',
          justifyItems: 'stretch',
          textAlign: 'center'
        }}
      >
        <div style={footerColumnShellStyle}>
          <div style={{ maxWidth: '36rem', width: '100%', minWidth: 0 }}>
          <p
            className="site-footer-brand-title"
            style={{
              margin: 0,
              fontSize: 'clamp(18px, 4.5vw, 28px)',
              fontWeight: 300,
              letterSpacing: 'clamp(0.22em, 3.5vw, 0.42em)',
              textTransform: 'uppercase',
              color: theme.text,
              overflowWrap: 'break-word'
            }}
          >
            QODEQ
          </p>
          <p
            style={{
              margin: '18px auto 0',
              maxWidth: '36rem',
              width: '100%',
              fontSize: 'clamp(13px, 1.15vw, 15px)',
              lineHeight: 1.65,
              color: theme.muted,
              fontWeight: 400,
              overflowWrap: 'break-word'
            }}
          >
            AI platform automating operations in iGaming — product-aligned experience.
          </p>
          </div>
        </div>

        <div style={footerColumnShellStyle}>
        <nav aria-label="Section shortcuts" style={{ width: '100%', maxWidth: '520px', minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 18px',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: theme.muted
            }}
          >
            On this page
          </p>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '14px 22px'
            }}
          >
            {FOOTER_LINKS.map((item) => {
              const linkStyle = {
                fontSize: 'clamp(12px, 1vw, 13px)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: theme.muted,
                textDecoration: 'none',
                borderBottom: '1px solid transparent',
                paddingBottom: 2,
                transition: 'color 180ms ease, border-color 180ms ease'
              };
              const hoverHandlers = {
                onMouseEnter: (e) => {
                  e.currentTarget.style.color = theme.accent;
                  e.currentTarget.style.borderBottomColor = `${theme.accent}66`;
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.color = theme.muted;
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              };

              return (
                <li key={item.id}>
                  {item.path ? (
                    <Link to={item.path} style={linkStyle} {...hoverHandlers}>
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => onFooterLink(item, e)}
                      style={linkStyle}
                      {...hoverHandlers}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        </div>

        <div style={footerColumnShellStyle}>
        <nav aria-label="Social links" style={{ width: '100%', maxWidth: '420px', minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: theme.muted
            }}
          >
            Connect
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center'
            }}
          >
            {FOOTER_ICON_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  textDecoration: 'none',
                  transition: 'color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease'
                }}
                onMouseEnter={(e) => hoverIconBtn(e.currentTarget)}
                onMouseLeave={(e) => resetIconBtn(e.currentTarget)}
              >
                <FooterSocialIcon name={item.icon} />
              </a>
            ))}
          </div>
        </nav>
        </div>
      </div>

      <div
        className="site-footer-legal-row"
        style={{
          margin: 'clamp(48px, 7vw, 88px) auto 0',
          width: 'min(1100px, 100%)',
          maxWidth: '100%',
          minWidth: 0,
          paddingLeft: 'clamp(12px, 3vw, 24px)',
          paddingRight: 'clamp(12px, 3vw, 24px)',
          paddingTop: 'clamp(26px, 3.5vw, 36px)',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '14px 24px',
          boxSizing: 'border-box'
        }}
      >
        <div
          className="site-footer-legal-cluster"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px 14px',
            maxWidth: '100%',
            minWidth: 0
          }}
        >
          <p style={{ margin: 0, fontSize: 'clamp(11px, 1vw, 12px)', letterSpacing: '0.06em', color: theme.muted }}>
            © {new Date().getFullYear()} QODEQ. All rights reserved.
          </p>
          <span style={{ color: theme.border, fontSize: 11, userSelect: 'none', lineHeight: 1 }} aria-hidden="true">
            ·
          </span>
          <nav
            aria-label="Resources"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px 6px'
            }}
          >
            {FOOTER_EXTRA_LINKS.map((item, i) => (
              <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {i > 0 ? (
                  <span style={{ color: theme.border, fontSize: 11, userSelect: 'none', lineHeight: 1 }} aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <a
                  href={item.href}
                  style={{
                    fontSize: 'clamp(11px, 1vw, 12px)',
                    letterSpacing: '0.08em',
                    color: theme.muted,
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    paddingBottom: 2,
                    transition: 'color 180ms ease, border-color 180ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.accent;
                    e.currentTarget.style.borderBottomColor = `${theme.accent}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.muted;
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  {item.label}
                </a>
              </span>
            ))}
          </nav>
        </div>
        <a
          className="site-footer-mail"
          href={`mailto:${CONTACT_EMAIL}`}
          style={{
            fontSize: 'clamp(11px, 1vw, 12px)',
            letterSpacing: '0.12em',
            color: theme.accent,
            textDecoration: 'none',
            transition: 'color 180ms ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.accentHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.accent;
          }}
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
};
