import { Link } from 'react-router';
import { ArrowRight, Banknote, Building2, Check, FileText, Landmark, MessageSquare, Plus, ShieldCheck } from 'lucide-react';
import { RequestButton } from '@/components/request/request-provider';

const FLOW = [
	{ icon: Building2, title: 'You buy the property', text: 'Our short-term capital funds the purchase leg, or the gap in it, of a transaction where the exit is already planned.' },
	{ icon: Landmark, title: 'Funds go to title', text: 'Money is only ever wired to the title or escrow company, under disbursement instructions agreed before anything moves.' },
	{ icon: Banknote, title: 'Repaid at closing', text: 'Repayment comes from the onward sale, the seller carry or the spread, on the settlement statement, often the same day.' },
];

const BRING = ['Property address and transaction structure', 'Purchase and resale agreements, if available', 'Proposed closing dates and funding requirement', 'Closing agent’s details and planned repayment source'];

const FAQ: [string, React.ReactNode][] = [
	['How much do you charge?', <>Every deal is priced individually. It depends on the structure, the amount and the timeline, and your exact costs come in your written terms before closing. A couple of guidelines:<br />• EMD funding starts at $7,000 (the smallest EMD amount we fund).<br />• Double closes under $150,000 have a fixed $1,500 fee, paid at closing.</>],
	['What qualifies as transactional funding?', 'A double closing is a real estate transaction method where two back-to-back property sales occur on the same day, involving three parties: the original seller, the investor (middleman), and the end buyer. The investor agrees to purchase the property from the original seller, then simultaneously sells it to the end buyer at a higher price, using the end buyer’s funds to complete the purchase. This allows the investor to profit from the difference without using their own funds for an extended period.'],
	['Can you fund EMD for end buyers?', 'We can, but it’s rare. Our funds have to be protected no matter what, typically through a refundable period (inspection period). If your deal has no inspection period or the EMD is non-refundable, we will not fund it. We will provide the proper addendums for your purchase contract to keep our funds safe and your deal moving forward.'],
	['Is there a max amount you can fund?', 'There is no limit on the funds available for EMD, Double Closings, or Stack Method deals. As long as your deal qualifies under our standards, we can be your one-stop shop for all transactional funding.'],
	['How quickly can we get our deal funded?', 'We typically require 48 hours of notice to fund a deal, however we have funded in as quickly as 5 minutes. If you have a deal, submit it as soon as possible so we can review it and get the process started.'],
	['What happens if the deal doesn’t close?', 'If your deal does not close, we do not charge the transaction fees. Your only cost would be any non-refundable up-front fees, since the work has already been done to put funds aside or fund your deal.'],
	['What is your role in a Stack Method deal?', 'As your 3rd party funding partner we: ensure we meet your primary lender’s down payment sourcing and seasoning requirements; protect our funds throughout the transaction; bring the down payment funds to close with your primary lender; ensure Title is a party to our irrevocable disbursement instructions; record and disburse funds with our in-house attorney; and handle TC, account setup, contracts & security docs, Title coordination, Seller note recording, and more.'],
	['Are rates or funding amounts guaranteed?', 'No. Eligibility, amounts, fees and funding timing depend on an individual review and written agreement. No specific terms are offered on this website.'],
	['How do I make a payment?', 'Only pay an applicable service or transaction amount once it has been agreed in writing. Payment instructions are included with your written terms. A consultation booking is not a funding disbursement.'],
];

export function FundingDetails() {
	return <>
		<section className="band fd-flow-band"><div className="tool-wrap">
			<div className="fd-head"><p className="eyebrow">HOW IT WORKS</p><h2>The deal drives <em>the conversation.</em></h2><p>Transactional funding supports the purchase leg of a real estate transaction where an onward sale or exit is already planned. Repayment is intended to come from that exit.</p></div>
			<ol className="fd-flow">{FLOW.map(({ icon: Icon, title, text }, i) => <li key={title} style={{ animationDelay: `${i * 90}ms` }}><span className="fd-step">{String(i + 1).padStart(2, '0')}</span><span className="tool-icon"><Icon size={18} /></span><h3>{title}</h3><p>{text}</p></li>)}</ol>
			<div className="fd-cards">
				<article className="fd-card">
					<h3>What it is, and what it isn’t</h3>
					<div className="fd-compare"><div><strong><Check size={15} /> It is</strong><p>Short-term capital tied to one transaction, with timing and a clear exit at the center of the review.</p></div><div><strong className="muted">✕ It isn’t</strong><p>A mortgage, renovation loan or long-term investment loan.</p></div></div>
				</article>
				<article className="fd-card fd-bring">
					<h3>What to bring to an inquiry</h3>
					<ul>{BRING.map(b => <li key={b}><FileText size={15} />{b}</li>)}</ul>
					<p className="fd-note"><ShieldCheck size={14} />Please don’t send account numbers or confidential identity documents through the inquiry form or chat.</p>
				</article>
			</div>
		</div></section>
		<section className="band fd-faq-band"><div className="tool-wrap fd-faq-grid">
			<aside className="fd-faq-side"><p className="eyebrow">QUESTIONS</p><h2>Before you <em>move forward.</em></h2><p>The answers borrowers ask for most. Can’t find yours?</p>
				<div className="fd-help"><MessageSquare size={18} /><div><strong>Talk to the team</strong><span>Book a call or send your deal for review.</span></div></div>
				<div className="hero-buttons"><RequestButton className="button small">Get funded →</RequestButton><Link className="button small outline" to="/booking">Book a call</Link></div>
			</aside>
			<div className="fd-faq">{FAQ.map(([q, a]) => <details key={q}><summary><span>{q}</span><Plus size={18} className="fd-plus" /></summary><div className="fd-answer"><p>{a}</p></div></details>)}</div>
		</div></section>
	</>;
}

export function FundingHeroActions() {
	return <><RequestButton>Get funded →</RequestButton><Link to="/calculators" className="button outline">Run the numbers <ArrowRight size={16} /></Link></>;
}
