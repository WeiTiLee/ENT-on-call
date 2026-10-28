export const OR_INSTRUMENTS=['鑷子','剪刀','持針器'];
export function operatingTeam(number){
  if(![13,16].includes(number))return[];
  return[{id:'circulator',label:'流動',x:7.3,z:2.2,approach:{x:7,z:4.1}},{id:'scrub',label:'刷手',x:-3,z:-.8,approach:{x:-3.2,z:1}},...(number===16?[{id:'anesthesia',label:'麻姐',x:3.7,z:-5.2,approach:{x:4.2,z:-4.3}},{id:'senior',label:'學長',x:3,z:-.8,approach:{x:3,z:1.6}}]:[])];
}
export function anesthesiaLine(number,clock){
  if(number!==16)return null;
  if(clock>=870&&clock<1050)return'14:30 到囉，麻醉科不接下一台了！';
  return clock>=1050?'急刀的資訊先對齊，團隊在這裡。':'這一台的麻醉狀況我顧著，有需要先跟我確認。';
}
export function isAnesthesiaCutoff(number,clock){return number===16&&clock>=870&&clock<1050;}
