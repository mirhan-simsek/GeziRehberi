const fs=require('fs');
global.window=undefined;
let src=fs.readFileSync('../src/core.js','utf8');
for(const f of ['ist','kon','cap','izm','ant','trb','mer','ada','more'])src+='\n'+fs.readFileSync(`../src/data/data_${f}.js`,'utf8');
src+='\nmodule.exports={CITIES,planTrip,hav,CATS};';
const m={exports:{}};new Function('module','exports','require',src)(m,m.exports,require);
const {CITIES,planTrip,hav,CATS}=m.exports;
let bad=0,tot=0;
for(const c of Object.keys(CITIES))for(const days of [2,4])for(let seed=1;seed<=6;seed++){
  let r;try{r=planTrip({city:c,days,interests:new Set(Object.keys(CATS)),date:new Date(2026,5,10),budget:3,who:'cift',tempo:'dolu',niche:true,seed});}catch(e){console.log(c,'ERR',e.message);continue;}
  for(const d of (r.days||r)){const s=(d.stops||[]).filter(x=>x.ll);let back=0,prev=0;for(const x of s){const dc=hav(CITIES[c].center,x.ll);if(dc<prev-8)back++;prev=dc;}tot++;if(back>1){bad++;if(bad<6)console.log(c,days,seed,s.map(x=>Math.round(hav(CITIES[c].center,x.ll))).join('>'));}}
}
console.log('günler',tot,'zigzag',bad);
