import test from 'node:test';import assert from 'node:assert/strict';
import {makeQuiz} from './quiz.js';import {CENTERS} from './centers.js';
const ok=q=>{assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(o=>o===q.right).length,1)};
test('center quiz: 4 unique options, exactly one correct, correct matches the data',()=>{
  for(let n=0;n<3000;n++){const code=Object.keys(CENTERS)[n%Object.keys(CENTERS).length],q=makeQuiz({center:code,date:'1990-04-24'});ok(q);assert.equal(q.right,CENTERS[code])}});
test('year quiz: right answer is the item year; distractors are unique and within 1958..now',()=>{
  for(let n=0;n<3000;n++){const y=n%2?1958+(n%69):[1958,2026][n%2],q=makeQuiz({center:'XYZ',date:`${y}-05-05`},2026);ok(q);assert.equal(q.right,String(y));
    q.options.forEach(o=>{assert.ok(+o>=1958&&+o<=2026,o)})}});
test('bad data returns null instead of a wrong question',()=>{
  for(const date of['','1900-01-01','2030-03-03','0000-01-01',undefined])assert.equal(makeQuiz({center:'XYZ',date},2026),null)});
test('correct answer position is evenly spread',()=>{
  const pos=[0,0,0,0];for(let n=0;n<4000;n++){const q=makeQuiz({center:'JPL',date:'2001-01-01'});pos[q.options.indexOf(q.right)]++}
  pos.forEach(p=>assert.ok(p>800&&p<1200,JSON.stringify(pos)));console.log('answer positions:',pos)});
