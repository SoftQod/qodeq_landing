import { LiquidHeroScene } from 'components/LiquidHeroScene';
import { HorizontalScrollSection } from 'components/HorizontalScrollSection';
import { AutomationStatsSection } from 'components/AutomationStatsSection';
import { ScrollRevealBlocks } from 'components/ScrollRevealBlocks';
import { PinnedStorytellingSection } from 'components/PinnedStorytellingSection';
import { DottedFlowSection } from 'components/DottedFlowSection';
import { TerminalEchoSection } from 'components/TerminalEchoSection';
import { SiteFooter } from 'components/SiteFooter';

export const App = () => {
  return (
    <>
      <LiquidHeroScene />
      <div id="reveal-blocks">
        <ScrollRevealBlocks />
      </div>
      <div id="horizontal-flow">
        <HorizontalScrollSection />
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
