import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowUpRight, CheckCircle2, Handshake, MessageSquareText, Send, Sparkles, UserPlus } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { celebrate, BrandFace } from '@/components/brand-face';
import { TEAM_EMAIL } from '@/constants/site';
import { networkGroups } from '@/data/network';

const ASSETS = ['Single family', 'Multifamily', 'Commercial', 'Industrial', 'Land'];
// Chips that float around the hero badge.
const ORBIT = ['Title company', 'Family office', 'Wholesaler', 'Commercial broker', 'Escrow company', 'Developer', 'Private lender', 'TC', 'Land wholesaler', 'Real estate attorney'];

const STEPS = [
	{ icon: UserPlus, h: 'Join the list', p: 'Tell us who you are, where you work and what you’re looking for. It takes a minute.' },
	{ icon: MessageSquareText, h: 'Get to know us', p: 'Amira or Adam reaches out by text or email to learn how you work.' },
	{ icon: Handshake, h: 'Do deals together', p: 'Send us deals to fund, get intros to the right people, and hear about deals that fit.' },
];

const scrollToForm = () => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** The floating network visual: a slow orbit of upright, gently bobbing role chips that leans toward the cursor. */
function NetworkOrbit() {
	const box = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = box.current;
		if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
		let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
		const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); const clamp = (n: number) => Math.max(-0.5, Math.min(0.5, n)); tx = clamp((e.clientX - r.left) / r.width - 0.5); ty = clamp((e.clientY - r.top) / r.height - 0.5); if (!raf) raf = requestAnimationFrame(tick); };
		const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
		const tick = () => {
			x += (tx - x) * 0.08; y += (ty - y) * 0.08;
			el.style.setProperty('--mx', x.toFixed(4)); el.style.setProperty('--my', y.toFixed(4));
			raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
		};
		window.addEventListener('pointermove', move, { passive: true });
		document.addEventListener('pointerleave', leave);
		return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
	}, []);
	return <div ref={box} className="network-orbit" aria-hidden="true">
		<div className="network-orbit-tilt">
			<div className="network-orbit-ring r1" /><div className="network-orbit-ring r2" />
			<div className="network-orbit-spin">{ORBIT.map((r, i) => {
				const t = (2 * Math.PI * i) / ORBIT.length - Math.PI / 2, rad = i % 2 ? 44 : 34;
				return <span key={r} className={`network-orbit-chip${i % 2 ? ' outer' : ''}`} style={{ left: `${50 + rad * Math.cos(t)}%`, top: `${50 + rad * Math.sin(t)}%`, ['--d' as string]: `${-(i * 1.3) % 7}s`, ['--i' as string]: `${0.25 + i * 0.07}s` }}>
					<span className="orbit-counter"><span className="orbit-bob">{r}</span></span>
				</span>;
			})}</div>
			<div className="network-orbit-core"><BrandFace size={64} /><span>Claw Point<br />network</span></div>
		</div>
	</div>;
}

/** Top of the Network page: headline, a floating "who's in the network" visual and the main call to action. */
export function NetworkHero() {
	return <section className="network-hero sky-bloom"><div className="learn-wrap network-hero-grid">
		<div className="network-hero-copy">
			<p className="eyebrow">NETWORK WITH US</p>
			<h1>Want to network <em>with us?</em></h1>
			<p>Title companies, escrow, attorneys, TCs, brokers, family offices, buyers, lenders, developers and wholesalers: join the Claw Point network and let’s close more deals together.</p>
			<div className="hero-buttons"><button type="button" className="button" onClick={scrollToForm}>Join the network <ArrowDown size={16} /></button><a className="text-link dark" href="#who">See who’s in it</a></div>
			<ul className="network-hero-facts"><li><strong>30+</strong><span>Roles we work with</span></li><li><strong>50</strong><span>States we fund in</span></li><li><strong>1 min</strong><span>To join</span></li></ul>
		</div>
		<NetworkOrbit />
	</div></section>;
}

/** "Who's in the network": one card per group with its roles. */
export function NetworkGroups() {
	return <section className="band network-groups" id="who"><div className="learn-wrap">
		<div className="learn-head row"><div><p className="eyebrow">WHO’S IN THE NETWORK</p><h2>Everyone it takes <em>to close.</em></h2></div><p>From the first lead to the final wire. If you touch real estate deals, there’s a place for you here.</p></div>
		<div className="network-group-grid">{networkGroups.map(({ key, title, blurb, icon: Icon, tone, roles }) => <article key={key} className={`network-group tone-${tone}`}>
			<span className="network-group-icon"><Icon size={22} /></span>
			<h3>{title}</h3><p>{blurb}</p>
			<ul>{roles.map(r => <li key={r}>{r}</li>)}</ul>
		</article>)}
			<article className="network-group network-group-cta"><Sparkles size={22} /><h3>Don’t see your role?</h3><p>Pick “Other” and tell us what you do. We’re always growing the network.</p><button type="button" className="button small" onClick={scrollToForm}>Join the network →</button></article>
		</div>
	</div></section>;
}

/** Three steps from joining to doing deals. */
export function NetworkSteps() {
	return <section className="band network-steps"><div className="learn-wrap">
		<div className="learn-head"><p className="eyebrow">HOW IT WORKS</p><h2>Three steps to <em>more deals.</em></h2></div>
		<ol className="network-step-list">{STEPS.map(({ icon: Icon, h, p }, i) => <li key={h}><span className="network-step-num">{i + 1}</span><Icon size={22} /><h3>{h}</h3><p>{p}</p></li>)}</ol>
	</div></section>;
}

/** "Join the network" form: grouped role chips, contact details, markets, assets and links. */
export function NetworkForm() {
	const form = useFormSubmission({ submit: (_v, data) => sendForm('network', data), resetOnSuccess: true });
	const [roles, setRoles] = useState<string[]>([]);
	useEffect(() => { if (form.isSuccess) { celebrate(); setRoles([]); } }, [form.isSuccess]);
	const toggle = (r: string) => setRoles(list => (list.includes(r) ? list.filter(x => x !== r) : [...list, r]));
	const chip = (r: string, first = false) => <label key={r} className={roles.includes(r) ? 'on' : ''}><input type="checkbox" name="roles[]" value={r} checked={roles.includes(r)} onChange={() => toggle(r)} required={first && roles.length === 0} />{r}</label>;
	return <section className="band network-main" id="join"><div className="learn-wrap network-form-wrap">
		<div className="network-form-intro">
			<p className="eyebrow">JOIN THE NETWORK</p>
			<h2>Let’s get <em>connected.</em></h2>
			<p>A short profile so we know how to work with you. Someone from the team will reach out personally.</p>
			<ul className="network-promises"><li><CheckCircle2 size={17} /> Free to join, no obligations</li><li><CheckCircle2 size={17} /> Your details stay private</li><li><CheckCircle2 size={17} /> Real people, not a mailing robot</li></ul>
			<p className="network-alt">Have a deal right now? <Link to="/funding">See funding options</Link> or email <a href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</a>.</p>
		</div>
		<form className="contact-form network-form" onSubmit={form.onSubmit}>
			<input {...form.honeypotProps} />
			{form.isSuccess ? <div className="contact-success" role="status">
				<CheckCircle2 size={40} />
				<h3>You’re in the network. <em>Welcome!</em></h3>
				<p>Thanks for connecting. Someone from the team will reach out by email or text to get to know you and how we can work together.</p>
				<Link className="button" to="/blog">Learn how we fund deals <ArrowUpRight size={16} /></Link>
			</div> : <>
				<fieldset className="network-roles"><legend>I am a… <span>choose all that apply{roles.length ? ` · ${roles.length} selected` : ''}</span></legend>
					{networkGroups.map((g, gi) => <div key={g.key} className={`network-role-group tone-${g.tone}`}><p><g.icon size={14} /> {g.title}</p><div className="contact-topics">{g.roles.map((r, ri) => chip(r, gi === 0 && ri === 0))}</div></div>)}
					<div className="network-role-group"><div className="contact-topics">{chip('Other')}</div></div>
				</fieldset>
				{roles.includes('Other') && <label>Your role<input name="role_other" maxLength={100} required placeholder="Tell us what you do" /></label>}
				<div className="contact-row">
					<label>Full name<input name="name" autoComplete="name" required maxLength={200} placeholder="Your name" /></label>
					<label>Company <span>(optional)</span><input name="company" autoComplete="organization" maxLength={200} placeholder="Company or brokerage" /></label>
				</div>
				<div className="contact-row">
					<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
					<label>Phone<input name="phone" type="tel" autoComplete="tel" required maxLength={60} placeholder="So we can text you" /></label>
				</div>
				<label>Markets you work in<input name="markets" required maxLength={300} placeholder="States or cities, like Texas, Phoenix or nationwide" /></label>
				<fieldset className="contact-topics network-assets"><legend>Asset types <span>(optional)</span></legend>
					{ASSETS.map(a => <label key={a}><input type="checkbox" name="assets[]" value={a} />{a}</label>)}
				</fieldset>
				<label>How would you like to work with us? <span>(optional)</span><textarea name="message" maxLength={3000} rows={4} placeholder="Your buy box, the deals you bring, the services you offer…" /></label>
				<div className="contact-row">
					<label>Website <span>(optional)</span><input name="website" autoComplete="url" maxLength={200} placeholder="yourcompany.com" /></label>
					<label>LinkedIn or Instagram <span>(optional)</span><input name="social" maxLength={200} placeholder="Profile link or @handle" /></label>
				</div>
				<label className="check-label"><input name="consent" type="checkbox" value="true" required /> I agree to be contacted about networking and deals. My details are kept private.</label>
				<button className="button network-submit" disabled={form.isSubmitting}><Send size={16} /> {form.isSubmitting ? 'Sending…' : 'Join the network'}</button>
				{form.isError && <p role="alert" className="contact-error">We couldn’t send your details. Check them and try again, or email clawpointadvisory@gmail.com.</p>}
			</>}
		</form>
	</div></section>;
}
