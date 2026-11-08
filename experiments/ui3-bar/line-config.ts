import {resolveLineScale} from '../../src/helpers';
import {lineChartConfig} from '../../src/config';
import {buildLineKeyInfo,resolveContentLayout} from '../../src/utils/cartesianKeyInfo';
import {buildLineTooltip} from '../../src/utils/cartesianTooltip';
import {formatAmount} from './ui/number-format';
// Demo timestamps retain their written wall-clock time; no timezone conversion.
export function demoTime(s:string){
 const raw=String(s).replace(/(?:Z|[+-]\d\d:\d\d)$/,'').replace(' ','T');
 if(!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?)?$/.test(raw))return NaN;
 const value=Date.parse(raw+(raw.length===10?'T00:00:00Z':'Z'));
 if(!Number.isFinite(value))return NaN;const iso=new Date(value).toISOString();
 return iso.slice(0,10)===raw.slice(0,10)&&(!raw.includes('T')||iso.slice(11,16)===raw.slice(11,16))?value:NaN;
}
export function timeLabel(s:string){return s.replace('T',' ').replace(/(?:Z|[+-]\d\d:\d\d)$/,'')}
export function makeTimes(start:string,end:string,count:number,type:string){
 const a=demoTime(start),b=demoTime(end);if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a||!Number.isInteger(count)||count<2||count>100)throw Error('Use an increasing range and 2–100 points.');
 const unit=type==='Date'?86400000:1000;
 if(Math.floor((b-a)/unit)<count-1)throw Error('Use fewer points or a wider time range to keep timestamps unique.');
 return Array.from({length:count},(_,i)=>new Date(a+Math.round((b-a)*i/(count-1)/unit)*unit).toISOString().slice(0,type==='Date'?10:19));
}
export {generateValues,generateLineValues} from './data-generation';
// Labels anchor the grid. Subdivide wide gaps independently of data-point count.
export function lineGridRatios(ratios:number[],labelIndices:number[],plotWidth:number){
 const anchors=Array.from(new Set([0,1,...labelIndices.map(i=>ratios[i]).filter(v=>Number.isFinite(v)&&v>0&&v<1)])).sort((a,b)=>a-b);
 const result:number[]=[];
 for(let i=1;i<anchors.length;i++){
  const left=anchors[i-1],right=anchors[i],parts=Math.max(1,Math.ceil((right-left)*plotWidth/80));
  for(let j=1;j<=parts;j++){const value=left+(right-left)*j/parts;if(value<1)result.push(value)}
 }
 return result;
}
// Keep the original data-driven domain; do not add presentation padding.
export function autoLineScale(values:number[],count:number){
 return resolveLineScale(values,NaN,NaN,count);
}
export function linePresentation(d:any){
 const s=d.settings,rows=d.rows,width=+s.width,height=+s.height;
 const times=rows.map((r:any)=>demoTime(r.label)),ratios=times.map((t:number)=>(t-times[0])/(times[times.length-1]-times[0]));
 const series=d.seriesNames.slice(0,d.series==='1 series'?1:2).map((name:string,i:number)=>({name,color:lineChartConfig.series[i].color,values:rows.map((r:any)=>+r[i?'b':'a'])}));
 const values=series.flatMap((v:any)=>v.values),count=s.divisions==='Custom'?+s.count:Math.max(2,Math.min(10,Math.round((height-80)/60)));
 const scale=autoLineScale(values,count);
 const visibleCount=d.extent==='Partial'?Math.max(1,Math.min(rows.length,+d.through)):rows.length;
 const selected=s.tooltip?Math.min(visibleCount-1,Math.max(0,d.selected-1)):-1;
 const format={prefix:d.prefix,suffix:d.suffix,separator:d.separator,shorthand:s.shorthand};
 const config:any={...JSON.parse(JSON.stringify(lineChartConfig)),chartTitle:d.titleVisible?d.title:'',width,height,series,pointCount:rows.length,pointLabels:rows.map((r:any)=>timeLabel(r.label)),xAxisLabels:rows.map((r:any)=>timeLabel(r.label)),selectedIndex:selected,lineMode:series.length===1?'single':'multi',lineRange:'full',minValue:scale.minValue,maxValue:scale.maxValue,yTicks:scale.ticks,yAxisDivisions:count,yAxisTitle:s.yTitleVisible?s.yTitle:'',xAxisTitle:s.xTitleVisible?s.xTitle:'',yAxisPosition:s.position.toLowerCase(),axisLineVisibility:s.axes};
 const keyInfo=buildLineKeyInfo(config);keyInfo.items=keyInfo.items.map((item:any,i:number)=>({...item,value:formatAmount(Math.min(...series[i].values),format)+' – '+formatAmount(Math.max(...series[i].values),format),unit:''}));keyInfo.layout=resolveContentLayout(keyInfo.items,width,'Auto');
 const tooltip=buildLineTooltip(config);if(tooltip){tooltip.items=tooltip.items.map((item:any,i:number)=>({...item,value:formatAmount(series[i].values[selected],format)}));tooltip.layout=resolveContentLayout(tooltip.items,width,'Auto');}
 const every=s.labelDensity==='Every N categories'?Math.max(1,+s.labelEvery):Math.max(1,Math.ceil(rows.length*100/Math.max(1,width-110)));
 const labelIndices=rows.map((_:any,i:number)=>i).filter((i:number)=>i%every===0&&i!==selected&&(s.labelDensity!=='Auto'||selected<0||Math.abs(ratios[i]-ratios[selected])*Math.max(1,width-110)>100));
 return {config,keyInfo,tooltip,ratios,visibleCount,labelIndices,gridRatios:lineGridRatios(ratios,labelIndices,Math.max(1,width-110)),gridHorizontal:s.gridHorizontal,gridVertical:s.gridVertical,formatTick:(n:number)=>formatAmount(n,format,true)};
}
