export function payment(principal, rate, years, interestOnly = false) {
 if (principal <= 0) return 0;
 const r = rate / 1200, n = years * 12;
 if (interestOnly) return principal * r;
 if (n <= 0) return 0;
 return r === 0 ? principal / n : principal * r / (1 - (1 + r) ** -n);
}
export function remaining(principal, rate, years, elapsed) {
 const n = Math.min(years, elapsed) * 12, r = rate / 1200;
 const p = payment(principal, rate, years);
 return Math.max(0, r === 0 ? principal - p * n : principal * (1+r)**n - p * ((1+r)**n-1)/r);
}
export function calculate(kind, v) {
 const p = v.price, closing = p * v.closing / 100;
 const loan = kind === 'stack' ? p*v.primary/100 : p*(1-v.down/100);
 const pi = payment(loan,v.rate,v.term,Boolean(v.io));
 const expenses = (v.taxes+v.insurance)/12 + v.hoa;
 const operating = v.rent*(1-(v.vacancy+v.maintenance+v.capex+v.management)/100)-expenses;
 if (kind === 'stack') {
  const carry=p*v.carry/100, bridge=Math.max(0,p+closing-loan);
  const fees=bridge*v.fee/100+v.tc+v.second;
  const cash=p+closing+fees-loan-carry;
  const sellerPayment=payment(carry,v.carryRate,v.carryTerm);
  const vacancy=v.rent*v.vacancy/100, upkeep=v.rent*(v.maintenance+v.capex)/100, mgmt=v.rent*v.management/100, debt=pi+sellerPayment;
  return [['Gross rent',v.rent],['Vacancy',vacancy],['Effective income',v.rent-vacancy],['Taxes, insurance + HOA',expenses],['Maintenance + CapEx',upkeep],['Property management',mgmt],['Net operating income',operating],['Debt coverage (NOI ÷ both payments)',debt>0?operating/debt:null,'ratio'],['Cash to seller',p-carry],['Primary + carry (% of price)',(loan+carry)/p*100,'percent'],['Primary loan',loan],['Seller note',carry],['Temporary purchase gap',bridge],['Funding and fixed fees',fees],['Cash required (negative = surplus)',cash],['Primary monthly payment',pi],['Seller monthly payment',sellerPayment],['Monthly operating income',operating],['Monthly cash flow',operating-pi-sellerPayment],['Seller balloon balance',remaining(carry,v.carryRate,v.carryTerm,v.balloon)]];
 }
 if (kind === 'echo') {
  const primary=v.sale*v.primary/100, costs=v.sale*v.closing/100;
  const advance=Math.max(0,v.sale+costs-primary), fee=advance*v.fee/100;
  return [['Primary loan',primary],['B–C closing costs',costs],['Buyer funding gap',advance],['Funding fee',fee],['Repayment from spread',advance+fee],['Resale spread (B–C minus A–B)',v.sale-v.acquisition],['Spread after advance and fee',v.sale-v.acquisition-advance-fee]];
 }
 return [];
}
