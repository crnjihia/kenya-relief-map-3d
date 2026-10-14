import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { Vector3 } from 'three';

export interface CameraFocusControls {
  focusOn: (target: Vector3, distanceOffset?: number) => void;
  resetView: () => void;
}

export const DEFAULT_CAMERA_POS = new Vector3(0, 22, 24);
export const DEFAULT_TARGET_POS = new Vector3(0, 0, 0);

/**
 * Hook to smoothly animate the camera position and OrbitControls target
 * to focus on a county using GSAP.
 */
export default function useCameraFocus(): CameraFocusControls {
  const { camera, controls } = useThree();
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const focusOn = useCallback(
    (target: Vector3, distanceOffset: number = 8) => {
      if (!camera) return;

      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      const ctrl = controls as any;
      const targetCamPos = new Vector3(
        target.x,
        Math.max(5, target.y + distanceOffset * 0.75),
        target.z + distanceOffset
      );

      const animState = {
        camX: camera.position.x,
        camY: camera.position.y,
        camZ: camera.position.z,
        targetX: ctrl?.target ? ctrl.target.x : 0,
        targetY: ctrl?.target ? ctrl.target.y : 0,
        targetZ: ctrl?.target ? ctrl.target.z : 0,
      };

      tweenRef.current = gsap.to(animState, {
        camX: targetCamPos.x,
        camY: targetCamPos.y,
        camZ: targetCamPos.z,
        targetX: target.x,
        targetY: target.y,
        targetZ: target.z,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          camera.position.set(animState.camX, animState.camY, animState.camZ);
          if (ctrl?.target) {
            ctrl.target.set(animState.targetX, animState.targetY, animState.targetZ);
            ctrl.update();
          } else {
            camera.lookAt(target);
          }
        },
      });
    },
    [camera, controls]
  );

  const resetView = useCallback(() => {
    if (!camera) return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const ctrl = controls as any;
    const animState = {
      camX: camera.position.x,
      camY: camera.position.y,
      camZ: camera.position.z,
      targetX: ctrl?.target ? ctrl.target.x : 0,
      targetY: ctrl?.target ? ctrl.target.y : 0,
      targetZ: ctrl?.target ? ctrl.target.z : 0,
    };

    tweenRef.current = gsap.to(animState, {
      camX: DEFAULT_CAMERA_POS.x,
      camY: DEFAULT_CAMERA_POS.y,
      camZ: DEFAULT_CAMERA_POS.z,
      targetX: DEFAULT_TARGET_POS.x,
      targetY: DEFAULT_TARGET_POS.y,
      targetZ: DEFAULT_TARGET_POS.z,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        camera.position.set(animState.camX, animState.camY, animState.camZ);
        if (ctrl?.target) {
          ctrl.target.set(animState.targetX, animState.targetY, animState.targetZ);
          ctrl.update();
        } else {
          camera.lookAt(DEFAULT_TARGET_POS);
        }
      },
    });
  }, [camera, controls]);

  return { focusOn, resetView };
}
