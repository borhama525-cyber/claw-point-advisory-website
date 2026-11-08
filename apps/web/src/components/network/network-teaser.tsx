import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { NETWORK_ROLES } from '@/components/network/network-form';

/** Home page invitation to join the network list. */
export function NetworkTeaser() {
	return <section className="band network-teaser"><div className="learn-wrap network-teaser-card">
		<div><p className="eyebrow">NETWORK WITH US</p><h2>Let’s do more deals <em>together.</em></h2><p>TCs, brokers, family offices, buyers, developers and wholesalers: join the network and we’ll get to know how to work together.</p></div>
		<div className="network-teaser-side">
			<div className="network-chips">{NETWORK_ROLES.filter(r => r.label !== 'Other').slice(0, 8).map(({ label, icon: Icon }) => <span key={label}><Icon size={14} /> {label}</span>)}<span>and more</span></div>
			<Link to="/network" className="button">Join the network <ArrowRight size={16} /></Link>
		</div>
	</div></section>;
}
