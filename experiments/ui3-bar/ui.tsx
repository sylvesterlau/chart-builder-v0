import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {App as Data} from './ui/app';
import {App as Design} from './ui/panels';
import {Btn} from './ui/components/hive';
import {getSession,replaceSession} from './ui/session';
import {initialChart,validateChart,chartNames,ChartKind} from './chart-model';
import {ChartEditor} from './ui/chart-editor';
import './ui/flow.css';
import './ui.css';
function App(){
 const [saveBlocked,setSaveBlocked]=useState(false),[page,setPage]=useState('Landing'),[epoch,setEpoch]=useState(0),[selection,setSelection]=useState<any>(null),[target,setTarget]=useState<any>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const host=window.parent!==window;
 const send=(type:string,data:any={})=>parent.postMessage({pluginMessage:{type,...data}},'*');
 useEffect(()=>{const handler=(e:MessageEvent)=>{const m=e.data?.pluginMessage;if(!m)return;
  if(m.type==='selection')setSelection(m.chart);
  if(m.type==='loaded'){replaceSession(m.chart.draft);setTarget({id:m.chart.id,revision:m.chart.revision});setEpoch(v=>v+1);setPage('Data');setBusy(false);setStatus('Saved data and settings restored.');}
  if(m.type==='saved'){setTarget(m.chart);setBusy(false);setStatus(m.action==='update'?'Original chart updated.':'Chart inserted.');}
  if(m.type==='error'){setBusy(false);setStatus(m.message);}
 };window.addEventListener('message',handler);if(host)send('ready');return()=>window.removeEventListener('message',handler)},[]);
 function start(kind:ChartKind){replaceSession(initialChart(kind));setTarget(null);setEpoch(v=>v+1);setPage('Data');setStatus('');}
 function save(action:string){if(saveBlocked)return;try{const draft=validateChart(getSession());if(!host){setStatus('Browser preview only. Open this development plugin in Figma to insert.');return;}setBusy(true);send('save',{action,draft,target});}catch(e){setStatus((e as Error).message)}}
 const footer=<footer><span role="status">{busy?'Working…':status||'Experimental Charts · local data only'}</span><div className="actions">{target&&<Btn disabled={busy||saveBlocked} onClick={()=>save('insert')}>Save as new</Btn>}<Btn primary disabled={busy||saveBlocked} onClick={()=>save(target?'update':'insert')}>{target?'Update chart':'Insert chart'}</Btn></div></footer>;
 return <div className="hive-flow">{page==='Landing'?<div className="landing"><h1>Charts</h1><p>Experimental chart editor</p><div className="chart-types">{(['standard-bar','line','pie'] as ChartKind[]).map(kind=><button onClick={()=>start(kind)}><svg viewBox="0 0 120 64" aria-hidden="true">{kind==='standard-bar'?<path d="M15 55V30h18v25m14 0V8h18v47m14 0V20h18v35"/>:kind==='line'?<path d="M10 52L35 28L55 40L80 12L110 20" fill="none" stroke="currentColor" strokeWidth="3"/>:<circle cx="60" cy="32" r="24" fill={kind==='donut'?'none':'currentColor'} stroke="currentColor" strokeWidth={kind==='donut'?12:1}/>}</svg><b>{kind==='pie'?'Pie & Donut':chartNames[kind]}</b></button>)}</div><Btn disabled={!selection||busy} onClick={()=>{setBusy(true);send('load',{id:selection.id})}}>Continue editing selected chart</Btn><p role="status">{status|| (selection?'Selected: '+selection.name:host?'Select a chart created by this experimental plugin.':'Browser preview only; canvas actions require Figma Desktop.')}</p></div>:<div key={epoch}>{getSession().kind&&getSession().kind!=='standard-bar'?<ChartEditor navigate={setPage} footer={footer} onSaveBlocked={setSaveBlocked}/>:page==='Data'?<Data navigate={setPage} footer={footer} onSaveBlocked={setSaveBlocked}/>:<Design navigate={setPage} footer={footer}/>}</div>}</div>
}
createRoot(document.getElementById('root')!).render(<App/>);
