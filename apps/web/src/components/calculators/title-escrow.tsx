import { useState } from 'react';
import { Mail } from 'lucide-react';
import { TEAM_EMAIL } from '@/constants/site';

export type EscrowMode = 'same' | 'have' | 'need';
/** States where title and escrow are commonly handled by separate companies. */
export const SEPARATE_ESCROW_STATES = ['CA'];

type Errors = Record<string, string | undefined>;

function Input({ name, label, type = 'text', required, error, autoComplete, placeholder }: { name: string; label: string; type?: string; required?: boolean; error?: string; autoComplete?: string; placeholder?: string }) {
	return <label className="dr-field" htmlFor={`dr-${name}`}><span>{label}{required && ' *'}</span>
		<input id={`dr-${name}`} name={name} type={type} required={required} maxLength={200} autoComplete={autoComplete} placeholder={placeholder} />
		{error && <em className="dr-error">{error}</em>}
	</label>;
}

/** Double close: the title company (required) and the escrow agent, or a request for us to provide one. */
export function TitleEscrowSection({ errors: e, usState, mode, onMode }: { errors: Errors; usState: string; mode: EscrowMode; onMode: (m: EscrowMode) => void }) {
	const separate = SEPARATE_ESCROW_STATES.includes(usState);
	return <>
		<h3>Title &amp; escrow</h3>
		<div className="dr-party">
			<p className="dr-party-head"><strong>Title company</strong><span className="dr-badge req">Required</span></p>
			<div className="dr-row"><Input name="title_company" label="Company name" required error={e.title_company} />
				<Input name="title_contact" label="Title officer or contact" required error={e.title_contact} autoComplete="off" /></div>
			<div className="dr-row"><Input name="title_email" label="Email" type="email" required error={e.title_email} placeholder="officer@titleco.com" />
				<Input name="title_phone" label="Phone" type="tel" required error={e.title_phone} placeholder="(555) 555-5555" /></div>
		</div>
		<div className="dr-party">
			<p className="dr-party-head"><strong>Escrow agent</strong></p>
			{separate && <p className="dr-note">In California, title and escrow are usually separate companies. Don’t have an escrow agent? We can provide one.</p>}
			<div className="dr-lender-choice dr-escrow-choice" role="radiogroup" aria-label="Escrow agent">
				{([['same', 'Same as my title company', 'Title handles escrow too'], ['have', 'Separate escrow agent', 'I’ll add their details'], ['need', 'I need an escrow agent', 'We’ll provide one']] as const).map(([v, h, s]) =>
					<label key={v} className={mode === v ? 'on' : ''}><input type="radio" name="escrow_mode" value={v} checked={mode === v} onChange={() => onMode(v)} /> {h} <small>{s}</small></label>)}
			</div>
			{mode === 'have' && <div className="dr-party-fields">
				<div className="dr-row"><Input name="escrow_company" label="Escrow company" required error={e.escrow_company} />
					<Input name="escrow_contact" label="Escrow officer or contact" required error={e.escrow_contact} autoComplete="off" /></div>
				<div className="dr-row"><Input name="escrow_email" label="Email" type="email" required error={e.escrow_email} placeholder="officer@escrowco.com" />
					<Input name="escrow_phone" label="Phone" type="tel" required error={e.escrow_phone} placeholder="(555) 555-5555" /></div>
			</div>}
			{mode === 'need' && <p className="dr-note ok">No problem. We’ll provide an escrow agent for this closing.</p>}
		</div>
		<label className="check-label dr-intro-ack"><input type="checkbox" name="intro_ack" value="Yes" required /> I’ll introduce Claw Point Advisory to my title company{mode === 'have' ? ' and escrow agent' : ''} by email, so we can coordinate the closing. *</label>
	</>;
}

/** After a double close request: a ready-to-send intro email to title and escrow, copying the team. */
export function IntroEmail({ to, address, name }: { to: string[]; address: string; name: string }) {
	const [sent, setSent] = useState(false);
	if (!to.length) return null;
	const body = `Hi,\n\nI'd like to introduce Claw Point Advisory (${TEAM_EMAIL}), who are funding the A–B side of my double close on ${address || 'the property'}.\n\nPlease keep them copied on closing communications and let them know what you need from them.\n\nThank you,\n${name}`;
	const href = `mailto:${to.join(',')}?cc=${TEAM_EMAIL}&subject=${encodeURIComponent(`Introduction: Claw Point Advisory, double close${address ? ` on ${address}` : ''}`)}&body=${encodeURIComponent(body)}`;
	return <div className="dr-intro">
		<p><strong>Last step: introduce us to your closing team.</strong> We’ve written the email for you. It opens in your mail app, addressed to {to.join(' and ')} with us copied.</p>
		<a className="button" href={href} onClick={() => setSent(true)}><Mail size={16} /> {sent ? 'Open the intro email again' : 'Send the intro email'}</a>
	</div>;
}

export type TitleMode = 'tbd' | 'chosen';

/** EMD: the borrower's role on the PSA, the inspection period, title (ideally TBD on the PSA) and what happens next. */
export function EmdSection({ errors: e, propertyType, titleMode, onTitleMode }: { errors: Errors; propertyType: string; titleMode: TitleMode; onTitleMode: (m: TitleMode) => void }) {
	const [role, setRole] = useState('');
	const [days, setDays] = useState('');
	const longCommercial = propertyType === 'Commercial' && Number(days) >= 60;
	const wholesaler = role === 'Wholesaler acting as buyer';
	return <>
		<h3>EMD details</h3>
		<div className="dr-party">
			<div className="dr-row">
				<label className="dr-field" htmlFor="dr-emd_role"><span>Your role on the PSA *</span>
					<select id="dr-emd_role" name="emd_role" required value={role} onChange={ev => setRole(ev.target.value)}><option value="" disabled>Select</option><option>Buyer</option><option>Wholesaler acting as buyer</option></select>
					{e.emd_role && <em className="dr-error">{e.emd_role}</em>}</label>
				<label className="dr-field" htmlFor="dr-inspection_days"><span>Inspection period (days) *</span>
					<input id="dr-inspection_days" name="inspection_days" inputMode="numeric" pattern="\d{1,3}" required maxLength={3} placeholder="e.g. 30" value={days} onChange={ev => setDays(ev.target.value.replace(/\D/g, ''))} />
					{e.inspection_days && <em className="dr-error">{e.inspection_days}</em>}</label>
			</div>
			{longCommercial && <p className="dr-note">Commercial deal with a {Number(days) >= 90 ? '90+' : '60+'} day inspection period: the EMD is structured with a fee every 30 days and a separate mutual EMD loan agreement. We’ll go through it once your PSA and title details are in.</p>}
		</div>
		<div className="dr-party">
			<p className="dr-party-head"><strong>Title company</strong></p>
			<p className="dr-note ok">Tip: list the title company as <strong>TBD</strong> in the PSA where you can.</p>
			<div className="dr-lender-choice" role="radiogroup" aria-label="Title company">
				<label className={titleMode === 'tbd' ? 'on' : ''}><input type="radio" name="title_mode" value="tbd" checked={titleMode === 'tbd'} onChange={() => onTitleMode('tbd')} /> TBD on the PSA <small>We’ll coordinate title with you</small></label>
				<label className={titleMode === 'chosen' ? 'on' : ''}><input type="radio" name="title_mode" value="chosen" checked={titleMode === 'chosen'} onChange={() => onTitleMode('chosen')} /> Title is already chosen <small>I’ll add their details</small></label>
			</div>
			{titleMode === 'chosen' && <div className="dr-party-fields">
				<div className="dr-row"><Input name="title_company" label="Company name" required error={e.title_company} />
					<Input name="title_contact" label="Title officer or contact" required error={e.title_contact} autoComplete="off" /></div>
				<div className="dr-row"><Input name="title_email" label="Email" type="email" required error={e.title_email} placeholder="officer@titleco.com" />
					<Input name="title_phone" label="Phone" type="tel" required error={e.title_phone} placeholder="(555) 555-5555" /></div>
			</div>}
		</div>
		<div className="dr-steps">
			<p className="dr-party-head"><strong>What happens next</strong></p>
			<ol>
				<li>You send the signed PSA and the title details.</li>
				<li>We send our <strong>mutual release</strong> to be signed by {wholesaler ? <>you (as the buyer on the PSA) and the seller</> : <>the buyer and the seller</>}.{!role && ' If a wholesaler is the buyer on the PSA, the wholesaler signs it with the seller.'}</li>
				<li>Then we set your EMD structure together. Commercial deals with a 60+ or 90+ day inspection period get a 30-day fee structure and a mutual EMD loan agreement.</li>
			</ol>
		</div>
	</>;
}
