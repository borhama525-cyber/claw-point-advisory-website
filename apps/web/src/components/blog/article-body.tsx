import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import type { articles } from '@/data/articles';
export function ArticleBody({article}:{article:(typeof articles)[number]}){return <article className="article-body"><p className="eyebrow">{article.category} / {article.date}</p><h1>{article.title}</h1><p className="lead">{article.excerpt}</p>{article.body.map(p=><p key={p}>{p}</p>)}<hr/><p>Have a transaction in mind?</p><Link className="button" to="/contact">Discuss your deal <ArrowUpRight/></Link><Link className="text-link dark" to="/blog">Back to all insights</Link></article>;}
