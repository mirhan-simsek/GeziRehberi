/* Rota Defteri: çekirdek (şehirler, doğrulayıcı, rota motoru). Veri dosyaları bunun ardından P({...}) çağırır. */
const D = [];
const CATS = { tarih: "Tarih & Miras", doga: "Doğa & Manzara", yemek: "Lezzet", sanat: "Sanat & Kültür", macera: "Macera", huzur: "Huzur" };
const SEASONS = { i: "İlkbahar", y: "Yaz", s: "Sonbahar", k: "Kış" };
const WHO = { s: "Tek başına", c: "Çift", a: "Aile", f: "Arkadaşlar" };
const BUDGET = { 1: "Ekonomik", 2: "Dengeli", 3: "Rahat" };
const COST = ["Ücretsiz", "₺", "₺₺", "₺₺₺"];
const TEMPO = { rahat: "Rahat", dengeli: "Dengeli", dolu: "Dolu" };

/* b: kahvaltı, m: sabah gezisi, l: öğle yemeği, a: öğleden sonra, t: kahve/tatlı/çay molası, e: gün batımı ve akşam gezisi, d: akşam yemeği */
const SEQ = {
  rahat: ["b", "m", "l", "a", "d"],
  dengeli: ["b", "m", "m", "l", "a", "e", "d"],
  dolu: ["b", "m", "m", "l", "a", "a", "t", "e", "d"]
};
const TIMES = {
  rahat: ["09:00", "10:30", "13:00", "15:00", "19:30"],
  dengeli: ["08:30", "10:00", "11:45", "13:15", "15:00", "SUN", "20:00"],
  dolu: ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:10", "SUN", "20:15"]
};
const SUNSET = { i: "18:30", y: "19:30", s: "17:30", k: "16:45" };
const FALL = { e: ["a", "m"], a: ["m"], m: ["a"], l: ["d"], d: ["l"] };
const SLOTNAME = { b: "Kahvaltı", m: "Sabah", l: "Öğle yemeği", a: "Öğleden sonra", t: "Kahve arası", e: "Gün batımı", d: "Akşam yemeği" };

const CITIES = {
  ist: { name: "İstanbul", loc: "da", sub: "Boğaz, Sultanahmet, Kadıköy", center: [41.0082, 28.9784],
    tips: { i: "Lale ve çiçek mevsimi. Hava serin ve değişken, yanınıza ince bir ceket alın.",
      y: "Sıcak ve nemli. Açık hava gezilerini sabaha, müzeleri öğle sıcağına alın.",
      s: "Ilıman ve çoğunlukla açık. Yağmura karşı küçük bir şemsiye iyi olur.",
      k: "Soğuk, yağışlı ve rüzgârlı. Kapalı mekânlar ve sıcak çorba iyi gider." },
    transit: "İstanbulkart ile metro, tramvay, Marmaray ve vapur tek kartta. Sultanahmet, Karaköy ve Kabataş arası T1 tramvayla, iki yaka arası Marmaray ya da vapurla geçilir." },
  kon: { name: "Konya", loc: "da", sub: "Mevlana, Selçuklu, Sille", center: [37.8715, 32.4846],
    tips: { i: "Ilık ve zaman zaman yağışlı. Meram’da bağlar yeşilleniyor.",
      y: "Kuru ve sıcak. Öğle saatlerinde gölge arayın, açık hava işlerini sabaha alın.",
      s: "Gündüzler yumuşak, akşamlar serin. Gezmek için en rahat dönemlerden.",
      k: "Soğuk ve zaman zaman karlı. Aralık’taki Mevlana anma törenleri için erken rezervasyon yapın." },
    transit: "Merkezdeki tarihi duraklar yürünebilir mesafede, tramvay da var. Sille, Çatalhöyük ve Beyşehir için araç ya da taksi gerekir." },
  cap: { name: "Kapadokya", loc: "da", sub: "Göreme, Uçhisar, Ihlara", center: [38.6431, 34.8289],
    tips: { i: "Vadiler yeşil, hava serin. Balon ve yürüyüş için güzel dönem.",
      y: "Gündüz sıcak, sabah ve akşam serin. Yürüyüşleri sabaha alın.",
      s: "Işık yumuşak, renkler sıcak. Fotoğraf için çok uygun.",
      k: "Soğuk ve zaman zaman karlı. Kar altında peribacaları bambaşka görünür, kalın giyinin." },
    transit: "Köyler arası mesafe kısa ama toplu taşıma sınırlı. Araç kiralamak, rehberli tur ya da taksi en rahatı. Göreme, Uçhisar ve Ürgüp arasında dolmuş da çalışır." },
  izm: { name: "İzmir", loc: "de", sub: "Kordon, Urla, Efes", center: [38.4237, 27.1428],
    tips: { i: "Hava yumuşak, çiçekler açık. Deniz henüz serin.",
      y: "Sıcak ve kuru. Gün ortasında deniz ya da gölge, akşam sahil.",
      s: "Deniz hâlâ ılık, kalabalık azalmış. Zeytin hasadı dönemi.",
      k: "Ilıman ama yağışlı. Flamingolar ve sakin sahil köyleri için güzel." },
    transit: "Metro, İZBAN, tramvay ve vapurlar tek kartta. Karşıyaka ve Bostanlı için vapur en keyiflisi. Urla, Çeşme ve Efes için araç ya da otobüs gerekir." },
  ant: { name: "Antalya", loc: "da", sub: "Kaleiçi, Perge, Olympos", center: [36.8841, 30.7056],
    tips: { i: "Hava gezmeye çok rahat, deniz için biraz erken.",
      y: "Çok sıcak ve nemli. Antik kentleri sabah erken gezin.",
      s: "Deniz ılık, hava rahat. Gezi için çok uygun.",
      k: "Kıyıda ılık günler, yağış olabilir. Dağlarda kar, bahçelerde portakal." },
    transit: "Kaleiçi yürünerek gezilir, tramvay (Antray) ve otobüsler merkezi bağlar. Perge, Aspendos, Side ve Olympos için araç ya da rehberli tur gerekir." },
  trb: { name: "Trabzon", loc: "da", sub: "Sümela, Uzungöl, yaylalar", center: [41.0027, 39.7168],
    tips: { i: "Sık yağmur ve sis. Yağmurluk şart, doğa yeşil doruğunda.",
      y: "Yaylalar için en iyi dönem. Yağmur yine de olası.",
      s: "Hamsi mevsimi başlıyor, yağışlar artıyor.",
      k: "Soğuk ve yağışlı, yaylalar karlı. Yol durumunu kontrol edin." },
    transit: "Merkez yürünerek gezilir. Sümela, Uzungöl ve yaylalar için araç kiralayın ya da rehberli tur alın. Kıyı hattında minibüsler sık çalışır." },
  mer: { name: "Mersin", loc: "de", sub: "Kızkalesi, Tarsus, Silifke", center: [36.8121, 34.6415],
    tips: { i: "Hava ılık ve nemli, çiçekler açık. Deniz yüzmek için henüz serin.",
      y: "Çok sıcak ve nemli. Antik kentleri sabah, denizi öğleden sonra planlayın.",
      s: "Deniz hâlâ ılık, sıcaklar yumuşuyor. Gezi için rahat bir dönem.",
      k: "Ilıman ve hafif yağışlı. Kıyı yürüyüşü ve narenciye mevsimi." },
    transit: "Merkez, sahil boyunca yürünebilir. Tarsus ve Erdemli için minibüs ve otobüs var. Kızkalesi, Silifke, Uzuncaburç ve Anamur için araç ya da şehirlerarası otobüs gerekir." },
  ada: { name: "Adana", loc: "da", sub: "Taşköprü, Seyhan, Kebap", center: [36.9914, 35.3308],
    tips: { i: "Sıcaklar başlıyor ama hâlâ rahat. Narenciye ve bahar çiçekleri.",
      y: "Çok sıcak ve kuru. Açık hava gezilerini sabaha ve akşama alın, öğleyi kapalı mekânda geçirin.",
      s: "Sıcaklar yumuşuyor. Açık hava gezileri için en rahat dönemlerden.",
      k: "Ilıman ve zaman zaman yağışlı. Kebap, şalgam ve müze mevsimi." },
    transit: "Metro ve belediye otobüsleri merkezi bağlar. Taşköprü, Saat Kulesi ve çarşı yürünebilir. Karatepe, Anavarza ve Kozan için araç gerekir." }
};

/* Doğrulayıcı: eksik ya da hatalı alan varsa hata fırlatır */
function P(o) {
  const need = ["c", "n", "cat", "s", "d", "k", "se", "w", "ar", "nh", "note", "ll"];
  for (const f of need) if (o[f] === undefined || o[f] === null || o[f] === "") throw new Error("Eksik alan '" + f + "': " + (o.n || JSON.stringify(o).slice(0, 80)));
  if (!CITIES[o.c]) throw new Error("Bilinmeyen şehir: " + o.c);
  const cats = o.cat.split(","); for (const c of cats) if (!CATS[c]) throw new Error("Bilinmeyen kategori '" + c + "': " + o.n);
  for (const x of o.s.split("")) if (!"bmlatde".includes(x)) throw new Error("Bilinmeyen slot '" + x + "': " + o.n);
  for (const x of o.se.split("")) if (!"iysk".includes(x)) throw new Error("Bilinmeyen mevsim '" + x + "': " + o.n);
  for (const x of o.w.split("")) if (!"scaf".includes(x)) throw new Error("Bilinmeyen kimle kodu '" + x + "': " + o.n);
  if (![0, 1, 2, 3].includes(o.k)) throw new Error("Maliyet 0-3 olmalı: " + o.n);
  if (typeof o.d !== "number" || o.d <= 0) throw new Error("Süre sayı olmalı: " + o.n);
  if (!Array.isArray(o.ll) || o.ll.length !== 2 || o.ll.some(v => typeof v !== "number")) throw new Error("ll [enlem, boylam] olmalı: " + o.n);
  if (o.ll[0] < 35.5 || o.ll[0] > 42.3 || o.ll[1] < 25.5 || o.ll[1] > 45) throw new Error("Koordinat Türkiye dışında: " + o.n);
  const food = o.s.split("").some(x => "bld".includes(x));
  if (food && !cats.includes("yemek")) throw new Error("b/l/d slotlu yer 'yemek' kategorisinde olmalı: " + o.n);
  D.push({ id: D.length, city: o.c, name: o.n, cats, slots: o.s.split(""), dur: o.d, cost: o.k, seasons: o.se.split(""),
    who: o.w.split(""), area: o.ar, niche: !!o.nh, note: o.note, eat: o.eat || "", ll: o.ll, ap: !!o.ap, mon: o.mon || null, t: o.t || null });
}

function hav(a, b) {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}
/* iki durak arası tahmini yol: kuş uçuşu mesafeden */
function leg(a, b) {
  const d = hav(a, b);
  const road = d * (d > 30 ? 1.25 : 1.3);
  let mode, min;
  if (road < 1.3) { mode = "yürüyerek"; min = road / 4.8 * 60; }
  else if (road < 7) { mode = "toplu taşıma ya da taksi"; min = road / 18 * 60 + 5; }
  else { mode = "araçla"; min = road / (road < 25 ? 28 : 65) * 60 + 5; }
  return { km: road, min: Math.max(1, Math.round(min / 5) * 5 || 5), mode };
}

/* p noktasının A-B doğru parçasına km cinsinden uzaklığı (yerel düzlem yaklaşımı) */
function segKm(p, A, B) {
  const k = Math.cos(A[0] * Math.PI / 180), r = 111.19;
  const px = (p[1] - A[1]) * k * r, py = (p[0] - A[0]) * r, bx = (B[1] - A[1]) * k * r, by = (B[0] - A[0]) * r;
  const L = bx * bx + by * by;
  const t = L ? Math.max(0, Math.min(1, (px * bx + py * by) / L)) : 0;
  return Math.hypot(px - t * bx, py - t * by);
}
function seasonOf(m) { return m >= 3 && m <= 5 ? "i" : m >= 6 && m <= 8 ? "y" : m >= 9 && m <= 11 ? "s" : "k"; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* o: {city, days, tempo, interests:Set, date:Date, budget, who, niche, seed} */
function planTrip(o) {
  const rng = mulberry32(o.seed);
  const city = CITIES[o.city];
  const months = new Set();
  for (let i = 0; i < o.days; i++) { const d = new Date(o.date); d.setDate(d.getDate() + i); months.add(d.getMonth() + 1); }
  const season = seasonOf(o.date.getMonth() + 1);
  const pool = D.filter(a => a.city === o.city && a.seasons.includes(season) && a.cost <= o.budget &&
    a.who.includes(o.who) && (!a.mon || a.mon.some(m => months.has(m))));
  const seq = SEQ[o.tempo] || SEQ.dengeli;
  const times = (TIMES[o.tempo] || TIMES.dengeli).map(t => t === "SUN" ? SUNSET[season] : t);
  const used = new Set();
  const maxFar = Math.max(1, Math.floor(o.days / 2));
  let farDays = 0, gaps = 0;
  const isFar = a => hav(city.center, a.ll) > 28;
  const mealSlot = s => s === "b" || s === "l" || s === "d";
  const base = (a, slot) => {
    let s = 0;
    if (mealSlot(slot)) {
      if (a.niche) s += o.niche ? 1.8 : 0.3;
      if (a.cost === o.budget) s += 0.6;
    } else {
      const m = a.cats.filter(c => o.interests.has(c)).length;
      s += o.interests.size ? m * 3 : 1;
      if (a.niche) s += o.niche ? 2.2 : 0.3;
      if (a.cost === o.budget) s += 0.4;
      if (slot === "t") s += a.cats.includes("yemek") ? 1.5 : 0;
    }
    if (a.mon) s += 4;
    return s + rng() * 1.4;
  };
  const days = [];
  for (let d = 0; d < o.days; d++) {
    const farOK = farDays < maxFar;
    let anchor = null, bs = -1e9;
    for (const a of pool) {
      if (used.has(a.id) || !(a.slots.includes("m") || a.slots.includes("a"))) continue;
      if (!a.cats.some(c => c !== "yemek")) continue;
      if (!farOK && isFar(a)) continue;
      const s = base(a, a.slots.includes("m") ? "m" : "a");
      if (s > bs) { bs = s; anchor = a; }
    }
    const dayFar = !!anchor && isFar(anchor);
    if (dayFar) farDays++;
    /* Gün şehir merkezinden (otel) başlar. Durak sırası merkezden anchor yönüne doğru tek yönlü ilerler:
       önce yakın yerler, sonra uzaklar. Aksi yöndeki yerler cezalanır, böylece gün gidip gelmez. */
    let prev = city.center, curD = 0;
    const anchorD = anchor ? hav(city.center, anchor.ll) : 0;
    const corridor = anchorD > 6;
    let anchorIdx = -1;
    if (anchor) {
      if (anchor.dur >= 3.5 && seq.indexOf("m") >= 0) anchorIdx = seq.indexOf("m");
      else if (seq.lastIndexOf("a") >= 0 && anchor.slots.includes("a")) anchorIdx = seq.lastIndexOf("a");
      else anchorIdx = Math.max(seq.lastIndexOf("m"), 0);
    }
    const stops = [];
    let dropM = false, dropA = false;
    for (let si = 0; si < seq.length; si++) {
      const slot = seq[si];
      if (slot === "m" && dropM) { dropM = false; continue; }
      if (slot === "a" && dropA) { dropA = false; stops.push({ rest: true, slot, time: times[si] }); continue; }
      let pick = null, ps = -1e9;
      const tryPick = (want) => {
        for (const a of pool) {
          if (used.has(a.id) || !a.slots.includes(want)) continue;
          const far = isFar(a);
          if (far && !dayFar && !farOK) continue;
          const isAnchor = anchor && a.id === anchor.id;
          if (isAnchor && si < anchorIdx) continue;
          let s = base(a, slot);
          const dist = hav(prev, a.ll);
          const dC = hav(city.center, a.ll);
          if (dist < 1.2) s += 1.2;
          s -= Math.min(dist, 40) * 0.5;
          s -= Math.min(Math.max(0, curD - dC), 8) * 0.9;
          if (corridor) s -= Math.min(segKm(a.ll, city.center, anchor.ll), 40) * 0.4;
          if (isAnchor && si === anchorIdx) s += 6;
          if (want !== slot) s -= 2;
          if (s > ps) { ps = s; pick = a; }
        }
      };
      tryPick(slot);
      if (!pick) for (const alt of (FALL[slot] || [])) { tryPick(alt); if (pick) break; }
      if (!pick) {
        if (slot === "t") continue;
        gaps++; stops.push({ generic: true, slot, time: times[si] }); continue;
      }
      used.add(pick.id);
      prev = pick.ll;
      curD = hav(city.center, pick.ll);
      if (slot === "m" && pick.dur >= 4) { if (seq.slice(si + 1).includes("m")) dropM = true; else dropA = true; }
      stops.push(Object.assign({ slot, time: pick.t || times[si] }, pick));
    }
    /* Saatler sıra bozulmadan artsın. Gün doğumu etkinliği (balon) en başa gider. */
    const sunrise = stops.filter(s => s.time === "Gün doğumu");
    const rest = stops.filter(s => s.time !== "Gün doğumu");
    let last = -1;
    for (const s of rest) {
      const mm = /^(\d\d):(\d\d)$/.exec(s.time);
      if (!mm) continue;
      let m = +mm[1] * 60 + +mm[2];
      if (m <= last) { m = last + 45; s.time = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
      last = m;
    }
    stops.length = 0; stops.push(...sunrise, ...rest);
    days.push({ index: d, area: anchor ? anchor.area : "", far: dayFar, stops });
  }
  return { season, days, gaps, poolSize: pool.length };
}

if (typeof module !== "undefined") module.exports = { D, CITIES, planTrip, hav, leg, CATS, SLOTNAME };
