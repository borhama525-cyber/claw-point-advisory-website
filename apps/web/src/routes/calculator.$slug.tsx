import { Link } from 'react-router';
import type { Route } from './+types/calculator.$slug';
import { seo } from '@/lib/seo';
import { toolBySlug } from '@/data/deal-tools';
import { ToolCalculator } from '@/components/calculators/tool-calculator';
import { RequestButton } from '@/components/request/request-provider';
import { OtherTools, ToolCta, ToolHero } from '@/components/calculators/tool-sections';
export function loader({params}:Route.LoaderArgs){if(!toolBySlug(params.slug))throw new Response('Calculator not found',{status:404});return {slug:params.slug};}
export function meta({matches,location,loaderData}:Route.MetaArgs){const t=toolBySlug(loaderData?.slug);return seo({matches,location},{title:t?`${t.title} | Claw Point Advisory`:'Calculator not found',description:t?`${t.lead} Free, editable ${t.name} estimates from Claw Point Advisory.`:'This calculator is not available.'});}
export default function CalculatorPage({loaderData}:Route.ComponentProps){
 const t=toolBySlug(loaderData.slug)!;
 return <><ToolHero eyebrow="DEAL TOOLS" title={t.title} lead={t.lead}><RequestButton slug={t.slug}>{t.request}</RequestButton><Link to={t.method} className="button outline">{t.question}</Link></ToolHero>
 <section className="band tool-page"><div className="tool-wrap tool-column">
  <ToolCalculator key={t.slug} tool={t}/><p className="fine-print tc-below">Estimates only. Exact figures come with your written terms.</p>
  <article className="tool-explain"><h2>What this calculator tells you</h2>{t.explain.map(p=><p key={p}>{p}</p>)}<h3>How to use it</h3><ul>{t.steps.map(s=><li key={s}>{s}</li>)}</ul><p className="fine-print">{t.assumption}</p><p>Want the full picture? Read the <Link className="inline-link" to={t.method}>{t.name} guide</Link> or <Link className="inline-link" to="/contact">ask our team</Link>. When the numbers work, press <strong>Submit this deal</strong>: the request form is pre-filled from your calculator inputs.</p><OtherTools current={t.slug}/></article>
 </div></section><ToolCta label={t.request} slug={t.slug}/></>;
}
