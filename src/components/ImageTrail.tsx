// @ts-nocheck
"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ImageTrail.css';

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
  const clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function getMouseDistance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

class ImageItem {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector('.trail-img-inner');
    this.rect = null;
    this.getRect();
    window.addEventListener('resize', () => {
      gsap.set(this.el, { scale: 1, x: 0, y: 0, opacity: 0 });
      this.getRect();
    });
  }
  getRect() {
    this.rect = this.el.getBoundingClientRect();
  }
}

class ImageTrailEngine {
  constructor(container, threshold = 80) {
    this.container = container;
    this.images = [...container.querySelectorAll('.trail-img')].map(el => new ImageItem(el));
    this.total = this.images.length;
    this.pos = 0;
    this.zVal = 1;
    this.activeCount = 0;
    this.isIdle = true;
    this.threshold = threshold;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const onMove = ev => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };

    const initRender = ev => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener('mousemove', initRender);
      container.removeEventListener('touchmove', initRender);
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('touchmove', onMove);
    container.addEventListener('mousemove', initRender);
    container.addEventListener('touchmove', initRender);
  }

  render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNext();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zVal !== 1) this.zVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNext() {
    this.zVal++;
    this.pos = this.pos < this.total - 1 ? this.pos + 1 : 0;
    const img = this.images[this.pos];

    gsap.killTweensOf(img.el);
    gsap
      .timeline({
        onStart: () => { this.activeCount++; this.isIdle = false; },
        onComplete: () => { this.activeCount--; if (!this.activeCount) this.isIdle = true; },
      })
      .fromTo(
        img.el,
        {
          opacity: 1, scale: 1, zIndex: this.zVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4, ease: 'power1',
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .to(img.el, { duration: 0.4, ease: 'power3', opacity: 0, scale: 0.2 }, 0.4);
  }
}

export default function ImageTrail({ items = [], threshold = 80 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    new ImageTrailEngine(containerRef.current, threshold);
  }, [threshold, items]);

  return (
    <div className="trail-content" ref={containerRef}>
      {items.map((url, i) => (
        <div className="trail-img" key={i}>
          <div className="trail-img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}
