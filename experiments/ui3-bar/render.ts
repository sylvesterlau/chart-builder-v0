import {resolveBarScale} from '../../src/helpers';
import {formatAmount} from './model';
const ink={r:.12,g:.12,b:.12};
const paint=(hex:string)=>({type:'SOLID' as const,color:{r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255}});
export async function renderBar(d:any):Promise<FrameNode>{
 await Promise.all(['Regular','Medium'].map(style=>figma.loadFontAsync({family:'Inter',style})));
 const root=figma.createFrame();root.name=d.title||'Standard bar';root.resize(480,600);root.fills=[paint('FFFFFF')];root.clipsContent=false;
 try{
 const text=(name:string,value:string,x:number,y:number,size=12,bold=false)=>{const n=figma.createText();root.appendChild(n);n.name=name;n.fontName={family:'Inter',style:bold?'Medium':'Regular'};n.fontSize=size;n.characters=value;n.fills=[{type:'SOLID',color:ink}];n.x=x;n.y=y;return n};
 const rect=(name:string,x:number,y:number,w:number,h:number,color:string)=>{const n=figma.createRectangle();root.appendChild(n);n.name=name;n.resize(Math.max(.01,w),Math.max(.01,h));n.x=x;n.y=y;n.fills=[paint(color)];return n};
 const count=d.series==='1 series'?1:2,keys=['a','b'].slice(0,count),s=d.settings,format={prefix:d.prefix,suffix:d.suffix,separator:d.separator,shorthand:s.shorthand};
 const values=d.rows.flatMap((r:any)=>keys.map(k=>+r[k]));const scale=resolveBarScale(values,s.divisions==='Custom'?+s.count:3);
 let y=20;if(d.titleVisible&&d.title){text('Chart title',d.title,20,y,18,true);y+=34}
 text('Category range',d.rows[0].label+' – '+d.rows[d.rows.length-1].label,20,y);y+=24;
 keys.forEach((k,i)=>{const vs=d.rows.map((r:any)=>+r[k]);rect('Legend swatch',20,y+3,10,10,i?'E76E84':'347893');text('Series name',d.seriesNames[i],38,y);text('Series amount',formatAmount(Math.min(...vs),format)+' – '+formatAmount(Math.max(...vs),format),190,y);y+=24});
 if(s.tooltip){y+=16;rect('Tooltip background',16,y,448,32+24*count,'F5F5F5');text('Tooltip category',d.rows[d.selected-1].label,28,y+8,12,true);keys.forEach((k,i)=>text('Tooltip / '+d.seriesNames[i],d.seriesNames[i]+'   '+formatAmount(+d.rows[d.selected-1][k],format),28,y+32+i*24));y+=44+24*count}
 y+=16;if(s.yTitleVisible&&s.yTitle){text('Y axis title',s.yTitle,s.position==='Left'?20:350,y);y+=24}
 const labels=scale.ticks.map((v:number)=>formatAmount(v,format,true));const gutter=Math.min(180,Math.max(44,...labels.map((v:string)=>v.length*7+16)));
 const left=s.position==='Left'?20+gutter:20,right=s.position==='Right'?460-gutter:460,width=right-left,height=260,top=y;
 const py=(v:number)=>top+height-(v-scale.minValue)/(scale.maxValue-scale.minValue||1)*height;
 scale.ticks.forEach((v:number,i:number)=>{if(s.grid)rect('Horizontal grid',left,py(v),width,1,'E6E6E6');const t=text('Y tick',labels[i],s.position==='Right'?right+8:20,py(v)-7,11);if(s.position==='Left')t.x=left-8-t.width});
 const group=width/d.rows.length;
 d.rows.forEach((r:any,i:number)=>{const center=left+group*(i+.5);if(s.grid)rect('Vertical grid',center,top,1,height,'F1F1F1');if(s.tooltip&&i===d.selected-1)rect('Selected category',left+group*i,top,group,height,'F2F2F2');keys.forEach((k,j)=>{const v=+r[k],bw=Math.min(count===1?12:9,group/(count+2));rect('Bar / '+r.label+' / '+d.seriesNames[j],center+(j-(count-1)/2)*(bw+3)-bw/2,Math.min(py(v),py(0)),bw,Math.max(1,Math.abs(py(v)-py(0))),j?'E76E84':'347893')});const t=text('X label',r.label,center,top+height+8,11);t.x=center-t.width/2});
 if(['both','x'].includes(s.axes))rect('X axis line',left,py(0),width,1,'333333');if(['both','y'].includes(s.axes))rect('Y axis line',s.position==='Right'?right:left,top,1,height,'333333');
 if(s.xTitleVisible&&s.xTitle){const t=text('X axis title',s.xTitle,left,top+height+34);t.x=left+(width-t.width)/2}
 root.resize(480,top+height+66);return root;
 }catch(e){root.remove();throw e}
}
