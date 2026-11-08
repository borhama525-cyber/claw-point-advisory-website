<?php
// Shared by sitemap.php, robots.php and llms.php: this website's own address, detected on the server.
function site_origin(): string {
	$host = preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
	return 'https://' . $host;
}
// Hostinger's temporary addresses should stay out of search engines until a real domain is connected.
function is_temporary_host(): bool {
	return (bool) preg_match('/\.(hostingersite\.com|hostingersite\.dev|app-preview\.com|app-preview\.io)$/i', $_SERVER['HTTP_HOST'] ?? '');
}
