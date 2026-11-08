<?php
require __DIR__ . '/site-origin.php';
header('Content-Type: text/plain; charset=utf-8');
if (is_temporary_host()) { echo "User-agent: *\nDisallow: /\n"; exit; }
echo "User-agent: *\nAllow: /\n\nSitemap: " . site_origin() . "/sitemap.xml\n";
