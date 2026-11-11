import test from 'node:test';import assert from 'node:assert/strict';
import {quality,rankKey,cleanDesc} from './rank.js';
const it=(title,o={})=>({title,keywords:[],desc:'',type:'image',...o});
test('posters, logos, patches, diagrams and lithographs rank below photos',()=>{
  for(const t of['Dawn Instrumentation Poster','Dawn Mission Vesta Logo','Dawn Mission Patch','Dawn Mission to Vesta and Ceres Lithograph','Vesta Science Orbits','Dawn Fields of View of Asteroid Vesta'])assert.ok(quality(it(t))<0,t);
  assert.ok(quality(it('Apollo 11 Mission image - Astronaut Edwin Aldrin poses beside the flag',{desc:'Astronaut on the lunar surface during the first landing mission.'}))>=2);
  assert.ok(quality(it('Dawn Spacecraft'))>=0);assert.ok(quality(it('Artist Rendition of Asteroid Vesta'))<0);
});
test('a nearby photo outranks an exact-day poster, but not a far-away one',()=>{
  const poster={dist:0,q:quality(it('Mission Patch'))},photo3={dist:3,q:quality(it('Astronaut on the Moon surface'))},photo20={dist:20,q:quality(it('Astronaut on the Moon surface'))};
  assert.ok(rankKey(photo3)<rankKey(poster));assert.ok(rankKey(poster)<rankKey(photo20));
});
test('cleanDesc removes catalog prefixes only',()=>{
  assert.equal(cleanDesc('AS11-40-5874 (20 July 1969) --- Astronaut Edwin E. Aldrin Jr. poses.'),'Astronaut Edwin E. Aldrin Jr. poses.');
  assert.equal(cleanDesc('<p>The Hubble   Space Telescope.</p>'),'The Hubble Space Telescope.');
  assert.equal(cleanDesc('Apollo 8 (1968) crew in orbit.'),'Apollo 8 (1968) crew in orbit.');
});
