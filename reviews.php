<?php
/**
 * Claw Point Advisory: approved client reviews for the Reviews section.
 * Reads the "Reviews" tab of the leads sheet (rows with Approve ticked) once lead-sheet.php is set up.
 * Only the name, role, deal type, rating, review and date are returned; emails never leave the sheet.
 */
const CACHE_SECONDS = 600;
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120');
header('X-Content-Type-Options: nosniff');

$cache = sys_get_temp_dir() . '/cpa_reviews_v1.json';
if (is_file($cache) && time() - filemtime($cache) < CACHE_SECONDS) { readfile($cache); exit; }

$sheet = is_file(__DIR__ . '/lead-sheet.php') ? (include __DIR__ . '/lead-sheet.php') : null;
if (!is_array($sheet) || empty($sheet['url']) || !function_exists('curl_init')) { echo json_encode(['ok' => true, 'reviews' => []]); exit; }

$ch = curl_init($sheet['url'] . (str_contains($sheet['url'], '?') ? '&' : '?') . http_build_query(['action' => 'reviews', 'secret' => $sheet['secret'] ?? '']));
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 10]);
$raw = curl_exec($ch);
$data = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($data['reviews'] ?? null)) { if (is_file($cache)) { readfile($cache); exit; } echo json_encode(['ok' => true, 'reviews' => []]); exit; }

$out = [];
foreach (array_slice($data['reviews'], 0, 60) as $r) {
	$text = trim((string) ($r['text'] ?? '')); $name = trim((string) ($r['name'] ?? ''));
	$rating = max(1, min(5, (int) ($r['rating'] ?? 5)));
	if ($text === '' || $name === '') continue;
	$out[] = ['name' => mb_substr($name, 0, 80), 'role' => mb_substr((string) ($r['role'] ?? ''), 0, 120), 'deal' => mb_substr((string) ($r['deal'] ?? ''), 0, 40),
		'rating' => $rating, 'text' => mb_substr($text, 0, 2000), 'date' => mb_substr((string) ($r['date'] ?? ''), 0, 10)];
}
$json = json_encode(['ok' => true, 'reviews' => $out], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
@file_put_contents($cache, $json, LOCK_EX);
echo $json;
