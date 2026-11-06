import React, { useEffect, useRef, useState } from 'react';
import { db } from './db.js';
import { Icon } from './ui.jsx';
import { useI18n } from './i18n.jsx';
import { FILMS } from './films.js';

// A small hand-drawn film engine: a paper canvas, lines that "boil", one character (Chris), a slow camera, a voice and soft music.
// Drawings are plain functions of time, so a new film is just a script plus a few drawings.
const W = 960, H = 540;
const INK = '#2B2722', PAPER = '#F6EFE0', ACC = '#E08A3C', SOFT = '#6E665C', LAV = '#DDD7F3', GRN = '#9BC9A8', SKY = '#CFE3EE', SKIN = '#F2C9A5', TEAL = '#5E9C97', HAIR = '#6B4A32', NIGHT = '#2B2F4A';

const rnd = (i, f) => { const x = Math.sin(i * 127.1 + f * 311.7) * 43758.5453; return x - Math.floor(x) - 0.5; };
const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Drawing helpers. G = { c: canvas context, f: jitter frame, a: jitter amount }.
function path(G, pts, o = {}) {
  const { c, f, a } = G;
  const p = pts.map((q, i) => [q[0] + rnd(i * 2, f + (o.seed || 0)) * a, q[1] + rnd(i * 2 + 1, f + (o.seed || 0)) * a]);
  c.beginPath(); c.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; c.quadraticCurveTo(p[i][0], p[i][1], mx, my); }
  const l = p[p.length - 1]; c.lineTo(l[0], l[1]);
  if (o.close) c.closePath();
  if (o.fill) { c.fillStyle = o.fill; c.fill(); }
  if (o.stroke !== false) { c.strokeStyle = o.stroke || INK; c.lineWidth = o.w || 3; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
}
function circle(G, x, y, r, o = {}) {
  const n = 14, pts = [];
  for (let i = 0; i <= n + 1; i++) { const t = (i / n) * Math.PI * 2; pts.push([x + Math.cos(t) * r, y + Math.sin(t) * r]); }
  path(G, pts, { ...o, close: false });
}
function rrect(G, x, y, w, h, r, o = {}) {
  path(G, [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r], [x + r, y]], o);
}
function cloud(G, x, y, s, o = {}) { path(G, [[x - 40 * s, y], [x - 30 * s, y - 24 * s], [x - 6 * s, y - 30 * s], [x + 14 * s, y - 22 * s], [x + 36 * s, y - 20 * s], [x + 46 * s, y], [x + 30 * s, y + 18 * s], [x - 20 * s, y + 18 * s], [x - 40 * s, y]], { fill: LAV, ...o }); }
function sun(G, x, y, r, t) { circle(G, x, y, r, { fill: ACC, stroke: INK, w: 3 }); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + t * 0.2; path(G, [[x + Math.cos(a) * (r + 10), y + Math.sin(a) * (r + 10)], [x + Math.cos(a) * (r + 24), y + Math.sin(a) * (r + 24)]], { w: 3, stroke: ACC }); } }

// Chris: round head, teal jacket, brown hair. o = { ph (walk phase), walk, wave, talk, sit, arms (0..1 raised), face }
function chris(G, x, y, s, o = {}) {
  const { c } = G; c.save(); c.translate(x, y); c.scale(s, s);
  const sw = o.walk ? Math.sin(o.ph || 0) : 0;
  if (o.sit) { path(G, [[-10, 60], [34, 62], [38, 100]], { w: 4 }); path(G, [[8, 60], [52, 64], [56, 100]], { w: 4 }); }
  else { path(G, [[-9, 60], [-9 + 18 * sw, 112]], { w: 4 }); path(G, [[9, 60], [9 - 18 * sw, 112]], { w: 4 }); path(G, [[-9 + 18 * sw, 112], [-22 + 18 * sw, 114]], { w: 4 }); path(G, [[9 - 18 * sw, 112], [-4 - 18 * sw, 114]], { w: 4 }); }
  path(G, [[-22, -6], [22, -6], [20, 66], [-20, 66], [-22, -6]], { fill: TEAL, close: true });
  path(G, [[-16, -8], [0, 6], [16, -8]], { w: 3, stroke: ACC });
  const up = o.arms || 0;
  path(G, [[-22, 4], [-34 - 6 * sw, 28 - 40 * up], [-30, 50 - 70 * up]], { w: 4 });
  if (o.wave) { const w = Math.sin((o.wt || 0) * 7) * 10; path(G, [[22, 4], [44, -18], [50 + w, -46]], { w: 4 }); circle(G, 50 + w, -50, 5, { fill: SKIN }); }
  else path(G, [[22, 4], [34 + 6 * sw, 28 - 40 * up], [30, 50 - 70 * up]], { w: 4 });
  circle(G, 0, -36, 28, { fill: SKIN });
  path(G, [[-28, -40], [-24, -62], [0, -70], [24, -62], [28, -40], [14, -52], [-4, -56], [-20, -46], [-28, -40]], { fill: HAIR, close: true, w: 2 });
  c.fillStyle = INK; c.beginPath(); c.arc(-9, -36, 2.6, 0, 7); c.arc(9, -36, 2.6, 0, 7); c.fill();
  if (o.talk) { const m = 4 + Math.abs(Math.sin((o.tt || 0) * 9)) * 6; c.beginPath(); c.ellipse(0, -22, 6, m / 2, 0, 0, 7); c.fillStyle = '#7A3B2E'; c.fill(); }
  else path(G, [[-8, -25], [0, -20], [8, -25]], { w: 2.5 });
  c.restore();
}
function ground(G, y, scroll = 0) { path(G, [[0, y], [W, y]], { w: 3, stroke: SOFT }); for (let i = -1; i < 14; i++) { const x = ((i * 90 - scroll) % (W + 90) + W + 90) % (W + 90) - 45; path(G, [[x, y + 14], [x + 24, y + 14]], { w: 2, stroke: '#D8CDB6' }); } }
function hills(G, y, col) { path(G, [[0, y], [180, y - 70], [380, y - 20], [600, y - 90], [800, y - 30], [960, y - 60], [960, H], [0, H], [0, y]], { fill: col, close: true, w: 2, stroke: SOFT }); }
function phone(G, x, y, w, h) { rrect(G, x, y, w, h, 22, { fill: '#FFFDF7', w: 4 }); path(G, [[x + w / 2 - 24, y + 14], [x + w / 2 + 24, y + 14]], { w: 4 }); }
function bubble(G, x, y, r, o = {}) { circle(G, x, y, r, { fill: LAV, stroke: INK, w: 2.5, ...o }); }

// Each scene draws itself from time t (seconds into the scene) and its duration d.
const ART = {
  hello(G, t) {
    const { c } = G; sun(G, 700, 190, 56, t); hills(G, 400, '#E8DFC8'); ground(G, 440);
    const x = -80 + ease(t / 3.2) * 560; const arrived = t > 3.2;
    chris(G, x, 320, 1.3, { walk: !arrived, ph: t * 7, wave: arrived, wt: t - 3.2 });
    if (arrived) { const k = ease((t - 3.8) / 0.8); c.globalAlpha = k; cloud(G, 640, 300, 1.1); c.fillStyle = INK; c.font = '600 22px "Patrick Hand",sans-serif'; c.textAlign = 'center'; c.fillText('Chris', 640, 306); c.globalAlpha = 1; }
  },
  born(G, t, d) {
    const { c } = G; const k = ease((t - d * 0.45) / 2.5);
    // night: window, desk, lamp
    c.globalAlpha = 1 - k; c.fillStyle = NIGHT; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) { c.fillStyle = '#FFF4C9'; c.globalAlpha = (1 - k) * (0.5 + 0.5 * Math.sin(t * 2 + i)); c.beginPath(); c.arc((i * 137) % W, (i * 71) % 220 + 20, 2, 0, 7); c.fill(); }
    c.globalAlpha = 1 - k; rrect(G, 120, 330, 420, 20, 6, { fill: '#8C6A4A' }); path(G, [[150, 350], [150, 470]], { w: 6 }); path(G, [[510, 350], [510, 470]], { w: 6 });
    path(G, [[258, 338], [344, 338]], { w: 5 }); path(G, [[270, 338], [270, 470]], { w: 5 }); path(G, [[332, 338], [332, 470]], { w: 5 }); chris(G, 300, 270, 1.0, { sit: true }); circle(G, 560, 300, 22, { fill: '#FFE9A8', stroke: ACC }); c.globalAlpha = 1;
    // dawn: walking
    c.globalAlpha = k; c.fillStyle = PAPER; c.fillRect(0, 0, W, H); sun(G, 480, 250 + (1 - k) * 80, 50, t); hills(G, 400, '#E8DFC8'); ground(G, 440, t * 90);
    chris(G, 420 + Math.sin(t) * 6, 320, 1.3, { walk: true, ph: t * 7 }); c.globalAlpha = 1;
  },
  how(G, t) {
    const { c } = G; phone(G, 90, 70, 230, 400);
    const pulse = 1 + Math.sin(t * 5) * 0.08; circle(G, 205, 360, 36 * pulse, { fill: ACC });
    c.fillStyle = '#FFFDF7'; c.beginPath(); c.roundRect(197, 340, 16, 28, 8); c.fill();
    for (let i = 0; i < 4; i++) { const k = clamp01((t - 1 - i * 0.9) / 0.9); path(G, [[120, 130 + i * 34], [120 + k * 150, 130 + i * 34]], { w: 4, stroke: SOFT }); }
    const k2 = ease((t - 5) / 1.5); c.save(); c.translate(560, 90); c.scale(1, k2); c.globalAlpha = k2; rrect(G, 0, 0, 280, 190, 14, { fill: '#FFFDF7' }); path(G, [[20, 40], [250, 40]], { w: 3, stroke: SOFT }); path(G, [[20, 76], [220, 76]], { w: 3, stroke: SOFT }); path(G, [[20, 112], [180, 112]], { w: 3, stroke: ACC }); c.restore(); c.globalAlpha = 1;
    path(G, [[330, 250], [540, 190]], { w: 3, stroke: SOFT });
    const k3 = ease((t - 8) / 1.5); c.globalAlpha = k3; for (let i = 0; i < 6; i++) { circle(G, 480 + i * 70, 410 - (i % 3 === 1 ? 20 : 0) - i * 6 * k3, 14, { fill: i === 5 ? ACC : LAV }); } c.globalAlpha = 1;
    const k4 = ease((t - 11) / 1); c.globalAlpha = k4; circle(G, 760, 330, 34, { fill: '#F6D9D2', stroke: '#C85A4A' }); path(G, [[748, 320], [748, 340]], { w: 5, stroke: '#C85A4A' }); path(G, [[772, 320], [772, 340]], { w: 5, stroke: '#C85A4A' }); c.globalAlpha = 1;
  },
  walk(G, t) {
    const { c } = G; hills(G, 400, '#E8DFC8'); ground(G, 440, t * 120);
    chris(G, 330, 320, 1.3, { walk: true, ph: t * 7 });
    const n = Math.min(14, Math.floor(t * 1.1)); for (let i = 0; i < n; i++) { const a = i * 2.4, x = 400 + ((i * 53) % 400) + (t - i * 0.9) * 6, y = 250 - ((t - i * 0.9) * 22) % 200 - (i % 4) * 20; c.globalAlpha = clamp01(1 - (y < 70 ? (70 - y) / 40 : 0)); bubble(G, x, 300 + (y - 250), 16 + (i % 3) * 5); c.globalAlpha = 1; }
    path(G, [[430, 430], [520, 410], [600, 440], [700, 400], [800, 420]], { w: 5, stroke: ACC });
    c.fillStyle = INK; c.font = '600 44px "Patrick Hand",sans-serif'; c.textAlign = 'center'; const num = Math.min(176, Math.floor(clamp01((t - 4) / 3) * 176)); if (t > 4) c.fillText(String(num), 800, 130);
  },
  talk(G, t) {
    const { c } = G; hills(G, 400, '#E8DFC8'); ground(G, 440);
    chris(G, 320, 320, 1.3, { talk: true, tt: t });
    for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); c.globalAlpha = 1 - k; path(G, [[400 + k * 90, 270 - 30 - k * 20], [430 + k * 90, 270], [400 + k * 90, 270 + 30 + k * 20]], { w: 3, stroke: ACC }); }
    c.globalAlpha = 1;
    const k = ease((t - 4) / 3); c.globalAlpha = 0.35 + 0.65 * k; chris(G, 700, 360 - 10 * k, 0.8, {}); c.globalAlpha = 1;
    path(G, [[650, 310], [610, 330 - 30 * k]], { w: 0.01, stroke: 'rgba(0,0,0,0)' });
    if (t > 6) { c.globalAlpha = ease((t - 6) / 1.5); cloud(G, 700, 220, 1, { fill: '#FFFDF7' }); circle(G, 700, 215, 8, { fill: ACC }); c.globalAlpha = 1; }
  },
  voices(G, t) {
    const { c } = G; chris(G, 480, 300, 1.2, {});
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + t * 0.15, rx = 330, ry = 190; const x = 480 + Math.cos(a) * rx, y = 270 + Math.sin(a) * ry; c.globalAlpha = 0.75 - 0.35 * ease((t - 4) / 3); cloud(G, x, y, 0.6 + (i % 3) * 0.12); path(G, [[x - 18, y], [x - 4, y - 6], [x + 6, y + 2], [x + 20, y - 4]], { w: 2 }); }
    c.globalAlpha = 1; const k = ease((t - 4) / 3); const r = 8 + k * 16; const g = c.createRadialGradient(480, 290, 2, 480, 290, 70 * k + 10); g.addColorStop(0, 'rgba(224,138,60,.8)'); g.addColorStop(1, 'rgba(224,138,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(480, 290, 70 * k + 10, 0, 7); c.fill(); circle(G, 480, 290, r, { fill: ACC });
  },
  move(G, t) {
    const { c } = G; hills(G, 400, '#E8DFC8'); ground(G, 440);
    const ph = t < 5 ? 'stretch' : 'jog'; chris(G, 300, 320, 1.3, ph === 'stretch' ? { arms: ease(t / 2) * (1 - ease((t - 3.5) / 1.5)) } : { walk: true, ph: t * 10, arms: 0 });
    rrect(G, 640, 250, 110, 150, 12, { fill: '#FFFDF7' }); const lvl = 0.1 + ease(t / 14) * 0.3; c.save(); c.beginPath(); c.rect(644, 396 - 142 * lvl, 102, 142 * lvl); c.clip(); c.fillStyle = GRN; c.fillRect(640, 250, 110, 150); c.restore();
    path(G, [[750, 290], [790, 290], [790, 350], [750, 350]], { w: 4 });
  },
  lock(G, t) {
    const { c } = G; phone(G, 150, 70, 230, 400); rrect(G, 225, 250, 80, 60, 10, { fill: ACC }); path(G, [[240, 250], [240, 220], [250, 205], [280, 205], [290, 220], [290, 250]], { w: 5 });
    for (let i = 0; i < 4; i++) path(G, [[180, 120 + i * 24], [180 + 90 - i * 10, 120 + i * 24]], { w: 3, stroke: SOFT });
    const k = ease((t - 3) / 2); c.setLineDash([10, 10]); path(G, [[390, 260], [520, 200 - 10 * k], [640, 190]], { w: 3, stroke: SOFT }); c.setLineDash([]);
    c.globalAlpha = 0.5; cloud(G, 720, 190, 1.6, {}); c.globalAlpha = 1;
    rrect(G, 660, 330, 120, 50, 25, { fill: '#FFFDF7' }); const on = t > 6; circle(G, on ? 755 : 685, 355, 17, { fill: on ? ACC : '#D8CDB6' });
  },
  bench(G, t) {
    const { c } = G; hills(G, 400, '#E8DFC8'); ground(G, 460); rrect(G, 300, 380, 360, 18, 6, { fill: '#8C6A4A' }); path(G, [[320, 398], [320, 460]], { w: 6 }); path(G, [[640, 398], [640, 460]], { w: 6 });
    chris(G, 430, 316, 1.0, { sit: true }); chris(G, 560, 334, 0.7, { sit: true });
    sun(G, 760, 150, 40, t); const k = ease((t - 3) / 2); c.globalAlpha = k; circle(G, 500, 180 - 10 * k, 12, { fill: '#F2B8A8' }); c.globalAlpha = 1;
  },
  start(G, t) {
    const { c } = G; sun(G, 480, 200, 60, t); hills(G, 400, '#E8DFC8'); path(G, [[300, 540], [440, 420], [470, 330], [480, 300]], { w: 6, stroke: ACC });
    path(G, [[660, 540], [520, 420], [490, 330], [480, 300]], { w: 6, stroke: ACC });
    chris(G, 250, 320, 1.2, { wave: true, wt: t });
    const p = 1 + Math.sin(t * 4) * 0.06; circle(G, 700, 400, 46 * p, { fill: ACC }); c.fillStyle = '#FFFDF7'; c.beginPath(); c.moveTo(690, 380); c.lineTo(718, 400); c.lineTo(690, 420); c.closePath(); c.fill();
  },
};

// Soft music: a slow chord pad plus a few quiet plucks. Made in the browser, so there is no file to load. It dips under the voice.
function makeMusic() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ac = new AC(); const master = ac.createGain(); master.gain.value = 0.0; master.connect(ac.destination);
  const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
  let bar = 0; let timer = null;
  const play = () => {
    const now = ac.currentTime; const ch = chords[bar % 4]; bar++;
    ch.forEach((fq, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = fq; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.5, now + 1.2); g.gain.linearRampToValueAtTime(0, now + 4.2); o.connect(g); g.connect(master); o.start(now); o.stop(now + 4.4); });
    [0, 1, 2, 1].forEach((k, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = ch[k] * 2; const t0 = now + 0.4 + i * 0.9; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.35, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 1); });
  };
  return {
    start() { if (ac.state === 'suspended') ac.resume(); play(); timer = setInterval(play, 4000); },
    level(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.4); },
    stop() { clearInterval(timer); try { master.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => ac.close(), 600); } catch {} },
  };
}

export default function Film({ id, onClose, open }) {
  const { t, he } = useI18n();
  const L = he ? 'he' : 'en';
  const film = FILMS[id] || FILMS.intro;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(true);
  const [done, setDone] = useState(false);
  const cv = useRef(null), st = useRef({ t: 0, last: 0, playing: false, i: 0 }), music = useRef(null), spoke = useRef(false), minDone = useRef(false);
  const grain = useRef(null);
  const sc = film.scenes[i];
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { st.current.playing = playing; st.current.i = i; }, [playing, i]);

  // draw loop
  useEffect(() => {
    const el = cv.current; if (!el) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1); el.width = W * dpr; el.height = H * dpr;
    const c = el.getContext('2d'); let raf;
    if (!grain.current) { const g = document.createElement('canvas'); g.width = W; g.height = H; const gc = g.getContext('2d'); for (let n = 0; n < 2600; n++) { gc.fillStyle = `rgba(90,60,20,${Math.random() * 0.06})`; gc.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5); } grain.current = g; }
    const frame = (now) => {
      const s = st.current; const dt = s.last ? (now - s.last) / 1000 : 0; s.last = now; if (s.playing) s.t += dt;
      const sceneNow = film.scenes[s.i]; const d = sceneNow.min;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
      const z = reduce ? 1 : 1 + 0.05 * (1 - Math.min(1, s.t / d)); c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
      const G = { c, f: reduce ? 0 : Math.floor(now / 125), a: reduce ? 0 : 1.6 };
      try { ART[sceneNow.art](G, s.t, d); } catch (e) { /* a drawing never stops the film */ }
      c.restore(); c.drawImage(grain.current, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [film]);

  const stopVoice = () => { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} };
  const advance = () => {
    if (st.current.i >= film.scenes.length - 1) { setPlaying(false); setDone(true); music.current && music.current.level(0.02); db.settings.put({ key: 'seen:explainer:' + film.id, value: Date.now() }); return; }
    setI((n) => n + 1);
  };

  // each scene: reset the clock, speak the line, move on when both the voice and the minimum time are done
  useEffect(() => {
    st.current.t = 0; spoke.current = false; minDone.current = false;
    if (!playing) return undefined;
    let dead = false; const text = sc[L];
    const tryNext = () => { if (!dead && spoke.current && minDone.current) setTimeout(() => !dead && advance(), 500); };
    const minT = setTimeout(() => { minDone.current = true; tryNext(); }, sc.min * 1000);
    const fallback = Math.max(sc.min * 1000, text.length * 75);
    if (voice && hasTTS) {
      try {
        stopVoice(); const u = new SpeechSynthesisUtterance(text); u.lang = he ? 'he-IL' : 'en-US'; u.rate = 0.95;
        const vs = window.speechSynthesis.getVoices(); const v = vs.find((x) => x.lang && x.lang.toLowerCase().startsWith(u.lang.toLowerCase())); if (v) u.voice = v;
        u.onstart = () => music.current && music.current.level(0.04);
        u.onend = () => { music.current && music.current.level(0.1); spoke.current = true; tryNext(); };
        u.onerror = () => { spoke.current = true; setTimeout(tryNext, Math.max(0, fallback - sc.min * 1000)); };
        window.speechSynthesis.speak(u);
        setTimeout(() => { spoke.current = true; tryNext(); }, fallback + 8000);
      } catch { setTimeout(() => { spoke.current = true; tryNext(); }, fallback); }
    } else setTimeout(() => { spoke.current = true; tryNext(); }, fallback);
    return () => { dead = true; clearTimeout(minT); stopVoice(); };
  }, [playing, i, voice]);

  useEffect(() => () => { stopVoice(); music.current && music.current.stop(); }, []);

  const toggle = () => {
    if (!playing) { if (!music.current) { music.current = makeMusic(); music.current && music.current.start(); } music.current && music.current.level(0.1); setDone(false); setPlaying(true); }
    else { setPlaying(false); stopVoice(); music.current && music.current.level(0.0); }
  };
  const go = (n) => { stopVoice(); setDone(false); setI(Math.max(0, Math.min(film.scenes.length - 1, n))); };
  const close = () => { stopVoice(); music.current && music.current.stop(); onClose(); };

  return (
    <div className="screen">
      <div className="top"><div><span className="eyebrow">{t('A short film')}</span><h1>{he ? 'היי, אני כריס' : "Hi, I'm Chris"}</h1></div><button className="iconbtn" onClick={close} aria-label={t('Close')}><Icon n="close" size={20} /></button></div>
      <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 30px -16px rgba(90,60,20,.5)' }} onClick={toggle}>
        <canvas ref={cv} style={{ display: 'block', width: '100%', aspectRatio: '16 / 9' }} role="img" aria-label={sc[L]} />
      </div>
      <p className="lead" dir="auto" style={{ minHeight: 110 }}>{sc[L]}</p>
      <div style={{ display: 'flex', gap: 4 }}>{film.scenes.map((s, n) => <button key={n} aria-label={String(n + 1)} onClick={() => go(n)} style={{ flex: 1, height: 6, border: 0, borderRadius: 3, background: n <= i ? '#E08A3C' : '#D8CDB6', padding: 0 }} />)}</div>
      <div className="pills">
        <button className="pill" onClick={() => go(i - 1)} disabled={i === 0} aria-label={t('Back')}>←</button>
        <button className="pill on" onClick={toggle}>{playing ? t('Pause') : t('Play')}</button>
        <button className="pill" onClick={() => go(i + 1)} disabled={i >= film.scenes.length - 1} aria-label={t('Next')}>→</button>
      </div>
      {hasTTS && <button className="link center small" onClick={() => { stopVoice(); setVoice(!voice); }}>{voice ? t('Turn the voice off') : t('Turn the voice on')}</button>}
      {(done || i === film.scenes.length - 1) && <p className="small" dir="auto">{film.source[L]}</p>}
      {done && open && <button className="btn" onClick={() => { close(); open('talk'); }}>{he ? 'מתחילים דקה אחת' : 'Start with one minute'}</button>}
      <button className="link center" onClick={close}>{done ? t('Done') : t('Skip this')}</button>
    </div>
  );
}
