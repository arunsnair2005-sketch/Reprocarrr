import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { ORGANS, OrganId, OrganInfo } from '../data/reprocareData';
import { createReproductiveAnatomy } from '../three/createReproductiveAnatomy';
import { afterDraw, detectSoftwareWebGL, isWebGLAvailable } from '../three/webglUtils';
import { AnatomyFallbackSvg } from './AnatomyFallbackSvg';

interface InteractiveExplorerSectionProps {
  reducedMotion: boolean;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 0.25, 5.85);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, -0.02, 0);

const ALL_ORGANS: OrganId[] = [
  'uterus',
  'right-ovary',
  'left-ovary',
  'right-tube',
  'left-tube',
  'cervix',
  'fimbriae',
];

export const InteractiveExplorerSection: React.FC<InteractiveExplorerSectionProps> = ({
  reducedMotion,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(reducedMotion);

  const [selectedOrganId, setSelectedOrganId] = useState<OrganId | null>(null);
  const [hoveredOrganId, setHoveredOrganId] = useState<OrganId | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const selectedRef = useRef<OrganId | null>(null);
  const hoveredRef = useRef<OrganId | null>(null);

  // Scripted camera transition state (cancelled when user drags OrbitControls)
  const cameraGoalRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: DEFAULT_CAMERA_POS.clone(),
    target: DEFAULT_CAMERA_TARGET.clone(),
  });

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const selectOrgan = useCallback((organId: OrganId | null) => {
    setSelectedOrganId(organId);
    selectedRef.current = organId;

    if (organId === null) {
      cameraGoalRef.current = {
        active: true,
        pos: DEFAULT_CAMERA_POS.clone(),
        target: DEFAULT_CAMERA_TARGET.clone(),
      };
      return;
    }

    const info = ORGANS.find((o) => o.id === organId);
    if (info) {
      cameraGoalRef.current = {
        active: true,
        pos: new THREE.Vector3(...info.cameraPos),
        target: new THREE.Vector3(...info.cameraTarget),
      };
    }
  }, []);

  const stepOrgan = useCallback(
    (direction: 1 | -1) => {
      if (!selectedOrganId) {
        selectOrgan(ORGANS[0].id);
        return;
      }
      const idx = ORGANS.findIndex((o) => o.id === selectedOrganId);
      const nextIdx = (idx + direction + ORGANS.length) % ORGANS.length;
      selectOrgan(ORGANS[nextIdx].id);
    },
    [selectedOrganId, selectOrgan]
  );

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

    const width = Math.max(mount.clientWidth, 300);
    const height = Math.max(mount.clientHeight, 360);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16050d);
    scene.fog = new THREE.FogExp2(0x16050d, 0.042);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 45);
    camera.position.copy(DEFAULT_CAMERA_POS);

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
    renderer.toneMappingExposure = 1.22;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xf0b1c1, 0x260714, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe5ec, 2.25);
    keyLight.position.set(3.5, 4.5, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf0b1c1, 2.1);
    rimLight.position.set(-4.0, 2.0, -3.5);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(0xd97893, 2.5, 8.0, 1.7);
    coreLight.position.set(0, 0.2, 1.2);
    scene.add(coreLight);

    const anatomy = createReproductiveAnatomy({ isSoftwareGl, isMobile });
    scene.add(anatomy.root);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 9.0;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = Math.PI - 0.45;
    controls.target.copy(DEFAULT_CAMERA_TARGET);

    const cancelScriptedCamera = () => {
      cameraGoalRef.current.active = false;
    };
    controls.addEventListener('start', cancelScriptedCamera);

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.36, 0.55, 0.74);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      renderer.compile(scene, camera);
    }

    // Raycasting setup (Layer 1 only for crisp picking)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
    };

    const pickOrgan = (clientX: number, clientY: number): OrganId | null => {
      updateNdc(clientX, clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(anatomy.raycastTargets, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.organId as OrganId) ?? null;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      // Only treat as click/tap if user didn't drag to orbit
      if (dist < 6) {
        const picked = pickOrgan(e.clientX, e.clientY);
        if (picked) {
          selectOrgan(picked);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 45) return;
      lastHoverTime = now;
      const picked = pickOrgan(e.clientX, e.clientY);
      if (picked !== hoveredRef.current) {
        hoveredRef.current = picked;
        setHoveredOrganId(picked);
        renderer.domElement.style.cursor = picked ? 'pointer' : 'grab';
      }
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = 'grab';
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('pointermove', onPointerMove);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const onContextRestored = () => setWebglFailed(false);
    domEl.addEventListener('webglcontextlost', onContextLost);
    domEl.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!mount) return;
      const w = Math.max(mount.clientWidth, 240);
      const h = Math.max(mount.clientHeight, 320);
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

      // Damped scripted camera focusing when organ selected or reset
      const goal = cameraGoalRef.current;
      if (goal.active) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, goal.pos.x, 5.2, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, goal.pos.y, 5.2, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, goal.pos.z, 5.2, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, goal.target.x, 5.2, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, goal.target.y, 5.2, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, goal.target.z, 5.2, dt);

        const posDist = camera.position.distanceTo(goal.pos);
        const tgtDist = controls.target.distanceTo(goal.target);
        if (posDist < 0.015 && tgtDist < 0.015) {
          goal.active = false;
        }
      }

      controls.update();

      const sel = selectedRef.current;
      const hov = hoveredRef.current;
      for (const id of ALL_ORGANS) {
        if (sel) {
          focusMap[id] = id === sel ? 1.68 : id === hov ? 0.65 : 0.22;
        } else if (hov) {
          focusMap[id] = id === hov ? 1.45 : 0.72;
        } else {
          focusMap[id] = 1.0;
        }
      }

      const hormoneLevel =
        sel === 'left-ovary' || sel === 'right-ovary' ? 0.95 : sel ? 0.35 : 0.5;
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
      controls.removeEventListener('start', cancelScriptedCamera);
      controls.dispose();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      domEl.removeEventListener('webglcontextrestored', onContextRestored);
      anatomy.dispose();
      envTex.dispose();
      composer?.dispose();
      renderer.dispose();
      if (domEl.parentNode === mount) {
        mount.removeChild(domEl);
      }
    };
  }, [selectOrgan]);

  const activeInfo: OrganInfo | null = selectedOrganId
    ? ORGANS.find((o) => o.id === selectedOrganId) ?? null
    : null;

  const hoveredInfo: OrganInfo | null = hoveredOrganId
    ? ORGANS.find((o) => o.id === hoveredOrganId) ?? null
    : null;

  const handleViewportKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      stepOrgan(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      stepOrgan(-1);
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'r') {
      selectOrgan(null);
    }
  };

  return (
    <section
      id="explorer"
      aria-labelledby="explorer-heading"
      className="relative border-b border-[#F0B1C1]/10 bg-[#1B0710] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
              Interactive 3D Anatomy Explorer
            </p>
            <h2
              id="explorer-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl lg:text-[2.75rem]"
            >
              Inspect every structure in spatial detail.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#F7E9ED]/70">
            Click directly on any 3D structure, drag to orbit, or use the docked anatomical selector
            and keyboard arrows to examine physiological roles.
          </p>
        </div>

        {/* Split Interactive Workspace: Unobstructed 3D Stage + Dedicated Monograph Panel */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* 3D Viewport Column */}
          <div
            ref={stageRef}
            tabIndex={0}
            onKeyDown={handleViewportKeyDown}
            aria-label="Interactive 3D reproductive anatomy viewport. Use arrow keys to cycle structures or Escape to reset view."
            className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-2xl border border-[#F0B1C1]/15 bg-[#12050B] lg:col-span-7 lg:min-h-[600px]"
          >
            {/* Top Minimal HUD Status */}
            <div className="pointer-events-none relative z-20 flex items-center justify-between px-5 pt-4 text-xs text-[#F7E9ED]/75">
              <span>
                {hoveredInfo
                  ? `Hovering: ${hoveredInfo.name}`
                  : activeInfo
                  ? `Focused: ${activeInfo.name}`
                  : 'Drag to orbit · Scroll to zoom · Click an organ'}
              </span>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setControlsCollapsed((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0B1C1]/20 bg-[#1B0710]/95 px-3 py-1.5 text-xs font-medium text-[#F7E9ED]/85 transition-colors hover:border-[#F0B1C1]/50 hover:text-[#F0B1C1] whitespace-nowrap shrink-0"
                  aria-expanded={!controlsCollapsed}
                >
                  {controlsCollapsed ? (
                    <>
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Show Controls</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hide Controls</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => selectOrgan(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0B1C1]/25 bg-[#310A1A]/95 px-3 py-1.5 text-xs font-medium text-[#F7E9ED] transition-colors hover:border-[#F0B1C1] hover:bg-[#8C1638] whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset View</span>
                </button>
              </div>
            </div>

            {/* Unobstructed 3D Canvas */}
            <div className="absolute inset-0 z-10">
              {webglFailed ? (
                <AnatomyFallbackSvg activeOrgan={selectedOrganId} className="h-full w-full p-6" />
              ) : (
                <div ref={canvasMountRef} className="h-full w-full" />
              )}
            </div>

            {/* Collapsible Bottom Control Dock */}
            <div
              className={`relative z-20 px-4 pb-4 transition-transform duration-300 ${
                controlsCollapsed ? 'translate-y-full pointer-events-none opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              <div
                role="tablist"
                aria-label="Select anatomical structure"
                className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#F0B1C1]/20 bg-[#12050B]/95 p-2"
              >
                {ORGANS.map((organ) => {
                  const isSelected = selectedOrganId === organ.id;
                  return (
                    <button
                      key={organ.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => selectOrgan(organ.id)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                        isSelected
                          ? 'bg-[#8C1638] text-[#F7E9ED] border border-[#F0B1C1]/40'
                          : 'text-[#F7E9ED]/75 hover:bg-[#310A1A] hover:text-[#F7E9ED] border border-transparent'
                      }`}
                    >
                      {organ.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dedicated Educational Monograph Column */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#F0B1C1]/15 bg-[#12050B] p-6 sm:p-8 lg:col-span-5">
            {activeInfo ? (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-[#F0B1C1]/15 pb-4">
                  <div className="flex items-center gap-2 text-xs text-[#D97893]">
                    <span>{activeInfo.region}</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic">{activeInfo.latinName}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepOrgan(-1)}
                      aria-label="Previous anatomical structure"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0B1C1]/15 text-[#F7E9ED]/80 transition-colors hover:border-[#F0B1C1]/50 hover:text-[#F0B1C1]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepOrgan(1)}
                      aria-label="Next anatomical structure"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0B1C1]/15 text-[#F7E9ED]/80 transition-colors hover:border-[#F0B1C1]/50 hover:text-[#F0B1C1]"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED]">
                  {activeInfo.name}
                </h3>

                <div className="mt-4 border-y border-[#F0B1C1]/10 py-4">
                  <p className="text-xs font-medium tracking-wider uppercase text-[#F0B1C1]">
                    Primary Function
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#F7E9ED]">
                    {activeInfo.primaryFunction}
                  </p>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-[#F7E9ED]/80 sm:text-[15px]">
                  {activeInfo.description}
                </p>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-medium tracking-wider uppercase text-[#D97893]">
                    Physiological Highlights
                  </p>
                  <ul className="space-y-3 text-sm leading-relaxed text-[#F7E9ED]/75">
                    {activeInfo.educationalPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-0.5 tabular-nums text-xs font-semibold text-[#F0B1C1]">
                          0{idx + 1}.
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#D97893]">
                    Anatomical Monograph
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-[#F7E9ED] sm:text-3xl">
                    Select an organ to illuminate its role.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-[15px]">
                    Every structure in the female reproductive system operates in continuous
                    coordination. Choosing any organ dims surrounding structures, smoothly focuses
                    the optical camera, and opens its anatomical profile.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-2 border-t border-[#F0B1C1]/12 pt-6 sm:grid-cols-2">
                    {ORGANS.map((organ, i) => (
                      <button
                        key={organ.id}
                        type="button"
                        onClick={() => selectOrgan(organ.id)}
                        className="flex items-center justify-between rounded-lg border border-[#F0B1C1]/12 bg-[#1B0710]/70 px-3.5 py-2.5 text-left text-xs font-medium text-[#F7E9ED]/85 transition-colors hover:border-[#D97893]/50 hover:bg-[#310A1A] hover:text-[#F7E9ED]"
                      >
                        <span>{organ.name}</span>
                        <span className="tabular-nums text-[#D97893]">0{i + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-8 border-t border-[#F0B1C1]/10 pt-4 text-xs leading-relaxed text-[#F7E9ED]/55">
                  Educational model for scientific visualization. Individual anatomy varies naturally
                  in size, orientation, and cycle morphology.
                </p>
              </div>
            )}

            {activeInfo && (
              <div className="mt-8 flex items-center justify-between border-t border-[#F0B1C1]/12 pt-4">
                <span className="text-xs text-[#F7E9ED]/55">
                  Educational reference · Not medical advice
                </span>
                <button
                  type="button"
                  onClick={() => selectOrgan(null)}
                  className="text-xs font-medium text-[#F0B1C1] underline-offset-4 hover:underline"
                >
                  View Full System
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
