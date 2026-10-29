// Keep one label per object while allowing all physically reachable sides.
export function perimeterApproaches(x,z,w,d,padding=.9){return[{x,z:z-d/2-padding},{x,z:z+d/2+padding},{x:x-w/2-padding,z},{x:x+w/2+padding,z}];}
export function approachPoints(spot){return[spot,...(spot.approaches||[])];}
export function spotDistance(spot,position,reachable=()=>true){return Math.min(...approachPoints(spot).filter(reachable).map(p=>Math.hypot(p.x-position.x,p.z-position.z)));}
export function sortedApproaches(spot,position,reachable=()=>true){return approachPoints(spot).filter(reachable).sort((a,b)=>Math.hypot(a.x-position.x,a.z-position.z)-Math.hypot(b.x-position.x,b.z-position.z));}
