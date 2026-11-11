import test from 'node:test';import assert from 'node:assert/strict';
import {MISSION_QUESTIONS,missionQuiz} from '../data/missionQuiz.js';import {makeQuiz} from './quiz.js';
const sh=a=>[...a];
test('every mission question is well formed',()=>{for(const q of MISSION_QUESTIONS){assert.equal(q.wrong.length,3);assert.equal(new Set([q.right,...q.wrong]).size,4);assert.ok(!q.wrong.includes(q.right));assert.ok(q.why.length>10)}});
test('matches the right mission, and only on title/keywords',()=>{
  const t=(title,keywords=[],desc='')=>missionQuiz({title,keywords,desc},sh)?.right;
  assert.equal(t('Apollo 11 Mission image - Astronaut Edwin Aldrin poses beside the flag'),'Sea of Tranquility');
  assert.equal(t('Lunar surface',['APOLLO 11 FLIGHT']),'Sea of Tranquility');
  assert.equal(t('Hubble Views a Galaxy'),'Discovery');assert.equal(t('Curiosity Rover Self-Portrait'),'Gale Crater');
  assert.equal(t('Mars Pathfinder Lander'),'Sojourner');assert.equal(t('STS-1 Launch'),'It was the first orbital flight of the Space Shuttle');
  assert.equal(t('Space Shuttle Columbia on the pad'),undefined); // Columbia alone must not trigger the STS-1 question
  assert.equal(t('Crater photo',[],'Compared with Apollo 11 and Hubble'),undefined); // description mentions are ignored
});
test('makeQuiz prefers a mission question and always has 4 unique options with one correct',()=>{
  for(let n=0;n<500;n++){const q=makeQuiz({title:'Webb Telescope mirror',keywords:[],center:'GSFC',date:'2021-12-25'});assert.equal(q.right,'Ariane 5');assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes('Ariane 5'))}
  assert.ok(makeQuiz({title:'Dawn Spacecraft',keywords:[],center:'JPL',date:'2007-01-01'}).question.includes('NASA center'));
});
