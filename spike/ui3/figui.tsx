import React,{useRef,useLayoutEffect} from 'react';
import '@rogieking/figui3/src/fig.js';
import '@rogieking/figui3/fig.css';
export const name=__SPIKE_LABEL__;
export const Provider=({children}:any)=>children;
// Native custom events need an explicit bridge; do not rely on React event spelling.
function Web({tag,attrs={},change,children}:any){const ref=useRef<any>();const cb=useRef(change);cb.current=change;useLayoutEffect(()=>{const el=ref.current;const handler=(e:any)=>{if(e.detail===undefined)return;const d=e.detail;cb.current?.(typeof d==='object'?d.value:d)};el.addEventListener('input',handler);return()=>el.removeEventListener('input',handler)},[]);useLayoutEffect(()=>{for(const [k,v] of Object.entries(attrs)){if(v===false||v==null)ref.current.removeAttribute(k);else ref.current.setAttribute(k,String(v));}},[JSON.stringify(attrs)]);return React.createElement(tag,{ref,...attrs},children);}
export function Btn({children,onClick,label,primary=false,disabled=false}:any){const ref=useRef<any>();React.useLayoutEffect(()=>{if(disabled)ref.current.setAttribute('disabled','');else ref.current.removeAttribute('disabled')},[disabled]);return React.createElement('fig-button',{ref,variant:primary?'primary':'secondary',onClick:(e:any)=>{if(!disabled)onClick?.(e)},'aria-label':label},children)}
// Text input preserves the exact numeric string, including intermediate '-' and decimals.
export const Field=({value,onChange,label}:any)=><Web tag="fig-input-text" attrs={{value,'aria-label':label}} change={onChange}/>;
export const Pick=({value,onChange,label,options}:any)=><Web tag="fig-dropdown" attrs={{value,label}} change={onChange}>{options.map((x:string)=><option key={x} value={x}>{x}</option>)}</Web>;
export const Range=({value,onChange,max}:any)=><Web tag="fig-slider" attrs={{value,min:1,max,step:1,precision:0,text:'false','aria-label':'Selected category'}} change={(v:any)=>onChange(Number(v))}/>;
export const Navigation=({value,onChange}:any)=><Web tag="fig-tabs" attrs={{value}} change={onChange}><fig-tab value="Data">Data</fig-tab><fig-tab value="Design">Design</fig-tab></Web>;
export const Tip=({children,text}:any)=><fig-tooltip text={text}>{children}</fig-tooltip>;

export const Segment=({value,onChange,options}:any)=><Web tag="fig-segmented-control" attrs={{value,sizing:"equal"}} change={onChange}>{options.map((o:string)=><fig-segment key={o} value={o}>{o}</fig-segment>)}</Web>;
