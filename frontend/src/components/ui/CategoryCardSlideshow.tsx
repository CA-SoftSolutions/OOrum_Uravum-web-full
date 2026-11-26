'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ObituaryPhoto from '@/components/ui/ObituaryPhoto';
import ObituaryPlaceholder from '@/components/ui/ObituaryPlaceholder';

export interface CategoryCardSlide {
  title: string;
  href: string;
  excerpt: string;
  image: string | null;
  publishedAt: string | null;
}

function fmtDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const SLIDE_MS = 4000;

/**
 * Category card that rotates through a small set of items (used for the
 * Obituary card). Visually identical to CategoryCard — same media height,
 * title/excerpt min-heights and badge — only the content cycles.
 */
export default function CategoryCardSlideshow({
  name,
  badgeHref,
  slides,
}: {
  name: string;
  badgeHref: string;
  slides: CategoryCardSlide[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides.length ? slides[index % slides.length] : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card-bg shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-red/40 hover:shadow-md">
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-48">
        {slide ? (
          <div className="relative h-full w-full">
            <ObituaryPhoto
              key={slide.href}
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <ObituaryPlaceholder />
        )}
        <Link
          href={badgeHref}
          className="absolute left-2.5 top-2.5 max-w-[85%] truncate rounded-full bg-accent-red px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-accent-red/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-1"
        >
          {name}
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {slide ? (
          <>
            <Link
              href={slide.href}
              className="line-clamp-2 min-h-[3rem] text-[15px] font-bold leading-snug transition-colors hover:text-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red"
            >
              {slide.title}
            </Link>
            <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-xs leading-relaxed text-foreground/50">
              {slide.excerpt}
            </p>
            <span className="mt-auto block pt-2.5 text-[11px] text-foreground/40">
              {fmtDate(slide.publishedAt)}
            </span>
          </>
        ) : (
          <>
            <span className="line-clamp-2 min-h-[3rem] text-[15px] font-bold leading-snug text-foreground/40">
              No obituaries yet
            </span>
            <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-xs leading-relaxed text-foreground/35">
              Be the first to submit an obituary
            </p>
            <span className="mt-auto block pt-2.5 text-[11px] text-foreground/30">&nbsp;</span>
          </>
        )}
      </div>
    </div>
  );
}
