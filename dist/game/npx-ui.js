import {NPX_STAGES,NPX_TITLES,NPX_PATIENTS,NPX_POINTS,NPX_TOOLS} from './npx-biopsy.js';
import {npxTool,npxDrape,npxEndoscope,npxSpecimen} from './npx-art.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,value='',extra='')=>`<button class="secondary-button" data-npx-action="${action}" data-npx-value="${value}" ${extra}>${text}</button>`;
const toolChoices=(action)=>`<div class="npx-tools">${NPX_TOOLS.map(tool=>`<button ${action?`data-npx-action="${action}" data-npx-value="${tool.id}"`:`data-npx-tool="${tool.id}" aria-pressed="false"`} aria-label="${tool.name}">${npxTool(tool.id)}<b>${tool.name}</b></button>`).join('')}</div>`;
export function npxHTML(t,{near=false}={}){
  const stage=t.stage,index=NPX_STAGES.indexOf(stage),team=stage==='instrument'?'刷手':stage==='handoff'?'流動':null;
  const group=index<3?0:index<7?1:2,tracker=`<span class="npx-step-count">${String(index+1).padStart(2,'0')} / 09</span>`+['準備','操作','交接'].map((name,i)=>`<span class="${i<group?'checked':i===group?'current':''}">${i<group?'✓ ':''}${name}</span>`).join('');
  let art=['scope','instrument','sample','hemostasis'].includes(stage)?npxEndoscope(t):['label','handoff'].includes(stage)?npxSpecimen(t):npxDrape(t),hits='',body='';
  if(!near)body=`<p>${team?`這一步要到${team}身旁，當面接上這一台的工作。`:'先回到手術台，繼續這一台。'}已完成的部分都還在。</p><button id="npxWalk" class="primary-button">${team?'走近'+team:'回到手術台'} →</button>`;
  else if(stage==='verify')body=`<div class="npx-paper"><small>13房 · 流動交來的當台資料</small><strong>${esc(t.patient.name)}</strong><span>本台：NPX biopsy<br>部位：鼻咽</span></div><p>和當台資料核對，這位病人是誰？</p><div class="npx-names">${NPX_PATIENTS.map(p=>button(p.name,'verify',p.id)).join('')}</div>`;
  else if(stage==='drape'){
    body='<p>點選三處待鋪位置，把這一台的簡單鋪單完成。</p><div class="npx-assist-note">刷手：「鋪單備好了，先把這邊鋪好。」</div>';
    hits=[{x:31,y:36},{x:69,y:36},{x:50,y:76}].map((p,i)=>t.drapes.includes(i)?'':`<button class="npx-hit drape-hit" style="left:${p.x}%;top:${p.y}%" aria-label="鋪好第${i+1}處" data-npx-action="drape" data-npx-value="${i}">＋ 鋪單</button>`).join('');
  }else if(stage==='packing'){
    body='<p>先拿止血綿完成 packing，再接內視鏡。</p>'+toolChoices()+`<p id="npxSelected" class="npx-selected" aria-live="polite">先選一樣物品。</p>`;
    hits='<button class="npx-hit packing-hit" data-npx-use="pack" disabled>使用選取物品</button>';
  }else if(stage==='scope'){
    body='<p>觀察內視鏡畫面，找到不規則的 NPX mass。</p><div class="npx-assist-note">點選畫面上的三個觀察位置。看清楚，再向刷手要器械。</div>';
    hits=NPX_POINTS.map((p,i)=>`<button class="npx-hit scope-hit" style="left:${p.x}%;top:${p.y}%" data-npx-action="inspect" data-npx-value="${i}" aria-label="觀察${p.label}"><span>觀察</span></button>`).join('');
  }else if(stage==='instrument')body='<p>已經看到病灶了。現在向刷手要取檢體的器械。</p>'+toolChoices('instrument');
  else if(stage==='sample'){
    const p=NPX_POINTS[t.mass];body='<p>Biopsy cup 已拿到。對準剛剛確認的病灶，取一塊檢體。</p><div class="npx-held-tool">'+npxTool('cup')+'<span>手上：Biopsy cup</span></div><small>按住畫面按鈕直到亮起，也可選取按鈕後按 Enter。</small>';
    hits=`<button class="npx-hit hold-hit" style="left:${p.x}%;top:${p.y}%" data-npx-hold="sample" data-npx-value="${t.mass}">按住取檢體</button>`;
  }else if(stage==='hemostasis'){
    const p=NPX_POINTS[t.mass];body='<p>一塊檢體已留下。接著拿棉棒完成這一台的止血。</p>'+toolChoices()+'<p id="npxSelected" class="npx-selected" aria-live="polite">先選一樣物品。</p><small>按住畫面按鈕直到亮起，也可按 Enter。</small>';
    hits=`<button class="npx-hit hold-hit" style="left:${p.x}%;top:${p.y}%" data-npx-hold="hemostasis" disabled>按住完成止血</button>`;
  }else if(stage==='label')body=`<p>檢體來自 <b>${esc(t.patient.name)}</b>的<b>鼻咽</b>。選出姓名與部位都正確的標籤。</p><div class="npx-labels">${t.labels.map(l=>`<button data-npx-action="label" data-npx-value="${l.id}"><small>病理檢體</small><strong>${esc(l.patient)}</strong><span>部位：${l.site}</span></button>`).join('')}</div>`;
  else if(stage==='handoff')body=`<div class="npx-paper"><small>檢體瓶標示已核對</small><strong>${esc(t.patient.name)}</strong><span>鼻咽 · 一塊檢體<br>本台止血已完成</span></div><p>把檢體與這一台的工作交代給流動。</p><button id="npxHandoff" class="primary-button" data-npx-action="handoff">確認標示，把檢體交給流動 ✓</button>`;
  return`<h2 id="modalTitle">${NPX_TITLES[stage]}</h2><div class="npx-patient-line"><b>${esc(t.patient.name)}</b><span>NPX biopsy · 鼻咽 · ${esc(t.attending)}</span></div><div class="npx-tracker">${tracker}</div><div class="npx-layout"><div class="npx-visual">${art}${near?hits:''}<span class="npx-view-caption">${['scope','sample','hemostasis'].includes(stage)?'簡化內視鏡視野':'13房 · 這一台的工作'}</span></div><div class="npx-work">${body}${t.seniorJoined?'<div class="npx-assist-note">學長已一起回13房，需要時可以請他協助。</div>':''}<p id="npxFeedback" class="npx-feedback" role="status">${esc(t.feedback)}</p>${near&&['scope','sample','hemostasis'].includes(stage)?`<button id="npxSupport" class="text-button">${t.seniorJoined?'請學長協助這一步':'需要學長協助，去16房找他'} →</button>`:''}</div></div><div class="npx-bottom"><small>科內娛樂的簡化情境</small><button id="npxLater" class="text-button">先回房內，進度保留 →</button>${t.practice?'<button id="npxCases" class="text-button">選擇另一台手術 →</button>':''}</div>`;
}
export function bindNPX(t,{act,walk,later,choose,active}){
  let selected=null;
  const value=b=>['verify','pack','instrument','hemostasis','label'].includes(b.dataset.npxAction)?b.dataset.npxValue:Number(b.dataset.npxValue);
  document.querySelectorAll('[data-npx-action]').forEach(b=>b.onclick=()=>act(b.dataset.npxAction,value(b)));
  document.querySelectorAll('[data-npx-tool]').forEach(b=>b.onclick=()=>{selected=b.dataset.npxTool;document.querySelectorAll('[data-npx-tool]').forEach(el=>{const chosen=el===b;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});document.querySelector('#npxSelected').textContent='選取：'+NPX_TOOLS.find(tool=>tool.id===selected).name;document.querySelectorAll('[data-npx-use],[data-npx-hold]').forEach(el=>el.disabled=false);});
  document.querySelectorAll('[data-npx-use]').forEach(b=>b.onclick=()=>act(b.dataset.npxUse,selected));
  document.querySelectorAll('[data-npx-hold]').forEach(b=>{
    let timer;const stage=t.stage,clear=()=>{clearTimeout(timer);b.classList.remove('holding');};
    const commit=()=>{clear();if(b.isConnected&&active()&&t.stage===stage)act(b.dataset.npxHold,b.dataset.npxHold==='sample'?Number(b.dataset.npxValue):selected);};
    b.onpointerdown=e=>{if(b.disabled||e.button!==0)return;b.setPointerCapture(e.pointerId);clear();b.classList.add('holding');timer=setTimeout(commit,700);};b.onpointerup=b.onpointercancel=b.onblur=clear;b.onclick=e=>{if(e.detail===0&&!b.disabled)commit();};
  });
  const byId=id=>document.getElementById(id);if(byId('npxWalk'))byId('npxWalk').onclick=walk;if(byId('npxSupport'))byId('npxSupport').onclick=()=>act('support');byId('npxLater').onclick=later;if(byId('npxCases')&&choose)byId('npxCases').onclick=choose;
}
