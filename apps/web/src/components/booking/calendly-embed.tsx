import { useEffect, useRef, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { celebrate } from '@/components/brand-face';

type CalendlyApi = { initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void; initPopupWidget: (o: { url: string }) => void };
declare global { interface Window { Calendly?: CalendlyApi } }

const SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
const STYLES = 'https://assets.calendly.com/assets/external/widget.css';
/** How long to wait for the calendar before offering the pop-up instead. */
const SLOW_MS = 8000;

let loader: Promise<CalendlyApi> | null = null;
function loadCalendly(): Promise<CalendlyApi> {
	if (window.Calendly) return Promise.resolve(window.Calendly);
	loader ??= new Promise((resolve, reject) => {
		if (!document.querySelector(`link[href="${STYLES}"]`)) document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: STYLES }));
		const script = Object.assign(document.createElement('script'), { src: SCRIPT, async: true });
		script.onload = () => (window.Calendly ? resolve(window.Calendly) : reject(new Error('Calendly unavailable')));
		script.onerror = () => { loader = null; reject(new Error('Calendly script failed')); };
		document.head.append(script);
	});
	return loader;
}

/** Calendly's official inline widget, with a calendar-shaped placeholder while it loads and a same-page pop-up if it's slow. */
export function CalendlyEmbed({ url, title }: { url: string; title: string }) {
	const host = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<'loading' | 'ready' | 'slow' | 'booked'>('loading');
	const [api, setApi] = useState<CalendlyApi | null>(null);
	// Keeps the placeholder mounted long enough to fade out.
	const [gone, setGone] = useState(false);
	useEffect(() => { if (state !== 'ready' && state !== 'booked') return; const t = window.setTimeout(() => setGone(true), 700); return () => window.clearTimeout(t); }, [state]);

	useEffect(() => {
		let alive = true;
		const onMessage = (e: MessageEvent) => {
			if (e.origin !== 'https://calendly.com' || typeof e.data?.event !== 'string') return;
			if (e.data.event === 'calendly.event_scheduled') { setState('booked'); celebrate(); }
			// These fire once Calendly has drawn the page; a short pause lets it paint before the crossfade.
			else if (e.data.event.startsWith('calendly.')) window.setTimeout(() => alive && setState(s => (s === 'booked' ? s : 'ready')), 250);
		};
		window.addEventListener('message', onMessage);
		const slow = window.setTimeout(() => alive && setState(s => (s === 'loading' ? 'slow' : s)), SLOW_MS);
		loadCalendly().then(c => {
			if (!alive || !host.current) return;
			setApi(c);
			host.current.replaceChildren();
			c.initInlineWidget({ url, parentElement: host.current });
			const frame = host.current.querySelector('iframe');
			frame?.setAttribute('title', title);
			// The frame finishing its load is the dependable signal; Calendly's own messages only speed it up.
			frame?.addEventListener('load', () => window.setTimeout(() => alive && setState(s => (s === 'booked' ? s : 'ready')), 400), { once: true });
		}).catch(() => alive && setState('slow'));
		return () => { alive = false; window.clearTimeout(slow); window.removeEventListener('message', onMessage); };
	}, [url, title]);

	const openPopup = () => { if (api) api.initPopupWidget({ url }); else loadCalendly().then(c => c.initPopupWidget({ url })).catch(() => window.open(url, '_blank', 'noopener')); };

	return <div className={`calendly-shell is-${state}`}>
		<div ref={host} className="calendly-host" />
		{!gone && <div className="calendly-skeleton" aria-hidden={state !== 'slow'}>
			<div className="sk-month"><span /><b /><span /></div>
			<div className="sk-grid">{Array.from({ length: 35 }, (_, i) => <i key={i} className={i % 7 > 0 && i % 7 < 6 && i > 6 ? 'open' : undefined} />)}</div>
			{state === 'loading' ? <p className="sk-note">Loading available times…</p>
				: <div className="sk-slow" role="status"><p>The calendar is taking a moment to load here.</p><button type="button" className="button small" onClick={openPopup}><CalendarCheck size={16} /> Show available times</button></div>}
		</div>}
		{state === 'ready' && <button type="button" className="calendly-backup" onClick={openPopup}>Calendar not showing? Show available times</button>}
		{state === 'booked' && <div className="calendly-booked" role="status"><CalendarCheck size={22} /><div><strong>You’re booked!</strong><span>Check your email for the confirmation and meeting details.</span></div></div>}
	</div>;
}
