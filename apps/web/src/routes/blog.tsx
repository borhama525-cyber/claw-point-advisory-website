import type { Route } from './+types/blog';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { ArticleList } from '@/components/blog/article-list';
import { Newsletter } from '@/components/newsletter';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Funding Insights & Closing Notes | Claw Point Advisory',description:'Read practical guides to real estate transactional funding, double closings and preparing your deal. Clear information for your next funding conversation.',image:siteImage,jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name:'Funding insights'}});}
export default function Blog(){return <><PageHeading index="03" title="Better informed. Better prepared." text="Funding basics, practical checklists and closing notes. Clarity for your next conversation."/><ArticleList/><Newsletter/></>;}
