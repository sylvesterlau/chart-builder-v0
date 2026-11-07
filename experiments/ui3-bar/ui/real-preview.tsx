import React,{useRef,useLayoutEffect} from 'react';
import {h,render} from 'preact';
import {on} from '@create-figma-plugin/utilities';
// Standalone browser has no Figma host. Consume requests without inventing resolved tokens.
if(window.parent===window){for(const event of ['REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES','REQUEST_NUMBER_TOKEN_RESOLVED_VALUES','REQUEST_COLOR_TOKEN_SWATCH_VALUES'])on(event,()=>{});}
import VerticalBarChartPreview from './preview/BarPreview';
import {verticalBarChartConfig} from '../../../src/config';
import {ColorTokenSwatchProvider} from '../../../src/components/ColorChips/colorTokenSwatchContext';
import {NumberTokenValueProvider} from '../../../src/components/NumChips/numberTokenValueContext';
import {TypographyTokenValueProvider} from '../../../src/components/TypographyChips/typographyTokenValueContext';
// Keep the original Preact renderer as an isolated island even in the React UI candidate.
export function RealPreview({rows,series='2 series',title='Monthly performance',visible=true,selected=3,settings={},seriesNames}:any){
 const mount=useRef<HTMLDivElement>(null);
 const config:any=structuredClone(verticalBarChartConfig);
 config.displayFormat=settings;config.width=440;config.chartTitle=visible?title:'';config.selectedIndex=settings.tooltip===false?-1:Math.min(Math.max(selected-1,0),(rows?.length||6)-1);
 config.barMode=series==='1 series'?'single':'dual';
 if(rows){config.labels=rows.map((r:any)=>r.label);config.periodCount=rows.length;config.series=config.series.map((s:any,i:number)=>({...s,values:rows.map((r:any)=>Number.isFinite(+r[i?'b':'a'])?+r[i?'b':'a']:0)}))}
 if(seriesNames)config.series=config.series.map((s:any,i:number)=>({...s,name:seriesNames[i]??s.name}));
 config.yAxisPosition=settings.position||config.yAxisPosition;
 config.axisLineVisibility=settings.axes||config.axisLineVisibility;
 config.yAxisDivisions=settings.divisions==='Custom'?Math.max(2,Math.min(10,Number(settings.count)||3)):undefined;
 config.yAxisTitle=settings.yTitleVisible===false?'':settings.yTitle??config.yAxisTitle;
 config.xAxisTitle=settings.xTitleVisible===false?'':settings.xTitle??config.xAxisTitle;
 if(settings.grid===false)config.color.gridLine={...config.color.gridLine,opacity:0};
 useLayoutEffect(()=>{render(h(ColorTokenSwatchProvider,{},h(NumberTokenValueProvider,{},h(TypographyTokenValueProvider,{},h(VerticalBarChartPreview,{config})))),mount.current!);(window as any).__previewConfig=config},[JSON.stringify(config)]);
 useLayoutEffect(()=>()=>render(null,mount.current!),[]);
 return <div className="real-preview" data-testid="real-preview" ref={mount}/>;
}
