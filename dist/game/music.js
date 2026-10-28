export const MUSIC_TRACKS=[{id:'before-dawn',title:'天亮以前',artist:'原創忘年會歌曲',src:'./assets/audio/before-dawn.m4a',type:'audio/mp4'}];
export const ENDING_TRACK='before-dawn';
export function musicScope({started,ending,location,orRoom}){return ending?'ending':!started?null:location==='f5'&&[13,16].includes(orRoom)?'or':'distant';}
export function musicPresence({ending,location,orRoom},sourceRoom){return ending?1:location!=='f5'?.08:orRoom===sourceRoom?1:orRoom?.35:.2;}
export function musicClock(seconds){if(!Number.isFinite(seconds)||seconds<0)return'0:00';return Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');}

// Keep one transport across rooms; only welcome/restart or an explicit stop clears it.
export function createMusicPlayer(element,{onChange=()=>{}}={}){
  let scope=null,track=null,volume=.3,ducked=false,presence=1,gain=1,sourceRoom=null,currentRoom=null,request=0,wantedPlaying=false,loading=false,message='選一首歌，再按播放。';
  element.preload='none';element.loop=false;element.setAttribute('playsinline','');element.id='gameMusic';
  const emit=()=>onChange(snapshot());
  const applyVolume=()=>{element.volume=Math.max(0,Math.min(1,volume*gain*(ducked?.25:1)));};
  function snapshot(){return{scope,track,volume,ducked,presence,sourceRoom,loading,playing:!!track&&!element.paused&&!element.ended,time:element.currentTime||0,duration:Number.isFinite(element.duration)?element.duration:0,message};}
  function stop(){request++;wantedPlaying=false;loading=false;element.pause();try{element.currentTime=0;}catch{}message='已停止播放。';emit();}
  function setScope(next,{duck=false,presence:level=1,room=null}={}){currentRoom=room;presence=Number.isFinite(level)?Math.max(0,Math.min(1,level)):1;if(scope!==next){scope=next;if(!next)stop();}if(ducked!==duck){ducked=duck;applyVolume();emit();}}
  function update(dt){gain+=(presence-gain)*(1-Math.exp(-Math.max(0,dt)*3));if(Math.abs(presence-gain)<.0001)gain=presence;applyVolume();}
  async function play(id=track?.id||MUSIC_TRACKS[0].id,{restart=false}={}){
    const chosen=MUSIC_TRACKS.find(t=>t.id===id);if(!scope||!chosen)return false;
    if(scope==='or')sourceRoom=currentRoom;wantedPlaying=true;const token=++request;if(track?.id!==id){track=chosen;element.src=chosen.src;element.load();}if(restart)try{element.currentTime=0;}catch{}
    loading=true;message='正在開啟歌曲…';applyVolume();emit();
    try{await element.play();if(token!==request){if(!scope||!wantedPlaying)element.pause();return false;}loading=false;message='';emit();return true;}
    catch{if(token!==request)return false;wantedPlaying=false;loading=false;message='歌曲尚未播放，按播放再試一次。';emit();return false;}
  }
  function pause(){request++;wantedPlaying=false;loading=false;element.pause();message='已暫停。';emit();}
  function setVolume(value){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));applyVolume();emit();}
  function seek(value){if(Number.isFinite(value)&&Number.isFinite(element.duration))element.currentTime=Math.max(0,Math.min(element.duration,value));emit();}
  for(const event of ['timeupdate','loadedmetadata','durationchange','play','pause'])element.addEventListener(event,emit);
  element.addEventListener('ended',()=>{wantedPlaying=false;loading=false;message='歌曲播完了。';emit();});
  element.addEventListener('error',()=>{loading=false;message='歌曲暫時無法載入，請再試一次。';emit();});
  return{element,snapshot,setScope,update,play,pause,stop,setVolume,seek};
}
