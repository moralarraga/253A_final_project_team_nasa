// Generative ambient piano, synthesized live with the Web Audio API (no audio files, no licensing).
// D major pentatonic over a soft D/A pad, with long reverb. The music follows the app's motion via setMood():
//   landing = slow, sparse notes   warp = fast rising arpeggio   results = calm and spacious
// Tuning knobs are MOODS, SCALE and the master volume below.
const SCALE=[293.66,329.63,369.99,440,493.88,587.33,659.25,739.99,880]; // D4 E4 F#4 A4 B4 D5 E5 F#5 A5
const ROOTS=[73.42,61.74,98,55]; // D2 B1 G2 A1, one soft bass note every 8 steps
const MOODS={landing:{dt:.95,rest:.35,vel:.1,lp:1},warp:{dt:.17,rest:0,vel:.13,lp:2},results:{dt:1.4,rest:.5,vel:.08,lp:.8}};
const VOLUME=.8;
let AC,master,bus,timer=null,next=0,idx=4,step=0,mood='landing',muted=true;

function impulse(sec){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}return b}
function init(){
  if(AC)return;AC=new(window.AudioContext||window.webkitAudioContext)();
  const comp=AC.createDynamicsCompressor();master=AC.createGain();master.gain.value=0;bus=AC.createGain();
  const rev=AC.createConvolver(),wet=AC.createGain(),dry=AC.createGain();rev.buffer=impulse(3.8);wet.gain.value=.55;dry.gain.value=.6;
  bus.connect(dry);dry.connect(master);bus.connect(rev);rev.connect(wet);wet.connect(master);master.connect(comp);comp.connect(AC.destination);
  // soft pad: D3 + A3 + D4, slowly breathing
  const padG=AC.createGain(),lp=AC.createBiquadFilter(),lfo=AC.createOscillator(),lfoG=AC.createGain();
  padG.gain.value=.045;lp.type='lowpass';lp.frequency.value=520;lfo.frequency.value=.07;lfoG.gain.value=.025;lfo.connect(lfoG);lfoG.connect(padG.gain);lfo.start();
  [146.83,220,293.66].forEach((f,i)=>{const o=AC.createOscillator();o.type=i?'sine':'triangle';o.frequency.value=f+(i?.3:0);o.connect(lp);o.start()});
  lp.connect(padG);padG.connect(bus);
  document.addEventListener('visibilitychange',()=>{if(!AC)return;document.hidden?AC.suspend():(!muted&&AC.resume())});
}
function note(f,t,v,lp=1,dur=3){
  const o=[1,2.003,3.01].map((m,i)=>{const x=AC.createOscillator();x.type=i===1?'triangle':'sine';x.frequency.value=f*m;return x}),
    g=AC.createGain(),fl=AC.createBiquadFilter(),amp=[1,.35,.12];
  o.forEach((x,i)=>{const a=AC.createGain();a.gain.value=amp[i];x.connect(a);a.connect(g)});
  fl.type='lowpass';fl.frequency.setValueAtTime(Math.min(f*7*lp,9000),t);fl.frequency.exponentialRampToValueAtTime(Math.max(f*1.5,300),t+dur*.6); // bright attack that mellows, like a struck string
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  g.connect(fl);fl.connect(bus);o.forEach(x=>{x.start(t);x.stop(t+dur+.1)});
}
function tick(){
  const m=MOODS[mood];
  while(next<AC.currentTime+.4){
    if(step%8===0)note(ROOTS[(step/8|0)%4],next,m.vel*1.3,.6,5);
    if(mood==='warp')idx=idx>=SCALE.length-1?0:idx+1;
    else idx=Math.max(0,Math.min(SCALE.length-1,idx+Math.round((Math.random()*2-1)*2)));
    if(Math.random()>=m.rest)note(SCALE[idx],next+Math.random()*.03,m.vel*(.7+Math.random()*.5),m.lp,mood==='warp'?1.6:3.2);
    next+=m.dt*(mood==='warp'?1:.85+Math.random()*.3);step++;
  }
}
export function setMood(m){mood=m;if(m==='warp')idx=0}
export function toggleSound(){
  init();muted=!muted;const t=AC.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);
  if(!muted){AC.resume();master.gain.linearRampToValueAtTime(VOLUME,t+1.5);if(!timer){next=t+.1;timer=setInterval(tick,100)}}
  else{master.gain.linearRampToValueAtTime(0,t+.6);setTimeout(()=>{if(muted&&timer){clearInterval(timer);timer=null}},700)}
  return muted;
}
export function whoosh(){
  if(muted||!AC)return;const n=AC.sampleRate*2.2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=b;bp.type='bandpass';bp.Q.value=.8;
  bp.frequency.setValueAtTime(200,t);bp.frequency.exponentialRampToValueAtTime(3500,t+1.8);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.9);g.gain.linearRampToValueAtTime(0,t+2.2);
  s.connect(bp);bp.connect(g);g.connect(bus);s.start();
}
