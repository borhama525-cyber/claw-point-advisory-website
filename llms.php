<?php
require __DIR__ . '/site-origin.php';
header('Content-Type: text/plain; charset=utf-8');
$o = site_origin();
echo "# Claw Point Advisory\n\n> Real estate transactional funding nationwide: Stack Method, Echo Method, double close, EMD, hard money and DSCR. Every deal is reviewed individually; no funding terms or approval are offered on the website.\n\n## Pages\n"
	. "- [Funding]({$o}/funding): How transactional funding works.\n"
	. "- [Deal calculators]({$o}/calculators): Stack, Echo, DSCR and hard money calculators.\n"
	. "- [Guides]({$o}/stack): Stack Method, [Echo]({$o}/echo), [DSCR]({$o}/dscr) and [Hard money]({$o}/hard-money).\n"
	. "- [Ask]({$o}/ask): Answers to common funding and underwriting questions.\n"
	. "- [Book a call]({$o}/booking): Schedule with Amira.\n"
	. "- [Contact]({$o}/contact): Send an enquiry.\n";
