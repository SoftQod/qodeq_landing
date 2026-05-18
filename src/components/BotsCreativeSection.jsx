import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { botsPanels, getBotBySlug, parseBotSlugFromHash } from 'data/botsPanels';
import { heroTheme as theme, qodeqRgba } from 'theme/qodeqColors';

const SKEW = 18;

function useViewport() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  useEffect(() => {
    const onResize = () => setW(window.innerWidth || 1440);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { isMobile: w <= 900, isCompact: w <= 1100 };
}

function BotsLauncherMenu({ onSelect }) {
  const { isMobile, isCompact } = useViewport();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: isMobile ? 'calc(100dvh - 72px)' : 'calc(100dvh - 88px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '24px 16px 40px' : '32px clamp(24px, 4vw, 48px) 48px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at center, rgba(16, 163, 127, 0.08) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none'
        }}
      />

      <p
        style={{
          position: 'relative',
          margin: '0 0 clamp(20px, 4vh, 36px)',
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: theme.muted
        }}
      >
        QODEQ — choose a module
      </p>

      <motion.div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 14 : isCompact ? 16 : 20,
          flex: 1,
          alignContent: 'center',
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto'
        }}
      >
        {botsPanels.map((bot, index) => (
          <motion.button
            key={bot.slug}
            type="button"
            onClick={() => onSelect(bot.slug)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.985 }}
            style={{
              position: 'relative',
              margin: 0,
              minHeight: isMobile ? 132 : isCompact ? 200 : 'min(38vh, 320px)',
              padding: isMobile ? '28px 24px' : 'clamp(36px, 5vh, 52px) clamp(32px, 4vw, 48px)',
              border: `1px solid ${theme.border}`,
              background: `linear-gradient(145deg, ${bot.color}12 0%, #141414 45%, ${qodeqRgba(0.95)} 100%)`,
              clipPath: `polygon(${SKEW}px 0, 100% 0, calc(100% - ${SKEW}px) 100%, 0 100%)`,
              WebkitClipPath: `polygon(${SKEW}px 0, 100% 0, calc(100% - ${SKEW}px) 100%, 0 100%)`,
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <motion.div
              aria-hidden
              style={{
                position: 'absolute',
                right: -20,
                bottom: -30,
                fontSize: isMobile ? '5rem' : 'clamp(5rem, 14vw, 9rem)',
                fontWeight: 800,
                lineHeight: 1,
                color: `${bot.color}10`,
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              {bot.id}
            </motion.div>

            <span
              style={{
                display: 'block',
                fontSize: isMobile ? 10 : 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: bot.color,
                marginBottom: 12
              }}
            >
              {bot.id}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: isMobile ? 'clamp(1.35rem, 6vw, 1.75rem)' : 'clamp(1.6rem, 3.2vw, 2.4rem)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: theme.primary,
                lineHeight: 1.05,
                maxWidth: '14ch'
              }}
            >
              {bot.title}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: isMobile ? 16 : 24,
                fontSize: isMobile ? 10 : 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: theme.muted
              }}
            >
              Open module →
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

function SectionBlock({ section, bot, isMobile }) {
  if (section.type === 'hero') {
    return (
      <header
        style={{
          padding: isMobile ? '48px 0 40px' : '72px 0 56px',
          borderBottom: `1px solid ${bot.color}33`
        }}
      >
        <p style={{ margin: '0 0 12px', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: bot.color }}>
          {section.eyebrow}
        </p>
        <h1
          style={{
            margin: '0 0 20px',
            fontSize: isMobile ? 'clamp(2rem, 9vw, 2.75rem)' : 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: theme.primary,
            maxWidth: 900
          }}
        >
          {section.title}
        </h1>
        <p style={{ margin: 0, fontSize: isMobile ? 15 : 18, lineHeight: 1.65, color: theme.secondary, maxWidth: 720 }}>
          {section.lead}
        </p>
      </header>
    );
  }

  if (section.type === 'text') {
    return (
      <section style={{ padding: isMobile ? '40px 0' : '56px 0', maxWidth: 820 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: isMobile ? 13 : 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: bot.color }}>
          {section.title}
        </h2>
        <p style={{ margin: 0, fontSize: isMobile ? 14 : 16, lineHeight: 1.75, color: theme.secondary, whiteSpace: 'pre-line' }}>
          {section.body}
        </p>
      </section>
    );
  }

  if (section.type === 'stats') {
    return (
      <section style={{ padding: isMobile ? '32px 0' : '48px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 12 : 16
          }}
        >
          {section.items.map((item) => (
            <motion.div
              key={item.label}
              style={{
                padding: isMobile ? '16px 14px' : '20px 18px',
                border: `1px solid ${bot.color}33`,
                background: `${bot.color}08`
              }}
            >
              <span style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.muted, marginBottom: 8 }}>
                {item.label}
              </span>
              <span style={{ display: 'block', fontSize: isMobile ? 18 : 22, fontWeight: 600, color: theme.primary }}>
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'list') {
    return (
      <section style={{ padding: isMobile ? '40px 0' : '56px 0' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: isMobile ? 13 : 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: bot.color }}>
          {section.title}
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 900 }}>
          {section.items.map((item) => (
            <li
              key={item}
              style={{
                paddingLeft: 20,
                borderLeft: `2px solid ${bot.color}55`,
                fontSize: isMobile ? 14 : 15,
                lineHeight: 1.6,
                color: theme.secondary
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (section.type === 'grid') {
    return (
      <section style={{ padding: isMobile ? '40px 0' : '56px 0' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: isMobile ? 13 : 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: bot.color }}>
          {section.title}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 14 : 18
          }}
        >
          {section.cards.map((card) => (
            <article
              key={card.title}
              style={{
                padding: isMobile ? '22px 20px' : '28px 24px',
                border: `1px solid ${theme.border}`,
                background: `linear-gradient(160deg, ${bot.color}0c, ${qodeqRgba(0.9)})`
              }}
            >
              <h3 style={{ margin: '0 0 10px', fontSize: isMobile ? 14 : 16, fontWeight: 600, color: theme.primary }}>
                {card.title}
              </h3>
              <p style={{ margin: 0, fontSize: isMobile ? 13 : 14, lineHeight: 1.6, color: theme.secondary }}>
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'steps') {
    return (
      <section style={{ padding: isMobile ? '40px 0 56px' : '56px 0 72px' }}>
        <h2 style={{ margin: '0 0 28px', fontSize: isMobile ? 13 : 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: bot.color }}>
          {section.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 720 }}>
          {section.steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '48px 1fr' : '72px 1fr',
                gap: isMobile ? 16 : 24,
                padding: isMobile ? '20px 0' : '24px 0',
                borderTop: i === 0 ? `1px solid ${theme.border}` : 'none',
                borderBottom: `1px solid ${theme.border}`
              }}
            >
              <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: `${bot.color}88`, lineHeight: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: isMobile ? 15 : 17, fontWeight: 600, color: theme.primary }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: isMobile ? 13 : 15, lineHeight: 1.65, color: theme.secondary }}>
                  {step.text}
                </p>
              </div>
              </div>
            ))}
        </div>
      </section>
    );
  }

  return null;
}

function BotsDetailView({ bot, onBack }) {
  const { isMobile } = useViewport();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      style={{ minHeight: '60vh' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: `${qodeqRgba(0.92)}`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${bot.color}33`,
          padding: isMobile ? '12px 16px' : '14px clamp(24px, 4vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            margin: 0,
            padding: '10px 0',
            border: 'none',
            background: 'transparent',
            color: theme.secondary,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          ← All modules
        </button>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: bot.color }}>
          {bot.title}
        </span>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: isMobile ? '0 16px 80px' : '0 clamp(24px, 4vw, 48px) 100px',
          boxSizing: 'border-box'
        }}
      >
        {bot.sections.map((section) => (
          <SectionBlock key={`${bot.slug}-${section.title}`} section={section} bot={bot} isMobile={isMobile} />
        ))}
      </div>
    </motion.div>
  );
}

export const BotsCreativeSection = () => {
  const [selectedSlug, setSelectedSlug] = useState(() => parseBotSlugFromHash());
  const selectedBot = selectedSlug ? getBotBySlug(selectedSlug) : null;

  const selectBot = useCallback((slug) => {
    setSelectedSlug(slug);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/bots#bot-${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const backToMenu = useCallback(() => {
    setSelectedSlug(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/bots');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onHash = () => {
      const slug = parseBotSlugFromHash();
      setSelectedSlug(slug);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <section style={{ position: 'relative', width: '100%' }}>
      <AnimatePresence mode="wait">
        {!selectedBot ? (
          <BotsLauncherMenu key="menu" onSelect={selectBot} />
        ) : (
          <BotsDetailView key={selectedBot.slug} bot={selectedBot} onBack={backToMenu} />
        )}
      </AnimatePresence>
    </section>
  );
};
