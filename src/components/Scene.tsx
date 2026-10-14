import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Suspense } from 'react';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <Suspense fallback={<Html center>Loading...</Html>}>
        {/* Placeholder geometry: a simple box */}
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Suspense>
      <OrbitControls enablePan={true} enableZoom={true} />
    </Canvas>
  );
}

export default Scene;
