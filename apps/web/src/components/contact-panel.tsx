import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CalendarCheck, Mail, MessageSquare, MessageSquareText, PhoneOff, X } from 'lucide-react';
import { TEAM, TEAM_EMAIL } from '@/constants/site';
import { mailtoHref } from '@/lib/contact-links';
import { ProfileLinks } from '@/components/profile-links';

const OPEN_EVENT = 'clawpoint:contact';
/** Opens the floating "Team chat" contact card from anywhere on the site. */
export const openContactPanel = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** The floating "Team chat" button and its contact card: email, text Amira, both teammates' profiles, schedule a call. */
export function ContactPanel() {
	const [open, setOpen] = useState(false);
	const box = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		const show = () => setOpen(true);
		window.addEventListener(OPEN_EVENT, show);
		return () => window.removeEventListener(OPEN_EVENT, show);
	}, []);
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
		const onDown = (e: PointerEvent) => { const t = e.target as Node; if (!box.current?.contains(t) && !button.current?.contains(t)) setOpen(false); };
		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onDown);
		box.current?.querySelector<HTMLElement>('a, button')?.focus();
		return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
	}, [open]);
	return <>
		{open && <div ref={box} className="contact-card" role="dialog" aria-label="Contact the team">
			<div className="contact-card-head"><div><strong>Talk to the team</strong><span>Text, book a call or send us an email</span></div><button type="button" className="dr-close" aria-label="Close" onClick={() => setOpen(false)}><X size={17} /></button></div>
			<p className="contact-warning"><PhoneOff size={16} /><span><strong>Please schedule or text before calling.</strong> Unscheduled calls are rejected automatically.</span></p>
			<ul className="contact-people">{TEAM.map(p => <li key={p.name}>
				<span className="contact-avatar" aria-hidden="true">{p.name[0]}</span>
				<div className="contact-who"><strong>{p.name}</strong>{p.title && <span className="contact-title">{p.title}</span>}{p.phone && <span>{p.phone.display}</span>}<ProfileLinks person={p} /></div>
				<div className="contact-actions">
					{p.phone && <a className="button small" href={`sms:${p.phone.e164}`} aria-label={`Text ${p.name} at ${p.phone.display}`}><MessageSquareText size={15} /> Text</a>}
					{p.schedule && <Link className="button small outline" to={p.slug === 'amira' ? '/booking' : `/booking?with=${p.slug}`} onClick={() => setOpen(false)} aria-label={`Schedule a call with ${p.name}`}><CalendarCheck size={15} /> Schedule</Link>}
				</div>
			</li>)}</ul>
			<a className="contact-email" href={mailtoHref({ email: TEAM_EMAIL, subject: 'Question for Claw Point Advisory' })}><Mail size={16} />{TEAM_EMAIL}</a>
		</div>}
		<button ref={button} type="button" className="chat-access" aria-expanded={open} onClick={() => setOpen(o => !o)}><MessageSquare size={17} /> Team chat</button>
	</>;
}
