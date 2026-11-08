import { SkyClouds } from '@/components/sky-clouds';
export function PageHeading({index,title,text}:{index:string;title:string;text:string}){return <section className="page-heading"><SkyClouds /><p className="eyebrow">{index} / CLAW POINT ADVISORY</p><h1>{title}</h1><p>{text}</p></section>;}
