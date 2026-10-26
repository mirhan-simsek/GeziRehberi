// Kullanım: node check.js data_ist.js [diğer_dosyalar...]
// Veri dosyalarını doğrular ve şehir başına özet basar.
const fs = require("fs"), vm = require("vm"), path = require("path");
const core = fs.readFileSync(path.join(__dirname, "core.js"), "utf8");
const files = process.argv.slice(2);
if (!files.length) { console.log("Dosya adı verin"); process.exit(1); }
let code = core + "\n";
for (const f of files) code += "\n" + fs.readFileSync(f, "utf8") + "\n";
code += "\n;({D, CITIES, hav})";
let r;
try { r = vm.runInNewContext(code, {}, { filename: "bundle.js" }); }
catch (e) { console.log("HATA:", e.message); process.exit(2); }
const { D, CITIES, hav } = r;
const by = {};
for (const a of D) (by[a.city] = by[a.city] || []).push(a);
for (const c of Object.keys(by)) {
  const L = by[c], ctr = CITIES[c].center;
  const cnt = (f) => L.filter(f).length;
  console.log("== " + c + " (" + CITIES[c].name + "): " + L.length + " yer");
  console.log("   kahvaltı(b):", cnt(a => a.slots.includes("b")), " öğle(l):", cnt(a => a.slots.includes("l")), " akşam yemeği(d):", cnt(a => a.slots.includes("d")),
    " kahve/tatlı(t):", cnt(a => a.slots.includes("t")), " sabah(m):", cnt(a => a.slots.includes("m")), " öğleden sonra(a):", cnt(a => a.slots.includes("a")), " akşam gezisi(e):", cnt(a => a.slots.includes("e")));
  console.log("   maliyet 0/1/2/3:", [0, 1, 2, 3].map(k => cnt(a => a.cost === k)).join("/"), " niş:", cnt(a => a.niche), " etkinlik(mon):", cnt(a => a.mon),
    " mevsim i/y/s/k:", "iysk".split("").map(s => cnt(a => a.seasons.includes(s))).join("/"));
  console.log("   kategoriler:", Object.keys(r.D.length ? { tarih: 1, doga: 1, yemek: 1, sanat: 1, macera: 1, huzur: 1 } : {}).map(k => k + "=" + cnt(a => a.cats.includes(k))).join(" "));
  console.log("   kimle s/c/a/f:", "scaf".split("").map(w => cnt(a => a.who.includes(w))).join("/"));
  const noEat = L.filter(a => a.slots.some(s => "bld".includes(s)) && !a.eat);
  if (noEat.length) console.log("   UYARI 'eat' alanı eksik:", noEat.map(a => a.n || a.name).join(" | "));
  const far = L.filter(a => hav(ctr, a.ll) > 160);
  if (far.length) console.log("   UYARI merkezden 160 km'den uzak:", far.map(a => a.name + " " + Math.round(hav(ctr, a.ll)) + "km").join(" | "));
  const names = {}; for (const a of L) { names[a.name] = (names[a.name] || 0) + 1; }
  const dup = Object.keys(names).filter(n => names[n] > 1);
  if (dup.length) console.log("   UYARI tekrar eden ad:", dup.join(" | "));
  const ll = {}; for (const a of L) { const k = a.ll.join(","); (ll[k] = ll[k] || []).push(a.name); }
  const same = Object.values(ll).filter(v => v.length > 2);
  if (same.length) console.log("   UYARI aynı koordinatı paylaşan 3+ yer:", same.map(v => v.join(" / ")).join(" || "));
}
