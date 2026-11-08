<?php
/**
 * Claw Point Advisory: the live "Tip Drop" feed. Reads published tips from the "Tip Drops" tab of the
 * leads sheet through the Google Apps Script web app set up in lead-sheet.php, and caches them for
 * five minutes. Until the sheet is connected it returns an empty list and the site shows its starter tips.
 */
const CACHE_SECONDS = 300;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
header('X-Content-Type-Options: nosniff');

$empty = json_encode(['ok' => true, 'tips' => []]);
$sheet = is_file(__DIR__ . '/lead-sheet.php') ? (include __DIR__ . '/lead-sheet.php') : null;
if (!is_array($sheet) || empty($sheet['url']) || !function_exists('curl_init')) { echo $empty; exit; }

$cache = sys_get_temp_dir() . '/cpa_tips_' . hash('sha256', $sheet['url']) . '.json';
if (is_file($cache) && time() - filemtime($cache) < CACHE_SECONDS) { readfile($cache); exit; }

$ch = curl_init($sheet['url'] . (str_contains($sheet['url'], '?') ? '&' : '?') . http_build_query(['action' => 'tips', 'secret' => $sheet['secret'] ?? '']));
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 8]);
$raw = curl_exec($ch);
$data = is_string($raw) ? json_decode($raw, true) : null;

if (!is_array($data) || empty($data['ok']) || !is_array($data['tips'] ?? null)) {
	// Google didn't answer: serve the last good copy if there is one, otherwise an empty list.
	if (is_file($cache)) { readfile($cache); exit; }
	echo $empty; exit;
}

$tips = [];
foreach (array_slice($data['tips'], 0, 40) as $t) {
	$tip = trim((string) ($t['tip'] ?? ''));
	if ($tip === '') continue;
	$tips[] = ['date' => mb_substr((string) ($t['date'] ?? ''), 0, 20), 'category' => mb_substr((string) ($t['category'] ?? 'Tip'), 0, 40), 'tip' => mb_substr($tip, 0, 600), 'by' => mb_substr((string) ($t['by'] ?? ''), 0, 40)];
}
$out = json_encode(['ok' => true, 'tips' => $tips]);
@file_put_contents($cache, $out, LOCK_EX);
echo $out;
