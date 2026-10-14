import { Suspense, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import KenyaMap from './KenyaMap';
import useCameraFocus, { DEFAULT_CAMERA_POS, DEFAULT_TARGET_POS } from '../hooks/useCameraFocus';
import type { CountyFeatureItem } from '../hooks/useGeoData';
import type { IndicatorsPayload, MetricType } from '../hooks/useCountyIndicators';

export interface SceneHandle {
  focusOn: (target: Vector3) => void;
  resetView: () => void;
}

interface SceneProps {
  metric: MetricType;
  countyItems: CountyFeatureItem[];
  indicators: IndicatorsPayload | null;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null, clientX?: number, clientY?: number) => void;
  onSelect: (id: string | null, center?: Vector3) => void;
  focusTarget: Vector3 | null;
}

// Inner component inside Canvas to have access to React Three Fiber context
function CameraController({
  focusTarget,
  forwardedRef,
}: {
  focusTarget: Vector3 | null;
  forwardedRef: React.ForwardedRef<SceneHandle>;
}) {
  const { focusOn, resetView } = useCameraFocus();

  useImperativeHandle(forwardedRef, () => ({
    focusOn,
    resetView,
  }));

  useEffect(() => {
    if (focusTarget) {
      focusOn(focusTarget, 9);
    }
  }, [focusTarget, focusOn]);

  return null;
}

const Scene = forwardRef<SceneHandle, SceneProps>(function Scene(
  {
    metric,
    countyItems,
    indicators,
    hoveredId,
    selectedId,
    onHover,
    onSelect,
    focusTarget,
  },
  ref
) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none bg-slate-950">
      <Canvas
        camera={{ position: [DEFAULT_CAMERA_POS.x, DEFAULT_CAMERA_POS.y, DEFAULT_CAMERA_POS.z], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030712']} />

        {/* Ambient & directional lighting for rich 3D shading */}
        <ambientLight intensity={0.6} color="#e2e8f0" />
        <directionalLight
          position={[14, 25, 18]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <directionalLight
          position={[-15, 12, -15]}
          intensity={0.4}
          color="#38bdf8"
        />

        {/* Subtle background starfield for depth */}
        <Stars radius={70} depth={40} count={1200} factor={3} saturation={0.5} fade speed={0.8} />

        <Suspense fallback={null}>
          <KenyaMap
            metric={metric}
            countyItems={countyItems}
            indicators={indicators}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={onHover}
            onSelect={onSelect}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2 - 0.08} // Prevent camera going below ground
          minDistance={6}
          maxDistance={70}
          target={[DEFAULT_TARGET_POS.x, DEFAULT_TARGET_POS.y, DEFAULT_TARGET_POS.z]}
        />

        <CameraController focusTarget={focusTarget} forwardedRef={ref} />
      </Canvas>
    </div>
  );
});

export default Scene;
