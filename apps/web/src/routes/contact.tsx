import type { Route } from './+types/contact';
import { seo } from '@/lib/seo';
import { siteImage } from '@/constants/site';
import { PageHeading } from '@/components/page-heading';
import { EnquiryForm } from '@/components/contact/enquiry-form';
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Discuss Your Real Estate Deal | Claw Point Advisory',description:'Share your proposed real estate transaction with Claw Point Advisory. Make a private funding enquiry, book an introductory appointment or contact the team in chat.',image:siteImage});}
export default function Contact(){return <><PageHeading index="04" title="Your next move starts here." text="A clear conversation is the first step. Tell us about the transaction you have in mind."/><EnquiryForm/></>;}
