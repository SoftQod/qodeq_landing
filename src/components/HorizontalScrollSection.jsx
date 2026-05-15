import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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

const panels = [
  {
    id: '01',
    slug: 'chatbot',
    title: 'Chatbot',
    text: `AI-powered chatbot for automatic processing of user inquiries.

Key advantages:
• Instant responses 24/7
• Multi-language support
• Integration with popular messengers
• Automatic escalation of complex cases
• Analytics and reports`,
    geoHighlights: [
      'AI-powered responses',
      'Multi-language',
      'CRM integration',
      'Request analytics'
    ]
  },
  {
    id: '02',
    slug: 'call-center-bot',
    title: 'Call Center Bot',
    text: `Intelligent phone call processing system with speech recognition.

Key advantages:
• Automatic processing of standard requests
• Multi-language speech recognition
• Natural voice synthesis
• Integration with existing telephony
• Detailed call statistics`,
    geoHighlights: [
      'Speech recognition',
      'Voice synthesis',
      'Call routing',
      'Call recording'
    ]
  },
  {
    id: '03',
    slug: 'payment-bot',
    title: 'Payment Bot',
    text: `Automated system for processing payment requests and support.

Key advantages:
• Automatic payment status verification
• Help with deposits and withdrawals
• Integration with payment systems
• Secure data processing
• Transaction monitoring`,
    geoHighlights: [
      'Payment verification',
      'Withdrawal automation',
      'Security',
      'Transaction history'
    ]
  },
  {
    id: '04',
    slug: 'qa-bot',
    title: 'QA Bot',
    text: `Service quality control system based on artificial intelligence.

Key advantages:
• Automatic dialogue analysis
• Response quality assessment
• Problem identification
• Improvement recommendations
• Report generation`,
    geoHighlights: [
      'AI dialogue analysis',
      'Quality assessment',
      'Recommendations',
      'Reports'
    ]
  }
];

const sectionStyle = {
  position: 'relative',
  background: darkTheme.colors.background,
  width: '100%',
  maxWidth: '100%'
};

const stickyStyle = {
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden'
};

const trackStyle = {
  display: 'flex',
  height: '100%',
  willChange: 'transform',
  transition: 'transform 420ms cubic-bezier(0.22, 0.8, 0.2, 1)'
};

const panelStyleBase = {
  width: '100vw',
  minWidth: '100vw',
  boxSizing: 'border-box',
  height: '100%',
  display: 'grid',
  alignItems: 'center',
  justifyItems: 'start',
  padding: '0 8vw',
  position: 'relative',
  overflow: 'hidden'
};

/** Обрезка выезжающих geo-блоков по краю слайда при горизонтальном скролле. */
const geoHighlightsClipWrapStyle = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  contain: 'paint'
};

const orbWrapStyle = {
  position: 'absolute',
  right: '8vw',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 'clamp(200px, 26vw, 380px)',
  height: 'clamp(200px, 26vw, 380px)',
  pointerEvents: 'none',
  filter: 'saturate(0.85)'
};

const orbBloomStyle = {
  position: 'absolute',
  inset: '-18%',
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%)',
  opacity: 0.55,
  filter: 'blur(18px)',
  pointerEvents: 'none'
};

const orbCoreStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  background: [
    'radial-gradient(120% 95% at 32% 28%, rgba(255,255,255,0.22), rgba(255,255,255,0) 48%)',
    'radial-gradient(circle at 50% 55%, rgba(80,80,80,0.45), rgba(20,20,20,0.95) 72%, rgba(5,5,5,1) 100%)'
  ].join(', '),
  boxShadow: [
    'inset 18px 22px 44px rgba(0,0,0,0.75)',
    'inset -10px -26px 38px rgba(0,0,0,0.70)',
    'inset 0 0 0 1px rgba(255,255,255,0.06)',
    '0 30px 80px rgba(0,0,0,0.70)'
  ].join(', ')
};

const orbSheenStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  background:
    'radial-gradient(120% 100% at 32% 22%, rgba(255,255,255,0.20), rgba(255,255,255,0) 58%)',
  mixBlendMode: 'screen',
  opacity: 0.45,
  pointerEvents: 'none'
};

const orbRimStyle = {
  position: 'absolute',
  inset: '-5.5%',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.14)',
  opacity: 0.55,
  boxShadow: '0 0 0 1px rgba(0,0,0,0.45)'
};

const orbRimOuterStyle = {
  position: 'absolute',
  inset: '-9.5%',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.08)',
  opacity: 0.35
};

/** Скос параллелограмма в px — не от ширины блока, чтобы при растягивании вправо угол не «плыл». */
const GEO_SKEW_PX = 84;

const geoParallelogramClip = (skewPx) =>
  `polygon(${skewPx}px 0, 100% 0, calc(100% - ${skewPx}px) 100%, 0 100%)`;

/** Каждый следующий блок левее предыдущего: сдвиг правого края (ступень). */
const GEO_STAIR_STEP_PX = 83.5;
const GEO_HIGHLIGHT_BLOCK_WIDTH_PX = 920;
const maxGeoHighlightsCount = Math.max(
  0,
  ...panels.map((p) => p.geoHighlights?.length ?? 0)
);
const geoHighlightsStairSlots = Math.max(0, maxGeoHighlightsCount - 1);
const geoHighlightsRailWidthPx =
  GEO_HIGHLIGHT_BLOCK_WIDTH_PX + geoHighlightsStairSlots * GEO_STAIR_STEP_PX;

const GEO_HIGHLIGHT_ROW_HEIGHT_PX = 156;
const GEO_SKEW_RATIO = GEO_SKEW_PX / GEO_HIGHLIGHT_ROW_HEIGHT_PX;
const GEO_STEP_RATIO = GEO_STAIR_STEP_PX / GEO_HIGHLIGHT_ROW_HEIGHT_PX;
/** Перекрытие стыков между рядами (антисубпиксель + без шва от общего filter). */
const GEO_HIGHLIGHT_ROW_OVERLAP_PX = 2;
const GEO_HIGHLIGHTS_STACK_HEIGHT_PX =
  maxGeoHighlightsCount * GEO_HIGHLIGHT_ROW_HEIGHT_PX -
  Math.max(0, maxGeoHighlightsCount - 1) * GEO_HIGHLIGHT_ROW_OVERLAP_PX;

const geoHighlightsRailStyle = {
  position: 'absolute',
  left: '0',
  right: '-15vw',
  top: `calc(50% - ${GEO_HIGHLIGHTS_STACK_HEIGHT_PX / 2}px)`,
  width: 'auto',
  minWidth: geoHighlightsRailWidthPx,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 0,
  pointerEvents: 'none',
  overflow: 'hidden'
};

const geoHighlightBlockStyle = {
  width: '100%',
  height: GEO_HIGHLIGHT_ROW_HEIGHT_PX,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '36px 40px 36px clamp(48px, 5vw, 88px)',
  border: 'none',
  outline: 'none',
  background: `linear-gradient(145deg, ${darkTheme.colors.surface} 0%, rgba(28, 28, 28, 0.97) 50%, rgba(16, 163, 127, 0.12) 100%)`,
  clipPath: geoParallelogramClip(GEO_SKEW_PX),
  WebkitClipPath: geoParallelogramClip(GEO_SKEW_PX),
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  filter: 'drop-shadow(0 32px 72px rgba(0,0,0,0.52))'
};

const geoHighlightLabelStyle = {
  display: 'block',
  marginLeft: 'clamp(12px, 1.4vw, 28px)',
  color: darkTheme.colors.primary,
  fontSize: 'clamp(26px, 2.9vw, 36px)',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: 'min(100%, 62vw)',
  textAlign: 'left',
  boxSizing: 'border-box'
};

const railStyle = {
  position: 'absolute',
  top: '26px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(78vw, 760px)',
  height: '2px',
  background: darkTheme.colors.divider,
  borderRadius: '999px',
  overflow: 'visible'
};

const getSnappedPanelIndex = (progressValue, panelCount) => {
  const maxIndex = panelCount - 1;
  if (maxIndex <= 0) {
    return 0;
  }
  const clamped = Math.min(1, Math.max(0, progressValue));
  return Math.min(maxIndex, Math.max(0, Math.round(clamped * maxIndex)));
};

export const HorizontalScrollSection = () => {
  const sectionRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(
    () => window.innerWidth || 1
  );
  const [progress, setProgress] = useState(0);
  const [sectionStickyEngaged, setSectionStickyEngaged] = useState(false);
  const sectionStickyEngagedRef = useRef(false);
  const isTablet = viewportWidth <= 1200;
  const isMobile = viewportWidth <= 900;
  /** До 1100px — более компактная типографика и geo. */
  const isUpTo1100 = viewportWidth <= 1100;
  const isWideDesktop = viewportWidth >= 1650;
  const isNarrowDesktop = viewportWidth < 1400 && viewportWidth > 1200;
  const scrollPerPanelVh = isMobile ? 26 : isTablet ? 30 : 36;

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const node = sectionRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const scrollable = node.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const current = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(current / scrollable);

      const engaged = rect.top <= 0;
      if (engaged !== sectionStickyEngagedRef.current) {
        sectionStickyEngagedRef.current = engaged;
        setSectionStickyEngaged(engaged);
      }
    };

    const onScrollOrResize = () => {
      setViewportWidth(window.innerWidth || 1);
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  const translateX = useMemo(() => {
    const snappedIndex = getSnappedPanelIndex(progress, panels.length);
    return -snappedIndex * viewportWidth;
  }, [progress, viewportWidth]);

  const activePanelIndex = useMemo(() => {
    return getSnappedPanelIndex(progress, panels.length);
  }, [progress]);

  const activePanelIndexRef = useRef(activePanelIndex);
  activePanelIndexRef.current = activePanelIndex;

  const [geoReveal, setGeoReveal] = useState({ panelId: null, count: 0 });
  const playedGeoIntroByPanelIdRef = useRef(new Set());
  const geoIntroTimersRef = useRef({ stagger: [] });
  /** Панель, для которой уже запланирован stagger (анимацию не обрываем при уходе со sticky). */
  const geoIntroArmedPanelIdRef = useRef(null);
  /** Intro уже начался (первый блок выехал) — при возврате на слайд stagger не запускаем снова. */
  const geoIntroStartedPanelIdsRef = useRef(new Set());
  const geoIntroMountedRef = useRef(true);

  useEffect(() => {
    geoIntroMountedRef.current = true;
    return () => {
      geoIntroMountedRef.current = false;
    };
  }, []);

  const GEO_INTRO_MARK_PLAYED_MS = 720;

  useLayoutEffect(() => {
    const clearGeoIntroTimers = (resetArm = true) => {
      geoIntroTimersRef.current.stagger.forEach((id) => window.clearTimeout(id));
      geoIntroTimersRef.current = { stagger: [] };
      if (resetArm) {
        geoIntroArmedPanelIdRef.current = null;
      }
    };

    /**
     * Не трогаем таймеры незавершённого intro при смене deps эффекта.
     * Смена activePanelIndex при быстром скролле раньше обрывала stagger — убрано намеренно:
     * новый слайд в эффекте сам вызывает clearGeoIntroTimers перед своим расписанием.
     */
    const makeGeoIntroCleanup = () => () => {
      const sectionNode = sectionRef.current;
      if (!sectionNode || !sectionNode.isConnected) {
        clearGeoIntroTimers(true);
        return;
      }

      const armedId = geoIntroArmedPanelIdRef.current;
      const introIncomplete =
        armedId && !playedGeoIntroByPanelIdRef.current.has(armedId);

      if (!introIncomplete) {
        clearGeoIntroTimers(true);
        return;
      }

      return;
    };

    const panel = panels[activePanelIndex];
    const highlights = panel?.geoHighlights;

    if (!highlights?.length) {
      clearGeoIntroTimers(true);
      setGeoReveal({ panelId: null, count: 0 });
      return makeGeoIntroCleanup();
    }

    const panelId = panel.id;

    if (playedGeoIntroByPanelIdRef.current.has(panelId)) {
      clearGeoIntroTimers(true);
      setGeoReveal({ panelId, count: highlights.length });
      return makeGeoIntroCleanup();
    }

    if (
      sectionStickyEngaged &&
      geoIntroStartedPanelIdsRef.current.has(panelId) &&
      geoIntroArmedPanelIdRef.current !== panelId
    ) {
      clearGeoIntroTimers(true);
      playedGeoIntroByPanelIdRef.current.add(panelId);
      setGeoReveal({ panelId, count: highlights.length });
      return makeGeoIntroCleanup();
    }

    if (!sectionStickyEngaged) {
      const armedId = geoIntroArmedPanelIdRef.current;
      if (armedId && !playedGeoIntroByPanelIdRef.current.has(armedId)) {
        return makeGeoIntroCleanup();
      }
      clearGeoIntroTimers(true);
      setGeoReveal({ panelId: null, count: 0 });
      return makeGeoIntroCleanup();
    }

    if (
      geoIntroArmedPanelIdRef.current === panelId &&
      !playedGeoIntroByPanelIdRef.current.has(panelId) &&
      geoIntroTimersRef.current.stagger.length > 0
    ) {
      return makeGeoIntroCleanup();
    }

    clearGeoIntroTimers(true);
    setGeoReveal({ panelId, count: 0 });

    const staggerMs = 780;
    const initialDelayMs = 320;
    const targetPanelId = panelId;

    const currentPanel = panels[activePanelIndexRef.current];
    if (
      !currentPanel?.geoHighlights?.length ||
      currentPanel.id !== targetPanelId ||
      playedGeoIntroByPanelIdRef.current.has(targetPanelId)
    ) {
      return makeGeoIntroCleanup();
    }

    const len = currentPanel.geoHighlights.length;
    const staggerIds = [];

    for (let i = 0; i < len; i += 1) {
      const tid = window.setTimeout(() => {
        if (!geoIntroMountedRef.current) {
          return;
        }
        if (i === 0) {
          geoIntroStartedPanelIdsRef.current.add(targetPanelId);
        }
        setGeoReveal({ panelId: targetPanelId, count: i + 1 });
      }, initialDelayMs + i * staggerMs);
      staggerIds.push(tid);
    }

    const markPlayedAt =
      initialDelayMs + (len - 1) * staggerMs + GEO_INTRO_MARK_PLAYED_MS;
    const markPlayedId = window.setTimeout(() => {
      if (!geoIntroMountedRef.current) {
        return;
      }
      playedGeoIntroByPanelIdRef.current.add(targetPanelId);
      geoIntroStartedPanelIdsRef.current.add(targetPanelId);
      clearGeoIntroTimers(true);
      setGeoReveal((prev) =>
        prev.panelId === targetPanelId && prev.count === len
          ? { panelId: targetPanelId, count: len }
          : prev
      );
    }, markPlayedAt);
    staggerIds.push(markPlayedId);

    geoIntroTimersRef.current.stagger = staggerIds;
    geoIntroArmedPanelIdRef.current = targetPanelId;

    return makeGeoIntroCleanup();
  }, [activePanelIndex, sectionStickyEngaged]);

  const scrollLinePercent = useMemo(() => {
    const maxIndex = panels.length - 1;
    if (maxIndex <= 0) {
      return 0;
    }
    return (activePanelIndex / maxIndex) * 100;
  }, [activePanelIndex]);

  const geoRowHeightPx = isMobile
    ? 80
    : isTablet
      ? isUpTo1100
        ? 96
        : 108
      : isWideDesktop
        ? 156
        : isNarrowDesktop
          ? 116
          : 128;
  const geoStepPx = isMobile
    ? 30
    : Math.round(geoRowHeightPx * GEO_STEP_RATIO);
  const geoBlockWidthPx = isMobile
    ? 336
    : isTablet
      ? isUpTo1100
        ? 480
        : 560
      : isWideDesktop
        ? 760
        : isNarrowDesktop
          ? 700
        : 820;
  const showGeoHighlights = !isMobile;
  const geoSkewPx = Math.round(geoRowHeightPx * GEO_SKEW_RATIO);
  const geoLabelFontSize = isTablet
    ? isUpTo1100
      ? 'clamp(15px, 1.65vw, 20px)'
      : 'clamp(18px, 2vw, 24px)'
    : isWideDesktop
      ? 'clamp(22px, 2vw, 30px)'
      : isNarrowDesktop
        ? 'clamp(18px, 1.6vw, 24px)'
      : 'clamp(22px, 2vw, 30px)';
  const leftColumnMaxWidth = isMobile
    ? 460
    : isTablet
      ? isUpTo1100
        ? 520
        : 600
      : isNarrowDesktop
        ? 600
        : isWideDesktop
          ? 760
          : 680;
  const leftColumnMarginLeft = 0;
  const leftTitleFontSize = isMobile
    ? 'clamp(20px, 6.4vw, 30px)'
    : isTablet
      ? isUpTo1100
        ? 'clamp(22px, 3.6vw, 36px)'
        : 'clamp(26px, 4.4vw, 44px)'
      : isNarrowDesktop
        ? 'clamp(28px, 3.9vw, 48px)'
        : isWideDesktop
          ? 'clamp(22px, 3.8vw, 44px)'
          : 'clamp(26px, 5vw, 62px)';
  const leftTitleLetterSpacing = isMobile
    ? '0.04em'
    : isTablet
      ? '0.06em'
      : '0.08em';
  const leftTextFontSize = isMobile
    ? 'clamp(12px, 3.05vw, 15px)'
    : isTablet
      ? isUpTo1100
        ? 'clamp(13px, 1.75vw, 15px)'
        : 'clamp(14px, 2vw, 17px)'
      : isNarrowDesktop
        ? 'clamp(14px, 1.45vw, 17px)'
        : isWideDesktop
          ? 'clamp(13px, 1.45vw, 18px)'
          : 'clamp(15px, 1.8vw, 21px)';
  const leftTextLineHeight = isMobile ? 1.55 : isTablet ? 1.62 : 1.7;
  const leftIdFontSize = isMobile
    ? 9
    : isTablet && isUpTo1100
      ? 10
      : isWideDesktop
        ? 11
        : 12;
  const leftIdLetterSpacing = isMobile ? '0.2em' : '0.24em';

  const accentVisual = useMemo(() => {
    const vw = viewportWidth || 1200;
    const compactAccent = isMobile || (isTablet && isUpTo1100);

    const railGlowPx = Math.round(
      Math.min(28, Math.max(10, vw * (compactAccent ? 0.032 : 0.017)))
    );
    const dotGlowPx = Math.round(
      Math.min(34, Math.max(11, vw * (compactAccent ? 0.036 : 0.02)))
    );

    const railH = compactAccent
      ? Math.min(3, Math.max(2, Math.round(vw * 0.004)))
      : Math.min(4, Math.max(2, Math.round(vw * 0.00135)));

    const tintAlpha = compactAccent
      ? Math.min(0.13, 0.088 + vw / 11000)
      : Math.min(0.17, 0.1 + vw / 9500);

    const geoCardGradient = `linear-gradient(145deg, ${darkTheme.colors.surface} 0%, rgba(28, 28, 28, 0.97) 50%, rgba(16, 163, 127, ${tintAlpha}) 100%)`;

    const railGradient = `linear-gradient(90deg, ${darkTheme.colors.accent} 0%, ${darkTheme.colors.accentHover} 100%)`;

    const glowA = compactAccent ? 0.26 : 0.33;
    const glowB = compactAccent ? 0.11 : 0.17;
    const railShadow = `0 0 ${railGlowPx}px rgba(16,163,127,${glowA}), 0 0 ${Math.round(railGlowPx * 1.65)}px rgba(16,163,127,${glowB})`;

    const dotGlow = `0 0 ${dotGlowPx}px rgba(16,163,127,${compactAccent ? 0.36 : 0.44})`;

    const dropY = Math.round(Math.min(38, 13 + vw * 0.013));
    const dropBlur = Math.round(Math.min(82, 38 + vw * 0.026));
    const geoDrop = `drop-shadow(0 ${dropY}px ${dropBlur}px rgba(0,0,0,0.52))`;

    return {
      railH,
      railGradient,
      railShadow,
      dotGlow,
      geoCardGradient,
      geoDrop
    };
  }, [viewportWidth, isMobile, isTablet, isUpTo1100]);

  return (
    <section
      ref={sectionRef}
      style={{
        ...sectionStyle,
        height: `calc(100vh + ${(panels.length - 1) * scrollPerPanelVh}vh)`
      }}
    >
      <div style={stickyStyle}>
        <div
          style={{
            ...railStyle,
            top: isMobile ? 16 : railStyle.top,
            height: accentVisual.railH,
            width: isMobile
              ? '88vw'
              : isTablet
                ? isUpTo1100
                  ? '78vw'
                  : '82vw'
                : railStyle.width
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${scrollLinePercent}%`,
              height: '100%',
              borderRadius: '999px',
              background: accentVisual.railGradient,
              boxShadow: accentVisual.railShadow
            }}
          />
          {panels.map((panel, index) => {
            const leftPercent = (index / (panels.length - 1)) * 100;
            const isActive = index === activePanelIndex;
            return (
              <div
                key={panel.id}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  style={{
                    width: isActive ? (isUpTo1100 ? 10 : 12) : isUpTo1100 ? 8 : 9,
                    height: isActive ? (isUpTo1100 ? 10 : 12) : isUpTo1100 ? 8 : 9,
                    borderRadius: '50%',
                    background: isActive ? darkTheme.colors.accent : darkTheme.colors.muted,
                    boxShadow: isActive ? accentVisual.dotGlow : 'none',
                    transition: 'all 220ms ease'
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            top: isMobile ? 34 : 44,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: isMobile ? 10 : isUpTo1100 ? 12 : 14,
            letterSpacing: isMobile ? '0.12em' : '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            color: darkTheme.colors.primary,
            opacity: 1,
            animation: 'panelLabelIn 240ms ease-out',
            pointerEvents: 'none',
            maxWidth: isMobile ? 'min(340px, 88vw)' : isUpTo1100 ? 'min(520px, 90vw)' : '96vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            paddingInline: isMobile ? 8 : 12,
            boxSizing: 'border-box'
          }}
        >
          {panels[activePanelIndex]?.title}
        </div>
        <style>
          {`
            @keyframes panelLabelIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-4px);
                filter: blur(3px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                filter: blur(0);
              }
            }
            @keyframes geoSlideIn {
              from {
                opacity: 0;
                transform: translateX(28%);
                filter: blur(8px);
              }
              to {
                opacity: 1;
                transform: translateX(0%);
                filter: blur(0);
              }
            }
            @keyframes geoSlideInWide {
              from {
                opacity: 0;
                transform: translateX(72%);
                filter: blur(12px);
              }
              to {
                opacity: 1;
                transform: translateX(0%);
                filter: blur(0);
              }
            }
          `}
        </style>
        <div
          style={{
            ...trackStyle,
            width: `${panels.length * 100}vw`,
            transform: `translate3d(${translateX}px, 0, 0)`
          }}
        >
          {panels.map((panel, index) => (
            <article
              key={panel.id}
              id={`bot-${panel.slug}`}
              style={{
                ...panelStyleBase,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: isMobile
                  ? 'clamp(16px, 4.8vw, 40px)'
                  : isTablet
                    ? isUpTo1100
                      ? 'clamp(44px, 6.5vw, 84px)'
                      : '104px'
                    : isWideDesktop
                      ? 'clamp(168px, 11.5vw, 280px)'
                      : '148px',
                paddingRight: isMobile ? '5vw' : '8vw'
              }}
            >
              <div
                style={{
                  maxWidth: leftColumnMaxWidth,
                  width: '100%',
                  marginLeft: leftColumnMarginLeft
                }}
              >
                <div
                  style={{
                    fontSize: leftIdFontSize,
                    color: darkTheme.colors.muted,
                    letterSpacing: leftIdLetterSpacing,
                    marginBottom: isMobile ? 8 : isUpTo1100 ? 12 : 14
                  }}
                >
                  {panel.id}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: leftTitleFontSize,
                    letterSpacing: leftTitleLetterSpacing,
                    textTransform: 'uppercase',
                    fontWeight: 300,
                    color: darkTheme.colors.primary,
                    lineHeight: 1.1
                  }}
                >
                  {panel.title}
                </h3>
                <p
                  style={{
                    margin: isMobile ? '12px 0 0' : isUpTo1100 ? '16px 0 0' : '18px 0 0',
                    maxWidth: leftColumnMaxWidth,
                    fontSize: leftTextFontSize,
                    lineHeight: leftTextLineHeight,
                    whiteSpace: 'pre-line',
                    color: darkTheme.colors.secondary,
                    textWrap: 'balance'
                  }}
                >
                  {panel.text}
                </p>
              </div>
              {panel.geoHighlights && showGeoHighlights ? (
                <div style={geoHighlightsClipWrapStyle}>
                  <div
                    style={{
                      ...geoHighlightsRailStyle,
                      left: isWideDesktop ? '0' : geoHighlightsRailStyle.left,
                      right: isTablet ? '-18vw' : isWideDesktop ? '-16vw' : '-28vw',
                      top: `calc(50% - ${(panel.geoHighlights.length * geoRowHeightPx -
                        Math.max(0, panel.geoHighlights.length - 1) * GEO_HIGHLIGHT_ROW_OVERLAP_PX) / 2}px)`
                    }}
                  >
                    {panel.geoHighlights.map((item, highlightIndex) => {
                    const isActiveGeoPanel = activePanelIndex === index;
                    const playedIntro = playedGeoIntroByPanelIdRef.current.has(
                      panel.id
                    );
                    /** Без «неактивный слайд = всё открыто» — иначе при смене progress/stagger обрывается визуально. */
                    const isRevealed =
                      playedIntro ||
                      (geoReveal.panelId === panel.id &&
                        highlightIndex < geoReveal.count);
                    const isEntering =
                      isActiveGeoPanel &&
                      !playedIntro &&
                      geoReveal.panelId === panel.id &&
                      isRevealed &&
                      highlightIndex === geoReveal.count - 1 &&
                      geoReveal.count > 0;

                    const motionStyle = isRevealed
                      ? isEntering
                        ? {
                            opacity: 1,
                            animation: isWideDesktop
                              ? 'geoSlideInWide 820ms cubic-bezier(0.22, 1, 0.36, 1) both'
                              : 'geoSlideIn 680ms cubic-bezier(0.22, 1, 0.36, 1) both'
                          }
                        : {
                            opacity: 1,
                            transform: 'translateX(0%)',
                            filter: 'blur(0px)',
                            transition: 'none',
                            animation: 'none'
                          }
                      : {};

                    return (
                      <div
                        key={`${panel.id}-${item}`}
                        style={{
                          width: `calc(${geoBlockWidthPx}px + ${isTablet ? (isUpTo1100 ? 8 : 10) : 14}vw)`,
                          maxWidth: 'none',
                          alignSelf: 'flex-end',
                          marginRight: highlightIndex * geoStepPx,
                          marginTop:
                            highlightIndex > 0 ? -GEO_HIGHLIGHT_ROW_OVERLAP_PX : 0,
                          flexShrink: 0,
                          zIndex: highlightIndex + 1,
                          ...motionStyle
                        }}
                      >
                        {isRevealed ? (
                          <div
                            style={{
                              ...geoHighlightBlockStyle,
                              height: geoRowHeightPx,
                              clipPath: geoParallelogramClip(geoSkewPx),
                              WebkitClipPath: geoParallelogramClip(geoSkewPx),
                              background: accentVisual.geoCardGradient,
                              filter: accentVisual.geoDrop,
                              padding: isTablet
                                ? isUpTo1100
                                  ? '22px 22px 22px clamp(26px, 3.4vw, 52px)'
                                  : '28px 28px 28px clamp(34px, 4vw, 64px)'
                                : geoHighlightBlockStyle.padding
                            }}
                          >
                            <span
                              style={{
                                ...geoHighlightLabelStyle,
                                fontSize: geoLabelFontSize
                              }}
                            >
                              {item}
                            </span>
                          </div>
                        ) : (
                          <div
                            aria-hidden
                            style={{
                              height: geoRowHeightPx,
                              width: '100%'
                            }}
                          />
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    ...orbWrapStyle,
                    right: isMobile ? '4vw' : orbWrapStyle.right,
                    width: isMobile ? 'clamp(150px, 34vw, 220px)' : orbWrapStyle.width,
                    height: isMobile ? 'clamp(150px, 34vw, 220px)' : orbWrapStyle.height,
                    opacity: isMobile ? 0.72 : 1
                  }}
                >
                  <div style={orbBloomStyle} />
                  <div
                    style={{
                      ...orbCoreStyle,
                      transform: `rotate(${index * 8}deg) scale(${1 - index * 0.03})`
                    }}
                  />
                  <div
                    style={{
                      ...orbSheenStyle,
                      transform: `rotate(${index * 6}deg)`
                    }}
                  />
                  <div
                    style={{
                      ...orbRimStyle,
                      transform: `rotate(${index * 10}deg) scale(${1 + index * 0.01})`
                    }}
                  />
                  <div
                    style={{
                      ...orbRimOuterStyle,
                      transform: `rotate(${-index * 7}deg) scale(${1 + index * 0.02})`
                    }}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
