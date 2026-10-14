import { useMemo } from 'react';
import { BufferGeometry, DoubleSide, ShaderMaterial, Color } from 'three';
import { ShaderMaterial } from 'three';
import { useLoader } from '@react-three/fiber';
import { createColorRampTexture } from '../utils/colors';
import vertexShader from '../shaders/county.vert.glsl?raw';
import fragmentShader from '../shaders/county.frag.glsl?raw';

type CountyMeshProps = {
  geometry: BufferGeometry;
  maxHeight: number;
  id?: string;
  isHovered?: boolean;
};

export default function CountyMesh({ geometry, maxHeight, id, isHovered }: CountyMeshProps) {
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
        // Highlight when hovered by increasing emissive intensity via a uniform (simple approach)
      }),
    [colorRampTexture, maxHeight]
  );

  // Set userData for raycasting
  const meshRef = useMemo(() => ({ userData: { id } }), [id]);

  // Apply simple hover effect by modifying material color (not a uniform for demo)
  if (isHovered) {
    material.emissive = new Color(0xffff00);
    material.emissiveIntensity = 0.5;
  } else {
    material.emissive = new Color(0x000000);
    material.emissiveIntensity = 0;
  }

  return <primitive object={geometry} material={material} {...meshRef} />;
}
