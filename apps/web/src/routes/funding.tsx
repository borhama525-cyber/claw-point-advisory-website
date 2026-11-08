import type { Route } from './+types/funding';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { ToolCta, ToolHero } from '@/components/calculators/tool-sections';
import { FundingDetails, FundingHeroActions } from '@/components/funding/funding-details';
import { DealTypesGrid } from '@/components/home/home-sections';
import { Process } from '@/components/home/process';
import { NationwideMap } from '@/components/nationwide-map';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'How Transactional Funding Works | Claw Point Advisory',description:'Learn how transactional funding supports a planned purchase and onward sale, what information to prepare, and why every real estate deal needs individual review.',image:siteImage,jsonLd:{'@context':'https://schema.org','@type':'Service',name:'Real estate transactional funding',provider:{'@type':'Organization',name:'Claw Point Advisory'}}});}
export default function Funding(){return <><ToolHero eyebrow="FUNDING" title="Capital for the closing in between." lead="Understand the funding. Prepare the transaction. Start with a straightforward conversation."><FundingHeroActions/></ToolHero>
<div className="fd-trust"><div className="tool-wrap"><span>Funds move only through title & escrow</span><span>Written terms before closing</span><span>Every deal individually reviewed</span></div></div>
<FundingDetails/><NationwideMap/><DealTypesGrid/><Process/><ToolCta/></>;}
