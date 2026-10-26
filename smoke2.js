const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs');
const html='<!doctype html><html lang="tr"><head><meta charset="utf-8"></head><body>'+fs.readFileSync('../index.html','utf8')+'</body></html>';
const vc=new VirtualConsole();const errs=[];
vc.on('jsdomError',e=>errs.push(e.message));vc.on('error',e=>errs.push(String(e)));
const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:vc,url:'https://example.test/'});
const w=dom.window,d=w.document;
const fire=(sel)=>{const r=d.querySelector(sel);r.checked=true;r.dispatchEvent(new w.Event('change',{bubbles:true}));};
const stat=()=>({stops:d.querySelectorAll('.stop:not(.soft)').length,soft:d.querySelectorAll('.stop.soft').length,legs:d.querySelectorAll('.leg').length,maps:d.querySelectorAll('.mapbox svg').length,notice:!!d.querySelector('.notice')});
console.log('ilk',JSON.stringify(stat()),d.querySelector('.route-head h2').textContent);
for(const c of ['ist','kon','cap','izm','ant','trb','mer','ada']){
  for(const days of [1,3,5]){
    fire(`input[name=city][value=${c}]`);fire(`input[name=days][value="${days}"]`);fire('input[name=tempo][value=dolu]');
    console.log(c,days,'dolu',JSON.stringify(stat()));
  }
}
fire('input[name=budget][value="1"]');fire('input[name=tempo][value=rahat]');
console.log('ekonomik rahat',JSON.stringify(stat()));
console.log('NaN/undefined var mı:',/NaN|undefined/.test(d.querySelector('#route').innerHTML));
console.log('hata:',errs);
