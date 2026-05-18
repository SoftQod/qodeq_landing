import { botsPanels } from 'data/botsPanels';
import { heroTheme as theme } from 'theme/qodeqColors';

const cardStyle = {
  padding: 'clamp(28px, 4vw, 40px)',
  borderRadius: 4,
  border: `1px solid ${theme.border}`,
  background: `linear-gradient(145deg, #1A1A1A 0%, rgba(28, 28, 28, 0.97) 55%, rgba(16, 163, 127, 0.08) 100%)`,
  boxSizing: 'border-box'
};

export const BotsGridSection = () => {
  return (
    <section
      style={{
        maxWidth: 'min(1180px, calc(100% - 48px))',
        margin: '0 auto',
        padding: 'clamp(32px, 6vh, 64px) clamp(20px, 4vw, 36px) clamp(48px, 8vh, 80px)',
        boxSizing: 'border-box'
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: theme.muted
        }}
      >
        QODEQ Bots
      </p>
      <h1
        style={{
          margin: '0 0 clamp(32px, 5vh, 48px)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: theme.primary
        }}
      >
        AI automation for iGaming
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(20px, 3vw, 28px)'
        }}
      >
        {botsPanels.map((bot) => (
          <article key={bot.id} id={`bot-${bot.slug}`} style={cardStyle}>
            <span
              style={{
                display: 'block',
                marginBottom: 12,
                fontSize: 10,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: theme.accent
              }}
            >
              {bot.id}
            </span>
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: theme.primary
              }}
            >
              {bot.title}
            </h2>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                lineHeight: 1.65,
                color: theme.secondary,
                whiteSpace: 'pre-line'
              }}
            >
              {bot.text}
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px 12px'
              }}
            >
              {bot.highlights.map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                    padding: '6px 12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 999
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
