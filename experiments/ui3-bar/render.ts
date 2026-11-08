import {enableHorizontalResize} from './responsive';
import {drawVerticalBarChart} from '../../src/utils/drawVerticalBarChart';
import {barPresentation} from './chart-config';
export async function renderBar(d:any){
 const view=barPresentation(d);
 const chart=await drawVerticalBarChart(view.config,{normalized:view.config,keyInfo:view.keyInfo,tooltip:view.tooltip,formatTick:view.formatTick,independentGrid:true,gridHorizontal:view.gridHorizontal,gridVertical:view.gridVertical,labelIndices:view.labelIndices,select:false});
 enableHorizontalResize(chart);
 return chart;
}
