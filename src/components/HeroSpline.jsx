import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import {
  applySplineQodeqTheme,
  setSplineBackground,
  syncSplineQodeqTheme
} from 'components/splineQodeqTheme';
import { HERO_CUBE_FOCUS, QODEQ_BG } from 'theme/qodeqColors';

const SCENE_URL = `${process.env.PUBLIC_URL || ''}/scene.splinecode`;

const wrapStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  minHeight: '100%',
  background: QODEQ_BG,
  overflow: 'hidden'
};

function getCssScale() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;
  const minDim = Math.min(w, h);
  return Math.max(1.2, Math.min(1.65, minDim / 720));
}

function HeroSplineFallback() {
  return <div style={wrapStyle} aria-hidden />;
}

export const HeroSpline = () => {
  const appRef = useRef(null);
  const wrapRef = useRef(null);
  const themeTimersRef = useRef([]);
  const renderedCountRef = useRef(0);
  const [cssScale, setCssScale] = useState(getCssScale);
  const [sceneReady, setSceneReady] = useState(false);

  const paintCanvasBackground = useCallback((ready) => {
    const canvas = wrapRef.current?.querySelector('canvas');
    if (!canvas) {
      return;
    }
    canvas.style.backgroundColor = QODEQ_BG;
    canvas.style.mixBlendMode = ready ? 'lighten' : 'normal';
  }, []);

  const revealScene = useCallback(
    (app) => {
      syncSplineQodeqTheme(app);
      paintCanvasBackground(true);
      wrapRef.current?.setAttribute('data-spline-ready', 'true');
      setSceneReady(true);
    },
    [paintCanvasBackground]
  );

  const applyTheme = useCallback(
    (app) => {
      if (!app) {
        return;
      }
      syncSplineQodeqTheme(app);
      paintCanvasBackground(sceneReady);
    },
    [paintCanvasBackground, sceneReady]
  );

  const scheduleThemePasses = useCallback(
    (app) => {
      themeTimersRef.current.forEach((id) => window.clearTimeout(id));
      themeTimersRef.current = [];

      const delays = [0, 100, 300, 700];
      themeTimersRef.current = delays.map((ms) =>
        window.setTimeout(() => {
          if (appRef.current) {
            syncSplineQodeqTheme(appRef.current);
            paintCanvasBackground(sceneReady);
          }
        }, ms)
      );
    },
    [paintCanvasBackground, sceneReady]
  );

  const refit = useCallback(() => {
    setCssScale(getCssScale());
    if (appRef.current) {
      applyTheme(appRef.current);
    }
  }, [applyTheme]);

  const onLoad = useCallback(
    (app) => {
      appRef.current = app;
      renderedCountRef.current = 0;

      const onRendered = () => {
        setSplineBackground(app);
        applySplineQodeqTheme(app);

        renderedCountRef.current += 1;
        if (renderedCountRef.current >= 2) {
          revealScene(app);
        }
      };

      app.addEventListener?.('rendered', onRendered);
      syncSplineQodeqTheme(app);
      scheduleThemePasses(app);
    },
    [revealScene, scheduleThemePasses]
  );

  useEffect(() => {
    refit();
    window.addEventListener('resize', refit);
    return () => {
      window.removeEventListener('resize', refit);
      themeTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, [refit]);

  const scaleLayerStyle = {
    position: 'absolute',
    left: HERO_CUBE_FOCUS.x,
    top: HERO_CUBE_FOCUS.y,
    width: '100%',
    height: '100%',
    transform: `translate(-50%, -50%) scale(${cssScale})`,
    transformOrigin: 'center center',
    pointerEvents: sceneReady ? 'auto' : 'none',
    visibility: sceneReady ? 'visible' : 'hidden',
    background: QODEQ_BG
  };

  return (
    <div
      ref={wrapRef}
      className="hero-spline"
      data-spline-ready={sceneReady ? 'true' : 'false'}
      style={wrapStyle}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: QODEQ_BG
        }}
      />
      <Suspense fallback={<HeroSplineFallback />}>
        <div style={{ ...scaleLayerStyle, zIndex: 1 }}>
          <Spline
            scene={SCENE_URL}
            onLoad={onLoad}
            renderOnDemand={false}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              background: QODEQ_BG
            }}
          />
        </div>
      </Suspense>
    </div>
  );
};
