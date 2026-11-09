import { Landmark } from 'lucide-react';
import { RequestButton } from '@/components/request/request-provider';

/** "Don't have a primary lender? We can provide one." callout for deal pages. */
export function LenderNote({ slug }: { slug?: string }) {
	return <aside className="lender-note">
		<span className="lender-note-icon" aria-hidden="true"><Landmark size={22} /></span>
		<div><strong>Don’t have a primary lender? We can provide one.</strong><p>Many deals need a lender for the largest share of the price. Click “I need a primary lender” in your request and we’ll bring one into your deal.</p></div>
		<RequestButton slug={slug} className="button small">Start a request →</RequestButton>
	</aside>;
}
