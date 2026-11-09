/** The live domain. Canonical links, og:url and structured data use it, because the static build has no request to read it from. */
export const SITE_ORIGIN = 'https://clawpoint.capital';
/** Business pages for Claw Point itself (listed as the business's `sameAs`). Add company pages here when they exist. */
export const SOCIAL_LINKS: { name: string; url: string }[] = [];
/** The founder and her personal profiles: shown in the footer and listed as the business's `founder` for search engines. */
export const FOUNDER = {
	name: 'Amira Borham',
	profiles: [
		{ name: 'Facebook', url: 'https://www.facebook.com/amira.borham.780643' },
		{ name: 'LinkedIn', url: 'https://www.linkedin.com/in/amira-borham-b6219122a/' },
	],
};
/** Calendly events the booking page embeds, one per teammate. Change them here to switch meeting types. */
export const CALENDLY_URL = 'https://calendly.com/clawpointadvisory/schedule-with-amira';
export const ADAM_CALENDLY_URL = 'https://calendly.com/cashclawcapital/30min';
/** Team contact details: shown in the Team chat card, footer and contact page. */
export const TEAM_EMAIL = 'clawpointadvisory@gmail.com';
export const TEAM = [
	{ name: 'Amira', slug: 'amira', display: '(346) 291-5546', e164: '+13462915546', schedule: true, calendly: CALENDLY_URL, length: '1 hour' },
	{ name: 'Adam', slug: 'adam', display: '+1 (347) 266-7772', e164: '+13472667772', schedule: true, calendly: ADAM_CALENDLY_URL, length: '1 hour' },
];
export const siteImage = 'https://images.hostinger.com/2deeaaef-b87c-40c2-a621-3d286ff074f6/056c939a-a907-4ca7-a36a-d4e80b757d22.png';
export const siteImageSet = `${siteImage}?width=375 375w, ${siteImage}?width=768 768w, ${siteImage}?width=1024 1024w, ${siteImage} 1344w`;
