import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { gsap } from 'gsap';
import { Vector3 } from 'three';

/**
 * Hook to animate the camera to focus on a given world coordinate.
 * Uses GSAP for smooth transition.
 */
export default function useCameraFocus() {
  const { camera, controls } = useThree();

  const focusOn = useCallback((target: Vector3) => {
    if (!camera) return;
    // Simple animation: move camera to a point offset from target and look at target
    gsap.to(camera.position, {
      x: target.x,
      y: target.y + 5,
      z: target.z + 5,
      duration: 1,
      onUpdate: () => {
        camera.lookAt(target);
        if (controls && typeof (controls as any).update === 'function') {
          (controls as any).update();
        }
      },
    });
  }, [camera, controls]);

  return focusOn;
}
