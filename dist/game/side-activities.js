// Side activities persist per place and never enter the scored call deck.
export const SIDE_ACTIVITIES={
  printer:{title:'印表機 · 找到卡紙處',done:'印表機 · 恢復列印',relief:5},
  water:{title:'冷氣漏水 · 看一下',done:'漏水 · 已通知公務課',relief:6},
  tissue:{title:'洗手台 · 補衛生紙',done:'洗手台 · 衛生紙已補',relief:5}
};
export function createSideActivities(){return{completed:[],sessions:{},password:{changed:false,history:['ENToncall!01','ENToncall!02','ENToncall!03'],attempts:0}};}
export function activityKey(location,room,id){return`${location}${room?'-'+room:''}:${id}`;}
export function finishSideActivity(state,key){const id=key.split(':').at(-1);if(!SIDE_ACTIVITIES[id]||state.completed.includes(key))return 0;state.completed.push(key);return SIDE_ACTIVITIES[id].relief;}
export function attemptPassword(state,value){if(state.changed)return'changed';state.attempts++;if(state.history.slice(-3).includes(value))return'reused';if(!/^ENToncall!\d{2}$/.test(value))return'invalid';state.history=[...state.history,value].slice(-3);state.changed=true;return'ok';}
export const PASSWORD_CHOICES=['ENToncall!01','ENToncall!02','ENToncall!03','ENToncall!04'];
