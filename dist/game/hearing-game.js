export const HEARING_FREQUENCIES=[500,1000,2000,4000];
export const HEARING_GRADES=[
  {id:'b230.0',label:'未達聽覺功能障礙基準'},
  {id:'b230.1',label:'輕度聽覺功能障礙'},
  {id:'b230.2',label:'中度聽覺功能障礙'},
  {id:'b230.3',label:'重度聽覺功能障礙'}
];
export const HEARING_SOURCES={
  reference:'https://hearingaction.com/blog/article?subsidy_1',
  criteria:'https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000399716&lan=C',
  formula:'https://www.chshb.gov.tw/sites/default/files/2018-12/%E8%BA%AB%E5%BF%83%E9%9A%9C%E7%A4%99%E9%91%91%E5%AE%9A%E5%A1%AB%E8%A1%A8%E8%AA%AA%E6%98%8E%20-%20104_01_20CHI(14)_0.pdf'
};
// Fictional adult cases use measurable pure-tone thresholds, without NR or ABR conversions.
export const HEARING_PATIENTS=[
  {name:'林先生',age:62,right:[55,60,60,65],left:[60,65,65,70]},
  {name:'陳小姐',age:46,right:[75,75,80,80],left:[80,80,85,85]},
  {name:'黃先生',age:71,right:[90,95,95,100],left:[85,90,90,95]},
  {name:'周小姐',age:35,right:[35,40,40,45],left:[40,45,45,50]}
];
const valid=values=>Array.isArray(values)&&values.length===4&&values.every(n=>Number.isFinite(n)&&n>=-10&&n<=120);
export function calculateHearing(right,left,age){
  if(!valid(right)||!valid(left)||!Number.isFinite(age)||age<0)return null;
  // Keep tenths as integers so decimal ties such as 91.95 round upward reliably.
  const ear=values=>{const pta10=Math.round(values.reduce((sum,n)=>sum+n,0)*10/4);return{pta:pta10/10,impairment:Math.max(0,Math.min(1000,Math.round((pta10-250)*3/2)))/10};};
  const r=ear(right),l=ear(left),better=r.impairment<=l.impairment?'right':'left',poorer=better==='right'?'left':'right',ears={right:r,left:l};
  const binaural=Math.round((Math.round(ears[better].impairment*10)*5+Math.round(ears[poorer].impairment*10))/6)/10;
  const alternative=age>=6&&Math.max(r.pta,l.pta)>=90&&Math.min(r.pta,l.pta)>=48;
  const grade=binaural>=90.1?'b230.3':binaural>=70.1?'b230.2':binaural>=(age<6?22.5:45)||alternative?'b230.1':'b230.0';
  return{right:r,left:l,better,poorer,binaural,grade,alternative};
}
export function createHearingTask(seed,{practice=false}={}){let n=0;for(const c of String(seed))n=(n*31+c.charCodeAt(0))>>>0;const patient=HEARING_PATIENTS[n%HEARING_PATIENTS.length];return{patient:{...patient,right:[...patient.right],left:[...patient.left]},practice,values:{right:[null,null,null,null],left:[null,null,null,null]},result:null,diagnosis:null,stage:'input'};}
export function setHearingValue(task,ear,index,value){if(!['right','left'].includes(ear)||!Number.isInteger(index)||index<0||index>3||task.stage==='done')return false;const number=value===''||value===null?null:Number(value);if(number!==null&&(!Number.isFinite(number)||number<-10||number>120||number%5!==0))return false;task.values[ear][index]=number;task.result=null;task.diagnosis=null;task.stage='input';return true;}
export function checkHearingInputs(task){
  if(['right','left'].some(ear=>task.values[ear].some(n=>n===null)))return'missing';
  if(['right','left'].some(ear=>task.values[ear].some((n,i)=>n!==task.patient[ear][i])))return'mismatch';
  task.result=calculateHearing(task.values.right,task.values.left,task.patient.age);task.stage='diagnosis';return'ok';
}
export function chooseHearingGrade(task,id){if(task.stage!=='diagnosis'||!task.result||id!==task.result.grade)return false;task.diagnosis=id;task.stage='handoff';return true;}
export function handInHearing(task){if(task.stage!=='handoff'||!task.diagnosis)return false;task.stage='done';return true;}
export function audiogramSVG(patient){
  const xs=[85,190,295,400],y=db=>40+(db+10)*2.15;
  const grid=Array.from({length:14},(_,i)=>i*10-10).map(db=>`<path d="M60 ${y(db)}H445"/><text x="47" y="${y(db)+4}" text-anchor="end">${db}</text>`).join('');
  const vertical=xs.map((x,i)=>`<path d="M${x} 40V319.5"/><text x="${x}" y="343" text-anchor="middle">${HEARING_FREQUENCIES[i]} Hz</text>`).join('');
  const ears=['right','left'].map(ear=>`<g class="audio-${ear}"><polyline points="${patient[ear].map((db,i)=>`${xs[i]},${y(db)}`).join(' ')}"/>${patient[ear].map((db,i)=>`${ear==='right'?`<circle cx="${xs[i]}" cy="${y(db)}" r="6"/>`:`<path class="audio-cross" d="M${xs[i]-6} ${y(db)-6}l12 12m-12 0l12-12"/>`}<text x="${xs[i]+(ear==='right'?-12:12)}" y="${y(db)+(ear==='right'?-10:18)}" text-anchor="${ear==='right'?'end':'start'}">${db}</text>`).join('')}</g>`).join('');
  return`<svg class="hearing-audiogram" viewBox="0 0 490 362" role="img" aria-label="虛構聽力圖。右耳：${patient.right.join('、')} dB HL；左耳：${patient.left.join('、')} dB HL，依序為 500、1000、2000、4000 Hz。"><rect x="60" y="40" width="385" height="279.5" rx="3"/><g class="audio-grid">${grid}${vertical}</g><text x="16" y="22">dB HL</text><text x="90" y="22" class="audio-key-right">○ 右耳</text><text x="185" y="22" class="audio-key-left">× 左耳</text>${ears}</svg>`;
}
