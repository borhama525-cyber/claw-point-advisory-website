import { useEffect, useState } from 'react';
import { calculate } from '@/lib/deal-math.mjs';
import { fmt, type DealTool, type Rows, type ToolField, type Values } from '@/data/deal-tools';
import type { RequestPrefill } from '@/components/calculators/deal-request-dialog';
import { useRequest } from '@/components/request/request-provider';

const initial = (tool: DealTool) => Object.fromEntries(tool.fields.map(f => [f.key, f.unit === '%' ? Number(f.value).toFixed(1) : String(f.value)]));
const grouped = (raw: string) => { const [whole, dec] = raw.split('.'); const w = whole ? Number(whole).toLocaleString('en-US') : ''; return dec === undefined ? w : `${w}.${dec}`; };
const display = (n: number | null | undefined, format?: string) => (n === null || n === undefined || !Number.isFinite(n) ? 'Not available' : format === 'ratio' ? `${n.toFixed(2)}×` : format === 'percent' ? `${n.toFixed(1)}%` : format === 'flag' ? (n ? 'Yes' : 'No') : fmt(n));
const tenths = (raw: string) => (/^\d+(\.\d)?$/.test(raw) ? Number(raw).toFixed(1) : raw);

function prefillFor(kind: string, v: Values, r: Rows): RequestPrefill {
	if (kind === 'stack') return { purchase_price: v.price, seller_finance: r['Seller note'] ?? undefined, primary_loan: r['Primary loan'] ?? undefined, requested_funding: r['Temporary purchase gap'] ?? undefined };
	if (kind === 'echo') return { purchase_price: v.acquisition, resale_price: v.sale, primary_loan: r['Primary loan'] ?? undefined, requested_funding: r['Buyer funding gap'] ?? undefined };
	if (kind === 'dscr') return { purchase_price: v.price, primary_loan: r['Loan amount'] ?? undefined };
	return { purchase_price: v.price, resale_price: v.arv, requested_funding: r['Loan amount'] ?? undefined };
}

export function ToolCalculator({ tool }: { tool: DealTool }) {
	const [tab, setTab] = useState(0);
	const [values, setValues] = useState<Record<string, string>>(() => initial(tool));
	const [focused, setFocused] = useState<string | null>(null);
	const v: Values = Object.fromEntries(Object.entries(values).map(([k, x]) => [k, Number(x)]));
	const invalid = tool.fields.some(f => values[f.key].trim() === '' || !Number.isFinite(v[f.key]) || v[f.key] < 0 || (f.max !== undefined && v[f.key] > f.max))
		|| ['term', 'carryTerm', 'target', 'price', 'sale'].some(k => k in v && v[k] <= 0);
	const out = invalid ? [] : calculate(tool.kind, v);
	const rows: Rows = Object.fromEntries(out.map(([label, n]) => [label, n]));
	const formats: Record<string, string | undefined> = Object.fromEntries(out.map(([label, , f]) => [label, f]));
	const { openRequest } = useRequest();
	const submit = () => openRequest(tool.slug, invalid ? {} : prefillFor(tool.kind, v, rows), invalid ? {} : v);
	// Opens once, when a page links here with ?request.
	useEffect(() => { if (new URLSearchParams(window.location.search).has('request')) submit(); }, []);
	const active = tool.tabs[tab];
	const head = active.headline;
	const good = !invalid && head.good(rows);
	const layout = active.layout ?? active.fields.reduce<string[][]>((acc, k, i) => (i % 2 ? acc[acc.length - 1].push(k) : acc.push([k]), acc), []);
	const set = (key: string, raw: string) => setValues(prev => ({ ...prev, [key]: raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') }));
	const field = (f: ToolField) => {
		const id = `${tool.slug}-${f.key}`;
		const hint = f.helper && !invalid ? `= ${fmt(f.helper(v))}${f.helperSuffix ?? ''}` : '';
		if (f.unit === 'toggle') return <label key={f.key} className="tc-field tc-toggle" htmlFor={id}><span className="tc-label">{f.label}</span><span className="tc-switch"><input id={id} type="checkbox" checked={v[f.key] === 1} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.checked ? '1' : '0' }))} /><span>{v[f.key] === 1 ? 'Yes' : 'No'}</span></span></label>;
		const shown = focused === f.key ? values[f.key] : f.unit === '$' ? grouped(values[f.key]) : f.unit === '%' ? tenths(values[f.key]) : values[f.key];
		return <label key={f.key} className="tc-field" htmlFor={id}><span className="tc-label">{f.label}{hint && <small>{hint}</small>}</span><span className={`tc-input unit-${f.unit === '$' ? 'pre' : 'post'}`}>{f.unit === '$' && <i>$</i>}<input id={id} inputMode="decimal" autoComplete="off" value={shown} onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)} onChange={e => set(f.key, e.target.value)} />{f.unit !== '$' && <i>{f.unit === 'x' ? '×' : f.unit === 'yrs' ? 'yrs' : f.unit}</i>}</span></label>;
	};
	const byKey = (k: string) => tool.fields.find(f => f.key === k)!;
	const intro = active.intro && !invalid ? active.intro(v) : [];
	return <div className="tool-card">
		<p className="eyebrow">{tool.name.toUpperCase()}</p>
		{tool.tabs.length > 1 && <div className="tc-tabs" role="tablist" aria-label={`${tool.title} sections`}>{tool.tabs.map((t, i) => <button key={t.label} role="tab" type="button" aria-selected={tab === i} onClick={() => setTab(i)}>{t.label}</button>)}</div>}
		{intro.length > 0 && <div className="tc-intro"><p>{intro[0]}</p>{intro[1] && <small>{intro[1]}</small>}</div>}
		{active.tip && <p className="tc-tip">{active.tip}</p>}
		<form className="tc-form" onSubmit={e => e.preventDefault()}>{layout.map((row, i) => <div key={row.join()}>
			<div className={`tc-row cols-${row.length}`}>{row.map(k => field(byKey(k)))}</div>
			{active.notes?.[i] && !invalid && <p className="tc-note">{active.notes[i](v).replace(/ = .*/, '')} <small>= {active.notes[i](v).split(' = ')[1]}</small></p>}
		</div>)}</form>
		<div aria-live="polite" aria-atomic="true">
			{invalid && <p className="tc-result bad" role="alert">Enter a valid number in each field. Percentages must be between 0 and 100, and price, term and target DSCR must be greater than zero.</p>}
			{!invalid && active.statement && <dl className="tc-statement">{active.statement.map(line => <div key={line.key} className={line.strong ? 'strong' : undefined}><dt>{typeof line.label === 'function' ? line.label(v) : line.label ?? line.key}</dt><dd>{line.sign === '-' ? '− ' : ''}{display(rows[line.key])}</dd></div>)}</dl>}
			{!invalid && <div className={`tc-result ${good ? 'good' : 'bad'}`}><span>{head.label(rows)}</span><strong>{display(head.value(rows), head.format)}</strong><small>{head.note(rows)}</small></div>}
			{!invalid && active.rows.length > 0 && <dl className="tc-rows">{active.rows.map(label => <div key={label}><dt>{label}</dt><dd>{display(rows[label], formats[label])}</dd></div>)}</dl>}
		</div>
		<button type="button" className="button tc-submit" onClick={submit}>Submit this deal</button>
		<button type="button" className="tc-reset" onClick={() => setValues(initial(tool))}>Reset to example</button>
	</div>;
}
