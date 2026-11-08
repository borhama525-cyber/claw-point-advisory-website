import type { Route } from './+types/network';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { NetworkForm, NetworkGroups, NetworkHero, NetworkSteps } from '@/components/network/network-form';
import { TipDrop } from '@/components/network/tip-drop';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Network With Us | Claw Point Advisory',description:'Join the Claw Point Advisory network: title and escrow companies, attorneys, TCs, agents and brokers, family offices, buyers, lenders, developers and wholesalers.',image:siteImage});}
export default function Network(){return <><NetworkHero/><TipDrop/><NetworkGroups/><NetworkSteps/><NetworkForm/></>;}
