import {ITEMS as DEMO,demoFind,demoPair} from '../data/demo.js';
import {CENTERS} from './centers.js';
import {cleanDesc,quality,rankKey} from './rank.js';
export {CENTERS};
export const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
export const fmt=iso=>{const[y,m,d]=iso.split('-').map(Number);return `${MONTHS[m-1]} ${d}, ${y}`};
export const short=iso=>{const[y,m,d]=iso.split('-').map(Number);return `${MONTHS[m-1].slice(0,3)} ${d}, ${y}`};
export const demoOn=()=>{try{return localStorage.getItem('demo')==='1'}catch{return false}};
export const setDemo=v=>{try{localStorage.setItem('demo',v?'1':'0')}catch{}};
const PROD=import.meta.env.PROD;
// Production goes through /api/nasa (cached). Dev calls NASA directly.
const get=(path,params={})=>{const qs=new URLSearchParams(PROD?{path,...params}:params);
  return fetch(PROD?`/api/nasa?${qs}`:`https://images-api.nasa.gov${encodeURI(path)}?${qs}`).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json()})};
const https=u=>u&&u.replace(/^http:/,'https:');
const parse=it=>{const d=it.data[0],p=(it.links||[]).find(l=>l.rel==='preview')||(it.links||[])[0];
  return{id:d.nasa_id,title:d.title||'Untitled',desc:cleanDesc(d.description||''),date:(d.date_created||'').slice(0,10),type:d.media_type,center:d.center,photographer:d.photographer||d.secondary_creator||'',keywords:d.keywords||[],thumb:https(p&&p.href)}};
export const dist=(iso,m,d)=>{const[,mm,dd]=iso.split('-').map(Number),x=Math.abs(Date.UTC(2001,mm-1,dd)-Date.UTC(2001,m-1,d))/864e5;return Math.min(x,365-x)};
const cache=new Map(); // per-year results, so repeat searches cost no requests
async function fetchYear(y,kw){
  const k=y+'|'+kw;if(cache.has(k))return cache.get(k);
  const rs=await Promise.all([1,2].map(page=>get('/search',{q:kw||'nasa',media_type:'image,video',year_start:y,year_end:y,page_size:100,page}).catch(()=>null)));
  if(rs.every(r=>r===null))throw new Error('network');
  const items=rs.flatMap(r=>r?.collection?.items||[]).filter(it=>it.data?.[0]&&it.links?.[0]).map(parse).filter(x=>x.date&&x.thumb);
  cache.set(k,items);return items;
}
const minDist=c=>c.items.length?Math.min(...c.items.map(x=>x.dist)):99;
const score=c=>Math.min(c.near,6)*100-minDist(c);
export async function findMemories(o,onProgress){
  if(demoOn())return demoFind(o,dist);
  const{kw,m,d,fixed}=o,now=new Date().getFullYear(),pool=[];for(let y=1962;y<now;y++)pool.push(y);
  const years=fixed?[fixed]:pool.sort(()=>Math.random()-.5).slice(0,4);let best=null;
  for(let i=0;i<years.length;i++){
    const y=years[i];onProgress?.({year:y,i,n:years.length});
    const items=(await fetchYear(y,kw)).map(x=>({...x,dist:dist(x.date,m,d),q:quality(x)}));
    items.sort((a,b)=>rankKey(a)-rankKey(b)||b.desc.length-a.desc.length);
    const c={year:y,items,near:items.filter(x=>x.dist<=3).length};
    if(!best||score(c)>score(best))best=c;if(c.near>=4)break;
  }
  best.items=best.items.slice(0,60);return best;
}
export async function getAsset(m){
  if(m.demo)return{};
  const j=await get(`/asset/${m.id}`),urls=(j.collection?.items||[]).map(x=>https(x.href));
  if(m.type==='video')return{video:urls.find(u=>/~mobile\.mp4$/i.test(u))||urls.find(u=>/~medium\.mp4$/i.test(u))||urls.find(u=>/\.mp4$/i.test(u))};
  return{image:['~large','~medium','~orig'].map(s=>urls.find(u=>u.includes(s)&&/\.(jpe?g|png)$/i.test(u))).find(Boolean)};
}
export async function thenNowPair(kw){
  if(demoOn())return demoPair(kw);
  const now=new Date().getFullYear(),rng=(a,b)=>get('/search',{q:kw,media_type:'image',year_start:a,year_end:b,page_size:10}).then(j=>(j.collection.items||[]).filter(it=>it.data?.[0]&&it.links?.[0]).map(parse).filter(x=>x.thumb&&x.date));
  const[a,b]=await Promise.all([rng(1958,1985),rng(now-4,now)]);return a[0]&&b[0]?[a[0],b[0]]:null;
}
const topicCache=new Map();
export async function topicItems(kw){
  if(demoOn())return DEMO.filter(x=>x.keywords.some(w=>w.toLowerCase()===kw.toLowerCase()));
  if(topicCache.has(kw))return topicCache.get(kw);
  const j=await get('/search',{q:kw,media_type:'image',page_size:12}),items=(j.collection?.items||[]).filter(it=>it.data?.[0]&&it.links?.[0]).map(parse).filter(x=>x.thumb&&x.date);
  topicCache.set(kw,items);return items;
}
