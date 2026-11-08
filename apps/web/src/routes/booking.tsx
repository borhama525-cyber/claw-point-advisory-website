import type { Route } from './+types/booking';
import { Link } from 'react-router';
import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import { CalendlyEmbed } from '@/components/booking/calendly-embed';
import { seo } from '@/lib/seo';
import { CALENDLY_URL, siteImage } from '@/constants/site';
import { RequestButton } from '@/components/request/request-provider';
export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://calendly.com' },
	{ rel: 'preconnect', href: 'https://assets.calendly.com' },
	{ rel: 'preload', href: 'https://assets.calendly.com/assets/external/widget.js', as: 'script' },
];
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Schedule with Amira | Claw Point Advisory',description:'Book a one-hour call with Amira to talk through your real estate goals, funding needs and deal structure before you submit a funding request.',image:siteImage});}
// Calendly's own title and duration are hidden because the panel beside it shows them. Colors apply on paid Calendly plans.
const embed=`${CALENDLY_URL}?hide_event_type_details=1&primary_color=b3feed&text_color=141a17&background_color=fbfdfc`;
const cover=['Your deal, your numbers and your timeline','Which structure fits: Stack, Echo, double close or EMD, and whether you need a primary lender','What we’d need to review it, and the next steps'];
export default function Booking(){return <section className="booking-page sky-bloom"><div className="tool-wrap booking-layout">
 <aside className="booking-card booking-info">
  <p className="eyebrow">BOOK A CALL</p>
  <h1>Schedule with Amira</h1>
  <p className="booking-lead">A focused one-on-one conversation about your next deal, with no funding commitment.</p>
  <div className="booking-pills"><span><Clock size={15}/>1 hour</span><span><CalendarCheck size={15}/>Pick any open time</span></div>
  <h2>What we’ll cover</h2>
  <ul className="booking-list">{cover.map(c=><li key={c}>{c}</li>)}</ul>
  <h2>Before the call</h2>
  <ul className="booking-list"><li>Have the property address and purchase price handy</li><li>Run the numbers in our <Link className="inline-link" to="/calculators">deal calculators</Link></li></ul>
  <div className="booking-alt"><ShieldCheck size={16}/><span>Already under contract? Skip the call and <RequestButton className="booking-link">send your deal now</RequestButton>.</span></div>
 </aside>
 <div className="booking-card booking-calendar"><div className="booking-calendar-head"><span className="booking-step">1</span><div><strong>Choose a day and time</strong><small>Times show in your own time zone</small></div></div><CalendlyEmbed url={embed} title="Schedule with Amira: choose a time" /></div>
</div></section>;}
