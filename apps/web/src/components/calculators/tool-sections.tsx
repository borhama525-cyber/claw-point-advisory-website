import { SkyClouds } from '@/components/sky-clouds';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Layers, Repeat2, Wrench } from 'lucide-react';
import { dealTools } from '@/data/deal-tools';
import { RequestButton } from '@/components/request/request-provider';

const icons: Record<string, ReactNode> = { stack: <Layers size={18} />, echo: <Repeat2 size={18} /> };

export function ToolHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children?: ReactNode }) {
	return <section className="tool-hero"><SkyClouds /><div className="tool-wrap"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lead}</p>{children && <div className="hero-buttons">{children}</div>}</div></section>;
}

export function ToolLibrary() {
	return <section className="tool-library band"><div className="tool-wrap">
		<h2>The deal tool library.</h2>
		<p className="tool-library-lead">Run your structure, adjust the estimates for your market and see whether the deal works before you talk to anyone. When the numbers look right, bring them to a conversation with our team.</p>
		<div className="tool-cards">
			{dealTools.map(t => <Link key={t.slug} to={`/calculators/${t.slug}`} className="tool-tile">
				<span className="tool-icon">{icons[t.slug]}</span><h3>{t.title}</h3><span className="tool-tag">{t.tag}</span><p>{t.card}</p><span className="tool-open">Open calculator <ArrowRight size={14} /></span>
			</Link>)}
			<div className="tool-tile soon"><span className="tool-icon"><Wrench size={18} /></span><h3>More tools on the way</h3><span className="tool-tag">COMING SOON</span><p>Double close and earnest money deposit calculators are in progress. Have a structure you would like modeled? Tell us.</p><Link to="/contact" className="tool-open muted">Suggest a tool</Link></div>
		</div>
		<p className="fine-print">Estimates only. Every transaction is individually reviewed, and no funding commitment is made on this website.</p>
	</div></section>;
}

export function ToolCta({ label = 'Get funded', slug }: { label?: string; slug?: string }) {
	return <section className="tool-cta-wrap"><div className="tool-cta"><h2>Have a deal? Let’s <em>move it.</em></h2><p>A short form for your deal type · Every transaction individually reviewed</p><RequestButton slug={slug} className="button small">{label}</RequestButton></div></section>;
}

export function OtherTools({ current }: { current: string }) {
	return <nav className="other-tools" aria-label="Other calculators"><Link to="/calculators">← All deal calculators</Link>{dealTools.filter(t => t.slug !== current).map(t => <Link key={t.slug} to={`/calculators/${t.slug}`}>{t.title}</Link>)}</nav>;
}
