import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { SITE_ORIGIN, SOCIAL_LINKS, TEAM, TEAM_EMAIL, siteImage } from '@/constants/site';
import { CommunityCards, DealTypesGrid, HomeHero, Ticker, WhyBento } from '@/components/home/home-sections';
import { Process } from '@/components/home/process';
import { ToolCta } from '@/components/calculators/tool-sections';
import { AskTeaser } from '@/components/ask/ask-panel';
import { NationwideMap } from '@/components/nationwide-map';
import { Newsletter } from '@/components/newsletter';
import { NetworkTeaser } from '@/components/network/network-teaser';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Claw Point Advisory — Real Estate Transactional Funding',description:'Understand short-term real estate transactional funding. Discuss your deal, explore the closing process and book an introductory conversation with Claw Point.',image:siteImage,jsonLd:[{'@context':'https://schema.org','@type':'WebSite',name:'Claw Point Advisory',url:SITE_ORIGIN},{'@context':'https://schema.org','@type':'FinancialService',name:'Claw Point Advisory',url:SITE_ORIGIN,logo:`${SITE_ORIGIN}/icon-512.png`,image:siteImage,description:'Short-term real estate transactional funding for Stack Method, Echo, double close and EMD deals, reviewed deal by deal.',email:TEAM_EMAIL,telephone:TEAM[0].phone?.e164,areaServed:{'@type':'Country',name:'United States'},knowsAbout:['Transactional funding','Double closing','EMD funding','Stack Method','Echo Method','Real estate underwriting'],founder:TEAM.filter(p=>p.owner).map(p=>({'@type':'Person',name:p.fullName,...(p.title?{jobTitle:p.title}:{}),worksFor:{'@type':'Organization',name:'Claw Point Advisory'},sameAs:p.profiles.map(l=>l.url)})),...(SOCIAL_LINKS.length?{sameAs:SOCIAL_LINKS.map(l=>l.url)}:{})}]});}
export default function HomePage(){return <><HomeHero/><Ticker/><WhyBento/><DealTypesGrid/><AskTeaser/><CommunityCards/><Process/><NationwideMap/><NetworkTeaser/><ToolCta/><Newsletter/></>;}
