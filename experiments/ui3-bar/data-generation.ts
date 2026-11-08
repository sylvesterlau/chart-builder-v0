// Shared by Bar and Line; generation is explicit and never mutates imported data on selection.
export function generateValues(count:number,min:number,max:number,trend:string,variation:string,seed:number){
 if(!Number.isFinite(min)||!Number.isFinite(max)||min>=max)throw Error('Minimum must be smaller than Maximum.');
 return Array.from({length:count},(_,i)=>{const t=i/Math.max(1,count-1);const shape=trend==='Falling'?1-t:trend==='Rise–fall'?1-Math.abs(2*t-1):trend==='Fall–rise'?Math.abs(2*t-1):trend==='Steady'?.5:trend==='Random'?((i*37+seed*17)%101)/100:t;// Steady describes a stable level, including at High variation. Use slow,
 // point-count-independent movement rather than alternating point noise.
 const steadyWave=.75*Math.sin(t*Math.PI*2+seed)+.25*Math.sin(t*Math.PI*4+seed*.7);
 const noise=trend==='Steady'?steadyWave*({Low:.008,Medium:.025,High:.06}[variation]||.025):Math.sin(i*2.4+seed)*({Low:.02,Medium:.08,High:.18}[variation]||.08);return String(Math.round(Math.max(min,Math.min(max,min+(max-min)*(shape+noise)))))});
}

export const generationTrends=['Rising','Falling','Rise–fall','Fall–rise','Steady','Random'];

// Fixed control points describe one continuous signal, regardless of sample count.
// Only generated demo data uses this; imported datasets bypass the generator.
export function generateLineValues(count:number,min:number,max:number,trend:string,variation:string,seed:number){
 if(!Number.isInteger(count)||count<2||count>100)throw Error('Use 2–100 points.');
 if(!Number.isFinite(min)||!Number.isFinite(max)||min>=max)throw Error('Minimum must be smaller than Maximum.');
 let state=seed>>>0;
 const anchors=Array.from({length:8},()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296*2-1});
 const amplitude=trend==='Steady'?({Low:.008,Medium:.025,High:.06}[variation]??.025):({Low:.03,Medium:.08,High:.16}[variation]??.08);
 return Array.from({length:count},(_,i)=>{
  const t=i/(count-1),position=t*(anchors.length-1),index=Math.min(anchors.length-2,Math.floor(position)),u=position-index;
  const blend=u*u*(3-2*u),noise=anchors[index]+(anchors[index+1]-anchors[index])*blend;
  const shape=trend==='Falling'?1-t:trend==='Rise–fall'?1-Math.abs(2*t-1):trend==='Fall–rise'?Math.abs(2*t-1):trend==='Steady'||trend==='Random'?.5:t;
  const normalized=.18+.64*shape+amplitude*noise;
  const value=Math.max(min,Math.min(max,min+(max-min)*normalized));
  // Keep small demo ranges useful without rounding outside their bounds.
  const decimals=Math.min(10,Math.max(0,2-Math.floor(Math.log10(max-min))));
  return String(Math.max(min,Math.min(max,Number(value.toFixed(decimals)))));
 });
}
