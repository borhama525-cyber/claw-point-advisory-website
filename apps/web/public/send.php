<?php
/**
 * Claw Point Advisory: emails website forms (deal requests, enquiries, newsletter sign-ups)
 * to the team, with uploaded documents attached. Runs on any Hostinger web hosting plan (PHP).
 *
 * To change where emails go, edit TO_EMAIL below.
 */
const TO_EMAIL = 'clawpointadvisory@gmail.com';
const MAX_FILE_BYTES = 5 * 1024 * 1024;   // 5 MB per file
const MAX_FILES = 11;                     // purchase agreement + up to 10 other documents
const MAX_PER_HOUR = 12;                  // submissions per visitor per hour
const ALLOWED_TYPES = ['application/pdf' => 'pdf', 'image/png' => 'png', 'image/jpeg' => 'jpg'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $body): void { http_response_code($status); echo json_encode($body); exit; }
function field(string $key, int $max = 300): string { $v = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : ''; return mb_substr(str_replace(["\r\n", "\r"], "\n", $v), 0, $max); }
function oneLine(string $v): string { return trim(preg_replace('/[\r\n\t]+/', ' ', $v)); }
function esc(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }
function money(string $v): string { $n = (float) preg_replace('/[^0-9.]/', '', $v); return $n > 0 ? '$' . number_format($n) : ''; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'Use POST.']);
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) reply(413, ['ok' => false, 'error' => 'The files are too large. Please keep each file under 5 MB.']);

// Bots fill the hidden "company_website" field; pretend success and send nothing.
if (field('company_website') !== '') reply(200, ['ok' => true]);

// Simple per-visitor rate limit, stored in the server's temp folder.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/cpa_form_' . hash('sha256', $ip . date('YmdH'));
$count = is_file($bucket) ? (int) file_get_contents($bucket) : 0;
if ($count >= MAX_PER_HOUR) reply(429, ['ok' => false, 'error' => 'Too many submissions. Please try again later, or text us.']);
@file_put_contents($bucket, (string) ($count + 1), LOCK_EX);

$form = field('form', 20);
$email = oneLine(field('email', 200));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) reply(422, ['ok' => false, 'error' => 'Please enter a valid email address.']);

$rows = []; $subject = ''; $intro = '';
if ($form === 'deal') {
	$required = ['first_name' => 'first name', 'last_name' => 'last name', 'phone' => 'phone', 'address' => 'property address', 'city' => 'city', 'state' => 'state', 'zip' => 'ZIP', 'property_type' => 'property type', 'close_date' => 'close date', 'purchase_price' => 'purchase price', 'requested_funding' => 'requested funding'];
	foreach ($required as $key => $label) if (field($key) === '') reply(422, ['ok' => false, 'error' => "Please fill in the {$label}."]);
	if (field('consent') !== 'true') reply(422, ['ok' => false, 'error' => 'Please tick the consent box.']);
	$types = ['stack' => 'Stack Method', 'echo' => 'Echo Method', 'double-close' => 'Double Close', 'emd' => 'EMD'];
	$type = $types[field('method', 20)] ?? 'Funding';
	$name = oneLine(field('first_name', 100) . ' ' . field('last_name', 100));
	$subject = "New {$type} request: {$name}";
	$intro = "A new {$type} funding request was submitted on the website.";
	$rows = [
		'Deal type' => $type, 'Borrower' => $name, 'Email' => $email, 'Phone' => field('phone', 40),
		'Property type' => oneLine(field('property_type', 40)),
		'Property' => oneLine(field('address') . ', ' . field('city', 120) . ', ' . field('state', 2) . ' ' . field('zip', 10)),
		'Target close date' => field('close_date', 20), 'Purchase price' => money(field('purchase_price')), 'Seller finance' => money(field('seller_finance')),
		'B–C price / ARV' => money(field('resale_price')), 'Primary loan' => money(field('primary_loan')), 'Requested funding' => money(field('requested_funding')), 'Needs a primary lender' => field('needs_lender', 3) === 'Yes' ? 'Yes, please provide one' : '',
		'Description' => field('description', 5000),
		'Referred by' => oneLine(field('referrer_first_name', 100) . ' ' . field('referrer_last_name', 100)), 'Referrer email' => oneLine(field('referrer_email', 200)), 'Referrer phone' => field('referrer_phone', 40),
	];
} elseif ($form === 'enquiry') {
	if (field('message', 5000) === '') reply(422, ['ok' => false, 'error' => 'Please tell us about your transaction.']);
	$name = oneLine(field('name', 200));
	$subject = 'New website enquiry: ' . ($name !== '' ? $name : $email);
	$intro = 'A new enquiry was sent from the website’s contact form.';
	$rows = ['Topic' => oneLine(field('topic', 80)), 'Name' => $name, 'Email' => $email, 'Phone' => field('phone', 60), 'Message' => field('message', 5000)];
} elseif ($form === 'newsletter') {
	$subject = "New newsletter sign-up: {$email}";
	$intro = 'Someone signed up for updates on the website.';
	$rows = ['Email' => $email];
} else {
	reply(400, ['ok' => false, 'error' => 'Unknown form.']);
}

// Attachments (deal requests only): the purchase agreement is required.
$attachments = [];
if ($form === 'deal') {
	$files = [];
	if (isset($_FILES['purchase_agreement'])) $files[] = $_FILES['purchase_agreement'];
	if (isset($_FILES['documents']) && is_array($_FILES['documents']['name'])) {
		foreach ($_FILES['documents']['name'] as $i => $n) $files[] = ['name' => $n, 'type' => $_FILES['documents']['type'][$i], 'tmp_name' => $_FILES['documents']['tmp_name'][$i], 'error' => $_FILES['documents']['error'][$i], 'size' => $_FILES['documents']['size'][$i]];
	}
	$files = array_values(array_filter($files, fn($f) => ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE));
	if (!isset($_FILES['purchase_agreement']) || ($_FILES['purchase_agreement']['error'] ?? 4) !== UPLOAD_ERR_OK) reply(422, ['ok' => false, 'error' => 'Please attach the purchase and sale agreement.']);
	if (count($files) > MAX_FILES) reply(422, ['ok' => false, 'error' => 'Please attach at most 11 files.']);
	$finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
	foreach ($files as $f) {
		if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) reply(422, ['ok' => false, 'error' => 'A file could not be uploaded. Please try again.']);
		if ($f['size'] > MAX_FILE_BYTES) reply(422, ['ok' => false, 'error' => 'Each file must be under 5 MB.']);
		$mime = $finfo ? finfo_file($finfo, $f['tmp_name']) : $f['type'];
		if (!isset(ALLOWED_TYPES[$mime])) reply(422, ['ok' => false, 'error' => 'Files must be PDF, PNG or JPG.']);
		$base = preg_replace('/[^A-Za-z0-9._-]+/', '_', pathinfo($f['name'], PATHINFO_FILENAME)) ?: 'document';
		$attachments[] = ['name' => mb_substr($base, 0, 80) . '.' . ALLOWED_TYPES[$mime], 'mime' => $mime, 'data' => file_get_contents($f['tmp_name'])];
	}
	$rows['Documents'] = count($attachments) . ' attached';
}

$rows = array_filter($rows, fn($v) => trim((string) $v) !== '');

// Save the lead to the Google Sheet ("Website Leads" tab) when lead-sheet.php is set up.
// Runs before the email so a lead is kept even if mail delivery has a problem.
$sheet = is_file(__DIR__ . '/lead-sheet.php') ? (include __DIR__ . '/lead-sheet.php') : null;
if (is_array($sheet) && !empty($sheet['url']) && function_exists('curl_init')) {
	$sources = ['deal' => 'Deal request', 'enquiry' => 'Contact form', 'newsletter' => 'Newsletter'];
	$funding = ['deal' => $rows['Deal type'] ?? 'Funding', 'enquiry' => 'General enquiry', 'newsletter' => 'Newsletter'];
	$num = fn(string $k) => (string) ((float) preg_replace('/[^0-9.]/', '', field($k)) ?: '');
	$lead = ['secret' => $sheet['secret'] ?? '', 'source' => $sources[$form], 'funding_type' => $funding[$form], 'email' => $email,
		'name' => $rows['Borrower'] ?? $rows['Name'] ?? '', 'phone' => $rows['Phone'] ?? '',
		'topic' => $form === 'enquiry' ? ($rows['Topic'] ?? '') : '', 'property_type' => $rows['Property type'] ?? '',
		'address' => $rows['Property'] ?? '', 'close_date' => $form === 'deal' ? field('close_date', 20) : '',
		'purchase_price' => $form === 'deal' ? $num('purchase_price') : '', 'requested_funding' => $form === 'deal' ? $num('requested_funding') : '',
		'needs_lender' => isset($rows['Needs a primary lender']) ? 'Yes' : ($form === 'deal' ? 'No' : ''),
		'message' => $rows['Description'] ?? $rows['Message'] ?? '',
		'referred_by' => trim(($rows['Referred by'] ?? '') . ' ' . ($rows['Referrer email'] ?? '')), 'documents' => $rows['Documents'] ?? ''];
	$ch = curl_init($sheet['url']);
	curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($lead), CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 8]);
	curl_exec($ch);
}

$html = '<div style="font-family:Arial,sans-serif;color:#141a17;max-width:620px"><p style="font-size:15px">' . esc($intro) . '</p><table style="border-collapse:collapse;width:100%;font-size:14px">';
foreach ($rows as $k => $v) {
	$cell = ($k === 'Email' || $k === 'Referrer email') ? '<a href="mailto:' . esc($v) . '">' . esc($v) . '</a>' : nl2br(esc($v));
	$html .= '<tr><td style="padding:8px 12px 8px 0;color:#55665f;vertical-align:top;white-space:nowrap">' . esc($k) . '</td><td style="padding:8px 0;border-bottom:1px solid #e3ece9">' . $cell . '</td></tr>';
}
$html .= '</table><p style="font-size:12px;color:#55665f;margin-top:18px">Reply to this email to answer the sender directly. Sent automatically by the Claw Point Advisory website.</p></div>';
$text = $intro . "\n\n" . implode("\n", array_map(fn($k, $v) => "{$k}: {$v}", array_keys($rows), $rows));

// From an address on this website's own domain (better delivery); replies go to the visitor.
$host = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
$from = 'no-reply@' . (filter_var('x@' . $host, FILTER_VALIDATE_EMAIL) ? $host : 'localhost');
$boundary = 'cpa_' . bin2hex(random_bytes(12));
$alt = 'alt_' . bin2hex(random_bytes(12));
$headers = implode("\r\n", [
	'From: Claw Point Advisory Website <' . $from . '>',
	'Reply-To: ' . $email,
	'MIME-Version: 1.0',
	'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
]);
$body = "--{$boundary}\r\nContent-Type: multipart/alternative; boundary=\"{$alt}\"\r\n\r\n"
	. "--{$alt}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
	. "--{$alt}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
	. "--{$alt}--\r\n";
foreach ($attachments as $a) {
	$body .= "--{$boundary}\r\nContent-Type: {$a['mime']}; name=\"{$a['name']}\"\r\nContent-Disposition: attachment; filename=\"{$a['name']}\"\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($a['data']));
}
$body .= "--{$boundary}--";

$encodedSubject = '=?UTF-8?B?' . base64_encode(oneLine($subject)) . '?=';
$sent = @mail(TO_EMAIL, $encodedSubject, $body, $headers, '-f' . $from);
if (!$sent) reply(502, ['ok' => false, 'error' => 'We couldn’t send your message right now. Please text us or try again.']);
reply(200, ['ok' => true]);
