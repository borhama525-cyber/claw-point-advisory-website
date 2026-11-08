import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, MessageSquareQuote, Send, Star } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { celebrate } from '@/components/brand-face';
import { reviews as handPicked, type Review } from '@/data/reviews';

const DEALS = ['Stack Method', 'Echo Method', 'Double Close', 'EMD', 'Other'];
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Approved reviews: the hand-picked list plus any approved in the sheet. */
function useReviews() {
	const [list, setList] = useState<Review[]>(handPicked);
	useEffect(() => {
		let stop = false;
		fetch('/reviews.php', { cache: 'no-store' }).then(r => r.json()).then((d: { ok?: boolean; reviews?: Review[] }) => {
			if (stop || !d?.ok || !Array.isArray(d.reviews) || !d.reviews.length) return;
			const seen = new Set<string>();
			setList([...d.reviews, ...handPicked].filter(r => { const k = `${r.name}|${r.text}`.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
				.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
		}).catch(() => {});
		return () => { stop = true; };
	}, []);
	return list;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
	return <span className="rv-stars" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} className={i <= Math.round(value) ? 'on' : ''} aria-hidden="true" />)}</span>;
}

function ReviewCard({ r }: { r: Review }) {
	const when = r.date ? new Date(`${r.date.slice(0, 10)}T12:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
	return <figure className="rv-card">
		<div className="rv-card-top"><Stars value={r.rating} />{r.deal && <span className="rv-deal">{r.deal}</span>}</div>
		<blockquote>“{r.text}”</blockquote>
		<figcaption><span className="contact-avatar" aria-hidden="true">{r.name[0]}</span><span><strong>{r.name}</strong>{(r.role || when) && <small>{[r.role, when].filter(Boolean).join(' · ')}</small>}</span></figcaption>
	</figure>;
}

function Summary({ list }: { list: Review[] }) {
	const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
	return <div className="rv-summary"><strong>{avg.toFixed(1)}</strong><div><Stars value={avg} size={18} /><span className="rv-count">{list.length} client review{list.length === 1 ? '' : 's'}</span></div></div>;
}

function Empty() {
	return <div className="rv-empty"><MessageSquareQuote size={30} /><div><strong>Reviews are on the way.</strong><p>Worked with us on a deal? Be one of the first to share how it went. Your review shows here once the team approves it.</p></div></div>;
}

/** Home page section: a few approved reviews and an invitation to leave one. */
export function ReviewsSection() {
	const list = useReviews();
	return <section className="band rv-band"><div className="learn-wrap">
		<div className="rv-head">
			<div><p className="eyebrow">CLIENT REVIEWS</p><h2>What investors say <em>after closing.</em></h2></div>
			{list.length > 0 && <Summary list={list} />}
		</div>
		{list.length ? <div className="rv-grid">{list.slice(0, 3).map(r => <ReviewCard key={`${r.name}${r.date}`} r={r} />)}</div> : <Empty />}
		<div className="rv-actions">
			{list.length > 3 && <Link to="/reviews" className="button outline small">Read all reviews <ArrowRight size={15} /></Link>}
			<Link to="/reviews#leave" className="button small">Leave a review <Star size={15} /></Link>
		</div>
	</div></section>;
}

/** The /reviews page: every approved review plus the form. */
export function ReviewsPage() {
	const list = useReviews();
	return <section className="band rv-band rv-page"><div className="learn-wrap rv-page-grid">
		<div>
			{list.length > 0 && <Summary list={list} />}
			{list.length ? <div className="rv-grid rv-grid-page">{list.map(r => <ReviewCard key={`${r.name}${r.date}`} r={r} />)}</div> : <Empty />}
		</div>
		<ReviewForm />
	</div></section>;
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
			<p>Your review went to the team. It will show on the site once it’s approved.</p>
		</div> : <>
			<div className="contact-form-head"><h3>Leave a review</h3><p>How was working with Claw Point? A few honest words help other investors.</p></div>
			<fieldset className="rv-rate" onMouseLeave={() => setHover(0)}><legend>Your rating</legend>
				<div>{[1, 2, 3, 4, 5].map(i => <label key={i} className={i <= shown ? 'on' : ''} onMouseEnter={() => setHover(i)}>
					<input type="radio" name="rating" value={i} checked={rating === i} onChange={() => setRating(i)} required /><Star size={28} aria-hidden="true" /><span className="sr-only">{i} star{i > 1 ? 's' : ''}</span>
				</label>)}<span className="rv-rate-label">{label}</span></div>
			</fieldset>
			<div className="contact-row">
				<label>Name<input name="name" autoComplete="name" required maxLength={120} placeholder="How it should appear, e.g. Jordan P." /></label>
				<label><b className="rv-label">Email <i>(private)</i></b><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
			</div>
			<div className="contact-row">
				<label><b className="rv-label">Role or company <i>(optional)</i></b><input name="role" maxLength={120} placeholder="e.g. Wholesaler, Houston" /></label>
				<label><b className="rv-label">Deal type <i>(optional)</i></b><select name="deal" defaultValue=""><option value="">Choose one</option>{DEALS.map(d => <option key={d}>{d}</option>)}</select></label>
			</div>
			<label>Your review<textarea name="review" required minLength={10} maxLength={2000} rows={5} placeholder="What was the deal, how did it go, and how was the team to work with?" /></label>
			<label className="check-label"><input name="consent" type="checkbox" value="true" required /> Claw Point Advisory may publish my review, name and role on its website. My email stays private.</label>
			<button className="button" disabled={form.isSubmitting}><Send size={16} /> {form.isSubmitting ? 'Sending…' : 'Send review'}</button>
			{form.isError && <p role="alert" className="contact-error">We couldn’t send your review. Check your details and try again.</p>}
			{Object.entries(form.fieldErrors).map(([key, value]) => <p key={key} role="alert" className="contact-error">{key}: {value}</p>)}
		</>}
	</form>;
}
