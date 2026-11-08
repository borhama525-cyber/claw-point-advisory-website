import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, BookOpen, Calculator, CalendarCheck, Clock, Compass, FileCheck2, MessageSquare, Search } from 'lucide-react';
import { articles } from '@/data/articles';
import { dealTypes } from '@/data/deal-types';
import { faqs } from '@/data/faq';
import { RequestButton } from '@/components/request/request-provider';
import { openContactPanel } from '@/components/contact-panel';

const readTime = (body: string[]) => Math.max(2, Math.round(body.join(' ').split(/\s+/).length / 200));

const PATH = [
	{ icon: BookOpen, step: 'Step 1', h: 'Learn the basics', p: 'What transactional funding is, who it’s for and how money moves through title.', to: `/blog/${articles[0].slug}`, cta: 'Read the basics' },
	{ icon: Compass, step: 'Step 2', h: 'Pick your structure', p: 'Four ways to fund a deal. Find the one that matches how your deal closes.', to: '#structures', cta: 'Compare structures' },
	{ icon: Calculator, step: 'Step 3', h: 'Run your numbers', p: 'Use a free calculator to see the cash you need, or get back, at closing.', to: '/calculators', cta: 'Open calculators' },
	{ icon: FileCheck2, step: 'Step 4', h: 'Send your deal', p: 'Upload your contract and we review it. You get written terms before closing.', to: '', cta: 'Submit a deal' },
];

const GLOSSARY: [string, string][] = [
	['A–B / B–C', 'The two legs of a double close: you buy from the seller (A–B), then sell to your end buyer (B–C).'],
	['Spread', 'The difference between your purchase price and your resale price. It often repays short-term funding.'],
	['Seller carry', 'Part of the price the seller lets you pay later through a note, instead of in cash at closing.'],
	['EMD', 'Earnest money deposit: the good-faith money that secures a purchase contract.'],
	['Primary lender', 'The lender that funds the largest share of the purchase, in first position. Don’t have one? We can provide one.'],
	['ARV', 'After-repair value: what the property should be worth once the work is finished.'],
	['LTV / LTC', 'Loan-to-value and loan-to-cost: how big the loan is compared with the property’s value or the total project cost.'],
	['Title & escrow', 'The neutral company that holds funds, checks ownership and records the closing. Our funds only move through them.'],
];

const POPULAR = ['What is transactional funding?', 'Stack or Echo: which one fits my deal?', 'What documents do I need to submit a deal?', 'How are funds sent and repaid?'];

/** The Learn page: a guided path, structure guides, articles, a glossary and popular questions. */
export function LearnHub() {
	const [term, setTerm] = useState('');
	const q = term.trim().toLowerCase();
	const terms = GLOSSARY.filter(([k, v]) => !q || `${k} ${v}`.toLowerCase().includes(q));
	const [lead, ...rest] = articles;
	return <>
		<section className="band learn-path">
			<div className="learn-wrap">
				<div className="learn-head"><p className="eyebrow">START HERE</p><h2>New to funding? <em>Four steps.</em></h2><p>Follow the path from first question to funded deal. Each step takes a few minutes.</p></div>
				<ol className="learn-steps">{PATH.map(({ icon: Icon, step, h, p, to, cta }) => <li key={h}>
					<span className="learn-step-icon"><Icon size={20} /></span>
					<small>{step}</small><h3>{h}</h3><p>{p}</p>
					{to ? (to.startsWith('#') ? <a href={to} className="learn-link">{cta} <ArrowRight size={15} /></a> : <Link to={to} className="learn-link">{cta} <ArrowRight size={15} /></Link>)
						: <RequestButton className="learn-link">{cta} <ArrowRight size={15} /></RequestButton>}
				</li>)}</ol>
			</div>
		</section>

		<section className="band learn-structures" id="structures">
			<div className="learn-wrap">
				<div className="learn-head row"><div><p className="eyebrow">FUNDING STRUCTURES</p><h2>Four structures, <em>explained.</em></h2></div><p>Each one solves a different cash gap. Read the guide, try the calculator, then send it over.</p></div>
				<div className="learn-structure-grid">{dealTypes.map(d => <article key={d.slug} className="learn-structure">
					<p className="eyebrow">{d.eyebrow}</p><h3>{d.name}</h3><p>{d.card}</p>
					<div className="learn-structure-links">
						{d.guide ? <Link to={d.guide} className="button small">Read the guide <ArrowUpRight size={15} /></Link> : <RequestButton slug={d.slug} className="button small">Get funded <ArrowUpRight size={15} /></RequestButton>}
						{d.calculator ? <Link to={d.calculator} className="learn-link"><Calculator size={15} /> Calculator</Link> : <Link to="/funding" className="learn-link">How it works</Link>}
					</div>
				</article>)}</div>
			</div>
		</section>

		<section className="band learn-articles">
			<div className="learn-wrap">
				<div className="learn-head"><p className="eyebrow">ARTICLES</p><h2>Notes from the <em>closing table.</em></h2></div>
				<div className="learn-article-grid">
					<Link to={`/blog/${lead.slug}`} className="learn-article featured">
						<span className="learn-article-art" aria-hidden="true"><BookOpen size={34} /></span>
						<div><p className="eyebrow">{lead.category} · <Clock size={12} /> {readTime(lead.body)} min read</p><h3>{lead.title}</h3><p>{lead.excerpt}</p><span className="learn-link">Read article <ArrowRight size={15} /></span></div>
					</Link>
					{rest.map(a => <Link to={`/blog/${a.slug}`} key={a.slug} className="learn-article">
						<p className="eyebrow">{a.category} · <Clock size={12} /> {readTime(a.body)} min read</p><h3>{a.title}</h3><p>{a.excerpt}</p><span className="learn-link">Read article <ArrowRight size={15} /></span>
					</Link>)}
				</div>
			</div>
		</section>

		<section className="band learn-glossary">
			<div className="learn-wrap">
				<div className="learn-head row"><div><p className="eyebrow">GLOSSARY</p><h2>Speak the <em>language.</em></h2></div>
					<label className="learn-search"><Search size={17} /><span className="sr-only">Search the glossary</span><input type="search" value={term} onChange={e => setTerm(e.target.value)} placeholder="Search a term, like spread" /></label></div>
				<dl className="learn-terms">{terms.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
				{terms.length === 0 && <p className="learn-empty">No term matches “{term}”. Try the <Link to="/ask">question library</Link> instead.</p>}
			</div>
		</section>

		<section className="band learn-popular">
			<div className="learn-wrap learn-popular-grid">
				<div><p className="eyebrow">POPULAR QUESTIONS</p><h2>Quick <em>answers.</em></h2><p>Short, plain answers to what investors ask us most. The full library has {faqs.length} questions and answers.</p><Link to="/ask" className="button small">Browse all questions <ArrowUpRight size={15} /></Link></div>
				<ul>{POPULAR.map(t => <li key={t}><Link to={`/ask?q=${encodeURIComponent(t)}`}><span>{t}</span><ArrowUpRight size={17} /></Link></li>)}</ul>
			</div>
		</section>

		<section className="band learn-cta">
			<div className="learn-wrap learn-cta-card">
				<div><h2>Still deciding? <em>Talk it through.</em></h2><p>Book a short call with Amira or Adam, or text the team. We’ll tell you which structure fits.</p></div>
				<div className="learn-cta-actions"><Link to="/booking" className="button"><CalendarCheck size={17} /> Book a call</Link><button type="button" className="button outline" onClick={openContactPanel}><MessageSquare size={17} /> Text the team</button></div>
			</div>
		</section>
	</>;
}
