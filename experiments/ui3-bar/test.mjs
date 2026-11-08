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
