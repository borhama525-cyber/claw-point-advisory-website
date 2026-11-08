import { createContext, Fragment, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, X } from 'lucide-react';
import { dealTypeBySlug, dealTypes } from '@/data/deal-types';
import { DealRequestDialog, type RequestPrefill } from '@/components/calculators/deal-request-dialog';
import { DealIcon } from '@/components/request/deal-icon';

type RequestApi = {
	/** Opens the request form for one structure, optionally pre-filled from a calculator. */
	openRequest: (slug: string, prefill?: RequestPrefill, calculator?: Record<string, number>) => void;
	/** Opens "What are you funding?", which leads to the matching request form. */
	openPicker: () => void;
	/** Opens the side panel that explains one structure. */
	openDetails: (slug: string) => void;
};

const RequestContext = createContext<RequestApi | null>(null);
export const useRequest = () => { const api = useContext(RequestContext); if (!api) throw new Error('useRequest must be used inside RequestProvider'); return api; };

const rich = (text: string): ReactNode => text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));

export function RequestProvider({ children }: { children: ReactNode }) {
	const [request, setRequest] = useState<{ slug: string; prefill: RequestPrefill; calculator: Record<string, number> } | null>(null);
	const [picker, setPicker] = useState(false);
	const [details, setDetails] = useState<string | null>(null);
	const openRequest = useCallback((slug: string, prefill: RequestPrefill = {}, calculator: Record<string, number> = {}) => { setPicker(false); setDetails(null); setRequest({ slug, prefill, calculator }); }, []);
	const api = useMemo<RequestApi>(() => ({ openRequest, openPicker: () => setPicker(true), openDetails: setDetails }), [openRequest]);
	const type = request ? dealTypeBySlug(request.slug) : undefined;
	const shown = details ? dealTypeBySlug(details) : undefined;
	return <RequestContext.Provider value={api}>
		{children}
		{request && type && <DealRequestDialog key={request.slug} open onOpenChange={o => !o && setRequest(null)} method={type.slug} title={`${type.name} Request`} prefill={request.prefill} calculator={request.calculator} onBack={() => { setRequest(null); setPicker(true); }} />}
		<Dialog.Root open={picker} onOpenChange={setPicker}>
			<Dialog.Portal>
				<Dialog.Overlay className="dr-overlay" />
				<Dialog.Content className="dr-panel picker-panel" aria-describedby="picker-desc">
					<Dialog.Close className="dr-close" aria-label="Close"><X size={18} /></Dialog.Close>
					<Dialog.Title className="dr-title">What are you funding?</Dialog.Title>
					<p id="picker-desc" className="dr-sub">Pick your deal type and we’ll take you to a short form built for it.</p>
					<div className="picker-grid">{dealTypes.map(d => <button key={d.slug} type="button" className="picker-option" onClick={() => openRequest(d.slug)}><DealIcon slug={d.slug} /><span><strong>{d.name}</strong><small>{d.picker}</small></span></button>)}</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
		<Dialog.Root open={Boolean(shown)} onOpenChange={o => !o && setDetails(null)}>
			<Dialog.Portal>
				<Dialog.Overlay className="dr-overlay" />
				{shown && <Dialog.Content className="deal-drawer" aria-describedby="drawer-what">
					<header className="sky-bloom deal-drawer-head"><p className="eyebrow">{shown.eyebrow}</p><Dialog.Title>{shown.name}</Dialog.Title><Dialog.Close className="dr-close" aria-label="Close"><X size={18} /></Dialog.Close></header>
					<div className="deal-drawer-body">
						<h3>What it is</h3><p id="drawer-what">{rich(shown.what)}</p>
						<h3>When to use it</h3><ul>{shown.when.map(w => <li key={w}>{w}</li>)}</ul>
						<h3>How we fund it</h3><ol className="method-pieces">{shown.how.map((h, i) => <li key={h}><span>{String(i + 1).padStart(2, '0')}</span><div>{h}</div></li>)}</ol>
						<h3>What you’ll need</h3><ul>{shown.need.map(n => <li key={n}>{n}</li>)}</ul>
						{shown.calculator && <><h3>Run your numbers first</h3><p>Use the <Link className="inline-link" to={shown.calculator} onClick={() => setDetails(null)}>{shown.name} calculator</Link> to see your estimate before you submit.</p></>}
						{shown.guide && <Link className="text-link dark" to={shown.guide} onClick={() => setDetails(null)}>Read the full {shown.name} guide <ArrowRight size={15} /></Link>}
						<div className="deal-drawer-actions"><button type="button" className="button small" onClick={() => openRequest(shown.slug)}>Start a {shown.name} request</button><Link to="/contact" className="button small outline" onClick={() => setDetails(null)}>Ask our team</Link></div>
					</div>
				</Dialog.Content>}
			</Dialog.Portal>
		</Dialog.Root>
	</RequestContext.Provider>;
}

/** A button that opens the request form for one structure, or the picker when no slug is given. */
export function RequestButton({ slug, children, className = 'button' }: { slug?: string; children: ReactNode; className?: string }) {
	const { openRequest, openPicker } = useRequest();
	return <button type="button" className={className} onClick={() => (slug ? openRequest(slug) : openPicker())}>{children}</button>;
}
