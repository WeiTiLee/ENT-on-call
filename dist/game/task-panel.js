// Compare authored markup, not browser-normalized innerHTML, so idle HUD ticks leave controls alone.
const views=new WeakMap();
const key=el=>el?.dataset?.call!==undefined?'call:'+el.dataset.call:el?.dataset?.work!==undefined?'work:'+el.dataset.work:el?.dataset?.foodPickup!==undefined?'food:'+el.dataset.foodPickup:el?.id||null;
export function replaceTaskList(list,html,context){
 const previous=views.get(list);if(previous?.html===html&&previous.context===context)return false;
 const same=previous?.context===context,top=same?list.scrollTop:0,buttons=[...list.querySelectorAll('button')],edge=list.getBoundingClientRect().top;
 const anchor=top>0?buttons.find(b=>b.getBoundingClientRect().bottom>edge):null,anchorKey=key(anchor),offset=anchor?anchor.getBoundingClientRect().top-edge:0;
 const active=list.ownerDocument.activeElement,focusKey=same&&list.contains(active)?key(active):null;
 list.innerHTML=html;views.set(list,{html,context});list.scrollTop=top;
 if(same){const updated=[...list.querySelectorAll('button')],next=anchorKey&&updated.find(b=>key(b)===anchorKey);if(next)list.scrollTop+=next.getBoundingClientRect().top-list.getBoundingClientRect().top-offset;const focus=focusKey&&updated.find(b=>key(b)===focusKey);focus?.focus({preventScroll:true});}
 return true;
}
export function taskScrollState(list){return{up:list.scrollTop>1,down:list.scrollHeight-list.clientHeight-list.scrollTop>1};}
