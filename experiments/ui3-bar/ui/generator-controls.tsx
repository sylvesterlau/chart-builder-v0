import React from 'react';
import {Btn,Field,Pick} from 'hive-adapter';
type Props={count:number;single:boolean;names:string[];target:string;onTarget:(v:string)=>void;min:string;max:string;onMin:(v:string)=>void;onMax:(v:string)=>void;trend:string;onTrend:(v:string)=>void;variation:string;onVariation:(v:string)=>void;onGenerate:()=>void};
const trends=['Rising','Falling','Rise–fall','Fall–rise','Steady','Random'];
const paths=['M3 19L77 3','M3 3L77 19','M3 19L40 3L77 19','M3 3L40 19L77 3','M3 12L77 12','M3 18L20 3L40 16L60 8L77 13'];
export function GeneratorControls(p:Props){
 const row=(label:string,node:any)=><div className="property"><label>{label}</label>{node}</div>;
 return <>
 {row('Apply to',<Pick label="Apply to" value={p.single?'A':p.target} options={p.single?['A']:['All series','A','B']} optionLabels={{A:p.names[0],B:p.names[1]}} onChange={p.onTarget}/>)}
 {row('Range',<div className="paired-fields"><Field label="Minimum" value={p.min} onChange={p.onMin}/><Field label="Maximum" value={p.max} onChange={p.onMax}/></div>)}
 <label className="generator-label">Trend</label>
 <div className="trends">{trends.map((t,i)=><button key={t} aria-pressed={p.trend===t} onClick={()=>p.onTrend(t)}><svg viewBox="0 0 80 22" aria-hidden="true"><path d={paths[i]} fill="none" stroke="currentColor" strokeWidth="2"/></svg>{t}</button>)}</div>
 {row('Variation',<Pick label="Variation" value={p.variation} options={['Low','Medium','High']} onChange={p.onVariation}/>)}
 <Btn primary label="Generate data" onClick={p.onGenerate}>Generate {p.count} values{p.single||p.target==='A'?' in '+p.names[0]:p.target==='B'?' in '+p.names[1]:' in all series'}</Btn>
 </>;
}
