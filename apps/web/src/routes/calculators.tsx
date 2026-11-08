import type { Route } from './+types/calculators';
import { seo } from '@/lib/seo';
import { ToolCta, ToolHero, ToolLibrary } from '@/components/calculators/tool-sections';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Real Estate Deal Calculators | Claw Point Advisory',description:'Free Stack Method and Echo calculators. Edit every assumption and see cash to close, cash back and your spread instantly.'});}
export default function Calculators(){return <><ToolHero eyebrow="DEAL TOOLS" title="Put numbers behind your next move." lead="Two calculators for the structuress we discuss most. Every field is editable, and every result comes with its assumptions."/><ToolLibrary/><ToolCta/></>;}
