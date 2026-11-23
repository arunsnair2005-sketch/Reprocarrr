import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, ArrowUpRight, ShieldAlert } from 'lucide-react';
import {
  EDITORIAL_IMAGES,
  INITIAL_REFERENCES,
  ReferenceItem,
} from '../data/reprocareData';
import { EditorialImage } from './EditorialImage';
import { MagneticButton } from './MagneticButton';

const STORAGE_KEY = 'reprocare_verified_references_v1';

const CATEGORIES: Array<ReferenceItem['category'] | 'All'> = [
  'All',
  'Anatomy',
  'Endocrinology',
  'Cycle Physiology',
  'Fertility Literacy',
  'Clinical Guidance',
];

interface ResourcesAboutFooterProps {
  reducedMotion: boolean;
}

export const ResourcesAboutFooter: React.FC<ResourcesAboutFooterProps> = ({
  reducedMotion,
}) => {
  const [references, setReferences] = useState<ReferenceItem[]>(INITIAL_REFERENCES);
  const [filter, setFilter] = useState<ReferenceItem['category'] | 'All'>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCategory, setNewCategory] = useState<ReferenceItem['category']>('Anatomy');
  const [newYear, setNewYear] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [refError, setRefError] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTopic, setContactTopic] = useState('Educational Collaboration');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ReferenceItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReferences([...INITIAL_REFERENCES, ...parsed]);
        }
      }
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, []);

  const persistUserRefs = (allRefs: ReferenceItem[]) => {
    try {
      const userOnly = allRefs.filter((r) => r.userAdded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
    } catch {
      // Ignore storage failures
    }
  };

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim() || !newSummary.trim()) {
      setRefError('Please provide a source title, publishing institution or author, and summary.');
      return;
    }
    setRefError('');

    const item: ReferenceItem = {
      id: `user-ref-${Date.now()}`,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      category: newCategory,
      yearOrEdition: newYear.trim() || 'Verified Source',
      summary: newSummary.trim(),
      url: newUrl.trim() || undefined,
      userAdded: true,
    };

    const updated = [...references, item];
    setReferences(updated);
    persistUserRefs(updated);

    setNewTitle('');
    setNewOrg('');
    setNewYear('');
    setNewSummary('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleRemoveReference = (id: string) => {
    const updated = references.filter((r) => r.id !== id);
    setReferences(updated);
    persistUserRefs(updated);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please complete your name, email address, and inquiry message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('Please enter a valid email address.');
      return;
    }
    setContactError('');
    setContactSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const visibleRefs =
    filter === 'All' ? references : references.filter((r) => r.category === filter);

  return (
    <>
      {/* SECTION 9: RESEARCH & EDUCATIONAL RESOURCES (WITH VERIFIED REFERENCE REGISTRY) */}
      <section
        id="resources"
        aria-labelledby="resources-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#12050B] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                09 · Research &amp; Verified Reference Registry
              </p>
              <h2
                id="resources-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl"
              >
                Grounded in verifiable scientific literature.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-base">
                REPROCARE avoids fabricated citations and unverified claims. Browse foundational
                public health and anatomical authorities below, or add verified peer-reviewed
                sources to your local curriculum registry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D97893]/45 bg-[#310A1A] px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#F7E9ED] transition-colors hover:border-[#F0B1C1] hover:bg-[#8C1638] whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{showAddForm ? 'Close Source Form' : 'Add Verified Source'}</span>
            </button>
          </div>

          {/* Add Verified Source Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddReference}
              className="mt-8 rounded-2xl border border-[#D97893]/35 bg-[#1B0710] p-6 sm:p-8"
            >
              <h3 className="font-display text-lg font-semibold text-[#F7E9ED]">
                Append Verified Reference to Registry
              </h3>
              <p className="mt-1 text-xs text-[#F7E9ED]/65">
                Sources added here are saved locally in your browser for curriculum review and study.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="ref-title" className="block text-xs font-medium text-[#F0B1C1]">
                    Publication or Chapter Title *
                  </label>
                  <input
                    id="ref-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Gray's Anatomy: Female Pelvic Viscera"
                    className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="ref-org" className="block text-xs font-medium text-[#F0B1C1]">
                    Institution / Authors / Journal *
                  </label>
                  <input
                    id="ref-org"
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    placeholder="e.g., Elsevier / WHO / Peer-Reviewed Journal"
                    className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ref-cat" className="block text-xs font-medium text-[#F0B1C1]">
                      Category
                    </label>
                    <select
                      id="ref-cat"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ReferenceItem['category'])}
                      className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3 py-2.5 text-sm text-[#F7E9ED] focus:border-[#F0B1C1] focus:outline-none"
                    >
                      <option value="Anatomy">Anatomy</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Cycle Physiology">Cycle Physiology</option>
                      <option value="Fertility Literacy">Fertility Literacy</option>
                      <option value="Clinical Guidance">Clinical Guidance</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ref-year" className="block text-xs font-medium text-[#F0B1C1]">
                      Year / Edition
                    </label>
                    <input
                      id="ref-year"
                      type="text"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="e.g., 42nd Ed."
                      className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ref-summary" className="block text-xs font-medium text-[#F0B1C1]">
                    Educational Scope Summary *
                  </label>
                  <input
                    id="ref-summary"
                    type="text"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Concise description of what this source verifies"
                    className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="ref-url" className="block text-xs font-medium text-[#F0B1C1]">
                    Verified URL / DOI Link (Optional)
                  </label>
                  <input
                    id="ref-url"
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                  />
                </div>
              </div>

              {refError && (
                <p role="alert" className="mt-3 text-xs text-[#F0B1C1]">
                  {refError}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-[#F0B1C1]/20 px-4 py-2 text-xs font-medium text-[#F7E9ED]/75 hover:text-[#F7E9ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8C1638] px-5 py-2 text-xs font-semibold text-[#F7E9ED] hover:bg-[#A32248]"
                >
                  Save Reference
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Bar */}
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter references">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                onClick={() => setFilter(cat)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                  filter === cat
                    ? 'border-[#F0B1C1]/50 bg-[#8C1638] text-[#F7E9ED]'
                    : 'border-[#F0B1C1]/12 bg-[#1B0710]/70 text-[#F7E9ED]/70 hover:border-[#D97893]/35 hover:text-[#F7E9ED]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reference Rows */}
          <div className="mt-8 divide-y divide-[#F0B1C1]/12 rounded-2xl border border-[#F0B1C1]/15 bg-[#1B0710]/65">
            {visibleRefs.map((ref) => (
              <article
                key={ref.id}
                className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-start"
              >
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#D97893]">
                    <span>{ref.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ref.organization}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ref.yearOrEdition}</span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F7E9ED]">
                    {ref.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#F7E9ED]/75">{ref.summary}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0B1C1]/20 px-3 py-2 text-xs font-medium text-[#F0B1C1] transition-colors hover:border-[#F0B1C1] hover:bg-[#310A1A]"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Consult Source</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#F7E9ED]/45">Registry Slot</span>
                  )}

                  {ref.userAdded && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(ref.id)}
                      aria-label={`Remove ${ref.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F0B1C1]/15 text-[#F7E9ED]/60 transition-colors hover:border-[#D97893] hover:text-[#F0B1C1]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: ABOUT REPROCARE */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="relative border-b border-[#F0B1C1]/10 bg-[#1B0710] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                10 · About ReproCare
              </p>
              <h2
                id="about-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED] text-balance sm:text-4xl"
              >
                Making invisible physiology unmistakably clear.
              </h2>
              <p className="font-editorial mt-5 text-2xl italic leading-relaxed text-[#F0B1C1]">
                “Understand your body. Own your care.”
              </p>
              <p className="mt-5 text-sm leading-relaxed text-[#F7E9ED]/80 sm:text-base">
                REPROCARE is an independent educational research visualization initiative dedicated
                to elevating reproductive health literacy through spatial anatomy, calm scientific
                storytelling, and transparent sourcing. Too often, reproductive education relies on
                overly simplified two-dimensional diagrams or fragmented clinical jargon.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75 sm:text-base">
                By uniting physically informed 3D geometry with accessible physiological prose,
                REPROCARE empowers students, educators, and individuals to approach clinical
                conversations with clarity and confidence.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#F0B1C1]/15 pt-8 sm:grid-cols-3">
                <div>
                  <p className="font-display text-lg font-semibold text-[#F7E9ED]">Open Access</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F7E9ED]/65">
                    Free static web architecture with zero gated learning tools.
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-[#F7E9ED]">
                    Spatial Precision
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F7E9ED]/65">
                    Continuous 3D perspective showing true spatial relationships.
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-[#F7E9ED]">
                    Clinical Integrity
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F7E9ED]/65">
                    Responsible educational framing free of exaggerated claims.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <EditorialImage
                src={EDITORIAL_IMAGES.atelier}
                alt="REPROCARE scientific research sanctuary with optical glass lenses under warm rose illumination"
                caption="REPROCARE Atelier — uniting optical clarity, anatomical scholarship, and digital craft."
                aspectClass="aspect-[16/9]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: CONTACT & FOOTER */}
      <footer
        id="contact"
        aria-labelledby="contact-heading"
        className="relative bg-[#12050B] pt-24 pb-14"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 border-b border-[#F0B1C1]/12 pb-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D97893]">
                11 · Research &amp; Educational Inquiries
              </p>
              <h2
                id="contact-heading"
                className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F7E9ED]"
              >
                Connect with REPROCARE.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#F7E9ED]/75">
                Welcome inquiries from anatomy educators, medical illustrators, curriculum
                reviewers, and public health partners interested in referencing or contributing
                verified literature.
              </p>

              {/* Mandatory Educational Disclaimer */}
              <div className="mt-8 rounded-xl border border-[#D97893]/30 bg-[#1B0710] p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#F0B1C1]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[#F0B1C1]">
                      Educational Notice · Not Medical Advice
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#F7E9ED]/75">
                      All visualizations, anatomical summaries, and physiological materials on
                      REPROCARE are provided strictly for educational and scientific visualization
                      purposes. They do not constitute personal medical advice, diagnosis, or
                      treatment. Always consult a qualified physician or gynecologic specialist for
                      individual medical care.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleContactSubmit}
                className="rounded-2xl border border-[#F0B1C1]/15 bg-[#1B0710]/85 p-6 sm:p-8"
              >
                {contactSubmitted ? (
                  <div className="flex flex-col items-start gap-4 py-8">
                    <CheckCircle2 className="h-8 w-8 text-[#F0B1C1]" aria-hidden="true" />
                    <h3 className="font-display text-2xl font-semibold text-[#F7E9ED]">
                      Inquiry recorded locally.
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-[#F7E9ED]/75">
                      Thank you for reaching out to REPROCARE. Because this static open-access build
                      operates without external data collection servers, your message preview was
                      validated directly in-browser.
                    </p>
                    <button
                      type="button"
                      onClick={() => setContactSubmitted(false)}
                      className="rounded-lg border border-[#F0B1C1]/30 px-4 py-2 text-xs font-medium text-[#F0B1C1] hover:bg-[#310A1A]"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-medium text-[#F0B1C1]"
                        >
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Dr. / Educator / Visitor Name"
                          className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-medium text-[#F0B1C1]"
                        >
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@institution.org"
                          className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-topic"
                        className="block text-xs font-medium text-[#F0B1C1]"
                      >
                        Inquiry Focus
                      </label>
                      <select
                        id="contact-topic"
                        value={contactTopic}
                        onChange={(e) => setContactTopic(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] focus:border-[#F0B1C1] focus:outline-none"
                      >
                        <option value="Educational Collaboration">Educational Collaboration</option>
                        <option value="Verified Source Submission">Verified Source Submission</option>
                        <option value="Anatomical Feedback">Anatomical Feedback</option>
                        <option value="Accessibility & Open Science">
                          Accessibility &amp; Open Science
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-medium text-[#F0B1C1]"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Share your curriculum note, anatomical suggestion, or research inquiry..."
                        className="mt-1.5 w-full rounded-lg border border-[#F0B1C1]/20 bg-[#12050B] px-3.5 py-2.5 text-sm text-[#F7E9ED] placeholder-[#F7E9ED]/35 focus:border-[#F0B1C1] focus:outline-none"
                      />
                    </div>

                    {contactError && (
                      <p role="alert" className="text-xs text-[#F0B1C1]">
                        {contactError}
                      </p>
                    )}

                    <div className="pt-2">
                      <MagneticButton
                        reducedMotion={reducedMotion}
                        onClick={() => {
                          const form = document.querySelector('#contact form') as HTMLFormElement;
                          form?.requestSubmit();
                        }}
                        className="rounded-lg bg-[#8C1638] px-6 py-3 text-xs font-semibold tracking-wider uppercase text-[#F7E9ED] hover:bg-[#A32248]"
                      >
                        Submit Inquiry
                      </MagneticButton>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Quiet Footer Bottom Bar */}
          <div className="mt-10 flex flex-col items-start justify-between gap-6 text-xs text-[#F7E9ED]/55 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display font-bold tracking-[0.2em] text-[#F7E9ED]">
                REPROCARE
              </span>
              <span aria-hidden="true">·</span>
              <span>Understand your body. Own your care.</span>
            </div>

            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-5">
              <a href="#hero" className="hover:text-[#F0B1C1] transition-colors">
                Top
              </a>
              <a href="#journey" className="hover:text-[#F0B1C1] transition-colors">
                3D Journey
              </a>
              <a href="#explorer" className="hover:text-[#F0B1C1] transition-colors">
                Explorer
              </a>
              <a href="#anatomy-research" className="hover:text-[#F0B1C1] transition-colors">
                Physiology
              </a>
              <a href="#resources" className="hover:text-[#F0B1C1] transition-colors">
                References
              </a>
              <a href="#about" className="hover:text-[#F0B1C1] transition-colors">
                About
              </a>
              <a
                href="/reprocare-source.zip"
                download="reprocare-source.zip"
                className="text-[#F0B1C1] hover:underline transition-colors"
              >
                Download Source (.zip)
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
};
