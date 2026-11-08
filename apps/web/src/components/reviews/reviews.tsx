import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock, Send, Star } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { celebrate } from '@/components/brand-face';

const DEALS = ['Stack Method', 'Echo Method', 'Double Close', 'EMD', 'Other'];
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** The /reviews page: a private review form. Reviews go to the team only and are never shown on the site. */
export function ReviewsPage() {
	return <section className="band rv-band rv-page"><div className="learn-wrap rv-page-wrap"><ReviewForm /></div></section>;
}

function ReviewForm() {
	const form = useFormSubmission({ submit: (_v, data) => sendForm('review', data), resetOnSuccess: true });
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	useEffect(() => { if (form.isSuccess) { celebrate(); setRating(0); } }, [form.isSuccess]);
	const shown = hover || rating;
	const label = useMemo(() => LABELS[shown], [shown]);
	return <form id="leave" className="contact-form rv-form" onSubmit={form.onSubmit}>
		<input {...form.honeypotProps} />
		{form.isSuccess ? <div className="contact-success" role="status">
			<CheckCircle2 size={40} />
			<h3>Thank you! <em>Truly.</em></h3>
			<p>Your review went straight to the team. We read every one.</p>
		</div> : <>
			<div className="contact-form-head"><h3>Leave a review</h3><p>How was working with Claw Point? A few honest words help us get better.</p></div>
			<p className="rv-private"><Lock size={15} /> Private: only the Claw Point team sees your review. It’s never posted on the website.</p>
			<fieldset className="rv-rate" onMouseLeave={() => setHover(0)}><legend>Your rating</legend>
				<div>{[1, 2, 3, 4, 5].map(i => <label key={i} className={i <= shown ? 'on' : ''} onMouseEnter={() => setHover(i)}>
					<input type="radio" name="rating" value={i} checked={rating === i} onChange={() => setRating(i)} required /><Star size={28} aria-hidden="true" /><span className="sr-only">{i} star{i > 1 ? 's' : ''}</span>
				</label>)}<span className="rv-rate-label">{label}</span></div>
			</fieldset>
			<div className="contact-row">
				<label>Name<input name="name" autoComplete="name" required maxLength={120} placeholder="Your name" /></label>
				<label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
			</div>
			<div className="contact-row">
				<label><b className="rv-label">Role or company <i>(optional)</i></b><input name="role" maxLength={120} placeholder="e.g. Wholesaler, Houston" /></label>
				<label><b className="rv-label">Deal type <i>(optional)</i></b><select name="deal" defaultValue=""><option value="">Choose one</option>{DEALS.map(d => <option key={d}>{d}</option>)}</select></label>
			</div>
			<label>Your review<textarea name="review" required minLength={10} maxLength={2000} rows={5} placeholder="What was the deal, how did it go, and how was the team to work with?" /></label>
			<button className="button" disabled={form.isSubmitting}><Send size={16} /> {form.isSubmitting ? 'Sending…' : 'Send review'}</button>
			{form.isError && <p role="alert" className="contact-error">We couldn’t send your review. Check your details and try again.</p>}
			{Object.entries(form.fieldErrors).map(([key, value]) => <p key={key} role="alert" className="contact-error">{key}: {value}</p>)}
		</>}
	</form>;
}
