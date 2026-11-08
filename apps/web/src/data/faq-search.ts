import { faqs, type Faq } from '@/data/faq';

const STOP = new Set('a an and are as at be but by can do does for from get how i if in is it its me my of on or so that the this to was what when where which who why will with you your we our there their any about'.split(' '));
const words = (s: string) => s.toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9.]+/).filter(w => w.length > 1 && !STOP.has(w));

const index = faqs.map(f => ({ f, q: new Set(words(f.q)), k: new Set(words(f.k)), a: new Set(words(f.a)) }));
const hit = (set: Set<string>, w: string) => set.has(w) || (w.length >= 4 && [...set].some(x => x.length >= 4 && (x.startsWith(w) || w.startsWith(x))));

/** Best answer for a question (or null when nothing matches well), plus up to three related questions. */
export function searchFaq(query: string): { best: Faq | null; related: Faq[] } {
	const terms = [...new Set(words(query))];
	if (!terms.length) return { best: null, related: [] };
	const scored = index.map(({ f, q, k, a }) => ({ f, score: terms.reduce((s, w) => s + (hit(q, w) ? 3 : hit(k, w) ? 2 : hit(a, w) ? 0.5 : 0), 0) / Math.sqrt(terms.length) }))
		.filter(x => x.score > 0).sort((x, y) => y.score - x.score);
	const best = scored[0] && scored[0].score >= 2 ? scored[0].f : null;
	return { best, related: scored.filter(x => x.f !== best).slice(0, 3).map(x => x.f) };
}
