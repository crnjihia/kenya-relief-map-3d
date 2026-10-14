import { useMemo, useRef, useEffect } from 'react';
import {
  BufferGeometry,
  DoubleSide,
  ShaderMaterial,
  Mesh,
  Vector3,
  EdgesGeometry,
  LineBasicMaterial,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { gsap } from 'gsap';
import { createColorRampTexture } from '../utils/colors';
import vertexShader from '../shaders/county.vert.glsl?raw';
import fragmentShader from '../shaders/county.frag.glsl?raw';

export interface CountyMeshProps {
  id: string;
  name: string;
  geometry: BufferGeometry;
  center: Vector3;
  normalizedValue: number;
  height: number;
  isHovered: boolean;
  isSelected: boolean;
  onClick: (id: string, center: Vector3) => void;
  onHover: (id: string | null, clientX?: number, clientY?: number) => void;
}

export default function CountyMesh({
  id,
  name,
  geometry,
  center,
  normalizedValue,
  height,
  isHovered,
  isSelected,
  onClick,
  onHover,
}: CountyMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const colorRampTexture = useMemo(() => createColorRampTexture(), []);

  // Material with GLSL shader and uniforms
  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColorRamp: { value: colorRampTexture },
        uNormalizedValue: { value: 0.0 },
        uHover: { value: 0.0 },
        uSelected: { value: 0.0 },
        uMaxHeight: { value: 3.5 },
      },
      side: DoubleSide,
    });
  }, [colorRampTexture]);

  // Clean edge borders for crisp boundary definition
  const edgeGeometry = useMemo(() => {
    return new EdgesGeometry(geometry, 25);
  }, [geometry]);

  const edgeMaterial = useMemo(() => {
    return new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      depthTest: true,
    });
  }, []);

  // GSAP animation for smooth height extrusion morph and color transition
  useEffect(() => {
    if (!meshRef.current) return;

    // Smoothly animate height scale along Y
    gsap.to(meshRef.current.scale, {
      y: Math.max(0.12, height),
      duration: 0.85,
      ease: 'power3.out',
    });

    // Smoothly animate shader normalized value
    gsap.to(material.uniforms.uNormalizedValue, {
      value: normalizedValue,
      duration: 0.85,
      ease: 'power3.out',
    });
  }, [height, normalizedValue, material]);

  // Animate hover state uniform
  useEffect(() => {
    gsap.to(material.uniforms.uHover, {
      value: isHovered ? 1.0 : 0.0,
      duration: 0.22,
      ease: 'power2.out',
    });
  }, [isHovered, material]);

  // Animate selected state uniform
  useEffect(() => {
    gsap.to(material.uniforms.uSelected, {
      value: isSelected ? 1.0 : 0.0,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [isSelected, material]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(id, center);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(id, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(id, e.clientX, e.clientY);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        userData={{ id, name }}
      >
        <lineSegments geometry={edgeGeometry} material={edgeMaterial} />
      </mesh>
    </group>
  );
}
