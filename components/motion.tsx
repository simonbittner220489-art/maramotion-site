'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionSystem() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const animations: Animation[] = [];
    const hero = document.querySelector<HTMLElement>('[data-parallax]');
    const onScroll = () => {
      if (frame || reduced.matches || window.innerWidth < 1024) return;
      frame = requestAnimationFrame(() => {
        if (hero && window.scrollY < window.innerHeight * 1.5) hero.style.transform = `translateY(${window.scrollY * 0.16}px) scale(1.05)`;
        frame = 0;
      });
    };
    const setup = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      if (hero) hero.style.transform = '';
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animations.push(entry.target.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }));
        observer?.unobserve(entry.target);
      }), { threshold: 0.12 });
      document.querySelectorAll('[data-reveal]').forEach(el => observer?.observe(el));
    };
    setup();
    reduced.addEventListener('change', setup);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer?.disconnect(); animations.forEach(a => a.cancel()); reduced.removeEventListener('change', setup); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [pathname]);
  return null;
}
