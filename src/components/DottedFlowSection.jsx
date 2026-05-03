import { useEffect, useRef, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    primary: '#ECECEC',
    muted: '#8E8E8E',
    divider: '#363636',
    accent: '#10A37F'
  }
};

const points = [
  {
    title: 'Integration',
    description: 'Connect chats, calls and payments through a single API.'
  },
  {
    title: 'AI-based Processing',
    description:
      'Smart bots automatically handle up to 70% of standard requests.'
  },
  {
    title: 'Smart Escalation',
    description: 'Complex cases are directed to operators.'
  },
  {
    title: 'Analytics and Reports',
    description: 'Detailed reports and analytics for management.'
  }
];
export const DottedFlowSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.55, rootMargin: '0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: darkTheme.colors.background,
        color: darkTheme.colors.primary,
        padding: '72px 0 clamp(120px, 15vw, 220px)',
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        width: '100%',
        overflowX: 'clip'
      }}
    >
      <div
        style={{
          margin: '0 auto',
          width: 'min(1760px, 100%)',
          paddingInline: 'clamp(24px, 6vw, 96px)',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            fontSize: 'clamp(11px, 1vw, 13px)',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: darkTheme.colors.muted,
            marginBottom: 'clamp(16px, 2vw, 28px)'
          }}
        >
          Process Flow
        </div>
        <h2
          style={{
            margin: 0,
            marginBottom: 'clamp(72px, 8vw, 168px)',
            fontSize: 'clamp(28px, 5vw, 82px)',
            fontWeight: 300,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          Dotted Integration Line
        </h2>

        <div
          style={{
            position: 'relative',
            marginTop: 'clamp(12px, 1.5vw, 28px)',
            height: 'clamp(168px, 26vh, 320px)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 'calc(50% - 50vw)',
              top: '50%',
              transform: isVisible
                ? 'translateY(-50%) scaleX(1)'
                : 'translateY(-50%) scaleX(0)',
              width: '100vw',
              borderTop: `2px dashed ${darkTheme.colors.divider}`,
              transformOrigin: 'left center',
              opacity: isVisible ? 1 : 0.4,
              transition: 'transform 1800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1200ms ease'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 'calc(50% - 50vw)',
              top: '50%',
              transform: isVisible
                ? 'translateY(-50%) scaleX(1)'
                : 'translateY(-50%) scaleX(0)',
              width: '100vw',
              borderTop: '2px dashed rgba(16,163,127,0.28)',
              maskImage:
                'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
              transformOrigin: 'left center',
              opacity: isVisible ? 1 : 0.35,
              transition:
                'transform 2100ms cubic-bezier(0.22, 1, 0.36, 1) 260ms, opacity 1300ms ease 260ms'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'grid',
              gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
              columnGap: 'clamp(28px, 4vw, 112px)'
            }}
          >
            {points.map((point, index) => {
            const isTop = index % 2 === 0;
            return (
              <div
                key={point.title}
                style={{
                  position: 'relative',
                  justifySelf: 'center',
                  textAlign: 'center',
                    width: 0,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0px)' : 'translateY(10px)',
                    transition:
                      `opacity 760ms ease ${620 + index * 170}ms, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${620 + index * 170}ms`
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: darkTheme.colors.background,
                    border: `2px solid ${darkTheme.colors.accent}`,
                    boxShadow: '0 0 16px rgba(16,163,127,0.35)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: isTop ? 'auto' : 'clamp(36px, 4.5vw, 72px)',
                    bottom: isTop ? 'clamp(36px, 4.5vw, 72px)' : 'auto',
                    width: 'clamp(200px, 22vw, 380px)',
                    opacity: isVisible ? 1 : 0,
                    filter: isVisible ? 'blur(0px)' : 'blur(4px)',
                    transition:
                      `opacity 820ms ease ${860 + index * 190}ms, filter 920ms ease ${860 + index * 190}ms`
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(14px, 1.85vw, 28px)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {point.title}
                  </div>
                  <div
                    style={{
                      marginTop: 'clamp(8px, 1.2vw, 14px)',
                      fontSize: 'clamp(12px, 1.25vw, 19px)',
                      lineHeight: 1.45,
                      letterSpacing: '0.02em',
                      color: darkTheme.colors.muted,
                      whiteSpace: 'normal'
                    }}
                  >
                    {point.description}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
};
