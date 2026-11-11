// Offline demo data: no network calls at all. Images are generated illustrations, not NASA photos.
const art=(h,s)=>{let r=s;const rnd=()=>(r=(r*9301+49297)%233280)/233280;let st='';
  for(let i=0;i<60;i++)st+=`<circle cx="${rnd()*400}" cy="${rnd()*300}" r="${rnd()*1.4+.3}" fill="#fff" opacity="${rnd()*.8+.2}"/>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><radialGradient id="g" cx=".35" cy=".35"><stop offset="0" stop-color="hsl(${h},80%,70%)"/><stop offset="1" stop-color="hsl(${h},70%,18%)"/></radialGradient></defs><rect width="400" height="300" fill="#050814"/>${st}<circle cx="${150+rnd()*100}" cy="150" r="${70+rnd()*30}" fill="url(#g)"/></svg>`)};
const D=(date,title,desc,center,keywords,hue)=>({id:'demo-'+date,title,desc,date,type:'image',center,photographer:'Illustration for demo mode',keywords,thumb:art(hue,+date.replace(/-/g,'')%9999+7),demo:true});
export const ITEMS=[
D('1968-12-24','Earthrise','Apollo 8 astronauts, the first humans to orbit the Moon, photographed Earth rising over the lunar horizon.','JSC',['Earth','Moon','Apollo 8'],210),
D('1969-07-16','Apollo 11 lifts off','A Saturn V rocket carried Armstrong, Aldrin and Collins from Kennedy Space Center toward the Moon.','KSC',['Moon','Apollo 11'],30),
D('1969-07-20','One small step','Apollo 11’s lunar module Eagle landed in the Sea of Tranquility, and Armstrong and Aldrin walked on the surface.','JSC',['Moon','Apollo 11'],50),
D('1972-12-07','The Blue Marble','On the way to the Moon, the Apollo 17 crew photographed the whole sunlit Earth.','JSC',['Earth','Apollo 17'],200),
D('1976-07-20','Viking 1 lands on Mars','Viking 1 became the first U.S. spacecraft to land on Mars and send back images from the surface.','LARC',['Mars','Viking'],15),
D('1981-04-12','Columbia flies','Space Shuttle Columbia launched on STS-1, the first orbital flight of the shuttle program.','KSC',['Space Shuttle','Columbia'],260),
D('1990-04-24','Hubble launches','The Hubble Space Telescope was launched aboard Space Shuttle Discovery.','GSFC',['Hubble','Space Shuttle'],280),
D('1997-07-04','Pathfinder lands on Mars','Mars Pathfinder landed and released Sojourner, NASA’s first Mars rover.','JPL',['Mars','Pathfinder'],10),
D('2012-08-06','Curiosity touches down','The Curiosity rover landed in Gale Crater on Mars using a rocket-powered sky crane.','JPL',['Mars','Curiosity'],20),
D('2015-07-06','Earth from a million miles','The EPIC camera on the DSCOVR satellite photographed the full sunlit Earth from about a million miles away.','GSFC',['Earth','DSCOVR'],190),
D('2021-02-18','Perseverance lands','The Perseverance rover landed in Jezero Crater on Mars.','JPL',['Mars','Perseverance'],5),
D('2021-12-25','Webb launches','The James Webb Space Telescope launched on an Ariane 5 rocket from French Guiana.','GSFC',['Webb'],300),
D('2022-11-16','Artemis I launches','Artemis I launched the Orion spacecraft on an uncrewed flight around the Moon.','KSC',['Moon','Artemis'],40)];
const yr=x=>+x.date.slice(0,4);
export function demoFind({m,d,fixed},dist){
  const l=ITEMS.map(x=>({...x,dist:dist(x.date,m,d)}));let pool=fixed?l.filter(x=>yr(x)===fixed):[];if(!pool.length)pool=l;
  pool.sort((a,b)=>a.dist-b.dist);const year=yr(pool[0]);
  return{year,near:0,items:[...pool.filter(x=>yr(x)===year),...pool.filter(x=>yr(x)!==year)].slice(0,8)};
}
export function demoPair(kw){const k=kw.toLowerCase(),l=ITEMS.filter(x=>x.keywords.some(w=>w.toLowerCase()===k));return l.length>1?[l[0],l[l.length-1]]:null}
