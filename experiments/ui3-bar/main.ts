import {STORAGE_KEY,validateDraft,readSaved} from './model';
import {renderBar} from './render';
declare const __html__:string;
figma.showUI(__html__,{width:900,height:760,themeColors:true});
let busy=false;
const post=(type:string,data:any={})=>figma.ui.postMessage({type,...data});
function selectedChart(){if(figma.currentPage.selection.length!==1)return null;let n:BaseNode|null=figma.currentPage.selection[0];while(n&&n.type!=='PAGE'){const saved=readSaved(n.getPluginData(STORAGE_KEY));if(saved&&n.type==='FRAME')return {node:n,saved};n=n.parent}return null}
function publish(){const v=selectedChart();post('selection',{chart:v?{id:v.node.id,name:v.node.name,revision:v.saved.revision}:null})}
figma.on('selectionchange',()=>{if(!busy)publish()});
figma.ui.onmessage=async m=>{
 if(busy)return;
 try{
 if(m.type==='ready'){publish();return}
 if(m.type==='load'){const v=selectedChart();if(!v||v.node.id!==m.id)throw Error('Select a chart created by this experimental plugin.');post('loaded',{chart:{id:v.node.id,revision:v.saved.revision,draft:v.saved.draft}});return}
 if(m.type!=='save')return;
 if(!['insert','update'].includes(m.action))throw Error('Unknown operation.');
 const draft=validateDraft(m.draft);let original:FrameNode|null=null;let revision=1;
 if(m.action==='update'){
 const n=await figma.getNodeByIdAsync(m.target?.id||'');if(!n||n.type!=='FRAME'||n.removed)throw Error('The original chart no longer exists. Use Save as new.');
 const saved=readSaved(n.getPluginData(STORAGE_KEY));if(!saved||saved.revision!==m.target.revision)throw Error('The chart changed. Reopen it before updating.');
 if(n.locked)throw Error('Unlock the original chart before updating.');original=n;revision=saved.revision+1;
 }
 busy=true;
 const generated=await renderBar(draft);
 const metadata=JSON.stringify({schema:1,type:'standard-bar',revision,draft});
 let result=generated;
 try{
 generated.setPluginData(STORAGE_KEY,metadata);
 if(original){
 // Render completely before touching the original; preserve its root ID and position.
 const old=[...original.children];const incoming=[...generated.children];
 const oldSize={width:original.width,height:original.height};
 const oldData=original.getPluginData(STORAGE_KEY);
 try{for(const c of incoming)original.appendChild(c);original.resize(generated.width,generated.height);original.setPluginData(STORAGE_KEY,metadata)}catch(e){for(const c of incoming)if(!c.removed)c.remove();original.resize(oldSize.width,oldSize.height);original.setPluginData(STORAGE_KEY,oldData);throw e}
 for(const c of old)c.remove();generated.remove();result=original;
 }else {result.x=figma.viewport.center.x-result.width/2;result.y=figma.viewport.center.y-result.height/2}
 figma.currentPage.selection=[result];figma.viewport.scrollAndZoomIntoView([result]);
 post('saved',{action:m.action,chart:{id:result.id,revision}});
 }catch(e){if(!generated.removed)generated.remove();throw e}
 }catch(e){post('error',{message:e instanceof Error?e.message:'Could not save chart.'})}
 finally{busy=false;publish()}
};
