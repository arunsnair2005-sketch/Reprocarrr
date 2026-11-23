# REPROCARE

**Understand your body. Own your care.**

REPROCARE is a cinematic, 3D interactive reproductive health research and educational web experience built with React, TypeScript, Tailwind CSS, Three.js, and GSAP ScrollTrigger.

> **Educational Notice:** All anatomical visualizations, cycle explanations, and hormonal summaries on REPROCARE are designed strictly for educational and scientific literacy purposes. They do not constitute personal medical advice, clinical diagnosis, or treatment.

---

## Core Architecture & Features

- **Cinematic Hero & Pinned 3D Scroll Journey**: A procedural translucent crimson-glass 3D female reproductive system rendered in Three.js with studio environment reflections, subsurface-like internal illumination, subtle volumetric light shafts, floating biological micro-particles, and optional WebGL post-processing bloom.
- **5-Scene Apple-Style Scroll Storytelling**: Driven by GSAP `ScrollTrigger` (`scrub`), smoothly interpolating camera trajectories, focal depth, individual organ illumination, lighting mood, and particle velocity across five chapters:
  1. *The Complete System*
  2. *The Uterus*
  3. *The Ovaries*
  4. *The Fallopian Tubes & Fimbriae*
  5. *The Complete Anatomy*
- **Interactive 3D Anatomy Explorer**: Direct raycasted 3D selection (mouse, touch, and full keyboard navigation) for seven distinct structures — Uterus, Right Ovary, Left Ovary, Right Fallopian Tube, Left Fallopian Tube, Cervix, and Fimbriae — with damped camera focusing, selective organ illumination, and OrbitControls inspection.
- **Educational Research Modules**: Dedicated sections covering Anatomy & Physiology, Menstrual Health (interactive 4-phase cycle exploration), Hormonal Health (interactive endocrine curve visualizer), Fertility Awareness, a Verified Reference Registry (allowing educators and visitors to filter and add verified sources locally), About ReproCare, and Contact.
- **Accessibility & Performance**: `prefers-reduced-motion` compliance, keyboard-navigable 3D organ selection, software-WebGL detection and frame pacing, WebGL context-loss recovery, and graceful 2D fallback visuals.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **3D Engine**: Three.js (procedural anatomical geometry, `MeshPhysicalMaterial`, `RoomEnvironment`, `EffectComposer` / `UnrealBloomPass`, `OrbitControls`, `Raycaster`)
- **Scroll Choreography**: GSAP + ScrollTrigger
- **Styling**: Tailwind CSS v4 (`Manrope`, `DM Sans`, `Cormorant Garamond`)
- **Icons**: Lucide React

---

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Type-check and create a production build:**
   ```bash
   npm run lint
   npm run build
   ```
   The static production bundle is emitted to `/dist`.

---

## Free Deployment on Netlify

REPROCARE is a 100% static single-page application requiring no paid APIs, databases, or server runtimes.

### Option A: Drag-and-Drop / CLI
1. Run `npm run build` locally.
2. Deploy the `dist/` directory using the Netlify Dashboard or Netlify CLI:
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```

### Option B: Git-Connected Continuous Deployment
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Create a new site in Netlify and select your repository.
3. Netlify automatically reads `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**. No environment variables or API keys are required.
