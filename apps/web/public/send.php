<?php
/**
 * Claw Point Advisory: emails website forms (deal requests, enquiries, newsletter sign-ups)
 * to the team, with uploaded documents attached. Runs on any Hostinger web hosting plan (PHP).
 *
 * To change where emails go, edit TO_EMAIL below.
 */
const TO_EMAIL = 'clawpointadvisory@gmail.com';
// Sends from the real Hostinger mailbox on the live domain (DKIM-signed, so it reaches the inbox).
const FROM_EMAIL = 'info@clawpoint.capital';
const LEADS_SHEET = 'https://docs.google.com/spreadsheets/d/1Kr1Ejrtb4dO89KP3XjHGKJ9K6R0NsCXw5eLgyH5QzYA/edit';
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

/**
 * Sends through the domain mailbox over authenticated SMTP when smtp-settings.php exists (so the mail is
 * DKIM-signed and lands in the inbox); otherwise falls back to PHP mail(). smtp-settings.php is created on
 * the server only (never in the code repository) and returns ['host', 'port', 'user', 'pass'].
 */
function deliver(string $to, string $cc, string $subject, string $headers, string $body, string $from): bool {
	$smtp = is_file(__DIR__ . '/smtp-settings.php') ? (include __DIR__ . '/smtp-settings.php') : null;
	if (!is_array($smtp) || empty($smtp['user']) || empty($smtp['pass']) || $smtp['pass'] === 'PUT-PASSWORD-HERE') {
		return @mail($to, $subject, $body, ($cc !== '' ? "Cc: {$cc}\r\n" : '') . $headers, '-f' . $from);
	}
	$target = str_contains($smtp['host'] ?? '', '://') ? $smtp['host'] : 'ssl://' . ($smtp['host'] ?? 'smtp.hostinger.com') . ':' . (int) ($smtp['port'] ?? 465); // a full URL (e.g. tcp://127.0.0.1:2525) is for local testing
	$fp = @stream_socket_client($target, $errno, $errstr, 10);
	if (!$fp) return @mail($to, $subject, $body, ($cc !== '' ? "Cc: {$cc}\r\n" : '') . $headers, '-f' . $from);
	stream_set_timeout($fp, 10);
	$read = function () use ($fp): string { $out = ''; while (($line = fgets($fp, 515)) !== false) { $out .= $line; if (isset($line[3]) && $line[3] === ' ') break; } return $out; };
	$cmd = function (string $c, array $ok) use ($fp, $read): bool { fwrite($fp, $c . "\r\n"); return in_array((int) substr($read(), 0, 3), $ok, true); };
	$ok = in_array((int) substr($read(), 0, 3), [220], true)
		&& $cmd('EHLO ' . (preg_replace('/[^A-Za-z0-9.-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost') ?: 'localhost'), [250])
		&& $cmd('AUTH LOGIN', [334]) && $cmd(base64_encode($smtp['user']), [334]) && $cmd(base64_encode($smtp['pass']), [235])
		&& $cmd('MAIL FROM:<' . $smtp['user'] . '>', [250])
		&& $cmd('RCPT TO:<' . $to . '>', [250, 251])
		&& ($cc === '' || $cmd('RCPT TO:<' . $cc . '>', [250, 251]))
		&& $cmd('DATA', [354]);
	if ($ok) {
		$msg = 'To: ' . $to . "\r\n" . ($cc !== '' ? 'Cc: ' . $cc . "\r\n" : '') . 'Subject: ' . $subject . "\r\n" . 'Date: ' . date('r') . "\r\n"
			. 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . substr(strrchr($smtp['user'], '@'), 1) . ">\r\n" . $headers . "\r\n\r\n" . $body;
		$ok = $cmd(preg_replace('/^\./m', '..', str_replace(["\r\n", "\r", "\n"], ["\n", "\n", "\r\n"], $msg)) . "\r\n.", [250]);
	}
	$cmd('QUIT', [221]); fclose($fp);
	// Wrong password or mailbox trouble: still deliver the old way rather than lose the message.
	return $ok ?: @mail($to, $subject, $body, ($cc !== '' ? "Cc: {$cc}\r\n" : '') . $headers, '-f' . $from);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'Use POST.']);
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) reply(413, ['ok' => false, 'error' => 'The files are too large. Please keep each file under 5 MB.']);

// Bots fill the hidden "company_website" field; pretend success and send nothing.
if (field('company_website') !== '') reply(200, ['ok' => true]);

// Simple per-visitor rate limit, stored in the server's temp folder.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/cpa_form_' . hash('sha256', $ip . date('YmdH'));
$count = is_file($bucket) ? (int) file_get_contents($bucket) : 0;
if ($count >= MAX_PER_HOUR) reply(429, ['ok' => false, 'error' => 'Too many submissions. Please try again later, or email clawpointadvisory@gmail.com.']);
@file_put_contents($bucket, (string) ($count + 1), LOCK_EX);

$form = field('form', 20);
$email = oneLine(field('email', 200));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) reply(422, ['ok' => false, 'error' => 'Please enter a valid email address.']);

$rows = []; $subject = ''; $intro = '';
if ($form === 'deal') {
	$required = ['first_name' => 'first name', 'last_name' => 'last name', 'phone' => 'phone', 'address' => 'property address', 'city' => 'city', 'state' => 'state', 'zip' => 'ZIP', 'property_type' => 'property type', 'close_date' => 'close date', 'purchase_price' => 'purchase price', 'requested_funding' => 'requested funding'];
	foreach ($required as $key => $label) if (field($key) === '') reply(422, ['ok' => false, 'error' => "Please fill in the {$label}."]);
	if (field('consent') !== 'true') reply(422, ['ok' => false, 'error' => 'Please click the consent box.']);
	$types = ['stack' => 'Stack Method', 'echo' => 'Echo Method', 'double-close' => 'Double Close', 'emd' => 'EMD'];
	$type = $types[field('method', 20)] ?? 'Funding';
	$name = oneLine(field('first_name', 100) . ' ' . field('last_name', 100));
	$subject = "New funding inquiry · {$type}: {$name}";
	$intro = "A new {$type} funding request was submitted on the website.";
	$rows = [
		'Deal type' => $type, 'Borrower' => $name, 'Email' => $email, 'Phone' => field('phone', 40),
		'Property type' => oneLine(field('property_type', 40)),
		'Property' => oneLine(field('address') . ', ' . field('city', 120) . ', ' . field('state', 2) . ' ' . field('zip', 10)),
		'Target close date' => preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', field('close_date', 20), $d) ? "{$d[2]}/{$d[3]}/{$d[1]}" : field('close_date', 20), 'Purchase price' => money(field('purchase_price')), 'Seller finance' => money(field('seller_finance')),
		'B–C price / ARV' => money(field('resale_price')), 'Primary loan' => money(field('primary_loan')), 'Requested funding' => money(field('requested_funding')), 'Needs a primary lender' => field('needs_lender', 3) === 'Yes' ? 'Yes, please provide one' : '',
		'Description' => field('description', 5000),
		'Referred by' => oneLine(field('referrer_first_name', 100) . ' ' . field('referrer_last_name', 100)), 'Referrer email' => oneLine(field('referrer_email', 200)), 'Referrer phone' => field('referrer_phone', 40),
	];
	// Escrow agent: asked only for states where title and escrow are separate; otherwise title handles it.
	$escrow = function () use (&$party) {
		$mode = field('escrow_mode', 10) ?: 'same';
		if (!in_array($mode, ['same', 'have', 'need'], true)) reply(422, ['ok' => false, 'error' => 'Please choose an escrow option.']);
		return $mode === 'have' ? $party('escrow', 'escrow company') : ($mode === 'need' ? 'Needs an escrow agent: please provide one' : 'Same company as title');
	};
	$party = function (string $p, string $label) {
		$parts = ['company' => 'name', 'contact' => 'officer name', 'email' => 'email', 'phone' => 'phone'] + ($p === 'title' ? ['website' => 'website'] : []);
		foreach ($parts as $k => $l) if (field("{$p}_{$k}") === '') reply(422, ['ok' => false, 'error' => "Please add the {$label} {$l}."]);
		if (!filter_var(field("{$p}_email"), FILTER_VALIDATE_EMAIL)) reply(422, ['ok' => false, 'error' => "Please enter a valid {$label} email."]);
		$site = '';
		if ($p === 'title') {
			$site = preg_replace('~^(?!https?://)~i', 'https://', oneLine(field('title_website', 200)));
			if (!filter_var($site, FILTER_VALIDATE_URL) || !str_contains(parse_url($site, PHP_URL_HOST) ?? '', '.')) reply(422, ['ok' => false, 'error' => 'Please enter the title company website, like acmetitle.com.']);
		}
		return oneLine(field("{$p}_company") . ' · ' . field("{$p}_contact") . ' · ' . field("{$p}_email") . ' · ' . field("{$p}_phone", 40) . ($site ? " · {$site}" : ''));
	};
	if (field('method', 20) === 'double-close') {
		$rows['Title company'] = $party('title', 'title company');
		$rows['Escrow agent'] = $escrow();
		if (field('intro_ack', 3) !== 'Yes') reply(422, ['ok' => false, 'error' => 'Please confirm you’ll introduce us to your title and escrow contacts.']);
		$rows['Intro to title/escrow'] = 'Borrower will send the intro email (cc us)';
	}
	if (field('method', 20) === 'emd') {
		$role = field('emd_role', 40);
		if (!in_array($role, ['Buyer', 'Wholesaler acting as buyer'], true)) reply(422, ['ok' => false, 'error' => 'Please choose your role on the PSA.']);
		$days = (int) field('inspection_days', 3);
		if ($days < 1) reply(422, ['ok' => false, 'error' => 'Please enter the inspection period in days.']);
		$rows = array_combine(array_map(fn($k) => $k === 'Requested funding' ? 'EMD amount' : $k, array_keys($rows)), $rows);
		unset($rows['B–C price / ARV'], $rows['Primary loan']);
		$rows['Role on PSA'] = $role;
		$rows['Inspection period'] = "{$days} days";
		$rows['Mutual release signers'] = $role === 'Buyer' ? 'Buyer and seller' : 'Wholesaler (buyer on the PSA) and seller';
		if (field('property_type', 40) === 'Commercial' && $days >= 60) $rows['EMD structure'] = 'Commercial, ' . ($days >= 90 ? '90+' : '60+') . ' day inspection: 30-day fee structure and mutual EMD loan agreement';
		if (field('title_mode', 10) === 'chosen') $rows['Title company'] = $party('title', 'title company');
		else $rows['Title company'] = 'TBD on the PSA';
		if (field('escrow_mode', 10) !== '') $rows['Escrow agent'] = $escrow();
	}
} elseif ($form === 'enquiry') {
	if (field('message', 5000) === '') reply(422, ['ok' => false, 'error' => 'Please tell us about your transaction.']);
	$name = oneLine(field('name', 200));
	$subject = 'New website lead · Contact form: ' . ($name !== '' ? $name : $email);
	$intro = 'A new inquiry was sent from the website’s contact form.';
	$rows = ['Topic' => oneLine(field('topic', 80)), 'Name' => $name, 'Email' => $email, 'Phone' => field('phone', 60), 'Message' => field('message', 5000)];
} elseif ($form === 'network') {
	// Keep in step with src/data/network.ts.
	$allowed = ['Title company', 'Escrow company', 'Real estate attorney', 'Transaction coordinator (TC)', 'Closing agent / notary', 'Buyer / investor', 'Institutional buyer', 'Family office', 'Fund / syndicator', 'Private lender', 'Hard money lender', 'Mortgage broker / loan officer', 'Developer', 'Builder', 'Wholesaler', 'Land wholesaler', 'Creative finance / Subto investor', 'Acquisitions manager', 'Dispositions manager', 'Bird dog', 'Real estate agent', 'Real estate broker', 'Commercial broker', 'Land broker', 'Business broker', 'Property manager', 'General contractor', 'Appraiser', 'Inspector', 'Insurance agent', 'CPA / tax advisor', 'Other'];
	$list = fn(string $k, array $ok) => array_values(array_intersect(array_map('strval', (array) ($_POST[$k] ?? [])), $ok));
	$roles = $list('roles', $allowed);
	if (!$roles) reply(422, ['ok' => false, 'error' => 'Please choose at least one role.']);
	if (in_array('Other', $roles, true)) $roles[array_search('Other', $roles, true)] = 'Other: ' . (oneLine(field('role_other', 100)) ?: 'not specified');
	$name = oneLine(field('name', 200));
	if ($name === '' || field('phone', 60) === '' || field('markets', 300) === '') reply(422, ['ok' => false, 'error' => 'Please add your name, phone and markets.']);
	if (field('consent') !== 'true') reply(422, ['ok' => false, 'error' => 'Please click the consent box.']);
	$subject = 'New website lead · Network: ' . $name . ' (' . implode(', ', array_map(fn($r) => explode(' (', $r)[0], $roles)) . ')';
	$intro = 'Someone joined the network list on the website.';
	$rows = ['Role' => implode(', ', $roles), 'Name' => $name, 'Company' => oneLine(field('company', 200)), 'Email' => $email, 'Phone' => field('phone', 60),
		'Markets' => oneLine(field('markets', 300)), 'Asset types' => implode(', ', $list('assets', ['Single family', 'Multifamily', 'Commercial', 'Industrial', 'Land'])),
		'How they want to work with us' => field('message', 3000), 'Website' => oneLine(field('website', 200)), 'LinkedIn / Instagram' => oneLine(field('social', 200))];
} elseif ($form === 'review') {
	$name = oneLine(field('name', 120));
	$review = field('review', 2000);
	$rating = (int) field('rating', 1);
	if ($name === '' || mb_strlen($review) < 10) reply(422, ['ok' => false, 'error' => 'Please add your name and a few words about your experience.']);
	if ($rating < 1 || $rating > 5) reply(422, ['ok' => false, 'error' => 'Please choose a star rating.']);
	$stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
	$subject = "New website review · {$stars} from {$name}";
	$intro = 'A client left a private review on the website. It is saved in the Reviews tab of the sheet and is not shown on the site.';
	$ref = preg_replace('/[^a-z0-9]/i', '', field('ref', 16));
	// Only clients with an after-closing review link (which carries the deal's code) can leave a review.
	if ($ref === '') reply(403, ['ok' => false, 'error' => 'Reviews can only be left from the link we send after your closing.']);
	if ($ref !== '') $intro = 'A client left a private review after their deal closed. It is saved in the Reviews tab and linked to the deal in Website Leads.';
	$rows = ['Rating' => "{$stars} ({$rating} of 5)", 'Name' => $name, 'Role / company' => oneLine(field('role', 120)), 'Deal type' => oneLine(field('deal', 40)), 'Review' => $review, 'Email' => $email, 'Closed deal ref' => $ref];
} elseif ($form === 'newsletter') {
	$subject = "New website lead · Newsletter: {$email}";
	$intro = 'Someone signed up for updates on the website.';
	$rows = ['Email' => $email];
} else {
	reply(400, ['ok' => false, 'error' => 'Unknown form.']);
}

// Attachments (deal requests only): the purchase agreement is required.
$attachments = [];
if ($form === 'deal') {
	// Paperwork each funding type must include (keep in step with src/data/required-docs.ts).
	// Key endings: * the lender's own document, waived when we provide the lender; + required only when the
	// borrower has their own lender; ? always optional.
	$required = [
		'stack' => ['psa?' => 'Purchase contract (PSA)', 'lender_terms*' => 'Primary lender term sheet', 'loi+' => 'LOI (letter of intent)', 'seller_terms?' => 'Seller-carry terms'],
		'echo' => ['ab_contract' => 'A–B purchase contract', 'bc_contract' => 'B–C purchase contract', 'lender_terms*' => 'End buyer’s lender term sheet or approval'],
		'double-close' => ['ab_contract' => 'A–B purchase contract', 'bc_contract' => 'B–C purchase contract', 'bc_hud' => 'B–C HUD / settlement statement', 'escrow_receipt' => 'Escrow receipt for the buyer’s funds'],
		'emd' => ['contract' => 'Signed purchase contract (PSA)'],
	][field('method', 20)] ?? [];
	$needsLender = field('needs_lender', 3) === 'Yes';
	$files = []; $docList = []; $missing = [];
	foreach ($required as $key => $label) {
		$lenderDoc = str_ends_with($key, '*'); $optional = str_ends_with($key, '?') || (str_ends_with($key, '+') && $needsLender); $key = rtrim($key, '*?+');
		$f = $_FILES["doc_{$key}"] ?? null;
		$has = $f && ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
		if ($has) { $files[] = $f + ['label' => $label]; $docList[] = "✓ {$label}"; }
		elseif ($lenderDoc && $needsLender) $docList[] = "– {$label}: not needed, we provide the lender";
		elseif ($optional) $docList[] = "– {$label}: not sent yet";
		else $missing[] = $label;
	}
	if ($missing) reply(422, ['ok' => false, 'error' => 'Please attach the required documents: ' . implode(', ', $missing) . '.']);
	if (isset($_FILES['documents']) && is_array($_FILES['documents']['name'])) {
		foreach ($_FILES['documents']['name'] as $i => $n) {
			if ($_FILES['documents']['error'][$i] === UPLOAD_ERR_NO_FILE) continue;
			$files[] = ['name' => $n, 'type' => $_FILES['documents']['type'][$i], 'tmp_name' => $_FILES['documents']['tmp_name'][$i], 'error' => $_FILES['documents']['error'][$i], 'size' => $_FILES['documents']['size'][$i], 'label' => 'Other'];
		}
	}
	if (count($files) > MAX_FILES) reply(422, ['ok' => false, 'error' => 'Please attach at most 11 files.']);
	$finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
	foreach ($files as $f) {
		if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) reply(422, ['ok' => false, 'error' => 'A file could not be uploaded. Please try again.']);
		if ($f['size'] > MAX_FILE_BYTES) reply(422, ['ok' => false, 'error' => 'Each file must be under 5 MB.']);
		$mime = $finfo ? finfo_file($finfo, $f['tmp_name']) : $f['type'];
		if (!isset(ALLOWED_TYPES[$mime])) reply(422, ['ok' => false, 'error' => 'Files must be PDF, PNG or JPG.']);
		$prefix = preg_replace('/[^A-Za-z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $f['label']) ?: 'Document');
		$base = preg_replace('/[^A-Za-z0-9._-]+/', '_', pathinfo($f['name'], PATHINFO_FILENAME)) ?: 'document';
		$attachments[] = ['name' => mb_substr(trim($prefix, '-') . ' - ' . $base, 0, 100) . '.' . ALLOWED_TYPES[$mime], 'mime' => $mime, 'data' => file_get_contents($f['tmp_name'])];
	}
	$others = count($files) - count(array_filter($files, fn($f) => $f['label'] !== 'Other'));
	if ($others) $docList[] = "+ {$others} other document" . ($others > 1 ? 's' : '');
	$rows['Required paperwork'] = implode("\n", $docList);
	$rows['Documents'] = count($attachments) . ' attached';
	$rows['Calculator numbers'] = field('calculator_summary', 3000);
}

$rows = array_filter($rows, fn($v) => trim((string) $v) !== '');

// Save the lead to the Deal Flow Lead Tracker when lead-sheet.php is set up: funding requests, contact
// messages and newsletter sign-ups go to "Website Leads", network sign-ups to "Website Network", reviews to "Reviews".
// Runs before the email so a lead is kept even if mail delivery has a problem.
$sheet = is_file(__DIR__ . '/lead-sheet.php') ? (include __DIR__ . '/lead-sheet.php') : null;
if (is_array($sheet) && !empty($sheet['url']) && function_exists('curl_init')) {
	if ($form === 'review') {
		// Reviews are private: they go to their own tab and are never shown on the site.
		$lead = ['secret' => $sheet['secret'] ?? '', 'kind' => 'review', 'name' => $rows['Name'], 'email' => $email, 'role' => $rows['Role / company'] ?? '',
			'deal' => $rows['Deal type'] ?? '', 'rating' => (string) $rating, 'review' => $rows['Review'], 'ref' => $rows['Closed deal ref'] ?? ''];
	} elseif ($form === 'network') {
		// Network sign-ups have their own tab ("Website Network").
		$lead = ['secret' => $sheet['secret'] ?? '', 'kind' => 'network', 'name' => $rows['Name'] ?? '', 'company' => $rows['Company'] ?? '', 'email' => $email,
			'phone' => $rows['Phone'] ?? '', 'role' => $rows['Role'] ?? '', 'markets' => $rows['Markets'] ?? '', 'assets' => $rows['Asset types'] ?? '',
			'message' => $rows['How they want to work with us'] ?? '', 'website' => $rows['Website'] ?? '', 'social' => $rows['LinkedIn / Instagram'] ?? ''];
	} else {
		$sources = ['deal' => 'Deal request', 'enquiry' => 'Contact form', 'newsletter' => 'Newsletter', 'network' => 'Network list'];
		$funding = ['deal' => $rows['Deal type'] ?? 'Funding', 'enquiry' => 'General inquiry', 'newsletter' => 'Newsletter', 'network' => 'Network'];
		$num = fn(string $k) => (string) ((float) preg_replace('/[^0-9.]/', '', field($k)) ?: '');
		$lead = ['secret' => $sheet['secret'] ?? '', 'source' => $sources[$form], 'funding_type' => $funding[$form], 'email' => $email,
			'name' => $rows['Borrower'] ?? $rows['Name'] ?? '', 'phone' => $rows['Phone'] ?? '',
			'topic' => $form === 'enquiry' ? ($rows['Topic'] ?? '') : ($form === 'network' ? ($rows['Role'] ?? '') : ''), 'property_type' => $rows['Property type'] ?? '',
			'address' => $rows['Property'] ?? '', 'close_date' => $form === 'deal' ? field('close_date', 20) : '',
			'purchase_price' => $form === 'deal' ? $num('purchase_price') : '', 'requested_funding' => $form === 'deal' ? $num('requested_funding') : '',
			'needs_lender' => isset($rows['Needs a primary lender']) ? 'Yes' : (in_array(field('method', 20), ['stack', 'echo'], true) && $form === 'deal' ? 'No' : ''),
			'message' => trim(implode("\n", array_filter([$rows['Description'] ?? $rows['Message'] ?? $rows['How they want to work with us'] ?? '', isset($rows['Markets']) ? 'Markets: ' . $rows['Markets'] : '', !empty($rows['Asset types']) ? 'Assets: ' . $rows['Asset types'] : '', !empty($rows['Company']) ? 'Company: ' . $rows['Company'] : '', !empty($rows['Website']) ? 'Website: ' . $rows['Website'] : '', !empty($rows['LinkedIn / Instagram']) ? 'Social: ' . $rows['LinkedIn / Instagram'] : '', isset($rows['Title company']) ? 'Title: ' . $rows['Title company'] : '', isset($rows['Escrow agent']) ? 'Escrow: ' . $rows['Escrow agent'] : '', isset($rows['Role on PSA']) ? 'Role on PSA: ' . $rows['Role on PSA'] : '', isset($rows['Inspection period']) ? 'Inspection: ' . $rows['Inspection period'] : '', $rows['EMD structure'] ?? '']))),
			'referred_by' => trim(($rows['Referred by'] ?? '') . ' ' . ($rows['Referrer email'] ?? '')), 'documents' => $rows['Required paperwork'] ?? ''];
	}
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
$html .= '</table><p style="font-size:12px;color:#55665f;margin-top:18px">Reply to this email to answer the sender directly. <a href="' . LEADS_SHEET . '" style="color:#24533d;font-weight:bold">Open the Website Leads sheet</a>. Sent automatically by the Claw Point Advisory website.</p></div>';
$text = $intro . "\n\n" . implode("\n", array_map(fn($k, $v) => "{$k}: {$v}", array_keys($rows), $rows)) . "\n\nWebsite Leads sheet: " . LEADS_SHEET;

// From the domain's own mailbox (better delivery); replies go to the visitor.
$host = preg_replace('/^www\./i', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
$from = str_ends_with(FROM_EMAIL, '@' . $host) ? FROM_EMAIL : 'no-reply@' . (filter_var('x@' . $host, FILTER_VALIDATE_EMAIL) ? $host : 'localhost');
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
$sent = deliver(TO_EMAIL, '', $encodedSubject, $headers, $body, $from);
if (!$sent) reply(502, ['ok' => false, 'error' => 'We couldn’t send your message right now. Please email clawpointadvisory@gmail.com or try again.']);

// Confirmation email to the person who submitted: network sign-ups and deal requests.
// A deal's referrer (if one was named) is copied. The wording is fixed; only their first name and
// a short summary of what they sent appear, so the form can't be used to send arbitrary email.
// A failed confirmation never fails the submission: the team already has it.
if ($form === 'deal' || $form === 'network') {
	$first = mb_substr(oneLine($form === 'deal' ? field('first_name', 60) : explode(' ', $name)[0]), 0, 40);
	$hi = $first !== '' ? "Hi {$first}," : 'Hi,';
	$cc = '';
	if ($form === 'deal') {
		$refEmail = oneLine(field('referrer_email', 200));
		if (filter_var($refEmail, FILTER_VALIDATE_EMAIL) && strcasecmp($refEmail, $email) !== 0) $cc = $refEmail;
		$refName = oneLine(field('referrer_first_name', 60) . ' ' . field('referrer_last_name', 60));
		$cSubject = "We received your {$type} request · Claw Point Advisory";
		$cTitle = 'Thanks for sending us your deal.';
		$cParas = [
			"Your {$type} funding request reached the Claw Point Advisory team. A real person on our team will review your file and get back to you with questions or next steps.",
			'Every transaction is reviewed individually. This email confirms we received your request; it is not an approval or a commitment to fund.',
		];
		if ($cc !== '') $cParas[] = ($refName !== '' ? $refName : 'The person who referred you') . ' referred this deal and is copied on this email.';
		$cRows = ['Deal type' => $type, 'Property' => $rows['Property'] ?? '', 'Target close date' => $rows['Target close date'] ?? '', 'Requested funding' => $rows['Requested funding'] ?? ($rows['EMD amount'] ?? '')];
	} else {
		$cSubject = 'Welcome to the Claw Point network';
		$cTitle = 'Thanks for joining the network.';
		$cParas = [
			'You’re on the Claw Point Advisory network list. Amira or Adam will reach out by text or email to learn how you work and how we can do deals together.',
			'In the meantime, you can send us a deal to fund, run the numbers with our free calculators, or book a call any time.',
		];
		$cRows = ['Role' => $rows['Role'] ?? '', 'Markets' => $rows['Markets'] ?? ''];
	}
	$cRows = array_filter($cRows, fn($v) => trim((string) $v) !== '');
	$site = 'https://' . $host;
	// Branded layout: email-safe tables and inline styles (Gmail, Outlook and Apple Mail ignore <style> blocks).
	$label = $form === 'deal' ? 'DEAL RECEIVED' : 'WELCOME TO THE NETWORK';
	$font = "font-family:Arial,Helvetica,sans-serif";
	$cHtml = '<div style="margin:0;padding:0;background:#eef5f3">'
		. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5f3;padding:28px 12px"><tr><td align="center">'
		. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d9e6e2">'
		// Header: logo + wordmark on brand green
		. '<tr><td style="background:#163327;padding:22px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>'
		. '<td style="vertical-align:middle"><img src="' . esc($site) . '/icon-192.png" width="44" height="44" alt="Claw Point" style="display:block;border:0;border-radius:10px"></td>'
		. '<td style="vertical-align:middle;padding-left:12px;' . $font . ';color:#ffffff"><div style="font-size:20px;font-weight:bold;letter-spacing:-.3px;line-height:1.1">Claw Point</div>'
		. '<div style="font-size:10px;letter-spacing:3px;color:#dcc64a;margin-top:3px">ADVISORY</div></td></tr></table></td></tr>'
		// Body
		. '<tr><td style="padding:30px 28px 8px;' . $font . ';color:#13201a;font-size:15px;line-height:1.65">'
		. '<div style="font-size:11px;font-weight:bold;letter-spacing:1.6px;color:#24533d;margin-bottom:10px">' . esc($label) . '</div>'
		. '<div style="font-size:24px;font-weight:bold;line-height:1.25;margin-bottom:16px;color:#13201a">' . esc($cTitle) . '</div>'
		. '<p style="margin:0 0 14px">' . esc($hi) . '</p>';
	foreach ($cParas as $para) $cHtml .= '<p style="margin:0 0 14px">' . esc($para) . '</p>';
	$cHtml .= '</td></tr>';
	// Summary card
	if ($cRows) {
		$cHtml .= '<tr><td style="padding:4px 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5f3;border-radius:12px;' . $font . ';font-size:14px">'
			. '<tr><td colspan="2" style="padding:14px 18px 4px;font-size:11px;font-weight:bold;letter-spacing:1.4px;color:#24533d">' . ($form === 'deal' ? 'YOUR REQUEST' : 'YOUR PROFILE') . '</td></tr>';
		foreach ($cRows as $k => $v) $cHtml .= '<tr><td style="padding:8px 18px;color:#55665f;white-space:nowrap;vertical-align:top;width:40%">' . esc($k) . '</td><td style="padding:8px 18px;color:#13201a;font-weight:bold">' . esc($v) . '</td></tr>';
		$cHtml .= '<tr><td colspan="2" style="height:10px;line-height:10px">&nbsp;</td></tr></table></td></tr>';
	}
	// Buttons
	$cHtml .= '<tr><td style="padding:22px 28px 6px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>'
		. '<td style="background:#13201a;border-radius:999px"><a href="' . esc($site) . '/booking/" style="display:inline-block;padding:13px 24px;' . $font . ';font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none">Book a call &rarr;</a></td>'
		. '<td style="width:10px"></td>'
		. '<td style="border:1px solid #13201a;border-radius:999px"><a href="' . esc($site) . ($form === 'deal' ? '/funding/' : '/calculators/') . '" style="display:inline-block;padding:12px 22px;' . $font . ';font-size:14px;font-weight:bold;color:#13201a;text-decoration:none">' . ($form === 'deal' ? 'How funding works' : 'Free deal calculators') . '</a></td>'
		. '</tr></table></td></tr>'
		// Sign-off
		. '<tr><td style="padding:22px 28px 28px;' . $font . ';color:#13201a;font-size:15px;line-height:1.6">Questions? Just reply to this email.<br><br><strong>The Claw Point Advisory team</strong></td></tr>'
		// Footer
		. '<tr><td style="background:#f6faf8;border-top:1px solid #e3ece9;padding:18px 28px;' . $font . ';font-size:12px;line-height:1.6;color:#55665f">'
		. 'Claw Point Advisory &middot; Real estate transactional funding<br>'
		. '<a href="' . esc($site) . '" style="color:#24533d;font-weight:bold;text-decoration:none">' . esc($host) . '</a> &middot; <a href="mailto:' . TO_EMAIL . '" style="color:#24533d;text-decoration:none">' . TO_EMAIL . '</a><br>'
		. '<span style="color:#8a9a94">Every transaction is reviewed individually. Nothing in this email is an offer or commitment to fund.</span>'
		. '</td></tr></table></td></tr></table></div>';
	$cText = $cTitle . "\n\n" . $hi . "\n\n" . implode("\n\n", $cParas)
		. ($cRows ? "\n\n" . implode("\n", array_map(fn($k, $v) => "{$k}: {$v}", array_keys($cRows), $cRows)) : '')
		. "\n\nQuestions? Just reply to this email, or book a call: {$site}/booking/\n\nThe Claw Point Advisory team\n{$site}";
	$cAlt = 'alt_' . bin2hex(random_bytes(12));
	$cHeaders = implode("\r\n", array_filter([
		'From: Claw Point Advisory <' . $from . '>',
		'Reply-To: ' . TO_EMAIL,
		'MIME-Version: 1.0',
		'Content-Type: multipart/alternative; boundary="' . $cAlt . '"',
	]));
	$cBody = "--{$cAlt}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($cText))
		. "--{$cAlt}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($cHtml))
		. "--{$cAlt}--";
	deliver($email, $cc, '=?UTF-8?B?' . base64_encode($cSubject) . '?=', $cHeaders, $cBody, $from);
}
reply(200, ['ok' => true]);
