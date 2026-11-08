// The four funding structures: home page cards, the side panel, the "What are you funding?" picker and the footer.
export type DealType = {
	slug: string; name: string; eyebrow: string; card: string; picker: string;
	what: string; when: string[]; how: string[]; need: string[];
	guide?: string; calculator?: string;
};

export const dealTypes: DealType[] = [
	{
		slug: 'stack', name: 'Stack Method', eyebrow: 'CREATIVE FINANCE', guide: '/stack', calculator: '/calculators/stack',
		card: 'A primary loan plus seller carry, stacked into one purchase. Close with little or none of your own cash, sometimes with cash back.',
		picker: 'Primary loan + seller carry',
		what: 'A creative-finance structure that combines a primary lender with a note the seller carries back, so you can buy with little or none of your own cash. Also called the **Morby Method**. Structured well, you can receive cash back at closing.',
		when: ['The seller is open to carrying part of the price', 'You have a primary lender for most of the purchase, or want us to provide one', 'You want to keep your cash free while closing quickly'],
		how: ['Send us your structure: purchase price, seller carry, primary loan amount and closing date.', 'We review the stack with your lender and title and confirm terms in writing.', 'Our funds are wired to title for closing, and escrow repays us under the agreed structure.'],
		need: ['An LOI from your primary lender (or ask us to provide a lender)', 'The purchase contract and seller-carry terms once they’re drafted', 'Title or escrow contact'],
	},
	{
		slug: 'echo', name: 'Echo Method', eyebrow: 'CREATIVE FINANCE', guide: '/echo', calculator: '/calculators/echo',
		card: 'Your end buyer is short on the down payment? We cover it, and the deal’s spread repays us at the same closing.',
		picker: 'End buyer down payment, repaid from the spread',
		what: 'Short-term funding for the end buyer’s down payment on the second leg of a double close, repaid from the wholesaler’s spread on the same settlement statement. Funds go in and come out at one closing.',
		when: ['You’re wholesaling and your buyer is stalling on the down payment', 'You’re buying from a wholesaler and want to keep your reserves', 'The B–C price is supported by the appraisal and the spread can cover the funding'],
		how: ['Send both legs: the A–B and B–C contracts, your buyer’s primary lender and the closing date.', 'We confirm the spread covers the funding and fee, and issue written terms.', 'The primary lender’s funds land at title first; then we wire the down payment and are repaid from the spread on the same settlement.'],
		need: ['A–B and B–C purchase contracts', 'Your buyer’s primary lender term sheet or approval (or ask us to provide a lender)', 'A title company comfortable with back-to-back closings'],
	},
	{
		slug: 'double-close', name: 'Double Close', eyebrow: 'TRANSACTIONAL',
		card: 'Funding for the A–B purchase in a back-to-back closing, repaid from the B–C sale the same day. Your spread stays private.',
		picker: 'A–B funding for back-to-back closings',
		what: 'Two closings in sequence: you buy the property (A–B) and resell it to your end buyer (B–C), usually the same day. We fund your A–B purchase, and the B–C proceeds repay us. Your buyer never sees your contract price.',
		when: ['An assignment is restricted, or you don’t want your fee visible', 'Your end buyer is ready and funded', 'You need short-term capital for the A–B purchase only'],
		how: ['Send both contracts and the closing date.', 'We review the deal and confirm terms in writing.', 'We fund the A–B purchase at title, and escrow repays us from the B–C proceeds.'],
		need: ['A–B and B–C contracts', 'End buyer proof of funds or lender approval', 'A title company that handles back-to-back closings'],
	},
	{
		slug: 'emd', name: 'EMD', eyebrow: 'TRANSACTIONAL',
		card: 'Earnest money funded before your deadline, so you can lock up a contract without tying up your own capital.',
		picker: 'Earnest money deposit funding',
		what: 'We fund your earnest money deposit so you can secure a contract without using your own reserves. Built for investors and wholesalers juggling several contracts at once.',
		when: ['You’re working several contracts and need EMD liquidity', 'A deposit deadline is close and your capital is committed elsewhere'],
		how: ['Send the contract, the EMD amount and the escrow details.', 'We verify the funds and issue written terms.', 'The deposit is wired to escrow, and repaid under the agreement at closing or termination.'],
		need: ['Signed purchase contract', 'Escrow wiring instructions', 'The contract’s terms on refunding the EMD'],
	},
];

export const dealTypeBySlug = (slug: string) => dealTypes.find(d => d.slug === slug);
