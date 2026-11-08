<?php
/**
 * Claw Point Advisory: the live "Tip drop" feed.
 *
 * Mixes two sources, newest first, refreshed at most once an hour:
 *  1. Fresh headlines from public RSS feeds (BiggerPockets, plus Google News searches below), filtered
 *     to lending and investing topics. Only the headline, source and link are shown; the article itself
 *     stays on the publisher's site.
 *  2. The team's own tips from the "Tip Drops" tab of the leads sheet (Publish ticked), once
 *     lead-sheet.php is set up.
 *
 * To change what's pulled in, edit FEEDS, KEEP_WORDS and SKIP_WORDS below.
 */
const CACHE_SECONDS = 3600;   // refresh at most once an hour
const MAX_ITEMS = 30;

// [url, source label or '' to read the publisher from a Google News title, max items from this feed]
const FEEDS = [
	['https://www.biggerpockets.com/blog/feed', 'BiggerPockets', 14],
	['https://news.google.com/rss/search?q=%22transactional+funding%22+OR+%22double+closing%22+real+estate+investor&hl=en-US&gl=US&ceid=US:en', '', 4],
	['https://news.google.com/rss/search?q=%22creative+financing%22+OR+%22seller+financing%22+real+estate&hl=en-US&gl=US&ceid=US:en', '', 4],
	['https://news.google.com/rss/search?q=%22earnest+money%22+OR+%22hard+money+loan%22+real+estate+investing&hl=en-US&gl=US&ceid=US:en', '', 4],
];
// A headline must mention at least one of these...
const KEEP_WORDS = ['loan', 'lend', 'financ', 'funding', 'fund ', 'mortgage', 'dscr', 'hard money', 'private money', 'creative', 'seller', 'subject-to', 'subto', 'wholesal', 'flip', 'closing', 'escrow', 'title', 'earnest', 'emd', 'underwrit', 'capital', 'cash flow', 'rental', 'investor', 'deal', 'interest rate', 'down payment', 'brrrr', 'refinanc', 'equity', 'commercial', 'multifamily', 'land'];
// ...and none of these.
const SKIP_WORDS = ['scam', 'fraud', 'lawsuit', 'sued', 'arrest', 'charged', 'indict', 'ponzi', 'bankrupt', 'private equity', 'side letter', 'obituary', 'podcast', 'webinar', 'promo code', 'sponsored', 'introduces', 'launches', 'announces', 'press release', 'best hard money lenders', 'best lenders', 'top lenders', 'lenders in 20', 'lenders for 20'];
const MAX_AGE_DAYS = 365;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('X-Content-Type-Options: nosniff');

$cache = sys_get_temp_dir() . '/cpa_tipfeed_v2.json';
if (is_file($cache) && time() - filemtime($cache) < CACHE_SECONDS) { readfile($cache); exit; }

function fetch_url(string $url): ?string {
	if (!function_exists('curl_init')) return null;
	$ch = curl_init($url);
	curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 10,
		CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ClawPointAdvisory/1.0; +https://clawpoint.capital)']);
	$body = curl_exec($ch);
	$ok = is_string($body) && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 400;
	return $ok ? $body : null;
}

function topic_for(string $t): string {
	$l = ' ' . strtolower(preg_replace('/[^\p{L}\p{N}]+/u', ' ', $t)) . ' ';
	foreach ([
		'Creative finance' => ['creative', 'seller financ', 'seller carry', 'subject-to', 'subto', 'stack'],
		'Wholesaling' => ['wholesal', 'assignment', 'double clos', 'double close', 'transactional'],
		'Closing' => ['closing', 'escrow', 'title', 'earnest', 'emd'],
		'Rental loans' => ['dscr', 'rental', 'cash flow', 'brrrr'],
		'Lending' => ['hard money', 'private money', 'loan', 'lend', 'mortgage', 'interest rate', 'refinanc', 'underwrit'],
		'Commercial' => ['commercial', 'multifamily', 'industrial', ' land '],
	] as $topic => $words) foreach ($words as $w) if (str_contains($l, $w)) return $topic;
	return 'Investing';
}

$items = [];
$seen = [];
foreach (FEEDS as [$url, $label, $limit]) {
	$xml = fetch_url($url);
	if (!$xml) continue;
	$prev = libxml_use_internal_errors(true);
	$doc = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
	libxml_use_internal_errors($prev);
	if (!$doc || !isset($doc->channel->item)) continue;
	$taken = 0;
	foreach ($doc->channel->item as $it) {
		if ($taken >= $limit) break;
		$title = trim(html_entity_decode(strip_tags((string) $it->title), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
		$link = trim((string) $it->link);
		$source = $label;
		if ($source === '') {
			$source = trim((string) ($it->source ?? ''));
			if (preg_match('/^(.*)\s+-\s+([^-]{2,60})$/u', $title, $m)) { $title = trim($m[1]); $source = $source ?: trim($m[2]); }
		}
		$l = ' ' . strtolower($title) . ' ';
		$keep = false; foreach (KEEP_WORDS as $w) if (str_contains($l, $w)) { $keep = true; break; }
		foreach (SKIP_WORDS as $w) if (str_contains($l, $w)) { $keep = false; break; }
		// English headlines only, and nothing older than MAX_AGE_DAYS.
		if (preg_match('/[\p{Hangul}\p{Han}\p{Hiragana}\p{Katakana}\p{Cyrillic}\p{Arabic}\p{Hebrew}\p{Thai}]/u', $title . ' ' . $source)) continue;
		$time = strtotime((string) $it->pubDate) ?: time();
		if ($time < time() - MAX_AGE_DAYS * 86400) continue;
		$key = strtolower(preg_replace('/\W+/', '', $title));
		if (!$keep || $title === '' || !preg_match('~^https?://~i', $link) || isset($seen[$key])) continue;
		$seen[$key] = true;
		$items[] = ['date' => gmdate('c', $time), 'category' => topic_for($title), 'tip' => mb_substr($title, 0, 220), 'by' => mb_substr($source ?: 'News', 0, 40), 'url' => $link, 'kind' => 'article', 't' => $time];
		$taken++;
	}
}

// The team's own tips from the sheet, when it's connected.
$sheet = is_file(__DIR__ . '/lead-sheet.php') ? (include __DIR__ . '/lead-sheet.php') : null;
if (is_array($sheet) && !empty($sheet['url'])) {
	$raw = fetch_url($sheet['url'] . (str_contains($sheet['url'], '?') ? '&' : '?') . http_build_query(['action' => 'tips', 'secret' => $sheet['secret'] ?? '']));
	$data = $raw ? json_decode($raw, true) : null;
	foreach (is_array($data['tips'] ?? null) ? array_slice($data['tips'], 0, 20) : [] as $t) {
		$tip = trim((string) ($t['tip'] ?? ''));
		if ($tip === '') continue;
		$time = strtotime((string) ($t['date'] ?? '')) ?: time();
		$items[] = ['date' => gmdate('c', $time), 'category' => mb_substr((string) ($t['category'] ?? 'Tip'), 0, 40), 'tip' => mb_substr($tip, 0, 600), 'by' => mb_substr((string) ($t['by'] ?? 'Claw Point'), 0, 40), 'url' => '', 'kind' => 'team', 't' => $time];
	}
}

if (!$items) {
	// Nothing reachable right now: keep showing the last good copy if there is one.
	if (is_file($cache)) { readfile($cache); exit; }
	echo json_encode(['ok' => true, 'tips' => []]); exit;
}
usort($items, fn($a, $b) => $b['t'] <=> $a['t']);
$items = array_map(function ($i) { unset($i['t']); return $i; }, array_slice($items, 0, MAX_ITEMS));
$out = json_encode(['ok' => true, 'tips' => $items], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
@file_put_contents($cache, $out, LOCK_EX);
echo $out;
