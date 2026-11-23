import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JOURNEY_SCENES, OrganId } from '../data/reprocareData';
import { createReproductiveAnatomy } from '../three/createReproductiveAnatomy';
import { afterDraw, detectSoftwareWebGL, isWebGLAvailable } from '../three/webglUtils';
import { AnatomyFallbackSvg } from './AnatomyFallbackSvg';

gsap.registerPlugin(ScrollTrigger);

interface ScrollJourneySectionProps {
  reducedMotion: boolean;
}

const ALL_ORGANS: OrganId[] = [
  'uterus',
  'cervix',
  'right-tube',
  'left-tube',
  'right-ovary',
  'left-ovary',
  'fimbriae',
];

// Pre-allocated vectors for zero-GC interpolation inside the render loop
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _modelPos = new THREE.Vector3();
const _bgColor = new THREE.Color();
const _bgColorA = new THREE.Color();
const _bgColorB = new THREE.Color();

export const ScrollJourneySection: React.FC<ScrollJourneySectionProps> = ({ reducedMotion }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(reducedMotion);

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);

  // Continuous normalized journey progress [0..1] driven by GSAP ScrollTrigger scrub
  const scrollProgressRef = useRef(0);
  const activeSceneIndexRef = useRef(0);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      scrollProgressRef.current = activeSceneIndex / (JOURNEY_SCENES.length - 1);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.05,
        onUpdate: (self) => {
          const p = THREE.MathUtils.clamp(self.progress, 0, 1);
          scrollProgressRef.current = p;

          const totalSegments = JOURNEY_SCENES.length - 1;
          const idx = Math.min(
            JOURNEY_SCENES.length - 1,
            Math.floor(p * JOURNEY_SCENES.length * 0.999)
          );
          if (idx !== activeSceneIndexRef.current) {
            activeSceneIndexRef.current = idx;
            setActiveSceneIndex(idx);
          }
          setSceneProgress(p * totalSegments);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, activeSceneIndex]);

  // Three.js Pinned Stage Setup
  useEffect(() => {
    const mount = canvasMountRef.current;
    const stage = stageRef.current;
    if (!mount || !stage) return;

    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const isMobile = window.innerWidth < 768;

    const width = Math.max(mount.clientWidth, 320);
    const height = Math.max(mount.clientHeight, 320);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12050b);
    scene.fog = new THREE.FogExp2(0x12050b, 0.045);

    const camera = new THREE.PerspectiveCamera(isMobile ? 44 : 36, width / height, 0.1, 50);
    camera.position.set(0, 0.25, 6.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xf0b1c1, 0x220712, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe3eb, 2.2);
    keyLight.position.set(3.5, 4.8, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf0b1c1, 2.0);
    rimLight.position.set(-4.0, 2.0, -3.5);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(0xd97893, 2.6, 8.5, 1.7);
    coreLight.position.set(0, 0.25, 1.1);
    scene.add(coreLight);

    const anatomy = createReproductiveAnatomy({ isSoftwareGl, isMobile });
    scene.add(anatomy.root);

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.42, 0.6, 0.7);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      renderer.compile(scene, camera);
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const onContextRestored = () => setWebglFailed(false);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!mount) return;
      const w = Math.max(mount.clientWidth, 240);
      const h = Math.max(mount.clientHeight, 240);
      const mob = w < 768;
      camera.fov = mob ? 44 : 36;
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
      { rootMargin: '250px' }
    );
    io.observe(stage);

    const focusMap: Record<OrganId, number> = {
      uterus: 1,
      cervix: 1,
      'right-tube': 1,
      'left-tube': 1,
      'right-ovary': 1,
      'left-ovary': 1,
      fimbriae: 1,
    };

    const currentLookAt = new THREE.Vector3(0, 0, 0);
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

      const totalSegs = JOURNEY_SCENES.length - 1;
      const scaled = scrollProgressRef.current * totalSegs;
      const idxA = Math.min(totalSegs, Math.floor(scaled));
      const idxB = Math.min(totalSegs, idxA + 1);
      const rawT = scaled - idxA;
      // Smooth cubic hermite interpolation between scenes
      const t = rawT * rawT * (3 - 2 * rawT);

      const sceneA = JOURNEY_SCENES[idxA];
      const sceneB = JOURNEY_SCENES[idxB];

      const isNarrow = mount.clientWidth < 900;
      const offsetScaleX = isNarrow ? 0.15 : 1.0;
      const mobileZBoost = isNarrow ? 1.35 : 0;

      // Interpolate camera position and target
      _camPos.set(
        THREE.MathUtils.lerp(sceneA.cameraPos[0], sceneB.cameraPos[0], t),
        THREE.MathUtils.lerp(sceneA.cameraPos[1], sceneB.cameraPos[1], t),
        THREE.MathUtils.lerp(sceneA.cameraPos[2], sceneB.cameraPos[2], t) + mobileZBoost
      );
      _camTarget.set(
        THREE.MathUtils.lerp(sceneA.cameraTarget[0], sceneB.cameraTarget[0], t),
        THREE.MathUtils.lerp(sceneA.cameraTarget[1], sceneB.cameraTarget[1], t),
        THREE.MathUtils.lerp(sceneA.cameraTarget[2], sceneB.cameraTarget[2], t)
      );

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _camPos.x, 6.0, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _camPos.y, 6.0, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _camPos.z, 6.0, dt);

      currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, _camTarget.x, 6.0, dt);
      currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, _camTarget.y, 6.0, dt);
      currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, _camTarget.z, 6.0, dt);
      camera.lookAt(currentLookAt);

      // Interpolate model position & rotation
      _modelPos.set(
        THREE.MathUtils.lerp(sceneA.modelOffset[0], sceneB.modelOffset[0], t) * offsetScaleX,
        THREE.MathUtils.lerp(sceneA.modelOffset[1], sceneB.modelOffset[1], t) + (isNarrow ? 0.35 : 0),
        THREE.MathUtils.lerp(sceneA.modelOffset[2], sceneB.modelOffset[2], t)
      );
      anatomy.root.position.x = THREE.MathUtils.damp(anatomy.root.position.x, _modelPos.x, 5.5, dt);
      anatomy.root.position.y = THREE.MathUtils.damp(anatomy.root.position.y, _modelPos.y, 5.5, dt);
      anatomy.root.position.z = THREE.MathUtils.damp(anatomy.root.position.z, _modelPos.z, 5.5, dt);

      const idleYaw = animateMotion ? Math.sin(elapsed * 0.25) * 0.08 : 0;
      const targetRotX = THREE.MathUtils.lerp(sceneA.modelRotation[0], sceneB.modelRotation[0], t);
      const targetRotY =
        THREE.MathUtils.lerp(sceneA.modelRotation[1], sceneB.modelRotation[1], t) + idleYaw;
      const targetRotZ = THREE.MathUtils.lerp(sceneA.modelRotation[2], sceneB.modelRotation[2], t);

      anatomy.root.rotation.x = THREE.MathUtils.damp(anatomy.root.rotation.x, targetRotX, 5.5, dt);
      anatomy.root.rotation.y = THREE.MathUtils.damp(anatomy.root.rotation.y, targetRotY, 5.5, dt);
      anatomy.root.rotation.z = THREE.MathUtils.damp(anatomy.root.rotation.z, targetRotZ, 5.5, dt);

      // Smoothly blend organ focus weights between sceneA and sceneB
      for (const id of ALL_ORGANS) {
        const wA =
          sceneA.focusOrgans === 'all' ? 1.0 : sceneA.focusOrgans.includes(id) ? 1.55 : 0.2;
        const wB =
          sceneB.focusOrgans === 'all' ? 1.0 : sceneB.focusOrgans.includes(id) ? 1.55 : 0.2;
        focusMap[id] = THREE.MathUtils.lerp(wA, wB, t);
      }

      // Lighting & background mood shift
      const lightMult = THREE.MathUtils.lerp(sceneA.lightIntensity, sceneB.lightIntensity, t);
      keyLight.intensity = 2.1 * lightMult;
      coreLight.intensity = 2.4 * lightMult;

      _bgColorA.set(sceneA.bgTone);
      _bgColorB.set(sceneB.bgTone);
      _bgColor.copy(_bgColorA).lerp(_bgColorB, t);
      (scene.background as THREE.Color).copy(_bgColor);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(_bgColor);
      }

      const hormoneLevel = THREE.MathUtils.lerp(
        sceneA.hormoneParticleIntensity,
        sceneB.hormoneParticleIntensity,
        t
      );
      anatomy.update(elapsed, dt, focusMap, hormoneLevel, animateMotion);

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

  const jumpToScene = (index: number) => {
    setActiveSceneIndex(index);
    const total = JOURNEY_SCENES.length - 1;
    if (reducedMotion) {
      scrollProgressRef.current = index / total;
      setSceneProgress(index);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const targetY = sectionTop + (index / total) * scrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const currentScene = JOURNEY_SCENES[activeSceneIndex];

  return (
    <section
      id="journey"
      ref={sectionRef}
      aria-label="Scroll-Controlled 3D Anatomical Journey"
      className={`relative w-full bg-[#12050B] ${reducedMotion ? 'min-h-screen' : 'h-[480vh]'}`}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden border-y border-[#F0B1C1]/10"
      >
        {/* Full-bleed pinned 3D stage */}
        <div className="absolute inset-0 z-0">
          {webglFailed ? (
            <div className="flex h-full w-full items-center justify-end pr-8 lg:pr-24">
              <AnatomyFallbackSvg
                activeOrgan={
                  currentScene.focusOrgans === 'all' ? null : currentScene.focusOrgans[0]
                }
                className="h-[70%] w-full max-w-[600px]"
              />
            </div>
          ) : (
            <div ref={canvasMountRef} className="h-full w-full" />
          )}
        </div>

        {/* Contrast scrim behind left editorial narrative */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(18,5,11,0.90) 0%, rgba(18,5,11,0.62) 42%, rgba(18,5,11,0.08) 78%, rgba(18,5,11,0.35) 100%)',
          }}
        />

        {/* Subtle mobile bottom scrim */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 lg:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,5,11,0) 0%, rgba(18,5,11,0.92) 45%, rgba(18,5,11,0.98) 100%)',
          }}
        />

        {/* Editorial Storytelling Overlay */}
        <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-20 sm:px-10 lg:px-14 lg:py-24">
          {/* Top quiet anatomical annotation */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[#F0B1C1]">
              <span className="tabular-nums font-semibold">
                {currentScene.index} / 0{JOURNEY_SCENES.length}
              </span>
              <span aria-hidden="true" className="text-[#D97893]/60">
                ·
              </span>
              <span>{currentScene.annotationLabel}</span>
            </div>

            <a
              href="#explorer"
              className="hidden sm:inline-flex items-center gap-2 border-b border-[#F0B1C1]/30 pb-1 text-xs font-medium tracking-wider uppercase text-[#F7E9ED]/80 transition-colors hover:border-[#F0B1C1] hover:text-[#F0B1C1] whitespace-nowrap shrink-0"
            >
              Skip to Interactive Explorer
            </a>
          </div>

          {/* Main narrative block + Chapter selector */}
          <div className="flex flex-col justify-end gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                {currentScene.label}
              </p>

              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]">
                {currentScene.title}
              </h2>

              <p className="font-editorial mt-3 text-xl italic text-[#F0B1C1] sm:text-2xl">
                {currentScene.subtitle}
              </p>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#F7E9ED]/80 sm:text-base">
                {currentScene.description}
              </p>
            </div>

            {/* Chapter index & direct jump controls */}
            <nav
              aria-label="Anatomical journey chapters"
              className="flex flex-row items-center gap-2 overflow-x-auto pb-1 lg:flex-col lg:items-end lg:gap-2.5"
            >
              {JOURNEY_SCENES.map((sc, idx) => {
                const isActive = idx === activeSceneIndex;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => jumpToScene(idx)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#310A1A]/90 text-[#F7E9ED] border border-[#D97893]/45'
                        : 'text-[#F7E9ED]/55 hover:text-[#F7E9ED] border border-transparent hover:border-[#D97893]/20'
                    }`}
                  >
                    <span className="tabular-nums font-semibold text-[#F0B1C1]">{sc.index}</span>
                    <span className="hidden sm:inline">
                      {sc.label.replace(/^Scene \d+ — /, '')}
                    </span>
                  </button>
                );
              })}

              {!reducedMotion && (
                <div className="hidden lg:flex items-center gap-3 pt-2 text-[11px] tracking-widest uppercase text-[#F7E9ED]/45">
                  <span>Scroll to travel</span>
                  <span className="h-px w-12 bg-[#310A1A] overflow-hidden">
                    <span
                      className="block h-full bg-[#F0B1C1] transition-transform duration-150 origin-left"
                      style={{
                        transform: `scaleX(${Math.max(
                          0.05,
                          sceneProgress / (JOURNEY_SCENES.length - 1)
                        )})`,
                      }}
                    />
                  </span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
};
