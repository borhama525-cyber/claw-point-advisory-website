import type { Config } from '@react-router/dev/config';
import { articles } from './src/data/articles';

/**
 * Static export for regular Hostinger web hosting: every page is pre-built to HTML
 * at build time (no Node.js server needed). Forms post to `public/send.php`, and
 * sitemap.xml / robots.txt / llms.txt are served by small PHP files (see public/.htaccess).
 */
const CALCULATORS = ['stack', 'echo'];

export default {
	appDirectory: 'src',
	buildDirectory: '../../dist/apps/web',
	ssr: false,
	async prerender() {
		return [
			'/', '/funding', '/calculators', ...CALCULATORS.map(s => `/calculators/${s}`),
			'/stack', '/echo', '/booking', '/ask', '/contact', '/network', '/reviews', '/blog',
			...articles.map(a => `/blog/${a.slug}`),
		];
	},
} satisfies Config;
