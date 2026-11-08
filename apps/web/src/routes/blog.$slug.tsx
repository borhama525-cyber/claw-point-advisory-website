import type { Route } from './+types/blog.$slug';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { articles } from '@/data/articles';
import { ArticleBody } from '@/components/blog/article-body';
export function loader({params}:Route.LoaderArgs){const article=articles.find(a=>a.slug===params.slug);if(!article)throw new Response('Article not found',{status:404});return {article};}
export function meta({matches,location,loaderData}:Route.MetaArgs){return seo({matches,location},{title:loaderData?.article.title||'Article not found',description:loaderData?.article.excerpt||'This article is not available.',image:siteImage,type:'article',jsonLd:loaderData?{'@context':'https://schema.org','@type':'Article',headline:loaderData.article.title,datePublished:'2026-11-07',author:{'@type':'Organization',name:'Claw Point Advisory'}}:undefined});}
export default function Article({loaderData}:Route.ComponentProps){return <ArticleBody article={loaderData.article}/>;}
