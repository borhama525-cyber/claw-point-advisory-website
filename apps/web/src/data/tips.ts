// Starter "Tip drop" tips, shown until public/tips.php answers (for example while developing locally).
// They match the first rows of the Tip Drops tab in the leads sheet.
/** `url` and `kind: 'article'` mark a headline pulled from a public feed (BiggerPockets, news); team tips have neither. */
export type Tip = { date: string; category: string; tip: string; by: string; url?: string; kind?: 'article' | 'team' };

export const starterTips: Tip[] = [
	{ date: '2026-11-08T12:50', category: 'Networking', tip: 'A great TC or title officer is worth more than a lower fee. Ask who they close with every week.', by: 'Adam' },
	{ date: '2026-11-08T08:25', category: 'Networking', tip: 'Share your buy box in one line: market, asset type, price range and how fast you close. People remember short.', by: 'Amira' },
	{ date: '2026-11-07T15:10', category: 'Closing', tip: 'Before you sign the B–C contract, confirm your title company handles back-to-back closings and how they fund them.', by: 'Adam' },
	{ date: '2026-11-07T09:00', category: 'Lending basics', tip: 'Short-term money is priced for speed. Model the full hold: points, interest, extensions and what happens if the sale slips a month.', by: 'Adam' },
	{ date: '2026-11-06T17:45', category: 'Creative finance', tip: 'In a Stack deal, everyone at the table should know about the seller carry, including the primary lender. Surprises at closing kill deals.', by: 'Amira' },
	{ date: '2026-11-06T10:30', category: 'Paperwork', tip: 'Name your files clearly, like “PSA – 123 Main St.pdf”. Clean, labeled documents move through underwriting faster.', by: 'Adam' },
	{ date: '2026-11-05T14:20', category: 'EMD', tip: 'Where you can, list the title company as TBD in the PSA. It keeps your options open on who closes the deal.', by: 'Amira' },
	{ date: '2026-11-04T08:05', category: 'Double close', tip: 'No funds in escrow, no A–B funding. Get your B–C buyer’s money into escrow early and keep the receipt ready.', by: 'Adam' },
	{ date: '2026-11-03T11:40', category: 'Lending basics', tip: 'Lenders size a loan on the lower of two numbers: loan-to-value and loan-to-cost. Know both before you make the call.', by: 'Amira' },
	{ date: '2026-11-02T09:15', category: 'Underwriting', tip: 'Lead with the exit. Before anything else, a lender wants to know exactly how they get repaid: the resale, the refinance or the B–C closing.', by: 'Amira' },
];
