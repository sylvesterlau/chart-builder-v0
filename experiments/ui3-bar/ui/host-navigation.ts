// Browser fixture links become explicit command switches inside the plugin sandbox.
export function navigateFixture(key:string){
 if(window.parent===window){location.href=key+'.html';return}
 parent.postMessage({pluginMessage:{type:'navigate-fixture',key}},'*');
}
if(window.parent!==window)document.addEventListener('click',event=>{
 const a=(event.target as Element)?.closest?.('a');const href=a?.getAttribute('href');
 if(href&&/^[a-z-]+\.html$/.test(href)){event.preventDefault();navigateFixture(href.slice(0,-5))}
});
