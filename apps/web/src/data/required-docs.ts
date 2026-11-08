// Paperwork each funding type must include before a deal request can be sent.
// Keep in step with REQUIRED_DOCS in public/send.php, which checks the same list on the server.
// lender: the primary lender's own document, not needed when the borrower asks us to provide a lender.
// withLender: required when the borrower has their own lender, optional when we provide one.
// optional: shown, never required.
export type RequiredDoc = { key: string; label: string; hint: string; lender?: boolean; withLender?: boolean; optional?: boolean };

export const requiredDocs: Record<string, RequiredDoc[]> = {
	stack: [
		{ key: 'psa', label: 'Purchase contract (PSA)', hint: 'The purchase and sale agreement with the seller.', withLender: true },
		{ key: 'lender_terms', label: 'Primary lender term sheet', hint: 'Term sheet from the lender funding the largest share of the price.', lender: true },
		{ key: 'loi', label: 'LOI (letter of intent)', hint: 'The LOI setting out the deal terms.', withLender: true },
		{ key: 'seller_terms', label: 'Seller-carry terms, if drafted', hint: 'Seller finance addendum, note terms or a term sheet.', optional: true },
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
