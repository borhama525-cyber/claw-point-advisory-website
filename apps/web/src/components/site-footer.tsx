import { BrandFace } from '@/components/brand-face';
import { Link } from 'react-router';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { dealTypes } from '@/data/deal-types';
import { useRequest } from '@/components/request/request-provider';
import { TEAM } from '@/constants/site';
export function SiteFooter(){const {openDetails}=useRequest();return <footer className="site-footer"><div className="footer-grid"><div className="footer-brand"><Link className="brand brand-with-cube" to="/"><BrandFace size={58}/><span className="brand-word">Claw Point<small>ADVISORY</small></span></Link><p>Real estate moves.<br/>Let’s move with it.</p></div>
<nav aria-label="Funding"><h3>Funding</h3>{dealTypes.map(d=>d.guide?<Link key={d.slug} to={d.guide}>{d.name}</Link>:<button key={d.slug} type="button" onClick={()=>openDetails(d.slug)}>{d.name}</button>)}</nav>
<nav aria-label="Tools"><h3>Tools</h3><Link to="/calculators">All calculators</Link><Link to="/calculators/stack">Stack Method Calculator</Link><Link to="/calculators/echo">Echo Calculator</Link></nav>
<nav aria-label="Company"><h3>Company</h3><Link to="/funding">How funding works</Link><Link to="/blog">Insights</Link><Link to="/ask">Ask</Link></nav>
<nav aria-label="Contact"><h3>Contact</h3><Link to="/booking">Schedule with Amira</Link><Link to="/contact">Make an enquiry</Link>{TEAM.map(p=><a key={p.name} href={`sms:${p.e164}`}>Text {p.name} {p.display}</a>)}<a href="mailto:clawpointadvisory@gmail.com">clawpointadvisory@gmail.com</a><span className="footer-note">Please text or schedule before calling.</span></nav></div>
<div className="footer-bottom"><span>© 2026 Claw Point Advisory</span><span>Transactional funding for real estate investors. Subject to transaction review. No funding commitment is made on this website.</span><button onClick={openCookiePreferences}>Cookie settings</button></div></footer>;}
