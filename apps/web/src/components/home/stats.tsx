export function Stats(){
 const stats=[{n:'567',l:'Deals completed'},{n:'$400M',l:'Funded since \'24'},{n:'200+',l:'Happy borrowers'}];
 return <section className="stats-band band"><div className="stats-grid">{stats.map(s=><div className="stat" key={s.l}><strong>{s.n}</strong><span>{s.l}</span></div>)}</div></section>;
}
