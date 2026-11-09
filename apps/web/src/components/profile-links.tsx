import { Facebook, Linkedin } from 'lucide-react';
import type { TEAM } from '@/constants/site';

const ICONS = { Facebook, LinkedIn: Linkedin } as const;

/** One teammate's social profile buttons (Facebook, LinkedIn). `labels` shows the network name next to each icon. */
export function ProfileLinks({ person, labels = false, className = 'profile-links' }: { person: (typeof TEAM)[number]; labels?: boolean; className?: string }) {
	return <span className={className}>{person.profiles.map(l => {
		const Icon = ICONS[l.name as keyof typeof ICONS];
		return <a key={l.name} className={labels ? 'button small outline profile-link' : 'profile-icon'} href={l.url} target="_blank" rel="noopener me" aria-label={`${person.fullName} on ${l.name}`} title={`${person.fullName} on ${l.name}`}><Icon size={15} aria-hidden="true" />{labels && l.name}</a>;
	})}</span>;
}
