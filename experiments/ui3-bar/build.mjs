import {build,transform} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
await fs.mkdir('dist',{recursive:true});
const compat={name:'compat-renderer',setup(b){b.onLoad({filter:/\/(src|ui\/preview)\/.*\.tsx$/},async({path:p})=>({contents:'import HiveCompat from "preact/compat";\n'+(await transform(await fs.readFile(p,'utf8'),{loader:'tsx',jsxFactory:'HiveCompat.createElement',jsxFragment:'HiveCompat.Fragment'})).code,loader:'js',resolveDir:path.dirname(p)}))}};
const ui=await build({tsconfigRaw:{compilerOptions:{target:"ES2017"}},entryPoints:['ui.tsx'],bundle:true,write:false,outdir:'dist',format:'iife',jsxFactory:'h',jsxFragment:'Fragment',inject:['preact-inject.ts'],plugins:[compat],loader:{'.svg':'dataurl'},alias:{'@create-figma-plugin/utilities':path.resolve('node_modules/@create-figma-plugin/utilities'),preact:path.resolve('node_modules/preact'),react:path.resolve('node_modules/preact/compat'),'react-dom/client':path.resolve('node_modules/preact/compat/client'),'react-dom':path.resolve('node_modules/preact/compat'),'hive-adapter':'./ui/components/hive.tsx'},define:{__SPIKE_LABEL__:JSON.stringify('Hive UI3 experimental plugin')},nodePaths:[path.resolve('node_modules')],minify:true});
const js=ui.outputFiles.find(f=>f.path.endsWith('.js')).text,css=ui.outputFiles.find(f=>f.path.endsWith('.css')).text;
const theme=await fs.readFile('theme.css','utf8');
const html='<!doctype html><html data-fixture="bar-plugin"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+theme+css+'</style><div id="root"></div><script>'+js.replaceAll('</script','<\\/script')+'</script></html>';
await fs.writeFile('dist/index.html',html);
await build({tsconfigRaw:{compilerOptions:{target:"ES2017"}},entryPoints:['main.ts'],bundle:true,outfile:'dist/code.js',format:'iife',target:'es2017',define:{__html__:JSON.stringify(html)},nodePaths:[path.resolve('node_modules')],minify:true});
let local={};try{local=JSON.parse(await fs.readFile('manifest.json','utf8'))}catch{}
await fs.writeFile('manifest.json',JSON.stringify({name:'Hive UI3 · Experimental Charts',...(local.id?{id:local.id}:{}),api:'1.0.0',main:'dist/code.js',editorType:['figma'],documentAccess:'dynamic-page',networkAccess:{allowedDomains:['none']}},null,2));
console.log('Built experimental plugin and browser preview. Local manifest ID preserved.');
