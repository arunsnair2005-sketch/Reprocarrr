import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      setScrollRatio(Math.min(1, Math.max(0, scrollTop / docHeight)));
      setScrolled(scrollTop > 32);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Journey', href: '#journey' },
    { label: 'Explorer', href: '#explorer' },
    { label: 'Physiology', href: '#anatomy-research' },
    { label: 'Cycles', href: '#menstrual-health' },
    { label: 'Resources', href: '#resources' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[#F0B1C1]/12 bg-[#12050B]/92'
          : 'border-b border-transparent bg-gradient-to-b from-[#12050B]/85 to-transparent'
      }`}
    >
      {/* Scroll progress hairline */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full origin-left bg-gradient-to-r from-[#8C1638] via-[#D97893] to-[#F0B1C1] transition-transform duration-75"
        style={{ transform: `scaleX(${scrollRatio})` }}
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6 sm:px-10 lg:px-14">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#hero"
          className="font-display text-base font-bold tracking-[0.22em] text-[#F7E9ED] whitespace-nowrap shrink-0 sm:text-lg"
        >
          REPROCARE
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#F7E9ED]/75"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-[#F0B1C1] whitespace-nowrap shrink-0 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#F0B1C1] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#explorer"
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-[#D97893]/45 bg-[#8C1638]/85 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#F7E9ED] transition-colors hover:border-[#F0B1C1] hover:bg-[#A32248] whitespace-nowrap shrink-0"
          >
            Explore 3D
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F0B1C1]/20 text-[#F7E9ED] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#F0B1C1]/12 bg-[#12050B] px-6 py-5 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-base font-medium text-[#F7E9ED]/85 transition-colors hover:text-[#F0B1C1]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#explorer"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#8C1638] px-4 py-3 text-sm font-semibold text-[#F7E9ED]"
            >
              Explore 3D Anatomy
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
