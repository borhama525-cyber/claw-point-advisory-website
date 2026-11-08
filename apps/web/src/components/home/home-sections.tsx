import { SkyClouds } from '@/components/sky-clouds';
import { Link } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { dealTypes } from '@/data/deal-types';
import { toolBySlug } from '@/data/deal-tools';
import { ToolCalculator } from '@/components/calculators/tool-calculator';
import { RequestButton, useRequest } from '@/components/request/request-provider';
import { DealIcon } from '@/components/request/deal-icon';
import { openContactPanel } from '@/components/contact-panel';
import { LenderNote } from '@/components/lender-note';

export function HomeHero() {
	return <section className="hero home-hero"><SkyClouds /><div className="hero-inner">
		<div className="hero-copy">
			<h1>Get your deal<br /><em>moving.</em></h1>
			<p>Short-term capital for Stack Method, Echo, double close and EMD deals. No primary lender? We can provide one. Run the numbers, pick your structure and send it to a team that reviews every file.</p>
			<div className="hero-buttons"><RequestButton>Get funded →</RequestButton><a href="#deal-types" className="button outline">Explore deal types</a></div>
			<p className="fine-print">Every transaction is individually reviewed. No funding commitment is made on this website.</p>
		</div>
		<div className="hero-tool"><ToolCalculator tool={toolBySlug('stack')!} /><Link className="text-link dark hero-tool-link" to="/calculators">Explore all deal calculators →</Link></div>
	</div></section>;
}

const TICKER = ['Stack Method', 'Echo Method', 'Double close', 'EMD funding', 'Primary lender available', 'All asset types', 'Single family', 'Multifamily', 'Commercial', 'Industrial', 'Land', 'Funds only through escrow', 'Written terms before closing', 'Every file reviewed by a person', 'Free deal calculators'];

export function Ticker() {
	const items = [...TICKER, ...TICKER];
	return <div className="ticker" aria-label={TICKER.join(', ')}><div className="ticker-track" aria-hidden="true">{items.map((t, i) => <span key={i}>{t}</span>)}</div></div>;
}

export function WhyBento() {
	return <section className="band why-band"><div className="tool-wrap">
		<p className="eyebrow">WHY CLAW POINT</p>
		<h2 className="why-title">Built for creative deals.<br />Reviewed like a lender.</h2>
		<div className="bento">
			<div className="bento-tile bento-feature"><strong>$400M</strong><span>Funded since ’24</span></div>
			<div className="bento-tile"><strong>567</strong><span>Deals completed</span></div>
			<div className="bento-tile bento-dark"><h3>A person on every file</h3><p>Every request is reviewed by our team, not scored by a form, and you get written terms before anything closes.</p><span className="bento-mark" aria-hidden="true">C</span></div>
			<div className="bento-tile"><strong>200+</strong><span>Happy borrowers</span></div>
			<div className="bento-tile"><strong>6</strong><span>Funding structures</span></div>
			<div className="bento-tile bento-wide"><h3>The Claw Point standard.</h3><ul>{['Written terms before closing', 'Funds move only through title and escrow', 'Lender and title checked first', 'A real person on every file'].map(t => <li key={t}><Check size={15} />{t}</li>)}</ul></div>
		</div>
	</div></section>;
}

export function DealTypesGrid() {
	const { openDetails, openRequest } = useRequest();
	return <section className="band deal-types" id="deal-types"><div className="tool-wrap">
		<div className="deal-types-head"><div><p className="eyebrow">DEAL TYPES</p><h2>Four ways to get funded.</h2><p>Each structure has its own guide: what it is, when to use it, and how we fund it. Learn it, then start your request.</p></div><RequestButton className="button small">Get funded →</RequestButton></div>
		<div className="tool-cards">{dealTypes.map(d => <article key={d.slug} className="tool-tile deal-tile">
			<DealIcon slug={d.slug} /><h3>{d.name}</h3><p>{d.card}</p>
			<div className="deal-tile-actions"><button type="button" className="button small outline" onClick={() => openDetails(d.slug)}>Learn more</button><button type="button" className="button small" onClick={() => openRequest(d.slug)}>Start →</button></div>
		</article>)}</div>
		<LenderNote />
	</div></section>;
}

export function CommunityCards() {
	return <section className="band community-band"><div className="tool-wrap">
		<p className="eyebrow">TALK TO US · LEARN THE PLAYBOOK</p>
		<h2>Don’t just get funded. Get it right.</h2>
		<div className="community-grid">
			<div className="community-card dark"><p className="eyebrow">TALK IT THROUGH</p><h3>Not sure which structure fits?</h3><p>Book a short call or text the team. We’ll look at your numbers and tell you which structure suits the deal, or whether it needs restructuring first.</p><div className="hero-buttons"><Link className="button small" to="/booking">Book a call →</Link><button type="button" className="text-link" onClick={openContactPanel}>Text the team <ArrowRight size={15} /></button></div></div>
			<div className="community-card bright"><p className="eyebrow">THE PLAYBOOK · FREE</p><h3>Guides for every structure.</h3><p>Plain-English breakdowns with worked examples, the rules that decide each deal and the documents you’ll need.</p><div className="community-links">{dealTypes.filter(d => d.guide).map(d => <Link key={d.slug} to={d.guide!}>{d.name} guide →</Link>)}</div></div>
		</div>
	</div></section>;
}
