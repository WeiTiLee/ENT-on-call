import {workVitals} from './vitals.js';
export function createFoodState(){return{orders:[],focus:null,popcorn:false,drinkOffered:false,drinkResponded:false,drinkSeeking:false,drinkRoom:null};}
const delivery={lunchOrder:{id:'bento',supply:'meal',name:'便當',clock:1080,place:'ward',dest:'f7',spot:'nurse'},drink:{id:'drink',supply:'drink',name:'無糖茶',clock:0,place:'or',dest:'f5',spot:'or-dining'},takoyaki:{id:'takoyaki',supply:'takoyaki',name:'章魚燒',clock:0,place:'ward',dest:'f7',spot:'nurse'}};
// Ordering reserves food; collecting at its delivery location restores vitals.
export function orderFood(food,eventId,effect={},clock){
  const item=delivery[eventId];if(!item||!(effect.meal||effect.drink))return null;
  const existing=food.orders.find(o=>o.id===item.id);if(existing)return existing;
  const order={...item,name:effect.mealName||effect.drinkName||item.name,readyAt:Math.max(item.clock,clock),awaitingExit:eventId==='drink',taken:false,notified:false};food.orders.push(order);return order;
}
export const foodStatus=(order,clock)=>order.taken?'taken':!order.awaitingExit&&clock>=order.readyAt?'ready':'ordered';
export const pendingFood=food=>food.orders.filter(o=>!o.taken);
export const pickupLabel=order=>order.place==='or'?'5F 刀房右側 · 餐廳':'7F · 護理站';
export const stationSupplies=(food,clock,place='ward')=>[...food.orders.filter(o=>o.place===place&&foodStatus(o,clock)==='ready').map(o=>({id:o.supply,name:o.name,orderId:o.id})),...(place==='or'?[]:[{id:'biscuit'}])];
export function restaurantView(food,clock){
  const order=food.orders.find(o=>o.id==='drink'),status=order?foodStatus(order,clock):food.drinkResponded?'declined':'not-ordered';
  const copy={
    ready:['你的飲料到了。',order?.name+'已放在餐廳，領取並享用後會補充數值。'],
    ordered:['飲料已訂，還沒放到餐廳。','訂單已交給流動，出房後再到右側餐廳領取。'],
    taken:['這杯已經領走了。','你的飲料已領取，不能重複領；需要零食可到2G零食櫃或7F討論室。'],
    declined:['今天沒有訂飲料。','你已回覆流動今天不訂，所以餐廳沒有待領飲料。'],
    'not-ordered':['還沒有你的飲料訂單。','進13房或16房時，流動會問要不要一起訂飲料。']
  }[status];
  return{state:status,title:copy[0],description:copy[1],items:stationSupplies(food,clock,'or')};
}
export function collectFood(food,id,clock,place='ward'){const order=food.orders.find(o=>o.id===id);if(!order||order.place!==place||foodStatus(order,clock)!=='ready')return null;order.taken=true;if(food.focus===id)food.focus=null;return order;}
export function focusFood(food,id,clock){const order=food.orders.find(o=>o.id===id);if(!order||foodStatus(order,clock)!=='ready')return false;food.focus=id;return true;}
export const focusedFood=(food,clock)=>food.orders.find(o=>o.id===food.focus&&foodStatus(o,clock)==='ready')||null;
export function foodArrivals(food,clock){const arrived=food.orders.filter(o=>!o.notified&&foodStatus(o,clock)==='ready');for(const o of arrived)o.notified=true;return arrived;}
export function releaseORDrinks(food,clock){const orders=food.orders.filter(o=>o.place==='or'&&o.awaitingExit);for(const o of orders){o.awaitingExit=false;o.readyAt=clock;}return orders;}
export const orDrinkAvailable=s=>s.started&&s.location==='f5'&&[13,16].includes(s.orRoom)&&s.run?.ids.includes('drink')&&!s.food.drinkResponded&&!s.completed.includes('drink');
export function answerORDrink(s,effect={}){if(!orDrinkAvailable(s))return false;const order=orderFood(s.food,'drink',effect,s.clock);s.food.drinkResponded=true;s.food.drinkSeeking=false;if(!s.explore&&!s.completed.includes('drink')){s.completed.push('drink');workVitals(s);}return{order};}
