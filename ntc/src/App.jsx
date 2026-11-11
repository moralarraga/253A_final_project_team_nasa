import {Suspense,lazy,useEffect,useRef,useState} from 'react';
import {AnimatePresence,MotionConfig,animate,motion} from 'framer-motion';
import {Boundary,Explore,Quiz,Story,ThenNow} from './Extras.jsx';
import Guide from './Guide.jsx';
import {CURATED} from './data/curated.js';
import {shareCard} from './lib/shareCard.js';
import {setMood,toggleSound,whoosh} from './lib/audio.js';
import {CENTERS,MONTHS,demoOn,findMemories,fmt,getAsset,setDemo,short} from './lib/nasa.js';
import {supabase} from './lib/supabase.js';
import {clearRemote,loadRemote,ls,saveRemote} from './lib/capsule.js';
const Scene=lazy(()=>import('./Scene.jsx'));

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const RM=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEV=new URLSearchParams(location.search).has('demo'); // ?demo shows testing controls
const STEPS=['Choose','Travel','Explore','Keep'];
const spring={type:'spring',stiffness:240,damping:26};
const rise={hidden:{opacity:0,y:40,scale:.94},show:i=>({opacity:1,y:0,scale:1,transition:{delay:i*.08,...spring}})};
const up={h:{opacity:0,y:16},s:{opacity:1,y:0}};
const hashFor=o=>'#'+new URLSearchParams({m:o.m,d:o.d,...(o.fixed?{y:o.fixed}:{}),...(o.kw?{kw:o.kw}:{})});
const message=(res,o)=>{const exact=res.items.filter(i=>i.dist===0).length,min=Math.min(...res.items.map(i=>i.dist));
  return exact?`${exact} transmission${exact>1?'s':''} from this exact day, plus the nearest memories around it.`
  :min<=3?`NASA's archive is quiet on this exact day, so here are the nearest memories (within ${min} day${min>1?'s':''}).`
  :`NASA's archive is quiet around this date in ${res.year}. These are the closest memories we could find (${Math.round(min)} days away).`};

export default function App(){
  const now=new Date().getFullYear(),t0=new Date();
  const[view,setView]=useState('landing'),[mo,setMo]=useState(t0.getMonth()+1),[da,setDa]=useState(t0.getDate()),[yr,setYr]=useState(''),[kw,setKw]=useState('');
  const[err,setErr]=useState(null),[stage,setStage]=useState(''),[toast,setToast]=useState('');
  const[res,setRes]=useState(null),[opts,setOpts]=useState(null),[odo,setOdo]=useState(now),[detail,setDetail]=useState(null);
  const[capOpen,setCapOpen]=useState(false),[user,setUser]=useState(null),[topic,setTopic]=useState(null);
  const[trail,setTrail]=useState([]),[visible,setVisible]=useState(13);
  const[items,setItems]=useState(()=>ls.get('cap-items',[])),[sealed,setSealed]=useState(()=>ls.get('cap-sealed',null)),[stars,setStars]=useState(()=>ls.get('star-ids',[]));
  const[muted,setMuted]=useState(true),[demo,setDemoState]=useState(demoOn),[netFail,setNetFail]=useState(false),[tipSeen,setTipSeen]=useState(()=>ls.get('tip',false));
  const flick=useRef(),jc=useRef(0);
  const yNum=/^\d{4}$/.test(yr)?+yr:null,yOk=!!yNum&&yNum>=1958&&yNum<=now,maxDay=new Date(yNum||2000,mo,0).getDate();
  const yHint=!yr?'Add your year to travel to an exact day, or let us surprise you.':!yOk?`NASA's archive covers 1958–${now}.`:'';
  const addStar=id=>setStars(l=>l.includes(id)?l:[...l,id]);
  useEffect(()=>ls.set('cap-items',items),[items]);
  useEffect(()=>ls.set('cap-sealed',sealed),[sealed]);
  useEffect(()=>ls.set('star-ids',stars),[stars]);
  useEffect(()=>setMood(view),[view]);
  useEffect(()=>{if(da>maxDay)setDa(maxDay)},[maxDay]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(t)},[toast]);
  useEffect(()=>{if(!supabase)return;
    supabase.auth.getSession().then(({data})=>setUser(data.session?.user??null));
    const{data:s}=supabase.auth.onAuthStateChange((_e,ses)=>setUser(ses?.user??null));return()=>s.subscription.unsubscribe()},[]);
  useEffect(()=>{if(user)loadRemote(user).then(r=>r&&setSealed(r)).catch(()=>{})},[user]);
  useEffect(()=>{const k=e=>{if(e.key==='Escape'){setDetail(null);setCapOpen(false);setTopic(null)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
  useEffect(()=>{ // shareable links + Back button
    const p=new URLSearchParams(location.hash.slice(1)),m=+p.get('m'),d=+p.get('d');
    if(m>=1&&m<=12&&d>=1&&d<=31){const y=+p.get('y')||null,k=p.get('kw')||'';setMo(m);setDa(d);if(y)setYr(String(y));setKw(k);journey({kw:k,m,d,fixed:y&&y>=1958&&y<=now?y:null},{push:false})}
    const pop=()=>{if(!location.hash){setView('landing');setDetail(null);setCapOpen(false);setTopic(null)}};
    addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop)},[]);

  async function journey(o,{push=true}={}){
    setOpts(o);setErr(null);setView('warp');whoosh();setStage('Opening the capsule…');
    const first=jc.current++===0,minMs=RM?500:first?1600:900;
    clearInterval(flick.current);flick.current=setInterval(()=>setOdo(1958+Math.floor(Math.random()*(now-1958))),70);
    const t=Date.now();let r,e;
    try{r=await findMemories(o,p=>setStage(p.n>1?`Searching ${p.year} (${p.i+1} of ${p.n})…`:`Searching ${p.year}…`))}catch(x){e=x}
    await sleep(Math.max(0,minMs-(Date.now()-t)));clearInterval(flick.current);
    if(e||!r?.items.length){setView('landing');setNetFail(!!e);
      setErr({net:!!e,text:e?"We couldn't reach NASA's archive. Check your connection and try again.":"NASA's archive is quiet for that search. Try another date or keyword."});return}
    setStage('Receiving transmissions…');
    if(RM)setOdo(r.year);else await new Promise(done=>animate(now,r.year,{duration:1,ease:'easeOut',onUpdate:v=>setOdo(Math.round(v)),onComplete:done}));
    setVisible(13);setRes(r);setView('results');if(push)history.pushState(null,'',hashFor(o));
  }
  const go=fixed=>{if(fixed&&!yOk)return;journey({kw:kw.trim(),m:mo,d:da,fixed:fixed?yNum:null})};
  const saved=m=>items.some(i=>i.id===m.id);
  const toggle=m=>{const was=saved(m);setItems(l=>was?l.filter(i=>i.id!==m.id):[...l,{id:m.id,title:m.title,thumb:m.thumb,date:m.date}]);setToast(was?'Removed from your capsule':'Saved to your capsule ✓')};
  const open=m=>{setTrail([]);setDetail(m);if(!tipSeen){setTipSeen(true);ls.set('tip',true)}};
  const openRelated=m=>{setTrail(t=>[...t,detail]);setDetail(m)};
  const back=()=>{setDetail(trail[trail.length-1]);setTrail(t=>t.slice(0,-1))};
  const home=()=>{history.pushState(null,'',location.pathname+location.search);setView('landing')};
  const copyLink=()=>navigator.clipboard?.writeText(location.href).then(()=>setToast('Link copied ✓')).catch(()=>setToast('Copy the link from your address bar'));
  const stepIdx=capOpen?3:view==='results'?2:view==='warp'?1:0;
  const story=res&&opts&&CURATED[`${res.year}-${String(opts.m).padStart(2,'0')}-${String(opts.d).padStart(2,'0')}`];

  return <MotionConfig reducedMotion="user">
    <Boundary><Suspense fallback={null}><Scene mode={view}/></Suspense></Boundary>
    <header className="nav"><div className="logo">NASA <b>Time Capsule</b></div>
      <ol className="stepsnav" aria-label="Journey progress">{STEPS.map((s,i)=><li key={s} className={i===stepIdx?'on':i<stepIdx?'done':''} aria-current={i===stepIdx?'step':undefined}>{s}</li>)}</ol>
      <div className="btns"><button className="glass pill" aria-label={muted?'Turn sound on':'Turn sound off'} onClick={()=>setMuted(toggleSound())}>{muted?'🔇':'🔊'}</button>
        <button className="glass pill" onClick={()=>{setDetail(null);setCapOpen(true)}}>My capsule · {items.length} · ★ {stars.length}</button></div></header>
    <AnimatePresence mode="wait">
      {view==='landing'&&<motion.main key="l" className="view scroll" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.96}} transition={{duration:.5}}>
        <div className="hero">
          <p className="eyebrow">Team NASA · live prototype</p>
          <h1>What was humanity looking at <em>that day?</em></h1>
          <p className="sub">Pick a date that matters. We travel back through NASA's archive and bring back what the universe looked like then. Learn the story, then seal your favorites in a capsule for your future self.</p>
          <div className="glass form" role="group" aria-label="Choose a date">
            <div className="dgrid">
              <label>Month<select value={mo} onChange={e=>setMo(+e.target.value)}>{MONTHS.map((n,i)=><option key={n} value={i+1}>{n}</option>)}</select></label>
              <label>Day<select value={da} onChange={e=>setDa(+e.target.value)}>{Array.from({length:maxDay},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
              <label>Year<input inputMode="numeric" maxLength={4} placeholder="e.g. 1998" value={yr} onChange={e=>setYr(e.target.value.replace(/\D/g,''))}/></label></div>
            <label>Keyword (optional)<input value={kw} placeholder="Mars, Apollo, Hubble…" onChange={e=>setKw(e.target.value)}/></label>
            <div className="btns"><motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:.96}} className="primary" disabled={!yOk} onClick={()=>go(true)}>Take me to this exact day</motion.button>
              <motion.button whileHover={{y:-2}} whileTap={{scale:.96}} className="ghost" onClick={()=>go(false)}>Surprise me with a random year</motion.button></div>
            {yHint&&<p className="note" aria-live="polite">{yHint}</p>}
            {err&&<div className="err" role="alert"><span>{err.text}</span>{err.net&&!demo&&<button className="ghost small" onClick={()=>{setDemo(true);setDemoState(true);setErr(null)}}>Use offline demo</button>}</div>}
            <div className="btns">{['Earth','Mars','Moon'].map(k=><button key={k} className="ghost small" onClick={()=>setTopic(k)}>Then vs. Now: {k}</button>)}</div>
            {(DEV||demo||netFail)&&<label className="chk"><input type="checkbox" checked={demo} onChange={e=>{setDemo(e.target.checked);setDemoState(e.target.checked)}}/> Offline demo mode (no NASA calls)</label>}</div>
          <button className="link cue" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works ↓</button></div>
        <Guide/></motion.main>}
      {view==='warp'&&<motion.div key="w" className="view warp" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <div><div className="odo" aria-live="off">{odo}</div><p aria-live="polite">{stage}</p></div></motion.div>}
      {view==='results'&&res&&<motion.main key="r" className="view scroll" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <div className="rhead"><div><div className="rday">On {MONTHS[opts.m-1]} {opts.d} · {opts.fixed?'your year':'random year'}</div><div className="ryear">{res.year}</div>
          <p className="rmsg">{message(res,opts)}{opts.m===1&&opts.d===1?' Heads up: NASA often files undated items under January 1, so some of these may not truly be from that day.':''}</p>
          {!tipSeen&&<p className="tip">Tap any image to open its story.</p>}</div>
          <div className="btns"><button className="ghost" onClick={()=>shareCard(res,opts)}>Share card</button><button className="ghost" onClick={copyLink}>Copy link</button>
            <button className="ghost" onClick={()=>journey({...opts,fixed:null})}>{opts.fixed?'Try a random year':'Another random year'}</button><button className="primary" onClick={home}>New journey</button></div></div>
        {story&&<Story c={story}/>}
        <div className="grid">{res.items.slice(0,visible).map((m,i)=>
          <motion.button key={m.id} custom={i<13?i:(i-13)%12} variants={rise} initial="hidden" animate="show" whileHover={{y:-6}} whileTap={{scale:.97}} aria-label={`${m.title}, ${short(m.date)}`}
            className={'card'+(i===0?' big':i%5===4?' wide':'')} onClick={()=>open(m)}>
            <motion.div layoutId={'img-'+m.id} className="cardimg" transition={spring} style={{opacity:detail?.id===m.id?0:1}}><img src={m.thumb} alt="" loading="lazy"/></motion.div>
            {m.type==='video'&&<span className="tag">▶ Video</span>}<span className={'tag r'+(m.dist===0?' exact':'')}>{short(m.date)}</span><div className="cap">{m.title}</div></motion.button>)}</div>
        <div className="more">{visible<res.items.length&&<button className="ghost" onClick={()=>setVisible(v=>v+12)}>Show more memories ({res.items.length-visible} more)</button>}</div></motion.main>}
    </AnimatePresence>
    <AnimatePresence>{detail&&<Detail key={detail.id} m={detail} saved={saved(detail)} onSave={()=>toggle(detail)} onClose={()=>{setDetail(null);setTrail([])}} onStar={addStar} onTopic={setTopic} onOpen={openRelated} onBack={trail.length?back:null} backTitle={trail.length?trail[trail.length-1].title:''}/>}</AnimatePresence>
    <AnimatePresence>{capOpen&&<Capsule {...{items,setItems,sealed,setSealed,user}} devDemo={DEV} onClose={()=>setCapOpen(false)}/>}</AnimatePresence>
    <AnimatePresence>{topic&&<ThenNow key={topic} kw={topic} onClose={()=>setTopic(null)}/>}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div key={toast} className="toast glass" role="status" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>{toast}</motion.div>}</AnimatePresence>
  </MotionConfig>;
}

function Detail({m,saved,onSave,onClose,onStar,onTopic,onOpen,onBack,backTitle}){
  const[asset,setAsset]=useState(null),[txt,setTxt]=useState(''),stop=useRef(()=>{});
  const raw=m.desc||'NASA has not published a description for this item yet.',full=raw.length>900?raw.slice(0,900).replace(/\s\S*$/,'')+'…':raw;
  useEffect(()=>{getAsset(m).then(setAsset).catch(()=>setAsset({}))},[m]);
  useEffect(()=>{let n=0;const id=setInterval(()=>{n+=8;setTxt(full.slice(0,n));if(n>=full.length)clearInterval(id)},16);stop.current=()=>{clearInterval(id);setTxt(full)};return()=>clearInterval(id)},[m]);
  const who=[CENTERS[m.center]||m.center,m.photographer&&'Photo: '+m.photographer].filter(Boolean).join(' · ')||'NASA Image and Video Library';
  return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <div className="sheet glass" role="dialog" aria-modal="true" aria-label={m.title} onClick={e=>e.stopPropagation()}>
      <motion.div layoutId={'img-'+m.id} className="media" transition={spring}>
        {asset?.video?<video src={asset.video} controls playsInline poster={m.thumb}/>:<img src={asset?.image||m.thumb} alt={m.title}/>}
        {!asset&&!m.demo&&<span className="ld">Loading full image…</span>}</motion.div>
      <motion.div className="side" initial="h" animate="s" variants={{s:{transition:{staggerChildren:.07,delayChildren:.25}}}}>
        <button className="close" autoFocus aria-label="Close" onClick={onClose}>×</button>
        {onBack&&<motion.button variants={up} className="link back" onClick={onBack}>← Back to {backTitle.slice(0,40)}</motion.button>}
        <motion.div variants={up} className="toprow"><div className="stamp">{fmt(m.date)}</div>
          <motion.button key={saved} initial={{scale:.9}} animate={{scale:1}} className={saved?'ghost small':'primary small'} onClick={onSave}>{saved?'✓ Saved':'+ Save to capsule'}</motion.button></motion.div>
        <motion.h2 variants={up}>{m.title}</motion.h2>
        <motion.section variants={up} className="story"><h3>What am I looking at?</h3><p title="Click to show all" onClick={()=>stop.current()}>{txt}</p></motion.section>
        <motion.section variants={up} className="story"><h3>Who made this happen?</h3><p>{who}</p></motion.section>
        {m.keywords.length>0&&<Explore keywords={m.keywords.slice(0,8)} currentId={m.id} onOpen={onOpen} onCompare={onTopic}/>}
        <Quiz m={m} onStar={onStar}/>
      </motion.div></div></motion.div>;
}

function Capsule({items,setItems,sealed,setSealed,user,onClose,devDemo}){
  const[note,setNote]=useState(''),[email,setEmail]=useState(''),[msg,setMsg]=useState(''),[peek,setPeek]=useState(false),[confirmNew,setConfirmNew]=useState(false);
  const[unlock,setUnlock]=useState(()=>{const t=new Date();t.setFullYear(t.getFullYear()+1);return t.toISOString().slice(0,10)});
  const open=sealed&&(peek||Date.now()>=new Date(sealed.unlock+'T00:00:00').getTime());
  const[phase,setPhase]=useState('idle');
  useEffect(()=>{if(open&&phase==='idle'){if(RM){setPhase('done');return}setPhase('burst');const t=setTimeout(()=>setPhase('done'),1900);return()=>clearTimeout(t)}},[open]);
  const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
  const addTime=n=>{const t=new Date();t.setMonth(t.getMonth()+n);setUnlock(t.toISOString().slice(0,10))};
  const seal=async()=>{const c={items,note,unlock,sealed:today()};setSealed(c);
    if(user)try{await saveRemote(user,c)}catch{setMsg('Saved on this device, but cloud sync failed.')}};
  const fresh=async()=>{setSealed(null);setItems([]);setPeek(false);setConfirmNew(false);if(user)await clearRemote(user)};
  const signIn=async()=>{const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});setMsg(error?error.message:'Check your email for the sign-in link.')};
  const thumbs=(l,rm)=><div className="thumbs">{l.map((i,k)=><motion.div key={i.id} initial={{opacity:0,scale:.6,rotate:-8}} animate={{opacity:1,scale:1,rotate:0}} transition={{delay:k*.1,...spring}}>
    <img src={i.thumb} alt={i.title}/>{rm&&<button aria-label={'Remove '+i.title} onClick={()=>setItems(x=>x.filter(y=>y.id!==i.id))}>×</button>}</motion.div>)}</div>;
  return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div className="sheet glass one" role="dialog" aria-modal="true" aria-label="Your time capsule" initial={{scale:.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.94,opacity:0}} transition={spring} onClick={e=>e.stopPropagation()}>
      <div className="capbox"><button className="close" autoFocus aria-label="Close" onClick={onClose}>×</button>
        {sealed?(open?(phase!=='done'?<div className="burst"><motion.div className="ringb" initial={{scale:.2,opacity:1}} animate={{scale:7,opacity:0}} transition={{duration:1.7,ease:'easeOut'}}/><motion.div className="ringb" initial={{scale:.2,opacity:.8}} animate={{scale:5,opacity:0}} transition={{duration:1.7,delay:.3,ease:'easeOut'}}/><motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>Opening your capsule…</motion.h2></div>:<><h2>Your capsule is open</h2><p className="sub">Sealed on {fmt(sealed.sealed)}. A note from your past self:</p><div className="note-box"><Typed text={sealed.note||'(no note)'}/></div>{thumbs(sealed.items,false)}
            <button className={confirmNew?'ghost':'primary'} onClick={()=>confirmNew?fresh():setConfirmNew(true)}>{confirmNew?'Click again to delete this capsule and start over':'Start a new capsule'}</button></>)
          :<><motion.div className="seal" animate={{scale:[1,1.07,1]}} transition={{repeat:Infinity,duration:2.4}}>🔒</motion.div><h2>Your capsule is sealed</h2><p className="sub">It opens on {fmt(sealed.unlock)} with {sealed.items.length} memories inside.</p>
            {devDemo&&<button className="ghost" onClick={()=>setPeek(true)}>Demo: open it now</button>}</>)
        :<><h2>Build your time capsule</h2>{items.length===0?<p className="sub">Open any image and tap “Save to capsule”. Your picks will appear here.</p>
          :<>{thumbs(items,true)}<label>Note to your future self<textarea rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Where are you now? What do you hope is true when you open this?"/></label>
            <label>Unlock date<input type="date" value={unlock} min={today()} onChange={e=>setUnlock(e.target.value)}/></label>
            <div className="btns" style={{marginBottom:14}}>{[['1 month',1],['1 year',12],['5 years',60]].map(([l,v])=><button key={l} className="ghost small" onClick={()=>addTime(v)}>{l}</button>)}</div>
            <button className="primary" onClick={seal}>Seal the capsule</button><p className="note" style={{marginTop:8}}>Once sealed, you can’t change it until it opens.</p></>}</>}
        <div className="acct">{!supabase?<p>Saved on this device only. Add Supabase keys to sync across devices.</p>
          :user?<p>Synced as {user.email} · <button className="link" onClick={()=>supabase.auth.signOut()}>Sign out</button></p>
          :<><p>Sign in with email to open your capsule on any device.</p><div className="row"><input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)}/><button className="ghost" onClick={signIn}>Email me a link</button></div></>}
          {msg&&<p>{msg}</p>}</div></div></motion.div></motion.div>;
}

function Typed({text}){const[n,setN]=useState(RM?text.length:0);useEffect(()=>{if(n>=text.length)return;const t=setTimeout(()=>setN(n+2),24);return()=>clearTimeout(t)},[n,text]);return <>{text.slice(0,n)}</>}
