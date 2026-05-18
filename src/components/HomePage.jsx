import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LiquidHeroScene } from 'components/LiquidHeroScene';
import { AutomationStatsSection } from 'components/AutomationStatsSection';
import { ScrollRevealBlocks } from 'components/ScrollRevealBlocks';
import { PinnedStorytellingSection } from 'components/PinnedStorytellingSection';
import { DottedFlowSection } from 'components/DottedFlowSection';
import { TerminalEchoSection } from 'components/TerminalEchoSection';
import { SiteFooter } from 'components/SiteFooter';

export const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) {
      return;
    }
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  return (
    <>
      <LiquidHeroScene />
      <div id="reveal-blocks">
        <ScrollRevealBlocks />
      </div>
      <div id="automation-stats">
        <AutomationStatsSection />
      </div>
      <div id="story-steps">
        <PinnedStorytellingSection />
      </div>
      <div id="dotted-flow">
        <DottedFlowSection />
      </div>
      <div id="terminal-echo">
        <TerminalEchoSection />
      </div>
      <SiteFooter />
    </>
  );
};
