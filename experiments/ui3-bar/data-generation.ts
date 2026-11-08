// Shared by Bar and Line; generation is explicit and never mutates imported data on selection.
export function generateValues(count:number,min:number,max:number,trend:string,variation:string,seed:number){
 if(!Number.isFinite(min)||!Number.isFinite(max)||min>=max)throw Error('Minimum must be smaller than Maximum.');
 return Array.from({length:count},(_,i)=>{const t=i/Math.max(1,count-1);const shape=trend==='Falling'?1-t:trend==='Rise–fall'?1-Math.abs(2*t-1):trend==='Fall–rise'?Math.abs(2*t-1):trend==='Steady'?.5:trend==='Random'?((i*37+seed*17)%101)/100:t;// Steady describes a stable level, including at High variation. Use slow,
 // point-count-independent movement rather than alternating point noise.
 const steadyWave=.75*Math.sin(t*Math.PI*2+seed)+.25*Math.sin(t*Math.PI*4+seed*.7);
 const noise=trend==='Steady'?steadyWave*({Low:.008,Medium:.025,High:.06}[variation]||.025):Math.sin(i*2.4+seed)*({Low:.02,Medium:.08,High:.18}[variation]||.08);return String(Math.round(Math.max(min,Math.min(max,min+(max-min)*(shape+noise)))))});
}
