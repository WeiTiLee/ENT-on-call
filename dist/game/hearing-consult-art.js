import {audiogramSVG} from './hearing-game.js';

export function consultAudiogram(t){
  const p=t.patient,xs=[85,190,295,400],y=db=>40+(db+10)*2.15;
  const bone=['right','left'].map(ear=>{const values=ear==='right'?p.boneRight:p.boneLeft;return`<g stroke="${ear==='right'?'#ab4f49':'#385d93'}" fill="none" stroke-width="2">${values.map((db,i)=>`<path d="M${xs[i]+(ear==='right'?-9:9)} ${y(db)-5}h${ear==='right'?'-6':'6'}v10h${ear==='right'?'6':'-6'}"/>`).join('')}</g>`;}).join('');
  const previous=t.branch==='sshl'?`<polyline stroke="#7a897e" stroke-dasharray="5 5" fill="none" points="${p.baseline.map((db,i)=>`${xs[i]},${y(db)}`).join(' ')}"/>`:'';
  return audiogramSVG(p).replace('</svg>',previous+bone+'</svg>');
}
export function consultOtoscopy(t,{interactive=false}={}){
  return`<div class="consult-ears">${['right','left'].map(ear=>{
    const wax=t.branch==='wax',clear=(!wax||[0,1].every(i=>t.cleaned.includes(ear+'-'+i))),label=ear==='right'?'右耳':'左耳';
    return`<div class="consult-ear"><b>${label}</b><div class="consult-ear-view"><svg viewBox="0 0 220 190" role="img" aria-label="${label}耳鏡示意：${clear?'耳道與鼓膜可見':'可見大片耳垢，仍有部分通道'}"><defs><radialGradient id="ear-${ear}"><stop stop-color="#ba8b73"/><stop offset=".62" stop-color="#71554b"/><stop offset="1" stop-color="#2a363a"/></radialGradient></defs><ellipse cx="110" cy="95" rx="99" ry="83" fill="url(#ear-${ear})"/><ellipse cx="118" cy="94" rx="48" ry="56" fill="#c9bab0" stroke="#e1cec0" stroke-width="3" opacity=".9"/><path d="M121 56l-5 43 23 19" fill="none" stroke="#ede4d6" stroke-width="4"/><path d="M92 120l-8 13 30 9" fill="#f0e2c8" opacity=".7"/>${wax?[0,1].filter(i=>!t.cleaned.includes(ear+'-'+i)).map(i=>`<path d="${i===0?'M32 55Q63 22 104 48L99 98Q63 116 35 93Z':'M47 107Q93 88 123 119L110 161Q55 170 41 138Z'}" fill="${i===0?'#9c682c':'#b37b32'}" stroke="#d1a459" stroke-width="3"/>`).join(''):''}</svg>${interactive&&wax?[0,1].filter(i=>!t.cleaned.includes(ear+'-'+i)).map(i=>`<button class="consult-wax wax-${i}" data-consult-clean="${ear}-${i}" aria-label="清理${label}第 ${i+1} 塊耳垢"><span>按住清理</span></button>`).join(''):''}</div><small>${clear?'耳道與鼓膜可見':'大片耳垢，仍有部分通道'}</small></div>`;
  }).join('')}</div>`;
}
