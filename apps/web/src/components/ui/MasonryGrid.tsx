'use client';

import Masonry from 'react-masonry-css';
import { ReactNode } from 'react';

interface MasonryGridProps {
  children: ReactNode;
}

export function MasonryGrid({ children }: MasonryGridProps) {
  // Breakpoints: 1 col mobile (<640px), 2 col tablet (<1024px), 3 col small desktop (<1280px), 4 col desktop (>=1280px)
  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    1024: 2,
    640: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-8" // -ml-8 corresponds to the gutter
      columnClassName="pl-8 bg-clip-padding" // pl-8 is the gutter (XL - 32px)
    >
      {children}
    </Masonry>
  );
}

