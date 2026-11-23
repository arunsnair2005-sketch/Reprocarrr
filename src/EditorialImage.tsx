import React, { useState } from 'react';
import { Microscope } from 'lucide-react';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
  className?: string;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  caption,
  aspectClass = 'aspect-[4/3]',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`relative overflow-hidden rounded-2xl border border-[#F0B1C1]/15 bg-[#1B0710] ${className}`}>
      <div className={`relative w-full overflow-hidden ${aspectClass}`}>
        {failed ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(140, 22, 56, 0.35), rgba(27, 7, 16, 0.96) 75%)',
            }}
          >
            <Microscope className="h-8 w-8 text-[#F0B1C1]/70" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wider uppercase text-[#F0B1C1]/80">
              {alt}
            </span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12050B]/70 via-transparent to-transparent"
        />
      </div>

      {caption && (
        <figcaption className="border-t border-[#F0B1C1]/10 bg-[#12050B]/85 px-5 py-3 text-xs leading-relaxed text-[#F7E9ED]/70">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
