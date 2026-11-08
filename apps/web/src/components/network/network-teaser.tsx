import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { networkGroups } from '@/data/network';

const PICKS = ['Title company', 'Escrow company', 'Real estate attorney', 'Transaction coordinator (TC)', 'Family office', 'Private lender', 'Developer', 'Commercial broker', 'Wholesaler', 'Land wholesaler'];

/** Home page invitation to join the network list. */
export function NetworkTeaser() {
	const iconFor = (r: string) => networkGroups.find(g => g.roles.includes(r))?.icon;
	return <section className="band network-teaser"><div className="learn-wrap network-teaser-card">
		<div><p className="eyebrow">NETWORK WITH US</p><h2>Let’s do more deals <em>together.</em></h2><p>Title and escrow, attorneys, TCs, brokers, family offices, lenders, developers and wholesalers: join the network and we’ll get to know how to work together.</p></div>
		<div className="network-teaser-side">
			<div className="network-chips">{PICKS.map(label => { const Icon = iconFor(label); return <span key={label}>{Icon && <Icon size={14} />} {label}</span>; })}<span>and more</span></div>
			<Link to="/network" className="button">Join the network <ArrowRight size={16} /></Link>
		</div>
	</div></section>;
}
