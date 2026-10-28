export const CONSENT_STAGES=['verify','tablet','mrn','sign','handoff','done'];
export const CONSENT_LABELS=['護理站核對','找到平板','輸入病歷號','醫師簽名','交給護理師'];
export const consentSpot=task=>['tablet','mrn','sign'].includes(task.consent.stage)?'consent-tablet':'nurse';
export const consentStageText=task=>({verify:'回護理站核對病人與明日手術。',tablet:'到護理站桌上找到平板。',mrn:'在平板輸入電話資料上的病歷號。',sign:task.consent.doctorSigned?'醫師已簽名，收好平板後交給護理師。':'核對平板上的同意書，簽醫師欄。',handoff:'回護理站，交給護理師拿給病人簽名。',done:'醫師已簽名並交接，病人簽名由護理師接續。'})[task.consent.stage];
export function createConsentState(){return{stage:'verify',verified:false,tabletTaken:false,mrnInput:'',mrnMatched:false,doctorSigned:false,handedToNurse:false,patientSigned:false};}
export function consentAction(task,action,value){
  const c=task?.consent;if(task?.id!=='wardConsent'||!c||task.done)return{ok:false};
  const move=stage=>{c.stage=stage;task.step=CONSENT_STAGES.indexOf(stage);return{ok:true};};
  if(action==='verify'&&c.stage==='verify'){
    if(!task.steps[0].options.includes(value))return{ok:false};if(!value.good)return{ok:false,penalty:true,message:value.reply};c.verified=true;return move('tablet');
  }
  if(action==='take-tablet'&&c.stage==='tablet'&&c.verified){c.tabletTaken=true;return move('mrn');}
  if(action==='input'&&c.stage==='mrn'&&/^\d{0,8}$/.test(String(value))){c.mrnInput=String(value);return{ok:true};}
  if(action==='lookup'&&c.stage==='mrn'&&c.tabletTaken){
    if(c.mrnInput.length!==8)return{ok:false,message:'請輸入資料上的8碼遊戲病歷號。'};
    if(c.mrnInput!==task.patient.mrn)return{ok:false,penalty:true,message:'病歷號不符，請對照護理站的資料再輸入。'};
    c.mrnMatched=true;return move('sign');
  }
  if(action==='doctor-sign'&&c.stage==='sign'&&c.mrnMatched&&!c.doctorSigned){c.doctorSigned=true;return{ok:true,signed:true};}
  if(action==='carry-tablet'&&c.stage==='sign'&&c.doctorSigned)return move('handoff');
  if(action==='handoff'&&c.stage==='handoff'&&c.doctorSigned&&!c.handedToNurse){c.handedToNurse=true;move('done');task.done=true;return{ok:true,completed:true,message:'可晴：「醫師欄簽好了，我拿平板給病人簽名，後面我再核對。」\n\n你已完成醫師簽名與交接，病人簽名由護理師接續。'};}
  return{ok:false};
}
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function consentHTML(task,message=''){
  const c=task.consent,p=task.patient;
  const summary=`<div class="consent-patient"><b>${esc(p.name)}</b><span>${esc(p.bed)}</span><span>遊戲病歷號 <strong>${esc(p.mrn)}</strong></span><span>明日手術 <strong>${esc(task.item)}</strong></span></div>`;
  const badge=`<div class="consent-progress">${CONSENT_LABELS.map((label,i)=>`<span class="${i<task.step?'done':i===task.step?'active':''}">${i<task.step?'✓':i+1} ${label}</span>`).join('')}</div>`;
  const signature=`<svg class="doctor-signature ${c.doctorSigned?'signed':''}" viewBox="0 0 360 95" role="img" aria-label="${c.doctorSigned?'主角 ENT R 的遊戲簽名':'醫師簽名欄尚未簽署'}"><path d="m35 26 50-5-43 9-8 24 46-9m-43-5 34-4m22 16 9-33 15 33 17-37m-8 13 43-7m-20-6-9 39m40-29-9 26m3-19q48-22 39-2l-31 7 35 16m-155 5q80-9 172-7" pathLength="1"/></svg>`;
  let work='';
  if(c.stage==='verify')work=`<p class="modal-copy"><b>${esc(task.steps[0].ask)}</b></p><div id="consentVerifyChoices"></div>`;
  if(c.stage==='tablet')work=`<div class="consent-tablet-illustration" aria-hidden="true"><span>手術同意書</span><b>平板在護理站桌上</b><i></i></div><p class="modal-copy">拿起平板，輸入剛剛核對的病歷號。</p><button data-consent-action="take-tablet" class="primary-button">拿起平板 →</button>`;
  if(c.stage==='mrn')work=`<div class="consent-tablet"><header>手術同意書 · 查詢病人</header><label for="consentMRN">輸入8碼病歷號</label><input id="consentMRN" inputmode="numeric" autocomplete="off" maxlength="8" pattern="[0-9]{8}" value="${esc(c.mrnInput)}"><div class="consent-keypad">${['1','2','3','4','5','6','7','8','9','清除','0','⌫'].map(key=>`<button data-consent-key="${key}" aria-label="${key==='⌫'?'刪除一碼':key}">${key}</button>`).join('')}</div><button data-consent-action="lookup" class="primary-button">查詢同意書 →</button></div>`;
  if(c.stage==='sign')work=`<div class="consent-tablet"><header>手術同意書 · 醫師簽名</header><p class="consent-document"><b>${esc(p.name)} · ${esc(p.mrn)}</b><span>${esc(task.item)} · 明日手術</span></p><div class="consent-signature-pad"><span>醫師簽名欄</span>${signature}<small>${c.doctorSigned?'醫師已簽名 · ENT R':'點下方按鈕，由主角簽名。'}</small></div><p class="consent-patient-status">病人簽名：尚未簽署，交給護理師接續。</p>${c.doctorSigned?'<button data-consent-action="carry-tablet" class="primary-button">收好平板，交給護理師 →</button>':'<button data-consent-action="doctor-sign" class="primary-button">醫師簽名 ✎</button>'}</div>`;
  if(c.stage==='handoff')work=`<div class="consent-handoff"><strong>✓ 醫師已簽名</strong><span>病人簽名：待護理師拿平板給病人</span><p>可晴：「平板給我，我拿給病人簽。」</p><button data-consent-action="handoff" class="primary-button">交給可晴，請她拿給病人簽名 ✓</button></div>`;
  return`<section class="consent-slip">${summary}${badge}</section>${work}<p id="consentFeedback" class="activity-feedback" role="status">${esc(message)}</p><button id="consentLater" class="secondary-button">先離開，資料與簽名進度保留</button>`;
}
