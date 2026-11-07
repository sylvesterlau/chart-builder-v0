import React from 'react';
import {Button,SegmentedControl,Input,Select,Slider,Tabs,Tooltip,TooltipProvider} from 'figma-kit';
import 'figma-kit/styles.css';
export const name=__SPIKE_LABEL__;
export const Provider=({children}:any)=><TooltipProvider>{children}</TooltipProvider>;
export const Btn=React.forwardRef<HTMLButtonElement,any>(({children,onClick,label,primary=false,disabled=false,...rest},ref)=><Button {...rest} ref={ref} aria-label={label} variant={primary?'primary':'secondary'} onClick={onClick} disabled={disabled}>{children}</Button>);
export const Field=({value,onChange,label}:any)=><Input aria-label={label} value={value} onChange={e=>onChange(e.target.value)}/>;
export const Pick=({value,onChange,label,options}:any)=>{const [open,setOpen]=React.useState(false);return <Select.Root open={open} onOpenChange={setOpen} value={value} onValueChange={onChange} items={options.map((x:string)=>({label:x,value:x}))}><Select.Trigger aria-label={label}><Select.Value/><Select.Icon/></Select.Trigger>{open&&<Select.Portal><Select.Positioner sideOffset={4} alignItemWithTrigger={false}><Select.Popup><Select.List>{options.map((x:string)=><Select.Item key={x} value={x}><Select.ItemText>{x}</Select.ItemText><Select.ItemIndicator/></Select.Item>)}</Select.List></Select.Popup></Select.Positioner></Select.Portal>}</Select.Root>};
export const Range=({value,onChange,max}:any)=><Slider min={1} max={max} step={1} value={[value]} onValueChange={v=>onChange(v[0])} getAriaLabel={()=>'Selected category'}/>;
export const Navigation=({value,onChange}:any)=><Tabs.Root value={value} onValueChange={onChange}><Tabs.List><Tabs.Tab value="Data">Data</Tabs.Tab><Tabs.Tab value="Design">Design</Tabs.Tab></Tabs.List></Tabs.Root>;
export const Tip=({children,text}:any)=><Tooltip content={text}>{children}</Tooltip>;

export const Segment=({value,onChange,options}:any)=><SegmentedControl.Root fullWidth value={value} onValueChange={onChange}>{options.map((o:string)=><SegmentedControl.Item key={o} value={o}>{o}</SegmentedControl.Item>)}</SegmentedControl.Root>;
