'use client';

import { animate, svg } from 'animejs';
import { useEffect, useRef } from 'react';

export function useLucideDrawerAnimation() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) {
      const svgElements = root.current.querySelectorAll('svg path, svg circle, svg polyline, svg line, svg rect');
      svgElements.forEach((element) => element.classList.add('line'));
      animate(svg.createDrawable('.line'), {
        draw: ['0 0.05', '0.05 1'],
        ease: 'inOutQuad',
        duration: 1000,
        loop: true,
        alternate: true,
      });
    }
  }, []);

  return root;
}
