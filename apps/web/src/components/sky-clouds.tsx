import { useEffect, useId } from 'react';

// Soft painted clouds that drift behind the sky backgrounds and lean away from the cursor.
// They sit behind the content (z-index -1 inside an isolated section), so text is never covered.
type Cloud = { x: string; y: string; w: number; d: number; dur: number; delay: number; o: number; flip?: boolean; puffs: number[][] };

const PUFFS_A = [[48, 98, 30], [82, 78, 40], [126, 64, 50], [172, 80, 40], [206, 100, 28], [104, 104, 38], [150, 106, 34], [24, 110, 20]];
const PUFFS_B = [[40, 92, 26], [76, 70, 36], [118, 52, 44], [160, 70, 34], [194, 92, 26], [96, 100, 32], [138, 102, 30]];

const CLOUDS: Cloud[] = [
	{ x: '70%', y: '-14%', w: 560, d: 1, dur: 64, delay: -8, o: 0.62, puffs: PUFFS_A },
	{ x: '86%', y: '46%', w: 380, d: 1.8, dur: 82, delay: -30, o: 0.5, flip: true, puffs: PUFFS_B },
	{ x: '-10%', y: '64%', w: 470, d: 1.4, dur: 74, delay: -16, o: 0.5, puffs: PUFFS_A },
	{ x: '38%', y: '86%', w: 330, d: 2.4, dur: 96, delay: -44, o: 0.42, flip: true, puffs: PUFFS_B },
];

// One shared, smoothed cursor position for every cloud layer on the page.
let listeners = 0, raf = 0, tx = 0, ty = 0, x = 0, y = 0;
const tick = () => {
	x += (tx - x) * 0.06; y += (ty - y) * 0.06;
	const s = document.documentElement.style;
	s.setProperty('--cx', x.toFixed(4)); s.setProperty('--cy', y.toFixed(4));
	raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0004 ? requestAnimationFrame(tick) : 0;
};
const onMove = (e: PointerEvent) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; if (!raf) raf = requestAnimationFrame(tick); };

export function SkyClouds() {
	const id = useId().replace(/:/g, '');
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
		if (listeners++ === 0) window.addEventListener('pointermove', onMove, { passive: true });
		return () => { if (--listeners === 0) { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); raf = 0; } };
	}, []);
	return <div className="sky-clouds" aria-hidden="true">
		{CLOUDS.map((c, i) => <div key={i} className="sky-cloud" style={{ left: c.x, top: c.y, width: c.w, ['--d' as string]: c.d, ['--dur' as string]: `${c.dur}s`, ['--delay' as string]: `${c.delay}s`, ['--o' as string]: c.o }}>
			<svg viewBox="0 0 240 140" style={c.flip ? { transform: 'scaleX(-1)' } : undefined}>
				<defs>
					<radialGradient id={`${id}g${i}`} cx="45%" cy="25%" r="80%"><stop offset="0" stopColor="#fffdf6" /><stop offset=".55" stopColor="#f7eccd" /><stop offset="1" stopColor="#e6d3a4" /></radialGradient>
					<filter id={`${id}f${i}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6" /></filter>
				</defs>
				<g filter={`url(#${id}f${i})`} fill={`url(#${id}g${i})`}>{c.puffs.map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} />)}</g>
				<g fill="#ffffff" opacity=".45">{c.puffs.slice(1, 4).map(([cx, cy, r], k) => <circle key={k} cx={cx - r * 0.25} cy={cy - r * 0.3} r={r * 0.45} />)}</g>
			</svg>
		</div>)}
	</div>;
}
