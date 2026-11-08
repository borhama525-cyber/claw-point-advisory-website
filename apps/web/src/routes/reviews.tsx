import type { Route } from './+types/reviews';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { ReviewsPage } from '@/components/reviews/reviews';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Client Reviews | Claw Point Advisory',description:'Read reviews from real estate investors who funded deals with Claw Point Advisory, or leave a review of your own.',image:siteImage});}
export default function Reviews(){return <><PageHeading index="REVIEWS" title="In our clients’ words." text="Honest reviews from investors we’ve worked with. Every review comes from a real client and is published with their permission."/><ReviewsPage/></>;}
