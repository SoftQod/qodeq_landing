import { useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const boxesHoverTheme = {
  background: '#0D0D0D',
  box: '#1A1A1A',
  boxHover: '#10A37F',
  boxGlow: '#14C896',
  edge: '#2D2D2D'
};

function hexColor(hex) {
  return new THREE.Color(hex);
}

function BoxField({ cols, rows, boxSize, gap }) {
  const meshRef = useRef(null);
  const pointerCell = useRef({ x: -999, y: -999 });
  const lifts = useRef(null);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const count = cols * rows;
  const gridW = cols * (boxSize + gap) - gap;
  const gridD = rows * (boxSize + gap) - gap;
  const offsetX = -gridW * 0.5 + boxSize * 0.5;
  const offsetZ = -gridD * 0.5 + boxSize * 0.5;

  const baseColor = useMemo(() => hexColor(boxesHoverTheme.box), []);
  const hoverColor = useMemo(() => hexColor(boxesHoverTheme.boxHover), []);
  const glowColor = useMemo(() => hexColor(boxesHoverTheme.boxGlow), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const cellCenter = useCallback(
    (col, row) => ({
      x: offsetX + col * (boxSize + gap),
      z: offsetZ + row * (boxSize + gap)
    }),
    [offsetX, offsetZ, boxSize, gap]
  );

  useMemo(() => {
    lifts.current = new Float32Array(count);
  }, [count]);

  const geometry = useMemo(() => new THREE.BoxGeometry(boxSize, boxSize, boxSize), [boxSize]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    for (let i = 0; i < count; i += 1) {
      mesh.setColorAt(i, baseColor);
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [count, baseColor]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || !lifts.current) {
      return;
    }

    const { camera, pointer } = state;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(plane, hitPoint);
    if (hit) {
      pointerCell.current = {
        x: Math.round((hitPoint.x - offsetX) / (boxSize + gap)),
        y: Math.round((hitPoint.z - offsetZ) / (boxSize + gap))
      };
    }

    const { x: px, y: py } = pointerCell.current;
    const hoverRadius = 2.35;
    const dt = Math.min(state.clock.getDelta(), 0.05);
    const lerpK = 1 - Math.pow(0.06, dt * 60);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const i = row * cols + col;
        const dx = col - px;
        const dz = row - py;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const influence = Math.max(0, 1 - dist / hoverRadius);
        const targetLift = influence * influence * 1.2;
        lifts.current[i] += (targetLift - lifts.current[i]) * lerpK;

        const t = Math.min(1, lifts.current[i] / 1.2);
        const mix = t * t * (3 - 2 * t);
        tempColor.copy(baseColor).lerp(hoverColor, mix).lerp(glowColor, mix * 0.2);
        mesh.setColorAt(i, tempColor);

        const { x, z } = cellCenter(col, row);
        const lift = lifts.current[i];
        const scaleXZ = 1 + lift * 0.1;
        dummy.position.set(x, lift * 0.5, z);
        dummy.scale.set(scaleXZ, 1 + lift * 0.5, scaleXZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial vertexColors metalness={0.38} roughness={0.4} />
    </instancedMesh>
  );
}

function SceneContent({ density }) {
  const { cols, rows, boxSize, gap } = density;

  return (
    <>
      <color attach="background" args={[boxesHoverTheme.background]} />
      <fog attach="fog" args={[boxesHoverTheme.background, 16, 48]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[8, 16, 10]} intensity={1.05} />
      <directionalLight position={[-6, 8, -6]} intensity={0.28} color="#10A37F" />
      <pointLight position={[0, 6, 2]} intensity={0.45} color="#10A37F" distance={28} />
      <BoxField cols={cols} rows={rows} boxSize={boxSize} gap={gap} />
    </>
  );
}

export const BoxesHoverCanvas = ({ isMobile, isSmallMobile }) => {
  const density = useMemo(() => {
    if (isSmallMobile) {
      return { cols: 12, rows: 10, boxSize: 0.72, gap: 0.14 };
    }
    if (isMobile) {
      return { cols: 14, rows: 11, boxSize: 0.78, gap: 0.15 };
    }
    return { cols: 20, rows: 14, boxSize: 0.82, gap: 0.16 };
  }, [isMobile, isSmallMobile]);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [11, 12, 15], fov: 42, near: 0.1, far: 80 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <SceneContent density={density} />
    </Canvas>
  );
};
