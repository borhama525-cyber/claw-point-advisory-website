import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { articles } from '@/data/articles';
export function ArticleList(){return <section className="band article-list">{articles.map((a,i)=><Link to={`/blog/${a.slug}`} className="article-row" key={a.slug}><span className="index-number">0{i+1}</span><div><p className="eyebrow">{a.category} · {a.date}</p><h2>{a.title}</h2><p>{a.excerpt}</p></div><ArrowUpRight/></Link>)}</section>;}
