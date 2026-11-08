import { useEffect, useRef } from 'react';

// The logo character: a roof-like cap with two eyes underneath.
// - The eyes follow the pointer, or the form field being typed in.
// - The cap's slanted underside works as an eyebrow.
// - It blinks, squints on hover, widens its eyes over buttons, winks and hops when clicked,
//   gets sleepy when nobody moves, and leans/squashes on springs so it feels soft.
// - celebrate() makes it hop with happy eyes and throws brand-coloured confetti.
// One animation loop writes SVG attributes directly, so nothing re-renders per frame.

const EYE_W = 9.5, EYE_H = 21, EYE_GAP = 5.5;
const HOME = { x: 57, y: 62 }; // centre point between the eyes, in viewBox units
const WALL = 79; // inner edge of the cap's side
const CELEBRATE = 'clawpoint:celebrate';
const CONFETTI = ['#24533d', '#dcc64a', '#e2806f', '#9cc3c6', '#93ad84', '#ffffff'];
const SLEEP_AFTER = 12000;

/** Height of the brow (cap underside) at a given x. */
const browAt = (x: number, browL: number, browR: number) => browL + (browR - browL) * (x - 6) / (WALL - 6);
const capPath = (browL: number, browR: number) => `M6,10 H94 V92 H79 V${browR.toFixed(2)} L6,${browL.toFixed(2)} Z`;
const eyePoints = (x: number, y: number, h: number, tiltL: number, tiltR: number) => {
	const top = y - h / 2, bottom = y + h / 2;
	return `${x.toFixed(2)},${(top + tiltL).toFixed(2)} ${(x + EYE_W).toFixed(2)},${(top + tiltR).toFixed(2)} ${(x + EYE_W).toFixed(2)},${bottom.toFixed(2)} ${x.toFixed(2)},${bottom.toFixed(2)}`;
};
/** A smiling "^" eye. */
const happyEye = (x: number, y: number) => `M${x.toFixed(2)},${(y + 4).toFixed(2)} L${(x + EYE_W / 2).toFixed(2)},${(y - 4).toFixed(2)} L${(x + EYE_W).toFixed(2)},${(y + 4).toFixed(2)}`;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Brand-coloured confetti bursting from a point on screen. */
function confettiFrom(x: number, y: number) {
	const canvas = Object.assign(document.createElement('canvas'), { className: 'confetti-canvas' });
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
	document.body.append(canvas);
	const ctx = canvas.getContext('2d');
	if (!ctx) { canvas.remove(); return; }
	ctx.scale(dpr, dpr);
	const bits = Array.from({ length: 140 }, () => {
		const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4, s = 5 + Math.random() * 9;
		return { x, y, vx: Math.cos(a) * s + 2, vy: Math.sin(a) * s, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4, c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)] };
	});
	const start = performance.now();
	const draw = (t: number) => {
		const age = t - start;
		ctx.clearRect(0, 0, innerWidth, innerHeight);
		ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - 1800) / 900);
		for (const b of bits) {
			b.vy += 0.28; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
			ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 2))); ctx.restore();
		}
		if (age < 2700) requestAnimationFrame(draw); else canvas.remove();
	};
	requestAnimationFrame(draw);
}

/** Celebrate a submitted deal or booked call: the logo hops with happy eyes and throws confetti. */
export function celebrate() {
	window.dispatchEvent(new Event(CELEBRATE));
	if (reduced()) return;
	const logo = document.querySelector('.site-header .brand-face');
	const r = logo?.getBoundingClientRect();
	confettiFrom(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + r.height / 2 : 60);
}

export function BrandFace({ size = 36 }: { size?: number }) {
	const svg = useRef<SVGSVGElement>(null);
	const body = useRef<SVGGElement>(null);
	const cap = useRef<SVGPathElement>(null);
	const left = useRef<SVGPolygonElement>(null);
	const right = useRef<SVGPolygonElement>(null);
	const joyL = useRef<SVGPathElement>(null);
	const joyR = useRef<SVGPathElement>(null);

	useEffect(() => {
		const el = svg.current;
		if (!el || reduced()) return;
		const touch = window.matchMedia('(hover: none)').matches;
		const target = { x: 0, y: 0 }; // where the eyes want to look, -1..1
		const now = { x: 0, y: 0, open: 1, squint: 0, wide: 0, joy: 0, sleepy: 0, winkL: 1 };
		// Springs: lean (degrees) follows pointer speed; squash/hop drive jumps.
		const spring = { lean: 0, leanV: 0, squash: 0, squashV: 0, hop: 0, hopV: 0 };
		let blinkUntil = 0, nextBlink = performance.now() + 2500 + Math.random() * 2500, nextGlance = 0, frame = 0;
		let hovering = false, overButton = false, focusEl: Element | null = null, lastMove = performance.now();
		let joyUntil = 0, winkUntil = 0, lastPX = 0, pointerSpeed = 0, lastT = performance.now(), steps = 0;

		const lookAt = (cx: number, cy: number) => {
			const r = el.getBoundingClientRect();
			const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
			const reach = Math.max(innerWidth, innerHeight) * 0.45;
			target.x = Math.max(-1, Math.min(1, dx / reach));
			target.y = Math.max(-1, Math.min(1, dy / reach));
		};
		// Each hop starts from the ground (or re-launches from low), so hops never stack into a huge jump.
		const hop = (strength = 1) => { if (spring.hop > -6) { spring.hopV = -5.2 * strength; spring.squashV -= 0.9 * strength; } }; // stretch on take-off
		const onMove = (e: PointerEvent) => {
			const t = performance.now();
			if (now.sleepy > 0.5) { now.wide = 1; } // startled awake
			lastMove = t;
			pointerSpeed = Math.max(-30, Math.min(30, (e.clientX - lastPX) || 0));
			lastPX = e.clientX;
			if (!focusEl) lookAt(e.clientX, e.clientY);
			const btn = (e.target as Element | null)?.closest?.('.button, .ask-send, .tc-submit');
			overButton = Boolean(btn);
		};
		const onFocus = (e: FocusEvent) => { const t = e.target as Element; focusEl = t.matches?.('input, textarea, select') ? t : null; lastMove = performance.now(); };
		const onBlur = () => { focusEl = null; };
		const onKey = () => { lastMove = performance.now(); };
		const onCelebrate = () => { const t = performance.now(); joyUntil = t + 2800; [0, 420, 840].forEach(d => window.setTimeout(() => hop(1.1), d)); lastMove = t; };
		const link = el.closest('a');
		const enter = () => { hovering = true; }, leave = () => { hovering = false; };
		const click = () => { winkUntil = performance.now() + 420; hop(0.8); };
		window.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('focusin', onFocus);
		document.addEventListener('focusout', onBlur);
		document.addEventListener('keydown', onKey);
		window.addEventListener(CELEBRATE, onCelebrate);
		link?.addEventListener('pointerenter', enter);
		link?.addEventListener('pointerleave', leave);
		link?.addEventListener('click', click);

		const tick = (t: number) => {
			if (focusEl) { const r = focusEl.getBoundingClientRect(); lookAt(r.left + Math.min(r.width, 220) / 2, r.top + r.height / 2); }
			else if (touch && t > nextGlance) { target.x = Math.random() * 1.6 - 0.8; target.y = Math.random() * 1.2 - 0.6; nextGlance = t + 1800 + Math.random() * 2600; }
			const asleep = !touch && !focusEl && t - lastMove > SLEEP_AFTER;
			if (t > nextBlink && !asleep) { blinkUntil = t + 130; nextBlink = t + 2800 + Math.random() * 3800; }
			const joyful = t < joyUntil;
			// Time-based so the motion is the same on slow and fast screens (k = frames' worth at 60fps).
			const k = Math.min(4, Math.max(0.25, (t - lastT) / 16.67)); lastT = t;
			const ease = (v: number, to: number, rate: number) => v + (to - v) * (1 - Math.pow(1 - rate, k));

			now.x = ease(now.x, asleep ? 0 : target.x, 0.14);
			now.y = ease(now.y, asleep ? 0.35 : target.y, 0.14);
			now.open = ease(now.open, t < blinkUntil ? 0.12 : 1, 0.45);
			now.squint = ease(now.squint, hovering && !joyful ? 1 : 0, 0.18);
			now.wide = ease(now.wide, overButton && !hovering ? 1 : 0, 0.15);
			now.joy = ease(now.joy, joyful ? 1 : 0, 0.2);
			now.sleepy = ease(now.sleepy, asleep ? 1 : 0, 0.04);
			now.winkL = ease(now.winkL, t < winkUntil ? 0.1 : 1, 0.4);

			// Springs, stepped at 60fps: soft lean from pointer speed, squash & stretch, hop height.
			// Fixed 60fps steps, carrying any remainder to the next frame so high refresh rates still move.
			steps = Math.min(steps + k, 6);
			for (; steps >= 1; steps--) {
				pointerSpeed *= 0.85;
				spring.leanV += (pointerSpeed * 0.25 - spring.lean) * 0.12; spring.leanV *= 0.78; spring.lean += spring.leanV;
				spring.squashV += (0 - spring.squash) * 0.2; spring.squashV *= 0.72; spring.squash += spring.squashV;
				spring.hopV += 0.9; spring.hop = Math.max(-20, spring.hop + spring.hopV);
				if (spring.hop > 0) { if (spring.hopV > 2) spring.squashV += spring.hopV * 0.08; spring.hop = 0; spring.hopV = 0; } // squash on landing
			}
			spring.lean = Math.max(-8, Math.min(8, spring.lean)); spring.squash = Math.max(-0.6, Math.min(0.6, spring.squash));
			const breathe = now.sleepy * Math.sin(t / 700) * 0.02;
			const sx = 1 + spring.squash * 0.12 + breathe, sy = 1 - spring.squash * 0.12 - breathe;
			body.current?.setAttribute('transform', `translate(50 92) translate(0 ${spring.hop.toFixed(2)}) rotate(${spring.lean.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-50 -92)`);

			// The brow lifts toward where the eyes look; drops when squinting or sleepy; lifts when excited.
			const brow = -now.y * 5 + now.squint * 3 + now.sleepy * 4 - now.wide * 4 - now.joy * 3;
			const browL = 36 + brow - now.x * 4, browR = 45 + brow * 0.6 + now.x * 3;
			const ex = Math.min(HOME.x + now.x * 10, WALL - 3 - EYE_GAP / 2 - EYE_W);
			const h = EYE_H * now.open * (1 - now.squint * 0.3) * (1 - now.sleepy * 0.75) * (1 + now.wide * 0.18);
			const lx = ex - EYE_GAP / 2 - EYE_W, rx = ex + EYE_GAP / 2;
			const minTop = Math.max(browAt(lx, browL, browR), browAt(rx + EYE_W, browL, browR)) + 3;
			const ey = Math.max(HOME.y + now.y * 7, minTop + EYE_H / 2);
			const tilt = now.squint * 6;
			left.current?.setAttribute('points', eyePoints(lx, ey, h * now.winkL, 0, tilt));
			right.current?.setAttribute('points', eyePoints(rx, ey, h, tilt, 0));
			const eyesOn = String((1 - now.joy).toFixed(2)), joyOn = now.joy.toFixed(2);
			left.current?.setAttribute('opacity', eyesOn); right.current?.setAttribute('opacity', eyesOn);
			joyL.current?.setAttribute('d', happyEye(lx, ey)); joyR.current?.setAttribute('d', happyEye(rx, ey));
			joyL.current?.setAttribute('opacity', joyOn); joyR.current?.setAttribute('opacity', joyOn);
			cap.current?.setAttribute('d', capPath(browL, browR));
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('focusin', onFocus);
			document.removeEventListener('focusout', onBlur);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener(CELEBRATE, onCelebrate);
			link?.removeEventListener('pointerenter', enter);
			link?.removeEventListener('pointerleave', leave);
			link?.removeEventListener('click', click);
		};
	}, []);

	return <svg ref={svg} className="brand-face" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
		<g ref={body}>
			<path ref={cap} className="face-cap" d={capPath(36, 45)} />
			<polygon ref={left} className="face-eye" points={eyePoints(HOME.x - EYE_GAP / 2 - EYE_W, HOME.y, EYE_H, 0, 0)} />
			<polygon ref={right} className="face-eye" points={eyePoints(HOME.x + EYE_GAP / 2, HOME.y, EYE_H, 0, 0)} />
			<path ref={joyL} className="face-joy" opacity="0" d="" />
			<path ref={joyR} className="face-joy" opacity="0" d="" />
		</g>
	</svg>;
}
