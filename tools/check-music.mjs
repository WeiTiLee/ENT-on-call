import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MUSIC_TRACKS,ENDING_TRACK,musicScope,musicPresence,musicClock,createMusicPlayer} from '../dist/game/music.js';
import {operatingTeam,anesthesiaLine,isAnesthesiaCutoff} from '../dist/game/or-team.js';
class Media extends EventTarget{
  paused=true;ended=false;currentTime=0;duration=268;volume=1;loads=0;next=null;
  setAttribute(){}load(){this.loads++;}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
  play(){if(this.next)return this.next();this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
}
const media=new Media(),player=createMusicPlayer(media);
assert.equal(await player.play(),false);assert.equal(media.loads,0);
for(const room of [13,16])assert.equal(musicScope({started:true,location:'f5',orRoom:room}),'or');
assert.equal(musicScope({started:true,location:'f5',orRoom:null}),'distant');
assert.equal(musicScope({started:true,location:'g2',orRoom:13}),'distant');
assert.equal(musicScope({started:true,ending:true,location:'f7'}),'ending');
player.setScope('or');assert.equal(await player.play(),true);assert.equal(media.loads,1);
player.setVolume(.8);player.setScope('or',{duck:true});assert.equal(media.volume,.2);
player.setScope('or');assert.equal(media.volume,.8);player.pause();assert(media.paused);
await player.play();assert.equal(media.loads,1,'Resume must reuse the same media element and track');
media.currentTime=100;player.setScope('distant',{presence:.2});for(let i=0;i<120;i++)player.update(1/60);assert(!media.paused);assert.equal(media.currentTime,100);assert.equal(media.loads,1);assert(Math.abs(media.volume-.16)<.003,'Volume fades without changing the playhead');
player.setScope('or',{presence:1,room:13});for(let i=0;i<120;i++)player.update(1/60);assert(Math.abs(media.volume-.8)<.003);assert.equal(media.currentTime,100);assert.equal(media.loads,1);
assert.equal(musicScope({started:false}),null);assert.equal(musicPresence({location:'f5',orRoom:13},13),1);assert.equal(musicPresence({location:'f5',orRoom:16},13),.35);assert.equal(musicPresence({location:'f5',orRoom:null},13),.2);assert.equal(musicPresence({location:'g2'},13),.08);assert.equal(musicPresence({ending:true},13),1);
player.setScope('or',{presence:1});player.update(10);player.setScope(null);assert(media.paused);assert.equal(media.currentTime,0);
player.setScope('ending');media.next=()=>Promise.reject(new Error('autoplay blocked'));
assert.equal(await player.play(ENDING_TRACK,{restart:true}),false);assert(player.snapshot().message.includes('再試'));
media.next=null;assert.equal(await player.play(),true);player.seek(500);assert.equal(media.currentTime,268);player.seek(-5);assert.equal(media.currentTime,0);
media.ended=true;media.dispatchEvent(new Event('ended'));assert.equal(player.snapshot().playing,false);assert(player.snapshot().message.includes('播完'));media.ended=false;
player.setVolume(5);assert.equal(media.volume,1);player.setVolume(NaN);assert.equal(media.volume,1);
assert.equal(await player.play('missing'),false);
let finish;media.next=()=>new Promise(resolve=>{finish=()=>{media.paused=false;resolve();};});const late=player.play();player.pause();finish();await late;assert(media.paused,'Late play promises must respect a subsequent pause');
const audio=await readFile(new URL('../dist/assets/audio/before-dawn.m4a',import.meta.url));assert.equal(audio.toString('ascii',4,8),'ftyp');assert(audio.length>1_000_000);assert(MUSIC_TRACKS.every(t=>t.src));
assert.equal(musicClock(267.9),'4:27');assert.equal(musicClock(Infinity),'0:00');
assert.deepEqual(operatingTeam(13).map(r=>r.id),['circulator','scrub']);assert.deepEqual(operatingTeam(16).map(r=>r.id),['circulator','scrub','anesthesia','senior']);assert.deepEqual(operatingTeam(17),[]);
assert.equal(anesthesiaLine(13,870),null);assert.equal(isAnesthesiaCutoff(16,869.9),false);assert.equal(isAnesthesiaCutoff(16,870),true);assert.equal(isAnesthesiaCutoff(16,1050),false);assert.equal(isAnesthesiaCutoff(13,900),false);
assert(!anesthesiaLine(16,1200).includes('不接下一台'),'Night emergencies must not inherit the daytime cutoff');
console.log('Music / OR team passed: asset, play/pause/retry/race, seek/volume/phone ducking, spatial fade/resume without transport interruption, explicit stop, ending scope, room roles and 14:30 boundary.');
