import React from 'react';
import './native.css';
export const name=__SPIKE_LABEL__;
export const Provider=({children}:any)=><div className="hive-native">{children}</div>;
export const Btn=({children,onClick,label,primary,disabled}:any)=><button className={'h-btn '+(primary?'primary':'')} aria-label={label} disabled={disabled} onClick={onClick}>{children}</button>;
export const Field=({value,onChange,label}:any)=><input className="h-input" aria-label={label} value={value} onInput={e=>onChange(e.currentTarget.value)}/>;
export const Pick=({value,onChange,label,options}:any)=><select className="h-select" aria-label={label} value={value} onChange={e=>onChange(e.currentTarget.value)}>{options.map((o:string)=><option key={o}>{o}</option>)}</select>;
export const Range=({value,onChange,max}:any)=><input className="h-range" type="range" aria-label="Selected category" value={value} min={1} max={max} step={1} onInput={e=>onChange(+e.currentTarget.value)}/>;
export const Segment=({value,onChange,options}:any)=><div className="h-segment" role="radiogroup" aria-label="Bar arrangement">{options.map((o:string)=><label key={o}><input type="radio" name="arrangement" value={o} checked={value===o} onChange={()=>onChange(o)}/><span>{o}</span></label>)}</div>;
export const Navigation=({value,onChange}:any)=><div className="h-nav">{['Data','Design'].map(o=><button key={o} aria-pressed={value===o} onClick={()=>onChange(o)}>{o}</button>)}</div>;
// Native title is a baseline, not an equivalent accessible custom tooltip.
export const Tip=({children,text}:any)=><span title={text}>{children}</span>;
