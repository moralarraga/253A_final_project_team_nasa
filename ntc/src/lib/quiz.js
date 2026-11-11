import {CENTERS} from './centers.js';
import {missionQuiz} from '../data/missionQuiz.js';
// Fisher-Yates: unbiased, so the correct answer lands in every position equally often.
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Returns {question, right, options} or null when the item's data can't support a fair question.
export function makeQuiz(m,now=new Date().getFullYear()){
  const mq=missionQuiz(m,shuffle);if(mq)return mq; // hand-written mission question when we have one
  if(CENTERS[m.center]){
    const right=CENTERS[m.center],others=shuffle(Object.values(CENTERS).filter(c=>c!==right)).slice(0,3);
    return{question:'Which NASA center is credited with this image in the archive?',right,options:shuffle([right,...others])};
  }
  const yr=Number((m.date||'').slice(0,4));
  if(yr>=1958&&yr<=now){
    const s=new Set([String(yr)]);let guard=0;
    while(s.size<4&&guard++<500){const o=Math.floor(Math.random()*17)-8,y=yr+o;if(o&&y>=1958&&y<=now)s.add(String(y))} // distractors stay in NASA's real range
    if(s.size<4)return null;
    return{question:'According to NASA’s archive, what year is this item dated?',right:String(yr),options:shuffle([...s])};
  }
  return null;
}
