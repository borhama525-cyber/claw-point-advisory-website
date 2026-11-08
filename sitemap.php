<?php
require __DIR__ . '/site-origin.php';
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$origin = site_origin();
$paths = ['/', '/funding', '/calculators', '/calculators/stack', '/calculators/echo', '/stack', '/echo', '/booking', '/ask', '/contact', '/network', '/reviews', '/blog', '/blog/transactional-funding-explained','/blog/prepare-your-funding-enquiry','/blog/double-closing-questions'];
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($paths as $p) echo "\t<url><loc>" . htmlspecialchars($origin . $p, ENT_XML1) . "</loc></url>\n";
echo '</urlset>' . "\n";
