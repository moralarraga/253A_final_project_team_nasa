// Hand-written mission questions. Matched on an item's title + keywords only (not the description) to avoid false matches.
// Team: add more as { re, question, right, wrong:[3 wrong answers], why } and fact-check each one.
const Q=[
 {re:/apollo 11/i,question:'Where did Apollo 11’s lunar module Eagle land?',right:'Sea of Tranquility',wrong:['Ocean of Storms','Sea of Serenity','Taurus-Littrow Valley'],why:'Eagle touched down in the Sea of Tranquility on July 20, 1969.'},
 {re:/apollo 8\b|earthrise/i,question:'What was Apollo 8 the first crewed mission to do?',right:'Orbit the Moon',wrong:['Land on the Moon','Dock with a space station','Walk in space'],why:'In December 1968, Apollo 8’s crew became the first humans to orbit the Moon.'},
 {re:/hubble/i,question:'Which space shuttle carried Hubble into orbit in 1990?',right:'Discovery',wrong:['Columbia','Atlantis','Endeavour'],why:'Hubble was launched aboard Space Shuttle Discovery in April 1990.'},
 {re:/\bsts-?1\b/i,question:'What made the STS-1 mission historic?',right:'It was the first orbital flight of the Space Shuttle',wrong:['It was the first crewed Moon landing','It was the first mission to the International Space Station','It was the first spacewalk'],why:'Columbia’s STS-1 flight in April 1981 opened the shuttle era.'},
 {re:/pathfinder|sojourner/i,question:'What was the name of the rover that came with Mars Pathfinder?',right:'Sojourner',wrong:['Spirit','Opportunity','Curiosity'],why:'Sojourner was NASA’s first Mars rover, landing with Pathfinder in 1997.'},
 {re:/curiosity rover|mars science laboratory|\bmsl\b/i,question:'In which crater did the Curiosity rover land?',right:'Gale Crater',wrong:['Jezero Crater','Gusev Crater','Eagle Crater'],why:'Curiosity landed in Gale Crater in August 2012.'},
 {re:/perseverance rover|jezero/i,question:'Which crater is the Perseverance rover exploring?',right:'Jezero Crater',wrong:['Gale Crater','Gusev Crater','Victoria Crater'],why:'Perseverance landed in Jezero Crater in February 2021.'},
 {re:/spirit rover/i,question:'In which crater did the rover Spirit land?',right:'Gusev Crater',wrong:['Gale Crater','Jezero Crater','Eagle Crater'],why:'Spirit landed in Gusev Crater on Mars in January 2004.'},
 {re:/james webb|jwst|webb telescope/i,question:'Which rocket launched the James Webb Space Telescope?',right:'Ariane 5',wrong:['Falcon 9','Atlas V','Delta IV'],why:'Webb launched on an Ariane 5 from French Guiana on December 25, 2021.'},
 {re:/viking 1\b/i,question:'What did Viking 1 become the first U.S. spacecraft to do?',right:'Land successfully on Mars',wrong:['Orbit Jupiter','Land on Venus','Fly past Pluto'],why:'Viking 1 landed on Mars on July 20, 1976 and sent back images from the surface.'},
 {re:/artemis (i|1)\b/i,question:'Which spacecraft did Artemis I send around the Moon?',right:'Orion',wrong:['Dragon','Starliner','Dream Chaser'],why:'Artemis I launched an uncrewed Orion spacecraft in November 2022.'}];
export const MISSION_QUESTIONS=Q;
export function missionQuiz(m,shuffle){
  const t=`${m.title||''} ${(m.keywords||[]).join(' ')}`,q=Q.find(x=>x.re.test(t));
  return q?{question:q.question,right:q.right,why:q.why,options:shuffle([q.right,...q.wrong])}:null;
}
