import React,{useRef,useLayoutEffect} from 'react';
import {h,render} from 'preact';
import {on} from '@create-figma-plugin/utilities';
// Standalone browser has no Figma host. Consume requests without inventing resolved tokens.
if(window.parent===window){for(const event of ['REQUEST_TYPOGRAPHY_TOKEN_RESOLVED_VALUES','REQUEST_NUMBER_TOKEN_RESOLVED_VALUES','REQUEST_COLOR_TOKEN_SWATCH_VALUES'])on(event,()=>{});}
import VerticalBarChartPreview from './preview/BarPreview';
import {barPresentation} from '../chart-config';
import {ColorTokenSwatchProvider} from '../../../src/components/ColorChips/colorTokenSwatchContext';
import {NumberTokenValueProvider} from '../../../src/components/NumChips/numberTokenValueContext';
import {TypographyTokenValueProvider} from '../../../src/components/TypographyChips/typographyTokenValueContext';
// Keep the original Preact renderer as an isolated island even in the React UI candidate.
export function RealPreview({rows,series='2 series',title='Monthly performance',visible=true,selected=3,settings={},seriesNames}:any){
 const mount=useRef<HTMLDivElement>(null);
 const presentation=barPresentation({rows,series,title,titleVisible:visible,selected,settings,seriesNames,prefix:settings.prefix,suffix:settings.suffix,separator:settings.separator});
 const config=presentation.config;
 useLayoutEffect(()=>{render(h(ColorTokenSwatchProvider,{},h(NumberTokenValueProvider,{},h(TypographyTokenValueProvider,{},h(VerticalBarChartPreview,{config,presentation})))),mount.current!);(window as any).__previewConfig=config},[JSON.stringify([config,presentation.keyInfo,presentation.tooltip])]);
 useLayoutEffect(()=>{const el=mount.current!;const fit=()=>{const child=el.firstElementChild as HTMLElement;if(child)child.style.zoom=String(Math.min(1,el.clientWidth/config.width));};fit();const observer=new ResizeObserver(fit);observer.observe(el);return()=>observer.disconnect()},[config.width]);
 useLayoutEffect(()=>()=>render(null,mount.current!),[]);
 return <div className="real-preview" style={{width:"100%",display:"flex",justifyContent:"center",minWidth:0}} data-testid="real-preview" ref={mount}/>;
}
