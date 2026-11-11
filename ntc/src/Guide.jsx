import {motion} from 'framer-motion';
const steps=[
 ['Pick a date that matters','A birthday, an anniversary, any day. Add a keyword like Mars or Apollo if you want. “Take me to this exact day” uses the year you enter. “Surprise me” keeps the month and day and picks a random year.'],
 ['Travel back through time','The capsule warps through the years to the one we found. NASA’s archive can’t search by month and day, so we search the year and match the closest dates. If the exact day is quiet, we say so and show the nearest memories.'],
 ['Explore it, then keep it','Open any image to read its story, see who made it happen, and answer a quick question. Save your favorites to a capsule you can seal for your future self.']];
const feats=[
 ['🎂','My Cosmic Day','Enter the day you were born and see what NASA was photographing that year around that date. Download a shareable card to send to someone.'],
 ['📖','Story panel','Tap any image to see what it shows, which NASA center is credited, and topics to explore.'],
 ['🔭','Explore topics','Tap a topic chip and more images on that subject open right inside the panel.'],
 ['⏳','Then vs. Now','Drag a slider to compare Earth, Mars, or the Moon decades apart and see how our view has changed.'],
 ['⭐','Did you know?','Every image has a one-tap question. Right answers earn a star on your capsule.'],
 ['🔒','Time capsule','Save images, write a note to your future self, pick an unlock date, and seal it. Sign in with your email to open it on any device.']];
const know=[
 'NASA’s dates aren’t always exact. Some items are filed under January 1 by default, so results can be near your day rather than on it. We tell you when that happens.',
 'If NASA can’t be reached, we’ll offer an offline demo that uses illustrations instead of NASA photos.',
 'Sound is off by default. Use the speaker button at the top right for ambient piano that follows the motion.',
 'Your capsule saves on this device. Sign in with email to open it anywhere.'];
const reveal=i=>({initial:{opacity:0,y:36},whileInView:{opacity:1,y:0},viewport:{once:true,margin:'-60px'},transition:{delay:(i%3)*.08,type:'spring',stiffness:200,damping:24}});
export default function Guide(){
  const top=e=>e.currentTarget.closest('.view').scrollTo({top:0,behavior:'smooth'});
  return <div className="guide">
    <section id="how" className="gsec"><p className="eyebrow">How it works</p><h2>From a date to a keepsake in three steps</h2>
      <div className="steps">{steps.map((s,i)=><motion.div key={s[0]} className="glass gcard" {...reveal(i)}><span className="num">{i+1}</span><h3>{s[0]}</h3><p>{s[1]}</p></motion.div>)}</div></section>
    <section className="gsec"><p className="eyebrow">What you can do</p><h2>More than a photo search</h2>
      <div className="feats">{feats.map((f,i)=><motion.div key={f[1]} className="glass gcard" {...reveal(i)}><span className="ico" aria-hidden="true">{f[0]}</span><h3>{f[1]}</h3><p>{f[2]}</p></motion.div>)}</div></section>
    <section className="gsec"><p className="eyebrow">Good to know</p><h2>A few honest notes</h2>
      <ul className="know">{know.map((k,i)=><motion.li key={i} className="glass" {...reveal(i)}>{k}</motion.li>)}</ul></section>
    <section className="gsec cta"><h2>Ready? Pick a day that matters.</h2><button className="primary" onClick={top}>Start your journey ↑</button></section>
    <p className="credit">Images and videos come from the NASA Image and Video Library. This project is not affiliated with or endorsed by NASA.</p>
  </div>;
}
