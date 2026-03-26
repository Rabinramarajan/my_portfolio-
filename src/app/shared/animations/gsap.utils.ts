import gsap from 'gsap';

export const GsapUtils = {
  staggerTextUp(elements: any, delay = 0) {
    if (typeof window === 'undefined') return;
    gsap.fromTo(elements, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', delay }
    );
  },

  fadeInScaleOut(element: any) {
    if (typeof window === 'undefined') return;
    gsap.fromTo(element, 
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
    );
  },

  leaveAnimation(element: any, onComplete: () => void) {
    if (typeof window === 'undefined') {
      onComplete();
      return;
    }
    gsap.to(element, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: 'power2.in',
      onComplete
    });
  }
};
