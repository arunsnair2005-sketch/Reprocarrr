import * as THREE from 'three';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const ok = Boolean(gl);
    if (gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    }
    return ok;
  } catch {
    return false;
  }
}

export function afterDraw(renderer: THREE.WebGLRenderer, cb: () => void): number {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (!gl || typeof gl.fenceSync !== 'function') {
    return window.setTimeout(cb, 80);
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  let timerId = 0;
  const poll = () => {
    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      timerId = window.setTimeout(poll, 5);
    } else {
      if (sync) gl.deleteSync(sync);
      timerId = window.setTimeout(cb, 80);
    }
  };
  timerId = window.setTimeout(poll, 5);
  return timerId;
}

export function createRadialGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255, 242, 246, 1.0)');
  grad.addColorStop(0.22, 'rgba(240, 177, 193, 0.85)');
  grad.addColorStop(0.55, 'rgba(217, 120, 147, 0.25)');
  grad.addColorStop(1, 'rgba(18, 5, 11, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createLightRayTexture(width = 128, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(240, 177, 193, 0.26)');
  grad.addColorStop(0.35, 'rgba(163, 34, 72, 0.14)');
  grad.addColorStop(0.8, 'rgba(140, 22, 56, 0.04)');
  grad.addColorStop(1, 'rgba(18, 5, 11, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft horizontal vignette mask
  ctx.globalCompositeOperation = 'destination-in';
  const hGrad = ctx.createLinearGradient(0, 0, width, 0);
  hGrad.addColorStop(0, 'rgba(0,0,0,0)');
  hGrad.addColorStop(0.3, 'rgba(0,0,0,0.85)');
  hGrad.addColorStop(0.5, 'rgba(0,0,0,1)');
  hGrad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
  hGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
