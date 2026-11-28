/* =========================================================
   DATOS EN VIVO
   El navegador consulta tres APIs públicas, gratuitas y sin clave:
   - Jolpica-F1 (sucesora de Ergast): resultados, clasificación, sprint y campeonatos.
   - OpenF1: clima real de cada sesión y neumáticos del podio.
   - Open-Meteo: pronóstico del fin de semana.
   Los resultados se guardan en el navegador para no repetir consultas.
   ========================================================= */
(function(){
const API={jol:"https://api.jolpi.ca/ergast/f1",of1:"https://api.openf1.org/v1",om:"https://api.open-meteo.com/v1/forecast"};
const KEY="lightsout-live-v2";
const FRESH=15*60*1000;          // vuelve a consultar cada 15 minutos
const HOUR=36e5, DAY=864e5;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let last=0;
async function get(url){
  // Jolpica permite 4 consultas por segundo: espaciamos las llamadas
  const wait=Math.max(0,last+350-Date.now()); last=Date.now()+wait; if(wait) await sleep(wait);
  for(let i=0;i<3;i++){
    try{
      const r=await fetch(url);
      if(r.status===429){await sleep(1500*(i+1));continue}
      if(!r.ok) return null;
      return await r.json();
    }catch(e){await sleep(800)}
  }
  return null;
}
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}};
const save=c=>{try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}};

/* ---------- traducir ids de la API a los del sitio ---------- */
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z]/g,"");
const slug=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const CON={red_bull:"red-bull",rb:"racing-bulls",racing_bulls:"racing-bulls",alphatauri:"alphatauri",aston_martin:"aston-martin",sauber:"kick-sauber",kick_sauber:"kick-sauber",alfa:"alfa-romeo",haas:"haas",alpine:"alpine"};
function mapper(year,patch){
  const inSeason=new Set();
  [year,year-1].forEach(y=>{const s=DATA.seasons[y];if(s)s.races.forEach(r=>[r.res,r.q,r.sp].forEach(a=>(a||[]).forEach(x=>inSeason.add(x[1]))))});
  if(typeof GRID!=="undefined"&&GRID&&GRID.grid) try{Object.values(GRID.grid).flat().forEach(x=>inSeason.add(x.id||x))}catch(e){}
  const byName={},byFam={},byCode={};
  for(const id in DATA.drivers){const d=DATA.drivers[id];byName[norm(d.n)]=id;
    if(inSeason.has(id)){const f=norm(String(d.n).split(" ").slice(-1)[0]);(byFam[f]=byFam[f]||[]).push(id);if(d.c)(byCode[d.c]=byCode[d.c]||[]).push(id)}}
  const dcache={};
  function drv(D){
    if(!D) return null; if(dcache[D.driverId]) return dcache[D.driverId];
    let id=byName[norm(D.givenName+D.familyName)]||byName[norm(D.givenName.split(" ").slice(-1)[0]+D.familyName)];
    if(!id){const f=byFam[norm(D.familyName)];if(f&&f.length===1)id=f[0]}
    if(!id&&D.code){const c=byCode[D.code];if(c&&c.length===1)id=c[0]}
    if(!id){const alt=D.driverId.replace(/_/g,"-");if(DATA.drivers[alt])id=alt}
    if(!id){ // piloto nuevo
      id=slug(D.givenName+" "+D.familyName);
      const nd={n:D.givenName+" "+D.familyName,c:D.code||D.familyName.slice(0,3).toUpperCase(),nat:"",num:D.permanentNumber?+D.permanentNumber:null,dob:D.dateOfBirth||null};
      DATA.drivers[id]=nd;(patch.drivers=patch.drivers||{})[id]=nd;
    }
    return dcache[D.driverId]=id;
  }
  const byCon={};for(const id in DATA.cons)byCon[norm(DATA.cons[id].n)]=id;
  function con(C,driverId){
    if(!C) return null;
    let id=CON[C.constructorId]; if(id&&!DATA.cons[id]) id=null;
    if(!id){const a=C.constructorId.replace(/_/g,"-");if(DATA.cons[a])id=a}
    if(!id) id=byCon[norm(C.name)]||byCon[norm(C.name.replace(/F1 Team|Racing|Team/gi,""))];
    if(!id&&driverId){ // el equipo con el que corrió ese piloto esta temporada
      const s=season(year);for(let i=s.races.length-1;i>=0&&!id;i--){const x=(s.races[i].res||[]).find(x=>x[1]===driverId);if(x)id=x[2]}
    }
    if(!id){id=slug(C.name);const nc={n:C.name,col:"#8a8a8a"};DATA.cons[id]=nc;(patch.cons=patch.cons||{})[id]=nc}
    return id;
  }
  return {drv,con};
}

/* ---------- formato de filas igual al de data/f1.json ---------- */
const POS={R:"DNF",D:"DSQ",E:"DSQ",W:"DNS",N:"NC",F:"DNQ"};
function rows(list,M){
  const lead=list[0]?+list[0].laps:0;
  return list.map(x=>{
    const d=M.drv(x.Driver),c=M.con(x.Constructor,d);
    const pos=/^\d+$/.test(x.positionText)?x.positionText:(POS[x.positionText]||x.positionText);
    let t=x.Time&&x.Time.time;
    if(!t){const st=x.status||"";
      if(/^\+\d+ Laps?$/i.test(st)||/^lapped$/i.test(st)||st==="Finished"){const n=lead-(+x.laps);t=n>0?`+${n} lap${n>1?"s":""}`:st}
      else t=st}
    return [pos,d,c,t,+x.points||0,+x.grid||0];
  });
}

/* ---------- Jolpica: resultados de una ronda ---------- */
async function jolRound(year,jr,r,M,out){
  const now=Date.now();
  const base=`${API.jol}/${year}/${jr.round}`;
  if(!(r.q&&r.q.length)&&r.quali&&now>Date.parse(r.quali)+HOUR){
    const j=await get(`${base}/qualifying.json?limit=100`);const L=j&&j.MRData.RaceTable.Races[0];
    if(L&&L.QualifyingResults&&L.QualifyingResults.length){
      out.q=L.QualifyingResults.map(x=>{const d=M.drv(x.Driver);return [x.position,d,M.con(x.Constructor,d),x.Q3||x.Q2||x.Q1||""]});
      out.pole=[out.q[0][1],out.q[0][2],out.q[0][3]];
    }
  }
  const spT=(r.ses||[]).find(x=>x[0]==="sprint");
  if(r.sprint&&!(r.sp&&r.sp.length)&&spT&&now>Date.parse(spT[1])+HOUR){
    const j=await get(`${base}/sprint.json?limit=100`);const L=j&&j.MRData.RaceTable.Races[0];
    if(L&&L.SprintResults&&L.SprintResults.length) out.sp=rows(L.SprintResults,M);
  }
  if(!(r.res&&r.res.length)&&now>Date.parse(r.start)+2*HOUR){
    const j=await get(`${base}/results.json?limit=100`);const L=j&&j.MRData.RaceTable.Races[0];
    if(L&&L.Results&&L.Results.length){
      out.res=rows(L.Results,M);
      const f=L.Results.find(x=>x.FastestLap&&x.FastestLap.rank==="1");
      if(f){const d=M.drv(f.Driver);out.fl=[d,M.con(f.Constructor,d),f.FastestLap.Time&&f.FastestLap.Time.time||"",+f.FastestLap.lap||0]}
      out._num={};L.Results.slice(0,3).forEach(x=>out._num[x.number]=M.drv(x.Driver));
    }
  }
}

/* ---------- OpenF1: clima real y neumáticos ---------- */
let OF1S=null;
let OF1T=0;
async function of1Sessions(year,fresh){if(!OF1S||(fresh&&Date.now()-OF1T>10*60e3)){OF1S=await get(`${API.of1}/sessions?year=${year}`)||[];OF1T=Date.now()}return OF1S}
function findSession(list,name,iso){if(!iso)return null;const t=Date.parse(iso);return list.find(s=>s.session_name===name&&Math.abs(Date.parse(s.date_start)-t)<6*HOUR)}
const r1=v=>Math.round(v*10)/10;
function wxArr(w){
  if(!Array.isArray(w)||!w.length) return null;
  const air=w.map(x=>x.air_temperature).filter(Number.isFinite),trk=w.map(x=>x.track_temperature).filter(v=>Number.isFinite(v)&&v>2);
  const hum=w.map(x=>x.humidity).filter(Number.isFinite),wind=w.map(x=>x.wind_speed).filter(Number.isFinite),rain=w.map(x=>x.rainfall?1:0);
  const avg=a=>a.reduce((s,v)=>s+v,0)/(a.length||1);
  if(!air.length) return null;
  return [r1(Math.min(...air)),r1(Math.max(...air)),trk.length?r1(Math.min(...trk)):null,trk.length?r1(Math.max(...trk)):null,Math.round(avg(hum)),Math.round(100*avg(rain)),Math.round(avg(wind)*3.6)];
}
const CMP={SOFT:"S",MEDIUM:"M",HARD:"H",INTERMEDIATE:"I",WET:"W"};
async function of1Round(year,r,out){
  const L=await of1Sessions(year); if(!L.length) return;
  const qT=r.quali,spT=((r.ses||[]).find(x=>x[0]==="sprint")||[])[1];
  const wx={};
  for(const [k,name,iso] of [["race","Race",r.start],["quali","Qualifying",qT],["sprint","Sprint",r.sprint?spT:null]]){
    const s=findSession(L,name,iso); if(!s) continue;
    const a=wxArr(await get(`${API.of1}/weather?session_key=${s.session_key}`)); if(a) wx[k]=a;
    if(k==="race"&&out._num){
      const st=await get(`${API.of1}/stints?session_key=${s.session_key}`)||[];
      const strat={};
      for(const n in out._num){
        const mine=st.filter(x=>String(x.driver_number)===String(n)&&x.lap_end!=null).sort((a,b)=>a.stint_number-b.stint_number);
        if(mine.length) strat[out._num[n]]=mine.map(x=>[CMP[x.compound]||"?",x.lap_end-x.lap_start+1]);
      }
      if(Object.keys(strat).length) out.strat=strat;
    }
  }
  if(wx.race){
    const wet=out.strat&&Object.values(out.strat).some(a=>a.some(x=>x[0]==="I"||x[0]==="W"));
    wx.lap=[wx.race[0],wx.race[1],wx.race[2],wx.race[3],wx.race[5],!!wet];
    out.wx=wx;
  }
}

/* ---------- OpenF1: prácticas y sesiones del fin de semana en curso ---------- */
const OF1CODE={"Practice 1":"fp1","Practice 2":"fp2","Practice 3":"fp3","Sprint Qualifying":"sq","Sprint Shootout":"sq","Qualifying":"quali","Sprint":"sprint"};
function lapTime(sec){if(!Number.isFinite(sec))return "";const m=Math.floor(sec/60),x=sec-m*60;return `${m}:${x.toFixed(3).padStart(6,"0")}`}
function gapTxt(g){if(g==null||g==="")return "";if(typeof g==="number")return `+${g.toFixed(3)}`;return String(g).replace(/LAPS?/i,m=>m.toLowerCase())}
async function of1Weekend(year,r,M,out){
  const now=Date.now(), ses=r.ses||[]; if(!ses.length) return;
  const first=Date.parse(ses[0][1]), race=Date.parse(r.start);
  if(now<first||now>race+6*HOUR) return;           // solo durante el fin de semana
  const L=await of1Sessions(year,true); if(!L.length) return;
  const fp={...(r.fp||{})};
  let drivers=null;
  for(const s of L){
    const code=OF1CODE[s.session_name]; if(!code) continue;
    const t=Date.parse(s.date_start); if(t<first-6*HOUR||t>race+HOUR) continue;
    if(Date.parse(s.date_end||s.date_start)+35*60e3>now) continue;   // OpenF1 libera los datos 30 min después de cada sesión
    const isFP=code.startsWith("fp")||code==="sq";
    if(isFP&&fp[code]&&fp[code].length) continue;
    if(code==="quali"&&r.q&&r.q.length) continue;
    if(code==="sprint"&&(!r.sprint||(r.sp&&r.sp.length))) continue;
    const res=await get(`${API.of1}/session_result?session_key=${s.session_key}`);
    if(!Array.isArray(res)||!res.length) continue;
    if(!drivers){const d=await get(`${API.of1}/drivers?session_key=${s.session_key}`)||[];drivers={};d.forEach(x=>drivers[x.driver_number]=x)}
    const who=n=>{const x=drivers[n];if(!x)return [null,null];
      const id=M.drv({driverId:String(x.name_acronym||n).toLowerCase(),givenName:x.first_name||"",familyName:x.last_name||"",code:x.name_acronym});
      return [id,M.con({constructorId:slug(x.team_name||""),name:x.team_name||""},id)]};
    const sorted=res.filter(x=>x.position!=null).sort((a,b)=>a.position-b.position).concat(res.filter(x=>x.position==null));
    const best=x=>Array.isArray(x.duration)?[...x.duration].reverse().find(v=>v!=null):x.duration;
    const rows=sorted.map((x,i)=>{const [d,c]=who(x.driver_number);if(!d)return null;
      const pos=x.dsq?"DSQ":x.dns?"DNS":x.dnf?"DNF":String(x.position||i+1);
      const val=isFP||code==="quali"?lapTime(best(x)):(i===0?lapTime(x.duration):gapTxt(Array.isArray(x.gap_to_leader)?x.gap_to_leader.at(-1):x.gap_to_leader));
      return [pos,d,c,val,+x.points||0,null]}).filter(Boolean);
    if(!rows.length) continue;
    if(isFP) fp[code]=rows.map(x=>[x[0],x[1],x[2],x[3]]);
    else if(code==="quali"){out.q=rows.map(x=>[x[0],x[1],x[2],x[3]]);out.pole=[rows[0][1],rows[0][2],rows[0][3]]}
    else if(code==="sprint") out.sp=rows;
  }
  if(JSON.stringify(fp)!==JSON.stringify(r.fp||{})) out.fp=fp;
}

/* ---------- Open-Meteo: pronóstico ---------- */
function wxCode(c){
  if(c===0) return ["sol","Despejado"];
  if(c<=2) return ["solnube","Parcialmente nublado"];
  if(c===3) return ["nube","Nublado"];
  if(c===45||c===48) return ["niebla","Niebla"];
  if(c>=51&&c<=57) return ["lluvia","Llovizna"];
  if(c>=61&&c<=67) return ["lluvia","Lluvia"];
  if(c>=71&&c<=77||c===85||c===86) return ["nieve","Nieve"];
  if(c>=80&&c<=82) return ["lluvia","Chubascos"];
  if(c>=95) return ["tormenta","Tormenta"];
  return ["nube","Variable"];
}
async function forecast(r){
  const ci=DATA.circuits[r.circuit]; if(!ci||ci.lat==null) return null;
  const j=await get(`${API.om}?latitude=${ci.lat}&longitude=${ci.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`);
  if(!j||!j.daily) return null;
  const off=(j.utc_offset_seconds||0)*1000, raceDay=new Date(Date.parse(r.start)+off).toISOString().slice(0,10);
  const want=[2,1,0].map(n=>new Date(Date.parse(raceDay)-n*DAY).toISOString().slice(0,10));
  const days=want.map(dt=>{const i=j.daily.time.indexOf(dt);if(i<0)return null;const [k,c]=wxCode(j.daily.weather_code[i]);
    const lab=new Date(dt+"T12:00:00Z").toLocaleDateString(LOC(),{weekday:"long",timeZone:"UTC"});
    return {label:lab[0].toUpperCase()+lab.slice(1),k,c,hi:Math.round(j.daily.temperature_2m_max[i]),lo:Math.round(j.daily.temperature_2m_min[i]),rain:j.daily.precipitation_probability_max[i]}}).filter(Boolean);
  if(!days.length) return null;
  return {src:"Open-Meteo",upd:new Date().toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),days};
}

/* ---------- campeonatos ---------- */
async function standings(year,M,patch,merged){
  const [a,b]=await Promise.all([get(`${API.jol}/${year}/driverstandings.json?limit=100`),get(`${API.jol}/${year}/constructorstandings.json?limit=100`)]);
  const A=a&&a.MRData.StandingsTable.StandingsLists[0],B=b&&b.MRData.StandingsTable.StandingsLists[0];
  const doneRounds=merged.races.filter(r=>r.res&&r.res.length).length;
  const fin=merged.races.every(r=>(r.res&&r.res.length)||r.cancelled);
  if(A&&A.DriverStandings.length&&+A.round>=(DATA.seasons[year].progRounds||[]).length)
    patch.ds=A.DriverStandings.map(x=>{const d=M.drv(x.Driver);const cs=x.Constructors||[];return [d,M.con(cs[cs.length-1],d),+x.points,x.positionText||x.position,fin&&x.position==="1"]});
  if(B&&B.ConstructorStandings.length&&+B.round>=(DATA.seasons[year].progRounds||[]).length)
    patch.cs=B.ConstructorStandings.map(x=>[M.con(x.Constructor),+x.points,x.positionText||x.position,fin&&x.position==="1"]);
  // evolución de puntos de los 8 primeros
  const top=(patch.ds||merged.ds||[]).slice(0,8).map(x=>x[0]);
  const done=merged.races.filter(r=>r.res&&r.res.length);
  if(top.length&&done.length){
    const prog={};top.forEach(id=>{let t=0;prog[id]=done.map(r=>{[r.res,r.sp].forEach(a=>(a||[]).forEach(x=>{if(x[1]===id)t+=+x[4]||0}));return t})});
    patch.prog=prog;patch.progRounds=done.map(r=>r.r);
  }
}

/* ---------- sincronización ---------- */
function syncYear(){
  const now=Date.now();let y=null;
  Object.keys(DATA.seasons).map(Number).sort((a,b)=>a-b).forEach(k=>{if(DATA.seasons[k].races.some(r=>Date.parse(r.start)-10*DAY<now))y=k});
  return y;
}
function apply(patch,note){
  if(!patch) return;
  const prevCur=CUR_YEAR;
  if(applyLive(patch)){
    const c=pickCurrent(); if(c!==CUR_YEAR){ if(YEAR===prevCur)YEAR=c; CUR_YEAR=c; }
    route(); footer();
  }
}
async function sync(force){
  const y=syncYear(); if(!y) return;
  const cache=load();
  if(cache.year===y&&cache.patch) apply(cache.patch);
  const ended=Object.values(DATA.seasons[y].races).some(r=>(r.ses||[]).some(([k,iso])=>{const e=Date.parse(iso)+(k==="race"?2.5:1.2)*HOUR+35*60e3;return e>(cache.t||0)&&e<Date.now()}));
  if(!force&&!ended&&cache.year===y&&Date.now()-(cache.t||0)<FRESH) return;

  const base=DATA.seasons[y];
  const patch={schema:2,year:y,races:{}};
  const old=cache.year===y&&cache.patch&&cache.patch.races||{};
  // lo ya descargado no se vuelve a pedir
  for(const k in old) patch.races[k]=old[k];
  const merged={...base,races:base.races.map(r=>({...r,...(patch.races[r.r]||{})}))};
  const M=mapper(y,patch);
  if(cache.patch&&cache.patch.drivers) Object.assign(DATA.drivers,cache.patch.drivers);
  if(cache.patch&&cache.patch.cons) Object.assign(DATA.cons,cache.patch.cons);

  const sched=await get(`${API.jol}/${y}/races.json?limit=50`);
  const jr=sched?sched.MRData.RaceTable.Races:[];
  const now=Date.now();
  let changed=false;
  for(const r of merged.races){
    if(r.cancelled) continue;
    const t=Date.parse(r.start);
    const j=jr.find(x=>Math.abs(Date.parse(x.date+"T"+(x.time||"12:00:00Z"))-t)<3*DAY);
    const out={};
    if(j){
      // cambios de horario
      if(j.time){const iso=new Date(Date.parse(j.date+"T"+j.time)).toISOString().replace(".000","");if(Math.abs(Date.parse(iso)-t)>60e3&&Math.abs(Date.parse(iso)-t)<3*DAY){out.start=iso;r.start=iso}}
      const firstQ=Math.min(...[(r.quali&&Date.parse(r.quali))||t,...(r.ses||[]).filter(x=>x[0]==="sprint").map(x=>Date.parse(x[1]))]);
      if(firstQ<now+HOUR) await jolRound(y,j,r,M,out);
    }
    // clima real y neumáticos de carreras recientes que aún no los tienen
    if(!r.wx&&(out.res||(r.res&&r.res.length))&&now-t<30*DAY){
      if(!out._num&&j&&r.res){ const jj=await get(`${API.jol}/${y}/${j.round}/results.json?limit=3`);const L=jj&&jj.MRData.RaceTable.Races[0];if(L){out._num={};L.Results.forEach(x=>out._num[x.number]=M.drv(x.Driver))} }
      await of1Round(y,r,out);
    }
    if(!(r.res&&r.res.length)&&!out.res) await of1Weekend(y,{...r,...out},M,out);
    // pronóstico si la carrera es en los próximos 7 días
    if(!(r.res&&r.res.length)&&!out.res&&t>now-3*HOUR&&t-now<7*DAY){const f=await forecast(r);if(f)out.weather=f}
    delete out._num;
    if(Object.keys(out).length){patch.races[r.r]={...(patch.races[r.r]||{}),...out};Object.assign(r,out);changed=true}
  }
  if(!sched&&!changed) return; // sin conexión con la API: se queda con los datos del archivo
  await standings(y,M,patch,merged);
  const lastDoneR=merged.races.filter(r=>r.res&&r.res.length).pop();
  patch.updated=`Datos en vivo${lastDoneR?` hasta el GP de ${lastDoneR.name} ${y}`:""}, consultados ${new Date().toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`;
  save({t:Date.now(),year:y,patch});
  apply(patch);
}
window.startLive=function(){
  sync().catch(()=>{});
  // durante la visita revisa de nuevo cada 15 minutos
  setInterval(()=>{if(!document.hidden)sync().catch(()=>{})},FRESH);
};
})();
