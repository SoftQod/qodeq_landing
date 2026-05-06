import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

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

const containerStyle = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: darkTheme.colors.background
};

const canvasStyleBase = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  // Needed for raycasting / hover on the 3D scene (HTML overlays are pointer-events: none)
  pointerEvents: 'auto',
  /* На таче none блокирует вертикальный скролл страницы по Canvas */
  touchAction: 'none'
};

const vignetteStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'rgba(13, 13, 13, 0.2)',
  boxShadow: 'inset 0 0 180px rgba(13, 13, 13, 0.95)'
};

const grainStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.18,
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.3) 0.6px, transparent 0.6px)',
  backgroundSize: '2px 2px'
};

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: '11vh',
  color: darkTheme.colors.primary,
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
  pointerEvents: 'none'
};

const anchorNavWrapStyle = {
  position: 'fixed',
  top: '50%',
  left: '28px',
  transform: 'translateY(-50%)',
  display: 'block',
  pointerEvents: 'auto',
  zIndex: 30,
  padding: '0',
  border: 'none',
  background: 'transparent',
  backdropFilter: 'none',
  clipPath: 'none'
};

const anchorRailStyle = {
  position: 'relative',
  width: '2px',
  height: '430px',
  marginLeft: '10px',
  background: darkTheme.colors.divider,
  borderRadius: '999px'
};

const titleStyle = {
  position: 'absolute',
  top: '51%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: 0,
  fontSize: 'clamp(30px, 8.5vw, 92px)',
  fontWeight: 300,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  opacity: 0.86
};

const subtitleStyle = {
  margin: 0,
  marginBottom: '18px',
  fontSize: '10px',
  fontWeight: 300,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  opacity: 0.7
};

const buttonStyle = {
  border: `1px solid ${darkTheme.colors.border}`,
  borderRadius: '0',
  background: `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`,
  color: darkTheme.colors.primary,
  padding: '10px 28px',
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  pointerEvents: 'auto',
  position: 'relative',
  clipPath: 'polygon(9% 0, 100% 0, 91% 100%, 0 100%)',
  overflow: 'hidden',
  transition: 'transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease, background 300ms ease'
};

const satelliteLabelTexts = ['Chatbot', 'CallBot', 'PaymentBot', 'QABot'];

const satelliteLabelBaseStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  margin: 0,
  width: 'max-content',
  maxWidth: 'min(92vw, 280px)',
  textAlign: 'center',
  fontWeight: 300,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: darkTheme.colors.primary,
  opacity: 0,
  fontSize: 'clamp(10px, 1.2vw, 20px)',
  textShadow: '0 0 18px rgba(0,0,0,0.7)',
  pointerEvents: 'none',
  willChange: 'transform, opacity'
};

const labelLayerStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 4,
  pointerEvents: 'none',
  fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
};

const anchors = [
  { id: 'hero-main', label: 'Hero' },
  { id: 'reveal-blocks', label: 'Blocks' },
  { id: 'horizontal-flow', label: 'Flow' },
  { id: 'automation-stats', label: 'Stats' },
  { id: 'story-steps', label: 'Story' },
  { id: 'dotted-flow', label: 'Dotted' },
  { id: 'terminal-echo', label: 'Feedback' }
];

export const LiquidHeroScene = () => {
  const mountRef = useRef(null);
  const labelLayerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth || 1440);
  const [activeAnchor, setActiveAnchor] = useState('hero-main');
  const [hoveredAnchor, setHoveredAnchor] = useState('');
  const [isButtonHover, setIsButtonHover] = useState(false);
  const isTablet = viewportWidth <= 1200;
  const isMobile = viewportWidth <= 900;
  const isSmallMobile = viewportWidth <= 640;
  const isTinyMobile = viewportWidth <= 400;

  const heroTextMul = useMemo(() => {
    if (viewportWidth <= 900) {
      return 1;
    }
    const growT = Math.min(1, Math.max(0, (viewportWidth - 520) / (2720 - 520)));
    return 0.62 + 0.38 * growT;
  }, [viewportWidth]);
  const mobileLabelMul = isTinyMobile ? 0.52 : isSmallMobile ? 0.62 : viewportWidth <= 900 ? 0.78 : 1;

  useEffect(() => {
    const updateActiveAnchor = () => {
      const viewportHeight = window.innerHeight || 1;
      const docEl = document.documentElement;
      const maxScrollY = Math.max(0, docEl.scrollHeight - viewportHeight);
      const scrollY = window.scrollY ?? docEl.scrollTop ?? 0;

      const lastAnchor = anchors[anchors.length - 1];
      const lastNode = document.getElementById(lastAnchor.id);
      if (lastNode && maxScrollY > 0 && scrollY >= maxScrollY - 3) {
        const lastRect = lastNode.getBoundingClientRect();
        if (lastRect.bottom > 0 && lastRect.top < viewportHeight) {
          setActiveAnchor(lastAnchor.id);
          return;
        }
      }

      const activationY = viewportHeight * 0.5;
      let currentId = anchors[0].id;
      anchors.forEach((anchor) => {
        const node = document.getElementById(anchor.id);
        if (!node) {
          return;
        }
        const rect = node.getBoundingClientRect();
        if (rect.top <= activationY) {
          currentId = anchor.id;
        }
      });

      setActiveAnchor(currentId);
    };

    updateActiveAnchor();
    window.addEventListener('scroll', updateActiveAnchor, { passive: true });
    window.addEventListener('resize', updateActiveAnchor);
    return () => {
      window.removeEventListener('scroll', updateActiveAnchor);
      window.removeEventListener('resize', updateActiveAnchor);
    };
  }, []);

  const scrollToAnchor = (targetId) => {
    const node = document.getElementById(targetId);
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 1440);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 4.35);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setClearColor(0x0d0d0d, 0);
    const getAdaptivePixelRatio = (w) =>
      Math.min(window.devicePixelRatio || 1, w <= 560 ? 1.05 : w <= 900 ? 1.15 : w <= 1400 ? 1.22 : 1.35);
    renderer.setPixelRatio(getAdaptivePixelRatio(window.innerWidth || 1440));
    mountNode.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    /** Белый ключ сверху убран — остаются только ambient, передний fill и цветные огни спутников */

    /** Сильнее передний fill — без этого центр большого шара уходит в чёрный (ключ сверху снят) */
    const centerFrontFill = new THREE.PointLight(0xf2f6fc, 1.02, 28);
    centerFrontFill.position.set(0, 0.08, 4.26);
    centerFrontFill.decay = 2;
    scene.add(centerFrontFill);

    const ambient = new THREE.AmbientLight(0x16161c, 0.084);
    scene.add(ambient);

    const geometry = new THREE.IcosahedronGeometry(1.2, 6);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x6b6b6b,
      metalness: 0,
      roughness: 0.92,
      clearcoat: 0,
      clearcoatRoughness: 1,
      sheen: 0,
      sheenColor: new THREE.Color(0x0d0d0d),
      emissive: new THREE.Color(0x222226),
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.06;
    mesh.renderOrder = 0;
    scene.add(mesh);

    /** Порядок как в `satelliteLabelTexts`: Chatbot, CallBot, PaymentBot, QABot — матовый цвет + лёгкий emissive + PointLight сзади */
    const chatbotSatMaterial = material.clone();
    chatbotSatMaterial.color = new THREE.Color(0x338f5f);
    chatbotSatMaterial.emissive = new THREE.Color(0x1a7a48);
    chatbotSatMaterial.emissiveIntensity = 0.058;

    const callbotSatMaterial = material.clone();
    callbotSatMaterial.color = new THREE.Color(0x2d73b8);
    callbotSatMaterial.emissive = new THREE.Color(0x154a8c);
    callbotSatMaterial.emissiveIntensity = 0.058;

    const paymentSatMaterial = material.clone();
    paymentSatMaterial.color = new THREE.Color(0xa84848);
    paymentSatMaterial.emissive = new THREE.Color(0x6b2228);
    paymentSatMaterial.emissiveIntensity = 0.058;

    const qabotSatMaterial = material.clone();
    qabotSatMaterial.color = new THREE.Color(0xb89428);
    qabotSatMaterial.emissive = new THREE.Color(0x8a6e14);
    qabotSatMaterial.emissiveIntensity = 0.058;

    const satelliteTintMaterials = [
      chatbotSatMaterial,
      callbotSatMaterial,
      paymentSatMaterial,
      qabotSatMaterial
    ];

    const satelliteGlowLights = [
      new THREE.PointLight(0x7af0b8, 0, 22),
      new THREE.PointLight(0x8ec8ff, 0, 22),
      new THREE.PointLight(0xff9c9c, 0, 22),
      new THREE.PointLight(0xffeb8a, 0, 22)
    ];
    satelliteGlowLights.forEach((pl) => {
      pl.decay = 2;
      scene.add(pl);
    });

    const satGlowCamDir = new THREE.Vector3();
    const satGlowTowardMain = new THREE.Vector3();

    /** Плавная разметка орбит от ширины (без «ступенек»). `spreadMul` — общее сжатие из resize(). */
    const getSatelliteConfigs = (width, spreadMul = 1) => {
      const w = THREE.MathUtils.clamp(width, 280, 2160);
      if (w <= 900) {
        /* Не умножаем на orbitSpreadMul — на узких экранах он ~0.56 и сливает шары в кучу (iPhone SE). */
        const uw = THREE.MathUtils.clamp(width, 320, 900);
        const mobileT = THREE.MathUtils.clamp((uw - 320) / 580, 0, 1);
        /* Два шара сверху, два снизу. Узкий экран — больше half (раньше уменьшали → шары наезжали друг на друга). */
        const half = THREE.MathUtils.lerp(0.72, 0.90, mobileT);
        const yTop = THREE.MathUtils.lerp(1.12, 0.94, mobileT);
        const yBottom = THREE.MathUtils.lerp(-1.22, -1.04, mobileT);
        return [
          { x: -half, yOffset: yTop, timePhase: 0.9, rotSign: 1 },
          { x: half, yOffset: yTop, timePhase: 1.4, rotSign: -1 },
          { x: -half, yOffset: yBottom, timePhase: 1.1, rotSign: -1 },
          { x: half, yOffset: yBottom, timePhase: 1.6, rotSign: 1 }
        ];
      }
      const layoutT = THREE.MathUtils.clamp((w - 380) / 1060, 0, 1);
      let xOuter = THREE.MathUtils.lerp(0.98, 1.86, layoutT) * spreadMul;
      let ySpread = THREE.MathUtils.lerp(0.52, 0.74, layoutT) * spreadMul;
      /* При сильном spreadMul орбиты не должны смыкаться ни по вертикали (одна колонка), ни по горизонтали */
      xOuter = Math.max(xOuter, 0.92 * spreadMul + 0.14);
      ySpread = Math.max(ySpread, 0.46);
      const ySpreadUpper = ySpread + 0.12;

      return [
        { x: -xOuter, yOffset: ySpreadUpper, timePhase: 0.9, rotSign: 1 },
        { x: -xOuter, yOffset: -ySpread, timePhase: 1.4, rotSign: -1 },
        { x: xOuter, yOffset: ySpreadUpper, timePhase: 1.1, rotSign: -1 },
        { x: xOuter, yOffset: -ySpread, timePhase: 1.6, rotSign: 1 }
      ];
    };

    const computeSceneLayout = (width, height) => {
      const aspect = width / Math.max(height, 320);
      const camT = THREE.MathUtils.clamp((width - 520) / 920, 0, 1);
      const growT = THREE.MathUtils.clamp((width - 520) / (2720 - 520), 0, 1);

      let orbitSpreadMul = THREE.MathUtils.lerp(0.56, 0.93, growT);
      let orbitSat = THREE.MathUtils.lerp(0.44, 1.02, growT);
      let orbitMain = THREE.MathUtils.lerp(0.39, 0.9, growT);

      let camZ = THREE.MathUtils.lerp(5.08, 4.3, camT);
      camZ += THREE.MathUtils.lerp(0.62, 0, growT);

      if (aspect > 2) {
        const uw = THREE.MathUtils.clamp((aspect - 2) / 0.95, 0, 1);
        orbitMain *= THREE.MathUtils.lerp(1, 0.72, uw);
        orbitSat *= THREE.MathUtils.lerp(1, 0.8, uw);
        orbitSpreadMul *= THREE.MathUtils.lerp(1, 0.82, uw);
        camZ += THREE.MathUtils.lerp(0, 0.62, uw);
      }

      return { orbitSat, orbitMain, camZ, orbitSpreadMul };
    };

    const initialLayout = computeSceneLayout(
      window.innerWidth || 1440,
      window.innerHeight || 900
    );
    let satelliteConfigs = getSatelliteConfigs(
      window.innerWidth || 1440,
      initialLayout.orbitSpreadMul
    );

    const orbitScale = { sat: initialLayout.orbitSat, main: initialLayout.orbitMain };

    const satelliteMeshes = [];
    const satelliteData = [];

    const labelWorld = new THREE.Vector3();

    satelliteConfigs.forEach((cfg, satIndex) => {
      const satGeometry = new THREE.IcosahedronGeometry(0.52, 4);
      const satMat = satelliteTintMaterials[satIndex];
      const satMesh = new THREE.Mesh(satGeometry, satMat);
      satMesh.position.set(cfg.x, 0.06 + cfg.yOffset, 0.04);
      satMesh.renderOrder = 2;
      scene.add(satMesh);
      satelliteMeshes.push(satMesh);

      const satPosAttr = satGeometry.attributes.position;
      const satBase = satPosAttr.array.slice();
      satelliteData.push({
        geometry: satGeometry,
        positionAttr: satPosAttr,
        basePositions: satBase,
        vertexCount: satPosAttr.count,
        timePhase: cfg.timePhase,
        rotSign: cfg.rotSign
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const satHover = new Float32Array(satelliteMeshes.length).fill(0);
    const satHoverTarget = new Float32Array(satelliteMeshes.length).fill(0);

    const lerpTowardBase = (attr, base, count, t) => {
      if (t <= 0.000001) {
        return;
      }
      for (let i = 0; i < count; i += 1) {
        const stride = i * 3;
        attr.array[stride] = THREE.MathUtils.lerp(attr.array[stride], base[stride], t);
        attr.array[stride + 1] = THREE.MathUtils.lerp(attr.array[stride + 1], base[stride + 1], t);
        attr.array[stride + 2] = THREE.MathUtils.lerp(attr.array[stride + 2], base[stride + 2], t);
      }
      attr.needsUpdate = true;
    };

    const domElement = renderer.domElement;
    const setPointerFromEvent = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointer.x = x * 2 - 1;
      pointer.y = -(y * 2 - 1);
    };

    const updateSatelliteHoverTargets = (event) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(satelliteMeshes, false);
      for (let i = 0; i < satHoverTarget.length; i += 1) {
        satHoverTarget[i] = 0;
      }
      if (hits.length > 0) {
        const idx = satelliteMeshes.indexOf(hits[0].object);
        if (idx >= 0) {
          satHoverTarget[idx] = 1;
        }
      }
      domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    const clearSatelliteHoverTargets = () => {
      for (let i = 0; i < satHoverTarget.length; i += 1) {
        satHoverTarget[i] = 0;
      }
      domElement.style.cursor = 'default';
    };

    domElement.addEventListener('pointermove', updateSatelliteHoverTargets);
    domElement.addEventListener('pointerleave', clearSatelliteHoverTargets);
    domElement.addEventListener('pointercancel', clearSatelliteHoverTargets);

    const positionAttr = geometry.attributes.position;
    const basePositions = positionAttr.array.slice();
    const vertexCount = positionAttr.count;

    let rafId = 0;
    const startTime = performance.now();
    let lastTime = performance.now();
    let hidden = document.hidden;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const applyVertexWobble = (attr, base, count, t, phase) => {
      for (let i = 0; i < count; i += 1) {
        const stride = i * 3;
        const bx = base[stride];
        const by = base[stride + 1];
        const bz = base[stride + 2];
        const len = Math.hypot(bx, by, bz) || 1;
        const nx = bx / len;
        const ny = by / len;
        const nz = bz / len;

        const waveA = Math.sin(t * 0.00105 + phase + nx * 4.2 + ny * 2.6) * 0.05;
        const waveB = Math.sin(t * 0.00078 + phase * 0.6 + ny * 5.1 + nz * 3.4) * 0.032;
        const sharpA =
          Math.pow(
            Math.max(0, Math.sin(t * 0.0016 + phase * 0.4 + nx * 8.8 + nz * 5.5)),
            3
          ) * 0.11;
        const sharpB =
          Math.pow(
            Math.max(0, Math.sin(t * 0.0012 + phase * 0.5 + ny * 9.2 + nx * 6.4)),
            4
          ) * 0.08;
        const wobble = 1 + waveA + waveB + sharpA + sharpB;

        attr.array[stride] = bx * wobble;
        attr.array[stride + 1] = by * wobble;
        attr.array[stride + 2] = bz * wobble;
      }
      attr.needsUpdate = true;
    };

    const revealCenteredTitle = (element, progress, maxBlur = 10) => {
      if (!element) {
        return;
      }
      const clamped = THREE.MathUtils.clamp(progress, 0, 1);
      const eased = easeOutCubic(clamped);
      const shift = (1 - eased) * 26;
      const blur = (1 - eased) * maxBlur;
      element.style.opacity = String(eased);
      element.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
      element.style.filter = `blur(${blur}px)`;
    };
    const revealFlowElement = (element, progress, startY = 24, maxBlur = 8) => {
      if (!element) {
        return;
      }
      const clamped = THREE.MathUtils.clamp(progress, 0, 1);
      const eased = easeOutCubic(clamped);
      const shift = (1 - eased) * startY;
      const blur = (1 - eased) * maxBlur;
      element.style.opacity = String(eased);
      element.style.transform = `translateY(${shift}px)`;
      element.style.filter = `blur(${blur}px)`;
    };

    const onVisibility = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const resize = () => {
      const width = mountNode.clientWidth || window.innerWidth;
      const height = mountNode.clientHeight || window.innerHeight;

      const camT = THREE.MathUtils.clamp((width - 520) / 920, 0, 1);
      camera.fov = THREE.MathUtils.lerp(49, 37.5, camT);

      const layout = computeSceneLayout(width, height);
      camera.position.z = layout.camZ;
      camera.position.y = THREE.MathUtils.lerp(0.13, 0.05, camT);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(getAdaptivePixelRatio(width));
      renderer.setSize(width, height, true);

      orbitScale.sat = layout.orbitSat;
      orbitScale.main = layout.orbitMain;
      satelliteConfigs = getSatelliteConfigs(width, layout.orbitSpreadMul);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (time) => {
      rafId = requestAnimationFrame(animate);
      if (hidden) {
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const pulse = 1 + Math.sin(time * 0.00045) * 0.01;
      const introRaw = THREE.MathUtils.clamp((time - startTime) / 1800, 0, 1);
      const intro = easeOutCubic(introRaw);
      const vw = window.innerWidth || 1440;
      const isMobileViewport = vw <= 900;
      const isTinyVp = vw <= 400;
      /* На мобилке главный шар ближе к центру кадра (под заголовок по центру). */
      const mainBaseY = isTinyVp ? 0.02 : isMobileViewport ? -0.06 : -0.26;
      const mainRise = isTinyVp ? 0.28 : isMobileViewport ? 0.3 : 0.32;
      const mainFloat = isTinyVp ? 0.012 : isMobileViewport ? 0.014 : 0.03;
      const mainY = mainBaseY + intro * mainRise + Math.sin(time * 0.00028) * mainFloat;

      const smoothSpeed = 22;
      const smoothAlpha = 1 - Math.exp(-smoothSpeed * dt);
      for (let i = 0; i < satHover.length; i += 1) {
        const delta = satHoverTarget[i] - satHover[i];
        if (Math.abs(delta) < 0.0005) {
          satHover[i] = satHoverTarget[i];
        } else {
          satHover[i] += delta * smoothAlpha;
        }
      }

      applyVertexWobble(positionAttr, basePositions, vertexCount, time, 0);
      geometry.computeVertexNormals();

      satelliteData.forEach((sat, index) => {
        applyVertexWobble(
          sat.positionAttr,
          sat.basePositions,
          sat.vertexCount,
          time,
          sat.timePhase
        );
        lerpTowardBase(sat.positionAttr, sat.basePositions, sat.vertexCount, satHover[index]);
        sat.geometry.computeVertexNormals();

        const satMesh = satelliteMeshes[index];
        const driftMul = isTinyVp ? 0.28 : isMobileViewport ? 0.42 : 1;
        const extraDriftY = Math.sin(time * 0.0003 + sat.timePhase) * 0.014 * driftMul;
        const driftZ = Math.cos(time * 0.00026 + sat.timePhase * 0.8) * 0.03 * driftMul;
        const verticalOffset = satelliteConfigs[index].yOffset;
        const xWobble = isTinyVp ? 0.004 : isMobileViewport ? 0.008 : 0.02;
        satMesh.position.x =
          satelliteConfigs[index].x + (isMobileViewport ? 0 : Math.sin(time * 0.00018 + index) * xWobble);
        satMesh.position.y = mainY + verticalOffset + extraDriftY;
        /* Ближе к камере на мобилке — иначе большой шар перекрывает малые по depth buffer */
        const satBaseZ = isMobileViewport ? (isTinyVp ? 0.62 : 0.54) : 0.04;
        satMesh.position.z = satBaseZ + driftZ * (isMobileViewport ? 0.45 : 1);
        satMesh.rotation.y += dt * 0.12 * sat.rotSign;
        satMesh.rotation.x += dt * 0.06;
        const satMobileScale = isTinyVp ? 0.48 : isMobileViewport ? 0.50 : 0.42;
        /* На мобилке computeSceneLayout даёт orbitSat << 1 — без компенсации шары визуально крошечные */
        const satOrbitMul = isMobileViewport ? 1 : orbitScale.sat;
        satMesh.scale.setScalar((0.72 + intro * 0.28) * satMobileScale * pulse * satOrbitMul);
      });

      const glowBack = isMobileViewport ? -0.46 : -0.52;
      const glowIntensity = intro * 4.55;
      const mainCx = isMobileViewport ? 0 : Math.sin(time * 0.00022) * 0.03;
      const mainCy = mainY;
      const mainCz = isMobileViewport ? -0.06 : 0;
      for (let gi = 0; gi < satelliteGlowLights.length; gi += 1) {
        const sm = satelliteMeshes[gi];
        satGlowCamDir.subVectors(camera.position, sm.position).normalize();
        satGlowTowardMain.set(mainCx - sm.position.x, mainCy - sm.position.y, mainCz - sm.position.z);
        if (satGlowTowardMain.lengthSq() < 1e-10) {
          satGlowTowardMain.set(0, -1, 0);
        }
        satGlowTowardMain.normalize();
        satelliteGlowLights[gi].position
          .copy(sm.position)
          .addScaledVector(satGlowCamDir, glowBack * 0.42)
          .addScaledVector(satGlowTowardMain, 0.52);
        satelliteGlowLights[gi].intensity = glowIntensity;
      }

      const labelLayerEl = labelLayerRef.current;
      const canvasRect = domElement.getBoundingClientRect();
      const layerRect = labelLayerEl?.getBoundingClientRect();
      const layerOk =
        labelLayerEl &&
        layerRect &&
        canvasRect.width > 2 &&
        canvasRect.height > 2 &&
        layerRect.width > 2 &&
        layerRect.height > 2;

      for (let i = 0; i < satelliteMeshes.length; i += 1) {
        const labelEl = document.getElementById(`hero-sat-label-${i}`);
        if (!labelEl) {
          continue;
        }

        const satMesh = satelliteMeshes[i];
        satMesh.updateMatrixWorld(true);
        labelWorld.setFromMatrixPosition(satMesh.matrixWorld);
        labelWorld.project(camera);

        const isBehind = labelWorld.z > 1;
        labelEl.style.opacity = isBehind ? '0' : String(intro * 0.86);
        if (isBehind || !layerOk) {
          continue;
        }

        // NDC → пиксели по canvas; translate(-50%,-50%) — центр строки в центре шара (без смещений над/под мобилкой).
        const x =
          (labelWorld.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left - layerRect.left;
        const y =
          (-labelWorld.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top - layerRect.top;

        labelEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      mesh.rotation.y += dt * 0.1;
      mesh.rotation.x += dt * 0.05;
      mesh.position.x = isMobileViewport ? 0 : Math.sin(time * 0.00022) * 0.03;
      mesh.position.y = mainY;
      /* На мобилке центральный шар был перегружающим — держим заметно ниже десктопного масштаба */
      const mainScaleBase = isTinyVp ? 0.76 : isMobileViewport ? 0.82 : 1;
      const mainOrbitMul = isMobileViewport ? 1 : orbitScale.main;
      mesh.scale.setScalar((0.76 + intro * 0.24) * pulse * mainOrbitMul * mainScaleBase);
      mesh.position.z = isMobileViewport ? -0.06 : 0;
      material.opacity = intro;
      /* Лёгкий равномерный слой на центральную орбу — поднимает провалы между гранями там, куда почти не доходит боковой цвет */
      material.emissiveIntensity = 0.052 * intro;
      satelliteTintMaterials.forEach((m) => {
        m.opacity = intro;
        m.emissiveIntensity = 0.058 * intro;
      });

      revealCenteredTitle(titleRef.current, (introRaw - 0.2) / 0.8);
      revealFlowElement(subtitleRef.current, (introRaw - 0.42) / 0.58, 24, 8);
      revealFlowElement(buttonRef.current, (introRaw - 0.55) / 0.45, 42, 6);

      renderer.render(scene, camera);
    };
    animate(lastTime);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      domElement.removeEventListener('pointermove', updateSatelliteHoverTargets);
      domElement.removeEventListener('pointerleave', clearSatelliteHoverTargets);
      domElement.removeEventListener('pointercancel', clearSatelliteHoverTargets);
      geometry.dispose();
      satelliteData.forEach((sat) => {
        sat.geometry.dispose();
      });
      material.dispose();
      satelliteTintMaterials.forEach((m) => {
        m.dispose();
      });
      satelliteGlowLights.forEach((pl) => {
        scene.remove(pl);
      });
      scene.remove(centerFrontFill);
      scene.remove(ambient);
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main id="hero-main" style={containerStyle}>
      <div
        ref={mountRef}
        style={{
          ...canvasStyleBase,
          touchAction: isMobile ? 'pan-y' : 'none'
        }}
      />
      <div style={vignetteStyle} />
      <div style={grainStyle} />
      <div ref={labelLayerRef} style={labelLayerStyle} aria-hidden="true">
        {satelliteLabelTexts.map((text, index) => (
          <div
            key={text}
            id={`hero-sat-label-${index}`}
            style={{
              ...satelliteLabelBaseStyle,
              letterSpacing: isTinyMobile ? '0.22em' : satelliteLabelBaseStyle.letterSpacing,
              fontSize: `clamp(${Math.round(9 * heroTextMul * mobileLabelMul)}px, ${(1 * heroTextMul * mobileLabelMul).toFixed(2)}vw, ${Math.round(14 * heroTextMul * mobileLabelMul)}px)`
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <nav
        style={{
          ...anchorNavWrapStyle,
          left: isTablet ? (isMobile ? '14px' : '20px') : anchorNavWrapStyle.left,
          opacity: isMobile ? 0 : 1,
          pointerEvents: isMobile ? 'none' : 'auto'
        }}
      >
        <div style={anchorRailStyle}>
          {anchors.map((anchor, index) => {
            const isActive = activeAnchor === anchor.id;
            const isHovered = hoveredAnchor === anchor.id;
            const topPercent = anchors.length > 1 ? (index / (anchors.length - 1)) * 100 : 0;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToAnchor(anchor.id)}
                onMouseEnter={() => setHoveredAnchor(anchor.id)}
                onMouseLeave={() => setHoveredAnchor('')}
                style={{
                  position: 'absolute',
                  top: `${topPercent}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                  borderRadius: '50%',
                  border: `1px solid ${darkTheme.colors.border}`,
                  background: isActive ? darkTheme.colors.accent : isHovered ? darkTheme.colors.secondary : darkTheme.colors.muted,
                  boxShadow:
                    isActive || isHovered ? '0 0 16px rgba(255,255,255,0.35)' : '0 0 0 rgba(0,0,0,0)',
                  cursor: 'pointer',
                  transition: 'all 220ms ease',
                  padding: 0
                }}
                aria-label={anchor.label}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '50%',
                    transform: isHovered
                      ? 'translateY(-50%) translateX(0)'
                      : 'translateY(-50%) translateX(-8px)',
                    color: darkTheme.colors.primary,
                    fontSize: `${Math.max(11, Math.round(14 * heroTextMul))}px`,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    opacity: isHovered ? 0.95 : 0,
                    filter: isHovered ? 'blur(0px)' : 'blur(4px)',
                    textShadow: isHovered
                      ? '0 0 12px rgba(16,163,127,0.45)'
                      : '0 0 0 rgba(0,0,0,0)',
                    transition:
                      'opacity 260ms ease, transform 340ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease, text-shadow 260ms ease',
                    pointerEvents: 'none'
                  }}
                >
                  {anchor.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      <div
        style={{
          ...overlayStyle,
          paddingBottom: isMobile ? (isSmallMobile ? '7vh' : '9vh') : overlayStyle.paddingBottom
        }}
      >
        <h1
          ref={titleRef}
          style={{
            ...titleStyle,
            opacity: 0,
            top: isMobile ? '50%' : titleStyle.top,
            letterSpacing: isMobile
              ? isTinyMobile
                ? '0.16em'
                : isSmallMobile
                  ? '0.18em'
                  : '0.22em'
              : titleStyle.letterSpacing,
            fontSize: isMobile
              ? isTinyMobile
                ? 'clamp(22px, 6.2vw, 34px)'
                : isSmallMobile
                  ? 'clamp(24px, 6.8vw, 38px)'
                  : 'clamp(26px, 6.2vw, 44px)'
              : `clamp(${Math.round(26 * heroTextMul)}px, ${(8.5 * heroTextMul).toFixed(2)}vw, ${Math.round(92 * heroTextMul)}px)`,
            paddingInline: isMobile ? 'max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-right))' : 0,
            maxWidth: isMobile ? 'min(100%, 100vw - 24px)' : undefined,
            boxSizing: 'border-box'
          }}
        >
          QODEQ
        </h1>
        <p
          ref={subtitleRef}
          style={{
            ...subtitleStyle,
            opacity: 0,
            position: 'relative',
            transform: 'translateY(24px)',
            filter: 'blur(8px)',
            fontSize: isMobile ? (isTinyMobile ? '7px' : isSmallMobile ? '7.5px' : '8.25px') : `${Math.max(8, Math.round(10 * heroTextMul))}px`,
            letterSpacing: isMobile ? (isTinyMobile ? '0.1em' : isSmallMobile ? '0.12em' : '0.14em') : subtitleStyle.letterSpacing,
            textAlign: 'center',
            paddingInline: isMobile ? (isTinyMobile ? '14px' : '18px') : 0
          }}
        >
          Qodeq - AI platform automating operations in iGaming
        </p>
        <button
          ref={buttonRef}
          onMouseEnter={() => setIsButtonHover(true)}
          onMouseLeave={() => setIsButtonHover(false)}
          style={{
            ...buttonStyle,
            opacity: 0,
            position: 'relative',
            transform: 'translateY(42px)',
            filter: 'blur(6px)',
            fontSize: isMobile ? (isTinyMobile ? '9px' : isSmallMobile ? '9.5px' : '10.25px') : `${Math.max(9, Math.round(11 * heroTextMul))}px`,
            padding: isMobile
              ? isTinyMobile
                ? '8px 18px'
                : isSmallMobile
                  ? '8px 20px'
                  : '9px 22px'
              : `${Math.round(10 * heroTextMul)}px ${Math.round(26 * heroTextMul)}px`,
            boxShadow: isButtonHover ? '0 0 24px rgba(16,163,127,0.28)' : '0 0 0 rgba(0,0,0,0)',
            borderColor: isButtonHover ? darkTheme.colors.accentHover : darkTheme.colors.border,
            background: isButtonHover
              ? `linear-gradient(135deg, ${darkTheme.colors.accentHover}, ${darkTheme.colors.hover})`
              : `linear-gradient(135deg, ${darkTheme.colors.hover}, ${darkTheme.colors.surface})`
          }}
          type="button"
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 14,
              height: 14,
              borderTop: `1px solid ${darkTheme.colors.secondary}`,
              borderLeft: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 14,
              height: 14,
              borderRight: `1px solid ${darkTheme.colors.secondary}`,
              borderBottom: `1px solid ${darkTheme.colors.secondary}`,
              opacity: 0.8,
              pointerEvents: 'none'
            }}
          />
          Join the abyss
        </button>
      </div>
    </main>
  );
};
