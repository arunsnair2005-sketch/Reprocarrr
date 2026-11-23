/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HeaderNav } from './components/HeaderNav';
import { CustomCursor } from './components/CustomCursor';
import { MagneticButton } from './components/MagneticButton';
import { HeroAnatomyCanvas } from './components/HeroAnatomyCanvas';
import { ScrollJourneySection } from './components/ScrollJourneySection';
import { InteractiveExplorerSection } from './components/InteractiveExplorerSection';
import { ResearchSections } from './components/ResearchSections';
import { ResourcesAboutFooter } from './components/ResourcesAboutFooter';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const appRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Subtle editorial entrance & parallax reveals
  useEffect(() => {
    if (reducedMotion || !appRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 22,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      gsap.utils.toArray<HTMLElement>('.reveal-block').forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          },
        });
      });
    }, appRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={appRef} className="min-h-screen bg-[#12050B] text-[#F7E9ED]">
      <CustomCursor reducedMotion={reducedMotion} />
      <HeaderNav />

      <main>
        {/* SECTION 1: CINEMATIC HERO */}
        <section
          id="hero"
          aria-labelledby="hero-heading"
          className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-[#F0B1C1]/10 bg-[#12050B] pt-16"
        >
          {/* Ambient radial crimson aura */}
          <div aria-hidden="true" className="crimson-aura pointer-events-none absolute inset-0" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-12 lg:gap-6 lg:px-14 lg:py-0">
            {/* Left Editorial Column */}
            <div className="flex flex-col items-start lg:col-span-6">
              <p className="hero-stagger text-xs font-semibold tracking-[0.26em] uppercase text-[#F0B1C1]">
                REPROCARE · Reproductive Physiology &amp; Research
              </p>

              <h1
                id="hero-heading"
                className="hero-stagger mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight text-[#F7E9ED] text-balance sm:text-5xl lg:text-[3.75rem]"
              >
                KNOW YOUR BODY.
                <br />
                <span className="text-[#F0B1C1]">OWN YOUR CARE.</span>
              </h1>

              <p className="hero-stagger font-editorial mt-5 text-xl italic leading-relaxed text-[#D97893] sm:text-2xl">
                Understand your body. Own your care.
              </p>

              <p className="hero-stagger mt-5 max-w-xl text-sm leading-relaxed text-[#F7E9ED]/80 sm:text-base">
                An interactive 3D scientific journey through female reproductive anatomy, cyclical
                endocrinology, and fertility literacy—crafted to turn complex physiology into
                clear, empowering knowledge.
              </p>

              <div className="hero-stagger mt-9 flex flex-wrap items-center gap-5">
                <MagneticButton
                  href="#journey"
                  reducedMotion={reducedMotion}
                  className="rounded-lg border border-[#F0B1C1]/40 bg-[#8C1638] px-6 py-3.5 text-xs font-semibold tracking-wider uppercase text-[#F7E9ED] hover:border-[#F0B1C1] hover:bg-[#A32248]"
                >
                  <span>Begin Anatomical Film</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </MagneticButton>

                <a
                  href="#explorer"
                  className="inline-flex items-center gap-2 border-b border-[#F0B1C1]/35 pb-1 text-xs font-semibold tracking-wider uppercase text-[#F0B1C1] transition-colors hover:border-[#F0B1C1] hover:text-[#F7E9ED] whitespace-nowrap shrink-0"
                >
                  <span>Interactive Explorer</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              <p className="hero-stagger mt-10 text-xs text-[#F7E9ED]/50">
                Educational scientific visualization · Not personal medical advice
              </p>
            </div>

            {/* Right 3D Sculpture Column */}
            <div className="relative h-[420px] w-full sm:h-[500px] lg:col-span-6 lg:h-[640px]">
              <HeroAnatomyCanvas reducedMotion={reducedMotion} />
            </div>
          </div>
        </section>

        {/* SECTION 2: INTRODUCTION TO REPROCARE */}
        <section
          id="introduction"
          aria-labelledby="intro-heading"
          className="relative border-b border-[#F0B1C1]/10 bg-[#1B0710] py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
            <div className="reveal-block grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                  02 · Introduction to ReproCare
                </p>
                <h2
                  id="intro-heading"
                  className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl lg:text-[2.85rem] lg:leading-[1.15]"
                >
                  Reproductive literacy begins with seeing the living architecture clearly.
                </h2>
              </div>

              <div className="lg:col-span-5">
                <p className="font-editorial text-xl italic leading-relaxed text-[#F0B1C1] sm:text-2xl">
                  “When anatomical knowledge feels tangible and respectful, every healthcare
                  question becomes sharper.”
                </p>
              </div>
            </div>

            <div className="reveal-block mt-14 grid grid-cols-1 gap-8 border-t border-[#F0B1C1]/12 pt-12 md:grid-cols-3">
              <div>
                <p className="tabular-nums text-xs font-semibold text-[#D97893]">01</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#F7E9ED]">
                  Three-Dimensional Context
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#F7E9ED]/75">
                  Flat textbook diagrams compress spatial relationships. Exploring the uterus,
                  arched tubes, and suspended ovaries in depth clarifies how structures work
                  together.
                </p>
              </div>

              <div>
                <p className="tabular-nums text-xs font-semibold text-[#D97893]">02</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#F7E9ED]">
                  Cyclical &amp; Endocrine Fluency
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#F7E9ED]/75">
                  Trace how pituitary and ovarian hormones coordinate tissue remodeling, ovulation,
                  and systemic vitality across the reproductive lifespan.
                </p>
              </div>

              <div>
                <p className="tabular-nums text-xs font-semibold text-[#D97893]">03</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#F7E9ED]">
                  Responsible Scholarship
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#F7E9ED]/75">
                  Every explanation uses medically responsible language paired with an open,
                  verifiable reference registry—clearly distinguished from clinical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SCROLL-CONTROLLED 3D ANATOMICAL JOURNEY */}
        <ScrollJourneySection reducedMotion={reducedMotion} />

        {/* SECTION 4: INTERACTIVE 3D ANATOMY EXPLORER */}
        <InteractiveExplorerSection reducedMotion={reducedMotion} />

        {/* SECTIONS 5–8: ANATOMY RESEARCH, MENSTRUAL HEALTH, HORMONAL HEALTH, FERTILITY AWARENESS */}
        <ResearchSections />
      </main>

      {/* SECTIONS 9–11: VERIFIED RESOURCES, ABOUT REPROCARE, CONTACT & FOOTER */}
      <ResourcesAboutFooter reducedMotion={reducedMotion} />
    </div>
  );
}
