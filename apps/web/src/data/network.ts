import { Briefcase, Building2, ClipboardCheck, Handshake, Wrench, type LucideIcon } from 'lucide-react';

// Who can join the network list, grouped for the Network page.
// Keep the role names in step with NETWORK_ROLES in public/send.php.
export type NetworkGroup = { key: string; title: string; blurb: string; icon: LucideIcon; tone: string; roles: string[] };

export const networkGroups: NetworkGroup[] = [
	{ key: 'closing', title: 'Closing team', blurb: 'The people who get deals across the finish line.', icon: ClipboardCheck, tone: 'leaf',
		roles: ['Title company', 'Escrow company', 'Real estate attorney', 'Transaction coordinator (TC)', 'Closing agent / notary'] },
	{ key: 'capital', title: 'Buyers & capital', blurb: 'Buy boxes, lenders and capital looking for deals.', icon: Building2, tone: 'gold',
		roles: ['Buyer / investor', 'Institutional buyer', 'Family office', 'Fund / syndicator', 'Private lender', 'Hard money lender', 'Mortgage broker / loan officer', 'Developer', 'Builder'] },
	{ key: 'deals', title: 'Deal makers', blurb: 'The ones finding and moving the deals.', icon: Handshake, tone: 'coral',
		roles: ['Wholesaler', 'Land wholesaler', 'Creative finance / Subto investor', 'Acquisitions manager', 'Dispositions manager', 'Bird dog'] },
	{ key: 'brokers', title: 'Agents & brokers', blurb: 'Residential, commercial and land.', icon: Briefcase, tone: 'sky',
		roles: ['Real estate agent', 'Real estate broker', 'Commercial broker', 'Land broker', 'Business broker'] },
	{ key: 'services', title: 'Services', blurb: 'The pros every deal leans on.', icon: Wrench, tone: 'sage',
		roles: ['Property manager', 'General contractor', 'Appraiser', 'Inspector', 'Insurance agent', 'CPA / tax advisor'] },
];

export const allNetworkRoles = [...networkGroups.flatMap(g => g.roles), 'Other'];
