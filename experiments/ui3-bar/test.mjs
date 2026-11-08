import {build} from 'esbuild';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const compiled=await build({tsconfigRaw:{compilerOptions:{target:"ES2017"}},entryPoints:['model.ts'],bundle:true,write:false,format:'cjs',platform:'node'});
const sandbox={exports:{},module:{exports:{}}};sandbox.exports=sandbox.module.exports;vm.runInNewContext(compiled.outputFiles[0].text,sandbox);
const {initialDraft,validateDraft,readSaved,parseDataset,clampSelection}=sandbox.module.exports;
const d=initialDraft();d.rows[0].a='-175.25';d.series='1 series';d.rows[0].b='987';
assert.equal(validateDraft(d).rows[0].b,'');assert.equal(d.rows[0].b,'987');
assert.equal(validateDraft({...d,series:'2 series'}).rows[0].b,'987');
assert.equal(validateDraft({...d,seriesNames:['A','Private B']}).seriesNames[1],'Product B');
assert.equal(validateDraft(d).rows[0].a,'-175.25');
const saved=readSaved(JSON.stringify({schema:1,type:'standard-bar',revision:2,draft:d}));assert.equal(saved.revision,2);assert.equal(saved.draft.rows[0].a,'-175.25');
assert.equal(readSaved('{broken'),null);assert.equal(readSaved(JSON.stringify({schema:2,type:'standard-bar',revision:1,draft:d})),null);
for(const value of ['', 'NaN','Infinity','1000000000001']){const bad=initialDraft();bad.rows[0].a=value;assert.throws(()=>validateDraft(bad));}
assert.throws(()=>validateDraft({...d,rows:[]}));assert.throws(()=>validateDraft({...d,arrangement:'Stacked'}));
assert.throws(()=>validateDraft({...d,settings:{...d.settings,divisions:'Custom',count:'0'}}));
assert.equal(validateDraft({...d,debugSecret:'exclude'}).debugSecret,undefined);
assert.equal(validateDraft({...d,selected:999}).selected,6);
console.log('Model checks passed: persistence, hidden series, negative decimals, invalid input, schema whitelist, selection bounds.');
const viewBundle=await build({tsconfigRaw:{compilerOptions:{target:'ES2017'}},entryPoints:['chart-config.ts'],bundle:true,write:false,format:'cjs',platform:'node'});
const viewSandbox={exports:{},module:{exports:{}}};viewSandbox.exports=viewSandbox.module.exports;vm.runInNewContext(viewBundle.outputFiles[0].text,viewSandbox);
const {barPresentation}=viewSandbox.module.exports;
const sized=initialDraft();sized.settings.width='800';sized.settings.height='440';sized.settings.topLayout='Horizontal';
let v=barPresentation(sized);assert.equal(v.config.width,800);assert.equal(v.config.height,440);assert.equal(v.keyInfo.layout,'inline');assert.equal(v.tooltip.layout,'inline');
sized.settings.topLayout='Rows';v=barPresentation(sized);assert.equal(v.keyInfo.layout,'inline');assert.equal(v.tooltip.layout,'inline'); // Legacy overrides are ignored.
sized.settings.topLayout='Auto';v=barPresentation(sized);assert.equal(v.keyInfo.layout,'inline');
sized.settings.width='260';sized.seriesNames=['A very long product name','Another very long product name'];v=barPresentation(sized);assert.equal(v.keyInfo.layout,'rows');assert.equal(v.tooltip.layout,'rows');
sized.settings.tooltip=false;sized.settings.yTitleVisible=false;v=barPresentation(sized);assert.equal(v.tooltip,null);assert.equal(v.config.yAxisTitle,'');
const restored=readSaved(JSON.stringify({schema:1,type:'standard-bar',revision:1,draft:sized}));assert.equal(restored.draft.settings.width,'260');assert.equal(restored.draft.settings.topLayout,undefined);
const legacy=initialDraft();delete legacy.settings.width;delete legacy.settings.height;delete legacy.settings.topLayout;assert.equal(validateDraft(legacy).settings.width,'390');
console.log('Presentation checks passed: size, shared layouts, Auto overflow, visibility, restore and old chart defaults.');

assert.equal(saved.draft.rows[0].b,'');
assert.equal(parseDataset({categories:[{label:'One',a:12}]},'1 series')[0].b,'');
assert.throws(()=>parseDataset({categories:[{label:'One',a:12}]},'2 series'));
assert.equal(parseDataset({categories:[{label:'One',a:-0.25,b:0}]},'2 series')[0].b,'0');
for(const a of [null,'12',Infinity,1e13])assert.throws(()=>parseDataset({categories:[{label:'One',a}]},'1 series'));
assert.equal(clampSelection(6,2),2);assert.equal(clampSelection(1,6),1);
const {autoBarScale}=viewSandbox.module.exports;
assert.ok(autoBarScale([10,100],900).count>autoBarScale([10,100],220).count);
for(const values of [[0,0],[-100,200],[-99,-1],[0.001,0.004],[1e12]]){
 const scale=autoBarScale(values,320);assert.ok(scale.minValue<=Math.min(0,...values));assert.ok(scale.maxValue>=Math.max(0,...values));assert.ok(scale.ticks.includes(0));assert.equal(scale.ticks.length,scale.count+1);
}
const custom=initialDraft();custom.settings.divisions='Custom';custom.settings.count='4';assert.equal(barPresentation(custom).config.yTicks.length,5);
console.log('Regression checks passed: hidden B persistence, single/dual imports, selection clamp, adaptive axis divisions.');

const density=initialDraft();density.settings.labelDensity='Every N categories';density.settings.labelEvery='2';density.selected=2;
assert.equal(JSON.stringify(barPresentation(density).labelIndices),JSON.stringify([0,1,2,4]));
assert.equal(barPresentation(density).config.series[0].values.length,6);
density.settings.gridHorizontal=false;density.settings.gridVertical=true;
assert.equal(barPresentation(density).gridHorizontal,false);assert.equal(barPresentation(density).gridVertical,true);
const gridLegacy=initialDraft();delete gridLegacy.settings.gridHorizontal;delete gridLegacy.settings.gridVertical;gridLegacy.settings.grid=false;
assert.equal(validateDraft(gridLegacy).settings.gridHorizontal,false);assert.equal(validateDraft(gridLegacy).settings.gridVertical,false);
assert.throws(()=>validateDraft({...density,settings:{...density.settings,labelEvery:'0'}}));
density.settings.labelDensity='Auto';density.settings.width='260';density.rows=density.rows.map(r=>({...r,label:'Long category label'}));
assert.ok(barPresentation(density).labelIndices.length<6);assert.ok(barPresentation(density).labelIndices.includes(1));
const densityRestored=readSaved(JSON.stringify({schema:1,type:'standard-bar',revision:1,draft:density}));assert.equal(densityRestored.draft.settings.gridHorizontal,false);
console.log('Label density, independent grids and legacy grid migration passed.');
const multiBundle=await build({tsconfigRaw:{compilerOptions:{target:'ES2017'}},entryPoints:['chart-model.ts'],bundle:true,write:false,format:'cjs',platform:'node'});
const multi={exports:{},module:{exports:{}}};multi.exports=multi.module.exports;vm.runInNewContext(multiBundle.outputFiles[0].text,multi);
const {initialChart,validateChart,readChart}=multi.module.exports;
for(const kind of ['line','pie','donut']){const draft=initialChart(kind);const restored=readChart(JSON.stringify({schema:1,type:kind,revision:1,draft}));assert.equal(restored.draft.kind,kind);assert.equal(restored.draft.rows.length,draft.rows.length);}
const line=initialChart('line');line.rows[1].label=line.rows[0].label;assert.throws(()=>validateChart(line));
const pie=initialChart('pie');pie.rows[0].a='-1';assert.throws(()=>validateChart(pie));
const layoutBundle=await build({entryPoints:['pie-layout.ts'],bundle:true,write:false,format:'cjs',platform:'node'});const layout={exports:{},module:{exports:{}}};layout.exports=layout.module.exports;vm.runInNewContext(layoutBundle.outputFiles[0].text,layout);
const eight=initialChart('pie');eight.rows=[400,200,120,100,70,50,40,20].map((a,id)=>({id,label:'Item '+id,a:String(a),b:''}));const slices=layout.module.exports.composition(eight);assert.equal(slices.length,6);assert.equal(slices[5].label,'Others');assert.equal(slices[5].value,110);assert.equal(slices[4].value,70);
const pv=layout.module.exports.pieLayout(eight);assert.equal(pv.slices.length,6);assert.ok(pv.slices[0].start.x>pv.cx);assert.equal(pv.legends.length,9);
const lineBundle=await build({entryPoints:['line-config.ts'],bundle:true,write:false,format:'cjs',platform:'node'});const lc={exports:{},module:{exports:{}}};lc.exports=lc.module.exports;vm.runInNewContext(lineBundle.outputFiles[0].text,lc);const {makeTimes,linePresentation}=lc.module.exports;
assert.equal(makeTimes('2026-01-01','2026-01-31',31,'Date').length,31);assert.throws(()=>makeTimes('2026-01-01','2026-01-31',8,'Date'));
const irregular=initialChart('line');irregular.rows=[{id:0,label:'2026-01-01',a:'10',b:'20'},{id:1,label:'2026-01-02',a:'15',b:'30'},{id:2,label:'2026-01-11',a:'20',b:'40'}];irregular.extent='Partial';irregular.through=2;irregular.selected=3;
const lv=linePresentation(irregular);assert.equal(lv.ratios[1],.1);assert.equal(lv.visibleCount,2);assert.equal(lv.config.selectedIndex,1);assert.equal(lv.config.pointCount,3);
console.log('Line/Pie/Donut schema, irregular timestamps, Partial and Others rules passed.');

const legendDraft=initialChart('pie');legendDraft.legendLayout='Horizontal';
let legends=layout.module.exports.pieLayout(legendDraft).legends;
assert.equal(legends.length,4);assert.ok(legends.every(x=>!x.stacked&&x.x===legends[0].x));assert.ok(legends[1].y>legends[0].bottom);assert.equal(legends[0].value,'400 USD');
legendDraft.legendLayout='Rows';legends=layout.module.exports.pieLayout(legendDraft).legends;assert.ok(legends.every(x=>x.stacked&&x.valueY>x.y));
legendDraft.legendLayout='Auto';legendDraft.rows[0].label='A very long category name for a narrow chart';assert.equal(layout.module.exports.pieLayout(legendDraft).legends[0].stacked,true);
const zero=initialChart('pie');zero.rows.forEach(x=>x.a='0');assert.throws(()=>validateChart(zero));
console.log('Original-plugin legend row layouts, Auto overflow and zero-total rejection passed.');

const ref=initialChart('pie');ref.rows=[412,252,159,112,12,12,12].map((a,id)=>({id,label:['Shopping','Travel','Food','Transportation','Item 5','Item 6','Item 7'][id],a:String(a),b:''}));
const rv=layout.module.exports.pieLayout(ref);
assert.equal(rv.slices.length,6);assert.equal(rv.legends.length,8);
assert.equal(rv.legends[5].label,'Others');assert.equal(rv.legends[5].value,'');
assert.equal(rv.legends[6].kind,'nested');assert.ok(rv.legends[6].label.includes('1.2%'));assert.equal(rv.legends[6].value,'12 USD');
assert.equal(rv.slices[5].value,24);
ref.rows[6].a='500';const regroup=layout.module.exports.compositionLegend(ref);assert.equal(regroup[0].index,6);assert.equal(regroup[0].id,6);assert.equal(ref.rows[0].label,'Shopping');
console.log('Others header/details and stable row mapping passed.');
