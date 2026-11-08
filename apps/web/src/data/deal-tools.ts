import { payment } from '@/lib/deal-math.mjs';

// One entry per deal calculator. The library page, each calculator page and each method guide read from here.
export type Unit = '$' | '%' | 'yrs' | 'mo' | 'x' | 'toggle';
export type Values = Record<string, number>;
export type ToolField = { key: string; label: string; value: number; unit: Unit; max?: number; helper?: (v: Values) => number; helperSuffix?: string };
export type Rows = Record<string, number | null>;
export type Headline = { label: (r: Rows) => string; value: (r: Rows) => number | null; format?: 'money' | 'ratio'; good: (r: Rows) => boolean; note: (r: Rows) => string };
export type StatementLine = { key: string; label?: string | ((v: Values) => string); sign?: '-'; strong?: boolean };
export type ToolTab = { label: string; fields: string[]; rows: string[]; headline: Headline; layout?: string[][]; notes?: Record<number, (v: Values) => string>; intro?: (v: Values) => string[]; tip?: string; statement?: StatementLine[] };
export type DealTool = {
	slug: string; kind: string; method: string; name: string; title: string; tag: string; card: string;
	lead: string; request: string; question: string; explain: string[]; steps: string[]; assumption: string;
	fields: ToolField[]; tabs: ToolTab[];
};

const pct = (base: string, key: string) => (v: Record<string, number>) => v[base] * v[key] / 100;
const abs = (n: number | null) => (n === null ? null : Math.abs(n));

export const dealTools: DealTool[] = [
	{
		slug: 'stack', kind: 'stack', method: '/stack', name: 'Stack Method', title: 'Stack Method Calculator', tag: 'PURCHASE + CASH FLOW',
		card: 'Can you close the stack, and should you keep it? Cash-to-close math plus a full monthly rental P&L with coverage and the seller-carry balloon.',
		lead: 'Does the deal work on paper? Run the numbers and find out before you commit.',
		request: 'Start a Stack request', question: 'What is the Stack Method?',
		explain: [
			'The Stack Method pairs a primary lender with a note the seller carries back, so the two together cover the purchase. The Purchase analysis tab answers the first question that decides any Stack deal: can you close it? It checks whether the seller carry is large enough to repay the short-term funding and the fees, and shows exactly what happens at the closing table: cash you bring, or cash you take home.',
			'The Cash flow analysis tab then answers the second question: should you keep it? It runs a full monthly rental P&L on the same numbers, covering vacancy, taxes, insurance, maintenance, CapEx, property management and both loan payments, plus what you will still owe the seller when the balloon falls due.',
		],
		steps: [
			'Enter the purchase price, the seller carry and the primary lender’s percentage. The dollar amount shows beside each field.',
			'The fee fields are pre-filled estimates, and every one is editable. Your exact figures come with your written terms.',
			'Watch the result switch between cash needed and cash back as you change the structure.',
			'Open Cash flow analysis to test the property as a rental: payments, balloon and debt coverage included.',
		],
		assumption: 'Temporary funding covers the gap between the primary loan and the price plus closing costs until the seller-note proceeds are available. The fee applies to that gap. Repayment order and any cash back depend on lender and title approval.',
		fields: [
			{ key: 'price', label: 'Purchase price', value: 500000, unit: '$' },
			{ key: 'carry', label: 'Seller carry', value: 30, unit: '%', max: 100, helper: pct('price', 'carry') },
			{ key: 'primary', label: 'Primary lender', value: 75, unit: '%', max: 100, helper: pct('price', 'primary') },
			{ key: 'closing', label: 'Est. closing costs', value: 3, unit: '%', max: 100, helper: pct('price', 'closing') },
			{ key: 'fee', label: 'Funding fee', value: 2.5, unit: '%', max: 100, helper: v => Math.max(0, v.price * (1 + v.closing / 100 - v.primary / 100)) * v.fee / 100 },
			{ key: 'tc', label: 'TC fee', value: 3000, unit: '$' },
			{ key: 'second', label: '2nd closing', value: 1200, unit: '$' },
			{ key: 'rent', label: 'Monthly rent', value: 4800, unit: '$' },
			{ key: 'vacancy', label: 'Vacancy', value: 5, unit: '%', max: 100 },
			{ key: 'taxes', label: 'Annual taxes', value: 5400, unit: '$' },
			{ key: 'insurance', label: 'Annual insurance', value: 2100, unit: '$' },
			{ key: 'hoa', label: 'Monthly HOA', value: 0, unit: '$' },
			{ key: 'rate', label: 'Primary rate', value: 7.5, unit: '%', max: 100, helper: v => payment(v.price * v.primary / 100, v.rate, v.term), helperSuffix: '/mo' },
			{ key: 'term', label: 'Primary amort', value: 30, unit: 'yrs' },
			{ key: 'carryRate', label: 'Carry rate', value: 4, unit: '%', max: 100, helper: v => payment(v.price * v.carry / 100, v.carryRate, v.carryTerm), helperSuffix: '/mo' },
			{ key: 'carryTerm', label: 'Carry amort', value: 30, unit: 'yrs' },
			{ key: 'balloon', label: 'Balloon', value: 7, unit: 'yrs' },
			{ key: 'maintenance', label: 'Maintenance', value: 5, unit: '%', max: 100 },
			{ key: 'capex', label: 'CapEx', value: 5, unit: '%', max: 100 },
			{ key: 'management', label: 'Prop. mgmt', value: 8, unit: '%', max: 100 },
		],
		tabs: [
			{
				label: 'Purchase analysis', fields: ['price', 'carry', 'primary', 'closing', 'fee', 'tc', 'second'],
				layout: [['price', 'carry'], ['primary', 'closing'], ['fee', 'tc', 'second']],
				notes: { 0: v => `Cash to seller = ${fmt(v.price - v.price * v.carry / 100)}` },
				rows: [],
				headline: {
					label: r => ((r['Cash required (negative = surplus)'] ?? 0) <= 0 ? 'Estimated cash back at closing' : 'Estimated cash needed at closing'),
					value: r => abs(r['Cash required (negative = surplus)']), good: r => (r['Cash required (negative = surplus)'] ?? 0) <= 0,
					note: r => {
						const cash = r['Cash required (negative = surplus)'] ?? 0;
						const base = cash <= 0
							? `The seller receives ${fmt(r['Cash to seller'])} in cash. We fund the ${fmt(r['Temporary purchase gap'])} gap, repaid from the seller carry, and the surplus comes back to you.`
							: `The seller receives ${fmt(r['Cash to seller'])} in cash. The seller carry falls ${fmt(cash)} short of repaying the ${fmt(r['Temporary purchase gap'])} gap and the fees, so you bring the difference or increase the carry.`;
						const over = (r['Primary + carry (% of price)'] ?? 0) > 100
							? ` Note: the primary loan plus seller carry come to ${(r['Primary + carry (% of price)'] ?? 0).toFixed(0)}% of the price, so the seller is carrying more than their equity. Make sure the primary lender and the seller both understand and accept that.`
							: '';
						return `${base}${over} The final structure is set in your written terms.`;
					},
				},
			},
			{
				label: 'Cash flow analysis', fields: ['rent', 'vacancy', 'taxes', 'insurance', 'hoa', 'rate', 'term', 'carryRate', 'carryTerm', 'balloon', 'maintenance', 'capex', 'management'],
				intro: v => ['Keeping it as a rental? This is the full monthly P&L, using the price, loan and seller carry from your Purchase analysis tab.', `From your purchase tab: primary loan ${fmt(v.price * v.primary / 100)} · seller carry ${fmt(v.price * v.carry / 100)}`],
				tip: 'Rates and terms here are editable estimates. Replace them with your lender’s quote and the terms agreed with the seller.',
				layout: [['rent', 'vacancy'], ['taxes', 'insurance', 'hoa'], ['rate', 'term'], ['carryRate', 'carryTerm', 'balloon'], ['maintenance', 'capex', 'management']],
				rows: [],
				statement: [
					{ key: 'Gross rent' }, { key: 'Vacancy', sign: '-' },
					{ key: 'Effective income', strong: true }, { key: 'Taxes, insurance + HOA', sign: '-' }, { key: 'Maintenance + CapEx', sign: '-' }, { key: 'Property management', sign: '-' },
					{ key: 'Net operating income', strong: true }, { key: 'Primary monthly payment', label: 'Primary loan P&I', sign: '-' }, { key: 'Seller monthly payment', label: 'Seller carry P&I', sign: '-' },
					{ key: 'Seller balloon balance', label: v => `Seller balloon due (year ${v.balloon})`, strong: true },
				],
				headline: {
					label: r => ((r['Monthly cash flow'] ?? 0) >= 0 ? 'Estimated monthly cash flow' : 'Estimated monthly shortfall'),
					value: r => abs(r['Monthly cash flow']), good: r => (r['Monthly cash flow'] ?? 0) >= 0,
					note: r => { const f = r['Monthly cash flow'] ?? 0, c = r['Debt coverage (NOI ÷ both payments)']; return `${f < 0 ? '−' : '+'}${fmt(Math.abs(f) * 12)} per year · coverage ${c === null || c === undefined ? 'n/a' : `${c.toFixed(2)}×`}${c != null && c < 1 ? ', under 1.0' : ''}`; },
				},
			},
		],
	},
	{
		slug: 'echo', kind: 'echo', method: '/echo', name: 'Echo Method', title: 'Echo Calculator', tag: 'DOUBLE CLOSE SPREAD',
		card: 'Run both legs of a double close and see whether the spread repays the end buyer’s down-payment funding, and what the wholesaler keeps.',
		lead: 'Run both legs of the double close and see whether the spread covers the end buyer’s funding.',
		request: 'Discuss an Echo deal', question: 'What is the Echo Method?',
		explain: [
			'In an Echo, the end buyer’s down payment and closing costs on the second leg of a double close are funded short-term, then repaid from the wholesaler’s spread on the same settlement statement. Everything depends on one test: is the gap between the A–B and B–C prices large enough to repay that funding and its fee?',
			'If it is, the result shows what is left for the wholesaler. If it is not, it shows how short the spread falls. The usual fixes are a higher B–C price, if the appraisal supports it, or a smaller funded amount.',
		],
		steps: [
			'Enter what the wholesaler pays to close the A–B leg, including that leg’s closing costs.',
			'Enter the B–C price the end buyer pays. It has to be supported by the appraisal, because the appraisal sizes the primary loan.',
			'Set the primary lender’s percentage of the B–C price and the B–C closing costs. The dollar amounts appear beside each label.',
			'A blue result means the spread repays the funding. An orange result shows how far short it falls.',
		],
		assumption: 'A–B cash to close includes the first purchase and its costs. The end buyer’s B–C closing costs are included in the funded amount and repaid from the spread with the fee. No minimum fee is assumed. Confirm appraisal support and settlement treatment with title.',
		fields: [
			{ key: 'acquisition', label: 'A–B cash to close', value: 400000, unit: '$' },
			{ key: 'sale', label: 'B–C sale price', value: 560000, unit: '$' },
			{ key: 'primary', label: 'Primary lender', value: 75, unit: '%', max: 100, helper: pct('sale', 'primary') },
			{ key: 'closing', label: 'B–C closing costs', value: 2, unit: '%', max: 100, helper: pct('sale', 'closing') },
			{ key: 'fee', label: 'Funding fee', value: 2.5, unit: '%', max: 100, helper: v => Math.max(0, v.sale * (1 + v.closing / 100 - v.primary / 100)) * v.fee / 100 },
		],
		tabs: [{
			label: 'Both legs', fields: ['acquisition', 'sale', 'primary', 'closing', 'fee'],
			rows: ['Primary loan', 'Buyer funding gap', 'Funding fee', 'Repayment from spread', 'Resale spread (B–C minus A–B)'],
			headline: {
				label: r => ((r['Spread after advance and fee'] ?? 0) >= 0 ? 'Spread covers the funding: left for the wholesaler' : 'Spread falls short by'),
				value: r => abs(r['Spread after advance and fee']), good: r => (r['Spread after advance and fee'] ?? 0) >= 0,
				note: r => `Funded for the end buyer: ${fmt(r['Buyer funding gap'])}, repaid as ${fmt(r['Repayment from spread'])} from the spread on the same settlement. The end buyer brings about $0 down.`,
			},
		}],
	},
];

export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function fmt(n: number | null | undefined) { return n === null || n === undefined || !Number.isFinite(n) ? 'Not available' : money.format(n); }
export const toolBySlug = (slug: string | undefined) => dealTools.find(t => t.slug === slug);
export const toolByKind = (kind: string) => dealTools.find(t => t.kind === kind)!;
