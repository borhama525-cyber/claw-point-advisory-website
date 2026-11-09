import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, FileUp, Handshake, MessagesSquare } from 'lucide-react';
import { steps } from '@/data/process';
import { RequestButton } from '@/components/request/request-provider';

const ICONS = [FileUp, MessagesSquare, Handshake];
const NEXT = ['Takes about two minutes', 'Usually a short call', 'Written terms before closing'];

/** "How it works": a timeline whose line draws itself and whose steps rise in when scrolled into view. */
export function Process() {
	const ref = useRef<HTMLElement>(null);
	const [shown, setShown] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el || !('IntersectionObserver' in window)) { setShown(true); return; }
		const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.25 });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return <section ref={ref} className={`process band hiw ${shown ? 'is-shown' : ''}`}><div className="tool-wrap">
		<div className="hiw-head">
			<div><p className="eyebrow">HOW IT WORKS</p><h2>Less guesswork. <em>More direction.</em></h2><p>Three steps from first look to closing table, with a real person on your file the whole way.</p></div>
			<div className="hero-buttons"><RequestButton className="button small">Get funded →</RequestButton><Link to="/booking" className="button small outline">Book a call <ArrowUpRight size={16} /></Link></div>
		</div>
		<ol className="hiw-steps">
			<span className="hiw-line" aria-hidden="true"><i /></span>
			{steps.map((s, i) => { const Icon = ICONS[i] ?? FileUp; return <li key={s.number} style={{ ['--i' as string]: i }}>
				<span className="hiw-node"><Icon size={20} /></span>
				<div className="hiw-card"><span className="hiw-num">{s.number}</span><h3>{s.title}</h3><p>{s.text}</p><span className="hiw-tag">{NEXT[i]}</span></div>
			</li>; })}
		</ol>
		<p className="fine-print">Every transaction is assessed individually. An inquiry or appointment does not guarantee approval or funding.</p>
	</div></section>;
}
