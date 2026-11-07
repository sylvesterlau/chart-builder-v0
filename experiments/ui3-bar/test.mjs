import {build} from 'esbuild';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const compiled=await build({entryPoints:['model.ts'],bundle:true,write:false,format:'cjs',platform:'node'});
const sandbox={exports:{},module:{exports:{}}};sandbox.exports=sandbox.module.exports;vm.runInNewContext(compiled.outputFiles[0].text,sandbox);
const {initialDraft,validateDraft,readSaved}=sandbox.module.exports;
const d=initialDraft();d.rows[0].a='-175.25';d.series='1 series';d.rows[0].b='987';
assert.equal(validateDraft(d).rows[0].b,'987');
assert.equal(validateDraft(d).rows[0].a,'-175.25');
const saved=readSaved(JSON.stringify({schema:1,type:'standard-bar',revision:2,draft:d}));assert.equal(saved.revision,2);assert.equal(saved.draft.rows[0].a,'-175.25');
assert.equal(readSaved('{broken'),null);assert.equal(readSaved(JSON.stringify({schema:2,type:'standard-bar',revision:1,draft:d})),null);
for(const value of ['', 'NaN','Infinity','1000000000001']){const bad=initialDraft();bad.rows[0].a=value;assert.throws(()=>validateDraft(bad));}
assert.throws(()=>validateDraft({...d,rows:[]}));assert.throws(()=>validateDraft({...d,arrangement:'Stacked'}));
assert.throws(()=>validateDraft({...d,settings:{...d.settings,divisions:'Custom',count:'0'}}));
assert.equal(validateDraft({...d,debugSecret:'exclude'}).debugSecret,undefined);
assert.equal(validateDraft({...d,selected:999}).selected,6);
console.log('Model checks passed: persistence, hidden series, negative decimals, invalid input, schema whitelist, selection bounds.');
