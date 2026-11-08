import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import { calculate } from '@/lib/deal-math.mjs';
import { seo, type SeoArgs } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { fmt, toolBySlug } from '@/data/deal-tools';
import { guideBlocks, guideBySlug, type Block } from '@/data/method-guides';
import { ToolCta, ToolHero } from '@/components/calculators/tool-sections';
import { LenderNote } from '@/components/lender-note';
import { RequestButton } from '@/components/request/request-provider';

export const methodMeta = (slug: string) => (args: SeoArgs) => { const g = guideBySlug(slug); return seo(args, { title: g.metaTitle, description: g.description, image: siteImage, jsonLd: { '@context': 'https://schema.org', '@type': 'Service', name: g.title, provider: { '@type': 'Organization', name: 'Claw Point Advisory' } } }); };

/** Renders `**bold**` spans inside guide copy. */
const rich = (text: string): ReactNode => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));

function GuideBlock({ b, v, rows, calc, tool }: { b: Block; v: Record<string, number>; rows: Record<string, number | null>; calc: string; tool: string }) {
	const intro = 'intro' in b && b.intro ? <p>{rich(b.intro)}</p> : null;
	if (b.kind === 'text') return <section><h2>{b.h}</h2>{intro}{b.body.map(p => <p key={p}>{rich(p)}</p>)}</section>;
	if (b.kind === 'leads') return <section><h2>{b.h}</h2>{intro}{b.items.map(([lead, p]) => <p key={p}>{lead && <strong>{lead} </strong>}{rich(p)}</p>)}</section>;
	if (b.kind === 'pieces') return <section><h2>{b.h}</h2>{intro}<ol className="method-pieces">{b.items.map(([h, p], i) => <li key={h}><span>{String(i + 1).padStart(2, '0')}</span><div><strong className="piece-title">{h}</strong> {rich(p)}</div></li>)}</ol></section>;
	if (b.kind === 'bullets') return <section><h2>{b.h}</h2>{intro}<ul className="method-fit">{b.items.map(([lead, p]) => <li key={p}>{lead && <strong>{lead} </strong>}{rich(p)}</li>)}</ul></section>;
	if (b.kind === 'list') return <section><h2>{b.h}</h2>{intro}<ul className="method-fit">{b.items.map(p => <li key={p}>{rich(p)}</li>)}</ul></section>;
	if (b.kind === 'faq') return <section><h2>{b.h}</h2><div className="method-faq">{b.items.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{rich(a)}</p></article>)}</div></section>;
	return <section><h2>{b.h}</h2><dl className="method-math">{b.rows(v, rows).map(r => <div key={r.label} className={[r.strong && 'strong', r.sep && 'sep'].filter(Boolean).join(' ') || undefined}><dt>{r.label}</dt><dd>{r.format === 'ratio' ? (r.value == null ? 'Not available' : `${r.value.toFixed(2)}×`) : fmt(r.value)}{r.text}</dd></div>)}</dl><p>{rich(b.note)}</p><Link className="text-link dark" to={calc}>Run your own numbers in the {tool} →</Link></section>;
}

export function MethodPage({ slug }: { slug: string }) {
	const g = guideBySlug(slug), tool = toolBySlug(g.tool)!;
	const v = Object.fromEntries(tool.fields.map(f => [f.key, f.value]));
	const rows = Object.fromEntries(calculate(tool.kind, v).map(([label, n]) => [label, n]));
	const calc = `/calculators/${tool.slug}`;
	return <>
		<ToolHero eyebrow={g.eyebrow} title={g.title} lead={g.lead}><RequestButton slug={tool.slug}>{tool.request}</RequestButton><Link to={calc} className="button outline">{tool.title}</Link></ToolHero>
		<section className="band method-page"><div className="tool-wrap method-body">
			{guideBlocks(slug).map(b => <GuideBlock key={b.h} b={b} v={v} rows={rows} calc={calc} tool={tool.title} />)}
			<LenderNote slug={tool.slug} />
			<p className="fine-print">Every transaction is individually reviewed. No funding commitment is made on this website.</p>
			<Link className="text-link dark" to="/funding">← All funding structures</Link>
		</div></section>
		<ToolCta label={tool.request} slug={tool.slug} />
	</>;
}
