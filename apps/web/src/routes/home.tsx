import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { CommunityCards, DealTypesGrid, HomeHero, Ticker, WhyBento } from '@/components/home/home-sections';
import { Process } from '@/components/home/process';
import { ToolCta } from '@/components/calculators/tool-sections';
import { AskTeaser } from '@/components/ask/ask-panel';
import { NationwideMap } from '@/components/nationwide-map';
import { Newsletter } from '@/components/newsletter';
import { NetworkTeaser } from '@/components/network/network-teaser';
import { ReviewsSection } from '@/components/reviews/reviews';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Claw Point Advisory — Real Estate Transactional Funding',description:'Understand short-term real estate transactional funding. Discuss your deal, explore the closing process and book an introductory conversation with Claw Point.',image:siteImage,jsonLd:[{'@context':'https://schema.org','@type':'WebSite',name:'Claw Point Advisory'},{'@context':'https://schema.org','@type':'Organization',name:'Claw Point Advisory'}]});}
export default function HomePage(){return <><HomeHero/><Ticker/><WhyBento/><DealTypesGrid/><AskTeaser/><CommunityCards/><Process/><NationwideMap/><ReviewsSection/><NetworkTeaser/><ToolCta/><Newsletter/></>;}
