import {drawVerticalBarChart} from '../../src/utils/drawVerticalBarChart';
import {barPresentation} from './chart-config';
export async function renderBar(d:any){
 const view=barPresentation(d);
 return drawVerticalBarChart(view.config,{normalized:view.config,keyInfo:view.keyInfo,tooltip:view.tooltip,formatTick:view.formatTick,independentGrid:true,select:false});
}
