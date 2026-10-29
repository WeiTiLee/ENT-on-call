export function hudVitals(s){
  const specs=[['energy','體力',s.energy,35,15,'坐下可恢復','找椅子休息','體力不足'],['hunger','飽足',s.hunger,30,15,'記得吃東西','先吃一口','快餓扁了'],['temper','脾氣',s.temper,65,85,'越低越好','脾氣上來了','先冷靜一下']];
  return specs.map(([key,label,value,warning,critical,normalHint,warningHint,criticalHint])=>{const high=key==='temper',level=(high?value>=critical:value<=critical)?'critical':(high?value>=warning:value<=warning)?'warning':'normal';return{key,label,value:Math.round(value),level,hint:level==='critical'?criticalHint:level==='warning'?warningHint:normalHint};});
}
