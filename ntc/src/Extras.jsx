import {Component,useEffect,useMemo,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'framer-motion';
import {thenNowPair,topicItems} from './lib/nasa.js';
import {makeQuiz} from './lib/quiz.js';
const up={h:{opacity:0,y:16},s:{opacity:1,y:0}};
// If WebGL or the 3D scene fails, the app keeps working without it.
export class Boundary extends Component{state={e:false};static getDerivedStateFromError(){return{e:true}}render(){return this.state.e?null:this.props.children}}
export const Story=({c})=><motion.div className="glass storycard" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><div className="stamp">Curated story</div><h2>{c[0]}</h2><p className="sub">{c[1]}</p></motion.div>;
export function Quiz({m,onStar}){
  const q=useMemo(()=>makeQuiz(m),[m.id]),[pick,setPick]=useState(null),locked=useRef(false);
  if(!q)return null;
  const choose=o=>{if(locked.current)return;locked.current=true;setPick(o);if(o===q.right)onStar(m.id)}; // ref guard: a fast double-click can't answer twice
  return <motion.section variants={up} className="story quiz" role="group" aria-label="Quiz"><h3>Did you know?</h3><p>{q.question}</p>
    <div className="chips" style={{marginTop:8}}>{q.options.map(o=><button key={o} className="chip pick" style={pick&&{borderColor:o===q.right?'#6dff9c':o===pick?'#ff6b6b':undefined}} onClick={()=>choose(o)}>{o}</button>)}</div>
    <p className="fb" aria-live="polite">{pick&&(pick===q.right?`Correct! ★ added to your capsule. ${q.why||''}`:`Not quite. It was ${q.right}. ${q.why||''}`)}</p></motion.section>;
}
export function ThenNow({kw,onClose}){
  const[pair,setPair]=useState(undefined),[v,setV]=useState(50);
  useEffect(()=>{thenNowPair(kw).then(setPair).catch(()=>setPair(null))},[kw]);
  return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
    <motion.div className="sheet glass one" role="dialog" aria-modal="true" aria-label={kw+': then vs. now'} initial={{scale:.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.94,opacity:0}} onClick={e=>e.stopPropagation()}>
      <div className="capbox"><button className="close" autoFocus aria-label="Close" onClick={onClose}>×</button><h2>{kw}: then vs. now</h2>
        {pair===undefined?<p className="sub">Searching the archive…</p>:!pair?<p className="sub">We couldn’t find images for that topic right now.</p>:<>
          <p className="sub">Drag the slider to see how our view has changed.</p>
          <div className="cmp"><img src={pair[1].thumb} alt={pair[1].title}/><img src={pair[0].thumb} alt={pair[0].title} style={{clipPath:`inset(0 ${100-v}% 0 0)`}}/>
            <span className="lab" style={{left:10}}>Then · {pair[0].date.slice(0,4)}</span><span className="lab" style={{right:10}}>Now · {pair[1].date.slice(0,4)}</span>
            <input type="range" aria-label="Compare then and now" min="0" max="100" value={v} onChange={e=>setV(+e.target.value)}/></div>
          <p className="sub">Then: {pair[0].title}</p><p className="sub">Now: {pair[1].title}</p></>}</div></motion.div></motion.div>;
}
// Explore: tap a topic and related content opens right here inside the section.
export function Explore({keywords,currentId,onOpen,onCompare}){
  const[k,setK]=useState(null),[items,setItems]=useState(null),tok=useRef(0);
  const pick=kw=>{if(kw===k){setK(null);return}setK(kw);setItems(null);const t=++tok.current;
    topicItems(kw).then(l=>t===tok.current&&setItems(l.filter(x=>x.id!==currentId).slice(0,10))).catch(()=>t===tok.current&&setItems([]))};
  return <motion.section variants={up} className="story"><h3>Explore this topic</h3>
    <div className="chips">{keywords.map(w=><button key={w} className={'chip pick'+(w===k?' on':'')} aria-expanded={w===k} onClick={()=>pick(w)}>{w}</button>)}</div>
    <AnimatePresence initial={false}>{k&&<motion.div key={k} initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} style={{overflow:'hidden'}}>
      {items===null?<p className="sub" style={{margin:'10px 0'}}>Searching the archive…</p>:items.length===0?<p className="sub" style={{margin:'10px 0'}}>No more images found for “{k}”.</p>:<>
        <p className="sub" style={{margin:'10px 0 0'}}>More on “{k}”. Tap one to open it.</p>
        <div className="xstrip">{items.map(it=><button key={it.id} onClick={()=>onOpen(it)}><img src={it.thumb} alt={it.title} loading="lazy"/><span>{it.title}</span></button>)}</div></>}
      <button className="ghost small" onClick={()=>onCompare(k)}>Compare then vs. now</button></motion.div>}</AnimatePresence></motion.section>;
}
