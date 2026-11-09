import type { Route } from './+types/reviews';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { ReviewsPage } from '@/components/reviews/reviews';
export function meta({matches,location}:Route.MetaArgs){return [...seo({matches,location},{title:'Leave a Review | Claw Point Advisory',description:'Worked with Claw Point Advisory? Leave a private review for the team.',image:siteImage}),{name:'robots',content:'noindex'}];}
export default function Reviews(){return <><PageHeading index="REVIEW" title="Tell us how we did." text="Closed a deal with us? Leave a private review. Only the Claw Point team sees it, and it helps us get better."/><ReviewsPage/></>;}
