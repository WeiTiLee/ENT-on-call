export function overlaps(a,b,gap=5){return a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;}
// Reserve room for the HUD, then keep the current task and nearby interactions first.
export function layoutMarkers(candidates,{width,height,blocked=[],maxMarkers=6,maxLabels=10}={}){
  const occupied=[...blocked],placed=new Map();let count=0,labelCount=0;
  for(const c of [...candidates].sort((a,b)=>b.priority-a.priority||a.distance-b.distance||a.key.localeCompare(b.key))){
    if(c.marker&&count>=maxMarkers&&!c.goal||!c.marker&&labelCount>=maxLabels)continue;
    const w=Math.min(c.width,width-16),h=c.height;
    for(const shift of [0,-18,18,-36,36]){
      const left=Math.max(8,Math.min(width-w-8,c.x-w/2)),top=c.y-h+shift;
      const rect={left,right:left+w,top,bottom:top+h};
      if(top<8||rect.bottom>height-8||occupied.some(r=>overlaps(rect,r)))continue;
      occupied.push(rect);placed.set(c.key,{x:left+w/2,y:top+h});if(c.marker)count++;else labelCount++;break;
    }
  }
  return placed;
}
