import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Cat } from 'lucide-react';
import { useRequest } from '@/components/request/request-provider';
import { openContactPanel } from '@/components/contact-panel';

// A little scene in the margins, just for fun.
// The phantom kitty has moods: she floats around, walks along the edge under the header, naps on
// headings and cards, bullies the little Claw Point logo, hisses when the cursor pokes her, and
// comments on what the visitor is doing (typing in a form, running a calculator, submitting a deal,
// reading a guide, scrolling fast). Now and then she flies up and boops the logo in the header,
// which wobbles. She never takes the pointer (pointer-events: none), so the page is never blocked. A small corner button hides them (remembered per device); they're off by default
// for visitors who prefer reduced motion.

const KEY = 'clawpoint:ghost-chase';
const MET = 'clawpoint:kitty-met';
const BODY = '#173a2a'; // Claw Point deep green
const CELEBRATE = 'clawpoint:celebrate';
const KW = 66, KH = 57;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const readPref = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const writePref = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } };
const firstVisit = () => { try { if (localStorage.getItem(MET)) return false; localStorage.setItem(MET, '1'); return true; } catch { return false; } };

const SAY = {
	idle: ['Good to see you.', 'EMD? Earnest Meow Deposit.', 'I closed on a cardboard box once.', 'Is that a double close? Twice the treats.', 'Take your time, I’ll be here.', 'Every deal gets a real human. And a cat.'],
	hiss: ['Hsss! No poking!', 'Hsss! Paws off!', 'Hsss! …okay, hi.', 'Personal space! Hsss!'],
	napWake: ['Hsss! I was napping!', 'Five more minutes…', 'Mrrf. Fine, I’m up.'],
	napStart: ['*yawn*', 'Nap o’clock.', 'Wake me at closing.'],
	bully: ['Boop.', 'Mine now.', 'Too slow, logo!', 'Tag, you’re it!', 'Nice cap. Boop.'],
	walk: ['Just walking the edge.', 'Patrolling the header.', 'Don’t mind me.'],
	typing: ['Whatcha typing?', 'Ooh, a form! I’ll supervise.', 'Be honest on that one.', 'Typo patrol… purr.'],
	math: ['Ooh, numbers!', 'Run the math, human.', 'That spread looks tasty.', 'Carry the one… meow.'],
	deal: ['A deal! Purrfect!', 'Ooh, paperwork! My favorite.', 'Sent! I approve.', 'Fur-midable deal!'],
	scroll: ['Wheee!', 'Slow down!', 'Woah, woah!'],
	pounce: ['Sparkle! Mine!', '*wiggle wiggle*', 'Got it!', 'Pounce!'],
};
const PAGE: Record<string, string[]> = {
	'/': ['Welcome to Claw Point!', 'Hi! Let’s get your deal moving.'],
	'/blog': ['Learning time!', 'Study hard, human.'],
	'/stack': ['Stack Method? Fancy.', 'Stack the treats too, please.'],
	'/echo': ['Echo… echo… meow.'],
	'/funding': ['Show me the money.'],
	'/calculators': ['Calculators! My kind of toys.'],
	'/network': ['Join the pack! We love new friends.'],
	'/contact': ['Say hi! My humans reply fast.'],
	'/booking': ['Pick a time. Amira’s lovely.'],
	'/ask': ['Ask away! I know a few things.'],
};

// The kitty's head for the floating pose (viewBox 0 0 140 120).
const HEAD = 'M41,60 L31,13 Q31,10 34,12 L58,35 Q70,32 82,35 L106,12 Q109,10 109,13 L99,60 Q103,84 88,100 Q70,113 52,100 Q37,84 41,60 Z';
const PUFF = Array.from({ length: 34 }, (_, i) => { const a = (i / 34) * Math.PI * 2, r = i % 2 ? 50 : 60; return `${(70 + Math.cos(a) * r).toFixed(1)},${(70 + Math.sin(a) * r * 0.9).toFixed(1)}`; }).join(' ');

// Friendly nudges with a button, so visitors can act on them right away.
type Nudge = { line: string; label: string; go: 'deal' | 'booking' | 'chat' | 'funding' | 'network' };
const NUDGES: Nudge[] = [
	{ line: 'Got a deal? My humans fund those.', label: 'Submit a deal', go: 'deal' },
	{ line: 'Amira’s really nice. Book a quick call?', label: 'Book a call', go: 'booking' },
	{ line: 'Stuck on a structure? Text the team.', label: 'Text the team', go: 'chat' },
	{ line: 'No primary lender? We can provide one.', label: 'Start a request', go: 'deal' },
	{ line: 'We fund in all 50 states. I nap in all 50.', label: 'See funding', go: 'funding' },
	{ line: 'Want to work together? Join the network!', label: 'Join the network', go: 'network' },
];

const SIDE_BODY = 'M26,72 C30,62 56,58 80,60 C92,61 100,57 104,50 L106,35 Q106,32 108,34 L113,44 L118,36 Q120,34 120,37 L120,52 C125,58 123,66 114,69 C106,72 100,78 94,82 C78,86 56,86 44,82 C34,80 26,78 26,72 Z';
const SIDE_TAIL = 'M30,72 C12,70 6,52 14,40 C19,33 28,36 25,44';
const LOAF = 'M20,106 C18,92 32,82 50,80 C54,72 58,64 64,58 C68,52 74,48 80,48 L83,33 Q84,30 86,32 L92,42 L99,34 Q101,32 102,35 L103,50 C109,56 110,66 104,73 C118,78 126,90 124,106 Z';
const LOAF_TAIL = 'M24,106 C46,113 92,113 116,106';

type Mode = 'float' | 'walk' | 'nap' | 'bully' | 'visit' | 'hiss' | 'party' | 'pounce';
type Pose = 'head' | 'walk' | 'loaf' | 'sit' | 'puff';

export function GhostChase() {
	const [on, setOn] = useState(false);
	const [ready, setReady] = useState(false);
	const navigate = useNavigate();
	const { openPicker } = useRequest();
	const act = useRef<(go: Nudge['go']) => void>(() => {});
	act.current = go => { if (go === 'deal') openPicker(); else if (go === 'chat') openContactPanel(); else navigate(`/${go}`); };
	const kitty = useRef<HTMLDivElement>(null);
	const kSvg = useRef<SVGSVGElement>(null);
	const kEyes = useRef<SVGGElement>(null);
	const legs = useRef<SVGGElement>(null);
	const tail = useRef<SVGPathElement>(null);
	const kBubble = useRef<HTMLDivElement>(null);
	const zzz = useRef<HTMLDivElement>(null);
	const star = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const pref = readPref();
		setOn(pref ? pref === 'on' : !reduce);
		setReady(true);
	}, []);

	useEffect(() => {
		if (!on || !kitty.current || !kSvg.current) return;
		const k = kitty.current, svg = kSvg.current;
		const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
		const seed = Array.from({ length: 6 }, () => rand(0, Math.PI * 2));
		const kp = { x: innerWidth * 0.6, y: innerHeight * 0.45, vx: 0, vy: 0, tilt: 0, face: 1, spin: 0 };
		let mode: Mode = 'float', modeUntil = performance.now() + rand(7000, 11000), pose: Pose = 'head';
		let napEl: Element | null = null, napOff = 0, visitEl: Element | null = null, walkDir = 1;
		let last = performance.now(), raf = 0, laughUntil = 0, pokedAt = 0;
		// Pounce: crouch and wiggle, then leap in an arc to catch a sparkle (squash and stretch, cartoon style).
		const jump = { phase: '' as '' | 'crouch' | 'leap' | 'land', t0: 0, sx: 0, sy: 0, ex: 0, ey: 0, dur: 700 };
		let sq = { x: 1, y: 1 };
		const ptr = { x: -999, y: -999, t: 0 };
		let lastPathSeen = false;
		let lastPath = '', lastScrollY = scrollY, lastScrollT = performance.now(), lastMathAt = 0, lastScrollTalk = 0;

		// Speech bubbles: one line at a time each, fading out on their own.
		let kSayUntil = 0;
		const say = (line: string, ms = 2600, nudge?: Nudge) => {
			const el = kBubble.current; if (!el) return;
			el.replaceChildren(document.createTextNode(line));
			if (nudge) {
				const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'gc-cta', textContent: `${nudge.label} →` });
				btn.addEventListener('click', () => { el.classList.remove('show', 'has-cta'); kSayUntil = 0; act.current(nudge.go); });
				el.append(btn);
			}
			el.classList.toggle('has-cta', Boolean(nudge)); el.classList.add('show'); kSayUntil = performance.now() + ms;
		};
		let lastNudge = performance.now() - 30000;
		const nudge = () => { const t = performance.now(); if (t - lastNudge < 55000) return false; lastNudge = t; say('', 0); const n = pick(NUDGES); say(n.line, 7000, n); return true; };
		const setMode = (m: Mode, ms: number) => { mode = m; modeUntil = performance.now() + ms; k.dataset.mood = m; };
		const setPose = (p: Pose) => { if (pose !== p) { pose = p; svg.dataset.pose = p; } };

		const napSpot = () => {
			const list = Array.from(document.querySelectorAll('main h1, main h2, main .button, main .tip-box, main .learn-steps li, main .network-group, main .contact-way, main .tool-tile, main .calculator, main .learn-structure, main .learn-article'))
				.filter(el => { const r = el.getBoundingClientRect(); return r.width > 90 && r.top > 140 && r.top < innerHeight - 90; });
			return list.length ? pick(list) : null;
		};

		function poke() {
			const t = performance.now(); if (t - pokedAt < 1800) return; pokedAt = t;
			say(mode === 'nap' ? pick(SAY.napWake) : pick(SAY.hiss), 2200); napEl = null; setMode('hiss', 1100);
		}
		// Visitor events the kitty reacts to.
		const onPointer = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); };
		const onDown = (e: PointerEvent) => { onPointer(e); if ((e.target as Element)?.closest?.('.gc-bubble')) return; const cx = kp.x + KW / 2, cy = kp.y + KH / 2; if (Math.hypot(e.clientX - cx, e.clientY - cy) < 70) poke(); };
		const onFocus = (e: FocusEvent) => {
			const el = e.target as Element;
			if (!el.matches?.('input, textarea, select') || el.closest('.ghost-chase')) return;
			if (el.closest('.tc-field, .calculator')) return; // calculator inputs get the "math" reaction instead
			if (mode === 'nap' || mode === 'hiss') return;
			visitEl = el; setMode('visit', 12000); say(pick(SAY.typing));
		};
		const onInput = (e: Event) => {
			const el = e.target as Element;
			if (!el.closest?.('.tc-field, .calculator')) return;
			const t = performance.now(); if (t - lastMathAt < 9000 || mode === 'nap') return;
			lastMathAt = t; say(pick(SAY.math));
		};
		const onCelebrate = () => { setMode('party', 2600); say(pick(SAY.deal), 3200); };
		window.addEventListener('pointermove', onPointer, { passive: true });
		window.addEventListener('pointerdown', onDown, { passive: true });
		document.addEventListener('focusin', onFocus);
		document.addEventListener('input', onInput);
		window.addEventListener(CELEBRATE, onCelebrate);

		const seek = (tx: number, ty: number, max: number, dt: number) => {
			const dx = tx - kp.x, dy = ty - kp.y, d = Math.hypot(dx, dy) || 1, want = Math.min(max, d * 3);
			kp.vx += ((dx / d) * want - kp.vx) * Math.min(1, dt * 4); kp.vy += ((dy / d) * want - kp.vy) * Math.min(1, dt * 4);
			return d;
		};

		function startPounce() {
			const w = innerWidth, h = innerHeight, t = performance.now();
			const dir = kp.x < w / 2 ? 1 : -1;
			jump.sx = kp.x; jump.sy = kp.y;
			jump.ex = Math.max(20, Math.min(w - KW - 20, kp.x + dir * rand(260, 460)));
			jump.ey = Math.max(110, Math.min(h - KH - 30, kp.y + rand(-140, 140)));
			jump.dur = 620 + Math.hypot(jump.ex - jump.sx, jump.ey - jump.sy) * 0.6;
			jump.phase = 'crouch'; jump.t0 = t; kp.face = dir; kp.vx = 0; kp.vy = 0;
			const st = star.current; if (st) { st.style.transform = `translate3d(${(jump.ex + KW / 2).toFixed(0)}px,${(jump.ey + KH * 0.4).toFixed(0)}px,0)`; st.classList.remove('pop'); st.classList.add('show'); }
			setMode('pounce', 6000); if (Math.random() < 0.7) say(pick(SAY.pounce.slice(0, 2)), 1500);
		}

		const tick = (t: number) => {
			const dt = Math.min(0.04, (t - last) / 1000); last = t;
			if (document.hidden) { raf = requestAnimationFrame(tick); return; }
			const w = innerWidth, h = innerHeight, s = t / 1000, f = s * 1.6;
			const header = document.querySelector('.site-header')?.getBoundingClientRect();
			const edgeY = Math.max(4, (header?.bottom ?? 0) - KH * 0.9); // paws on the header's bottom edge

			// Page comments, and a squeal when the visitor scrolls fast.
			if (location.pathname !== lastPath) {
				lastPath = location.pathname;
				const key = lastPath === '/' ? '/' : Object.keys(PAGE).find(p => p !== '/' && lastPath.startsWith(p));
				const hello = !lastPathSeen && firstVisit(); lastPathSeen = true;
				if (hello) window.setTimeout(() => say('Hi, I’m Clawdia! Welcome to Claw Point.', 4200), 900);
				else if (key) window.setTimeout(() => say(pick(PAGE[key])), 900);
			}
			const sdt = (t - lastScrollT) / 1000;
			if (sdt > 0.15) { const speed = Math.abs(scrollY - lastScrollY) / sdt; if (speed > 2400 && t - lastScrollTalk > 12000 && mode !== 'nap') { lastScrollTalk = t; say(pick(SAY.scroll), 1500); } lastScrollY = scrollY; lastScrollT = t; }

			// Poked by the cursor? (a moving pointer right on top of her)
			const cx = kp.x + KW / 2, cy = kp.y + KH / 2;
			if (t - ptr.t < 120 && Math.hypot(ptr.x - cx, ptr.y - cy) < 34 && mode !== 'hiss' && t - pokedAt > 7000 && !kBubble.current?.classList.contains('has-cta')) poke();

			// Pick the next mood when the current one runs out.
			if (t > modeUntil && mode !== 'nap' && mode !== 'visit') {
				if (mode === 'hiss') { const a = Math.atan2(cy - ptr.y, cx - ptr.x); kp.vx = Math.cos(a) * 520; kp.vy = Math.sin(a) * 420; setMode('float', rand(5000, 8000)); }
				else {
					const r = Math.random();
					if (r < 0.22) startPounce();
					else if (r < 0.4) { setMode('walk', 30000); walkDir = kp.x < w / 2 ? 1 : -1; if (Math.random() < 0.5) say(pick(SAY.walk)); }
					else if (r < 0.58) { napEl = napSpot(); if (napEl) { const rr = napEl.getBoundingClientRect(); napOff = rand(0, Math.max(0, Math.min(rr.width, 420) - KW)); setMode('nap', rand(11000, 17000)); } else setMode('float', 6000); }
					else if (r < 0.74) setMode('bully', 14000);
					else { setMode('float', rand(7000, 11000)); if (!nudge() && Math.random() < 0.35) say(pick(SAY.idle)); }
				}
			}

			// Each mood moves her differently.
			let napping = false;
			if (mode === 'float' || mode === 'party') {
				const px = w * (0.5 + 0.3 * Math.sin(f * 0.23 + seed[0]) + 0.14 * Math.sin(f * 0.61 + seed[1]) + 0.04 * Math.sin(f * 1.7 + seed[2]));
				const py = h * (0.48 + 0.26 * Math.sin(f * 0.31 + seed[3]) + 0.12 * Math.sin(f * 0.83 + seed[4]) + 0.05 * Math.cos(f * 1.9 + seed[5]));
				const tx = Math.max(16, Math.min(w - KW - 16, px)), ty = Math.max(96, Math.min(h - KH - 16, py));
				kp.vx += ((tx - kp.x) * 3.2 - kp.vx) * Math.min(1, dt * 3.6); kp.vy += ((ty - kp.y) * 3.2 - kp.vy) * Math.min(1, dt * 3.6);
				setPose('head');
				if (mode === 'party' && t > modeUntil) setMode('float', 6000);
			} else if (mode === 'walk') {
				// Drop onto the edge under the header, then pad along it to the other side.
				const onEdge = Math.abs(kp.y - edgeY) < 6;
				if (!onEdge) seek(kp.x, edgeY, 420, dt);
				else { kp.vy = 0; kp.y = edgeY; kp.vx += (walkDir * 92 - kp.vx) * Math.min(1, dt * 3); }
				setPose(onEdge ? 'walk' : 'head');
				if ((walkDir > 0 && kp.x > w - KW - 20) || (walkDir < 0 && kp.x < 20)) setMode('float', rand(6000, 9000));
			} else if (mode === 'nap') {
				const r = napEl?.isConnected ? napEl.getBoundingClientRect() : null;
				if (!r || r.top < 90 || r.top > h - 30) { napEl = null; setMode('float', 6000); say('Hmph.'); }
				else {
					const d = seek(r.left + napOff, r.top - KH * 0.92, 360, dt);
					if (d < 6) {
						kp.vx = 0; kp.vy = 0; kp.x = r.left + napOff; kp.y = r.top - KH * 0.92; napping = true;
						if (pose !== 'loaf') say(pick(SAY.napStart), 1600);
					}
					setPose(napping ? 'loaf' : 'head');
					if (t > modeUntil) { napEl = null; setMode('float', 7000); say(pick(SAY.napWake.slice(1))); }
				}
			} else if (mode === 'visit') {
				const r = visitEl?.isConnected ? visitEl.getBoundingClientRect() : null;
				if (!r || document.activeElement !== visitEl || t > modeUntil || r.bottom < 90 || r.top > h) { visitEl = null; setMode('float', 6000); }
				else { const tx = Math.min(w - KW - 10, r.right - KW * 0.6), ty = r.top - KH * 0.92, d = seek(tx, ty, 380, dt); setPose(d < 8 ? 'sit' : 'head'); if (d < 8) { kp.vx = 0; kp.vy = 0; } }
			} else if (mode === 'bully') { // fly up to the header logo and boop it
				const logo = document.querySelector('.site-header .brand-face');
				const r = logo?.getBoundingClientRect();
				if (!r || r.bottom < 0) setMode('float', 6000);
				else {
					const d = seek(r.right - KW * 0.15, r.top + r.height * 0.15, 320, dt);
					setPose('head');
					if (d < 26) {
						laughUntil = t + 1400; say(pick(SAY.bully), 1800);
						logo?.classList.remove('gc-booped'); void (logo as HTMLElement | null)?.getBoundingClientRect(); logo?.classList.add('gc-booped');
						kp.vx = 360; kp.vy = 380; setMode('float', rand(6000, 9000));
					}
					if (mode === 'bully' && t > modeUntil) setMode('float', 6000);
				}
			} else if (mode === 'pounce') {
				const e = t - jump.t0;
				if (jump.phase === 'crouch') { // sit and stare at the sparkle, then drop into a crouch and wiggle
					kp.vx = 0; kp.vy = 0; napping = true;
					if (e < 1100) { setPose('sit'); sq = { x: 1, y: 1 + Math.sin(e / 160) * 0.02 }; }
					else { setPose('walk'); sq = { x: 1.12, y: 0.82 + Math.sin(e / 45) * 0.04 }; }
					if (e > 1900) { jump.phase = 'leap'; jump.t0 = t; }
				} else if (jump.phase === 'leap') { // arc through the air, stretched long
					setPose('walk');
					const p = Math.min(1, e / jump.dur), arc = Math.sin(p * Math.PI) * Math.min(200, 90 + Math.abs(jump.ex - jump.sx) * 0.3);
					const nx = jump.sx + (jump.ex - jump.sx) * p, ny = jump.sy + (jump.ey - jump.sy) * p - arc;
					kp.vx = (nx - kp.x) / Math.max(dt, 0.001); kp.vy = (ny - kp.y) / Math.max(dt, 0.001); kp.x = nx; kp.y = ny; napping = true;
					const stretch = Math.sin(p * Math.PI);
					sq = { x: 1 + stretch * 0.32, y: 1 - stretch * 0.2 };
					if (p >= 1) { jump.phase = 'land'; jump.t0 = t; star.current?.classList.add('pop'); if (Math.random() < 0.6) say(pick(SAY.pounce.slice(2)), 1400); }
				} else if (jump.phase === 'land') { // squash on landing, then spring back
					setPose('walk');
					kp.vx = 0; kp.vy = 0; napping = true;
					const p = Math.min(1, e / 380);
					sq = { x: 1 + Math.sin((1 - p) * Math.PI) * 0.22, y: 1 - Math.sin((1 - p) * Math.PI) * 0.26 };
					if (p >= 1) { jump.phase = ''; star.current?.classList.remove('show'); setMode('float', rand(5000, 8000)); }
				}
			} else if (mode === 'hiss') { kp.vx *= 0.8; kp.vy *= 0.8; setPose('puff'); }

			if (!napping) { kp.x += kp.vx * dt; kp.y += kp.vy * dt; }
			kp.x = Math.max(4, Math.min(w - KW - 4, kp.x)); kp.y = Math.max(4, Math.min(h - KH - 4, kp.y));
			if (Math.abs(kp.vx) > 10) kp.face = kp.vx > 0 ? 1 : -1;
			if (mode !== 'pounce') { // gentle cartoon stretch when speeding up, squish when slowing
				const spd = Math.min(600, Math.hypot(kp.vx, kp.vy));
				const target = pose === 'head' ? { x: 1 + spd * 0.00045, y: 1 - spd * 0.00035 } : { x: 1, y: 1 };
				sq = { x: sq.x + (target.x - sq.x) * Math.min(1, dt * 8), y: sq.y + (target.y - sq.y) * Math.min(1, dt * 8) };
			}
			const still = pose === 'loaf' || pose === 'sit' || pose === 'walk';
			kp.tilt += ((still ? 0 : Math.max(-22, Math.min(22, kp.vx * 0.06))) - kp.tilt) * Math.min(1, dt * 4);
			if (mode === 'party') kp.spin = (kp.spin + dt * 540) % 360; else kp.spin += (0 - kp.spin) * Math.min(1, dt * 6);
			const bob = still ? 0 : Math.sin(s * 2.4) * 5;
			const flip = still ? kp.face : 1;
			k.style.transform = `translate3d(${kp.x.toFixed(1)}px,${(kp.y + bob).toFixed(1)}px,0) rotate(${(kp.tilt + kp.spin + (mode === 'pounce' && jump.phase === 'leap' ? Math.max(-30, Math.min(30, Math.atan2(kp.vy, Math.abs(kp.vx) || 1) * 57)) * kp.face : 0)).toFixed(2)}deg) scale(${(sq.x * flip).toFixed(3)},${sq.y.toFixed(3)})`;
			const sp = Math.hypot(kp.vx, kp.vy) || 1;
			kEyes.current?.setAttribute('transform', laughUntil > t ? 'translate(0 47) scale(1 .3)' : `translate(${(kp.vx / sp * 4).toFixed(2)} ${(kp.vy / sp * 3).toFixed(2)})`);
			// Walking legs and a swishing tail.
			const step = s * 12;
			legs.current?.querySelectorAll('line').forEach((l, i) => { const a = Math.sin(step + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 6; l.setAttribute('x2', String(Number(l.dataset.x) + a)); });
			tail.current?.setAttribute('transform', `rotate(${(Math.sin(s * (pose === 'loaf' ? 1.2 : 2.4)) * (pose === 'loaf' ? 3 : 10)).toFixed(1)} 30 72)`);
			zzz.current?.classList.toggle('show', napping);
			// Bubbles follow their speakers and fade on their own.
			if (kBubble.current) { kBubble.current.style.transform = `translate3d(${(kp.x + KW / 2).toFixed(1)}px,${(kp.y + bob - 6).toFixed(1)}px,0)`; if (t > kSayUntil) kBubble.current.classList.remove('show'); }
			if (zzz.current) zzz.current.style.transform = `translate3d(${(kp.x + KW * (kp.face > 0 ? 0.78 : 0.22)).toFixed(1)}px,${(kp.y - 4).toFixed(1)}px,0)`;

			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', onPointer);
			window.removeEventListener('pointerdown', onDown);
			document.removeEventListener('focusin', onFocus);
			document.removeEventListener('input', onInput);
			window.removeEventListener(CELEBRATE, onCelebrate);
		};
	}, [on]);

	if (!ready) return null;
	const toggle = () => { const next = !on; setOn(next); writePref(next ? 'on' : 'off'); };

	return <>
		{on && <div className="ghost-chase" aria-hidden="true">
			<div ref={kitty} className="gc-kitty" style={{ width: KW, height: KH }}>
				<svg ref={kSvg} viewBox="0 0 140 120" overflow="visible" data-pose="head">
					<defs>
						<linearGradient id="gc-fur" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stopColor="#2a5a43" /><stop offset=".5" stopColor={BODY} /><stop offset="1" stopColor="#0d2117" /></linearGradient>
						<radialGradient id="gc-iris" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#fff2b0" /><stop offset=".55" stopColor="#dcc64a" /><stop offset="1" stopColor="#a88a1c" /></radialGradient>
						<filter id="gc-halo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8" /></filter>
						<filter id="gc-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.4" /></filter>
					</defs>
					{/* Head: sleek, angular, almond gold eyes with slit pupils. Also the base of the hiss. */}
					<g className="gc-pose gc-pose-head">
						<polygon className="gc-puff" points={PUFF} fill="url(#gc-fur)" stroke="#dcc64a" strokeOpacity=".5" strokeWidth="1.2" strokeLinejoin="round" />
						<path d={HEAD} fill="#24533d" opacity=".3" filter="url(#gc-halo)" transform="translate(0 6)" />
						<path d={HEAD} fill="url(#gc-fur)" stroke="#dcc64a" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round" />
						<g ref={kEyes}>
							<path d="M45,69 Q55,59 65,68 Q55,75 45,69 Z M75,68 Q85,59 95,69 Q85,75 75,68 Z" fill="#dcc64a" opacity=".55" filter="url(#gc-glow)" />
							<path d="M45,69 Q55,59 65,68 Q55,75 45,69 Z M75,68 Q85,59 95,69 Q85,75 75,68 Z" fill="url(#gc-iris)" />
							<ellipse cx="55" cy="67.5" rx="1.5" ry="5" fill="#0d2117" /><ellipse cx="85" cy="67.5" rx="1.5" ry="5" fill="#0d2117" />
						</g>
						<g className="gc-fangs"><path d="M62,89 Q70,96 78,89 Q70,92 62,89 Z" fill="#0d2117" /><path d="M64.5,89.5 l1.8,4 l1.8,-3.4 Z M72,90.1 l1.8,3.4 l1.8,-4 Z" fill="#fff7dc" /></g>
					</g>
					{/* Walking along the edge: a long, sleek side profile */}
					<g className="gc-pose gc-pose-walk">
						<path ref={tail} d={SIDE_TAIL} fill="none" stroke="url(#gc-fur)" strokeWidth="5.5" strokeLinecap="round" />
						<g ref={legs} stroke={BODY} strokeWidth="5" strokeLinecap="round">
							<line data-x="44" x1="44" y1="78" x2="44" y2="105" /><line data-x="52" x1="52" y1="78" x2="52" y2="105" />
							<line data-x="86" x1="86" y1="76" x2="86" y2="105" /><line data-x="94" x1="94" y1="76" x2="94" y2="105" />
						</g>
						<path d={SIDE_BODY} fill="url(#gc-fur)" stroke="#dcc64a" strokeOpacity=".5" strokeWidth="1.2" strokeLinejoin="round" />
						<path d="M108,55 Q113,50 118,54 Q113,58 108,55 Z" fill="url(#gc-iris)" /><ellipse cx="113" cy="54.3" rx=".9" ry="2.8" fill="#0d2117" />
					</g>
					{/* Resting sphinx: napping (closed eyes) or sitting up and watching (open eyes) */}
					<g className="gc-pose gc-pose-loaf">
						<path d={LOAF_TAIL} fill="none" stroke="url(#gc-fur)" strokeWidth="5.5" strokeLinecap="round" />
						<path d={LOAF} fill="url(#gc-fur)" stroke="#dcc64a" strokeOpacity=".5" strokeWidth="1.2" strokeLinejoin="round" />
						<g className="gc-sleepy" fill="none" stroke="#dcc64a" strokeWidth="1.8" strokeLinecap="round"><path d="M79,60 Q84,63 89,60" /><path d="M93,59 Q98,62 103,59" /></g>
						<g className="gc-awake"><path d="M79,61 Q84,55 89,60 Q84,64 79,61 Z M93,60 Q98,55 103,61 Q98,64 93,60 Z" fill="url(#gc-iris)" /><ellipse cx="84" cy="60" rx=".9" ry="3" fill="#0d2117" /><ellipse cx="98" cy="60" rx=".9" ry="3" fill="#0d2117" /></g>
					</g>
				</svg>
			</div>
			<div ref={star} className="gc-star"><span /></div>
			<div ref={zzz} className="gc-zzz"><span>z</span><span>z</span><span>Z</span></div>
			<div ref={kBubble} className="gc-bubble" />
		</div>}
		<button type="button" className={`gc-toggle${on ? ' is-on' : ''}`} onClick={toggle} aria-pressed={on} title={on ? 'Hide Clawdia' : 'Show Clawdia'}>
			<Cat size={16} /><span className="sr-only">{on ? 'Hide Clawdia' : 'Show Clawdia'}</span>
		</button>
	</>;
}
