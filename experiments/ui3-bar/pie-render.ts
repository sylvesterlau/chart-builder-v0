import {pieLayout} from './pie-layout';
import {chartBackground,pieChartConfig,typography,textColor} from '../../src/config';
import {applyColorTokenToFills,applyColorTokenToStrokes} from '../../src/utils/applyColorToken';
import {applyTypographyTokenToText} from '../../src/utils/applyTypographyToken';
import {createChartTitle,loadChartTitleFont} from '../../src/utils/drawChartTitle';
import {createFinalFrame} from '../../src/utils/figmaOperations';
export async function renderComposition(d:any){
 const view=pieLayout(d);const root=await createFinalFrame(view.width,d.kind==='donut'?'Donut chart':'Pie chart');
 try{
 await loadChartTitleFont();const title=await createChartTitle(d.titleVisible?d.title:'',view.width);if(title)root.appendChild(title);
 const area=figma.createFrame();area.name='Pie chart area';area.resize(view.width,view.height);area.fills=[];root.appendChild(area);
 async function text(parent:FrameNode,value:string,x:number,y:number,width:number,style:any,align:any='LEFT'){
  const t=figma.createText();parent.appendChild(t);await applyTypographyTokenToText(t,style);t.characters=value;t.textAutoResize='HEIGHT';t.resize(width,style.lineHeight);t.textAlignHorizontal=align;await applyColorTokenToFills(t,textColor.primary);parent.appendChild(t);t.x=x;t.y=y;return t;
 }
 for(const item of view.slices){
  const slice=figma.createVector();slice.name=item.label+' ('+item.value+')';area.appendChild(slice);slice.vectorPaths=[{windingRule:'NONZERO',data:item.path}];await applyColorTokenToFills(slice,item.color);await applyColorTokenToStrokes(slice,chartBackground);slice.strokeWeight=pieChartConfig.sliceGap.value;area.appendChild(slice);
  const leader=figma.createVector();leader.name='Leader '+item.label;area.appendChild(leader);leader.vectorPaths=[{windingRule:'NONE',data:item.leader}];leader.fills=[];await applyColorTokenToStrokes(leader,item.color);leader.strokeWeight=pieChartConfig.indicator.leaderLineStrokeWeight.value;area.appendChild(leader);
  await text(area,item.text,item.x,item.y,item.labelWidth,view.labelStyle,item.side==='left'?'RIGHT':'LEFT');
 }
 if(view.center){const w=Math.max(30,view.inner*1.7);await text(area,view.center.caption,view.cx-w/2,view.cy-24,w,view.centerTitleStyle,'CENTER');await text(area,view.center.value,view.cx-w/2,view.cy,w,view.centerValueStyle,'CENTER');}
 const legend=figma.createFrame();legend.name='Legend';legend.fills=[];legend.resize(view.width,view.legendHeight);root.appendChild(legend);
 for(const item of view.legends){if(item.kind!=='nested'){const swatch=figma.createRectangle();swatch.name='Legend swatch';swatch.resize(item.shapeSize,item.shapeSize);await applyColorTokenToFills(swatch,item.color);legend.appendChild(swatch);swatch.x=item.x+2;swatch.y=item.y+3;}await text(legend,item.label,item.x+item.textOffset,item.y,item.labelWidth,view.legendStyle);if(item.value)await text(legend,item.value,item.valueX,item.valueY,item.valueWidth,view.legendValueStyle,item.stacked?'LEFT':'RIGHT');const divider=figma.createRectangle();divider.name="Legend divider";divider.resize(view.width,1);legend.appendChild(divider);divider.x=0;divider.y=item.bottom-1;await applyColorTokenToFills(divider,view.dividerColor);}
 figma.currentPage.appendChild(root);return root;
 }catch(e){root.remove();throw e;}
}
