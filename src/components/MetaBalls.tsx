// @ts-nocheck
"use client";

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseBall;
uniform vec3 uColor1;
uniform vec3 uColor2;
out vec4 fragColor;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

vec2 ballPos(int i, float t) {
  float fi = float(i);
  float sp = 0.25 + hash(fi * 12.9898) * 0.45;
  float rx = 0.22 + hash(fi * 78.233) * 0.46;
  float ry = 0.16 + hash(fi * 39.425) * 0.36;
  float ph = fi * 2.399963;
  return vec2(cos(t * sp + ph) * rx, sin(t * sp * 1.31 + ph * 1.7) * ry);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  float t = iTime * uSpeed;

  float field = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 p = ballPos(i, t);
    float r = 0.05 + hash(float(i) * 4.271) * 0.07;
    vec2 d = uv - p;
    field += (r * r) / max(dot(d, d), 1e-5);
  }

  if (uMouseBall > 0.5) {
    vec2 dm = uv - uMouse;
    field += (0.09 * 0.09) / max(dot(dm, dm), 1e-5);
  }

  float body = smoothstep(0.9, 1.1, field);
  float glow = smoothstep(0.35, 1.0, field) * 0.25;
  vec3 col = mix(uColor2, uColor1, clamp(field * 0.45, 0.0, 1.0));
  float alpha = clamp(body + glow, 0.0, 1.0) * uOpacity;

  // Miękka maska krawędzi — pole wygasza się przy brzegach canvasu,
  // dzięki czemu kule rozpływają się w tło zamiast być twardo ucinane "ścianą".
  // Strefa zaniku jest JEDNAKOWA i szeroka w każdą stronę (0.34), żeby każda kula
  // w całości mieściła się w polu i płynnie znikała ze wszystkich krawędzi.
  vec2 su = gl_FragCoord.xy / iResolution.xy; // 0..1 w obu osiach
  float fade = 0.34;
  float edge =
      smoothstep(0.0, fade, su.x) * smoothstep(0.0, fade, 1.0 - su.x) *
      smoothstep(0.0, fade, su.y) * smoothstep(0.0, fade, 1.0 - su.y);
  alpha *= edge;

  fragColor = vec4(col * alpha, alpha);
}
`;

export default function MetaBalls({
  color1 = '#FFEC8E',
  color2 = '#EB8714',
  speed = 0.5,
  opacity = 0.35,
  enableMouseInteraction = true,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, dpr: 1 });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: [1, 1] },
        iTime: { value: 0 },
        uSpeed: { value: speed },
        uOpacity: { value: opacity },
        uMouse: { value: [10, 10] },
        uMouseBall: { value: enableMouseInteraction ? 1 : 0 },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) }
      },
      transparent: true
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const mouseTarget = [10, 10];
    const mouseCurrent = [10, 10];
    const onMouseMove = e => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const minDim = Math.min(rect.width, rect.height);
      // ta sama przestrzeń współrzędnych co w shaderze (środek = 0, y w górę)
      mouseTarget[0] = (x * 2 - rect.width) / minDim;
      mouseTarget[1] = ((rect.height - y) * 2 - rect.height) / minDim;
    };
    if (enableMouseInteraction) window.addEventListener('mousemove', onMouseMove, { passive: true });

    let rafId;
    const start = performance.now();
    // Cap 30 FPS — odciąża główny wątek (płynność scrolla na Firefoksie).
    let lastRender = 0;
    const frameInterval = 1000 / 30;
    const loop = now => {
      rafId = requestAnimationFrame(loop);
      if (now - lastRender < frameInterval) return;
      lastRender = now;
      mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * 0.08;
      mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * 0.08;
      program.uniforms.uMouse.value = mouseCurrent;
      program.uniforms.iTime.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (enableMouseInteraction) window.removeEventListener('mousemove', onMouseMove);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color1, color2, speed, opacity, enableMouseInteraction]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }} />;
}
