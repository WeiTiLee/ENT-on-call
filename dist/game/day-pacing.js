import {roundsComplete} from './morning-events.js';
export const CLINIC_DEADLINE=540,NIGHT_START=1050;
export const pacedDay=s=>!!(s.started&&s.opening&&s.run&&!s.explore);
export function remainingORWork(s){return s.run?.phases.filter(p=>p.kind==='case'&&p.dest==='f5'&&!s.completed.includes(p.id))||[];}
export function trackDayPacing(s){if(!pacedDay(s))return;const p=s.pacing??={clinicArrived:false};if(s.clock>=810||s.location==='g2'&&roundsComplete(s.morning)&&s.morning.escort==='done')p.clinicArrived=true;}
export function dayClockCeiling(s){if(!pacedDay(s))return 1890;trackDayPacing(s);if(!s.pacing.clinicArrived&&s.clock<810){const done=roundsComplete(s.morning)&&s.morning.escort==='done';return Math.max(s.clock,done?539:535);}if(s.clock>=810&&s.clock<NIGHT_START&&remainingORWork(s).length)return Math.max(s.clock,1045);return 1890;}
export function spendShiftTime(s,minutes){if(!Number.isFinite(minutes)||minutes<=0)return false;const before=s.clock;s.clock=Math.min(dayClockCeiling(s),s.clock+minutes);return s.clock!==before;}
export function dayClockRate(s){if(!pacedDay(s))return null;trackDayPacing(s);if(!s.pacing.clinicArrived)return s.mode==='walk'?.25:.08;if(s.clock<NIGHT_START){if(s.clock>=810&&remainingORWork(s).length)return s.mode==='walk'?.3:.12;return s.mode==='walk'?.8:.25;}return null;}
export function dayPacingHint(s){if(!pacedDay(s))return'';trackDayPacing(s);if(!s.pacing.clinicArrived)return'上午目標 · 查完房、清完鼻子，09:00前到2G初診間';if(s.clock<810)return'上午 · 初診間工作與會診';if(s.clock<NIGHT_START){const n=remainingORWork(s).length;return n?'下午目標 · 尚有'+n+'台工作，17:30前完成':'刀房工作已完成 · 17:30開始值班';}return'17:30起值班 · 來電持續進入';}
