import React, { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  reducedMotion: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ reducedMotion }) => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      setEnabled(false);
      return;
    }

    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!media.matches) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;
    let isInteractive = false;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const target = e.target as HTMLElement | null;
      isInteractive = Boolean(
        target?.closest('a, button, input, textarea, select, [role="tab"], canvas')
      );
    };

    const tick = () => {
      curX += (targetX - curX) * 0.2;
      curY += (targetY - curY) * 0.2;

      if (ringRef.current) {
        const scale = isInteractive ? 1.55 : 1;
        ringRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.borderColor = isInteractive
          ? 'rgba(240, 177, 193, 0.85)'
          : 'rgba(217, 120, 147, 0.48)';
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 hidden md:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-8 w-8 rounded-full border border-[#D97893]/50 transition-[border-color] duration-150 will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#F0B1C1] will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </div>
  );
};
