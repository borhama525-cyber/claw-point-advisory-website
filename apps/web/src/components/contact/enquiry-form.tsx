import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, CalendarCheck, CheckCircle2, FileUp, Mail, MessageSquareText, PhoneOff, Send } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { TEAM, TEAM_EMAIL } from '@/constants/site';
import { RequestButton } from '@/components/request/request-provider';
import { celebrate } from '@/components/brand-face';

const TOPICS = ['A deal I want funded', 'Which structure fits my deal', 'Loan underwriting question', 'Partnership or referral', 'Something else'];

const NEXT = [
	['We read it', 'A real person on the team reads every message.'],
	['We reply', 'You hear back by email or text, with questions or next steps.'],
	['You decide', 'If it’s a fit, you get written terms before anything closes.'],
];

/** The contact page: three ways to reach us, the team's details and the enquiry form. */
export function EnquiryForm() {
	const form = useFormSubmission({ submit: (_v, data) => sendForm('enquiry', data), resetOnSuccess: true });
	const [topic, setTopic] = useState(TOPICS[0]);
	useEffect(() => { if (form.isSuccess) celebrate(); }, [form.isSuccess]);
	return <>
		<section className="band contact-ways">
			<div className="learn-wrap contact-ways-grid">
				<RequestButton className="contact-way primary"><FileUp size={22} /><strong>Submit a deal</strong><span>Upload your contract and get it reviewed.</span><em>Start <ArrowUpRight size={15} /></em></RequestButton>
				<Link to="/booking" className="contact-way"><CalendarCheck size={22} /><strong>Book a call</strong><span>Pick a time with Amira on the calendar.</span><em>Schedule <ArrowUpRight size={15} /></em></Link>
				<a href={`mailto:${TEAM_EMAIL}`} className="contact-way"><Mail size={22} /><strong>Email us</strong><span>{TEAM_EMAIL}</span><em>Write <ArrowUpRight size={15} /></em></a>
			</div>
		</section>

		<section className="band contact-main">
			<div className="learn-wrap contact-main-grid">
				<aside className="contact-side">
					<p className="eyebrow">THE TEAM</p>
					<h2>Real people, <em>real replies.</em></h2>
					<ul className="contact-team">{TEAM.map(p => <li key={p.name}>
						<span className="contact-avatar" aria-hidden="true">{p.name[0]}</span>
						<div className="contact-who"><strong>{p.name}</strong><span>{p.display}</span></div>
						<a className="button small" href={`sms:${p.e164}`} aria-label={`Text ${p.name} at ${p.display}`}><MessageSquareText size={15} /> Text</a>
					</li>)}</ul>
					<p className="contact-warning"><PhoneOff size={16} /><span><strong>Please text or schedule before calling.</strong> Unscheduled calls are rejected automatically.</span></p>
					<div className="contact-next"><p className="eyebrow">WHAT HAPPENS NEXT</p>
						<ol>{NEXT.map(([h, t], i) => <li key={h}><span>{i + 1}</span><div><strong>{h}</strong><p>{t}</p></div></li>)}</ol>
					</div>
				</aside>

				<form className="contact-form" onSubmit={form.onSubmit}>
					<input {...form.honeypotProps} />
					{form.isSuccess ? <div className="contact-success" role="status">
						<CheckCircle2 size={40} />
						<h3>Message sent. <em>Thank you!</em></h3>
						<p>We’ve got your message and will reply by email or text. Have a deal ready? You can send it now.</p>
						<RequestButton className="button">Submit a deal <ArrowUpRight size={16} /></RequestButton>
					</div> : <>
						<div className="contact-form-head"><h3>Send us a message</h3><p>Tell us where you are and what you need. We’ll point you in the right direction.</p></div>
						<fieldset className="contact-topics"><legend>What can we help with?</legend>
							{TOPICS.map(t => <label key={t} className={topic === t ? 'on' : ''}><input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} />{t}</label>)}
						</fieldset>
						<div className="contact-row">
							<label>Full name<input name="name" autoComplete="name" required maxLength={200} placeholder="Your name" /></label>
							<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
						</div>
						<label>Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder="So we can text you back" /></label>
						<label>Your message<textarea name="message" required maxLength={5000} rows={5} placeholder="Property, closing date, how much funding you need and how it gets repaid…" /></label>
						<p className="contact-note">Please don’t include bank details, Social Security numbers or other sensitive information.</p>
						<label className="check-label"><input name="consent" type="checkbox" value="true" required /> I agree to be contacted about this message. It is kept private.</label>
						<button className="button" disabled={form.isSubmitting}><Send size={16} /> {form.isSubmitting ? 'Sending…' : 'Send message'}</button>
						{form.isError && <p role="alert" className="contact-error">We couldn’t send your message. Check your details and try again, or text us.</p>}
						{Object.entries(form.fieldErrors).map(([key, value]) => <p key={key} role="alert" className="contact-error">{key}: {value}</p>)}
					</>}
				</form>
			</div>
		</section>
	</>;
}
