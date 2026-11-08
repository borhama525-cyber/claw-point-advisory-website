import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Briefcase, Building2, CheckCircle2, ClipboardCheck, Factory, Handshake, Home, Landmark, LandPlot, Send, Store, Users } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { celebrate } from '@/components/brand-face';
import { TEAM_EMAIL } from '@/constants/site';

/** Who can join the network list. Keep in step with NETWORK_ROLES in public/send.php. */
export const NETWORK_ROLES = [
	{ label: 'Transaction coordinator (TC)', icon: ClipboardCheck },
	{ label: 'Real estate agent / broker', icon: Home },
	{ label: 'Commercial broker', icon: Store },
	{ label: 'Family office', icon: Landmark },
	{ label: 'Buyer / investor', icon: Briefcase },
	{ label: 'Developer', icon: Factory },
	{ label: 'Wholesaler', icon: Handshake },
	{ label: 'Land wholesaler', icon: LandPlot },
	{ label: 'Lender / capital partner', icon: Building2 },
	{ label: 'Title / escrow', icon: ClipboardCheck },
	{ label: 'Other', icon: Users },
];

const ASSETS = ['Single family', 'Multifamily', 'Commercial', 'Industrial', 'Land'];

const WHY = [
	['Deal flow both ways', 'Bring us deals that need funding, or hear about deals that fit your buy box.'],
	['A funding partner on call', 'Stack, Echo, double close and EMD funding nationwide, with a primary lender when you need one.'],
	['Real people', 'Amira and Adam know who’s in the network and make the intros themselves.'],
];

/** "Network with us": a short profile for TCs, brokers, buyers, family offices, developers and wholesalers. */
export function NetworkForm() {
	const form = useFormSubmission({ submit: (_v, data) => sendForm('network', data), resetOnSuccess: true });
	const [roles, setRoles] = useState<string[]>([]);
	useEffect(() => { if (form.isSuccess) { celebrate(); setRoles([]); } }, [form.isSuccess]);
	const toggle = (r: string) => setRoles(list => (list.includes(r) ? list.filter(x => x !== r) : [...list, r]));
	return <section className="band network-main">
		<div className="learn-wrap network-grid">
			<aside className="network-side">
				<p className="eyebrow">WHY JOIN</p>
				<h2>Grow with a <em>funding partner.</em></h2>
				<ul className="network-why">{WHY.map(([h, p], i) => <li key={h}><span>{i + 1}</span><div><strong>{h}</strong><p>{p}</p></div></li>)}</ul>
				<div className="network-who"><p className="eyebrow">WHO WE NETWORK WITH</p>
					<div className="network-chips">{NETWORK_ROLES.filter(r => r.label !== 'Other').map(({ label, icon: Icon }) => <span key={label}><Icon size={14} /> {label}</span>)}</div>
				</div>
				<p className="network-alt">Have a deal right now? <Link to="/funding">See funding options</Link> or email <a href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</a>.</p>
			</aside>

			<form className="contact-form network-form" onSubmit={form.onSubmit}>
				<input {...form.honeypotProps} />
				{form.isSuccess ? <div className="contact-success" role="status">
					<CheckCircle2 size={40} />
					<h3>You’re on the list. <em>Welcome!</em></h3>
					<p>Thanks for connecting. Someone from the team will reach out by email or text to get to know you and how we can work together.</p>
					<Link className="button" to="/blog">Learn how we fund deals <ArrowUpRight size={16} /></Link>
				</div> : <>
					<div className="contact-form-head"><h3>Join the network</h3><p>A quick profile so we know how to work together. Takes about a minute.</p></div>
					<fieldset className="contact-topics network-roles"><legend>I am a… <span>(choose all that apply)</span></legend>
						{NETWORK_ROLES.map(({ label, icon: Icon }, i) => <label key={label} className={roles.includes(label) ? 'on' : ''}><input type="checkbox" name="roles[]" value={label} checked={roles.includes(label)} onChange={() => toggle(label)} required={i === 0 && roles.length === 0} /><Icon size={15} /> {label}</label>)}
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
					<label>Markets you work in<input name="markets" required maxLength={300} placeholder="States or cities, like Texas, Phoenix, nationwide" /></label>
					<fieldset className="contact-topics network-assets"><legend>Asset types <span>(optional)</span></legend>
						{ASSETS.map(a => <label key={a}><input type="checkbox" name="assets[]" value={a} />{a}</label>)}
					</fieldset>
					<label>How would you like to work with us? <span>(optional)</span><textarea name="message" maxLength={3000} rows={4} placeholder="Your buy box, the deals you bring, what you’re looking for…" /></label>
					<div className="contact-row">
						<label>Website <span>(optional)</span><input name="website" autoComplete="url" maxLength={200} placeholder="yourcompany.com" /></label>
						<label>LinkedIn or Instagram <span>(optional)</span><input name="social" maxLength={200} placeholder="Profile link or @handle" /></label>
					</div>
					<label className="check-label"><input name="consent" type="checkbox" value="true" required /> I agree to be contacted about networking and deals. My details are kept private.</label>
					<button className="button" disabled={form.isSubmitting}><Send size={16} /> {form.isSubmitting ? 'Sending…' : 'Join the network'}</button>
					{form.isError && <p role="alert" className="contact-error">We couldn’t send your details. Check them and try again, or text us.</p>}
				</>}
			</form>
		</div>
	</section>;
}
