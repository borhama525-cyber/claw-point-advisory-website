import { ArrowLeftRight, Hammer, House, Layers, Repeat2, ShieldCheck } from 'lucide-react';

const icons = { stack: Layers, echo: Repeat2, 'double-close': ArrowLeftRight, emd: ShieldCheck, 'hard-money': Hammer, dscr: House } as const;

export function DealIcon({ slug, size = 18 }: { slug: string; size?: number }) {
	const Icon = icons[slug as keyof typeof icons] ?? Layers;
	return <span className="tool-icon" aria-hidden="true"><Icon size={size} /></span>;
}
