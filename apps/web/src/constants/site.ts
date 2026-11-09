/** The live domain. Canonical links, og:url and structured data use it, because the static build has no request to read it from. */
export const SITE_ORIGIN = 'https://clawpoint.capital';
/** Business pages for Claw Point itself (listed as the business's `sameAs`). Add company pages here when they exist. */
export const SOCIAL_LINKS: { name: string; url: string }[] = [];

/** Calendly events the booking page embeds, one per teammate. Change them here to switch meeting types. */
export const CALENDLY_URL = 'https://calendly.com/clawpointadvisory/schedule-with-amira';
export const ADAM_CALENDLY_URL = 'https://calendly.com/cashclawcapital/30min';
/** The team: names, titles, booking links and social profiles (both are founders; Amira is Managing Partner), shown in the Team chat card, footer and contact page. Only Amira's number (Google Voice) is public. */
export const TEAM_EMAIL = 'clawpointadvisory@gmail.com';
export const TEAM = [
	{
		name: 'Amira', fullName: 'Amira Borham', title: 'Founder & Managing Partner', owner: true, slug: 'amira', phone: { display: '(346) 291-5546', e164: '+13462915546' }, schedule: true, calendly: CALENDLY_URL, length: '1 hour',
		profiles: [
			{ name: 'LinkedIn', url: 'https://www.linkedin.com/in/amira-borham-b6219122a/' },
		],
	},
	{
		name: 'Adam', fullName: 'Adam Weiss', title: 'Founder & Partner', owner: true, slug: 'adam', phone: undefined as { display: string; e164: string } | undefined, schedule: true, calendly: ADAM_CALENDLY_URL, length: '1 hour',
		profiles: [
			{ name: 'LinkedIn', url: 'https://www.linkedin.com/in/adam-j-weiss-6144a51a7/' },
		],
	},
];
export const siteImage = 'https://images.hostinger.com/2deeaaef-b87c-40c2-a621-3d286ff074f6/056c939a-a907-4ca7-a36a-d4e80b757d22.png';
export const siteImageSet = `${siteImage}?width=375 375w, ${siteImage}?width=768 768w, ${siteImage}?width=1024 1024w, ${siteImage} 1344w`;
