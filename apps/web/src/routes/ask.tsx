import { useSearchParams } from 'react-router';
import type { Route } from './+types/ask';
import { seo } from '@/lib/seo';
import { AskPanel } from '@/components/ask/ask-panel';
import { SkyClouds } from '@/components/sky-clouds';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Ask Claw Point: Funding & Underwriting Questions | Claw Point Advisory',description:'Ask general questions about transactional funding, double closes, EMD, the Stack and Echo methods and loan underwriting, and get plain-English answers.'});}
export default function Ask(){const [params]=useSearchParams();return <section className="ask-page sky-bloom"><SkyClouds /><AskPanel initialQuestion={params.get('q')??undefined}/></section>;}
