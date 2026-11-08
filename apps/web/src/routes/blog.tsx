import type { Route } from './+types/blog';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { LearnHub } from '@/components/blog/learn-hub';
import { Newsletter } from '@/components/newsletter';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Learn Transactional Funding & Creative Finance | Claw Point Advisory',description:'Read practical guides to real estate transactional funding, double closings and preparing your deal. Clear information for your next funding conversation.',image:siteImage,jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name:'Funding insights'}});}
export default function Blog(){return <><PageHeading index="LEARN" title="Learn the playbook." text="Plain-English guides to transactional funding and creative finance. Learn how each structure works, run the numbers, then send us your deal."/><LearnHub/><Newsletter/></>;}
