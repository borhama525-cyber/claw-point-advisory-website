import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { articles } from '@/data/articles';
import { RequestButton } from '@/components/request/request-provider';

/** Rough reading time: about 200 words a minute, never under one minute. */
const readingMinutes = (article: (typeof articles)[number]) =>
	Math.max(1, Math.round(article.body.join(' ').split(/\s+/).length / 200));

export function ArticleBody({article}:{article:(typeof articles)[number]}){
	const more=articles.filter(a=>a.slug!==article.slug);
	return <>
		<section className="page-heading article-heading">
			<nav className="article-crumbs" aria-label="Breadcrumb"><Link to="/blog">Learn</Link><span aria-hidden="true">/</span><span>{article.category.toLowerCase()}</span></nav>
			<h1>{article.title}</h1>
			<p>{article.excerpt}</p>
			<div className="article-meta"><span><CalendarDays size={15} aria-hidden="true"/>{article.date}</span><span><Clock size={15} aria-hidden="true"/>{readingMinutes(article)} min read</span></div>
		</section>
		<div className="article-layout">
			<article className="article-body">
				{article.body.map(p=><p key={p}>{p}</p>)}
				<Link className="text-link dark" to="/blog">← Back to all guides</Link>
			</article>
			<aside className="article-aside" aria-label="Talk to the team">
				<p className="eyebrow">HAVE A DEAL IN MIND?</p>
				<h2>Send it to a team that reviews every file.</h2>
				<p>Share the property and both closings. A real person reviews it and you get written terms before anything closes.</p>
				<RequestButton>Get funded <ArrowRight size={16} aria-hidden="true"/></RequestButton>
				<Link className="button outline" to="/booking">Book a call <ArrowUpRight size={16} aria-hidden="true"/></Link>
			</aside>
		</div>
		{more.length>0&&<section className="article-more" aria-labelledby="more-guides"><h2 id="more-guides">Keep reading</h2><div className="article-more-grid">{more.map(a=><Link key={a.slug} className="article-more-card" to={`/blog/${a.slug}`}><p className="eyebrow">{a.category}</p><h3>{a.title}</h3><p>{a.excerpt}</p><span>Read the guide <ArrowRight size={15} aria-hidden="true"/></span></Link>)}</div></section>}
	</>;
}
