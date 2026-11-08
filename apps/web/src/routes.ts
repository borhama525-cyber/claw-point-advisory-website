import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
    route('calculators', 'routes/calculators.tsx'),
    route('calculators/:slug', 'routes/calculator.$slug.tsx'),
    route('stack', 'routes/stack.tsx'),
    route('echo', 'routes/echo.tsx'),
    route('funding', 'routes/funding.tsx'),
    route('booking', 'routes/booking.tsx'),
    route('ask', 'routes/ask.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('network', 'routes/network.tsx'),
    route('reviews', 'routes/reviews.tsx'),
    route('blog', 'routes/blog.tsx'),
    route('blog/:slug', 'routes/blog.$slug.tsx'),
] satisfies RouteConfig;
