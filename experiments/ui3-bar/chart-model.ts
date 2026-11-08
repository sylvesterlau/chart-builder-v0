import {demoTime} from './line-config';
import {initialDraft,validateDraft} from './model';
export type ChartKind='standard-bar'|'line'|'pie'|'donut';
export const chartNames={'standard-bar':'Standard bar',line:'Line chart',pie:'Pie',donut:'Donut'};
export function initialChart(kind:ChartKind):any{
 const d=initialDraft();d.kind=kind;
 if(kind==='line'){
  d.title='Daily performance';d.settings.position='Left';d.settings.xTitle='Date';
  d.timeType='Date';d.start='2026-01-01';d.end='2026-01-31';d.points='31';d.extent='Full';d.through=25;
  d.rows=Array.from({length:31},(_,id)=>({id,label:`2026-01-${String(id+1).padStart(2,'0')}`,a:String(40+id*4),b:String(30+id*3)}));
 }
 if(kind==='pie'||kind==='donut'){
  d.title='Monthly expenses';d.rows=['Housing','Food','Travel','Leisure'].map((label,id)=>({id,label,a:String(400-id*100),b:''}));d.series='1 series';
  d.directContent='Name + share';d.legendContent='Name + value + share';d.legendLayout='Auto';d.centerContent='Total';d.centerCategory=0;d.centerCaption='Total';
 }
 return d;
}
export function validateChart(input:any):any{
 const kind=input?.kind||'standard-bar';if(!Object.keys(chartNames).includes(kind))throw Error('Unsupported chart type.');
 const base=validateDraft(input);base.kind=kind;
 if(kind==='line'){
  if(base.rows.length<2||base.rows.some((r:any,i:number)=>!Number.isFinite(demoTime(r.label))||(i>0&&demoTime(r.label)<=demoTime(base.rows[i-1].label))))throw Error('Use at least two increasing, unique timestamps.');
  for(const k of ['timeType','start','end','points','extent','through'])base[k]=input[k]??initialChart('line')[k];
  if(!['Date','Date & time'].includes(base.timeType)||!['Full','Partial'].includes(base.extent))throw Error('Invalid line settings.');
  base.through=Math.max(1,Math.min(base.rows.length,Math.round(+base.through)||1));if(base.extent==='Partial')base.selected=Math.min(base.selected,base.through);
 }
 if(kind==='pie'||kind==='donut'){
  if(base.rows.length<2||base.rows.some((r:any)=>+r.a<0)||base.rows.reduce((s:number,r:any)=>s+ +r.a,0)<=0)throw Error('Use at least two non-negative values with a positive total.');
  const contents=['Name','Name + value','Name + share','Name + value + share'];
  for(const k of ['directContent','legendContent','legendLayout','centerContent','centerCategory','centerCaption'])base[k]=input[k]??initialChart(kind)[k];
  if(!contents.includes(base.directContent)||!contents.includes(base.legendContent)||!['Auto','Horizontal','Rows'].includes(base.legendLayout)||!['None','Total','Category'].includes(base.centerContent)||typeof base.centerCaption!=='string'||base.centerCaption.length>120)throw Error('Invalid composition settings.');
  base.centerCategory=Math.min(base.rows.length-1,Math.max(0,Math.round(+base.centerCategory)||0));
 }
 return base;
}
export function readChart(raw:string){try{const v=JSON.parse(raw);if(v.schema!==1||!['standard-bar','line','pie','donut'].includes(v.type)||!Number.isInteger(v.revision)||v.revision<1)return null;return {...v,draft:validateChart({...v.draft,kind:v.type})}}catch{return null}}
