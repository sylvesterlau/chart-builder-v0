import {useState} from 'react';
const state:Record<string,any>={};
// Only used by the continuous flow. Lives in this plugin window, never persisted.
export function useSessionState(key:string,initial:any):any{
 const [value,setValue]=useState(()=>key in state?state[key]:typeof initial==='function'?initial():initial);
 return [value,(next:any)=>setValue((old:any)=>{const result=typeof next==='function'?next(old):next;state[key]=result;return result})];
}
export const initialRows=()=>['Jan','Feb','Mar','Apr','May','Jun'].map((label,id)=>({id,label,a:String(40+id*20),b:String(30+id*20)}));
export const getSession=()=>state;

export function replaceSession(next:Record<string,any>){for(const key of Object.keys(state))delete state[key];Object.assign(state,next);}
