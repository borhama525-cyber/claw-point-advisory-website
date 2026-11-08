import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Lightbulb } from 'lucide-react';
import { starterTips, type Tip } from '@/data/tips';

const TZ = 'America/New_York';
const parse = (s: string) => { const d = new Date(/T\d/.test(s) ? s : `${s}T12:00`); return Number.isNaN(d.getTime()) ? null : d; };
const ago = (s: string, now: number) => {
	const d = parse(s); if (!d) return '';
	const mins = Math.round((now - d.getTime()) / 60000);
	if (mins < 60) return mins <= 1 ? 'just now' : `${mins} min ago`;
	const hrs = Math.round(mins / 60); if (hrs < 24) return `${hrs}h ago`;
	const days = Math.round(hrs / 24); if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`;
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });
};

/** "Tip drop": one bold box with a live badge and a slowly scrolling feed of fresh lending headlines and team tips. */
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

	// A fixed "now" for the pre-built page, then the real clock once the browser takes over.
	const [now, setNow] = useState(() => Date.parse(`${starterTips[0].date}:00`) || 0);
	useEffect(() => { setNow(Date.now()); const id = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(id); }, []);

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
	}, [tips]);
	const pause = () => { hold.current = true; };
	const resume = () => { hold.current = false; };

	return <section className="band tip-drop" id="tips"><div className="learn-wrap tip-layout">
		<div className="tip-intro">
			<p className="eyebrow">TIP DROP</p>
			<h2>Tips and tricks, <em>live.</em></h2>
			<p>Fresh reads on lending, creative finance, wholesaling and closing, pulled in automatically from BiggerPockets and the news, plus tips straight from Amira and Adam. Tap any headline to read it.</p>
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
				{tips.map((t, i) => { const meta = <p className="tip-meta"><span className="tip-avatar">{(t.by || 'C')[0].toUpperCase()}</span>{t.by || 'Claw Point'}{ago(t.date, now) && <> <i>·</i> {ago(t.date, now)}</>}</p>;
					return <article key={t.date + t.tip} className={`tip-item${t.url ? ' is-article' : ''}`}>
						<span className="tip-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
						<span className="tip-tag">{t.category}{t.url ? '' : ' · From the team'}</span>
						{t.url ? <a className="tip-text tip-link" href={t.url} target="_blank" rel="noopener noreferrer">{t.tip} <ArrowUpRight size={16} /></a> : <p className="tip-text">{t.tip}</p>}
						{meta}
					</article>; })}
			</div>
			<p className="tip-foot">Fresh from BiggerPockets, the news and the <Link to="/network">Claw Point team</Link></p>
		</div>
	</div></section>;
}
