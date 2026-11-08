export function payment(principal:number,rate:number,years:number,interestOnly?:boolean):number;
export function remaining(principal:number,rate:number,years:number,elapsed:number):number;
export function calculate(kind:string,values:Record<string,number>):[string,number|null,('ratio'|'percent'|'flag')?][];
