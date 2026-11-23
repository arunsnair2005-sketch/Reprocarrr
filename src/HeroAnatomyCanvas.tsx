import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createReproductiveAnatomy } from '../three/createReproductiveAnatomy';
import { afterDraw, detectSoftwareWebGL, isWebGLAvailable } from '../three/webglUtils';
import { AnatomyFallbackSvg } from './AnatomyFallbackSvg';

interface HeroAnatomyCanvasProps {
  reducedMotion: boolean;
}

const DEFAULT_FOCUS_MAP = {
  uterus: 1.05,
  cervix: 0.95,
  'right-tube': 1.0,
  'left-tube': 1.0,
  'right-ovary': 1.1,
  'left-ovary': 1.1,
  fimbriae: 1.1,
};

export const HeroAnatomyCanvas: React.FC<HeroAnatomyCanvasProps> = ({ reducedMotion }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const isMobile = window.innerWidth < 768;

    const width = Math.max(mount.clientWidth, 300);
    const height = Math.max(mount.clientHeight, 300);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x12050b, 0.045);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 45);
    camera.position.set(0.2, 0.28, isMobile ? 6.9 : 5.75);
    camera.lookAt(0, -0.05, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // Studio three-point crimson/rose lighting rig
    const hemiLight = new THREE.HemisphereLight(0xf0b1c1, 0x220712, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffdfe8, 2.3);
    keyLight.position.set(3.2, 4.5, 4.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf0b1c1, 2.1);
    rimLight.position.set(-3.5, 2.2, -3.6);
    scene.add(rimLight);

    const internalGlowLight = new THREE.PointLight(0xd97893, 2.8, 7.5, 1.8);
    internalGlowLight.position.set(0, 0.15, 0.85);
    scene.add(internalGlowLight);

    const anatomy = createReproductiveAnatomy({ isSoftwareGl, isMobile });
    anatomy.root.position.set(0, -0.05, 0);
    scene.add(anatomy.root);

    // Post-processing bloom on hardware GPUs
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.38, 0.55, 0.72);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    } else {
      // Pre-warm shaders skipped on software GL
    }
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotionRef.current) return;
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const onContextRestored = () => {
      setWebglFailed(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!mount) return;
      const w = Math.max(mount.clientWidth, 240);
      const h = Math.max(mount.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
      if (bloomPass) bloomPass.resolution.set(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible && frameId === 0 && !disposed) {
            lastTime = performance.now();
            tick();
          }
        }
      },
      { rootMargin: '180px' }
    );
    io.observe(container);

    let frameId = 0;
    let disposed = false;
    let elapsed = 0;
    let lastTime = performance.now();

    const tick = () => {
      if (disposed || !isVisible) {
        frameId = 0;
        return;
      }

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const animateMotion = !reducedMotionRef.current;
      if (animateMotion) elapsed += dt;

      // Gentle continuous rotation + pointer parallax
      const targetRotY = animateMotion
        ? Math.sin(elapsed * 0.35) * 0.28 + pointer.x * 0.14
        : -0.15;
      const targetRotX = animateMotion
        ? 0.06 + Math.cos(elapsed * 0.28) * 0.06 - pointer.y * 0.08
        : 0.06;

      anatomy.root.rotation.y = THREE.MathUtils.damp(anatomy.root.rotation.y, targetRotY, 3.2, dt);
      anatomy.root.rotation.x = THREE.MathUtils.damp(anatomy.root.rotation.x, targetRotX, 3.2, dt);

      anatomy.update(elapsed, dt, DEFAULT_FOCUS_MAP, 0.45, animateMotion);

      if (composer && !isSoftwareGl) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        frameId = afterDraw(renderer, tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      io.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      anatomy.dispose();
      envTex.dispose();
      composer?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[380px]">
      {webglFailed ? (
        <AnatomyFallbackSvg className="h-full w-full" />
      ) : (
        <div
          ref={canvasMountRef}
          className="h-full w-full"
          aria-label="Interactive 3D translucent crimson glass sculpture of the female reproductive system"
        />
      )}
    </div>
  );
};
