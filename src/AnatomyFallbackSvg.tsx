import React from 'react';
import { OrganId } from '../data/reprocareData';

interface AnatomyFallbackSvgProps {
  activeOrgan?: OrganId | null;
  className?: string;
  label?: string;
}

export const AnatomyFallbackSvg: React.FC<AnatomyFallbackSvgProps> = ({
  activeOrgan = null,
  className = '',
  label = 'Translucent Crimson Anatomical Sculpture',
}) => {
  const getOpacity = (ids: OrganId[]) => {
    if (!activeOrgan) return 0.9;
    return ids.includes(activeOrgan) ? 1 : 0.25;
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(163, 34, 72, 0.32), rgba(49, 10, 26, 0.12) 45%, transparent 72%)',
        }}
      />
      <svg
        viewBox="0 0 520 420"
        className="relative z-10 h-full max-h-[460px] w-full max-w-[520px] drop-shadow-[0_18px_45px_rgba(140,22,56,0.45)]"
        fill="none"
      >
        <defs>
          <radialGradient id="rcUterusGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#F0B1C1" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#A32248" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#4B0B20" stopOpacity="0.92" />
          </radialGradient>
          <radialGradient id="rcOvaryGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F7E9ED" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#D97893" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8C1638" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="rcTubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8C1638" />
            <stop offset="50%" stopColor="#D97893" />
            <stop offset="100%" stopColor="#F0B1C1" />
          </linearGradient>
        </defs>

        {/* Right Fallopian Tube */}
        <path
          d="M214 146 C168 118, 102 104, 78 148 C65 172, 72 206, 98 214"
          stroke="url(#rcTubeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity={getOpacity(['right-tube'])}
        />
        {/* Left Fallopian Tube */}
        <path
          d="M306 146 C352 118, 418 104, 442 148 C455 172, 448 206, 422 214"
          stroke="url(#rcTubeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity={getOpacity(['left-tube'])}
        />

        {/* Fimbriae */}
        <g opacity={getOpacity(['fimbriae'])} stroke="#F0B1C1" strokeWidth="3.5" strokeLinecap="round">
          <path d="M98 214 C86 226, 82 238, 92 246" />
          <path d="M104 214 C102 228, 106 240, 114 244" />
          <path d="M92 208 C76 212, 68 224, 74 234" />
          <path d="M422 214 C434 226, 438 238, 428 246" />
          <path d="M416 214 C418 228, 414 240, 406 244" />
          <path d="M428 208 C444 212, 452 224, 446 234" />
        </g>

        {/* Right Ovary */}
        <ellipse
          cx="126"
          cy="232"
          rx="34"
          ry="22"
          transform="rotate(-14 126 232)"
          fill="url(#rcOvaryGrad)"
          stroke="#F0B1C1"
          strokeOpacity="0.45"
          opacity={getOpacity(['right-ovary'])}
        />

        {/* Left Ovary */}
        <ellipse
          cx="394"
          cy="232"
          rx="34"
          ry="22"
          transform="rotate(14 394 232)"
          fill="url(#rcOvaryGrad)"
          stroke="#F0B1C1"
          strokeOpacity="0.45"
          opacity={getOpacity(['left-ovary'])}
        />

        {/* Uterus */}
        <path
          d="M260 98 C306 98, 326 130, 314 176 C304 216, 286 254, 282 288 L238 288 C234 254, 216 216, 206 176 C194 130, 214 98, 260 98 Z"
          fill="url(#rcUterusGrad)"
          stroke="#F0B1C1"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          opacity={getOpacity(['uterus'])}
        />
        {/* Endometrial Inner Glow */}
        <path
          d="M260 124 C288 124, 294 150, 284 186 C276 216, 268 246, 265 270 L255 270 C252 246, 244 216, 236 186 C226 150, 232 124, 260 124 Z"
          fill="#F0B1C1"
          fillOpacity="0.35"
          opacity={getOpacity(['uterus'])}
        />

        {/* Cervix */}
        <path
          d="M238 286 L282 286 L278 352 C278 362, 242 362, 242 352 Z"
          fill="url(#rcUterusGrad)"
          stroke="#F0B1C1"
          strokeOpacity="0.4"
          opacity={getOpacity(['cervix'])}
        />
      </svg>
    </div>
  );
};
