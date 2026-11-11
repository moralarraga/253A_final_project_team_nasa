import {MONTHS,fmt} from './nasa.js';
export async function shareCard(res,o){
  const m=res.items[0],W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b1230');g.addColorStop(1,'#04060d');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<180;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.8})`;x.fillRect(Math.random()*W,Math.random()*H,2,2)}
  // Only draw the image if the browser allows it (CORS); otherwise the card is text-only.
  const src=m.thumb.replace('https://images-assets.nasa.gov/','/nasa-img/'); // same-origin proxy, so the canvas isn't blocked
  const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
  x.textAlign='center';x.fillStyle='#7cf0ff';x.font='600 30px system-ui';x.fillText('NASA TIME CAPSULE',W/2,100);
  x.fillStyle='#eef3ff';x.font='700 64px system-ui';x.fillText(o.fixed?'The day I was born,':`On ${MONTHS[o.m-1]} ${o.d}, ${res.year},`,W/2,200);x.fillText('NASA was looking at this.',W/2,280);
  if(img){const bx=90,by=340,bw=900,bh=720,s=Math.max(bw/img.width,bh/img.height);x.save();x.beginPath();x.roundRect?x.roundRect(bx,by,bw,bh,36):x.rect(bx,by,bw,bh);x.clip();x.drawImage(img,bx+(bw-img.width*s)/2,by+(bh-img.height*s)/2,img.width*s,img.height*s);x.restore()}
  if(!img){const pg=x.createRadialGradient(440,620,40,540,700,300);pg.addColorStop(0,'#7cf0ff');pg.addColorStop(1,'#0b1230');x.fillStyle=pg;x.beginPath();x.arc(540,700,260,0,7);x.fill()} // no image: draw a planet instead of an empty gap
  x.fillStyle='#ffb86b';x.font='700 54px system-ui';x.fillText(fmt(m.date),W/2,1150);x.fillStyle='#cfd8f0';x.font='400 32px system-ui';x.fillText(m.title.slice(0,60),W/2,1210);
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='my-cosmic-day.png';a.click()});
}
