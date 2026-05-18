import { useEffect, useState } from 'react';
import { BotsCreativeSection } from 'components/BotsCreativeSection';
import { SiteFooter } from 'components/SiteFooter';
import { SiteHeader } from 'components/SiteHeader';
import { heroTheme as theme } from 'theme/qodeqColors';

export const BotsPage = () => {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth || 1440 : 1440
  );
  const isMobile = viewportWidth <= 900;

  const pad = isMobile
    ? 'max(16px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) 20px max(20px, env(safe-area-inset-left))'
    : 'max(24px, env(safe-area-inset-top)) max(36px, env(safe-area-inset-right)) 24px max(36px, env(safe-area-inset-left))';

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 1440);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.primary,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
      }}
    >
      <SiteHeader activeSection="bots" isMobile={isMobile} pad={pad} position="sticky" />
      <BotsCreativeSection />
      <SiteFooter />
    </div>
  );
};
