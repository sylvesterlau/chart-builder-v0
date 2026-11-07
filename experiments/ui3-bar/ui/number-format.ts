// Display-only formatting: never mutate raw values or round their precision.
export function formatAmount(value:number, options:any={}, compact=false):string {
 const {prefix='',suffix=' USD',separator='Comma'}=options;
 const units=compact&&options.shorthand!=='None'?[[1e9,'B'],[1e6,'M'],[1e3,'k']] as const:[];
 const unit=units.find(([scale])=>Math.abs(value)>=scale);
 const number=unit?Number((value/unit[0]).toPrecision(12)):value;
 const plain=String(number), [integer,fraction]=plain.split('.');
 const group=separator==='None'?'':',';
 const formatted=group?integer.replace(/\B(?=(\d{3})+(?!\d))/g,group):integer;
 return prefix+formatted+(fraction===undefined?'':'.'+fraction)+(unit?unit[1]:'')+suffix;
}
