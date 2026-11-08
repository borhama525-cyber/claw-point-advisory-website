import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
    route('calculators', 'routes/calculators.tsx'),
    route('calculators/:slug', 'routes/calculator.$slug.tsx'),
    route('stack', 'routes/stack.tsx'),
    route('echo', 'routes/echo.tsx'),
    route('dscr', 'routes/dscr.tsx'),
    route('hard-money', 'routes/hard-money.tsx'),
    route('funding', 'routes/funding.tsx'),
    route('booking', 'routes/booking.tsx'),
    route('ask', 'routes/ask.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('blog', 'routes/blog.tsx'),
    route('blog/:slug', 'routes/blog.$slug.tsx'),
] satisfies RouteConfig;
