import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Brain, Check, ChevronDown, ChevronRight, HeartPulse, Menu, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react';

type Chapter = { id: string; number: string; title: string; eyebrow: string; summary: string; topics: string[]; icon: typeof HeartPulse; accent: string; };
const chapters: Chapter[] = [
  { id:'reproductive-health', number:'01', title:'Reproductive Health & Personal Hygiene', eyebrow:'BODY LITERACY', summary:'Understand adolescent development, reproductive health, personal hygiene, related problems, awareness and practical mitigation strategies.', topics:['Introduction to reproductive health','Puberty and changes during adolescence','Personal hygiene','Reproductive health problems','Risks associated with lack of awareness','Mitigation strategies'], icon:HeartPulse, accent:'cyan' },
  { id:'self-harm', number:'02', title:'Self-Harm', eyebrow:'SAFETY & SUPPORT', summary:'A sensitive, non-judgmental learning chapter covering the material’s discussion of self-harm, warning signs, consequences and support measures.', topics:['Introduction and forms','Possible causes and contributing factors','Signs and symptoms','Consequences and repercussions','Remedial measures and seeking support'], icon:ShieldCheck, accent:'violet' },
  { id:'social-communication', number:'03', title:'Social Communication Problems', eyebrow:'CONNECTION & WELLBEING', summary:'Explore the social communication challenges described in the educational material, including their symptoms, causes and remedies.', topics:['Introduction to social communication','Common challenges','Symptoms and indicators','Possible causes','Remedies and supportive approaches'], icon:Brain, accent:'blue' },
];

const quiz = [
  { q:'Which section of this learning module introduces puberty and personal hygiene?', options:['Chapter 1','Chapter 2','Chapter 3'], answer:0, note:'Chapter 1 covers reproductive health and personal hygiene.' },
  { q:'Which chapter addresses self-harm, warning signs and remedial measures?', options:['Chapter 1','Chapter 2','Chapter 3'], answer:1, note:'Chapter 2 is dedicated to self-harm.' },
  { q:'Where are social communication challenges and remedies discussed?', options:['Chapter 1','Chapter 2','Chapter 3'], answer:2, note:'Chapter 3 focuses on social communication problems.' },
];

export default function App() {
  const [progress,setProgress] = useState(0);
  const [active,setActive] = useState('reproductive-health');
  const [expanded,setExpanded] = useState<string | null>('reproductive-health');
  const [mobileOpen,setMobileOpen] = useState(false);
  const [quizOpen,setQuizOpen] = useState(false);
  const [answers,setAnswers] = useState<number[]>([]);
  const [submitted,setSubmitted] = useState(false);
  const [copied,setCopied] = useState(false);

  useEffect(() => {
    const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? window.scrollY/max : 0); };
    update(); window.addEventListener('scroll',update,{passive:true}); window.addEventListener('resize',update);
    return () => { window.removeEventListener('scroll',update); window.removeEventListener('resize',update); };
  },[]);
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }),{threshold:.12});
    nodes.forEach(n=>observer.observe(n)); return ()=>observer.disconnect();
  },[]);
  const score = useMemo(()=>answers.reduce((sum,a,i)=>sum+(a===quiz[i].answer?1:0),0),[answers]);
  const jump = (id:string) => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMobileOpen(false); };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),1800); } catch { setCopied(false); } };

  return <div className="site-shell">
    <div className="scroll-progress" style={{transform:`scaleX(${progress})`}} />
    <header className="topbar">
      <a className="brand" href="#top" aria-label="REPROCARE home"><span className="brand-mark">R<span>+</span></span><span>REPROCARE<small>ADOLESCENT HEALTH / LEARNING LAB</small></span></a>
      <nav className={mobileOpen?'nav-links open':'nav-links'}>
        <a href="#experience" onClick={()=>setMobileOpen(false)}>Experience</a><a href="#curriculum" onClick={()=>setMobileOpen(false)}>Curriculum</a><a href="#study" onClick={()=>setMobileOpen(false)}>Study</a>
        <button className="nav-cta" onClick={()=>jump('curriculum')}>Explore module <ArrowUpRight size={15}/></button>
      </nav>
      <button className="mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen?<X/>:<Menu/>}</button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-one"/><div className="orb orb-two"/><div className="orb orb-three"/>
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot"/> DIGITAL ADOLESCENT HEALTH EDUCATION <span className="eyebrow-line"/></div>
          <h1 className="hero-title">Knowledge is<br/><em>powerful</em> care.</h1>
          <p className="hero-lede">A guided learning experience for adolescent health, personal wellbeing and informed choices — built around three educational chapters.</p>
          <div className="hero-actions"><button className="button-primary" onClick={()=>jump('curriculum')}>Enter the learning module <ArrowRight size={17}/></button><a className="text-link" href="#experience">Discover REPROCARE <ArrowDown size={15}/></a></div>
          <div className="hero-meta"><span><i/> THREE LEARNING CHAPTERS</span><span>SCROLL TO EXPLORE <ArrowDown size={12}/></span></div>
        </div>
        <div className="hero-art" aria-label="Abstract glowing anatomical-inspired educational visualization">
          <div className="art-ring ring-a"/><div className="art-ring ring-b"/><div className="art-ring ring-c"/>
          <div className="art-core"><div className="core-glow"/><div className="core-shape"><span/><i/><b/></div></div>
          <div className="art-label label-top"><span>01 / LEARN</span><b>Body literacy</b></div><div className="art-label label-bottom"><span>REPROCARE / 2.0</span><b>Explore. Understand. Grow.</b></div>
          <div className="floating-chip chip-left"><HeartPulse size={15}/> HEALTH EDUCATION</div><div className="floating-chip chip-right"><Sparkles size={15}/> INTERACTIVE LEARNING</div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO BEGIN</span><div className="scroll-line"><i/></div><span>01 — 03</span></div>
      </section>

      <section className="intro-section" id="experience">
        <div className="section-index" data-reveal><span>01</span> / THE EXPERIENCE</div>
        <div className="intro-layout">
          <h2 data-reveal>Education that<br/><em>moves with you.</em></h2>
          <div data-reveal className="intro-text"><p>REPROCARE turns a guided educational module into a clear, engaging digital journey. Move through each chapter at your own pace, revisit key topics and check what you have learned.</p><div className="stat-row"><div><strong>03</strong><span>CHAPTERS</span></div><div><strong>01</strong><span>LEARNING PATH</span></div><div><strong>∞</strong><span>REVISIT & LEARN</span></div></div></div>
        </div>
        <div className="ticker"><div className="ticker-track"><span>LEARN WITH CLARITY ✳</span><span>ADOLESCENT WELLBEING ✳</span><span>KNOWLEDGE FOR LIFE ✳</span><span>LEARN WITH CLARITY ✳</span><span>ADOLESCENT WELLBEING ✳</span><span>KNOWLEDGE FOR LIFE ✳</span></div></div>
      </section>

      <section className="curriculum-section" id="curriculum">
        <div className="section-heading" data-reveal><div><div className="section-index"><span>02</span> / THE CURRICULUM</div><h2>Three chapters.<br/><em>One informed you.</em></h2></div><p>Follow the learning sequence from the educational material. Open a chapter to explore its topics.</p></div>
        <div className="chapter-list">
          {chapters.map(ch => { const Icon=ch.icon; const isOpen=expanded===ch.id; return <article className={`chapter-card ${ch.accent} ${isOpen?'expanded':''}`} key={ch.id} data-reveal>
            <button className="chapter-trigger" onClick={()=>{setExpanded(isOpen?null:ch.id);setActive(ch.id);}} aria-expanded={isOpen}>
              <span className="chapter-number">{ch.number}</span><span className="chapter-icon"><Icon size={23}/></span><span className="chapter-main"><small>{ch.eyebrow}</small><strong>{ch.title}</strong><span>{ch.summary}</span></span><span className="chapter-open">{isOpen?<X size={19}/>:<ArrowUpRight size={20}/>}</span>
            </button>
            {isOpen&&<div className="chapter-detail"><div className="detail-heading"><span>IN THIS CHAPTER</span><span>TOPIC MAP / {ch.number}</span></div><div className="topic-grid">{ch.topics.map((t,i)=><div className="topic-item" key={t}><span>{String(i+1).padStart(2,'0')}</span>{t}<ChevronRight size={15}/></div>)}</div><div className="chapter-note"><BookOpen size={16}/><p>Study the topics in sequence. This outline follows the supplied educational material; detailed lesson text and illustrations should be checked against the original PDF before student use.</p></div></div>}
          </article>})}
        </div>
      </section>

      <section className="interlude" aria-label="Learning statement"><div className="interlude-bg"/><div className="interlude-content" data-reveal><span className="eyebrow">A SPACE TO LEARN WITHOUT JUDGEMENT</span><h2>Curiosity is the<br/><em>beginning of care.</em></h2><p>Explore each subject with respect, privacy and an open mind.</p><button className="button-outline" onClick={()=>jump('assessment')}>Check your understanding <ArrowRight size={16}/></button></div><div className="interlude-orbit"/></section>

      <section className="study-section" id="study">
        <div className="section-index" data-reveal><span>03</span> / ABOUT THE STUDY</div>
        <div className="study-layout"><div data-reveal><h2>A research-led<br/><em>learning intervention.</em></h2><p className="study-copy">This platform supports the educational component of a quasi-experimental study assessing a QR-code-based reproductive health education module on adolescent health and reproductive problems among adolescents in selected colleges.</p></div><div className="study-panel" data-reveal><div className="panel-top"><span>STUDY FRAMEWORK</span><span className="live-dot">● MODULE</span></div><div className="framework-step"><b>01</b><div><strong>Access</strong><span>Students open the module through its shared web link or QR code.</span></div></div><div className="framework-step"><b>02</b><div><strong>Learn</strong><span>Students review the three educational chapters.</span></div></div><div className="framework-step"><b>03</b><div><strong>Assess</strong><span>Knowledge checks can support learning review.</span></div></div><p className="study-caution">Research procedures, validated instruments, consent and data collection must follow the approved study protocol and guide’s instructions.</p></div></div>
      </section>

      <section className="assessment-section" id="assessment">
        <div className="assessment-glow"/>
        <div className="assessment-content" data-reveal><div className="section-index"><span>04</span> / KNOWLEDGE CHECK</div><h2>Pause. Reflect.<br/><em>See what stayed.</em></h2><p>Try this short orientation quiz about the three chapters. It is a navigation check, not a validated research pre-test or post-test.</p><button className="button-primary" onClick={()=>{setQuizOpen(true);setAnswers([]);setSubmitted(false);}}>Start knowledge check <ArrowRight size={17}/></button></div>
        <div className="assessment-side" data-reveal><div className="quiz-orbit"><div><QrCode size={36}/><span>LEARN / REVIEW</span></div></div><span className="side-caption">A MOMENT TO CHECK YOUR UNDERSTANDING</span></div>
      </section>

      <section className="access-section"><div className="access-card" data-reveal><div className="access-icon"><QrCode size={28}/></div><div><span className="eyebrow">SHARE THE LEARNING EXPERIENCE</span><h2>One scan away<br/>from <em>knowledge.</em></h2><p>Use the published REPROCARE address to create a QR code for student access after your guide approves the final module.</p></div><button className="button-outline" onClick={copyLink}>{copied?'Link copied ✓':'Copy module link'} <ArrowUpRight size={16}/></button></div></section>
    </main>

    <footer className="footer"><a className="brand" href="#top"><span className="brand-mark">R<span>+</span></span><span>REPROCARE<small>ADOLESCENT HEALTH / LEARNING LAB</small></span></a><span>EDUCATION • AWARENESS • WELLBEING</span><a href="#top">BACK TO TOP ↑</a><small>Educational prototype. Not a substitute for professional medical or mental-health care.</small></footer>

    {quizOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setQuizOpen(false);}}><div className="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title"><button className="modal-close" onClick={()=>setQuizOpen(false)} aria-label="Close quiz"><X/></button>{!submitted?<><span className="eyebrow">REPROCARE / ORIENTATION CHECK</span><h2 id="quiz-title">What do you <em>remember?</em></h2><p className="quiz-disclaimer">Three introductory questions about the module structure.</p>{quiz.map((q,i)=><div className="quiz-question" key={q.q}><b>{String(i+1).padStart(2,'0')} / 03</b><strong>{q.q}</strong><div className="quiz-options">{q.options.map((o,j)=><button className={answers[i]===j?'selected':''} onClick={()=>setAnswers(old=>{const n=[...old];n[i]=j;return n;})} key={o}>{o}{answers[i]===j&&<Check size={15}/>}</button>)}</div></div>)}<button className="button-primary full-button" disabled={answers.filter(a=>a!==undefined).length!==3} onClick={()=>setSubmitted(true)}>Submit answers <ArrowRight size={16}/></button></>:<><span className="eyebrow">CHECK COMPLETE</span><h2 id="quiz-title">You scored <em>{score} / 3.</em></h2><p className="quiz-disclaimer">Review the chapter map to revisit any topic.</p>{quiz.map((q,i)=><div className="result-row" key={q.q}><span>{answers[i]===q.answer?'✓':'↺'}</span><p>{q.note}</p></div>)}<button className="button-primary full-button" onClick={()=>setQuizOpen(false)}>Return to REPROCARE <ArrowRight size={16}/></button></>}</div></div>}
  </div>;
}
