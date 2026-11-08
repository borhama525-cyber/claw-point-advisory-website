import { useEffect, useRef, useState } from 'react';
import { Ghost } from 'lucide-react';

// A little scene in the margins: a soft black phantom kitty glides around the screen in smooth,
// flowing curves, while a tiny Claw Point logo with feet and arms strolls about, sits, and watches it
// with its eyes. When the kitty floats close, the logo hops and waves. Neither one takes the mouse
// (pointer-events: none), so the page is never blocked. Visitors can hide them with the small button
// in the corner (remembered on their device); hidden by default for reduced-motion visitors.

const KEY = 'clawpoint:ghost-chase';
const KITTY = 54, BUDDY = 44;

const readPref = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const writePref = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } };

// The kitty's head: a rounded blob with two pointed ears (viewBox 0 0 120 120).
const HEAD = 'M24,46 C18,40 14,30 13,20 C22,22 32,27 40,33 C47,30 55,29 62,30 C68,22 76,14 86,10 C88,22 88,33 85,42 C94,52 98,64 96,76 C93,96 76,106 56,106 C36,106 20,96 17,78 C15,66 18,55 24,46 Z';

export function GhostChase() {
	const [on, setOn] = useState(false);
	const [ready, setReady] = useState(false);
	const kitty = useRef<HTMLDivElement>(null);
	const kEyes = useRef<SVGGElement>(null);
	const buddy = useRef<HTMLDivElement>(null);
	const body = useRef<SVGGElement>(null);
	const legL = useRef<SVGPathElement>(null), legR = useRef<SVGPathElement>(null);
	const armL = useRef<SVGPathElement>(null), armR = useRef<SVGPathElement>(null);
	const eyes = useRef<SVGGElement>(null), joy = useRef<SVGGElement>(null);

	useEffect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const pref = readPref();
		setOn(pref ? pref === 'on' : !reduce);
		setReady(true);
	}, []);

	useEffect(() => {
		if (!on || !kitty.current || !buddy.current) return;
		const k = kitty.current, b = buddy.current;
		const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
		const seed = Array.from({ length: 6 }, () => rand(0, Math.PI * 2));
		const kp = { x: innerWidth * 0.6, y: innerHeight * 0.4, vx: 0, vy: 0, tilt: 0 };
		// The buddy keeps clear of the hide button (bottom left) and the Team chat button (bottom right).
		const minX = () => 74, maxX = () => Math.max(120, innerWidth - BUDDY - 190);
		const bp = { x: 90, vx: 0, face: 1, hop: 0, hopV: 0, ex: 0, ey: 0 };
		let goal = bp.x, restUntil = 0, wave = 0, last = performance.now(), walk = 0, raf = 0, excitedAt = 0;

		const tick = (t: number) => {
			const dt = Math.min(0.04, (t - last) / 1000); last = t;
			if (document.hidden) { raf = requestAnimationFrame(tick); return; }
			const w = innerWidth, h = innerHeight, s = t / 1000, f = s * 1.6; // f: the kitty's own, faster clock

			// Kitty: follows a smooth, ever-changing path made of layered waves across the whole screen,
			// eased with a soft spring so it glides, speeds up and banks into its turns.
			const px = w * (0.5 + 0.3 * Math.sin(f * 0.23 + seed[0]) + 0.14 * Math.sin(f * 0.61 + seed[1]) + 0.04 * Math.sin(f * 1.7 + seed[2]));
			const py = h * (0.48 + 0.26 * Math.sin(f * 0.31 + seed[3]) + 0.12 * Math.sin(f * 0.83 + seed[4]) + 0.05 * Math.cos(f * 1.9 + seed[5]));
			const tx = Math.max(16, Math.min(w - KITTY - 16, px)), ty = Math.max(96, Math.min(h - KITTY - 16, py));
			kp.vx += ((tx - kp.x) * 3.2 - kp.vx) * Math.min(1, dt * 3.6);
			kp.vy += ((ty - kp.y) * 3.2 - kp.vy) * Math.min(1, dt * 3.6);
			kp.x += kp.vx * dt; kp.y += kp.vy * dt;
			kp.tilt += (Math.max(-22, Math.min(22, kp.vx * 0.06)) - kp.tilt) * Math.min(1, dt * 4);
			const bob = Math.sin(s * 2.4) * 5;
			k.style.transform = `translate3d(${kp.x.toFixed(1)}px,${(kp.y + bob).toFixed(1)}px,0) rotate(${kp.tilt.toFixed(2)}deg)`;
			// The kitty glances the way it's heading.
			const sp = Math.hypot(kp.vx, kp.vy) || 1;
			kEyes.current?.setAttribute('transform', `translate(${(kp.vx / sp * 4).toFixed(2)} ${(kp.vy / sp * 3).toFixed(2)})`);

			// Buddy: strolls along the bottom of the screen at its own pace, sits for a while, strolls again.
			if (t > restUntil && Math.abs(goal - bp.x) < 6) { restUntil = t + rand(2500, 6000); goal = rand(minX(), maxX()); }
			const strolling = t > restUntil && Math.abs(goal - bp.x) >= 6;
			const want = strolling ? Math.sign(goal - bp.x) * 46 : 0;
			bp.vx += (want - bp.vx) * Math.min(1, dt * 2.5);
			bp.x = Math.max(minX(), Math.min(maxX(), bp.x + bp.vx * dt));
			const by = h - BUDDY - 22;
			if (Math.abs(bp.vx) > 4) bp.face = bp.vx > 0 ? 1 : -1;
			walk += dt * Math.abs(bp.vx) * 0.32;

			// It watches the kitty: eyes follow it, and it hops and waves when the kitty floats close.
			const dx = kp.x + KITTY / 2 - (bp.x + BUDDY / 2), dy = kp.y + KITTY / 2 - (by + BUDDY / 2), d = Math.hypot(dx, dy) || 1;
			bp.ex += ((dx / d) * 6 * bp.face - bp.ex) * Math.min(1, dt * 6);
			bp.ey += ((dy / d) * 5 - bp.ey) * Math.min(1, dt * 6);
			const close = d < 190;
			if (close && t - excitedAt > 2600) { excitedAt = t; bp.hopV = -190; }
			wave += ((close ? 1 : 0) - wave) * Math.min(1, dt * 4);
			bp.hopV += 900 * dt; bp.hop = Math.min(0, bp.hop + bp.hopV * dt); if (bp.hop === 0) bp.hopV = 0;
			b.style.transform = `translate3d(${bp.x.toFixed(1)}px,${(by + bp.hop).toFixed(1)}px,0)`;
			body.current?.setAttribute('transform', `translate(50 0) scale(${bp.face} 1) translate(-50 0)`);
			eyes.current?.setAttribute('transform', `translate(${bp.ex.toFixed(2)} ${bp.ey.toFixed(2)})`);
			const swing = Math.sin(walk) * (strolling ? 8 : 0);
			legL.current?.setAttribute('d', `M38,88 L${(36 - swing).toFixed(1)},100 l-6,0`);
			legR.current?.setAttribute('d', `M62,88 L${(64 + swing).toFixed(1)},100 l6,0`);
			const flap = Math.sin(s * 11) * 8 * wave;
			armL.current?.setAttribute('d', `M14,62 Q${(4 - wave * 6).toFixed(1)},${(66 - wave * 22).toFixed(1)} ${(2 - wave * 2).toFixed(1)},${(72 - wave * 44 + flap).toFixed(1)}`);
			armR.current?.setAttribute('d', `M86,62 Q96,${(66 - swing / 2).toFixed(1)} 98,${(72 - swing / 2).toFixed(1)}`);
			const happy = wave > 0.6;
			eyes.current?.setAttribute('opacity', happy ? '0' : '1');
			joy.current?.setAttribute('opacity', happy ? '1' : '0');
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [on]);

	if (!ready) return null;
	const toggle = () => { const next = !on; setOn(next); writePref(next ? 'on' : 'off'); };

	return <>
		{on && <div className="ghost-chase" aria-hidden="true">
			<div ref={kitty} className="gc-kitty" style={{ width: KITTY, height: KITTY }}>
				<svg viewBox="0 0 120 120" overflow="visible">
					<defs>
						<linearGradient id="gc-iri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8ad8" /><stop offset=".5" stopColor="#b48cff" /><stop offset="1" stopColor="#5fd3ff" /></linearGradient>
						<filter id="gc-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" /></filter>
						<filter id="gc-halo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" /></filter>
						<filter id="gc-rim" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4.5" /></filter>
					</defs>
					<path d={HEAD} fill="#000" opacity=".35" filter="url(#gc-halo)" transform="translate(0 4) scale(1.06) translate(-3 -3)" />
					<path className="gc-rim" d={HEAD} fill="url(#gc-iri)" filter="url(#gc-rim)" transform="translate(8 9)" />
					<path d={HEAD} fill="#050505" filter="url(#gc-soft)" />
					<g ref={kEyes}><circle cx="44" cy="74" r="7.5" fill="#fff" /><circle cx="73" cy="62" r="7.5" fill="#fff" /></g>
				</svg>
			</div>
			<div ref={buddy} className="gc-buddy" style={{ width: BUDDY, height: BUDDY }}>
				<svg viewBox="-8 0 116 112" overflow="visible">
					<g ref={body}>
						<path ref={armL} className="gc-limb" d="M14,62 Q4,66 2,72" />
						<path ref={armR} className="gc-limb" d="M86,62 Q96,66 98,72" />
						<path ref={legL} className="gc-limb" d="M38,88 L36,100 l-6,0" />
						<path ref={legR} className="gc-limb" d="M62,88 L64,100 l6,0" />
						<path className="face-cap" d="M6,10 H94 V92 H79 V45 L6,36 Z" />
						<g ref={eyes}><rect className="face-eye" x="43" y="54" width="9.5" height="21" /><rect className="face-eye" x="58" y="54" width="9.5" height="21" /></g>
						<g ref={joy} opacity="0"><path className="face-joy" d="M43,68 L47.75,60 L52.5,68" /><path className="face-joy" d="M58,68 L62.75,60 L67.5,68" /></g>
					</g>
				</svg>
			</div>
		</div>}
		<button type="button" className={`gc-toggle${on ? ' is-on' : ''}`} onClick={toggle} aria-pressed={on} title={on ? 'Hide the phantom kitty' : 'Show the phantom kitty'}>
			<Ghost size={16} /><span className="sr-only">{on ? 'Hide the phantom kitty' : 'Show the phantom kitty'}</span>
		</button>
	</>;
}
