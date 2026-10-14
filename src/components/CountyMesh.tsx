import { useMemo } from 'react';
import { BufferGeometry, DoubleSide } from 'three';
import { ShaderMaterial } from 'three';
import { useLoader } from '@react-three/fiber';
import { createColorRampTexture } from '../utils/colors';
import vertexShader from '../shaders/county.vert.glsl?raw';
import fragmentShader from '../shaders/county.frag.glsl?raw';

type CountyMeshProps = {
  geometry: BufferGeometry;
  maxHeight: number;
};

export default function CountyMesh({ geometry, maxHeight }: CountyMeshProps) {
  const colorRampTexture = useMemo(() => createColorRampTexture(), []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uColorRamp: { value: colorRampTexture },
          uMaxHeight: { value: maxHeight },
        },
        side: DoubleSide,
      }),
    [colorRampTexture, maxHeight]
  );

  return <primitive object={geometry} material={material} />;
}
