import type { Route } from './+types/contact';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { EnquiryForm } from '@/components/contact/enquiry-form';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Discuss Your Real Estate Deal | Claw Point Advisory',description:'Share your proposed real estate transaction with Claw Point Advisory. Make a private funding inquiry, book an introductory appointment or contact the team in chat.',image:siteImage});}
export default function Contact(){return <><PageHeading index="CONTACT" title="Let’s talk about your deal." text="Send a deal, book a call, or just ask a question. Whichever is easiest, a real person on the team will get back to you."/><EnquiryForm/></>;}
