import {formatAmount} from './ui/number-format';
export {formatAmount};
export const STORAGE_KEY='hive_ui3_bar_v1';
export function initialDraft():any{return {rows:['Jan','Feb','Mar','Apr','May','Jun'].map((label,id)=>({id,label,a:String(40+id*20),b:String(30+id*20)})),series:'2 series',seriesNames:['Product A','Product B'],title:'Monthly performance',titleVisible:true,selected:3,arrangement:'Grouped',prefix:'',suffix:' USD',separator:'Comma',settings:{width:'390',height:'320',topLayout:'Auto',tooltip:true,position:'Right',axes:'both',divisions:'Auto',count:'4',yTitle:'Revenue',yTitleVisible:true,xTitle:'Year 2026',xTitleVisible:true,grid:true,shorthand:'Auto'}}}
export function validateDraft(input:any):any{
 if(!input||typeof input!=='object'||JSON.stringify(input).length>100000)throw Error('Invalid chart data.');
 const d={...initialDraft(),...input,settings:{...initialDraft().settings,...input.settings}};
 const str=(x:any,max=120)=>typeof x==='string'&&x.length<=max;
 if(!Array.isArray(d.rows)||d.rows.length<1||d.rows.length>100||!d.rows.every((r:any)=>r&&str(r.label)&&r.label.trim()&&['a','b'].every(k=>typeof r[k]==='string'&&r[k].trim()&&Number.isFinite(Number(r[k]))&&Math.abs(Number(r[k]))<=1e12)))throw Error('Use 1–100 categories with names and finite values up to ±1 trillion.');
 if(!['1 series','2 series'].includes(d.series)||!Array.isArray(d.seriesNames)||d.seriesNames.length!==2||!d.seriesNames.every((v:any)=>str(v)))throw Error('Invalid series configuration.');
 if(!str(d.title)||!str(d.prefix,24)||!str(d.suffix,24)||!str(d.settings.xTitle)||!str(d.settings.yTitle))throw Error('Title or format text is too long.');
 if(d.arrangement!=='Grouped')throw Error('This experimental build supports grouped bars only.');
 for(const [v,allowed]of [[d.separator,['Comma','None']],[d.settings.axes,['both','x','y','none']],[d.settings.position,['Left','Right']],[d.settings.divisions,['Auto','Custom']],[d.settings.shorthand,['Auto','None']]])if(!allowed.includes(v))throw Error('Invalid display setting.');
 if(d.settings.divisions==='Custom'&&(!Number.isInteger(+d.settings.count)||+d.settings.count<2||+d.settings.count>10))throw Error('Use 2–10 divisions.');
 for(const key of ['width','height']){const v=Number(d.settings[key]);if(!Number.isFinite(v)||v<(key==='width'?260:220)||v>(key==='width'?1200:900))throw Error('Width must be 260–1200; chart height must be 220–900.');}
 for(const key of ['topLayout'])if(!['Auto','Horizontal','Rows'].includes(d.settings[key]))throw Error('Invalid content layout.');
 d.selected=Math.min(d.rows.length,Math.max(1,Math.round(Number(d.selected)||1)));
 // Store only the schema we own, never UI debugging objects or external metadata.
 const base=initialDraft();return Object.fromEntries(Object.keys(base).map(k=>[k,k==='settings'?Object.fromEntries(Object.keys(base.settings).map(sk=>[sk,d.settings[sk]])):k==='rows'?d.rows.map((r:any,i:number)=>({id:i,label:r.label,a:r.a,b:r.b})):d[k]]));
}
export function readSaved(raw:string){try{const v=JSON.parse(raw);if(v.schema!==1||v.type!=='standard-bar'||!Number.isInteger(v.revision)||v.revision<1)return null;return {...v,draft:validateDraft(v.draft)}}catch{return null}}
