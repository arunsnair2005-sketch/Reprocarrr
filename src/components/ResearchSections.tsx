import React, { useState } from 'react';
import {
  ANATOMY_RESEARCH_TOPICS,
  CYCLE_PHASES,
  EDITORIAL_IMAGES,
} from '../data/reprocareData';
import { EditorialImage } from './EditorialImage';

type HormoneKey = 'estradiol' | 'progesterone' | 'lh' | 'fsh';

interface HormoneCurveSpec {
  id: HormoneKey;
  label: string;
  color: string;
  role: string;
  path: string;
}

// Qualitative normalized curves (x: 0..600 across an illustrative cycle, y: 20..200 where lower y = higher relative signal)
const HORMONE_CURVES: HormoneCurveSpec[] = [
  {
    id: 'estradiol',
    label: 'Estradiol (E2)',
    color: '#F0B1C1',
    role: 'Promotes endometrial proliferation, cervical mucus hydration, and triggers the mid-cycle LH surge.',
    path: 'M 10 175 C 90 172, 160 148, 220 96 C 255 62, 278 36, 292 42 C 312 52, 330 135, 370 138 C 420 140, 460 112, 505 118 C 545 124, 575 162, 590 174',
  },
  {
    id: 'progesterone',
    label: 'Progesterone (P4)',
    color: '#D97893',
    role: 'Secreted post-ovulation by the corpus luteum to stabilize secretory endometrium and elevate basal temperature.',
    path: 'M 10 186 C 120 186, 230 185, 305 178 C 345 170, 385 95, 435 56 C 470 32, 505 42, 538 86 C 562 122, 578 168, 590 184',
  },
  {
    id: 'lh',
    label: 'Luteinizing Hormone (LH)',
    color: '#F7E9ED',
    role: 'Produces a sharp mid-cycle surge driving final oocyte maturation, ovulation, and corpus luteum formation.',
    path: 'M 10 178 C 120 176, 240 172, 275 162 C 292 156, 302 28, 310 26 C 318 28, 326 158, 348 172 C 410 178, 510 178, 590 178',
  },
  {
    id: 'fsh',
    label: 'Follicle-Stimulating Hormone (FSH)',
    color: '#A32248',
    role: 'Recruits ovarian follicles in the early follicular phase and supports estrogen synthesis alongside LH.',
    path: 'M 10 136 C 65 128, 120 145, 195 160 C 255 168, 290 146, 310 88 C 325 144, 360 166, 440 170 C 510 172, 555 152, 590 138',
  },
];

const CYCLE_WINDOWS = [
  { id: 'menstrual', label: 'Menstrual', xRange: [10, 115], summary: 'Low ovarian steroids initiate shedding of the functional endometrium while FSH begins early follicular recruitment.' },
  { id: 'follicular', label: 'Follicular', xRange: [115, 280], summary: 'Dominant follicle selection elevates estradiol, rebuilding endometrial thickness and hydrating cervical secretions.' },
  { id: 'ovulatory', label: 'Ovulatory', xRange: [280, 345], summary: 'Sustained estradiol peak prompts positive pituitary feedback, unleashing the acute LH surge that triggers ovulation.' },
  { id: 'luteal', label: 'Luteal', xRange: [345, 590], summary: 'The corpus luteum secretes progesterone to mature endometrial glands; regression returns the system toward baseline.' },
];

export const ResearchSections: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState(ANATOMY_RESEARCH_TOPICS[0].id);
  const [activePhaseId, setActivePhaseId] = useState(CYCLE_PHASES[0].id);
  const [activeHormone, setActiveHormone] = useState<HormoneKey | 'all'>('all');
  const [activeWindowId, setActiveWindowId] = useState('ovulatory');

  const activeTopic =
    ANATOMY_RESEARCH_TOPICS.find((t) => t.id === activeTopicId) ?? ANATOMY_RESEARCH_TOPICS[0];
  const activePhase = CYCLE_PHASES.find((p) => p.id === activePhaseId) ?? CYCLE_PHASES[0];
  const activeWindow =
    CYCLE_WINDOWS.find((w) => w.id === activeWindowId) ?? CYCLE_WINDOWS[2];

  return (
    <>
      {/* SECTION 5: ANATOMY & PHYSIOLOGY RESEARCH */}
      <section
        id="anatomy-research"
        aria-labelledby="anatomy-research-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#12050B] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
              05 · Anatomy &amp; Physiology Research
            </p>
            <h2
              id="anatomy-research-heading"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl lg:text-5xl"
            >
              Structure engineered for cyclical transformation.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#F7E9ED]/75">
              Unlike static organ systems, female reproductive tissues remodel continuously across
              both monthly cycles and major life transitions. Explore the four core physiological
              domains below.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Topic Selector Column */}
            <div
              role="tablist"
              aria-label="Anatomy and physiology research topics"
              className="flex flex-col gap-2 lg:col-span-4"
            >
              {ANATOMY_RESEARCH_TOPICS.map((topic, index) => {
                const isSelected = topic.id === activeTopic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`flex flex-col rounded-xl border p-5 text-left transition-colors ${
                      isSelected
                        ? 'border-[#D97893]/55 bg-[#310A1A]/75 text-[#F7E9ED]'
                        : 'border-[#F0B1C1]/10 bg-[#1B0710]/60 text-[#F7E9ED]/70 hover:border-[#D97893]/30 hover:text-[#F7E9ED]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#D97893]">
                      <span>{topic.kicker}</span>
                      <span className="tabular-nums font-semibold">0{index + 1}</span>
                    </div>
                    <span className="mt-2 font-display text-lg font-semibold">{topic.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Topic Monograph */}
            <div className="rounded-2xl border border-[#F0B1C1]/15 bg-[#1B0710]/85 p-7 sm:p-10 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#F0B1C1]">
                <span>{activeTopic.kicker}</span>
                <span aria-hidden="true">·</span>
                <span>Educational Synthesis</span>
              </div>

              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#F7E9ED] sm:text-3xl">
                {activeTopic.title}
              </h3>

              <p className="font-editorial mt-4 text-xl italic leading-relaxed text-[#F0B1C1]">
                {activeTopic.summary}
              </p>

              <div className="mt-8 divide-y divide-[#F0B1C1]/12 border-t border-[#F0B1C1]/12">
                {activeTopic.details.map((item) => (
                  <div key={item.heading} className="py-6 first:pt-6 last:pb-0">
                    <h4 className="font-display text-base font-semibold text-[#F7E9ED]">
                      {item.heading}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-[15px]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: MENSTRUAL HEALTH */}
      <section
        id="menstrual-health"
        aria-labelledby="menstrual-health-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#1B0710] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <EditorialImage
                src={EDITORIAL_IMAGES.endometrium}
                alt="Macro sculptural visualization of translucent crimson endometrial tissue layers"
                caption="Artistic representation of endometrial vascular layering—regenerating and remodeling across each ovulatory cycle."
                aspectClass="aspect-[4/3]"
              />
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                06 · Menstrual Health
              </p>
              <h2
                id="menstrual-health-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl"
              >
                Reading the cycle as a systemic vital dialogue.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-base">
                The menstrual cycle is a coordinated continuum rather than a single event. While
                textbooks often illustrate an idealized pattern, cycle length and phase durations
                vary naturally across individuals and life stages.
              </p>

              {/* Interactive Phase Tabs */}
              <div
                role="tablist"
                aria-label="Menstrual cycle phases"
                className="mt-8 flex flex-wrap gap-2"
              >
                {CYCLE_PHASES.map((phase) => {
                  const active = phase.id === activePhase.id;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActivePhaseId(phase.id)}
                      className={`rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                        active
                          ? 'border-[#F0B1C1]/55 bg-[#8C1638] text-[#F7E9ED]'
                          : 'border-[#F0B1C1]/15 bg-[#12050B]/70 text-[#F7E9ED]/75 hover:border-[#D97893]/40 hover:text-[#F7E9ED]'
                      }`}
                    >
                      {phase.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-[#F0B1C1]/15 bg-[#12050B]/90 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#D97893]">
                  <span>{activePhase.typicalWindow}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePhase.hormonalTone}</span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-semibold text-[#F7E9ED]">
                  {activePhase.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#F0B1C1]">
                  Tissue state: {activePhase.tissueState}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/80 sm:text-[15px]">
                  {activePhase.overview}
                </p>

                <ul className="mt-5 space-y-2.5 border-t border-[#F0B1C1]/12 pt-5 text-sm text-[#F7E9ED]/75">
                  {activePhase.physiologicalNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5 tabular-nums text-xs font-semibold text-[#F0B1C1]">
                        0{idx + 1}.
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: HORMONAL HEALTH */}
      <section
        id="hormonal-health"
        aria-labelledby="hormonal-health-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#12050B] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                07 · Hormonal Health
              </p>
              <h2
                id="hormonal-health-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl"
              >
                The hypothalamic–pituitary–ovarian symphony.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-base">
                Pulsatile GnRH from the hypothalamus guides anterior pituitary FSH and LH, which
                in turn regulate ovarian estradiol and progesterone. Select a hormone or cycle
                window below to inspect how these feedback loops interact qualitatively.
              </p>

              {/* Hormone Filter Controls */}
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveHormone('all')}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                    activeHormone === 'all'
                      ? 'border-[#F0B1C1]/50 bg-[#8C1638] text-[#F7E9ED]'
                      : 'border-[#F0B1C1]/15 bg-[#1B0710] text-[#F7E9ED]/75 hover:border-[#D97893]/40'
                  }`}
                >
                  All Signals
                </button>
                {HORMONE_CURVES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveHormone(h.id)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                      activeHormone === h.id
                        ? 'border-[#F0B1C1]/55 bg-[#310A1A] text-[#F7E9ED]'
                        : 'border-[#F0B1C1]/15 bg-[#1B0710] text-[#F7E9ED]/75 hover:border-[#D97893]/40'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: h.color }}
                      aria-hidden="true"
                    />
                    <span>{h.label}</span>
                  </button>
                ))}
              </div>

              {/* Qualitative Endocrine Curve SVG Visualizer */}
              <div className="mt-6 rounded-2xl border border-[#F0B1C1]/15 bg-[#1B0710]/90 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#F7E9ED]/60">
                  <span>Illustrative Relative Endocrine Pattern (Qualitative Educational Diagram)</span>
                  <span className="text-[#F0B1C1]">{activeWindow.label} Window</span>
                </div>

                <div className="mt-4 w-full overflow-hidden">
                  <svg
                    viewBox="0 0 600 220"
                    className="h-auto w-full"
                    role="img"
                    aria-label="Qualitative hormonal feedback curve chart showing Estradiol, Progesterone, LH, and FSH"
                  >
                    {/* Highlighted phase band */}
                    <rect
                      x={activeWindow.xRange[0]}
                      y={12}
                      width={activeWindow.xRange[1] - activeWindow.xRange[0]}
                      height={186}
                      rx={6}
                      fill="rgba(140, 22, 56, 0.22)"
                    />

                    {/* Subtle horizontal grid hairlines */}
                    {[48, 96, 144, 190].map((y) => (
                      <line
                        key={y}
                        x1="10"
                        y1={y}
                        x2="590"
                        y2={y}
                        stroke="rgba(240, 177, 193, 0.1)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Phase separator ticks */}
                    {[115, 280, 345].map((x) => (
                      <line
                        key={x}
                        x1={x}
                        y1="14"
                        x2={x}
                        y2="196"
                        stroke="rgba(217, 120, 147, 0.25)"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Curves */}
                    {HORMONE_CURVES.map((curve) => {
                      const focused = activeHormone === 'all' || activeHormone === curve.id;
                      return (
                        <path
                          key={curve.id}
                          d={curve.path}
                          fill="none"
                          stroke={curve.color}
                          strokeWidth={focused ? 2.75 : 1.5}
                          strokeOpacity={focused ? 0.95 : 0.22}
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Phase labels along bottom */}
                    {CYCLE_WINDOWS.map((w) => {
                      const mid = (w.xRange[0] + w.xRange[1]) / 2;
                      return (
                        <text
                          key={w.id}
                          x={mid}
                          y={212}
                          textAnchor="middle"
                          fill={w.id === activeWindowId ? '#F0B1C1' : 'rgba(247,233,237,0.55)'}
                          fontSize="11"
                          fontFamily="DM Sans, sans-serif"
                        >
                          {w.label}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Window Selector Buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CYCLE_WINDOWS.map((win) => (
                    <button
                      key={win.id}
                      type="button"
                      onClick={() => setActiveWindowId(win.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        win.id === activeWindowId
                          ? 'border-[#F0B1C1]/50 bg-[#310A1A] text-[#F7E9ED]'
                          : 'border-[#F0B1C1]/10 bg-[#12050B]/60 text-[#F7E9ED]/65 hover:text-[#F7E9ED]'
                      }`}
                    >
                      {win.label}
                    </button>
                  ))}
                </div>

                <p className="mt-4 border-t border-[#F0B1C1]/10 pt-4 text-sm leading-relaxed text-[#F7E9ED]/80">
                  {activeHormone === 'all'
                    ? activeWindow.summary
                    : HORMONE_CURVES.find((h) => h.id === activeHormone)?.role}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-10">
              <EditorialImage
                src={EDITORIAL_IMAGES.hormones}
                alt="Sculptural borosilicate glass spheres linked by crimson fluid filaments symbolizing endocrine feedback"
                caption="Endocrine signaling relies on reciprocal feedback between hypothalamic, pituitary, and ovarian tissues."
                aspectClass="aspect-[4/3]"
              />

              <div className="mt-6 rounded-2xl border border-[#F0B1C1]/12 bg-[#1B0710]/65 p-6">
                <h3 className="font-display text-lg font-semibold text-[#F7E9ED]">
                  Beyond Reproduction: Systemic Reach
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75">
                  Estrogen and progesterone receptors exist across bone, vascular endothelium, neural
                  tissue, and metabolic pathways—meaning ovarian hormone balance contributes broadly
                  to lifelong cardiovascular, skeletal, and cognitive health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FERTILITY AWARENESS */}
      <section
        id="fertility-awareness"
        aria-labelledby="fertility-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#1B0710] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <EditorialImage
                src={EDITORIAL_IMAGES.follicle}
                alt="Macro luminous crimson glass ovarian follicle surrounded by delicate rose filaments"
                caption="Maturing ovarian follicle—housing the oocyte while signaling ovulation readiness through rising estradiol."
                aspectClass="aspect-[4/3]"
              />
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                08 · Fertility Awareness
              </p>
              <h2
                id="fertility-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl"
              >
                Observable biomarkers of ovulatory physiology.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-base">
                Fertility awareness education examines the physiological signs generated by shifting
                estradiol and progesterone across each cycle. Understanding these biomarkers helps
                individuals interpret body signals accurately when conversing with healthcare
                clinicians.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#F0B1C1]/12 bg-[#12050B]/85 p-5">
                  <p className="text-xs font-medium text-[#D97893]">01 · Ovulation Physiology</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F7E9ED]">
                    The Brief Ovulatory Window
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75">
                    Once released from the follicle, an oocyte remains viable briefly, while sperm
                    survival depends strongly on supportive cervical mucus within the fertile window.
                  </p>
                </div>

                <div className="rounded-xl border border-[#F0B1C1]/12 bg-[#12050B]/85 p-5">
                  <p className="text-xs font-medium text-[#D97893]">02 · Cervical Secretions</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F7E9ED]">
                    Estrogen-Driven Fluid Shifts
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75">
                    Rising pre-ovulatory estradiol increases mucin hydration, creating clearer,
                    slippery cervical fluid before progesterone thickens secretions post-ovulation.
                  </p>
                </div>

                <div className="rounded-xl border border-[#F0B1C1]/12 bg-[#12050B]/85 p-5">
                  <p className="text-xs font-medium text-[#D97893]">03 · Thermogenic Shift</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F7E9ED]">
                    Basal Body Temperature
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75">
                    Post-ovulatory progesterone acts on hypothalamic thermoregulation, producing a
                    subtle sustained rise in resting waking temperature confirming ovulation occurred.
                  </p>
                </div>

                <div className="rounded-xl border border-[#F0B1C1]/12 bg-[#12050B]/85 p-5">
                  <p className="text-xs font-medium text-[#D97893]">04 · Clinical Literacy</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F7E9ED]">
                    Educational Context Only
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#F7E9ED]/75">
                    Biomarker tracking illuminates personal patterns, but family planning or fertility
                    decisions should always be reviewed with a qualified healthcare professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
