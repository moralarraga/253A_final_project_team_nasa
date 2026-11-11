// Ranking: real photos first, posters/logos/diagrams last. Plain text heuristics on NASA's metadata.
const BAD=/\b(logo|patch|poster|lithograph|diagram|chart|graph|infographic|slides?|presentation|schematic|emblem|insignia|banner|wordmark|brochure|fact sheet|flyer|certificate|sticker|timeline|table)\b/i;
const BAD2=/\b(orbits?|trajector(y|ies)|footprints?|instrumentation|schedule|fields? of view|sensitivity|configuration|overview)\b/i;
const MEH=/\b(artist|concept|illustration|rendition|animation|graphic|simulation|model)\b/i;
const GOOD=/\b(photograph|astronauts?|crew|surface|earth|mars|moon|lunar|galaxy|nebula|launch|landing|rover|telescope|eclipse|aurora|storm|crater)\b/i;
export const quality=m=>{
  const t=`${m.title} ${(m.keywords||[]).join(' ')} ${(m.desc||'').slice(0,300)}`;let q=0;
  if(BAD.test(m.title))q-=6;else if(BAD.test(t))q-=3;
  if(BAD2.test(m.title))q-=3;if(MEH.test(m.title))q-=2;if(GOOD.test(t))q+=2;
  if(m.type==='video')q-=1;if((m.desc||'').length>80)q+=1;return q;
};
// Lower is better. A photo up to ~4 days away can outrank an exact-day poster.
export const rankKey=x=>x.dist*1.5-x.q;
// Strips NASA's leading catalog codes, e.g. "AS11-40-5874 (20 July 1969) --- Astronaut ..."
export const cleanDesc=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().replace(/^[A-Z0-9][A-Za-z0-9\-_.]{3,24}\s*\([^)]{3,30}\)\s*-{2,3}\s*/,'');
