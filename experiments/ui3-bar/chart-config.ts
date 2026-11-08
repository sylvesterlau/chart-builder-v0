import {verticalBarChartConfig} from '../../src/config';
import {normalizeVerticalBarChartConfig,resolveBarScale} from '../../src/helpers';
import {buildBarKeyInfo,resolveContentLayout} from '../../src/utils/cartesianKeyInfo';
import {buildBarTooltip} from '../../src/utils/cartesianTooltip';
import {formatAmount} from './ui/number-format';
export function autoBarScale(values:number[],height:number){
 // Aim for readable vertical spacing, then prefer a tight zero-anchored domain.
 const target=Math.max(2,Math.min(10,Math.round((height-80)/60)));
 const lo=Math.min(0,...values),hi=Math.max(0,...values),span=hi-lo||1;
 let best:any=null,score=Infinity;
 for(let count=2;count<=10;count++){
  const scale=resolveBarScale(values,count);
  const candidate=Math.abs(count-target)*0.35+(scale.maxValue-scale.minValue-span)/span;
  if(candidate<score){score=candidate;best={...scale,count};}
 }
 return best;
}
export function barPresentation(d:any){
 const s=d.settings||{}, width=Math.max(260,Math.min(1200,Number(s.width)||390)),height=Math.max(220,Math.min(900,Number(s.height)||320));
 const raw:any=JSON.parse(JSON.stringify(verticalBarChartConfig));
 Object.assign(raw,{width,height,chartTitle:d.titleVisible?d.title:'',barMode:d.series==='1 series'?'single':'dual',periodCount:d.rows.length,labels:d.rows.map((r:any)=>r.label),selectedIndex:s.tooltip===false?-1:Math.min(d.rows.length-1,Math.max(0,d.selected-1)),yAxisPosition:String(s.position||'Right').toLowerCase(),axisLineVisibility:s.axes||'both',yAxisDivisions:s.divisions==='Custom'?+s.count:3});
 raw.series=raw.series.slice(0,raw.barMode==='single'?1:2).map((v:any,i:number)=>({...v,name:d.seriesNames[i],values:d.rows.map((r:any)=>Number(r[i?'b':'a'])||0)}));
 const config=normalizeVerticalBarChartConfig(raw,verticalBarChartConfig as any);
 // The new dataset supports up to 100 rows; do not silently truncate to legacy 24.
 Object.assign(config,{labels:raw.labels,series:raw.series,periodCount:raw.periodCount,selectedIndex:raw.selectedIndex,chartTitle:raw.chartTitle,yAxisTitle:s.yTitleVisible===false?'':s.yTitle,xAxisTitle:s.xTitleVisible===false?'':s.xTitle});
 const values=raw.series.flatMap((v:any)=>v.values); const scale=s.divisions==='Custom'?resolveBarScale(values,raw.yAxisDivisions):autoBarScale(values,height); config.yAxisDivisions=s.divisions==='Custom'?raw.yAxisDivisions:scale.count;Object.assign(config,{minValue:scale.minValue,maxValue:scale.maxValue,yTicks:scale.ticks});

 const format={prefix:d.prefix,suffix:d.suffix,separator:d.separator,shorthand:s.shorthand};
 const keyInfo=buildBarKeyInfo({...config,xAxisTitle:s.xTitle});
 keyInfo.items=keyInfo.items.map((v,i)=>{const values=config.series[i].values;return {...v,value:formatAmount(Math.min(...values),format)+' – '+formatAmount(Math.max(...values),format),unit:''}});
 keyInfo.layout=resolveContentLayout(keyInfo.items,width,'Auto');
 const tooltip=buildBarTooltip({...config,xAxisTitle:s.xTitle});
 if(tooltip){tooltip.items=tooltip.items.map((v,i)=>({...v,value:formatAmount(config.series[i].values[config.selectedIndex],format)}));tooltip.layout=resolveContentLayout(tooltip.items,width,'Auto');}
 const longest=Math.max(1,...config.labels.map((label:string)=>Array.from(label).reduce((n:number,c:string)=>n+(c.charCodeAt(0)>255?14:7),0)));
 const plotEstimate=Math.max(1,width-110);
 const interval=s.labelDensity==='Every N categories'?Math.max(1,Math.min(100,Math.round(+s.labelEvery)||1)):Math.max(1,Math.ceil((longest+16)*config.labels.length/plotEstimate));
 const labelIndices=config.labels.map((_:string,i:number)=>i).filter((i:number)=>i===config.selectedIndex||(i%interval===0&&(s.labelDensity==='Every N categories'||config.selectedIndex<0||Math.abs(i-config.selectedIndex)>=interval)));
 const gridHorizontal=s.gridHorizontal??s.grid!==false,gridVertical=s.gridVertical??s.grid!==false;
 return {config,keyInfo,tooltip,labelIndices,gridHorizontal,gridVertical,formatTick:(v:number)=>formatAmount(v,format,true)};
}
