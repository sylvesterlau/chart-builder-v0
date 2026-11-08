import {pieChartConfig,typography,chartBackground,textColor,legendSpacingConfig,legendShapeConfig,dividerColor} from '../../src/config';
import {dataVisAt} from '../../src/utils/dataVisAt';
import {formatAmount} from './ui/number-format';
export function composition(d:any){
 const sorted=d.rows.map((r:any,i:number)=>({id:r.id??i,label:r.label,value:+r.a,colorIndex:i})).sort((a:any,b:any)=>b.value-a.value);
 if(sorted.length<=6)return sorted;
 return [...sorted.slice(0,5),{id:'others',label:'Others',value:sorted.slice(5).reduce((n:number,r:any)=>n+r.value,0),colorIndex:5}];
}
export function contentText(item:any,content:string,total:number,d:any){return [item.label,...(content.includes('value')?[formatAmount(item.value,d)]:[]),...(content.includes('share')?[(item.value/total*100).toFixed(1).replace(/\.0$/,'')+'%']:[])].join('\n')}
const point=(cx:number,cy:number,r:number,a:number)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
export function slicePath(cx:number,cy:number,r:number,inner:number,start:number,end:number){
 const arc=(radius:number,a:number,b:number)=>{const count=Math.max(1,Math.ceil(Math.abs(b-a)/(Math.PI/2)));let result='';for(let i=0;i<count;i++){const t=a+(b-a)*i/count,u=a+(b-a)*(i+1)/count,k=4/3*Math.tan((u-t)/4),p=point(cx,cy,radius,t),q=point(cx,cy,radius,u);result+=` C ${p.x-k*radius*Math.sin(t)} ${p.y+k*radius*Math.cos(t)} ${q.x+k*radius*Math.sin(u)} ${q.y-k*radius*Math.cos(u)} ${q.x} ${q.y}`;}return result;};
 const outer=point(cx,cy,r,start),inside=point(cx,cy,inner,end);
 return `M ${outer.x} ${outer.y}`+arc(r,start,end)+(inner?` L ${inside.x} ${inside.y}`+arc(inner,end,start):` L ${cx} ${cy}`)+' Z';
}
export function pieLayout(d:any){
 const width=+d.settings.width,height=+d.settings.height,total=d.rows.reduce((s:number,r:any)=>s+ +r.a,0),items=composition(d),cx=width/2,cy=height/2;
 const radius=Math.min(width*.25,(height-48)/2),inner=d.kind==='donut'?Math.max(radius*.2,radius-pieChartConfig.ringWidth):0;
 const labelWidth=Math.max(50,cx-radius-24),gap=8;
 const wrap=(text:string)=>text.split('\n').flatMap(line=>{const chars=Math.max(4,Math.floor(labelWidth/7));const out=[];for(let i=0;i<line.length;i+=chars)out.push(line.slice(i,i+chars));return out.length?out:[''];}).join('\n');
 let angle=-Math.PI/2;
 const slices=items.filter((r:any)=>r.value>0).map((item:any)=>{const end=angle-item.value/total*Math.PI*2,mid=(angle+end)/2;const side=Math.cos(mid)<0?'left':'right';const text=wrap(contentText(item,d.directContent,total,d));const h=text.split('\n').length*20;
 const value={...item,path:slicePath(cx,cy,radius,inner,angle,end),color:dataVisAt(item.colorIndex),side,start:point(cx,cy,radius+3,mid),outer:point(cx,cy,radius+12,mid),text,h,y:cy+Math.sin(mid)*(radius+20)-h/2};angle=end;return value;});
 for(const side of ['left','right']){
  const labels=slices.filter((r:any)=>r.side===side).sort((a:any,b:any)=>a.y-b.y);
  const needed=labels.reduce((n:number,r:any)=>n+r.h+gap,0)-gap;
  if(needed>height-24)throw Error('Labels need more room. Increase chart width or height.');
  let bottom=12;for(const r of labels){r.y=Math.max(bottom,r.y);bottom=r.y+r.h+gap;}
  if(bottom>height-4){const shift=bottom-(height-4);for(const r of labels)r.y-=shift;}
  for(const r of labels){r.x=side==='left'?8:width-labelWidth-8;r.labelWidth=labelWidth;const endX=side==='left'?r.x+labelWidth+3:r.x-3;r.leader=`M ${r.start.x} ${r.start.y} L ${r.outer.x} ${r.outer.y} L ${endX} ${r.y+r.h/2}`;}
 }
 const category=d.rows[Math.min(d.rows.length-1,Math.max(0,+d.centerCategory||0))];
 const centerItem=d.centerContent==='Category'?{label:category.label,value:+category.a}:{label:'Total',value:total};
 const center=d.kind==='donut'&&d.centerContent!=='None'?{caption:d.centerCaption||centerItem.label,value:formatAmount(centerItem.value,d)}:null;
 // Like the original plugin, every category owns a full-width legend row.
 const pad=legendSpacingConfig.horizontalPadding.value;
 const legendPad=legendSpacingConfig.verticalPadding.value;
 const shapeSize=legendShapeConfig.size.value;
 const textOffset=shapeSize+legendSpacingConfig.gap.value;
 const available=width-pad*2-textOffset;
 const wrapLegend=(value:string,w:number)=>{const cap=Math.max(4,Math.floor(w/8));return value.split('\n').flatMap(line=>{const result=[];for(let i=0;i<line.length;i+=cap)result.push(line.slice(i,i+cap));return result.length?result:[''];}).join('\n');};
 let legendHeight=0;
 const legends=items.map((item:any)=>{
  const share=(item.value/total*100).toFixed(1).replace(/\.0$/,'')+'%';
  const amount=d.legendContent.includes('value')?formatAmount(item.value,d):'';
  const showShare=d.legendContent.includes('share');
  const inlineLabel=item.label+(showShare?' ('+share+')':'');
  const stacked=d.legendLayout==='Rows'||(d.legendLayout==='Auto'&&(inlineLabel.length+amount.length)*8+16>available);
  const value=stacked?[amount,showShare?'('+share+')':''].filter(Boolean).join(' '):amount;
  const valueWidth=stacked?available:Math.min(available*.55,Math.max(0,value.length*9));
  const labelWidth=stacked?available:available-(value?valueWidth+8:0);
  const label=wrapLegend(stacked?item.label:inlineLabel,labelWidth);
  const valueText=wrapLegend(value,valueWidth||available);
  const labelHeight=label.split('\n').length*20;
  const valueHeight=value?valueText.split('\n').length*20:0;
  const h=(stacked?labelHeight+valueHeight:Math.max(labelHeight,valueHeight))+legendPad*2;
  const y=legendHeight+legendPad;
  const row={...item,color:dataVisAt(item.colorIndex),x:pad,y,width:width-pad*2,
   label,labelWidth,value:valueText,valueWidth,stacked,textOffset,shapeSize,
   valueX:stacked?pad+textOffset:width-pad-valueWidth,
   valueY:stacked?y+labelHeight:y,bottom:legendHeight+h};
  legendHeight+=h;return row;
 });
 return {sliceGap:pieChartConfig.sliceGap.value,leaderWeight:pieChartConfig.indicator.leaderLineStrokeWeight.value,width,height,total,slices,legends,legendHeight,legendStyle:typography.legend.label,legendValueStyle:typography.legend.value,dividerColor,centerTitleStyle:typography.totalValue.title,centerValueStyle:typography.totalValue.value,center,cx,cy,inner,background:chartBackground,textColor:textColor.primary,labelStyle:typography.indicator.label,valueStyle:typography.indicator.percentage};
}
