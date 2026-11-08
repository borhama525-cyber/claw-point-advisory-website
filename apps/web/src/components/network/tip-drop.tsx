import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Lightbulb } from 'lucide-react';
import { starterTips, type Tip } from '@/data/tips';

const TZ = 'America/New_York';
const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });
const parse = (s: string) => { const d = new Date(/T\d/.test(s) ? s : `${s}T12:00`); return Number.isNaN(d.getTime()) ? null : d; };
const timeOf = (s: string) => (/T\d/.test(s) ? new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00Z`) - Date.parse(`${b}T00:00Z`)) / 86400000);
const groupLabel = (n: number) => (n <= 0 ? 'Today' : n === 1 ? '1 day ago' : `${n} days ago`);

/** "Tip drop": one bold box with a live badge and a slowly scrolling feed of tips grouped by day. */
export function TipDrop() {
	const [tips, setTips] = useState<Tip[]>(starterTips);
	const [live, setLive] = useState(false);
	const feed = useRef<HTMLDivElement>(null);
	const hold = useRef(false);

	// Load published tips from the sheet; refresh every few minutes.
	useEffect(() => {
		let stop = false;
		const load = () => fetch('/tips.php', { cache: 'no-store' }).then(r => r.json()).then((d: { ok?: boolean; tips?: Tip[] }) => {
			if (stop) return;
			if (d?.ok && Array.isArray(d.tips) && d.tips.length) { setTips(d.tips); setLive(true); }
		}).catch(() => {});
		load();
		const id = window.setInterval(load, 3 * 60 * 1000);
		return () => { stop = true; window.clearInterval(id); };
	}, []);

	// Start from the newest tip's day so the pre-built page and the first browser render match, then use the real date.
	const [today, setToday] = useState(() => starterTips[0].date.slice(0, 10));
	useEffect(() => { setToday(dayKey(new Date())); }, []);
	const groups = useMemo(() => {
		const out: { label: string; items: Tip[] }[] = [];
		for (const t of tips) {
			const d = parse(t.date);
			const label = d ? groupLabel(daysBetween(today, dayKey(d))) : 'Earlier';
			const last = out[out.length - 1];
			if (last?.label === label) last.items.push(t); else out.push({ label, items: [t] });
		}
		return out;
	}, [tips, today]);

	// Gentle auto-scroll that loops; pauses while the visitor hovers, touches or scrolls it.
	useEffect(() => {
		const el = feed.current;
		if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let raf = 0, last = performance.now(), wait = 1800, pos = el.scrollTop;
		const step = (now: number) => {
			const dt = Math.min(64, now - last); last = now;
			if (hold.current || document.hidden) { pos = el.scrollTop; wait = 1200; }
			else if (wait > 0) wait -= dt;
			else {
				const max = el.scrollHeight - el.clientHeight;
				if (max > 0) {
					pos += dt * 0.022;
					if (pos >= max) { pos = max; wait = 2200; window.setTimeout(() => { el.scrollTo({ top: 0, behavior: 'smooth' }); pos = 0; }, 2000); }
					el.scrollTop = pos;
				}
			}
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [groups]);
	let n = 0;
	const pause = () => { hold.current = true; };
	const resume = () => { hold.current = false; };

	return <section className="band tip-drop" id="tips"><div className="learn-wrap tip-layout">
		<div className="tip-intro">
			<p className="eyebrow">TIP DROP</p>
			<h2>Tips and tricks, <em>live.</em></h2>
			<p>Quick, practical lending tips from Amira and Adam on underwriting, closing, creative finance and networking. New ones drop into the feed as we post them.</p>
			<p className="tip-note">General information to help you prepare, not financial or legal advice. Have a question? <Link to="/ask">Ask us</Link> or <Link to="/booking">book a call</Link>.</p>
		</div>

		<div className="tip-box">
			<div className="tip-box-glow" aria-hidden="true" />
			<div className="tip-box-head">
				<span className="tip-box-icon" aria-hidden="true"><Lightbulb size={20} /></span>
				<h3>Tip <em>drop</em></h3>
				<span className={`tip-pill${live ? ' is-live' : ''}`}><span className="tip-dot" aria-hidden="true" /> Live</span>
			</div>
			<div ref={feed} className="tip-scroll" tabIndex={0} aria-label="Lending tips" onMouseEnter={pause} onMouseLeave={resume} onTouchStart={pause} onTouchEnd={resume} onFocus={pause} onBlur={resume} onWheel={pause}>
				{groups.map(g => <div key={g.label} className="tip-group">
					<p className={`tip-day${g.label === 'Today' ? ' is-today' : ''}`}><span>{g.label}</span></p>
					{g.items.map(t => { n += 1; return <article key={t.date + t.tip} className="tip-item">
						<span className="tip-num" aria-hidden="true">{String(n).padStart(2, '0')}</span>
						<span className="tip-tag">{t.category}</span>
						<p className="tip-text">{t.tip}</p>
						<p className="tip-meta"><span className="tip-avatar">{(t.by || 'C')[0].toUpperCase()}</span>{t.by || 'Claw Point'}{timeOf(t.date) && <> <i>·</i> {timeOf(t.date)}</>}</p>
					</article>; })}
				</div>)}
			</div>
			<p className="tip-foot">Straight from the <Link to="/network">Claw Point team</Link></p>
		</div>
	</div></section>;
}
