// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  // Pozycja startu ScrollTriggera. Domyślnie 'top 85%' (wjeżdża od dołu).
  scrollStart = 'top 85%',
  // Koniec zakresu (używany tylko przy scrub/pin).
  scrollEnd = '+=600',
  stagger = 0.03,
  // Tryb "scroll zwalnia": przypina sekcję i skrobie animację po scrollu.
  scrub = false,
  pin = false,
  // Element do przypięcia/triggerowania (np. cała sekcja). Domyślnie sam nagłówek.
  triggerRef
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="scroll-float-char" key={index}>
        {char === ' ' ? ' ' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const charElements = el.querySelectorAll('.scroll-float-char');
    const triggerEl = triggerRef && triggerRef.current ? triggerRef.current : el;

    // gsap.context = czysty revert przy odmontowaniu (odporne na React StrictMode,
    // który w devie montuje efekt dwukrotnie).
    const ctx = gsap.context(() => {
      // Jawnie ustawiamy stan początkowy (ukryty), zamiast polegać na
      // immediateRender w fromTo — gwarantuje, że litery są schowane, dopóki
      // ScrollTrigger nie odpali animacji.
      gsap.set(charElements, {
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%',
        willChange: 'opacity, transform'
      });

      // Dwa tryby:
      // • scrub/pin — sekcja przypina się (scroll "zwalnia"), a litery wypływają
      //   w rytm scrolla. Odpala się dopiero gdy sekcja jest w pełni w kadrze.
      // • zwykły — jednorazowe play przy wejściu (toggleActions).
      const st = (scrub || pin)
        ? {
            trigger: triggerEl,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: scrub ? 1 : false,
            pin: pin ? triggerEl : false,
            anticipatePin: pin ? 1 : 0
          }
        : {
            trigger: triggerEl,
            scroller,
            start: scrollStart,
            toggleActions: 'play none none reverse'
          };

      gsap.to(charElements, {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        duration: animationDuration,
        ease,
        stagger,
        scrollTrigger: st
      });
    }, el);

    // Layout nad komponentem zmienia wysokość po mount (dynamic importy, fonty,
    // piny) — odśwież pozycje ScrollTriggera po ustabilizowaniu i na window.load.
    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 400);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      clearTimeout(refreshTimeout);
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger, scrub, pin, triggerRef]);

  return (
    <h2 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;
