import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Lightbulb, Pause, Play } from 'lucide-react';
import { starterTips, type Tip } from '@/data/tips';

const ROTATE_MS = 7000;
const usDate = (iso: string) => { const d = new Date(`${iso}T12:00:00`); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const initials = (name: string) => (name.trim()[0] || 'C').toUpperCase();

/** "Tip Drop": a live feed of lending tips the team posts from the Tip Drops tab of the leads sheet. */
export function TipDrop() {
	const [tips, setTips] = useState<Tip[]>(starterTips);
	const [live, setLive] = useState(false);
	const [cat, setCat] = useState('All');
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [tick, setTick] = useState(0);
	const section = useRef<HTMLElement>(null);

	// Load the published tips; refresh every few minutes while the page is open.
	useEffect(() => {
		let stop = false;
		const load = () => fetch('/tips.php', { cache: 'no-store' }).then(r => r.json()).then((d: { ok?: boolean; tips?: Tip[] }) => {
			if (!stop && d?.ok && Array.isArray(d.tips) && d.tips.length) { setTips(d.tips); setLive(true); }
		}).catch(() => {});
		load();
		const id = window.setInterval(load, 3 * 60 * 1000);
		return () => { stop = true; window.clearInterval(id); };
	}, []);

	const categories = useMemo(() => ['All', ...Array.from(new Set(tips.map(t => t.category)))], [tips]);
	const shown = cat === 'All' ? tips : tips.filter(t => t.category === cat);
	const current = shown[index % Math.max(1, shown.length)];

	// Rotate the featured tip; pause on hover, focus, a hidden tab or reduced motion.
	useEffect(() => {
		if (paused || shown.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = window.setTimeout(() => { if (!document.hidden) { setIndex(i => (i + 1) % shown.length); setTick(t => t + 1); } }, ROTATE_MS);
		return () => window.clearTimeout(id);
	}, [paused, shown.length, index, tick]);

	const go = (step: number) => { setIndex(i => (i + step + shown.length) % shown.length); setTick(t => t + 1); };
	const pick = (c: string) => { setCat(c); setIndex(0); setTick(t => t + 1); };

	return <section ref={section} className="band tip-drop" id="tips"><div className="learn-wrap">
		<div className="learn-head row"><div>
			<p className="eyebrow tip-live"><span className={`tip-live-dot${live ? ' on' : ''}`} /> {live ? 'LIVE' : 'TIP DROP'} · LENDING TIPS FROM THE TEAM</p>
			<h2>Tip <em>drop.</em></h2></div>
			<p>Quick, practical tips on lending, closing and networking, posted by Amira and Adam. New ones drop in here as we share them.</p></div>

		<div className="tip-cats" role="tablist" aria-label="Tip topics">{categories.map(c => <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => pick(c)}>{c}</button>)}</div>

		<div className="tip-grid">
			{current && <article className="tip-feature" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-live="polite">
				<div className="tip-feature-top"><span className="tip-cat"><Lightbulb size={14} /> {current.category}</span><span className="tip-count">{(index % shown.length) + 1} / {shown.length}</span></div>
				<blockquote key={`${cat}-${index}-${tick}`} className="tip-quote">{current.tip}</blockquote>
				<div className="tip-feature-foot">
					<span className="tip-by"><span className="tip-avatar">{initials(current.by)}</span><span><strong>{current.by || 'Claw Point team'}</strong><small>{usDate(current.date)}</small></span></span>
					<span className="tip-controls">
						<button type="button" aria-label="Previous tip" onClick={() => go(-1)}><ChevronLeft size={18} /></button>
						<button type="button" aria-label={paused ? 'Play tips' : 'Pause tips'} onClick={() => setPaused(p => !p)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
						<button type="button" aria-label="Next tip" onClick={() => go(1)}><ChevronRight size={18} /></button>
					</span>
				</div>
				{shown.length > 1 && <div className="tip-progress"><i key={`${cat}-${index}-${tick}-${paused}`} className={paused ? 'paused' : ''} style={{ animationDuration: `${ROTATE_MS}ms` }} /></div>}
			</article>}

			<ol className="tip-feed">{shown.slice(0, 6).map((t, i) => <li key={`${cat}-${t.tip}`} style={{ ['--i' as string]: `${i * 70}ms` }}>
				<button type="button" className={current === t ? 'on' : ''} onClick={() => { setIndex(i); setTick(x => x + 1); }}>
					<span className="tip-feed-meta"><b>{t.category}</b> · {usDate(t.date)}</span>
					<span className="tip-feed-text">{t.tip}</span>
				</button>
			</li>)}</ol>
		</div>
		<p className="tip-note">General information to help you prepare, not financial or legal advice. Have a specific question? <Link to="/ask">Ask us</Link> or <Link to="/booking">book a call</Link>.</p>
	</div></section>;
}
