import React from 'react';
import LineChartPreview from '../../../src/components/LineChartPreview';
import ChartTitlePreview from '../../../src/components/ChartTitlePreview';
import {ColorTokenSwatchProvider,useColorTokenResolved} from '../../../src/components/ColorChips/colorTokenSwatchContext';
import {NumberTokenValueProvider} from '../../../src/components/NumChips/numberTokenValueContext';
import {TypographyTokenValueProvider,useTypographyTokenResolved} from '../../../src/components/TypographyChips/typographyTokenValueContext';
import {colorTokenPreviewBackground} from '../../../src/utils/colorTokenDisplay';
import {typographyTokenToPreviewCss} from '../../../src/utils/typographyTokenDisplay';
import {pieLayout} from '../pie-layout';
import {linePresentation} from '../line-config';
function Composition({d}:any){
 const v=pieLayout(d),{values:colors}=useColorTokenResolved(),{values:types}=useTypographyTokenResolved();
 const color=(t:any)=>colorTokenPreviewBackground(t,colors);const label=typographyTokenToPreviewCss(v.labelStyle,types);
 const lines=(text:string,x:number,y:number,anchor:string='start',style:any=label)=><text x={x} y={y+15} textAnchor={anchor} fill={color(v.textColor)} style={style}>{text.split('\n').map((s,i)=><tspan x={x} dy={i?20:0}>{s}</tspan>)}</text>;
 return <div style={{width:v.width,background:color(v.background)}}><ChartTitlePreview title={d.titleVisible?d.title:''}/><svg width={v.width} height={v.height}>
 {v.slices.map((r:any)=><g><path d={r.path} fill={color(r.color)} stroke={color(v.background)} strokeWidth={v.sliceGap}/><path d={r.leader} fill="none" stroke={color(r.color)} strokeWidth={v.leaderWeight}/>{lines(r.text,r.side==='left'?r.x+r.labelWidth:r.x,r.y,r.side==='left'?'end':'start')}</g>)}
 {v.center&&<g>{lines(v.center.caption,v.cx,v.cy-24,'middle',typographyTokenToPreviewCss(v.centerTitleStyle,types))}{lines(v.center.value,v.cx,v.cy,'middle',typographyTokenToPreviewCss(v.centerValueStyle,types))}</g>}
 </svg><svg width={v.width} height={v.legendHeight}>{v.legends.map((r:any)=><g><rect x={r.x} y={r.y+3} width={r.shapeSize} height={r.shapeSize} fill={color(r.color)}/>{lines(r.label,r.x+r.textOffset,r.y,'start',typographyTokenToPreviewCss(v.legendStyle,types))}{r.value&&lines(r.value,r.stacked?r.valueX:r.valueX+r.valueWidth,r.valueY,r.stacked?'start':'end',typographyTokenToPreviewCss(v.legendValueStyle,types))}<rect x={r.x} y={r.bottom-1} width={r.width} height="1" fill={color(v.dividerColor)}/></g>)}</svg></div>;
}
export function ChartPreview({draft}:any){
 let content;try{if(draft.kind!=='line')pieLayout(draft);content=draft.kind==='line'?<LineChartPreview config={linePresentation(draft).config} presentation={linePresentation(draft)}/>:<Composition d={draft}/>;}catch(e){return <p role="status">{(e as Error).message}</p>}
 return <ColorTokenSwatchProvider><NumberTokenValueProvider><TypographyTokenValueProvider>{content}</TypographyTokenValueProvider></NumberTokenValueProvider></ColorTokenSwatchProvider>;
}
