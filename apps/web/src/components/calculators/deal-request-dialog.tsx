import { useEffect, useRef, useState, type ReactNode } from 'react';
import { celebrate } from '@/components/brand-face';
import * as Dialog from '@radix-ui/react-dialog';
import { FileText, UploadCloud, X } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { requiredDocs } from '@/data/required-docs';
import { toolBySlug } from '@/data/deal-tools';
import { EmdSection, IntroEmail, SEPARATE_ESCROW_STATES, TitleEscrowSection, type EscrowMode, type TitleMode } from '@/components/calculators/title-escrow';

export type RequestPrefill = { purchase_price?: number; seller_finance?: number; resale_price?: number; primary_loan?: number; requested_funding?: number };

const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
const PROPERTY_TYPES = ['Single family', 'Multifamily', 'Commercial', 'Industrial', 'Land'];
const MONEY = ['purchase_price', 'seller_finance', 'resale_price', 'primary_loan', 'requested_funding'] as const;
const ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';
const grouped = (n?: number) => (n === undefined || !Number.isFinite(n) ? '' : Math.round(n).toLocaleString('en-US'));

function Field({ label, name, required, error, children, className }: { label: string; name: string; required?: boolean; error?: string; children: ReactNode; className?: string }) {
	return <label className={`dr-field ${className ?? ''}`} htmlFor={`dr-${name}`}><span>{label}{required && ' *'}</span>{children}{error && <em className="dr-error">{error}</em>}</label>;
}

function Money({ name, value, required, error, label }: { name: string; value?: number; required?: boolean; error?: string; label: string }) {
	const [raw, setRaw] = useState(grouped(value));
	return <Field label={label} name={name} required={required} error={error}><span className="dr-money"><i>$</i><input id={`dr-${name}`} name={name} inputMode="numeric" required={required} value={raw} onChange={e => setRaw(grouped(Number(e.target.value.replace(/[^0-9]/g, '')) || undefined))} aria-invalid={Boolean(error)} /></span></Field>;
}

/** US-format date (MM/DD/YYYY) whatever the visitor's computer region; sends YYYY-MM-DD as `name`. */
function UsDate({ name, required }: { name: string; required?: boolean }) {
	const [text, setText] = useState('');
	const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
	const iso = m ? `${m[3]}-${m[1]}-${m[2]}` : '';
	const mask = (raw: string) => { const d = raw.replace(/\D/g, '').slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/'); };
	return <>
		<input id={`dr-${name}`} inputMode="numeric" autoComplete="off" placeholder="MM/DD/YYYY" required={required} value={text} onChange={ev => setText(mask(ev.target.value))}
			pattern="(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/20[0-9]{2}" title="Use MM/DD/YYYY, for example 12/01/2026" maxLength={10} />
		<input type="hidden" name={name} value={iso} />
	</>;
}

const fileSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** A drag-and-drop upload box around a real file input, so browser validation and form data work as usual. */
function FileDrop({ id, name, required, multiple, onChange }: { id: string; name: string; required?: boolean; multiple?: boolean; onChange?: (has: boolean) => void }) {
	const input = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [over, setOver] = useState(false);
	const pick = (list: FileList | null) => { const f = list ? [...list] : []; setFiles(f); onChange?.(f.length > 0); };
	const clear = () => { if (input.current) input.current.value = ''; pick(null); };
	const total = files.reduce((n, f) => n + f.size, 0);
	return <div className={`dr-drop${files.length ? ' has-file' : ''}${over ? ' is-over' : ''}`} onDragEnter={() => setOver(true)} onDragLeave={() => setOver(false)} onDrop={() => setOver(false)}>
		<input ref={input} id={id} name={name} type="file" required={required} multiple={multiple} accept={ACCEPT} onChange={ev => pick(ev.target.files)} />
		{files.length ? <>
			<FileText size={20} className="dr-drop-icon" />
			<span className="dr-drop-text"><strong>{files.length === 1 ? files[0].name : `${files.length} files selected`}</strong><small>{fileSize(total)} · ready to send</small></span>
			<button type="button" className="dr-drop-remove" onClick={clear}>Remove</button>
		</> : <>
			<UploadCloud size={20} className="dr-drop-icon" />
			<span className="dr-drop-text"><strong>Drop {multiple ? 'files' : 'a file'} here or <u>browse</u></strong><small>PDF, PNG or JPG · up to 5 MB{multiple ? ' each' : ''}</small></span>
		</>}
	</div>;
}

export function DealRequestDialog({ open, onOpenChange, method, title, prefill, calculator, onBack }: { open: boolean; onOpenChange: (o: boolean) => void; method: string; title: string; prefill: RequestPrefill; calculator: Record<string, number>; onBack: () => void }) {
	const [needsLender, setNeedsLender] = useState(false);
	const [usState, setUsState] = useState('');
	const [escrowMode, setEscrowMode] = useState<EscrowMode>('same');
	const [intro, setIntro] = useState<{ to: string[]; address: string; name: string } | null>(null);
	const isDoubleClose = method === 'double-close';
	const isEmd = method === 'emd';
	const [propertyType, setPropertyType] = useState('');
	const [titleMode, setTitleMode] = useState<TitleMode>('tbd');
	const docs = requiredDocs[method] ?? [];
	const [attached, setAttached] = useState<Record<string, boolean>>({});
	const requiredNow = docs.filter(d => !d.optional && !((d.lender || d.withLender) && needsLender));
	const done = requiredNow.filter(d => attached[d.key]).length;
	const form = useFormSubmission({
		submit: (_v, data) => {
			for (const k of MONEY) { const v = String(data.get(k) ?? '').replace(/[^0-9.]/g, ''); if (v) data.set(k, v); else data.delete(k); }
			const docs = data.getAll('documents[]').filter(f => f instanceof File && f.size > 0); data.delete('documents[]'); for (const f of docs) data.append('documents[]', f);
			data.set('method', method); data.set('consent', data.get('consent') ? 'true' : 'false'); data.set('calculator', JSON.stringify(calculator));
			const tool = toolBySlug(method);
			if (tool) data.set('calculator_summary', tool.fields.filter(f => calculator[f.key] !== undefined).map(f => `${f.label}: ${f.unit === '$' ? '$' + Math.round(calculator[f.key]).toLocaleString('en-US') : calculator[f.key] + ' ' + f.unit}`).join('\n'));
			if (method === 'double-close') {
				const get = (k: string) => String(data.get(k) ?? '').trim();
				setIntro({ to: [get('title_email'), get('escrow_email')].filter(Boolean), address: [get('address'), get('city'), get('state')].filter(Boolean).join(', '), name: `${get('first_name')} ${get('last_name')}`.trim() });
			}
			return sendForm('deal', data);
		},
	});
	useEffect(() => { if (form.isSuccess) celebrate(); }, [form.isSuccess]);
	const e = form.fieldErrors;
	return <Dialog.Root open={open} onOpenChange={onOpenChange}>
		<Dialog.Portal>
			<Dialog.Overlay className="dr-overlay" />
			<Dialog.Content className="dr-panel" aria-describedby="dr-desc">
				<Dialog.Close className="dr-close" aria-label="Close"><X size={18} /></Dialog.Close>
				<button type="button" className="dr-back" onClick={onBack}>← All funding types</button>
				<Dialog.Title className="dr-title">{title}</Dialog.Title>
				<p id="dr-desc" className="dr-sub">About two minutes. Your calculator numbers are already filled in, and every request is reviewed individually.</p>
				{form.isSuccess ? <div className="dr-done" role="status"><h3>Request received.</h3><p>Thank you. Our team will review your deal and reply by email. If anything is missing, we’ll ask for it then. Submitting a request is not a funding commitment.</p>{intro && <IntroEmail {...intro} />}<button type="button" className="button" onClick={() => onOpenChange(false)}>Back to the calculator</button></div> :
				<form className="dr-form" onSubmit={form.onSubmit} encType="multipart/form-data" noValidate={false}>
					<input {...form.honeypotProps} />
					<h3>Borrower information</h3>
					<div className="dr-row"><Field label="Borrower first name" name="first_name" required error={e.first_name}><input id="dr-first_name" name="first_name" autoComplete="given-name" required maxLength={100} /></Field>
					<Field label="Borrower last name" name="last_name" required error={e.last_name}><input id="dr-last_name" name="last_name" autoComplete="family-name" required maxLength={100} /></Field></div>
					<div className="dr-row"><Field label="Borrower email" name="email" required error={e.email}><input id="dr-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Field>
					<Field label="Borrower phone" name="phone" required error={e.phone}><input id="dr-phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="(555) 555-5555" /></Field></div>
					<h3>Deal information</h3>
					<Field label="Property type" name="property_type" required error={e.property_type}><select id="dr-property_type" name="property_type" required defaultValue="" onChange={ev => setPropertyType(ev.target.value)}><option value="" disabled>Select</option>{PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
					<Field label="Subject property address" name="address" required error={e.address}><input id="dr-address" name="address" autoComplete="street-address" required maxLength={300} placeholder="Street address" /></Field>
					<div className="dr-row dr-row-3"><Field label="City" name="city" required error={e.city}><input id="dr-city" name="city" autoComplete="address-level2" required maxLength={120} /></Field>
					<Field label="State" name="state" required error={e.state}><select id="dr-state" name="state" autoComplete="address-level1" required defaultValue="" onChange={ev => { setUsState(ev.target.value); setEscrowMode(SEPARATE_ESCROW_STATES.includes(ev.target.value) ? (escrowMode === 'same' ? 'have' : escrowMode) : 'same'); }}><option value="" disabled>Select</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></Field>
					<Field label="ZIP" name="zip" required error={e.zip}><input id="dr-zip" name="zip" autoComplete="postal-code" inputMode="numeric" required pattern="\d{5}(-\d{4})?" maxLength={10} /></Field></div>
					<Field label="Target close date" name="close_date" required error={e.close_date}><UsDate name="close_date" required /></Field>
					{isEmd ? <div className="dr-row"><Money label="Purchase price" name="purchase_price" value={prefill.purchase_price} required error={e.purchase_price} />
					<Money label="EMD amount" name="requested_funding" value={prefill.requested_funding} required error={e.requested_funding} /></div> : <>
					<div className="dr-row"><Money label="Purchase price" name="purchase_price" value={prefill.purchase_price} required error={e.purchase_price} />
					{method === 'stack' ? <Money label="Seller finance amount" name="seller_finance" value={prefill.seller_finance} required error={e.seller_finance} /> : <Money label={method === 'echo' || method === 'double-close' ? 'B–C sale price' : 'Estimated value or ARV'} name="resale_price" value={prefill.resale_price} error={e.resale_price} />}</div>
					<div className="dr-row"><Money label="Primary loan amount (if you have one)" name="primary_loan" value={prefill.primary_loan} error={e.primary_loan} />
					<Money label="Requested funding" name="requested_funding" value={prefill.requested_funding} required error={e.requested_funding} /></div></>}
					{!docs.some(d => d.lender) && !isDoubleClose && !isEmd && <label className="check-label dr-lender"><input type="checkbox" name="needs_lender" value="Yes" checked={needsLender} onChange={ev => setNeedsLender(ev.target.checked)} /> I need a primary lender: please provide one for this deal.</label>}
					{isEmd && <EmdSection errors={e} propertyType={propertyType} titleMode={titleMode} onTitleMode={setTitleMode} usState={usState} escrowMode={escrowMode} onEscrowMode={setEscrowMode} />}
					{isDoubleClose && <TitleEscrowSection errors={e} usState={usState} mode={escrowMode} onMode={setEscrowMode} />}
					<h3>Required documents</h3>
					{requiredNow.length > 0 && <div className="dr-progress" aria-live="polite"><div className="dr-progress-bar"><i style={{ width: `${(done / requiredNow.length) * 100}%` }} /></div><span>{done === requiredNow.length ? 'All required documents attached ✓' : `${done} of ${requiredNow.length} required attached`}</span></div>}
					{docs.some(d => d.lender) && <div className="dr-lender-choice" role="radiogroup" aria-label="Primary lender">
						<label className={needsLender ? '' : 'on'}><input type="radio" name="lender_choice" checked={!needsLender} onChange={() => setNeedsLender(false)} /> I have a primary lender <small>Send the lender’s paperwork below</small></label>
						<label className={needsLender ? 'on' : ''}><input type="radio" name="lender_choice" checked={needsLender} onChange={() => setNeedsLender(true)} /> I need a primary lender <small>We’ll provide one for this deal</small></label>
						{needsLender && <input type="hidden" name="needs_lender" value="Yes" />}
					</div>}
					<div className="dr-docs">{docs.map(d => {
						if (d.lender && needsLender) return <div key={d.key} className="dr-field dr-doc is-waived"><label><span>{d.label}</span></label><small className="dr-doc-hint">Not needed: we’ll provide your primary lender.</small></div>;
						const req = !d.optional && !(d.withLender && needsLender);
						return <Field key={d.key} label={d.label} name={`doc_${d.key}`} required={req} error={e[`doc_${d.key}`]} className={`dr-doc ${req ? 'is-required' : 'is-optional'}${attached[d.key] ? ' is-attached' : ''}`}>
							<small className="dr-doc-hint">{d.hint}</small>
							<FileDrop id={`dr-doc_${d.key}`} name={`doc_${d.key}`} required={req} onChange={has => setAttached(a => ({ ...a, [d.key]: has }))} />
						</Field>;
					})}</div>
					<Field label="Other documents (optional)" name="documents" error={e.documents}><FileDrop id="dr-documents" name="documents[]" multiple /></Field>
					<p className="dr-hint">Addendums, photos, title commitment or anything else that helps.</p>
					<h3>Deal description</h3>
					<Field label="Anything that helps us understand the deal" name="description" error={e.description}><textarea id="dr-description" name="description" rows={4} maxLength={5000} placeholder="Exit plan, seller terms, timeline, anything unusual…" /></Field>
					<h3>Referred by someone? <small>(optional)</small></h3>
					<div className="dr-row"><Field label="Referrer first name" name="referrer_first_name"><input id="dr-referrer_first_name" name="referrer_first_name" maxLength={100} /></Field>
					<Field label="Referrer last name" name="referrer_last_name"><input id="dr-referrer_last_name" name="referrer_last_name" maxLength={100} /></Field></div>
					<div className="dr-row"><Field label="Referrer email" name="referrer_email" error={e.referrer_email}><input id="dr-referrer_email" name="referrer_email" type="email" /></Field>
					<Field label="Referrer phone" name="referrer_phone"><input id="dr-referrer_phone" name="referrer_phone" type="tel" maxLength={40} /></Field></div>
					<p className="dr-hint">If a partner sent you, add their details so they get credit and a copy of your request.</p>
					<label className="check-label dr-consent"><input type="checkbox" name="consent" value="true" required /> I agree that Claw Point Advisory may store the information and documents I submit and contact me about this request.</label>
					<p className="dr-legal">We use your details only to review this request and to follow up with you about it. You can ask us to delete your information at any time. Don’t include bank account numbers, Social Security numbers or other identity documents in this form.</p>
					{form.isError && <p className="dr-error" role="alert">We couldn’t send your request. Check the highlighted fields and try again, or use the contact page.</p>}
					<div className="dr-submit-bar"><button type="submit" className="button dr-submit" disabled={form.isSubmitting}>{form.isSubmitting ? <><span className="dr-spinner" aria-hidden="true" /> Sending…</> : 'Submit request →'}</button></div>
				</form>}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>;
}
