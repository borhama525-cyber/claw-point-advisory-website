import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { RequestButton } from '@/components/request/request-provider';
import { CITIES, MAP_H, MAP_W, SHAPES } from '@/data/us-map';

// Pairs of city indexes (see CITIES) joined by glowing arcs.
const ARCS: [number, number][] = [[0, 5], [1, 4], [4, 6], [5, 8], [6, 7], [3, 8], [2, 9]];

const arc = (a: number, b: number) => {
	const [, x1, y1] = CITIES[a], [, x2, y2] = CITIES[b];
	const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.28;
	return `M${x1},${y1} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2},${y2}`;
};

/** "Funding in all 50 states": a smooth US map that wipes in west to east, with a moving sheen, pulsing cities and flowing arcs. */
export function NationwideMap() {
	const ref = useRef<HTMLElement>(null);
	const [shown, setShown] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el || !('IntersectionObserver' in window)) { setShown(true); return; }
		const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.2 });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return <section ref={ref} className={`band nation ${shown ? 'is-shown' : ''}`}><div className="tool-wrap nation-grid">
		<div className="nation-copy">
			<p className="eyebrow">NATIONWIDE</p>
			<h2>Funding in all 50 states. <em>One process.</em></h2>
			<p>Wherever your deal is, it runs the same way: funds move only through licensed title and escrow, and you get written terms before closing.</p>
			<ul className="nation-facts"><li><strong>50</strong><span>States we fund in</span></li><li><strong>1</strong><span>Simple request form</span></li></ul>
			<div className="hero-buttons"><RequestButton className="button small">Get funded →</RequestButton></div>
			<p className="fine-print">Every deal is reviewed individually, and state-specific requirements may apply.</p>
		</div>
		<div className="nation-map-wrap">
			<svg className="nation-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Map of the United States, including Alaska and Hawaii: Claw Point Advisory funds deals in all 50 states">
				<defs>
					<linearGradient id="nation-grad" x1="0" x2={MAP_W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#24533d" /><stop offset=".45" stopColor="#3f7a5c" /><stop offset=".72" stopColor="#c8a43a" /><stop offset="1" stopColor="#e2806f" />
					</linearGradient>
					<radialGradient id="nation-glow"><stop offset="0" stopColor="#dcc64a" stopOpacity=".9" /><stop offset="1" stopColor="#dcc64a" stopOpacity="0" /></radialGradient>
					<linearGradient id="nation-sheen" x1="0" x2="1" y1="0" y2="0.35"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".38" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
					<linearGradient id="nation-depth" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".16" /></linearGradient>
					<clipPath id="nation-clip">{SHAPES.map((d, i) => <path key={i} d={d} />)}</clipPath>
				</defs>
				<g className="nation-land">
					{SHAPES.map((d, i) => <path key={i} d={d} fill="url(#nation-grad)" />)}
					<g clipPath="url(#nation-clip)">
						<rect width={MAP_W} height={MAP_H} fill="url(#nation-depth)" />
						<rect className="nation-sheen" x={-MAP_W * 0.4} width={MAP_W * 0.4} height={MAP_H} fill="url(#nation-sheen)" />
					</g>
					{SHAPES.map((d, i) => <path key={`rim${i}`} d={d} className="nation-rim" />)}
				</g>
				<g className="nation-arcs">{ARCS.map(([a, b], i) => <path key={i} d={arc(a, b)} style={{ ['--a' as string]: `${i * 0.7}s` }} />)}</g>
				<g className="nation-cities">{CITIES.map(([name, x, y], i) => <g key={name} transform={`translate(${x} ${y})`} style={{ ['--p' as string]: `${(i * 0.53) % 3}s` }}>
					<circle className="city-glow" r="16" fill="url(#nation-glow)" />
					<circle className="city-ring" r="6" />
					<circle className="city-dot" r="4.2" />
				</g>)}</g>
			</svg>
			<p className="nation-label"><MapPin size={15} />Coverage across all 50 states, including Alaska & Hawaii</p>
		</div>
	</div></section>;
}
