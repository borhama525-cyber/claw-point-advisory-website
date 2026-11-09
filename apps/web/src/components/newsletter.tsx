import { ArrowRight, BellRing, Check, MailCheck } from 'lucide-react';
import { sendForm } from '@/lib/send-form';
import { useFormSubmission } from '@/hooks/use-form-submission';

/** Newsletter sign-up: saved to the Website Leads tab, and send.php emails the subscriber a welcome email. */
export function Newsletter(){
	const form=useFormSubmission({submit:(_v,data)=>sendForm('newsletter', data)});
	return <section className="newsletter">
		<div className="newsletter-copy">
			<p className="eyebrow">STAY IN THE KNOW</p>
			<h2>Good deals start with<br/>better information.</h2>
			<p>Real estate funding insights and Claw Point updates, straight to your inbox.</p>
			<ul className="newsletter-perks">
				<li><Check size={16}/>Funding tips for EMD, double close, Echo and Stack deals</li>
				<li><Check size={16}/>New guides and calculators first</li>
				<li><Check size={16}/>No spam. Unsubscribe anytime</li>
			</ul>
		</div>
		<div className="newsletter-card">
			{form.isSuccess
				? <div className="newsletter-done" role="status"><MailCheck size={30}/><p className="newsletter-card-title">You’re on the list.</p><p>Check your inbox: a welcome email from Amira &amp; Adam is on its way.</p></div>
				: <form onSubmit={form.onSubmit} className="newsletter-form">
					<p className="newsletter-card-title"><BellRing size={18}/>Join the Claw Point list</p>
					<input {...form.honeypotProps}/>
					<label>First name <span>(optional)</span><input name="first_name" autoComplete="given-name" placeholder="Your first name"/></label>
					<label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@company.com"/></label>
					<label className="check-label"><input type="checkbox" name="consent" value="true" required/> I agree to receive email updates from Claw Point Advisory. My details stay private.</label>
					<button className="button" disabled={form.isSubmitting}>{form.isSubmitting?'Signing you up…':<>Sign up <ArrowRight size={16}/></>}</button>
					{form.isError&&<p role="alert">Could not save your sign-up. Please try again.</p>}
				</form>}
		</div>
	</section>;
}
