// @ts-nocheck
"use client";

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const getContainingBlock = element => {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      style.filter !== 'none' ||
      style.willChange.includes('transform') ||
      style.willChange.includes('perspective') ||
      style.willChange.includes('filter') ||
      /paint|layout|strict|content/.test(style.contain)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

const getContainingBlockOffset = block => {
  if (!block) return { x: 0, y: 0 };
  const rect = block.getBoundingClientRect();
  return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
};

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#ffffff',
  cursorColorOnTarget
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const dotRef = useRef(null);
  const sunRef = useRef(null);
  const spinTweenRef = useRef(null);
  const containingBlockRef = useRef(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef(null);
  const tickerFnRef = useRef(null);
  const activeStrengthRef = useRef(0);
  // Czy słoneczko jest w tej chwili schowane (przez .cursor-target albo przez
  // element z własnym kursorem systemowym). Bez tego przy każdym mouseover
  // odpalalibyśmy animację od nowa i słoneczko drgałoby przy przesuwaniu myszy.
  const slonceUkryteRef = useRef(false);
  const ostatniaPozycjaRef = useRef([0, 0]);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12
    }),
    []
  );

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlockRef.current);
    gsap.to(cursorRef.current, {
      x: x - offsetX,
      y: y - offsetY,
      duration: 0.1,
      ease: 'power3.out'
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    containingBlockRef.current = getContainingBlock(cursor);
    const getOffset = () => getContainingBlockOffset(containingBlockRef.current);

    let activeTarget = null;
    let currentLeaveHandler = null;

    const cleanupTarget = target => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    const initialOffset = getOffset();
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y
    });

    // Kursor pozostaje nieruchomy — bez animacji obrotu
    gsap.set(cursor, { rotation: 0 });

    // Stan spoczynkowy: widoczne słoneczko, schowany celownik (rogi + kropka)
    if (sunRef.current) gsap.set(sunRef.current, { opacity: 1, scale: 1 });
    if (dotRef.current) gsap.set(dotRef.current, { opacity: 0 });

    // Delikatny, ciągły obrót słoneczka w spoczynku.
    //
    // UWAGA — tu siedział błąd, przez który słoneczko po zjechaniu z przycisku
    // przestawało się kręcić do końca życia strony: animacje morfingu też ruszają
    // `rotation` i mają overwrite:'auto', więc GSAP ubijał tę nieskończoną pętlę.
    // Dlatego obrót jest teraz zawsze uruchamiany od nowa po powrocie słoneczka,
    // a nie tylko raz przy montowaniu.
    const startSpin = () => {
      if (!sunRef.current) return;
      spinTweenRef.current?.kill();
      spinTweenRef.current = gsap.to(sunRef.current, {
        rotation: '+=360',
        duration: spinDuration * 4,
        ease: 'none',
        repeat: -1
      });
    };

    // Wspólne animacje znikania i powrotu słoneczka. Używa ich zarówno najazd
    // na element .cursor-target, jak i najazd na element z własnym kursorem
    // systemowym (łapka, rączka) — dzięki temu przejście wygląda wszędzie
    // tak samo.
    const ukryjSlonce = () => {
      if (!sunRef.current) return;
      spinTweenRef.current?.kill();
      spinTweenRef.current = null;
      gsap.to(sunRef.current, {
        opacity: 0,
        scale: 0.35,
        rotation: '+=120',
        duration: 0.3,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    };

    const pokazSlonce = () => {
      if (!sunRef.current) return;
      gsap.to(sunRef.current, {
        opacity: 1,
        scale: 1,
        rotation: '+=120',
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: startSpin
      });
    };

    startSpin();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) {
        return;
      }

      const strength = activeStrengthRef.current;
      if (strength === 0) return;

      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');

        const targetX = targetCornerPositionsRef.current[i].x - cursorX;
        const targetY = targetCornerPositionsRef.current[i].y - cursorY;

        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;

        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    };

    tickerFnRef.current = tickerFn;

    // Element ma „własny kursor systemowy", gdy wyliczony `cursor` to coś innego
    // niż none. Ponieważ body ma cursor:none, dziedziczą to wszystkie elementy
    // POZA tymi, które ustawiają kursor same — czyli odnośnikami (pointer
    // z arkusza przeglądarki), mapą i stosem zdjęć (grab), przyciskami menu.
    // Dzięki temu nie trzeba oznaczać ich po jednym: reguła sama je wyłapuje.
    const maWlasnyKursor = el => {
      if (!el || el.nodeType !== 1) return false;
      const kursor = getComputedStyle(el).cursor;
      return !!kursor && kursor !== 'none';
    };

    const moveHandler = e => {
      ostatniaPozycjaRef.current = [e.clientX, e.clientY];
      moveCursor(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', moveHandler);

    // Słoneczko chowa się nie tylko nad .cursor-target, ale wszędzie tam, gdzie
    // przeglądarka pokazuje własny kursor — inaczej rączka albo łapka
    // wyświetlały się RAZEM ze słoneczkiem, jedno na drugim.
    const kursorSystemowyHandler = e => {
      if (isActiveRef.current) return; // nad .cursor-target rządzi enterHandler
      if (e.target?.closest?.(targetSelector)) return;
      const wlasny = maWlasnyKursor(e.target);
      if (wlasny === slonceUkryteRef.current) return; // stan bez zmian
      slonceUkryteRef.current = wlasny;
      if (wlasny) ukryjSlonce();
      else pokazSlonce();
    };
    window.addEventListener('mouseover', kursorSystemowyHandler, { passive: true });

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const { x: offsetX, y: offsetY } = getOffset();
      const mouseX = gsap.getProperty(cursorRef.current, 'x') + offsetX;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') + offsetY;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (dotRef.current) gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      if (sunRef.current && !isActiveRef.current) gsap.to(sunRef.current, { scale: 0.82, duration: 0.2 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (dotRef.current) gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      if (sunRef.current && !isActiveRef.current) gsap.to(sunRef.current, { scale: 1, duration: 0.2 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = e => {
      const directTarget = e.target;
      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));

      gsap.set(cursorRef.current, { rotation: 0 });

      // MORFING: słoneczko „zwija się" i znika, w jego miejsce wyłania się celownik
      ukryjSlonce();
      slonceUkryteRef.current = true;
      gsap.to(corners, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      if (dotRef.current) {
        gsap.to(dotRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      }

      if (cursorColorOnTarget) {
        gsap.to(corners, {
          borderColor: cursorColorOnTarget,
          duration: 0.15,
          ease: 'power2.out'
        });
        if (dotRef.current) {
          gsap.to(dotRef.current, {
            backgroundColor: cursorColorOnTarget,
            duration: 0.15,
            ease: 'power2.out'
          });
        }
      }

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: offsetX, y: offsetY } = getOffset();
      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
        { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current);

      gsap.to(activeStrengthRef, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out'
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current[i].x - cursorX,
          y: targetCornerPositionsRef.current[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current);

        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        activeTarget = null;

        // MORFING (powrót): celownik znika, słoneczko „rozkwita" z powrotem.
        // Nie wracamy z nim, jeśli wskaźnik zjechał wprost na element z własnym
        // kursorem systemowym — tam słoneczko ma zostać schowane.
        const podKursorem = document.elementFromPoint(
          ostatniaPozycjaRef.current[0],
          ostatniaPozycjaRef.current[1]
        );
        if (maWlasnyKursor(podKursorem)) {
          slonceUkryteRef.current = true; // zostaje schowane, np. zjechaliśmy na mapę
        } else {
          pokazSlonce();
          slonceUkryteRef.current = false;
        }
        if (cornersRef.current) {
          gsap.to(Array.from(cornersRef.current), {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
        if (dotRef.current) {
          gsap.to(dotRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        }

        if (cursorColorOnTarget && cornersRef.current) {
          gsap.to(Array.from(cornersRef.current), {
            borderColor: cursorColor,
            duration: 0.15,
            ease: 'power2.out'
          });
          if (dotRef.current) {
            gsap.to(dotRef.current, {
              backgroundColor: cursorColor,
              duration: 0.15,
              ease: 'power2.out'
            });
          }
        }

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners, 'x,y');
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out'
              },
              0
            );
          });
        }

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    const resizeHandler = () => {
      containingBlockRef.current = getContainingBlock(cursor);
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      if (spinTweenRef.current) {
        spinTweenRef.current.kill();
        spinTweenRef.current = null;
      }

      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('mouseover', kursorSystemowyHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      document.body.style.cursor = originalCursor;

      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current = 0;
    };
  }, [
    targetSelector,
    spinDuration,
    moveCursor,
    constants,
    hideDefaultCursor,
    isMobile,
    hoverDuration,
    parallaxOn,
    cursorColor,
    cursorColorOnTarget
  ]);

  if (isMobile) {
    return null;
  }

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      {/* Słoneczko — stan spoczynkowy kursora (marka Sun Run) */}
      <div ref={sunRef} className="target-cursor-sun">
        <svg viewBox="0 0 34 34" width="100%" height="100%">
          <defs>
            <radialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FED46D" />
              <stop offset="55%" stopColor="#FED46D" />
              <stop offset="100%" stopColor="#FE8004" />
            </radialGradient>
          </defs>
          {/* promienie */}
          <g stroke="#FE8004" strokeWidth="2.4" strokeLinecap="round">
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const cx = 17;
              const cy = 17;
              const r1 = 9.5;
              const r2 = 14.5;
              return (
                <line
                  key={i}
                  x1={cx + Math.cos(a) * r1}
                  y1={cy + Math.sin(a) * r1}
                  x2={cx + Math.cos(a) * r2}
                  y2={cy + Math.sin(a) * r2}
                />
              );
            })}
          </g>
          {/* rdzeń słońca */}
          <circle cx="17" cy="17" r="6.5" fill="url(#sunCoreGrad)" />
        </svg>
      </div>
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>
  );
};

export default TargetCursor;
