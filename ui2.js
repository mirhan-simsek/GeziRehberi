(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KEY = "rota-defteri-v2";
  const z = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  const todayISO = iso(new Date());
  const parse = (s) => new Date(s + "T12:00:00");
  const num = (n, d) => n.toFixed(d).replace(".", ",");

  let st = { city: "ist", days: 2, tempo: "dengeli", interests: ["tarih", "yemek"], date: todayISO, budget: 2, who: "c", niche: true, seed: 1 };
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || "null");
    if (r && CITIES[r.city]) { st = Object.assign(st, r); if (!st.date || st.date < todayISO) st.date = todayISO; }
  } catch (e) {}

  $("#f-city").innerHTML = Object.entries(CITIES).map(([k, c]) =>
    `<label class="city"><input type="radio" name="city" value="${k}"><span class="sign brown"><strong>${c.name}</strong><small>${c.sub}</small></span></label>`).join("");
  const seg = (id, name, obj) => { $(id).innerHTML = Object.entries(obj).map(([k, v]) => `<label><input type="radio" name="${name}" value="${k}"><span>${v}</span></label>`).join(""); };
  $("#f-days").innerHTML = [1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="days" value="${n}"><span>${n}</span></label>`).join("");
  seg("#f-tempo", "tempo", TEMPO);
  seg("#f-budget", "budget", BUDGET);
  seg("#f-who", "who", WHO);
  $("#f-interests").innerHTML = Object.entries(CATS).map(([k, v]) => `<label class="chip"><input type="checkbox" name="interest" value="${k}"><span>${v}</span></label>`).join("");
  const dateIn = $("#date");
  dateIn.min = todayISO;
  const maxD = new Date(); maxD.setFullYear(maxD.getFullYear() + 1); dateIn.max = iso(maxD);
  const form = $("#form");

  function writeForm() {
    form.elements["city"].value = st.city;
    form.elements["days"].value = String(st.days);
    form.elements["tempo"].value = st.tempo;
    form.elements["budget"].value = String(st.budget);
    form.elements["who"].value = st.who;
    dateIn.value = st.date;
    $("#niche").checked = !!st.niche;
    form.querySelectorAll('input[name="interest"]').forEach((i) => { i.checked = st.interests.includes(i.value); });
  }
  function readForm() {
    const fd = new FormData(form);
    return { city: fd.get("city"), days: +fd.get("days"), tempo: fd.get("tempo"), interests: fd.getAll("interest"), date: fd.get("date") || todayISO,
      budget: +fd.get("budget"), who: fd.get("who"), niche: $("#niche").checked };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  const fmt = (d, o) => d.toLocaleDateString("tr-TR", o);
  const durText = (h) => (h < 1 ? "1 saatten kısa" : (h % 1 ? String(h).replace(".", ",") : h) + " saat");
  const kmText = (km) => km < 1 ? Math.round(km * 10) * 100 / 10 + " m" : num(km, km < 10 ? 1 : 0) + " km";
  const minText = (m) => m >= 60 ? Math.floor(m / 60) + " sa " + (m % 60 ? (m % 60) + " dk" : "") : m + " dk";
  const legText = (l) => kmText(l.km) + " · " + minText(l.min) + " · " + l.mode;

  /* gün haritası: ızgara, yol, numaralı pinler, mesafe etiketleri, ölçek ve kuzey oku */
  const NARROW = window.matchMedia ? window.matchMedia("(max-width: 560px)") : { matches: false };
  function buildMap(pts, narrow) {
    const W = narrow ? 420 : 800, H = narrow ? 520 : 420, pl = narrow ? 44 : 70, pr = narrow ? 44 : 70, pt = 46, pb = 62;
    const maxName = narrow ? 20 : 26;
    const lats = pts.map((p) => p.ll[0]), lons = pts.map((p) => p.ll[1]);
    const latMin = Math.min(...lats), latMax = Math.max(...lats), lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    const cos = Math.cos(((latMin + latMax) / 2) * Math.PI / 180);
    const dxR = Math.max((lonMax - lonMin) * cos, 0.012), dyR = Math.max(latMax - latMin, 0.012);
    const uw = W - pl - pr, uh = H - pt - pb;
    const sc = Math.min(uw / dxR, uh / dyR);
    const ox = pl + (uw - (lonMax - lonMin) * cos * sc) / 2, oy = pt + (uh - (latMax - latMin) * sc) / 2;
    const P = pts.map((p) => ({ x: ox + (p.ll[1] - lonMin) * cos * sc, y: oy + (latMax - p.ll[0]) * sc, p }));
    for (let i = 0; i < P.length; i++) for (let j = 0; j < i; j++) {
      if (Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) < 17) { const a = i * 1.9; P[i].x += Math.cos(a) * 17; P[i].y += Math.sin(a) * 17; }
    }
    let g = "";
    for (let x = 0; x <= W; x += 50) g += `<line class="m-grid" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
    for (let y = 0; y <= H; y += 50) g += `<line class="m-grid" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    const path = P.map((q, i) => (i ? "L" : "M") + q.x.toFixed(1) + " " + q.y.toFixed(1)).join(" ");
    let dist = "";
    for (let i = 1; i < P.length; i++) {
      const l = leg(P[i - 1].p.ll, P[i].p.ll);
      const mx = (P[i - 1].x + P[i].x) / 2, my = (P[i - 1].y + P[i].y) / 2;
      if (Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y) > 60) dist += `<text class="m-dist" x="${mx.toFixed(1)}" y="${(my - 10).toFixed(1)}">${kmText(l.km)}</text>`;
    }
    const pins = P.map((q, i) => {
      const right = q.x > W * 0.62;
      const tx = q.x + (right ? -22 : 22), ty = q.y + (i % 2 ? 22 : -10);
      const name = q.p.name.length > maxName ? q.p.name.slice(0, maxName - 1) + "…" : q.p.name;
      return `<g class="mp" data-t="${q.p.sid}"><circle class="m-pin" cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="14"/><text class="m-num" x="${q.x.toFixed(1)}" y="${q.y.toFixed(1)}">${i + 1}</text>` +
        `<text class="m-lbl" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${right ? "end" : "start"}">${esc(name)}</text></g>`;
    }).join("");
    const kmPerPx = 111.19 / sc;
    let bar = 0.5; for (const b of [0.5, 1, 2, 5, 10, 20, 50, 100, 200]) { if (b / kmPerPx <= (narrow ? 110 : 150)) bar = b; }
    const bw = bar / kmPerPx, bx = 26, by = H - 24;
    const scale = `<path class="m-scale" d="M${bx} ${by - 6} V${by} H${bx + bw} V${by - 6}"/><text class="m-sc-t" x="${bx}" y="${by - 12}">${bar < 1 ? bar * 1000 + " m" : bar + " km"}</text>`;
    const north = `<g transform="translate(${W - 34} 34)"><path class="m-na" d="M0 -16 L7 6 L0 2 L-7 6 Z"/><text class="m-n" y="22">K</text></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Günün rota haritası">${g}<path class="m-road" d="${path}"/><path class="m-line" d="${path}"/>${dist}${pins}${scale}${north}</svg>`;
  }

  let lastText = "";
  function render() {
    save();
    const city = CITIES[st.city];
    const start = parse(st.date);
    const plan = planTrip({ city: st.city, days: st.days, tempo: st.tempo, interests: new Set(st.interests), date: start, budget: st.budget, who: st.who, niche: st.niche, seed: st.seed });
    const end = new Date(start); end.setDate(end.getDate() + st.days - 1);
    const range = st.days === 1 ? fmt(start, { day: "numeric", month: "long" })
      : start.getMonth() === end.getMonth() ? start.getDate() + "–" + fmt(end, { day: "numeric", month: "long" })
      : fmt(start, { day: "numeric", month: "long" }) + " – " + fmt(end, { day: "numeric", month: "long" });

    let html = `<header class="route-head">
      <div class="sign blue"><span class="kicker">Rota hazır · ${range}</span><h2>${city.name} · ${st.days} gün</h2></div>
      <ul class="facts"><li>${SEASONS[plan.season]}</li><li>${WHO[st.who]}</li><li>${BUDGET[st.budget]} bütçe</li><li>${TEMPO[st.tempo]} tempo</li>${
        st.interests.length ? `<li>${st.interests.map((k) => CATS[k]).join(" · ")}</li>` : ""}</ul>
      <p class="tip"><b>${SEASONS[plan.season]} notu.</b> ${esc(city.tips[plan.season])}</p>
      <p class="transit"><b>Şehir içi ulaşım.</b> ${esc(city.transit)}</p>
      ${plan.gaps ? `<p class="notice">Seçtiğin filtrelerle ${plan.gaps} zaman aralığı boş kaldı. Bütçeyi artırırsan, ilgi alanlarını azaltırsan ya da gün sayısını düşürürsen rota daha dolu çıkar.</p>` : ""}
    </header>`;

    const lines = [`Rota Defteri · ${city.name} · ${st.days} gün (${range})`, ""];
    plan.days.forEach((day, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const dateStr = fmt(d, { day: "numeric", month: "long", weekday: "long" });
      const title = day.area || "Serbest gün";
      const real = day.stops.filter((s) => !s.generic && !s.rest);
      real.forEach((s, k) => { s.sid = "s" + i + "-" + k; });
      const first = real[0];
      const farKm = day.far && first ? hav(city.center, first.ll) : 0;
      html += `<article class="day"><div class="day-head"><div class="sign green"><span class="day-no">Gün ${i + 1}</span><h3>${esc(title)}</h3></div>${
        day.far ? `<span class="far-tag">Şehir dışı · merkezden ~${Math.round(farKm)} km</span>` : ""}<span class="day-date">${dateStr}</span></div>`;
      if (real.length) html += `<div class="mapbox">${buildMap(real, NARROW.matches)}<p class="cap">Şematik rota haritası. Pinlere dokunursan ilgili durak kartına gidersin.</p></div>`;
      html += `<ol class="stops">`;
      lines.push(`GÜN ${i + 1} · ${title} · ${dateStr}`);
      let n = 0, prev = null;
      day.stops.forEach((s) => {
        if (s.generic || s.rest) {
          const txt = s.rest ? "Sabahki gezi yarım günden uzun sürdü. Öğleden sonrayı dinlenmeye ya da çevreyi keşfetmeye ayırın." : "Bu saat için seçtiğin filtrelere uygun yeni bir öneri kalmadı. Kendi keşfine bırak.";
          const ttl = s.rest ? "Dinlenme ve serbest zaman" : "Serbest zaman";
          html += `<li class="stop soft"><span class="pin">–</span><div class="card"><div class="card-top"><span class="time">${s.time}</span><span class="slot">${SLOTNAME[s.slot]}</span></div><h4>${ttl}</h4><p class="note">${txt}</p></div></li>`;
          lines.push(`  ${s.time}  ${ttl}`);
          return;
        }
        n++;
        if (prev) {
          const l = leg(prev.ll, s.ll);
          html += `<li class="leg"><span></span><span class="leg-chip${l.km > 20 ? " far" : ""}">${legText(l)}</span></li>`;
          lines.push(`      ↓ ${legText(l)}`);
        }
        const tags = s.cats.map((c) => `<span class="tag">${CATS[c]}</span>`).join("");
        const badges = (s.niche ? `<span class="badge niche">Az bilinen</span>` : "") + (s.mon ? `<span class="badge event">Bu tarihe özel</span>` : "") + (s.ap ? `<span class="badge ap">konum yaklaşık</span>` : "");
        html += `<li class="stop" id="${s.sid}"><span class="pin">${n}</span><div class="card">
          <div class="card-top"><span class="time">${s.time}</span><span class="slot">${SLOTNAME[s.slot]}</span></div>
          <h4>${esc(s.name)}</h4><p class="where">${esc(s.area)}</p>
          <div class="meta">${tags}<span class="dur">${durText(s.dur)}</span><span>${COST[s.cost]}</span>${badges}</div>
          ${s.eat ? `<p class="eat"><b>Menüden</b><span>${esc(s.eat)}</span></p>` : ""}
          <p class="note">${esc(s.note)}</p>
          ${INFO[s.name] ? `<details class="hist"><summary>Tarihçe ve ipuçları</summary><p>${esc(INFO[s.name])}</p>${TIPS[s.name] ? `<p class="tip"><b>Gezme ipucu</b>${esc(TIPS[s.name])}</p>` : ""}</details>` : ""}</div></li>`;
        lines.push(`  ${s.time}  ${n}. ${s.name} (${s.area}; ${durText(s.dur)}, ${COST[s.cost]})`);
        if (s.eat) lines.push(`         Menüden: ${s.eat}`);
        lines.push(`         ${s.note}`);
        prev = s;
      });
      html += `</ol></article>`;
      lines.push("");
    });
    lines.push("Saatler ve ücretler değişebilir, gitmeden önce kontrol edin.");
    lastText = lines.join("\n");
    $("#route").innerHTML = html;
  }

  $("#route").addEventListener("click", (e) => {
    const g = e.target.closest(".mp");
    if (!g) return;
    const el = document.getElementById(g.getAttribute("data-t"));
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1600);
  });
  form.addEventListener("change", () => { st = Object.assign(st, readForm()); $("#copyBox").hidden = true; render(); });
  $("#shuffle").addEventListener("click", () => { st.seed += 1; $("#copyBox").hidden = true; setMsg("Rota yenilendi."); render(); });
  $("#copy").addEventListener("click", () => {
    const box = $("#copyBox");
    const fallback = () => { box.value = lastText; box.hidden = false; box.focus(); box.select(); setMsg("Metin aşağıda seçili. Kopyalamak için Ctrl+C ya da uzun basın."); };
    try { navigator.clipboard.writeText(lastText).then(() => { box.hidden = true; setMsg("Rota metni kopyalandı."); }, fallback); } catch (e) { fallback(); }
  });
  let mt;
  function setMsg(t) { const m = $("#msg"); m.textContent = t; clearTimeout(mt); mt = setTimeout(() => { m.textContent = ""; }, 4000); }

  if (NARROW.addEventListener) NARROW.addEventListener("change", render);
  writeForm();
  render();
})();
