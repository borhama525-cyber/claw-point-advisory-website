import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUp, Sparkles } from 'lucide-react';
import { searchFaq } from '@/data/faq-search';
import { SkyClouds } from '@/components/sky-clouds';

type Turn = { id: number; role: 'user' | 'assistant'; content: string; title?: string; related?: string[]; live?: boolean };

export const SUGGESTIONS = [
	'How does a double close work?',
	'What do underwriters look at first?',
	'Can you provide a primary lender?',
	'Stack or Echo: which one fits my deal?',
	'What does seasoning and sourcing of funds mean?',
	'What documents do I need to submit a deal?',
];

const PAGE = /(\/(?:calculators(?:\/(?:stack|echo))?|stack|echo|funding|booking|contact))(?![\w/-])/g;

/** Turns site paths the assistant mentions into links. */
const linked = (text: string): ReactNode => text.split(PAGE).map((part, i) => (i % 2 ? <Link key={i} className="inline-link" to={part}>{part}</Link> : <Fragment key={i}>{part}</Fragment>));

/** Paragraphs and "- " bullet lists; nothing else is rendered as markup. */
function Answer({ text }: { text: string }) {
	const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
	return <>{blocks.map((block, i) => {
		const lines = block.split('\n');
		if (lines.every(l => /^\s*[-•*]\s+/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{linked(l.replace(/^\s*[-•*]\s+/, ''))}</li>)}</ul>;
		return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{linked(l)}</Fragment>)}</p>;
	})}</>;
}

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shows typing dots, then writes the answer out word by word; the related questions fade in at the end. */
function Reply({ turn, onAsk, onProgress, onDone }: { turn: Turn; onAsk: (q: string) => void; onProgress: () => void; onDone: () => void }) {
	const tokens = turn.content.match(/\S+\s*/g) ?? [];
	const [shown, setShown] = useState(turn.live && !reduceMotion() ? -1 : tokens.length);
	const startedAt = useRef(0);
	useEffect(() => {
		if (shown >= tokens.length) return;
		// Paced by elapsed time, so throttled timers (background tabs) still finish on schedule.
		const duration = Math.min(1600, 300 + tokens.length * 18);
		const timer = window.setTimeout(() => {
			if (shown < 0) { startedAt.current = Date.now(); setShown(1); return; }
			setShown(Math.min(tokens.length, Math.max(shown + 1, Math.ceil((Date.now() - startedAt.current) / duration * tokens.length))));
		}, shown < 0 ? 650 : 24);
		return () => window.clearTimeout(timer);
	});
	const done = shown >= tokens.length;
	useEffect(() => { onProgress(); if (done) onDone(); }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps
	if (shown < 0) return <span className="ask-typing" aria-label="Writing an answer"><i /><i /><i /></span>;
	return <>
		{turn.title && <p className="ask-title">{turn.title}</p>}
		<div className={done ? undefined : 'is-writing'}><Answer text={done ? turn.content : tokens.slice(0, shown).join('')} /></div>
		{done && turn.related && turn.related.length > 0 && <div className="ask-related"><span>Related questions</span>{turn.related.map((r, i) => <button key={r} type="button" style={{ animationDelay: `${i * 70}ms` }} onClick={() => onAsk(r)}>{r}</button>)}</div>}
	</>;
}

export function AskPanel({ initialQuestion }: { initialQuestion?: string }) {
	const [turns, setTurns] = useState<Turn[]>([]);
	const [draft, setDraft] = useState('');
	const [writing, setWriting] = useState(false);
	const end = useRef<HTMLDivElement>(null);
	const asked = useRef(false);
	const nextId = useRef(0);

	const ask = (question: string) => {
		const q = question.trim().slice(0, 500);
		if (!q || writing) return;
		const { best, related } = searchFaq(q);
		const id = nextId.current += 2;
		const answer: Turn = best
			? { id: id + 1, role: 'assistant', content: best.a, title: best.q, related: related.map(r => r.q), live: true }
			: { id: id + 1, role: 'assistant', content: 'We don’t have a written answer for that one yet. Our team can help: send your question through /contact or book a call at /booking.', related: related.map(r => r.q), live: true };
		setTurns(t => [...t.map(x => ({ ...x, live: false })), { id, role: 'user', content: q }, answer]);
		setDraft('');
		setWriting(true);
	};

	const follow = () => end.current?.scrollIntoView({ block: 'end', behavior: reduceMotion() ? 'auto' : 'smooth' });
	// Asks the question passed in the URL once, on arrival.
	useEffect(() => { if (initialQuestion && !asked.current) { asked.current = true; ask(initialQuestion); } });
	useEffect(() => { if (turns.length) follow(); }, [turns.length]); // eslint-disable-line react-hooks/exhaustive-deps

	const submit = (e: FormEvent) => { e.preventDefault(); ask(draft); };
	const empty = turns.length === 0;
	return <div className={`ask-panel ${empty ? 'is-empty' : ''}`}>
		{empty ? <div className="ask-intro"><span className="ask-orb" aria-hidden="true"><Sparkles size={22} /></span><h1>What can I help with?</h1><p>Ask anything about transactional funding or loan underwriting. Plain-English answers, any time.</p></div>
			: <div className="ask-thread" aria-live="polite">{turns.map(t => <div key={t.id} className={`ask-turn ${t.role}`}>{t.role === 'user' ? <p>{t.content}</p> : <Reply turn={t} onAsk={ask} onProgress={() => t.live && follow()} onDone={() => t.live && setWriting(false)} />}</div>)}<div ref={end} className="ask-end" /></div>}
		<form className="ask-box" onSubmit={submit}>
			<label htmlFor="ask-input" className="sr-only">Your question</label>
			<textarea id="ask-input" rows={empty ? 3 : 1} maxLength={500} value={draft} placeholder={empty ? 'Ask anything, like how does EMD funding get repaid?' : 'Ask another question…'} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft); } }} />
			<div className="ask-box-row"><span className="ask-scope">Transactional funding · Underwriting</span><button type="submit" className="ask-send" disabled={!draft.trim() || writing} aria-label="Send question"><ArrowUp size={18} /></button></div>
		</form>
		{empty && <div className="ask-chips">{SUGGESTIONS.map((s, i) => <button key={s} type="button" style={{ animationDelay: `${120 + i * 60}ms` }} onClick={() => ask(s)}>{s}</button>)}</div>}
		<p className="ask-disclaimer">Answers are general information, not an offer, approval or legal, tax or financial advice. For your specific deal, <Link className="inline-link" to="/contact">talk to our team</Link>.</p>
	</div>;
}

/** Home page entry point: a prompt box that opens the full assistant with the question. */
export function AskTeaser() {
	const navigate = useNavigate();
	const [q, setQ] = useState('');
	const go = (question: string) => { const v = question.trim(); navigate(v ? `/ask?q=${encodeURIComponent(v)}` : '/ask'); };
	return <section className="band ask-teaser sky-bloom"><SkyClouds /><div className="tool-wrap">
		<p className="eyebrow">ASK CLAW POINT</p>
		<h2>Got a question? Ask anything.</h2>
		<p className="ask-teaser-lead">General answers about transactional funding and loan underwriting, from double closes to the Stack Method.</p>
		<form className="ask-box" onSubmit={e => { e.preventDefault(); go(q); }}>
			<label htmlFor="ask-teaser-input" className="sr-only">Your question</label>
			<textarea id="ask-teaser-input" rows={2} maxLength={500} value={q} placeholder="Ask anything, like what does an underwriter check first?" onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(q); } }} />
			<div className="ask-box-row"><span className="ask-scope">Transactional funding · Underwriting</span><button type="submit" className="ask-send" aria-label="Ask"><ArrowUp size={18} /></button></div>
		</form>
		<div className="ask-chips">{SUGGESTIONS.slice(0, 3).map(s => <button key={s} type="button" onClick={() => go(s)}>{s}</button>)}</div>
	</div></section>;
}
