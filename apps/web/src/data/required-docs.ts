// Paperwork each funding type must include before a deal request can be sent.
// Keep in step with REQUIRED_DOCS in public/send.php, which checks the same list on the server.
export type RequiredDoc = { key: string; label: string; hint: string; lender?: boolean };

export const requiredDocs: Record<string, RequiredDoc[]> = {
	stack: [
		{ key: 'contract', label: 'Signed purchase contract', hint: 'The full purchase and sale agreement, signed.' },
		{ key: 'seller_terms', label: 'Seller-carry terms', hint: 'Seller finance addendum, note terms or term sheet.' },
		{ key: 'lender_terms', label: 'Primary lender term sheet or approval', hint: 'From the lender funding the largest share of the price.', lender: true },
	],
	echo: [
		{ key: 'ab_contract', label: 'A–B purchase contract', hint: 'Your contract with the seller.' },
		{ key: 'bc_contract', label: 'B–C purchase contract', hint: 'Your contract with the end buyer.' },
		{ key: 'lender_terms', label: 'End buyer’s lender term sheet or approval', hint: 'From the lender funding the largest share of the price.', lender: true },
	],
	'double-close': [
		{ key: 'ab_contract', label: 'A–B purchase contract', hint: 'Your contract with the seller.' },
		{ key: 'bc_contract', label: 'B–C purchase contract', hint: 'Your contract with the end buyer.' },
		{ key: 'buyer_funds', label: 'End buyer proof of funds or lender approval', hint: 'Shows the B–C side can close.' },
	],
	emd: [
		{ key: 'contract', label: 'Signed purchase contract', hint: 'Must show the EMD amount and deadline.' },
	],
};
