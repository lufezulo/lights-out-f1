/* =========================================================
   Lights Out · F1 — datos: f1db (github.com/f1db/f1db) + base de datos de la página
   ========================================================= */
let DATA=null, TRACKS={}, LIVE=null;
let YEAR=null, CUR_YEAR=null;
const H=36e5, D=864e5;
const $=s=>document.querySelector(s);
const BACK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg>';
const ICON={"casco": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 15.2C4 9.3 8.2 5 13.4 5 17.6 5 20.5 8 20.5 12.2v2.6a2 2 0 0 1-2 2h-5.6l-1.4 1.8a1.5 1.5 0 0 1-1.2.6H6.6A2.6 2.6 0 0 1 4 16.6z\"/><path d=\"M11.8 10.2h8.5M11.8 10.2c-.4 1.4-.2 2.7.6 3.9h8\"/></svg>", "bandera": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5.5 20.5V4\"/><rect x=\"5.5\" y=\"4.5\" width=\"13.5\" height=\"9\" rx=\"2\"/><path d=\"M7.5 4.5h2.5V9H5.5V6.5a2 2 0 0 1 2-2zM14.5 4.5H17a2 2 0 0 1 2 2V9h-4.5zM10 9h4.5v4.5H10z\" fill=\"currentColor\" stroke=\"none\"/></svg>", "volante": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 9.5C4 7 5.8 5.5 8 5.5h8c2.2 0 4 1.5 4 4v2.2c0 3.8-3 6.8-6.8 6.8h-2.4C7 18.5 4 15.5 4 11.7z\"/><rect x=\"9\" y=\"8.5\" width=\"6\" height=\"4\" rx=\"1.5\"/><path d=\"M10.5 15.5h3\"/><circle cx=\"6.9\" cy=\"10.6\" r=\".8\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"17.1\" cy=\"10.6\" r=\".8\" fill=\"currentColor\" stroke=\"none\"/></svg>", "trofeo": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8 4.5h8v4.2a4 4 0 0 1-8 0z\"/><path d=\"M8 6H6.2a1.2 1.2 0 0 0-1.2 1.2c0 1.8 1.3 3.2 3.2 3.3M16 6h1.8A1.2 1.2 0 0 1 19 7.2c0 1.8-1.3 3.2-3.2 3.3\"/><path d=\"M12 12.7v3.3M9 19.5h6M10 16h4v3.5h-4z\"/></svg>", "llanta": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><circle cx=\"12\" cy=\"12\" r=\"4.6\"/><path d=\"M12.00 10.80L12.00 7.40\"/><path d=\"M13.14 11.63L16.37 10.58\"/><path d=\"M12.71 12.97L14.70 15.72\"/><path d=\"M11.29 12.97L9.30 15.72\"/><path d=\"M10.86 11.63L7.63 10.58\"/></svg>", "volver": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M14.5 6 8.5 12l6 6\"/></svg>"};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const flag=cc=>cc&&cc.length===2?String.fromCodePoint(...[...cc.toUpperCase()].map(c=>127397+c.charCodeAt(0))):"🏁";
const drv=id=>DATA.drivers[id]||{n:id,c:(id||"").slice(0,3).toUpperCase()};
const con=id=>DATA.cons[id]||{n:id,col:"#999"};
const col=id=>con(id).col;
const last=n=>{const p=String(n).split(" ");return p.length>1?p.slice(1).join(" "):n};
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const DIA=["dom","lun","mar","mié","jue","vie","sáb"];
const DIAL=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const hm=d=>`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
const fday=d=>LANG==="en"?d.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}):`${DIA[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`;
const fdayl=d=>LANG==="en"?d.toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric"}):`${DIAL[d.getDay()]} ${d.getDate()} de ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][d.getMonth()]}`;
const TZ=(()=>{try{const z=Intl.DateTimeFormat().resolvedOptions().timeZone||"";const part=new Intl.DateTimeFormat("es",{timeZoneName:"short"}).formatToParts(new Date()).find(x=>x.type==="timeZoneName");return {city:z.split("/").pop().replace(/_/g," "),short:part?part.value:""}}catch(e){return {city:"",short:""}}})();
const lst=a=>{try{return new Intl.ListFormat(LOC(),{type:"conjunction"}).format(a)}catch(e){return a.join(", ")}};
const tzLabel=()=>LANG==="en"?`${TZ.city?TZ.city+" time":"your time"}${TZ.short?` (${TZ.short})`:""}`:`hora de ${TZ.city||"tu zona"}${TZ.short?` (${TZ.short})`:""}`;
const whenTxt=(r,t)=>r.tbc?`${fdayl(t)}, ${LANG==="en"?"time TBC":"hora por confirmar"}`:`${fdayl(t)}, ${hm(t)}, ${tzLabel()}`;
const SES={fp1:"Libres 1",fp2:"Libres 2",fp3:"Libres 3",sq:"Clasif. sprint",sprint:"Sprint",quali:"Clasificación",race:"Carrera"};
const GP_CC={"abu-dhabi":"AE",australia:"AU",austria:"AT",azerbaijan:"AZ",bahrain:"BH","barcelona-catalunya":"ES",belgium:"BE",brazil:"BR",canada:"CA",china:"CN",eifel:"DE","emilia-romagna":"IT",france:"FR",germany:"DE","great-britain":"GB",hungary:"HU",italy:"IT",japan:"JP","las-vegas":"US",mexico:"MX",miami:"US",monaco:"MC",netherlands:"NL",portugal:"PT",qatar:"QA",russia:"RU",sakhir:"BH","sao-paulo":"BR","saudi-arabia":"SA",singapore:"SG",spain:"ES",styria:"AT",turkey:"TR",tuscany:"IT","united-states":"US","70th-anniversary":"GB"};
const raceFlag=r=>flag(r.cc||GP_CC[r.gp]||(DATA.circuits[r.circuit]||{}).cc);

/* ---------- datos de temporada (archivo + capa en vivo) ---------- */
function season(y){
  const s=DATA.seasons[y];
  if(LIVE && LIVE.year==y) return LIVE;
  return s;
}
function pickCurrent(){
  const ys=Object.keys(DATA.seasons).map(Number).sort((a,b)=>a-b);
  let cur=ys[0];
  ys.forEach(y=>{if(season(y).races.some(r=>Array.isArray(r.res)&&r.res.length))cur=y});
  const s=season(cur), next=ys.find(y=>y>cur);
  if(next&&s.races.every(r=>(r.res&&r.res.length)||r.cancelled)) cur=next;
  return cur;
}
function years(){
  const ys=Object.keys(DATA.seasons).map(Number);
  if(LIVE && !ys.includes(LIVE.year)) ys.push(LIVE.year);
  return ys.sort((a,b)=>a-b);
}
const done=r=>Array.isArray(r.res)&&r.res.length>0;
function status(r,now=Date.now()){
  if(done(r)) return "done";
  const t=Date.parse(r.start);
  const first=r.ses&&r.ses.length?Date.parse(r.ses[0][1]):t-2*D;
  if(now>=t-14*H && now<=t+4*H) return "raceday";
  if(now>=first-12*H && now<t-14*H) return "weekend";
  if(now>t+4*H) return "pending";
  return "future";
}
function nextRace(s){
  const i=s.races.findIndex(r=>!done(r)&&Date.now()<=Date.parse(r.start)+4*H);
  return i;
}
function lastDone(s){ for(let i=s.races.length-1;i>=0;i--) if(done(s.races[i])) return i; return -1; }
function seasonFinished(s){ return s.races.every(r=>done(r)||r.cancelled); }

/* campeón: matemáticamente asegurado */
function clinch(s){
  const left=s.races.filter(r=>!done(r)&&!r.cancelled);
  const sprintsLeft=left.filter(r=>r.sprint&&!(r.sp&&r.sp.length)).length;
  const maxD=left.length*25+sprintsLeft*8, maxC=left.length*43+sprintsLeft*15;
  const d=s.ds, c=s.cs;
  return {
    driver: d.length>1 && (d[0][4] || d[0][2]-d[1][2]>maxD),
    team: c.length>1 && (c[0][3] || c[0][1]-c[1][1]>maxC),
    final: left.length===0
  };
}

/* ---------- pista estilo Pirelli ---------- */
let TK=0;
/* tren de LEDs: puntos redondos que recorren la pista (sin máscaras ni filtros) */
const train=(n,sp)=>{const a=[];for(let i=0;i<n;i++)a.push(0,sp);a[a.length-1]=+(100-sp*(n-1)).toFixed(2);return a.join(" ")};
const LED=[[train(7,.85),"var(--rosso)",12,.38,.12],[train(7,.85),"#fff",4.6,1,.12],[train(7,.85),"var(--rosso)",4.2,.85,.06],[train(8,.85),"var(--rosso)",3.8,.4,0]];
function trackSVG(cid,{led=true,big=false}={}){
  const d=TRACKS[cid];
  if(!d) return `<p class="empty">Trazado no disponible para este circuito</p>`;
  const id="tk"+(++TK);
  const st=d.slice(1).split(" L")[0].split(",");
  return `<svg viewBox="0 0 400 260" role="img" aria-label="Trazado de ${esc((DATA.circuits[cid]||{}).n||cid)} por sectores">
   <g transform="translate(0,9)"><path d="${d}" class="tk-ext" stroke="#0a0a0c" stroke-width="12"/></g>
   <g transform="translate(0,6)"><path d="${d}" class="tk-ext" stroke="#1d1d22" stroke-width="11"/></g>
   <g transform="translate(0,3)"><path d="${d}" class="tk-ext" stroke="#2c2c33" stroke-width="10"/></g>
   <path d="${d}" class="tk-ext" stroke="#3a3a42" stroke-width="9"/>
   <path d="${d}" pathLength="100" class="tk-sec" stroke="var(--s1)" stroke-dasharray="33.3 66.7" stroke-dashoffset="0"/>
   <path d="${d}" pathLength="100" class="tk-sec" stroke="var(--s2)" stroke-dasharray="0 33.3 33.4 33.3" stroke-dashoffset="0"/>
   <path d="${d}" pathLength="100" class="tk-sec" stroke="var(--s3)" stroke-dasharray="0 66.7 33.3 0" stroke-dashoffset="0"/>
   <path d="${d}" class="tk-core"/>
   ${led?LED.map(([da,c,w,o,s])=>`<path d="${d}" pathLength="100" class="tk-run" stroke="${c}" stroke-width="${w}" opacity="${o}" stroke-dasharray="${da}" style="animation-delay:calc(var(--lap,3.2s) * -${s})"/>`).join(""):""}
   <rect x="${st[0]-5}" y="${st[1]-5}" width="10" height="10" fill="#fff" stroke="#000" stroke-width="1.5" transform="rotate(45 ${st[0]} ${st[1]})"/>
  </svg>`;
}
const secLabels=`<div class="seclabels"><span><i style="background:var(--s1)"></i>Sector 1</span><span><i style="background:var(--s2)"></i>Sector 2</span><span><i style="background:var(--s3)"></i>Sector 3</span></div>`;
function specs(r){
  const c=DATA.circuits[r.circuit]||{};
  const rows=[
    ["Longitud",r.len?`${r.len.toFixed(3)} km`:"—"],
    ["Vueltas",r.laps??"—"],
    ["Distancia",r.dist?`${r.dist.toFixed(1)} km`:"—"],
    ["Curvas",r.turns??"—"],
    ["Sentido",r.dir==="CLOCKWISE"?"Horario":r.dir?"Antihorario":"—"],
    ["Tipo",r.type==="STREET"?"Urbano":r.type==="RACE"?"Permanente":r.type==="ROAD"?"Mixto":"—"],
  ];
  if(r.fl) rows.push(["Vuelta rápida",r.fl[2]]);
  if(r.avg) rows.push(["Media ganador",`${r.avg} km/h`]);
  return `<div class="specs">${rows.map(([a,b])=>`<div class="spec"><span>${a}</span><b>${esc(b)}</b></div>`).join("")}</div>`;
}

/* ---------- podio ---------- */
function podium(res){
  const p=res.slice(0,3);
  const c=(row,cls,n)=>row?`<div class="pc ${cls}"><div class="who"><b>${esc(last(drv(row[1]).n))}</b><small>${esc(con(row[2]).n)}</small></div>
    <div class="step" style="border-color:${col(row[2])}"><span>${n}</span></div></div>`:`<div></div>`;
  return `<div class="podium">${c(p[1],"p2",2)}${c(p[0],"p1",1)}${c(p[2],"p3",3)}</div>`;
}

/* ---------- probabilidades (modelo de forma) ---------- */
const PTS=[25,18,15,12,10,8,6,4,2,1];
function probabilities(s,r){
  if(r.odds&&Array.isArray(r.odds.list)&&r.odds.list.length) return {src:r.odds.src||"Casas de apuestas",model:false,list:r.odds.list.slice(0,8)};
  const idx=s.races.indexOf(r);
  const prev=s.races.slice(0,idx).filter(done).slice(-6).reverse();
  if(!prev.length) return null;
  const score={};
  prev.forEach((race,k)=>race.res.forEach(row=>{const p=+row[0];if(p>=1&&p<=10)score[row[1]]=(score[row[1]]||0)+PTS[p-1]*Math.pow(.8,k)}));
  if(r.q&&r.q.length) r.q.forEach(row=>{const p=+row[0];if(p>=1&&p<=12)score[row[1]]=(score[row[1]]||0)*1+(13-p)*2.2});
  const ent=Object.entries(score).map(([d,v])=>[d,Math.pow(v+1,1.7)]);
  const sum=ent.reduce((a,b)=>a+b[1],0);
  return {model:true,list:ent.map(([d,v])=>[d,Math.round(v/sum*1000)/10]).sort((a,b)=>b[1]-a[1]).slice(0,6),withQ:!!(r.q&&r.q.length)};
}
function probHTML(s,r){
  const p=probabilities(s,r);
  if(!p) return `<p class="empty">Aún no hay carreras para calcular probabilidades</p>`;
  const max=p.list[0][1];
  return p.list.map(([d,v])=>{const dd=drv(d);const team=teamOf(s,d);return `<div class="prob"><span>${esc(dd.n)}</span><span class="bar"><i style="width:${v/max*100}%;background:${col(team)}"></i></span><span class="pct">${v}%</span></div>`}).join("")+
   `<p class="note">${p.model?`Estimación propia según los resultados de las últimas 6 carreras${p.withQ?" y la parrilla de salida":""}. No son cuotas de apuestas.`:`Fuente: ${esc(p.src)}${r.odds.upd?` · ${esc(r.odds.upd)}`:""}.`}</p>`;
}
function teamOf(s,d){
  for(let i=s.races.length-1;i>=0;i--){const r=s.races[i];const row=(r.res||r.q||[]).find(x=>x[1]===d);if(row)return row[2]}
  const ds=s.ds.find(x=>x[0]===d);return ds?ds[1]:"";
}

/* ---------- clima ---------- */
/* clima real de la sesión (sensores oficiales de la pista, vía FastF1) */
const rng=(a,b)=>a==null?"—":(Math.round(a)===Math.round(b)?`${Math.round(a)}`:`${Math.round(a)}–${Math.round(b)}`);
function pastWeatherHTML(r){
  const w=r.wx; if(!w) return null;
  const R=w.race||w.lap, L=w.lap||[];
  const air=L.length?[L[0],L[1]]:[R[0],R[1]], trk=L.length&&L[2]!=null?[L[2],L[3]]:[R[2],R[3]];
  const wet=L[5], rainPct=L.length?L[4]:R[5];
  const cond=wet?"Lluvia":rainPct>15?"Algo de lluvia":"Seco";
  const q=w.quali;
  return `<div class="wxp">
    <div class="${wet?"wet":""}"><small>Condición</small><b class="t">${cond}</b><span>${wet?"Se usaron neumáticos de lluvia":"Neumáticos de seco toda la carrera"}</span></div>
    <div><small>Aire</small><b>${rng(air[0],air[1])}<em>°C</em></b></div>
    <div><small>Pista</small><b>${rng(trk[0],trk[1])}<em>°C</em></b></div>
    <div><small>Humedad</small><b>${R[4]??"—"}<em>%</em></b></div>
    <div><small>Viento</small><b>${R[6]??"—"}<em>km/h</em></b></div>
  </div>
  ${q?`<p class="note">En la clasificación: aire de ${rng(q[0],q[1])} °C y pista de ${rng(q[2],q[3])} °C.</p>`:""}
  <p class="note">Datos de los sensores oficiales del circuito durante la carrera.</p>`;
}
const CMP={S:["Blando","#e10600"],M:["Medio","#ffd60a"],H:["Duro","#f4f4f2"],I:["Intermedio","#1fa84a"],W:["Lluvia","#1e6fe0"],"?":["Sin dato","#55555d"]};
function strategyHTML(r){
  if(!r.strat||!r.res) return "";
  const rows=r.res.slice(0,3).filter(x=>r.strat[x[1]]);
  if(!rows.length) return "";
  const used=new Set();
  const html=rows.map(x=>{const st=r.strat[x[1]], tot=st.reduce((a,b)=>a+b[1],0);
    st.forEach(s=>used.add(s[0]));
    return `<div class="strow"><span class="stn"><b>P${x[0]}</b> ${esc(last(drv(x[1]).n))}</span><span class="stbar">${st.map(([c,n])=>`<i style="flex:${n};background:${CMP[c][1]}" title="${CMP[c][0]}: ${n} vueltas"><span>${n}</span></i>`).join("")}</span><span class="stp">${st.length-1} ${st.length-1===1?"parada":"paradas"}</span></div>`}).join("");
  return `<h3 class="h3" style="margin:32px 0 12px">Estrategia del podio</h3>${html}
   <div class="legend">${[...used].map(c=>`<span><i style="background:${CMP[c][1]};border-radius:3px"></i>${CMP[c][0]}</span>`).join("")}<span>El número es la cantidad de vueltas con cada neumático</span></div>`;
}
function weatherHTML(r){
  const w=r.weather;
  if(!w||!Array.isArray(w.days)||!w.days.length) return `<p class="empty">El pronóstico aparece 7 días antes de la carrera.</p>`;
  return `<div class="wx">${w.days.map(x=>`<div><div class="i">${WXI[x.k]||""}</div><b>${esc(x.label||x.d)}</b><span>${esc(x.c||"")}</span><span>${x.hi!=null?`${x.hi}° / ${x.lo}°`:""}</span><span>${x.rain!=null?`Lluvia ${x.rain}%`:""}</span></div>`).join("")}</div>
   <p class="note">Fuente: ${esc(w.src||"pronóstico")}${w.upd?` · actualizado ${esc(w.upd)}`:""}</p>`;
}

/* ---------- streaks de fondo ---------- */
function streaks(){
  /* líneas de luz: solo transform (GPU), sin filtros */
  const S=[[38,"var(--rosso)",3,2.1,0],[44,"var(--rosso)",2,2.6,-.9],[51,"var(--yellow)",1.5,3.1,-1.7],[30,"#fff",1,2.4,-.4],[58,"var(--rosso)",4,3.4,-2.2],[66,"#fff",1,2.9,-1.3],[47,"var(--rosso)",1,1.8,-1.1]];
  return `<div class="streaks" aria-hidden="true">${S.map(([top,c,h,d,dl])=>`<i class="rail-l" style="top:${top}%;background:${c}"></i><i class="st" style="top:${top}%;height:${h}px;background:linear-gradient(90deg,transparent,${c} 70%,#fff);box-shadow:0 0 ${h*4}px ${c};--d:${d}s;--dl:${dl}s"></i>`).join("")}</div>`;
}
/* íconos del clima, mismo trazo que el resto */
const WXI={
 sol:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
 solnube:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5v1.3M4.2 9.3h1.3M5.6 5.9l.9.9M12.4 5.9l-.9.9"/><path d="M6.6 11.6A3.2 3.2 0 1 1 12 8.5"/><path d="M8 19.5h9a3.5 3.5 0 0 0 .4-7 4.5 4.5 0 0 0-8.6.9A3 3 0 0 0 8 19.5z"/></svg>',
 nube:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18.5h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.2A3.4 3.4 0 0 0 7 18.5z"/></svg>',
 niebla:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 13.5h10a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1A3 3 0 0 0 7 13.5zM5 17h14M7 20.5h10"/></svg>',
 lluvia:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14.5h10a3.8 3.8 0 0 0 .5-7.6 5.3 5.3 0 0 0-10.2 1.1A3.3 3.3 0 0 0 7 14.5z"/><path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5"/></svg>',
 tormenta:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14.5h10a3.8 3.8 0 0 0 .5-7.6 5.3 5.3 0 0 0-10.2 1.1A3.3 3.3 0 0 0 7 14.5z"/><path d="M12.5 15.5 10.5 19h3l-2 3"/></svg>',
 nieve:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14.5h10a3.8 3.8 0 0 0 .5-7.6 5.3 5.3 0 0 0-10.2 1.1A3.3 3.3 0 0 0 7 14.5z"/><path d="M8.5 18.5v.01M12 20v.01M15.5 18.5v.01"/></svg>'};
/* =========================================================
   VISTAS
   ========================================================= */
function countdownHTML(target,id){return `<div class="cdown" data-cd="${target}" id="${id||""}" aria-live="off"></div>`}
function tick(){
  document.querySelectorAll("[data-cd]").forEach(el=>{
    let ms=Math.max(0,+el.dataset.cd-Date.now());
    const d=Math.floor(ms/D),h=Math.floor(ms%D/H),m=Math.floor(ms%H/6e4),s=Math.floor(ms%6e4/1e3);const p=n=>String(n).padStart(2,"0");
    el.innerHTML=[[p(d),"Días"],[p(h),"Horas"],[p(m),"Min"],[p(s),"Seg"]].map(([v,l])=>`<div><span class="v led">${v}</span><span class="l">${l}</span></div>`).join("");
  });
}

/* ---- INICIO ---- */
function viewHome(){
  const s=season(CUR_YEAR);
  let ni=nextRace(s);
  const finished=ni<0;
  const r=finished? s.races[lastDone(s)] : s.races[ni];
  const st=finished?"done":status(r);
  const name=r.name, long=name.length>11;
  const c=DATA.circuits[r.circuit]||{};
  const raceT=new Date(r.start);
  let heroLeft;
  if(st==="raceday"){
    heroLeft=`<div class="when"><span class="pill red blink"><span>● En vivo hoy</span></span><span>Ronda ${r.r} de ${s.races.length}</span></div>
      <h1 class="disp racedayword"><span>Race</span><span>Day</span></h1>
      <p class="circ" style="margin-top:14px"><b>GP de ${esc(name)}</b>, ${esc(c.n||"")}. Semáforo en verde a las ${hm(raceT)}, ${tzLabel()}</p>
      ${countdownHTML(raceT.getTime())}
      <a class="btn" style="margin-top:22px" href="#gp-${s.year}-${r.r}">Ver pole, clima y probabilidades</a>`;
  }else if(finished){
    heroLeft=`<div class="when"><span class="pill yel"><span>Temporada ${s.year} terminada</span></span></div>
      <h1 class="disp gpname ${long?"long":""}">${esc(name)}</h1><p class="circ">Última carrera del año, ${fdayl(raceT)}</p>
      <a class="btn" style="margin-top:22px" href="#temporadas">Ver la temporada completa</a>`;
  }else{
    heroLeft=`<div class="when"><span class="pill ${st==="weekend"?"red":"dim"}"><span>${st==="weekend"?"Fin de semana de carrera":"Próxima carrera"}</span></span>${r.sprint?`<span class="pill yel"><span>Sprint</span></span>`:""}<span>Ronda ${r.r} de ${s.races.length}</span></div>
      <h1 class="disp gpname ${long?"long":""}">${esc(name)}</h1>
      <p class="circ">${esc(c.n||"")}, ${esc(c.place||"")}<br>${whenTxt(r,raceT)}</p>
      ${countdownHTML(raceT.getTime())}
      <a class="btn" style="margin-top:22px" href="#gp-${s.year}-${r.r}">Ver fin de semana</a>`;
  }
  const mq=`${s.year} GP de ${name} ${st==="raceday"?"Race day":"Race week"} `.toUpperCase();
  const li=lastDone(s), lr=li>=0?s.races[li]:null;
  const cl=clinch(s);
  const top=(arr,isD)=>{const max=arr[0][isD?2:1]||1;return arr.slice(0,5).map((x,i)=>{const team=isD?x[1]:x[0];const p=isD?x[2]:x[1];
    return `<div class="r ${i===0?"lead1":""}"><span class="p">${i+1}</span><span class="n"><i style="background:${col(team)}"></i><span style="min-width:0;flex:1"><b>${esc(isD?drv(x[0]).n:con(x[0]).n)}${i===0&&(isD?cl.driver:cl.team)?`<span class="champ">Campeón</span>`:""}</b><span class="bar"><i style="width:${p/max*100}%;background:${col(team)}"></i></span></span></span><span class="v">${p}<small>pts</small></span></div>`}).join("")};
  return `
  <section class="hero ${st==="raceday"?"live":""}">
    ${streaks()}
    <div class="ghost disp" aria-hidden="true">${esc(st==="raceday"?"RACE DAY":name)}</div>
    <div class="wrap">
      <div>${heroLeft}</div>
      <div class="track">${trackSVG(r.circuit)}${secLabels}${specs(r)}</div>
    </div>
    <div class="marquee" aria-hidden="true"><span>${(mq+"// ").repeat(10)}</span><span>${(mq+"// ").repeat(10)}</span></div>
  </section>
  <section class="block" style="padding:24px 0"><div class="wrap"><a class="hcard" href="#aprende">${ICON.llanta}<span><b>¿Primera vez viendo F1?</b><span>Aprende lo básico en 5 minutos: equipos, puntos, neumáticos y banderas.</span></span></a></div></section>
  ${lr?`<section class="block"><div class="wrap cols2">
    <div><div class="bhead"><h2 class="h2">Último podio<small>GP de ${esc(lr.name)}, ${fday(new Date(lr.start))}</small></h2><a class="link" href="#gp-${s.year}-${lr.r}">Resultados completos</a></div>${podium(lr.res)}</div>
    <div><div class="bhead"><h2 class="h2">Campeonato<small>Después de ${li+1} carreras</small></h2><a class="link" href="#temporadas">Clasificación</a></div>
      <div class="seg" role="tablist" style="margin-bottom:12px"><button class="on" data-hs="d">Pilotos</button><button data-hs="c">Equipos</button></div>
      <div class="rows" id="hstand" data-d='1'>${top(s.ds,true)}</div>
      <template id="hstand-c">${top(s.cs,false)}</template><template id="hstand-d">${top(s.ds,true)}</template>
    </div></div></section>`:""}
  ${(()=>{const ns=DATA.seasons[s.year+1];if(!ns)return "";
    const prevGps=new Set(s.races.map(r=>GP_ALIAS[r.gp]||r.gp)), nextGps=new Set(ns.races.map(r=>GP_ALIAS[r.gp]||r.gp));
    const back=ns.races.filter(r=>!prevGps.has(GP_ALIAS[r.gp]||r.gp)).map(r=>r.name), out=s.races.filter(r=>!nextGps.has(GP_ALIAS[r.gp]||r.gp)).map(r=>r.name);
    return `<section class="block"><div class="wrap">
      <div class="bhead"><h2 class="h2">Calendario ${ns.year}<small>${ns.races.length} carreras y ${ns.races.filter(r=>r.sprint).length} sprints. ${back.length?`${back.length>1?"Vuelven":"Vuelve"} ${lst(back)}. `:""}${out.length?`${out.length>1?"Salen":"Sale"} ${lst(out)}.`:""}</small></h2><a class="link" href="#carreras" data-ny="${ns.year}">Abrir ${ns.year}</a></div>
      ${winnerGrid(ns)}</div></section>`})()}
  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Calendario ${s.year}<small>Toca una carrera para ver su fin de semana</small></h2><a class="link" href="#carreras">Abrir carrusel</a></div>
    ${winnerGrid(s)}
  </div></section>`;
}
function winnerGrid(s){
  return `<div class="wgrid">${s.races.map(r=>{
    if(!done(r)) return `<a class="wcell fut" href="#gp-${s.year}-${r.r}"><div class="f">${raceFlag(r)}</div><b>${fday(new Date(r.start))}</b><small>R${r.r}${r.sprint?" · S":""}</small></a>`;
    const w=r.res[0];return `<a class="wcell" href="#gp-${s.year}-${r.r}" title="GP de ${esc(r.name)}: ${esc(drv(w[1]).n)}"><div class="f">${raceFlag(r)}</div><b>${esc(last(drv(w[1]).n))}</b><small>R${r.r}${r.sprint?" · S":""}</small><i style="background:${col(w[2])}"></i></a>`}).join("")}</div>`;
}

/* ---- CARRERAS (carrusel) ---- */
let curSlide=0, io=null;
function yearChips(attr){return `<div class="years" role="tablist" aria-label="Temporada">${years().slice().reverse().map(y=>`<button data-${attr}="${y}" class="${y==YEAR?"on":""}">${y}</button>`).join("")}</div>`}
function viewRaces(){
  const s=season(YEAR);
  const slides=s.races.map((r,i)=>{
    const st=status(r), t=new Date(r.start), c=DATA.circuits[r.circuit]||{};
    const pill=st==="done"?`<span class="pill dim"><span>Finalizada</span></span>`:st==="raceday"?`<span class="pill red blink"><span>● Hoy</span></span>`:st==="weekend"?`<span class="pill red"><span>Fin de semana</span></span>`:i===nextRace(s)?`<span class="pill red"><span>Próxima</span></span>`:`<span class="pill dim"><span>Próximamente</span></span>`;
    const body=done(r)?podium(r.res):countdownHTML(t.getTime());
    return `<article class="slide ${st==="raceday"?"live":""}" data-i="${i}" aria-label="Ronda ${r.r}, GP de ${esc(r.name)}">
      <div class="tside track">${trackSVG(r.circuit)}${secLabels}</div>
      <div class="iside">
        <div class="rtag"><span class="rn">R${String(r.r).padStart(2,"0")}</span>${pill}${r.sprint?`<span class="pill yel"><span>Sprint</span></span>`:""}</div>
        <div><span style="font-size:30px">${raceFlag(r)}</span><h2 class="disp gp">${esc(r.name)}</h2><p class="lead" style="margin-top:8px">${esc(c.n||"")}<br>${whenTxt(r,t)}</p></div>
        ${body}
        <a class="btn ${done(r)?"ghost":""}" href="#gp-${s.year}-${r.r}">${done(r)?"Ver resultados":"Ver fin de semana"}</a>
      </div></article>`}).join("");
  return `<section class="block" style="padding-top:28px"><div class="wrap">
    <div class="bhead"><h2 class="h2">Carreras<small>Desliza para ir al pasado o al futuro</small></h2>${yearChips("ry")}</div>
    <div class="rail" id="rail">${slides}</div>
    <div class="ctrl"><button class="arrow" id="prev" aria-label="Carrera anterior">‹</button>
      <div class="strip" id="strip">${s.races.map((r,i)=>`<button class="chip ${done(r)?"done":""}" data-go="${i}" aria-label="GP de ${esc(r.name)}"><span class="f">${raceFlag(r)}</span><span class="r2">R${r.r}</span></button>`).join("")}</div>
      <button class="arrow" id="next" aria-label="Carrera siguiente">›</button></div>
  </div></section>`;
}
function bindRaces(){
  const s=season(YEAR), rail=$("#rail");
  let start=nextRace(s); if(start<0) start=s.races.length-1;
  if(YEAR!=CUR_YEAR) start=s.races.some(done)?s.races.length-1:0;
  if(pendingSlide!=null){start=pendingSlide;pendingSlide=null}
  let lock=0;
  const go=(i,inst)=>{const el=rail.children[i];if(!el)return;lock=Date.now()+(inst?400:700);rail.scrollTo({left:i*(el.offsetWidth+14),behavior:inst?"instant":"smooth"});setSlide(i)};
  $("#prev").onclick=()=>go(Math.max(0,curSlide-1));
  $("#next").onclick=()=>go(Math.min(s.races.length-1,curSlide+1));
  document.querySelectorAll("#strip .chip").forEach(c=>c.onclick=()=>go(+c.dataset.go));
  if(io) io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(Date.now()>lock&&e.isIntersecting&&e.intersectionRatio>.6)setSlide(+e.target.dataset.i)}),{root:rail,threshold:[.6]});
  rail.querySelectorAll(".slide").forEach(x=>io.observe(x));
  setTimeout(()=>go(start,true),30);
}
let pendingSlide=null;
function setSlide(i){
  curSlide=i;
  document.querySelectorAll(".slide").forEach(x=>x.classList.toggle("paused",+x.dataset.i!==i));
  document.querySelectorAll("#strip .chip").forEach(c=>c.classList.toggle("cur",+c.dataset.go===i));
  const c=document.querySelector(`#strip .chip[data-go="${i}"]`);if(c)c.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
}

/* ---- FIN DE SEMANA DE CARRERA ---- */
const WHY={"accident":"Accidente","collision":"Colisión","collision damage":"Daños por colisión","engine":"Motor","gearbox":"Caja de cambios","hydraulics":"Hidráulica","brakes":"Frenos","power unit":"Unidad de potencia","spun off":"Trompo","withdrew":"Retirado","mechanical":"Mecánico","electrical":"Eléctrico","electronics":"Electrónica","suspension":"Suspensión","overheating":"Sobrecalentamiento","puncture":"Pinchazo","damage":"Daños","wheel":"Rueda","coolant leak":"Fuga de refrigerante","water leak":"Fuga de agua","oil leak":"Fuga de aceite","fuel pressure":"Presión de combustible","driveshaft":"Palier","disqualified":"Descalificado","retired":"Abandono","power loss":"Pérdida de potencia","vibrations":"Vibraciones","turbo":"Turbo","exhaust":"Escape","clutch":"Embrague","fuel system":"Sistema de combustible","radiator":"Radiador","steering":"Dirección","tyre":"Neumático","wheel nut":"Tuerca de rueda","debris":"Restos en pista","illness":"Enfermedad","injury":"Lesión","did not start":"No tomó la salida","battery":"Batería","energy store":"Batería","ers":"ERS","throttle":"Acelerador","front wing":"Alerón delantero","rear wing":"Alerón trasero","floor":"Fondo plano","halfshaft":"Semieje","transmission":"Transmisión","fire":"Incendio","fuel leak":"Fuga de combustible","oil pressure":"Presión de aceite","water pressure":"Presión de agua","cooling":"Refrigeración","undertray":"Fondo plano","pneumatics":"Neumática","technical":"Técnico","safety":"Seguridad","illegal skid block wear":"Desgaste ilegal del patín","accident damage":"Daños por accidente","car underweight":"Coche bajo el peso mínimo","handling":"Manejo","fuel pump":"Bomba de combustible","fuel":"Combustible","car damaged in qualifying":"Coche dañado en la clasificación","brake bias":"Reparto de frenada","accident in qualifying":"Accidente en la clasificación","vibration":"Vibraciones","unwell":"Indispuesto","tyre shortage":"Sin neumáticos","turbocharger":"Turbo","safety switch":"Interruptor de seguridad","retirement":"Abandono","received outside assistance":"Ayuda externa","puncture damage":"Daños por pinchazo","pit stop issue":"Problema en boxes","illegal floor":"Fondo plano ilegal","fuel sample":"Muestra de combustible"};
function gapES(g){g=String(g||"");const m=/^\+(\d+) laps?$/.exec(g);if(m)return `+${m[1]} vuelta${+m[1]>1?"s":""}`;return WHY[g.toLowerCase()]||g}
function resultTable(rows,{grid=true,pts=true,label="Tiempo"}={}){
  return `<table class="tbl"><thead><tr><th>Pos</th><th>Piloto</th><th class="hide-s">Equipo</th><th class="rt">${label}</th>${pts?`<th class="rt">Pts</th>`:""}</tr></thead><tbody>
   ${rows.map(row=>{const [p,d,c,g,pt,gr]=row;const ch=grid&&+p&&+gr?(+gr)-(+p):null;
     return `<tr class="${+p<=3?"top3":""}"><td class="pos">${esc(p)}</td><td class="drv"><i style="background:${col(c)}"></i><b>${dlink(d,esc(drv(d).n))}</b>${ch?` <span class="${ch>0?"gain":"loss"}">${ch>0?"▲":"▼"}${Math.abs(ch)}</span>`:""}</td><td class="hide-s">${esc(con(c).n)}</td><td class="rt">${esc(gapES(g))}</td>${pts?`<td class="rt">${pt||""}</td>`:""}</tr>`}).join("")}</tbody></table>`;
}
function viewGP(y,rn){
  const s=season(y); const r=s&&s.races.find(x=>x.r==rn);
  if(!r) return `<section class="block"><div class="wrap">${back("#carreras",`Carreras`)}<p class="empty">No encontramos esa carrera</p></div></section>`;
  const st=status(r), t=new Date(r.start), c=DATA.circuits[r.circuit]||{};
  const now=Date.now();
  const ses=(r.ses||[]).map(([k,iso],i,arr)=>{const a=Date.parse(iso);const dur=k==="race"?2.2*H:k==="sprint"?H:k==="quali"||k==="sq"?H:H;
    const cls=now>a+dur?"past":now>=a&&now<=a+dur?"now":"";const dt=new Date(a);return `<div class="ses ${cls}"><b>${SES[k]||k}</b><span>${fday(dt)}, ${hm(dt)}</span></div>`}).join("");
  const pole=r.pole?`<div class="r lead1" style="border-top:1px solid var(--grid)"><span class="p">1</span><span class="n"><i style="background:${col(r.pole[1])}"></i><span><b>${esc(drv(r.pole[0]).n)}</b><small>${esc(con(r.pole[1]).n)}</small></span></span><span class="v led" style="font-size:20px">${esc(r.pole[2])}</span></div>`:"";
  const q=r.q&&r.q.length?resultTable(r.q.slice(0,10).map(x=>[x[0],x[1],x[2],x[3],0,null]),{grid:false,pts:false,label:"Mejor vuelta"}):`<p class="empty">La parrilla aparece después de la clasificación${r.ses?`, el ${fdayl(new Date((r.ses.find(x=>x[0]==="quali")||[0,r.start])[1]))}`:""}</p>`;
  const sp=r.sprint?(r.sp&&r.sp.length?resultTable(r.sp,{label:"Tiempo"}):`<p class="empty">Los resultados de la sprint aparecen cuando termine${r.sprintStart?`, el ${fdayl(new Date(r.sprintStart))}`:""}</p>`):"";
  const raceBlock=done(r)?`${podium(r.res)}${strategyHTML(r)}<div style="margin-top:32px">${resultTable(r.res)}</div>`:
    `<h3 class="h3" style="margin-bottom:12px">¿Quién gana?</h3>${probHTML(s,r)}`;
  return `
  <section class="gphero ${st==="raceday"?"live":""}"><div class="wrap">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">${back("#carreras",`Carreras ${s.year}`)}<a class="linkpill" href="#gpx-${GP_ALIAS[r.gp]||r.gp}">Este GP desde ${years()[0]}</a></div>
    <div class="rtag"><span class="rn">Ronda ${r.r} de ${s.races.length}</span>${st==="raceday"?`<span class="pill red blink"><span>● Race day</span></span>`:st==="weekend"?`<span class="pill red"><span>Fin de semana en curso</span></span>`:done(r)?`<span class="pill dim"><span>Finalizada</span></span>`:""}${r.sprint?`<span class="pill yel"><span>Fin de semana sprint</span></span>`:""}${r.wx&&r.wx.lap&&r.wx.lap[5]?`<span class="pill blue"><span>Con lluvia</span></span>`:""}</div>
    <div class="cols2" style="align-items:center;margin-top:10px">
      <div><span style="font-size:34px">${raceFlag(r)}</span><h1 class="disp gpname ${r.name.length>11?"long":""}" style="margin-top:6px">${esc(r.name)}</h1>
        <p class="circ">${esc(c.n||"")}, ${esc(c.place||"")}<br>${whenTxt(r,t)}</p>
        ${!done(r)&&st!=="pending"?countdownHTML(t.getTime()):""}</div>
      <div class="track">${trackSVG(r.circuit)}${secLabels}${specs(r)}</div>
    </div></div></section>
  ${ses?`<section class="block"><div class="wrap"><div class="bhead"><h2 class="h2">Horario<small>En tu hora local</small></h2></div><div class="sched">${ses}</div></div></section>`:""}
  <section class="block"><div class="wrap cols2">
    <div><div class="bhead"><h2 class="h2">Pole position<small>${r.pole?"Quién sale primero":"Todavía no hay clasificación"}</small></h2></div>${pole}${r.q&&r.q.length?`<div style="margin-top:18px">${q}</div>`:q}</div>
    <div><div class="bhead"><h2 class="h2">Clima<small>${r.wx?"Así estuvo en la carrera":"Pronóstico del fin de semana"}</small></h2></div>${pastWeatherHTML(r)||weatherHTML(r)}</div>
  </div></section>
  ${r.sprint?`<section class="block"><div class="wrap"><div class="bhead"><h2 class="h2">Sprint<small>${r.sprintLaps?`${r.sprintLaps} vueltas, puntos para los 8 primeros`:"Carrera corta del sábado"}</small></h2></div>${sp}</div></section>`:""}
  <section class="block"><div class="wrap"><div class="bhead"><h2 class="h2">${done(r)?"Resultado":"Probabilidades"}<small>${done(r)?`${r.laps||""} vueltas${r.fl?`, vuelta rápida de ${esc(drv(r.fl[0]).n)} (${esc(r.fl[2])})`:""}`:"Antes de la carrera"}</small></h2></div>${raceBlock}</div></section>`;
}

/* ---- TEMPORADAS ---- */
let NAV=[];
let standTab="d", seasonsMode="year";
function seasonsHead(){
  return `<div class="bhead"><h2 class="h2">Temporadas<small>${seasonsMode==="year"?`Desde ${years()[0]}. Elige un año`:"Qué carreras se corrieron cada año y quién las ganó"}</small></h2>
    <div class="ctl"><div class="seg"><button data-sm="year" class="${seasonsMode==="year"?"on":""}">Por año</button><button data-sm="gp" class="${seasonsMode==="gp"?"on":""}">Por Gran Premio</button></div>${seasonsMode==="year"?yearChips("sy"):""}</div></div>`;
}
const GP_ALIAS={brazil:"sao-paulo"};   /* mismo evento, nombre distinto */
const GP_FORMER={"sao-paulo":"Se llamaba GP de Brasil hasta 2019"};
function gpIndex(){
  const m={};
  years().forEach(y=>season(y).races.forEach(r=>{const k=GP_ALIAS[r.gp]||r.gp;(m[k]=m[k]||[]).push({y,r})}));
  return m;
}
function gpStatus(list){
  const ys=list.map(x=>x.y), cur=CUR_YEAR, first=years()[0], mn=Math.min(...ys), mx=Math.max(...ys);
  const nx=cur+1, hasNext=!!DATA.seasons[nx];
  if(hasNext&&!ys.includes(cur)&&ys.includes(nx)) return ["new",`Vuelve en ${nx}`];
  if(hasNext&&ys.includes(cur)&&!ys.includes(nx)) return ["off",`Sale tras ${cur}`];
  if(ys.includes(cur)&&mn>first) return ["new",`Nuevo desde ${mn}`];
  if(ys.includes(cur)) return ["on",`En el calendario ${cur}`];
  if(ys.length===1) return ["once",`Solo en ${mn}`];
  return ["off",`Última vez en ${mx}`];
}
function gpMatrix(){
  const idx=gpIndex(), ys=years(), cur=CUR_YEAR;
  const curS=season(cur);
  const active=Object.keys(idx).filter(g=>idx[g].some(x=>x.y===cur)).sort((a,b)=>curS.races.find(r=>r.gp===a).r-curS.races.find(r=>r.gp===b).r);
  const gone=Object.keys(idx).filter(g=>!active.includes(g)).sort((a,b)=>Math.max(...idx[b].map(x=>x.y))-Math.max(...idx[a].map(x=>x.y))||idx[a][0].r.name.localeCompare(idx[b][0].r.name));
  const row=g=>{const list=idx[g], latest=list[list.length-1].r, [k,lbl]=gpStatus(list);
    let prevCirc=null;
    const cells=ys.map(y=>{const e=list.find(x=>x.y===y);
      if(!e) return `<td><span class="mc no" aria-label="No se corrió en ${y}"></span></td>`;
      const r=e.r, chg=prevCirc&&prevCirc!==r.circuit; prevCirc=r.circuit;
      const cn=(DATA.circuits[r.circuit]||{}).n||r.circuit;
      if(!done(r)) return `<td><a class="mc fut ${chg?"chg":""}" href="#gp-${y}-${r.r}" title="${y}: ${esc(cn)}, por correrse">R${r.r}</a></td>`;
      const w=r.res[0];return `<td><a class="mc ${chg?"chg":""}" style="--c:${col(w[2])}" href="#gp-${y}-${r.r}" title="${y}: ${esc(drv(w[1]).n)} en ${esc(cn)}${chg?" (cambió de circuito)":""}">${esc(drv(w[1]).c)}</a></td>`});
    return `<tr><th class="gpn" scope="row"><a href="#gpx-${g}"><span style="font-size:18px">${raceFlag(latest)}</span><span><b>${esc(latest.name)}</b><small class="st-${k}">${lbl}</small></span></a></th>${cells.join("")}</tr>`};
  return `<div class="mx-wrap"><table class="mx"><thead><tr><th class="gpn">Gran Premio</th>${ys.map(y=>`<th class="${y===cur?"cur":""}">${y}</th>`).join("")}</tr></thead><tbody>
    <tr class="sep"><th class="gpn">En el calendario ${cur}</th><td colspan="${ys.length}"></td></tr>${active.map(row).join("")}
    <tr class="sep"><th class="gpn">Ya no se corren</th><td colspan="${ys.length}"></td></tr>${gone.map(row).join("")}</tbody></table></div>
    <div class="legend"><span><i style="background:var(--carbon2);border-bottom:3px solid var(--rosso)"></i>Ganador, con el color de su equipo</span><span><i class="mc no" style="display:inline-block;margin:0"></i>No se corrió</span><span><i style="width:8px;height:8px;border-radius:50%;background:var(--yellow);vertical-align:0"></i>Cambió de circuito</span><span><b class="st-new">Amarillo</b>: nuevo · <b class="st-off">rojo</b>: salió del calendario</span></div>`;
}
function viewGPX(g){
  const idx=gpIndex(), list=idx[g];
  if(!list) return `<section class="block"><div class="wrap">${back("#temporadas",`Temporadas`)}<p class="empty">No encontramos ese Gran Premio</p></div></section>`;
  const latest=list[list.length-1].r, [k,lbl]=gpStatus(list);
  const circs=[...new Set(list.map(x=>x.r.circuit))];
  const wins={}; list.filter(x=>done(x.r)).forEach(x=>wins[x.r.res[0][1]]=(wins[x.r.res[0][1]]||0)+1);
  const best=Object.entries(wins).sort((a,b)=>b[1]-a[1])[0];
  let prev=null;
  const rows=years().slice().reverse().map(y=>{const e=list.find(x=>x.y===y);
    if(!e) return `<div class="tlr none"><div class="tlh"><span class="y">${y}</span></div><p class="tlc">No se corrió</p></div>`;
    const r=e.r, cn=(DATA.circuits[r.circuit]||{}).n||r.circuit;
    const w=done(r)?r.res[0]:null, wet=r.wx&&r.wx.lap&&r.wx.lap[5];
    const tags=`${r.sprint?`<span class="pill yel"><span>Sprint</span></span>`:""}${wet?`<span class="pill blue"><span>Lluvia</span></span>`:""}`;
    return `<a class="tlr" href="#gp-${y}-${r.r}"><div class="tlh"><span class="y">${y}</span><span class="tags">${tags}</span></div>
      ${w?`<div class="tlw" style="--cc:${col(w[2])}"><b>${esc(drv(w[1]).n)}</b><span>${esc(con(w[2]).n)}${r.pole?`. Pole de ${esc(last(drv(r.pole[0]).n))}`:""}</span></div>`
         :`<div class="tlw fut"><b>Por correrse</b><span>${fdayl(new Date(r.start))}</span></div>`}
      <p class="tlc">${esc(cn)}</p></a>`});
  return `<section class="gphero"><div class="wrap">
    ${back("#temporadas",`Todos los Grandes Premios`)}
    <div class="rtag"><span class="pill ${k==="off"?"red":k==="new"?"yel":"dim"}"><span>${lbl}</span></span></div>
    <div class="cols2" style="align-items:center;margin-top:10px">
      <div><span style="font-size:34px">${raceFlag(latest)}</span><h1 class="disp gpname ${latest.name.length>11?"long":""}" style="margin-top:6px">${esc(latest.name)}</h1>
        <p class="circ">${list.length} ${list.length===1?"edición":"ediciones"} desde ${years()[0]}${circs.length>1?`, en ${circs.length} circuitos distintos`:""}${best?`<br>Más victorias: ${esc(drv(best[0]).n)} (${best[1]})`:""}${GP_FORMER[g]?`<br>${GP_FORMER[g]}`:""}</p></div>
      <div class="track">${trackSVG(latest.circuit)}${secLabels}</div>
    </div></div></section>
  <section class="block"><div class="wrap"><div class="bhead"><h2 class="h2">Año por año<small>Toca un año para ver ese fin de semana</small></h2></div><div class="tl2">${rows.join("")}</div></div></section>`;
}
function viewSeasons(){
  if(seasonsMode==="gp") return `<section class="block" style="padding-top:28px"><div class="wrap">${seasonsHead()}${gpMatrix()}</div></section>`;
  const s=season(YEAR), n=s.races.filter(done).length;
  if(!n||!s.ds.length) return `<section class="block" style="padding-top:28px"><div class="wrap">${seasonsHead()}
    <div class="shero"><div class="disp yr">${s.year}</div><div class="ch"><span class="lead">Temporada por comenzar</span><b class="disp">${s.races.length} carreras</b><span class="lead">${s.races.filter(r=>r.sprint).length} con sprint. Arranca el ${fdayl(new Date(s.races[0].start))} en ${esc(s.races[0].name)}.</span></div></div>
    <div class="bhead" style="margin-top:32px"><h2 class="h2">Calendario<small>Toca una carrera para ver el circuito</small></h2></div>${winnerGrid(s)}</div></section>`;
  const cl=clinch(s);
  const leader=s.ds[0], cleader=s.cs[0];
  const wins={},poles={},pods={},spw={};
  s.races.filter(done).forEach(r=>{wins[r.res[0][1]]=(wins[r.res[0][1]]||0)+1;r.res.slice(0,3).forEach(x=>pods[x[1]]=(pods[x[1]]||0)+1);if(r.pole)poles[r.pole[0]]=(poles[r.pole[0]]||0)+1;if(r.sp&&r.sp[0])spw[r.sp[0][1]]=(spw[r.sp[0][1]]||0)+1});
  const champTxt=cl.driver?(cl.final?"Campeón":"Campeón (asegurado)"):"Líder";
  const hb=(m,title)=>{const e=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!e.length)return `<p class="empty">Sin datos</p>`;const max=e[0][1];
    return `<h3 class="h3" style="margin-bottom:10px">${title}</h3>`+e.map(([d,v])=>`<div class="hb"><span>${esc(drv(d).n)}</span><span class="bar"><i style="width:${v/max*100}%;background:${col(teamOf(s,d))}"></i></span><b>${v}</b></div>`).join("")};
  return `<section class="block" style="padding-top:28px"><div class="wrap">
    ${seasonsHead()}
    <div class="shero"><div class="disp yr">${s.year}</div>
      <div class="ch"><span class="lead">${champTxt} de pilotos</span><b class="disp">${esc(drv(leader[0]).n)}</b><span class="lead">${esc(con(leader[1]).n)}, ${leader[2]} puntos. ${cl.team?(cl.final?"Campeón":"Campeón asegurado"):"Líder"} de constructores: ${esc(con(cleader[0]).n)}</span></div></div>
    <div class="kpis">
      <div class="kpi"><b>${n}<small style="font-size:18px;color:var(--mute)">/${s.races.length}</small></b><span>Carreras disputadas</span></div>
      <div class="kpi"><b>${Object.keys(wins).length}</b><span>Ganadores distintos</span></div>
      <div class="kpi"><b>${wins[leader[0]]||0}</b><span>Victorias de ${esc(last(drv(leader[0]).n))}</span></div>
      <div class="kpi"><b>${s.ds[1]?leader[2]-s.ds[1][2]:0}</b><span>Puntos de ventaja sobre ${s.ds[1]?esc(last(drv(s.ds[1][0]).n)):"—"}</span></div>
    </div>
    <h3 class="h3">Así se fueron sumando los puntos</h3><p class="lead" style="margin:6px 0 12px">Los ocho primeros del campeonato, carrera a carrera</p>
    <div class="chart">${progChart(s)}</div>
  </div></section>
  <section class="block"><div class="wrap cols2">
    <div><div class="bhead"><h2 class="h2">Clasificación<small>${cl.final?"Final":`Después de ${n} carreras`}</small></h2>
      <div class="seg"><button data-st="d" class="${standTab==="d"?"on":""}">Pilotos</button><button data-st="c" class="${standTab==="c"?"on":""}">Equipos</button></div></div>
      <div class="rows">${standRows(s,cl)}</div></div>
    <div>${hb(wins,"Victorias")}<div style="height:26px"></div>${hb(poles,"Poles")}<div style="height:26px"></div>${hb(pods,"Podios")}${Object.keys(spw).length?`<div style="height:26px"></div>${hb(spw,"Victorias sprint")}`:""}</div>
  </div></section>
  <section class="block"><div class="wrap"><div class="bhead"><h2 class="h2">Ganador de cada carrera<small>Toca una para ver el fin de semana completo</small></h2></div>${winnerGrid(s)}</div></section>`;
}
function standRows(s,cl){
  if(standTab==="d"){const max=s.ds[0][2]||1;return s.ds.map((x,i)=>`<div class="r ${i===0?"lead1":""}"><span class="p">${x[3]||i+1}</span><span class="n"><i style="background:${col(x[1])}"></i><span style="min-width:0;flex:1"><b>${s.year===CUR_YEAR?dlink(x[0],esc(drv(x[0]).n)):esc(drv(x[0]).n)}${i===0&&cl.driver?`<span class="champ">Campeón</span>`:""}</b><small>${s.year===CUR_YEAR&&GRID&&GRID.cons[x[1]]?`<a class="dl" href="#equipo-${x[1]}">${esc(con(x[1]).n)}</a>`:esc(con(x[1]).n)}</small><span class="bar"><i style="width:${x[2]/max*100}%;background:${col(x[1])}"></i></span></span></span><span class="v">${x[2]}<small>pts</small></span></div>`).join("")}
  const max=s.cs[0][1]||1;return s.cs.map((x,i)=>`<div class="r ${i===0?"lead1":""}"><span class="p">${x[2]||i+1}</span><span class="n"><i style="background:${col(x[0])}"></i><span style="min-width:0;flex:1"><b>${s.year===CUR_YEAR&&GRID&&GRID.cons[x[0]]?`<a class="dl" href="#equipo-${x[0]}">${esc(con(x[0]).n)}</a>`:esc(con(x[0]).n)}${i===0&&cl.team?`<span class="champ">Campeón</span>`:""}</b><span class="bar"><i style="width:${x[1]/max*100}%;background:${col(x[0])}"></i></span></span></span><span class="v">${x[1]}<small>pts</small></span></div>`).join("");
}
function progChart(s){
  const P=s.prog||{}, ids=Object.keys(P); if(!ids.length) return `<p class="empty">Sin datos todavía</p>`;
  const n=(s.progRounds||[]).length; if(n<2) return `<p class="empty">Hace falta más de una carrera para la gráfica</p>`;
  const W=760,Hh=320,L=36,R=110,T=12,B=28; const max=Math.max(...ids.map(d=>Math.max(...P[d])));
  const x=i=>L+(W-L-R)*i/(n-1), y=v=>T+(Hh-T-B)*(1-v/max);
  const seen={}; let out=`<svg viewBox="0 0 ${W} ${Hh}" font-family="Archivo, system-ui, sans-serif" role="img" aria-label="Evolución de puntos ${s.year}">`;
  const step=max>300?100:50;
  for(let v=0;v<=max;v+=step) out+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#2a2a31"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  [0,Math.floor((n-1)/2),n-1].forEach(i=>out+=`<text x="${x(i)}" y="${Hh-8}" text-anchor="middle">R${s.progRounds[i]}</text>`);
  const ends=[];
  ids.forEach(d=>{const team=teamOf(s,d);const k=(seen[team]=(seen[team]||0)+1);
    out+=`<polyline fill="none" stroke="${col(team)}" stroke-width="${k===1?2.6:2}" ${k>1?'stroke-dasharray="6 4"':""} stroke-linejoin="round" points="${P[d].map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}"/>`;
    ends.push([y(P[d][n-1]),drv(d).c||d,col(team),P[d][n-1]]);});
  ends.sort((a,b)=>a[0]-b[0]); let prev=-99; ends.forEach(e=>{let yy=Math.max(e[0],prev+13);prev=yy;out+=`<text x="${W-R+8}" y="${yy+4}" style="fill:${e[2]};font-weight:800;font-size:12px">${esc(e[1])} ${e[3]}</text>`});
  return out+`</svg>`;
}

/* ---- DATOS CURIOSOS ---- */
function parseGap(g){const m=/^\+(\d+(?:\.\d+)?)$/.exec(String(g||""));return m?+m[1]:null}
function viewFacts(){
  const F=DATA.facts; const all=years().map(y=>season(y));
  const races=[];all.forEach(s=>s.races.forEach(r=>{if(done(r))races.push([s.year,r])}));
  const fastest=races.filter(([,r])=>r.avg).sort((a,b)=>b[1].avg-a[1].avg)[0];
  const closest=races.map(([y,r])=>[y,r,parseGap(r.res[1]&&r.res[1][3])]).filter(x=>x[2]!=null).sort((a,b)=>a[2]-b[2])[0];
  const comeback=races.map(([y,r])=>[y,r,+r.res[0][5]||0]).sort((a,b)=>b[2]-a[2])[0];
  let bestSeason=null; all.forEach(s=>{const w={};s.races.filter(done).forEach(r=>w[r.res[0][1]]=(w[r.res[0][1]]||0)+1);Object.entries(w).forEach(([d,v])=>{if(!bestSeason||v>bestSeason[2])bestSeason=[s.year,d,v,s.races.filter(done).length]})});
  let mostWinners=null; all.forEach(s=>{const k=new Set(s.races.filter(done).map(r=>r.res[0][1])).size;if(!mostWinners||k>mostWinners[1])mostWinners=[s.year,k]});
  const lens=races.map(([y,r])=>[y,r]).filter(([,r])=>r.len);
  const shortest=lens.sort((a,b)=>a[1].len-b[1].len)[0], longest=lens.slice().sort((a,b)=>b[1].len-a[1].len)[0];
  const sprints=races.filter(([,r])=>r.sp&&r.sp.length).length;
  const totalP={};all.forEach(s=>s.races.filter(done).forEach(r=>r.res.forEach(x=>totalP[x[1]]=(totalP[x[1]]||0)+(+x[4]||0))));
  const topPts=Object.entries(totalP).sort((a,b)=>b[1]-a[1])[0];
  const y0=years()[0], y1=CUR_YEAR;
  const li=(arr,n=5,fmt=v=>v)=>`<ol>${arr.slice(0,n).map(x=>`<li><span>${esc(x[1])}</span><b>${fmt(x[2])}</b></li>`).join("")}</ol>`;
  const fr=F.firstRace;
  return `<section class="block" style="padding-top:28px"><div class="wrap">
   <div class="bhead"><h2 class="h2">Datos curiosos<small>Récords de toda la historia y de las temporadas ${y0}–${y1}</small></h2></div>
   <div class="facts">
    <article class="fact w4 red"><div class="big">${F.wins[0][2]}</div><div><h3>${esc(F.wins[0][1])} es el piloto con más victorias de la historia</h3><p>Le siguen ${esc(F.wins[1][1])} con ${F.wins[1][2]} y ${esc(F.wins[2][1])} con ${F.wins[2][2]}</p></div></article>
    <article class="fact m-half"><div class="big">20<small>años</small></div><div><h3>Kimi Antonelli, el campeón más joven</h3><p>Se aseguró el título de 2026 en el GP de Ciudad de México con 20 años y 68 días</p></div></article>
    <article class="fact w3 white"><div><h3 style="margin-top:0">Más victorias en la historia</h3>${li(F.wins,6)}</div></article>
    <article class="fact w3"><div><h3 style="margin-top:0">Más poles en la historia</h3>${li(F.poles,6)}</div></article>
    <article class="fact m-half"><div class="big">${F.titles[0]?F.titles[0][2]:7}<small>títulos</small></div><div><h3>${F.titles[0]&&F.titles[1]&&F.titles[0][2]===F.titles[1][2]?`${esc(F.titles[0][1])} y ${esc(F.titles[1][1])}, los reyes`:esc(F.titles[0][1])}</h3><p>Son los pilotos con más campeonatos del mundo de la historia</p></div></article>
    <article class="fact m-half"><div class="big">${Math.floor(F.youngestWinners[0][2])}<small>años</small></div><div><h3>${esc(F.youngestWinners[0][1])}, el ganador más joven</h3><p>Ganó en ${F.youngestWinners[0][3]} con ${String(F.youngestWinners[0][2]).replace(".",",")} años. Segundo: ${esc(F.youngestWinners[1][1])}, con ${String(F.youngestWinners[1][2]).replace(".",",")} años en ${F.youngestWinners[1][3]}</p></div></article>
    <article class="fact m-half"><div class="big">${F.totalRaces.toLocaleString(LOC())}</div><div><h3>Grandes Premios disputados</h3><p>Desde el primero: Gran Bretaña, ${fr.date.slice(0,4)}, ganado por ${esc(fr.winner)}</p></div></article>
    ${fastest?`<article class="fact white m-half"><div class="big">${Math.round(fastest[1].avg)}<small>km/h</small></div><div><h3>La carrera más rápida desde ${y0}</h3><p>Media del ganador en el GP de ${esc(fastest[1].name)} ${fastest[0]}: ${esc(drv(fastest[1].res[0][1]).n)}</p></div></article>`:""}
    ${closest?`<article class="fact m-half"><div class="big">${closest[2].toFixed(3)}<small>s</small></div><div><h3>El final más apretado</h3><p>${esc(drv(closest[1].res[0][1]).n)} le ganó a ${esc(drv(closest[1].res[1][1]).n)} en el GP de ${esc(closest[1].name)} ${closest[0]}</p></div></article>`:""}
    ${comeback&&comeback[2]>1?`<article class="fact m-half"><div class="big">P${comeback[2]}<small>→ P1</small></div><div><h3>La gran remontada</h3><p>${esc(drv(comeback[1].res[0][1]).n)} salió ${comeback[2]}.º y ganó el GP de ${esc(comeback[1].name)} ${comeback[0]}</p></div></article>`:""}
    ${bestSeason?`<article class="fact w4 red"><div class="big">${bestSeason[2]}<small>de ${bestSeason[3]}</small></div><div><h3>Más victorias en un año</h3><p>${esc(drv(bestSeason[1]).n)} en ${bestSeason[0]}, el récord desde ${y0}</p></div></article>`:""}
    ${(()=>{const wet=races.filter(([,r])=>r.wx&&r.wx.lap&&r.wx.lap[5]);if(!wet.length)return "";const l=wet[wet.length-1];return `<article class="fact m-half"><div class="big">${wet.length}</div><div><h3>Carreras con lluvia</h3><p>Desde ${y0}. La más reciente: ${esc(l[1].name)} ${l[0]}.</p></div></article>`})()}
    <article class="fact m-half"><div class="big">${mostWinners[1]}</div><div><h3>Ganadores distintos en ${mostWinners[0]}</h3><p>La temporada más repartida desde ${y0}</p></div></article>
    <article class="fact"><div class="big">${sprints}</div><div><h3>Carreras sprint</h3><p>Disputadas desde que se estrenaron en 2021</p></div></article>
    <article class="fact w4"><div><div class="track" style="max-width:380px">${trackSVG(shortest[1].circuit,{led:false})}</div><h3>${esc((DATA.circuits[shortest[1].circuit]||{}).n)} es el circuito más corto</h3><p>${shortest[1].len.toFixed(3)} km por vuelta. El más largo es ${esc((DATA.circuits[longest[1].circuit]||{}).n)}, con ${longest[1].len.toFixed(3)} km</p></div></article>
    <article class="fact w6 white"><div class="big">${topPts[1].toLocaleString(LOC())}<small>pts</small></div><div><h3>Más puntos desde ${y0}</h3><p>${esc(drv(topPts[0]).n)} es quien más ha sumado en carreras de Gran Premio en este periodo</p></div></article>
    <article class="fact w6"><div><h3 style="margin-top:0">Campeones desde ${y0}</h3><ol>${(()=>{const s=season(CUR_YEAR);const c=clinch(s);return c.driver&&!F.champions[CUR_YEAR]?`<li><span>${CUR_YEAR}</span><b>${esc(drv(s.ds[0][0]).n)}</b></li>`:""})()}${Object.entries(F.champions).filter(([y])=>+y>=y0).reverse().map(([y,[,n]])=>`<li><span>${y}</span><b>${esc(n)}</b></li>`).join("")}</ol></div></article>
   </div>
  </div></section>`;
}

/* =========================================================
   PARRILLA · EQUIPOS · PILOTOS
   ========================================================= */
let GRID=null, gridTab="equipos";
/* Paletas inspiradas en la decoración de cada equipo (sin logos ni marcas) */
const TEAM={
  "mercedes":{bg:"#0b0d0e",fg:"#f2f4f5",p:"#00d7b6",s:"#c3c8cc",a:"#00d7b6",tp:"Toto Wolff",base:"Brackley, Reino Unido",tag:"Flechas plateadas"},
  "ferrari":{bg:"#b3000f",fg:"#fff",p:"#ff1d25",s:"#1a1a1a",a:"#ffe100",tp:"Fred Vasseur",base:"Maranello, Italia",tag:"La Scuderia"},
  "red-bull":{bg:"#0a1633",fg:"#fff",p:"#1e3b8a",s:"#e8102e",a:"#ffc906",tp:"Laurent Mekies",base:"Milton Keynes, Reino Unido",tag:"Desde Milton Keynes"},
  "mclaren":{bg:"#1c1d21",fg:"#fff",p:"#ff8000",s:"#2b2d33",a:"#47c7fc",tp:"Andrea Stella",base:"Woking, Reino Unido",tag:"Papaya"},
  "aston-martin":{bg:"#002f2a",fg:"#fff",p:"#00594f",s:"#0b1f1c",a:"#cedc00",tp:"Adrian Newey",base:"Silverstone, Reino Unido",tag:"Verde británico"},
  "alpine":{bg:"#03142e",fg:"#fff",p:"#0078c1",s:"#ff87bc",a:"#ff87bc",tp:"Flavio Briatore (asesor ejecutivo)",base:"Enstone, Reino Unido",tag:"Azul y rosa"},
  "williams":{bg:"#041e42",fg:"#fff",p:"#0a3a7a",s:"#00a3e0",a:"#64c4ff",tp:"James Vowles",base:"Grove, Reino Unido",tag:"Desde 1977"},
  "racing-bulls":{bg:"#eef1f6",fg:"#0b1240",p:"#ffffff",s:"#1634cb",a:"#e8102e",tp:"Alan Permane",base:"Faenza, Italia",tag:"El equipo hermano",light:true},
  "haas":{bg:"#f4f4f4",fg:"#111",p:"#ffffff",s:"#1d1d1f",a:"#e6002b",tp:"Ayao Komatsu",base:"Kannapolis, EE. UU.",tag:"Bandera americana",light:true},
  "audi":{bg:"#141416",fg:"#fff",p:"#a7a9ac",s:"#2a2a2e",a:"#f50537",tp:"Mattia Binotto",base:"Hinwil, Suiza",tag:"Debut de Audi"},
  "cadillac":{bg:"#050505",fg:"#fff",p:"#f5f5f5",s:"#1a1a1a",a:"#c9a227",tp:"Marcin Budkowski",base:"Fishers (EE. UU.) y Silverstone (Reino Unido)",tag:"El equipo número 11"},
};
const th=c=>TEAM[c]||{bg:"#141416",fg:"#fff",p:col(c),s:"#2a2a2e",a:col(c),tp:"—",base:"—",tag:""};
const tvars=c=>{const t=th(c);return `--tb:${t.bg};--tf:${t.fg};--tp:${t.p};--ts:${t.s};--ta:${t.a};--tc:${col(c)}`};
const REGS=[["768 kg","Peso mínimo con piloto"],["3.400 mm","Distancia entre ejes máxima"],["1.900 mm","Ancho máximo"],["400 kW","Motor de combustión"],["350 kW","Motor eléctrico (MGU-K)"],["100%","Combustible sostenible"]];
const fit=s=>{const w=Math.max(...String(s).split(/\s+/).map(x=>x.length));return (100/(w*0.8)).toFixed(2)+"cqw"};
let _dn=null;const countryES=cc=>{try{_dn=_dn||new Intl.DisplayNames([LOC()],{type:"region"});return cc?_dn.of(cc):""}catch(e){return cc||""}};
function gridDriver(id){return GRID&&GRID.drivers[id]}
function currentTeam(id){if(!GRID)return null;const g=GRID.grid.find(t=>t.drivers.some(d=>d.id===id&&d.current));return g||GRID.grid.find(t=>t.drivers.some(d=>d.id===id))}
function dlink(id,html){return gridDriver(id)?`<a class="dl" href="#piloto-${id}">${html}</a>`:html}
function age(dob){if(!dob)return "";const b=new Date(dob),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return a}

/* auto visto desde arriba, pintado con la paleta del equipo */
const CAR_IMG=new Set(["red-bull","racing-bulls","haas","audi","mercedes","ferrari","alpine","williams","cadillac","mclaren","aston-martin"]);
function carSVG(c,{w=240}={}){
  return CAR_IMG.has(c)?`<img class="car photo" src="cars/${c}.webp" alt="Auto de ${esc(con(c).n)} 2026" decoding="async">`:"";
}
function carSVGold(c,{w=240}={}){
  const t=th(c), body=t.light?t.s:t.p, stripe=t.a, wing=t.light?t.a:t.s;
  return `<svg class="car" viewBox="0 0 240 560" width="${w}" role="img" aria-label="Ilustración del auto en los colores del equipo">
   <ellipse cx="120" cy="300" rx="104" ry="250" fill="rgba(0,0,0,.35)"/>
   <g fill="#0c0c0e"><rect x="20" y="108" width="36" height="74" rx="7"/><rect x="184" y="108" width="36" height="74" rx="7"/><rect x="12" y="392" width="44" height="92" rx="8"/><rect x="184" y="392" width="44" height="92" rx="8"/></g>
   <g fill="none" stroke="#3a3a40" stroke-width="3"><path d="M56 136 L108 128 M56 156 L108 160 M184 136 L132 128 M184 156 L132 160 M56 430 L88 420 M184 430 L152 420"/></g>
   <path d="M20 38 H220 V58 L198 70 H42 L20 58 Z" fill="${wing}"/>
   <rect x="16" y="30" width="8" height="40" rx="2" fill="${stripe}"/><rect x="216" y="30" width="8" height="40" rx="2" fill="${stripe}"/>
   <path d="M110 64 H130 L136 150 C152 176 178 204 184 254 L186 330 C186 372 162 402 152 432 L148 472 H92 L88 432 C78 402 54 372 54 330 L56 254 C62 204 88 176 104 150 Z" fill="${body}"/>
   <path d="M136 150 C152 176 178 204 184 254 L186 330 C186 352 176 370 166 386 L160 250 Z" fill="rgba(0,0,0,.18)"/>
   <path d="M116 64 H124 L128 150 L124 470 H116 L112 150 Z" fill="${stripe}" opacity=".95"/>
   <ellipse cx="120" cy="262" rx="17" ry="32" fill="#0c0c0e"/>
   <path d="M98 240 Q120 214 142 240" fill="none" stroke="#2c2c31" stroke-width="7" stroke-linecap="round"/>
   <circle cx="120" cy="258" r="9" fill="${stripe}"/>
   <rect x="60" y="484" width="120" height="26" rx="3" fill="${wing}"/>
   <rect x="56" y="478" width="8" height="40" rx="2" fill="${stripe}"/><rect x="176" y="478" width="8" height="40" rx="2" fill="${stripe}"/>
  </svg>`;
}

function viewGrid(){
  if(!GRID) return `<div class="loading">Cargando parrilla…</div>`;
  const s=season(GRID.year), cs=s.cs, ds=s.ds;
  const teams=GRID.grid.slice().sort((a,b)=>(cs.findIndex(x=>x[0]===a.con)+99)%99-(cs.findIndex(x=>x[0]===b.con)+99)%99);
  const head=`<div class="bhead"><h2 class="h2">Parrilla ${GRID.year}<small>${teams.length} equipos y ${teams.reduce((n,t)=>n+t.drivers.filter(d=>d.current).length,0)} pilotos en la última carrera</small></h2>
    <div class="seg"><button data-gt="equipos" class="${gridTab==="equipos"?"on":""}">Equipos</button><button data-gt="pilotos" class="${gridTab==="pilotos"?"on":""}">Pilotos</button></div></div>`;
  if(gridTab==="pilotos"){
    const list=ds.filter(x=>gridDriver(x[0])&&currentTeam(x[0]));
    return `<section class="block" style="padding-top:28px"><div class="wrap">${head}<div class="dgrid">${list.map((x,i)=>{const g=GRID.drivers[x[0]], t=currentTeam(x[0]).con;
      return `<a class="dcard" href="#piloto-${x[0]}" style="${tvars(t)}"><span class="dnum">${g.num??""}</span><span class="dpos">P${x[3]||i+1}</span>
        <span class="dname"><small>${esc(g.n.split(" ")[0])}</small><b>${esc(last(g.n))}</b></span><span class="dteam">${esc(con(t).n)} · ${x[2]} pts</span></a>`}).join("")}</div></div></section>`;
  }
  return `<section class="block" style="padding-top:28px"><div class="wrap">${head}<div class="tgrid">${teams.map((g,i)=>{const pos=cs.findIndex(x=>x[0]===g.con), pts=pos>=0?cs[pos][1]:0;
    return `<a class="tcard ${i===0?"big":""}" href="#equipo-${g.con}" style="${tvars(g.con)}">
      <span class="tpos">P${pos+1}</span>
      <span class="tname">${esc(con(g.con).n)}</span>
      <span class="tcar">${esc(g.chassis)} · motor ${esc(g.engineMaker)}</span>
      <span class="tdrv">${g.drivers.filter(d=>d.current).map(d=>{const x=GRID.drivers[d.id];return `<span><b>${x.num??""}</b> ${esc(last(x.n))}</span>`}).join("")}</span>
      <span class="tpts">${pts}<small> pts</small></span>
      ${i===0?`<span class="tcarimg">${carSVG(g.con,{w:120})}</span>`:""}
    </a>`}).join("")}</div></div></section>`;
}

function seasonRows(s,id){return s.races.filter(done).map(r=>({r,row:r.res.find(x=>x[1]===id),q:(r.q||[]).find(x=>x[1]===id),sp:(r.sp||[]).find(x=>x[1]===id)}))}
function posCell(row){if(!row)return `<span class="pc0">—</span>`;const p=row[0];const n=+p;return `<span class="pcl ${n===1?"g1":n<=3?"g3":n<=10?"g10":"gx"}">${n?p:esc(p)}</span>`}

function viewTeam(c){
  if(!GRID) return `<div class="loading">Cargando…</div>`;
  const g=GRID.grid.find(x=>x.con===c);
  if(!g) return `<section class="block"><div class="wrap">${back("#parrilla",`Parrilla`)}<p class="empty">Ese equipo no está en la parrilla actual</p></div></section>`;
  const t=th(c), st=GRID.cons[c]||{}, s=season(GRID.year), pos=s.cs.findIndex(x=>x[0]===c), pts=pos>=0?s.cs[pos][1]:0;
  const cur=g.drivers.filter(d=>d.current), all=g.drivers;
  const done_=s.races.filter(done);
  const tw=done_.filter(r=>r.res[0][2]===c).length, tpod=done_.reduce((n,r)=>n+r.res.slice(0,3).filter(x=>x[2]===c).length,0), tpole=done_.filter(r=>r.pole&&r.pole[1]===c).length;
  const drvCard=d=>{const x=GRID.drivers[d.id], dsr=s.ds.find(z=>z[0]===d.id)||[d.id,c,0,"—"];
    return `<a class="tdcard" href="#piloto-${d.id}"><span class="dnum">${x.num??""}</span><span><small>${esc(x.n.split(" ")[0])}</small><b>${esc(last(x.n))}</b></span>
      <span class="tdst"><span><b>P${dsr[3]}</b>campeonato</span><span><b>${dsr[2]}</b>puntos</span><span><b>${x.career.wins}</b>victorias en su carrera</span></span></a>`};
  const matrix=`<div class="mx-wrap tm"><table class="mx"><thead><tr><th class="gpn">Piloto</th>${s.races.map(r=>`<th title="GP de ${esc(r.name)}">${raceFlag(r)}<br><small>R${r.r}</small></th>`).join("")}</tr></thead><tbody>
    ${all.map(d=>`<tr><th class="gpn"><b>${esc(last(GRID.drivers[d.id].n))}</b></th>${s.races.map(r=>{const row=done(r)&&r.res.find(x=>x[1]===d.id&&x[2]===c);return `<td>${done(r)?(row?posCell(row):`<span class="pc0">·</span>`):`<span class="pc0"></span>`}</td>`}).join("")}</tr>`).join("")}</tbody></table></div>`;
  const chron=(st.chron||[]).length>1?`<div class="tbox wide"><h3 class="h3">De dónde viene</h3><p class="lead" style="margin-bottom:14px">El mismo equipo, con otros nombres a lo largo del tiempo</p><div class="chron">${st.chron.map(([n,a,b])=>`<span><b>${esc(n)}</b>${a}–${b||"hoy"}</span>`).join("")}</div></div>`:"";
  return `<div class="team ${t.light?"light":""}" style="${tvars(c)}">
  <section class="thero"><div class="wrap">
    ${back("#parrilla",`Parrilla`)}
    <div class="thgrid">
      <div class="fitwrap">
        <span class="tag">${esc(t.tag)}</span>
        <h1 class="disp tbig" style="--fit:${fit(con(c).n)}">${esc(con(c).n)}</h1>
        <p class="tfull">${esc(g.entrant)}</p>
        <div class="tchassis disp">${esc(g.chassis)}</div>
        <div class="trow"><span><b>P${pos+1}</b>en ${GRID.year}</span><span><b>${pts}</b>puntos</span><span><b>${tw}</b>victorias en ${GRID.year}</span></div>
      </div>
      ${CAR_IMG.has(c)?`<div class="tcarwrap">${carSVG(c)}</div>`:""}
    </div>
  </div></section>
  <section class="tsec"><div class="wrap">
    <div class="bento">
      <div class="tbox"><small>Jefe de equipo</small><b>${esc(t.tp)}</b></div>
      <div class="tbox"><small>Sede</small><b>${esc(t.base)}</b></div>
      <div class="tbox hl"><small>Auto ${GRID.year}</small><b class="disp">${esc(g.chassis)}</b></div>
      <div class="tbox"><small>Unidad de potencia</small><b>${esc(g.engineMaker)} ${esc(g.engine)}</b><span>V6 turbo híbrido de 1,6 litros</span></div>
      <div class="tbox"><small>Títulos de constructores</small><b class="n">${(st.titles||[]).length}</b><span>${(st.titles||[]).length?`Último: ${st.titles[st.titles.length-1]}`:"Todavía ninguno"}</span></div>
      <div class="tbox"><small>Títulos de pilotos</small><b class="n">${(st.drvTitles||[]).length}</b><span>Ganados con este equipo</span></div>
      <div class="tbox"><small>Victorias en la historia</small><b class="n">${st.wins||0}</b><span>${st.podiums||0} podios y ${st.poles||0} poles</span></div>
      <div class="tbox"><small>Con este nombre desde</small><b class="n">${st.first||GRID.year}</b><span>${st.races||0} Grandes Premios disputados</span></div>
    </div>
  </div></section>
  <section class="tsec"><div class="wrap">
    <div class="bhead"><h2 class="h2">Pilotos<small>${cur.length} titulares${g.reserves.length?` y ${g.reserves.length} de reserva`:""}</small></h2></div>
    <div class="tdrivers">${cur.map(drvCard).join("")}</div>
    ${all.length>cur.length?`<p class="note">También corrieron con el equipo en ${GRID.year}: ${all.filter(d=>!d.current).map(d=>dlink(d.id,esc(GRID.drivers[d.id].n))).join(", ")}.</p>`:""}
  </div></section>
  <section class="tsec"><div class="wrap">
    <div class="bhead"><h2 class="h2">Temporada ${GRID.year}<small>Posición de cada piloto, carrera por carrera</small></h2></div>
    ${matrix}
    <div class="legend"><span><span class="pcl g1">1</span> Victoria</span><span><span class="pcl g3">3</span> Podio</span><span><span class="pcl g10">8</span> Puntos</span><span><span class="pcl gx">DNF</span> Sin puntos o abandono</span></div>
  </div></section>
  <section class="tsec"><div class="wrap">
    <div class="bhead"><h2 class="h2">Ficha técnica<small>Medidas del reglamento ${GRID.year}, iguales para los 11 equipos</small></h2></div>
    <div class="bento regs">${REGS.map(([v,l])=>`<div class="tbox"><b class="n">${v}</b><span>${l}</span></div>`).join("")}
      <div class="tbox wide"><small>Lo nuevo de ${GRID.year}</small><p class="tp">Alerones delanteros y traseros que se abren en las rectas para bajar la resistencia, y un modo de adelantamiento con energía eléctrica extra para el auto que persigue.</p></div>
    </div>
    ${chron?`<div class="bento" style="margin-top:12px">${chron}</div>`:""}
  </div></section>
  </div>`;
}

function ageAt(dob,date){
  if(!dob||!date) return null;
  const b=new Date(dob+"T12:00:00"), d=new Date(String(date).slice(0,10)+"T12:00:00");
  let y=d.getFullYear()-b.getFullYear(); const bd=new Date(d.getFullYear(),b.getMonth(),b.getDate(),12);
  let last=bd; if(d<bd){y--; last=new Date(d.getFullYear()-1,b.getMonth(),b.getDate(),12)}
  return {y,d:Math.round((d-last)/D)};
}
/* ¿en qué carrera quedó asegurado el título de la temporada en curso? */
function clinchRace(s,id){
  const P=s.prog||{}, R=s.progRounds||[]; if(!P[id]) return null;
  for(let k=0;k<R.length;k++){
    const mine=P[id][k], best=Math.max(...Object.keys(P).filter(d=>d!==id).map(d=>P[d][k]||0));
    const left=s.races.filter(r=>r.r>R[k]&&!r.cancelled), maxLeft=left.length*25+left.filter(r=>r.sprint).length*8;
    if(mine-best>maxLeft) return s.races.find(r=>r.r===R[k]);
  }
  return null;
}
function milestones(x,id,s){
  const k=x.career;
  const box=(cls,label,ag,line,team,extra)=>`<div class="tbox mile ${cls}"><small>${label}</small>
    ${ag?`<b class="n">${ag.y}<em> años</em></b><span>y ${ag.d} ${ag.d===1?"día":"días"}</span>`:""}
    <p class="mline">${line}</p>${team?`<span class="mteam" style="--cc:${col(team)}">${esc(con(team).n)}</span>`:""}${extra||""}</div>`;
  const deb=k.first?box("","Debut",ageAt(x.dob,k.first[2]),`GP de ${esc(k.first[3])} ${k.first[0]}`,k.first[1]):"";
  const win=k.firstWin?box("","Primera victoria",ageAt(x.dob,k.firstWin[2]),`GP de ${esc(k.firstWin[3])} ${k.firstWin[0]}`,k.firstWin[1])
    :box("none","Primera victoria",null,`Todavía no gana`,null,k.best?`<span>Su mejor resultado: P${k.best[0]} en ${esc(k.best[2])} ${k.best[1]}</span>`:"");
  let title;
  if(k.titleInfo&&k.titleInfo.length){const [ty,tc,td]=k.titleInfo[0];
    title=box("hl","Primer título mundial",ageAt(x.dob,td),`Temporada ${ty}${k.titleInfo.length>1?`. Ganó ${k.titleInfo.length} en total`:""}`,tc,`<span class="mnote">Edad al cerrar la temporada</span>`);}
  else{const cr=clinchRace(s,id);
    title=cr?box("hl","Primer título mundial",ageAt(x.dob,cr.start),`Temporada ${s.year}, asegurado en el GP de ${esc(cr.name)}`,teamOf(s,id))
      :box("none","Primer título mundial",null,"Todavía no es campeón",null);}
  return `<section class="tsec"><div class="wrap"><div class="bhead"><h2 class="h2">Hitos<small>A qué edad, con qué equipo y en qué año</small></h2></div><div class="bento miles">${deb}${win}${title}</div></div></section>`;
}
function viewDriver(id){
  if(!GRID) return `<div class="loading">Cargando…</div>`;
  const x=GRID.drivers[id];
  if(!x) return `<section class="block"><div class="wrap">${back("#parrilla",`Parrilla`)}<p class="empty">Ese piloto no está en la parrilla actual</p></div></section>`;
  const g=currentTeam(id), c=g.con, t=th(c), s=season(GRID.year);
  const dsr=s.ds.find(z=>z[0]===id)||[id,c,0,"—"];
  const rows=seasonRows(s,id).filter(e=>e.row);
  const nums=rows.map(e=>+e.row[0]).filter(Boolean);
  const wins=nums.filter(n=>n===1).length, pods=nums.filter(n=>n<=3).length, dnf=rows.filter(e=>!+e.row[0]).length;
  const poles=s.races.filter(r=>r.pole&&r.pole[0]===id).length;
  const best=nums.length?Math.min(...nums):null, avg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(1).replace(".",","):"—";
  const spPts=s.races.reduce((n,r)=>n+((r.sp||[]).find(z=>z[1]===id)||[0,0,0,0,0])[4],0);
  // compañero
  const mate=g.drivers.find(d=>d.id!==id&&d.current)||g.drivers.find(d=>d.id!==id);
  let h2h=null;
  if(mate){let qa=0,qb=0,ra=0,rb=0;
    s.races.filter(done).forEach(r=>{const a=r.res.find(z=>z[1]===id&&z[2]===c),b=r.res.find(z=>z[1]===mate.id&&z[2]===c);
      if(a&&b){const pa=+a[0]||99,pb=+b[0]||99;if(pa<pb)ra++;else if(pb<pa)rb++;}
      const qa_=(r.q||[]).find(z=>z[1]===id&&z[2]===c),qb_=(r.q||[]).find(z=>z[1]===mate.id&&z[2]===c);
      if(qa_&&qb_){if(+qa_[0]<+qb_[0])qa++;else qb++;}});
    h2h={m:GRID.drivers[mate.id],mid:mate.id,qa,qb,ra,rb};}
  const k=x.career;
  const form=`<div class="form">${s.races.map(r=>{const e=done(r)&&r.res.find(z=>z[1]===id);if(!done(r))return `<span class="fb fut" title="GP de ${esc(r.name)}"></span>`;
    if(!e)return `<span class="fb no" title="GP de ${esc(r.name)}: no corrió"></span>`;const p=+e[0];const h=p?Math.max(8,100-(p-1)*4.3):6;
    return `<a class="fb ${p===1?"g1":p&&p<=3?"g3":p&&p<=10?"g10":"gx"}" href="#gp-${s.year}-${r.r}" title="GP de ${esc(r.name)}: ${esc(e[0])}"><i style="height:${h}%"></i><small>${p||"✕"}</small></a>`}).join("")}</div>`;
  const bar=(a,b)=>{const tot=a+b||1;return `<span class="h2hbar"><i style="width:${a/tot*100}%"></i></span>`};
  return `<div class="team ${t.light?"light":""}" style="${tvars(c)}">
  <section class="thero"><div class="wrap">
    ${back("#equipo-${c}",`${esc(con(c).n)}`)}
    <div class="thgrid">
      <div class="fitwrap">
        <span class="tag">${flag(x.nat)} ${esc(countryES(x.nat))}${x.nat?" · ":""}${age(x.dob)} años</span>
        <h1 class="disp tbig" style="--fit:${fit(last(x.n))}"><small>${esc(x.n.split(" ")[0])}</small>${esc(last(x.n))}</h1>
        <p class="tfull">${esc(x.full||x.n)}. Nació en ${esc(x.pob||"—")} el ${x.dob?fdayl(new Date(x.dob+"T12:00:00")).replace(/^\S+ /,""):"—"} de ${x.dob.slice(0,4)}</p>
        <div class="trow"><span><b>P${dsr[3]}</b>en ${GRID.year}</span><span><b>${dsr[2]}</b>puntos</span><span><b>${esc(x.c)}</b>sigla</span></div>
      </div>
      <div class="bignum disp" aria-hidden="true">${x.num??""}</div>
    </div>
  </div></section>
  ${milestones(x,id,s)}
  <section class="tsec"><div class="wrap">
    <div class="bhead"><h2 class="h2">Temporada ${GRID.year}<small>Con ${esc(con(c).n)}</small></h2></div>
    <div class="bento">
      <div class="tbox hl"><small>Posición</small><b class="n">P${dsr[3]}</b><span>${dsr[2]} puntos${spPts?`, ${spPts} en sprints`:""}</span></div>
      <div class="tbox"><small>Victorias</small><b class="n">${wins}</b><span>${pods} podios</span></div>
      <div class="tbox"><small>Poles</small><b class="n">${poles}</b><span>Mejor resultado: ${best?`P${best}`:"—"}</span></div>
      <div class="tbox"><small>Promedio de llegada</small><b class="n">${avg}</b><span>${dnf} ${dnf===1?"abandono":"abandonos"}</span></div>
      <div class="tbox wide"><small>Carrera a carrera</small>${form}</div>
      ${h2h?`<div class="tbox wide"><small>Contra su compañero, ${esc(h2h.m.n)}</small>
        <div class="h2h"><span>Clasificación</span><b>${h2h.qa}</b>${bar(h2h.qa,h2h.qb)}<b>${h2h.qb}</b><span>Carrera</span><b>${h2h.ra}</b>${bar(h2h.ra,h2h.rb)}<b>${h2h.rb}</b></div>
        <p class="note">Veces que terminó por delante en las sesiones en que corrieron juntos. ${dlink(h2h.mid,"Ver a "+esc(last(h2h.m.n)))}</p></div>`:""}
    </div>
  </div></section>
  <section class="tsec"><div class="wrap">
    <div class="bhead"><h2 class="h2">Su carrera en F1<small>Desde ${k.first?`el GP de ${esc(k.first[3])} ${k.first[0]}`:"—"}</small></h2></div>
    <div class="bento">
      ${(()=>{const yrs=[...k.titles];const cr=!yrs.includes(s.year)&&clinchRace(s,id);if(cr)yrs.push(s.year);
        return `<div class="tbox hl"><small>Títulos mundiales</small><b class="n">${yrs.length}</b><span>${yrs.length?yrs.join(", ")+(cr?" (asegurado)":""):"Todavía ninguno"}</span></div>`})()}
      <div class="tbox"><small>Grandes Premios</small><b class="n">${k.starts}</b><span>${k.points.toLocaleString(LOC())} puntos</span></div>
      <div class="tbox"><small>Victorias</small><b class="n">${k.wins}</b><span>${k.firstWin?`La primera: GP de ${esc(k.firstWin[3])} ${k.firstWin[0]}`:k.best?`Mejor: P${k.best[0]} en ${esc(k.best[2])} ${k.best[1]}`:"—"}</span></div>
      <div class="tbox"><small>Podios y poles</small><b class="n">${k.podiums}<em>/</em>${k.poles}</b><span>${k.podiums} podios, ${k.poles} poles</span></div>
      <div class="tbox wide"><small>Equipos</small><div class="chron">${k.teams.map(([cc,a,b])=>`<span style="--cc:${col(cc)}"><b>${esc(con(cc).n)}</b>${a===b?a:`${a}–${b}`}</span>`).join("")}</div></div>
    </div>
  </div></section>
  </div>`;
}

/* =========================================================
   APRENDE · F1 desde cero
   ========================================================= */
function tyreSVG(c,label){return `<svg viewBox="0 0 100 100" class="tyre" role="img" aria-label="${label}"><circle cx="50" cy="50" r="46" fill="#111"/><circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="5"/><circle cx="50" cy="50" r="26" fill="#2a2a30"/><circle cx="50" cy="50" r="8" fill="#55555d"/></svg>`}
function flagSVG(k){
  const F={green:'<rect width="40" height="28" rx="3" fill="#1fa84a"/>',yellow:'<rect width="40" height="28" rx="3" fill="#ffd60a"/>',red:'<rect width="40" height="28" rx="3" fill="#e10600"/>',blue:'<rect width="40" height="28" rx="3" fill="#1e6fe0"/>',
   bw:'<rect width="40" height="28" rx="3" fill="#fff"/><path d="M0 28 L40 0 V28Z" fill="#111"/><rect width="40" height="28" rx="3" fill="none" stroke="#555"/>',black:'<rect width="40" height="28" rx="3" fill="#000" stroke="#555"/>',
   chk:'<rect width="40" height="28" rx="3" fill="#fff"/>'+[...Array(20)].map((_,i)=>{const x=i%5,y=Math.floor(i/5);return (x+y)%2?"":`<rect x="${x*8}" y="${y*7}" width="8" height="7" fill="#111"/>`}).join("")};
  return `<svg viewBox="0 0 40 28" class="flagi" aria-hidden="true">${F[k]}</svg>`;
}
function viewLearn(){
  const s=season(CUR_YEAR), n=s.races.length, countries=new Set(s.races.map(r=>(DATA.circuits[r.circuit]||{}).cc)).size;
  const teams=GRID?GRID.grid.length:11, drivers=teams*2, sprints=s.races.filter(r=>r.sprint).length||6;
  const pts=[25,18,15,12,10,8,6,4,2,1];
  const gl=[["Pole position","El primer lugar de salida"],["Box, box","El equipo le pide al piloto que entre a cambiar neumáticos"],["Undercut","Parar antes que el rival para pasarlo con neumáticos nuevos"],["DNF","El piloto abandonó y no terminó"],["Vuelta rápida","La vuelta más veloz de la carrera"],["Parc fermé","Después de la clasificación casi no se puede tocar el auto"],["Límites de pista","Salirse de las líneas blancas trae sanciones"],["Penalización","5 o 10 segundos extra, o pasar por los boxes"]];
  const f=(cls,big,unit,title,text)=>`<article class="fact ${cls}">${big!=null?`<div class="big">${big}${unit?`<small>${unit}</small>`:""}</div>`:""}<div><h3>${title}</h3>${text?`<p>${text}</p>`:""}</div></article>`;
  return `<section class="lhero"><div class="wrap">
    <span class="pill yel"><span>Primera vez aquí</span></span>
    <h1 class="disp lbig">F1 desde cero</h1>
    <p class="lead" style="color:#d6d6dc;max-width:30ch">Lo que necesitas para entender una carrera en 5 minutos.</p>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Lo básico<small>Quién compite</small></h2></div>
    <div class="facts">
      ${f("m-half red",teams,"","Equipos","Cada uno construye su propio auto.")}
      ${f("m-half",2,"","Pilotos por equipo","Compañeros, pero también rivales.")}
      ${f("m-half",drivers,"","Autos en la salida","Todos en la misma pista.")}
      ${f("m-half white",n,"","Carreras en "+s.year,`De marzo a diciembre, en ${countries} países.`)}
      ${f("m-half txt",null,"","Título de pilotos","Lo gana quien más puntos suma en el año.")}
      ${f("m-half txt",null,"","Título de equipos","Suma los puntos de sus dos pilotos.")}
    </div>
    <a class="linkpill" style="margin-top:16px" href="#parrilla">Conoce la parrilla</a>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Un fin de semana<small>Tres días, un Gran Premio</small></h2></div>
    <div class="week">
      <div><span class="wd">Vie</span><b>Práctica</b><em>Prueban y ajustan el auto</em></div>
      <div class="yel"><span class="wd">Sáb</span><b>Clasificación</b><em>Se decide el orden de salida</em></div>
      <div class="red"><span class="wd">Dom</span><b>Carrera</b><em>Unos 305 km, hora y media</em></div>
    </div>
    <h3 class="lsub">Así funciona la clasificación</h3>
    <div class="ko">
      <div><span>Q1</span><b>22</b><em>Salen los 6 más lentos</em></div>
      <div><span>Q2</span><b>16</b><em>Salen otros 6</em></div>
      <div class="red"><span>Q3</span><b>10</b><em>Pelean la pole</em></div>
    </div>
    <p class="note">${sprints} fines de semana al año tienen sprint: una carrera corta el sábado que da puntos a los 8 primeros.</p>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Los puntos<small>Solo suman los 10 primeros</small></h2></div>
    <div class="ptsbars">${pts.map((p,i)=>`<div><b>${p}</b><i style="height:${Math.round(p/25*140)}px"></i><span>P${i+1}</span></div>`).join("")}</div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Los neumáticos<small>Más agarre, más velocidad, pero se gastan</small></h2></div>
    <div class="tyres">
      <div class="tyrecard">${tyreSVG("#e10600","Blando")}<b>Blando</b><p>El más rápido, dura poco.</p></div>
      <div class="tyrecard">${tyreSVG("#ffd60a","Medio")}<b>Medio</b><p>Equilibrio entre los dos.</p></div>
      <div class="tyrecard">${tyreSVG("#f4f4f2","Duro")}<b>Duro</b><p>Más lento, aguanta más.</p></div>
      <div class="tyrecard">${tyreSVG("#1fa84a","Intermedio")}<b>Intermedio</b><p>Para pista mojada.</p></div>
      <div class="tyrecard">${tyreSVG("#1e6fe0","Lluvia")}<b>Lluvia</b><p>Cuando llueve fuerte.</p></div>
      <div class="tyrecard rulecard"><b>La regla</b><p>En seco, cada piloto usa 2 tipos distintos. Por eso todos paran al menos una vez.</p></div>
    </div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">La parada<small>Cambiar las cuatro ruedas</small></h2></div>
    <div class="facts">
      ${f("m-half red","2-3","s","Cambio de ruedas","Lo que tarda el equipo en poner cuatro neumáticos.")}
      ${f("m-half",80,"km/h","Límite en boxes","Para cuidar a los mecánicos.")}
      ${f("w6",20,"s","Lo que se pierde","Entre entrar, parar y salir. Por eso cada parada se planea.")}
    </div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Banderas<small>Lo que le dicen al piloto</small></h2></div>
    <div class="flags">
      ${[["green","Verde","Pista libre"],["yellow","Amarilla","Peligro, no se adelanta"],["red","Roja","Se detiene todo"],["blue","Azul","Deja pasar al más rápido"],["bw","Blanca y negra","Advertencia"],["black","Negra","Descalificado"],["chk","A cuadros","Fin de la carrera"],["sc","Safety Car","Todos en fila, sin adelantar"]].map(([k,n,d])=>`<div class="flagrow">${k==="sc"?`<span class="scb">SC</span>`:flagSVG(k)}<span><b>${n}</b>${d}</span></div>`).join("")}
    </div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">El auto de ${s.year}<small>Lo que cambió este año</small></h2></div>
    <div class="facts">
      ${f("m-half red","50/50","","Mitad eléctrico","El motor eléctrico pasó de 120 a 350 kW.")}
      ${f("m-half white",768,"kg","Más liviano","32 kg menos que en 2025, con el piloto.")}
      ${f("w6 txt",null,"","Alerones que se mueven","En las rectas se abren para ir más rápido. En las curvas se cierran para tener agarre.")}
      ${f("m-half",100,"%","Combustible sostenible","Todos los equipos lo usan.")}
      ${f("m-half","1,9","m","Más angosto","10 cm menos de ancho, para que sea más ágil.")}
    </div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="bhead"><h2 class="h2">Glosario<small>Palabras que vas a escuchar</small></h2></div>
    <article class="fact w6 glossf"><ol>${gl.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join("")}</ol></article>
  </div></section>

  <section class="block"><div class="wrap">
    <a class="lcta" href="#datos"><span><small>Ya sabes lo básico</small><b class="disp">Datos curiosos</b><span>Récords, campeones y carreras locas</span></span>${ICON.trofeo}</a>
  </div></section>`;
}

/* =========================================================
   ROUTER
   ========================================================= */
function routeLabel(h){
  let m;
  if(h==="inicio")return "Inicio"; if(h==="carreras")return "Carreras"; if(h==="aprende")return "Aprende"; if(h==="datos")return "Datos curiosos";
  if(h==="parrilla")return gridTab==="pilotos"?"Pilotos":"Parrilla";
  if(h==="temporadas")return seasonsMode==="gp"?"Grandes Premios":"Temporadas";
  if((m=/^gp-(\d{4})-(\d+)$/.exec(h))){const s=season(+m[1]);const r=s&&s.races.find(x=>x.r==m[2]);return r?`GP de ${r.name}`:"Carrera"}
  if((m=/^gpx-(.+)$/.exec(h))){const l=(gpIndex()[m[1]]||[]).slice(-1)[0];return l?l.r.name:"Gran Premio"}
  if((m=/^equipo-(.+)$/.exec(h)))return con(m[1]).n;
  if((m=/^piloto-(.+)$/.exec(h)))return last(drv(m[1]).n);
  return "Volver";
}
function back(defHref,defLabel){
  const prev=NAV.length>1?NAV[NAV.length-2]:null;
  const href=prev?"#"+prev:defHref, label=prev?routeLabel(prev):defLabel;
  return `<a class="back" href="${href}">${BACK}<span>${esc(label)}</span></a>`;
}
function route(){
  const h=location.hash.slice(1)||"inicio";
  if(NAV.length>1&&NAV[NAV.length-2]===h)NAV.pop(); else if(NAV[NAV.length-1]!==h)NAV.push(h);
  if(NAV.length>30)NAV=NAV.slice(-30);
  let v=h, html="";
  const m=/^gp-(\d{4})-(\d{1,2})$/.exec(h);
  const gx=/^gpx-([a-z0-9-]+)$/.exec(h);
  if(m){ v="carreras"; html=viewGP(+m[1],+m[2]); }
  else if(gx){ v="temporadas"; html=viewGPX(gx[1]); }
  else if(h==="carreras") html=viewRaces();
  else if(h==="temporadas") html=viewSeasons();
  else if(h==="datos"){ v="aprende"; html=viewFacts(); }
  else if(h==="aprende"){ v="aprende"; html=viewLearn(); }
  else if(h==="parrilla"){ v="parrilla"; html=viewGrid(); }
  else if(/^equipo-[a-z0-9-]+$/.test(h)){ v="parrilla"; html=viewTeam(h.slice(7)); }
  else if(/^piloto-[a-z0-9-]+$/.test(h)){ v="parrilla"; html=viewDriver(h.slice(7)); }
  else { v="inicio"; html=viewHome(); }
  $("#app").innerHTML=`<div class="view on">${html}</div>`;
  document.querySelectorAll("nav.tabs a").forEach(a=>a.classList.toggle("on",a.dataset.v===v));
  if(h==="carreras") bindRaces();
  const yb=document.querySelector(".years"), yo=yb&&yb.querySelector("button.on"); if(yo) yb.scrollLeft=yo.offsetLeft-yb.offsetLeft-(yb.clientWidth-yo.offsetWidth)/2;
  const mw=document.querySelector(".mx-wrap"); if(mw) requestAnimationFrame(()=>mw.scrollLeft=mw.scrollWidth);
  bindCommon();
  tick();
  fitAll();
  window.scrollTo({top:0,behavior:"instant"});
}
function bindCommon(){
  document.querySelectorAll("[data-ry]").forEach(b=>b.onclick=()=>{YEAR=+b.dataset.ry;route()});
  document.querySelectorAll("[data-sy]").forEach(b=>b.onclick=()=>{YEAR=+b.dataset.sy;route()});
  document.querySelectorAll("[data-ny]").forEach(a=>a.addEventListener("click",()=>{YEAR=+a.dataset.ny}));
  document.querySelectorAll("[data-gt]").forEach(b=>b.onclick=()=>{gridTab=b.dataset.gt;route()});
  document.querySelectorAll("[data-sm]").forEach(b=>b.onclick=()=>{seasonsMode=b.dataset.sm;route()});
  document.querySelectorAll("[data-sm-link]").forEach(a=>a.addEventListener("click",()=>{seasonsMode=a.dataset.smLink}));
  document.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{standTab=b.dataset.st;route()});
  document.querySelectorAll("[data-hs]").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("[data-hs]").forEach(x=>x.classList.toggle("on",x===b));
    $("#hstand").innerHTML=$("#hstand-"+b.dataset.hs).innerHTML;});
  document.querySelectorAll("a[href^='#gp-']").forEach(a=>a.addEventListener("click",()=>{const m=/gp-(\d{4})/.exec(a.getAttribute("href"));if(m)YEAR=+m[1]}));
}
window.addEventListener("hashchange",route);
/* ajusta títulos gigantes para que ninguna palabra se corte */
function fitAll(){document.querySelectorAll(".tbig,.gpname,.racedayword,.lbig,.fact .big,.tile .tk,.flagrow b,.glossf b,.mile b.n,.tbox b.n,.tdst b,.week b,.tile b,.ko b,.lbox h3,.tbox b.disp,.tname,.dname b,.tdcard b,.h2,.fact h3,.tyrecard b,.lcta b,.shero .ch b").forEach(el=>{el.style.fontSize="";let fs=parseFloat(getComputedStyle(el).fontSize),n=0;const mn=Math.min(22,fs*.6);while(el.scrollWidth>el.clientWidth+1&&fs>mn&&n<60){fs-=1;n++;el.style.fontSize=fs+"px"}})}
/* reajusta cuando el usuario cambia de vista con el mismo DOM */
window.addEventListener("resize",()=>requestAnimationFrame(fitAll));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fitAll());
setInterval(tick,1000);

function footer(){
  const s=season(CUR_YEAR);
  const upd=LIVE&&LIVE.updated?LIVE.updated:`Datos hasta el GP de ${s.races[lastDone(s)].name} ${s.year}`;
  const rest=LANG==="en"?"Historical results: open f1db database. Live: Jolpica-F1, OpenF1 and Open-Meteo. Layouts: open f1-circuits project. Sector drawings are approximate. Times shown in your time zone. Unofficial fan site."
    :"Resultados históricos: base abierta f1db. En vivo: Jolpica-F1, OpenF1 y Open-Meteo. Trazados: proyecto abierto f1-circuits. Los sectores del dibujo son aproximados. Horas mostradas en tu zona horaria. Sitio de fans, no oficial.";
  $("#foot").innerHTML=`${esc(LANG==="en"?I18N.tr(upd):upd)}. ${LIVE&&LIVE.note?esc(LIVE.note)+" ":""}${rest}`;
}

/* =========================================================
   ARRANQUE
   ========================================================= */
function applyLive(d){
  /* Capa en vivo (documento season/current, schema 2):
     {schema:2, year, updated, note, drivers?, cons?, circuits?,
      races?:{"<ronda>":{...campos de carrera: res, q, pole, sp, fl, ses, start, weather, odds, cancelled...}},
      racesFull?:[...] (temporada nueva que no está en el archivo), ds?, cs?, prog?, progRounds?} */
  try{
    if(!d||d.schema!==2||!d.year) return false;
    if(d.drivers) Object.assign(DATA.drivers,d.drivers);
    if(d.cons) Object.assign(DATA.cons,d.cons);
    if(d.circuits) Object.assign(DATA.circuits,d.circuits);
    const base=DATA.seasons[d.year];
    let s;
    if(Array.isArray(d.racesFull)) s={year:d.year,races:d.racesFull.map(r=>({...r})),ds:[],cs:[],prog:{},progRounds:[]};
    else if(base) s={...base,races:base.races.map(r=>({...r}))};
    else return false;
    if(d.races&&typeof d.races==="object") for(const k in d.races){
      const i=s.races.findIndex(r=>r.r==k);
      if(i>=0) Object.assign(s.races[i],d.races[k]); else s.races.push({r:+k,...d.races[k]});
    }
    s.races.sort((a,b)=>a.r-b.r);
    ["ds","cs","prog","progRounds"].forEach(k=>{if(d[k])s[k]=d[k]});
    LIVE={...s,updated:d.updated,note:d.note};
    if(d.year>CUR_YEAR){CUR_YEAR=d.year;YEAR=d.year}
    return true;
  }catch(e){return false}
}
(async()=>{
  if(typeof I18N!=="undefined")I18N.start();
  document.querySelectorAll("[data-lang]").forEach(b=>{b.classList.toggle("on",b.dataset.lang===LANG);b.setAttribute("aria-pressed",b.dataset.lang===LANG);b.onclick=()=>setLang(b.dataset.lang)});
  try{
    const [a,b]=await Promise.all([fetch("data/f1.json").then(r=>r.json()),fetch("data/tracks.json").then(r=>r.json())]);
    DATA=a; TRACKS=b;
    fetch("data/grid.json").then(r=>r.json()).then(g=>{GRID=g;const h=location.hash.slice(1);if(/^(parrilla|equipo-|piloto-|temporadas|inicio|gp-)/.test(h)||!h)route()}).catch(()=>{});
  }catch(e){ $("#app").innerHTML=`<div class="loading">No se pudieron cargar los datos. Recarga la página.</div>`; if(window.bootReady)bootReady(); return; }
  CUR_YEAR=YEAR=pickCurrent();
  route(); footer();
  if(window.bootReady)bootReady();
  if(window.startLive) startLive();
})();
