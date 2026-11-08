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
