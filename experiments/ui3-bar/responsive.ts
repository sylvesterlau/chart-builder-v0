// Horizontal resizing only: preserve type sizes, vertical scale and tick choices.
export function enableHorizontalResize(root:FrameNode){
 const stretch=(n:SceneNode)=>{n.constraints={horizontal:'STRETCH',vertical:'MIN'}};
 const center=(n:SceneNode)=>{n.constraints={horizontal:'CENTER',vertical:'MIN'}};
 const chart=root.children.find(n=>n.name==='Chart') as FrameNode;
 const content=chart.children.find(n=>n.name==='Frame 2') as FrameNode;
 for(const axis of content.children){
  if(axis.type!=='FRAME')continue;
  stretch(axis);
  if(axis.name==='Frame 1'){
   for(const group of axis.children){
    if(group.type!=='FRAME')continue;
    group.layoutSizingHorizontal='FILL';
    for(const child of group.children){
     if(child.name==='Highlighted BG')stretch(child);else center(child);
    }
   }
  }else if(axis.name==='Y-axis'){
   for(const row of axis.children){
    if(row.name==='Ruler'){row.constraints={horizontal:row.x>0?'MAX':'MIN',vertical:'MIN'};continue;}
    if(row.type!=='FRAME')continue;
    row.layoutSizingHorizontal='FILL';
    for(const child of row.children){
     if(child.name==='Axis line')child.layoutSizingHorizontal='FILL';
     else child.constraints={horizontal:child.name==='Right label'?'MAX':'MIN',vertical:'MIN'};
    }
   }
  }else if(axis.name==='X-axis'){
   for(const row of axis.children){
    if(row.name==='Ruler'||row.name==='Axis title'){stretch(row);continue;}
    if(row.type!=='FRAME')continue;
    row.layoutSizingHorizontal='FILL';
    for(const child of row.children)if(child.layoutPositioning==='ABSOLUTE')center(child);
   }
  }
 }
 const tooltip=root.children.find(n=>n.name==='Tooltip') as FrameNode|undefined;
 if(tooltip){
  stretch(tooltip);
  const panel=tooltip.children[0] as FrameNode;
  const pointer=panel.children.find(n=>n.name==='Pointer') as FrameNode;
  const shape=pointer?.children[0];
  // Keep the pointer aligned with the selected category's proportional position.
  if(shape){
   const bars=content.children.find(n=>n.name==='Frame 1') as FrameNode;
   const selected=bars.children.findIndex(n=>'children'in n&&n.children.some(c=>c.name==='Label selected'));
   if(selected>=0){
    const guide=figma.createFrame();guide.name='Pointer alignment';guide.fills=[];guide.clipsContent=false;
    pointer.appendChild(guide);guide.resize(bars.width,1);
    guide.x=chart.x+content.x+bars.x-tooltip.paddingLeft;guide.y=0;
    stretch(guide);guide.layoutMode='HORIZONTAL';guide.primaryAxisSizingMode='FIXED';guide.counterAxisSizingMode='FIXED';
    for(let i=0;i<bars.children.length;i++){
     const cell=figma.createFrame();cell.name='Category anchor';cell.fills=[];cell.clipsContent=false;
     guide.appendChild(cell);cell.resize(bars.width/bars.children.length,1);cell.layoutSizingHorizontal='FILL';
     if(i===selected){cell.appendChild(shape);shape.x=(cell.width-shape.width)/2;shape.y=0;center(shape);}
    }
   }
  }
 }
}
