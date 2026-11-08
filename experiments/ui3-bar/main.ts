import {resolveColorTokenPayload} from '../../src/utils/resolveColorTokenSwatches';
import {resolveNumberTokenPayload} from '../../src/utils/resolveNumberTokenValues';
import {resolveTypographyTokenPayload} from '../../src/utils/resolveTypographyTokenValues';
import {STORAGE_KEY} from './model';
import {validateChart as validateDraft,readChart as readSaved} from './chart-model';
import {drawLineChart} from '../../src/utils/drawLineChart';
import {linePresentation} from './line-config';
import {renderComposition} from './pie-render';
import {renderBar} from './render';
declare const __html__:string;
figma.showUI(__html__,{width:900,height:760,themeColors:true});
let busy=false;
const post=(type:string,data:any={})=>figma.ui.postMessage({type,...data});
function selectedChart(){if(figma.currentPage.selection.length!==1)return null;let n:BaseNode|null=figma.currentPage.selection[0];while(n&&n.type!=='PAGE'){const saved=readSaved(n.getPluginData(STORAGE_KEY));if(saved&&n.type==='FRAME')return {node:n,saved};n=n.parent}return null}
function publish(){const v=selectedChart();post('selection',{chart:v?{id:v.node.id,name:v.node.name,revision:v.saved.revision}:null})}
figma.on('selectionchange',()=>{if(!busy)publish()});
figma.ui.onmessage=async m=>{
 if(Array.isArray(m)){
 const handlers:any={REQUEST_COLOR_TOKEN_SWATCH_VALUES:['COLOR_TOKEN_SWATCH_VALUES',resolveColorTokenPayload],REQUEST_NUMBER_TOKEN_RESOLVED_VALUES:['NUMBER_TOKEN_RESOLVED_VALUES',resolveNumberTokenPayload],REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES:['TYPOGRAPHY_TOKEN_RESOLVED_VALUES',resolveTypographyTokenPayload]};
 const handler=handlers[m[0]];if(handler){try{figma.ui.postMessage([handler[0],await handler[1]()])}catch{}}return;
 }
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
 const generated=draft.kind==='line'?await (async()=>{const v=linePresentation(draft);return drawLineChart(v.config,{...v,normalized:v.config,independentGrid:true,select:false})})():draft.kind==='pie'||draft.kind==='donut'?await renderComposition(draft):await renderBar(draft);
 const metadata=JSON.stringify({schema:1,type:draft.kind||'standard-bar',revision,draft});
 let result=generated;
 try{
 generated.setPluginData(STORAGE_KEY,metadata);
 if(original){
 // Render completely before touching the original; preserve its root ID and position.
 const old=[...original.children];const incoming=[...generated.children];
 const oldName=original.name;const oldSize={width:original.width,height:original.height};
 const oldLayout={layoutMode:original.layoutMode,primaryAxisSizingMode:original.primaryAxisSizingMode,counterAxisSizingMode:original.counterAxisSizingMode};
 const oldData=original.getPluginData(STORAGE_KEY);
 try{original.name=generated.name;original.layoutMode=generated.layoutMode;for(const c of incoming)original.appendChild(c);original.resize(generated.width,generated.height);original.setPluginData(STORAGE_KEY,metadata)}catch(e){original.name=oldName;for(const c of incoming)if(!c.removed)c.remove();original.resize(oldSize.width,oldSize.height);Object.assign(original,oldLayout);original.setPluginData(STORAGE_KEY,oldData);throw e}
 for(const c of old)c.remove();original.primaryAxisSizingMode=generated.primaryAxisSizingMode;original.counterAxisSizingMode=generated.counterAxisSizingMode;generated.remove();result=original;
 }else {result.x=figma.viewport.center.x-result.width/2;result.y=figma.viewport.center.y-result.height/2}
 figma.currentPage.selection=[result];figma.viewport.scrollAndZoomIntoView([result]);
 post('saved',{action:m.action,chart:{id:result.id,revision}});
 }catch(e){if(!generated.removed)generated.remove();throw e}
 }catch(e){post('error',{message:e instanceof Error?e.message:'Could not save chart.'})}
 finally{busy=false;publish()}
};
