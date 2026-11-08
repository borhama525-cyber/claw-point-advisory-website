import type { Route } from './+types/network';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { NetworkForm } from '@/components/network/network-form';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Network With Us | Claw Point Advisory',description:'Join the Claw Point Advisory network: transaction coordinators, brokers, commercial brokers, family offices, buyers, developers, wholesalers and land wholesalers.',image:siteImage});}
export default function Network(){return <><PageHeading index="NETWORK" title="Want to network with us?" text="TCs, brokers, commercial brokers, family offices, buyers, developers, wholesalers and land wholesalers: join our network and let’s do more deals together."/><NetworkForm/></>;}
