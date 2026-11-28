/* =========================================================
   IDIOMA · español / inglés
   El sitio se escribe en español. En inglés, cada texto que aparece
   en pantalla se traduce con este diccionario y estas reglas.
   ========================================================= */
let LANG=(()=>{try{const s=localStorage.getItem("lo-lang");if(s==="es"||s==="en")return s}catch(e){}return /^es\b/i.test(navigator.language||"es")?"es":"en"})();
const LOC=()=>LANG==="en"?"en":"es";
const I18N=(()=>{
const GP={"70.º Aniversario":"70th Anniversary","Abu Dabi":"Abu Dhabi","Azerbaiyán":"Azerbaijan","Baréin":"Bahrain","Barcelona-Cataluña":"Barcelona-Catalunya","Bélgica":"Belgium","Brasil":"Brazil","Canadá":"Canada","Emilia-Romaña":"Emilia-Romagna","Francia":"France","Alemania":"Germany","Gran Bretaña":"Great Britain","Hungría":"Hungary","Italia":"Italy","Japón":"Japan","Ciudad de México":"Mexico City","Mónaco":"Monaco","Países Bajos":"Netherlands","Catar":"Qatar","Rusia":"Russia","Arabia Saudita":"Saudi Arabia","Singapur":"Singapore","España":"Spain","Estiria":"Styria","Turquía":"Turkey","Toscana":"Tuscany","Estados Unidos":"United States"};
const GPS={"70.º Aniversario":"70th Anniversary GP","Abu Dabi":"Abu Dhabi GP","Australia":"Australian GP","Austria":"Austrian GP","Azerbaiyán":"Azerbaijan GP","Baréin":"Bahrain GP","Barcelona-Cataluña":"Barcelona-Catalunya GP","Bélgica":"Belgian GP","Brasil":"Brazilian GP","Canadá":"Canadian GP","China":"Chinese GP","Eifel":"Eifel GP","Emilia-Romaña":"Emilia Romagna GP","Francia":"French GP","Alemania":"German GP","Gran Bretaña":"British GP","Hungría":"Hungarian GP","Italia":"Italian GP","Japón":"Japanese GP","Las Vegas":"Las Vegas GP","Ciudad de México":"Mexico City GP","Miami":"Miami GP","Mónaco":"Monaco GP","Países Bajos":"Dutch GP","Portugal":"Portuguese GP","Catar":"Qatar GP","Rusia":"Russian GP","Sakhir":"Sakhir GP","São Paulo":"São Paulo GP","Arabia Saudita":"Saudi Arabian GP","Singapur":"Singapore GP","España":"Spanish GP","Estiria":"Styrian GP","Turquía":"Turkish GP","Toscana":"Tuscan GP","Estados Unidos":"United States GP","Madrid":"Madrid GP"};
const MES={enero:"January",febrero:"February",marzo:"March",abril:"April",mayo:"May",junio:"June",julio:"July",agosto:"August",septiembre:"September",octubre:"October",noviembre:"November",diciembre:"December"};
const gp=x=>GP[x]||x;
const gps=x=>GPS[x]||`${gp(x)} GP`;
const gpNames=Object.keys(GPS).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
const reGP=new RegExp(`GP de (${gpNames})`,"g");
const reGPU=new RegExp(`GP DE (${gpNames.toUpperCase()})`,"g");
const pl=(n,a,b)=>`${n} ${+n===1?a:b}`;

const D={
/* navegación y generales */
"Inicio":"Home","Carreras":"Races","Parrilla":"Grid","Temporadas":"Seasons","Aprende":"Learn","Secciones":"Sections","Lights Out, inicio":"Lights Out, home",
"Volver":"Back","Cargando…":"Loading…","Cargando parrilla…":"Loading grid…","Encendiendo motores…":"Starting engines…",
"No se pudieron cargar los datos. Recarga la página.":"Couldn't load the data. Reload the page.",
"Datos curiosos":"Fun facts","Grandes Premios":"Grands Prix","Gran Premio":"Grand Prix","Carrera":"Race","Pilotos":"Drivers","Equipos":"Teams",
"Temporada":"Season","Carrera anterior":"Previous race","Carrera siguiente":"Next race","Por año":"By year","Por Gran Premio":"By Grand Prix",
"Campeón de pilotos":"Drivers' champion","Carreras disputadas":"Races held","Ganadores distintos":"Different winners",
"Así se fueron sumando los puntos":"How the points added up","Los ocho primeros del campeonato, carrera a carrera":"The championship top eight, race by race",
"Clasificación":"Qualifying","Final":"Final","Campeón":"Champion","pts":"pts","Pts":"Pts","Victorias":"Wins","Poles":"Poles","Podios":"Podiums",
"Ganador de cada carrera":"Winner of each race","Toca una para ver el fin de semana completo":"Tap one to see the full weekend",
"Victorias sprint":"Sprint wins","Sprint":"Sprint","Próxima":"Next","Días":"Days","Horas":"Hours","Min":"Min","Seg":"Sec",
"Ver fin de semana":"See weekend","Próximamente":"Coming soon","Campeón (asegurado) de pilotos":"Drivers' champion (clinched)",
"Temporada por comenzar":"Season yet to start","Calendario":"Calendar","Toca una carrera para ver el circuito":"Tap a race to see the circuit",
"Qué carreras se corrieron cada año y quién las ganó":"Which races were held each year and who won them",
"Ya no se corren":"No longer held","Ganador, con el color de su equipo":"Winner, in their team colour","No se corrió":"Not held","Cambió de circuito":"Changed circuit",
"Amarillo":"Yellow",": nuevo ·":": new ·","rojo":"red",": salió del calendario":": dropped from the calendar",
"Desliza para ir al pasado o al futuro":"Swipe to go back or forward in time","Finalizada":"Finished","Ver resultados":"See results",
"Próxima carrera":"Next race","Longitud":"Length","Vueltas":"Laps","Distancia":"Distance","Curvas":"Corners","Sentido":"Direction","Horario":"Clockwise","Antihorario":"Anticlockwise",
"Tipo":"Type","Permanente":"Permanent","Urbano":"Street","Mixto":"Mixed",
"Último podio":"Latest podium","Resultados completos":"Full results","Campeonato":"Championship",
"Toca una carrera para ver su fin de semana":"Tap a race to see its weekend","Abrir carrusel":"Open carousel",
"Fin de semana de carrera":"Race weekend","Fin de semana en curso":"Weekend in progress","● En vivo hoy":"● Live today","● Hoy":"● Today",
"Ver la temporada completa":"See the full season","Ver pole, clima y probabilidades":"See pole, weather and odds",
"Líder":"Leader","Sin datos":"No data","Sin datos todavía":"No data yet","Hace falta más de una carrera para la gráfica":"The chart needs more than one race",
"No encontramos esa carrera":"We couldn't find that race","No encontramos ese Gran Premio":"We couldn't find that Grand Prix",
"Ese equipo no está en la parrilla actual":"That team isn't on the current grid","Ese piloto no está en la parrilla actual":"That driver isn't on the current grid",
"Trazado no disponible para este circuito":"Layout not available for this circuit","Fuente:":"Source:",
/* aprende */
"¿Primera vez viendo F1?":"First time watching F1?","Aprende lo básico en 5 minutos: equipos, puntos, neumáticos y banderas.":"Learn the basics in 5 minutes: teams, points, tyres and flags.",
"Primera vez aquí":"First time here","F1 desde cero":"F1 from scratch","Lo que necesitas para entender una carrera en 5 minutos.":"What you need to follow a race in 5 minutes.",
"Lo básico":"The basics","Quién compite":"Who races","Cada uno construye su propio auto.":"Each one builds its own car.",
"Pilotos por equipo":"Drivers per team","Compañeros, pero también rivales.":"Teammates, but also rivals.","Autos en la salida":"Cars on the grid","Todos en la misma pista.":"All on the same track.",
"De marzo a diciembre, en 21 países.":"From March to December, in 21 countries.","Título de pilotos":"Drivers' title","Lo gana quien más puntos suma en el año.":"Won by whoever scores the most points in the year.",
"Título de equipos":"Teams' title","Suma los puntos de sus dos pilotos.":"Adds up the points of both drivers.","Conoce la parrilla":"Meet the grid",
"Un fin de semana":"A weekend","Tres días, un Gran Premio":"Three days, one Grand Prix","Vie":"Fri","Sáb":"Sat","Dom":"Sun","Práctica":"Practice",
"Prueban y ajustan el auto":"They test and set up the car","Se decide el orden de salida":"The starting order is decided","Unos 305 km, hora y media":"About 305 km, an hour and a half",
"Así funciona la clasificación":"How qualifying works","Salen los 6 más lentos":"The 6 slowest are out","Salen otros 6":"Another 6 are out","Pelean la pole":"They fight for pole",
"Los puntos":"Points","Solo suman los 10 primeros":"Only the top 10 score","Los neumáticos":"Tyres","Más agarre, más velocidad, pero se gastan":"More grip, more speed, but they wear out",
"Blando":"Soft","El más rápido, dura poco.":"The fastest, doesn't last long.","Medio":"Medium","Equilibrio entre los dos.":"A balance between the two.",
"Duro":"Hard","Más lento, aguanta más.":"Slower, lasts longer.","Intermedio":"Intermediate","Para pista mojada.":"For a damp track.","Lluvia":"Wet","Cuando llueve fuerte.":"For heavy rain.",
"La regla":"The rule","En seco, cada piloto usa 2 tipos distintos. Por eso todos paran al menos una vez.":"In the dry, every driver must use 2 different compounds. That's why everyone stops at least once.",
"La parada":"The pit stop","Cambiar las cuatro ruedas":"Changing all four wheels","Cambio de ruedas":"Wheel change","Lo que tarda el equipo en poner cuatro neumáticos.":"How long the crew takes to fit four tyres.",
"Límite en boxes":"Pit lane limit","Para cuidar a los mecánicos.":"To keep the mechanics safe.","Lo que se pierde":"Time lost","Entre entrar, parar y salir. Por eso cada parada se planea.":"Coming in, stopping and going out. That's why every stop is planned.",
"Banderas":"Flags","Lo que le dicen al piloto":"What they tell the driver","Verde":"Green","Pista libre":"Track clear","Amarilla":"Yellow","Peligro, no se adelanta":"Danger, no overtaking",
"Roja":"Red","Se detiene todo":"Everything stops","Azul":"Blue","Deja pasar al más rápido":"Let the faster car through","Blanca y negra":"Black and white","Advertencia":"Warning",
"Negra":"Black","Descalificado":"Disqualified","A cuadros":"Chequered","Fin de la carrera":"End of the race","Todos en fila, sin adelantar":"Single file, no overtaking",
"Lo que cambió este año":"What changed this year","Mitad eléctrico":"Half electric","El motor eléctrico pasó de 120 a 350 kW.":"The electric motor went from 120 to 350 kW.",
"Más liviano":"Lighter","Alerones que se mueven":"Moving wings","En las rectas se abren para ir más rápido. En las curvas se cierran para tener agarre.":"On the straights they open to go faster. In the corners they close for grip.",
"Combustible sostenible":"Sustainable fuel","Todos los equipos lo usan.":"Every team uses it.","Más angosto":"Narrower",
"Glosario":"Glossary","Palabras que vas a escuchar":"Words you'll hear","El primer lugar de salida":"First place on the grid","El equipo le pide al piloto que entre a cambiar neumáticos":"The team tells the driver to come in for new tyres",
"Parar antes que el rival para pasarlo con neumáticos nuevos":"Stopping before a rival to pass them on fresh tyres","El piloto abandonó y no terminó":"The driver retired and didn't finish",
"Vuelta rápida":"Fastest lap","La vuelta más veloz de la carrera":"The quickest lap of the race","Después de la clasificación casi no se puede tocar el auto":"After qualifying the car can barely be touched",
"Límites de pista":"Track limits","Salirse de las líneas blancas trae sanciones":"Going beyond the white lines brings penalties","Penalización":"Penalty",
"5 o 10 segundos extra, o pasar por los boxes":"5 or 10 extra seconds, or a drive through the pit lane","Ya sabes lo básico":"Now you know the basics",
/* datos curiosos */
"Récords, campeones y carreras locas":"Records, champions and wild races","años":"years","títulos":"titles","Más victorias en la historia":"Most wins ever","Más poles en la historia":"Most poles ever",
"Son los pilotos con más campeonatos del mundo de la historia":"They're the drivers with the most world titles ever","Grandes Premios disputados":"Grands Prix held",
"El final más apretado":"The closest finish","La gran remontada":"The great comeback","Más victorias en un año":"Most wins in a year","Carreras con lluvia":"Wet races",
"Carreras sprint":"Sprint races","Campeones desde 2018":"Champions since 2018",
/* fin de semana */
"Media ganador":"Winner's average","En tu hora local":"In your local time","Quién sale primero":"Who starts first","Pos":"Pos","Piloto":"Driver","Equipo":"Team","Mejor vuelta":"Best lap",
"Clima":"Weather","Pronóstico del fin de semana":"Weekend forecast","El pronóstico aparece en la semana de la carrera, cuando se actualizan los datos el jueves":"The forecast appears in race week, when data is updated on Thursday",
"El pronóstico aparece 7 días antes de la carrera.":"The forecast appears 7 days before the race.","Resultado":"Result","Tiempo":"Time","Así estuvo en la carrera":"What it was like in the race",
"Condición":"Conditions","Seco":"Dry","Neumáticos de seco toda la carrera":"Dry tyres the whole race","Aire":"Air","Pista":"Track","Humedad":"Humidity","Viento":"Wind",
"Datos de los sensores oficiales del circuito durante la carrera.":"Data from the circuit's official sensors during the race.","Estrategia del podio":"Podium strategy","Sin dato":"No data",
"El número es la cantidad de vueltas con cada neumático":"The number is how many laps were done on each tyre","Algo de lluvia":"Some rain","Con lluvia":"Wet","Se usaron neumáticos de lluvia":"Wet-weather tyres were used",
"Fin de semana sprint":"Sprint weekend","Clasif. sprint":"Sprint qualifying","Libres 1":"Practice 1","Libres 2":"Practice 2","Libres 3":"Practice 3",
"Todavía no hay clasificación":"No qualifying yet","La parrilla aparece después de la clasificación":"The grid appears after qualifying","Probabilidades":"Odds","Antes de la carrera":"Before the race","¿Quién gana?":"Who wins?",
"Carrera corta del sábado":"Saturday's short race","Los resultados de la sprint aparecen cuando termine":"Sprint results appear once it's over","Aún no hay carreras para calcular probabilidades":"No races yet to calculate odds",
"Año por año":"Year by year","Toca un año para ver ese fin de semana":"Tap a year to see that weekend","Por correrse":"Yet to run","Semáforo en verde a las":"Lights out at",
/* equipos y pilotos */
"en":"in","puntos":"points","Jefe de equipo":"Team principal","Sede":"Base","Títulos de constructores":"Constructors' titles","Títulos de pilotos":"Drivers' titles","Ganados con este equipo":"Won with this team",
"Victorias en la historia":"All-time wins","Con este nombre desde":"Under this name since","campeonato":"championship","victorias en su carrera":"career wins",
"Posición de cada piloto, carrera por carrera":"Each driver's position, race by race","Victoria":"Win","Podio":"Podium","Puntos":"Points","Sin puntos o abandono":"No points or retired",
"Ficha técnica":"Tech specs","Peso mínimo con piloto":"Minimum weight with driver","Distancia entre ejes máxima":"Maximum wheelbase","Ancho máximo":"Maximum width",
"Motor de combustión":"Combustion engine","Motor eléctrico (MGU-K)":"Electric motor (MGU-K)",
"Alerones delanteros y traseros que se abren en las rectas para bajar la resistencia, y un modo de adelantamiento con energía eléctrica extra para el auto que persigue.":"Front and rear wings that open on the straights to cut drag, and an overtake mode with extra electric power for the chasing car.",
"Todavía ninguno":"None yet","De dónde viene":"Where it comes from","El mismo equipo, con otros nombres a lo largo del tiempo":"The same team, under other names over time",
"Papaya":"Papaya","Flechas plateadas":"Silver Arrows","Azul y rosa":"Blue and pink","Desde Milton Keynes":"From Milton Keynes","Bandera americana":"American flag","La Scuderia":"The Scuderia",
"Verde británico":"British racing green","El equipo hermano":"The sister team","Flavio Briatore (asesor ejecutivo)":"Flavio Briatore (executive adviser)",
"Fishers (EE. UU.) y Silverstone (Reino Unido)":"Fishers (USA) and Silverstone (UK)","Kannapolis, EE. UU.":"Kannapolis, USA",
"sigla":"code","Hitos":"Milestones","A qué edad, con qué equipo y en qué año":"At what age, with which team and in which year","Debut":"Debut","Primera victoria":"First win","Todavía no gana":"No wins yet",
"Primer título mundial":"First world title","Todavía no es campeón":"Not a champion yet","Posición":"Position","Promedio de llegada":"Average finish","Carrera a carrera":"Race by race",
"Veces que terminó por delante en las sesiones en que corrieron juntos.":"Times they finished ahead in sessions where both took part.","Su carrera en F1":"F1 career","Títulos mundiales":"World titles",
"Podios y poles":"Podiums and poles","Edad al cerrar la temporada":"Age at the end of the season","También corrieron con el equipo en 2026:":"Also raced for the team in 2026:",
/* clima en vivo */
"Prácticas":"Practice","Mejor vuelta de cada piloto":"Each driver's best lap","Los tiempos aparecen unos minutos después de que termine cada sesión.":"Times appear a few minutes after each session ends.","Ver tiempos":"See times","Ver todos":"Show all","Ver menos":"Show less","Clasificación":"Qualifying",
"Despejado":"Clear","Parcialmente nublado":"Partly cloudy","Nublado":"Cloudy","Niebla":"Fog","Llovizna":"Drizzle","Nieve":"Snow","Chubascos":"Showers","Tormenta":"Thunderstorm","Variable":"Changeable",
/* motivos de abandono */
"Rueda":"Wheel","Motor":"Engine","Hidráulica":"Hydraulics","Frenos":"Brakes","Transmisión":"Transmission","Eléctrico":"Electrical","Caja de cambios":"Gearbox","Pinchazo":"Puncture","Accidente":"Accident",
"Colisión":"Collision","Fuga de aceite":"Oil leak","Daños por colisión":"Collision damage","Escape":"Exhaust","Suspensión":"Suspension","Presión de combustible":"Fuel pressure","Unidad de potencia":"Power unit",
"Pérdida de potencia":"Power loss","Embrague":"Clutch","Mecánico":"Mechanical","Batería":"Battery","Presión de agua":"Water pressure","Sobrecalentamiento":"Overheating","Daños por accidente":"Accident damage",
"Palier":"Driveshaft","Abandono":"Retired","Trompo":"Spun off","Retirado":"Withdrew","Tuerca de rueda":"Wheel nut","Presión de aceite":"Oil pressure","Electrónica":"Electronics","Sin neumáticos":"Tyre shortage",
"Radiador":"Radiator","Fuga de refrigerante":"Coolant leak","Sistema de combustible":"Fuel system","Neumático":"Tyre","Fuga de agua":"Water leak","Alerón trasero":"Rear wing","Daños por pinchazo":"Puncture damage",
"Accidente en la clasificación":"Accident in qualifying","Fuga de combustible":"Fuel leak","Alerón delantero":"Front wing","Vibraciones":"Vibrations","Bomba de combustible":"Fuel pump","Fondo plano":"Floor",
"Dirección":"Steering","Indispuesto":"Unwell","Coche bajo el peso mínimo":"Car underweight","Coche dañado en la clasificación":"Car damaged in qualifying","Ayuda externa":"Outside assistance",
"Desgaste ilegal del patín":"Illegal skid block wear","Acelerador":"Throttle","Lesión":"Injury","Manejo":"Handling","Problema en boxes":"Pit stop issue","Interruptor de seguridad":"Safety switch",
"Enfermedad":"Illness","Fondo plano ilegal":"Illegal floor","Incendio":"Fire","Muestra de combustible":"Fuel sample","Neumática":"Pneumatics","No tomó la salida":"Did not start","Refrigeración":"Cooling",
"Reparto de frenada":"Brake balance","Restos en pista":"Debris","Seguridad":"Safety","Semieje":"Half-shaft","Técnico":"Technical"
};

/* reglas para textos con números o nombres */
const R=[
[/^Datos (en vivo )?hasta el GP de (.+?) (\d{4})(, consultados (.+))?$/,(m)=>`${m[1]?"Live data":"Data"} up to the ${gps(m[2])} ${m[3]}${m[5]?`, checked ${m[5]}`:""}`],
[/^GP de (.+?): (\d+)$/,m=>`${gps(m[1])}: ${m[2]}`],
[/^GP de (.+?): no corrió$/,m=>`${gps(m[1])}: didn't race`],
[/^GP de (.+?): (DNF|DNS|DSQ|NC|DNQ)$/,m=>`${gps(m[1])}: ${m[2]}`],
[/^(\d+) vueltas, vuelta rápida de (.+) \((.+)\)$/,m=>`${m[1]} laps, fastest lap by ${m[2]} (${m[3]})`],
[/^(\d+) vueltas, puntos para los (\d+) primeros$/,m=>`${m[1]} laps, points for the top ${m[2]}`],
[/^(\d{4}): (.+) en (.+?)( \(cambió de circuito\))?$/,m=>`${m[1]}: ${m[2]} at ${m[3]}${m[4]?" (changed circuit)":""}`],
[/^(\d{4}): (.+), por correrse$/,m=>`${m[1]}: ${m[2]}, yet to run`],
[/^En la clasificación: aire de (.+?) °C y pista de (.+?) °C\.$/,m=>`In qualifying: air ${m[1]} °C and track ${m[2]} °C.`],
[/^Última sesión: (.+)$/,m=>`Latest session: ${D[m[1]]||m[1]}`],
[/^Ronda (\d+), GP de (.+)$/,m=>`Round ${m[1]}, ${gps(m[2])}`],
[/^Ronda (\d+) de (\d+)$/,m=>`Round ${m[1]} of ${m[2]}`],
[/^(Duro|Medio|Blando|Intermedio|Lluvia|Sin dato): (\d+) vueltas?$/,m=>`${D[m[1]]}: ${pl(m[2],"lap","laps")}`],
[/^y (\d+) días$/,m=>`and ${pl(m[1],"day","days")}`],
[/^(.+)\. Pole de (.+)$/,m=>`${m[1]}. Pole by ${m[2]}`],
[/^Trazado de (.+) por sectores$/,m=>`${m[1]} layout by sector`],
[/^(\d+) vueltas?$/,m=>pl(m[1],"lap","laps")],
[/^([\d.,]+) puntos$/,m=>pl(m[1],"point","points")],
[/^([\d.,]+) puntos, ([\d.,]+) en sprints$/,m=>`${m[1]} points, ${m[2]} in sprints`],
[/^(.+) · (\d+) pts$/,m=>`${m[1]} · ${m[2]} pts`],
[/^Contra su compañero, (.+)$/,m=>`Against teammate ${m[1]}`],
[/^Ver a (.+)$/,m=>`See ${m[1]}`],
[/^Desde el GP de (.+?) (\d{4})$/,m=>`Since the ${gps(m[1])} ${m[2]}`],
[/^La primera: GP de (.+?) (\d{4})$/,m=>`The first: ${gps(m[1])} ${m[2]}`],
[/^(\d+) podios, (\d+) poles$/,m=>`${pl(m[1],"podium","podiums")}, ${pl(m[2],"pole","poles")}`],
[/^(\d+) podios y (\d+) poles$/,m=>`${pl(m[1],"podium","podiums")} and ${pl(m[2],"pole","poles")}`],
[/^(\d+) podios$/,m=>pl(m[1],"podium","podiums")],
[/^Más victorias: (.+) \((\d+)\)$/,m=>`Most wins: ${m[1]} (${m[2]})`],
[/^\+(\d+) vueltas?$/,m=>`+${pl(m[1],"lap","laps")}`],
[/^\+(\d+) laps?$/,m=>`+${pl(m[1],"lap","laps")}`],
[/^Auto de (.+) (\d{4})$/,m=>`${m[1]} ${m[2]} car`],
[/^Su mejor resultado: P(\d+) en (.+) (\d{4})$/,m=>`Best result: P${m[1]} in ${gp(m[2])} ${m[3]}`],
[/^Mejor: P(\d+) en (.+) (\d{4})$/,m=>`Best: P${m[1]} in ${gp(m[2])} ${m[3]}`],
[/^Mejor resultado: P(\d+)$/,m=>`Best result: P${m[1]}`],
[/^Con (.+)$/,m=>`With ${m[1]}`],
[/^No se corrió en (\d+)$/,m=>`Not held in ${m[1]}`],
[/^(\d+) Grandes Premios disputados$/,m=>`${m[1]} Grands Prix entered`],
[/^Evolución de puntos (\d+)$/,m=>`Points progression ${m[1]}`],
[/^(\d+) abandonos?$/,m=>pl(m[1],"retirement","retirements")],
[/^(\d+) paradas?$/,m=>pl(m[1],"stop","stops")],
[/^(\d+) parada$/,m=>pl(m[1],"stop","stops")],
[/^(.+), ([\d.,]+) puntos\. Campeón (asegurado )?de constructores: (.+)$/,m=>`${m[1]}, ${m[2]} points. Constructors' champion${m[3]?" (clinched)":""}: ${m[4]}`],
[/^(\d+) ediciones? desde (\d+)(, en (\d+) circuitos distintos)?$/,m=>`${pl(m[1],"edition","editions")} since ${m[2]}${m[3]?`, at ${m[4]} different circuits`:""}`],
[/^(\d+) edición desde (\d+)$/,m=>`${pl(m[1],"edition","editions")} since ${m[2]}`],
[/^Puntos de ventaja sobre (.+)$/,m=>`Points ahead of ${m[1]}`],
[/^Último: (\d+)$/,m=>`Last: ${m[1]}`],
[/^(\d+)–hoy$/,m=>`${m[1]}–today`],
[/^(.+) · (\d+) años$/,m=>`${m[1]} · ${m[2]} years old`],
[/^Victorias de (.+)$/,m=>`${m[1]}'s wins`],
[/^Última vez en (\d+)$/,m=>`Last held in ${m[1]}`],
[/^Sector (\d)$/,m=>`Sector ${m[1]}`],
[/^Nuevo desde (\d+)$/,m=>`New since ${m[1]}`],
[/^Vuelve en (\d+)$/,m=>`Returns in ${m[1]}`],
[/^Sale tras (\d+)$/,m=>`Leaves after ${m[1]}`],
[/^Solo en (\d+)$/,m=>`Only in ${m[1]}`],
[/^En el calendario (\d+)$/,m=>`On the ${m[1]} calendar`],
[/^Libres (\d)$/,m=>`Practice ${m[1]}`],
[/^Temporada (\d+)\. Ganó (\d+) en total$/,m=>`${m[1]} season. Won ${m[2]} in total`],
[/^Temporada (\d+), asegurado en el GP de (.+)$/,m=>`${m[1]} season, clinched at the ${gps(m[2])}`],
[/^Temporada (\d+)$/,m=>`${m[1]} season`],
[/^(\d+) \(asegurado\)$/,m=>`${m[1]} (clinched)`],
[/^Calendario (\d+)$/,m=>`${m[1]} calendar`],
[/^(\d+) titulares y (\d+) de reserva$/,m=>`${m[1]} race drivers and ${m[2]} reserve`],
[/^Desde (\d+)\. Elige un año$/,m=>`Since ${m[1]}. Pick a year`],
[/^Después de (\d+) carreras?$/,m=>`After ${pl(m[1],"race","races")}`],
[/^(\d+) carreras$/,m=>pl(m[1],"race","races")],
[/^(\d+) carreras y (\d+) sprints\.(.*)$/,m=>`${m[1]} races and ${m[2]} sprints.${m[3].replace(/Vuelven (.+?)\./,(_,x)=>`${x.split(/, | y /).map(gp).join(", ").replace(/, ([^,]+)$/," and $1")} return.`).replace(/Salen (.+?)\./,(_,x)=>`${x.split(/, | y /).map(gp).join(", ").replace(/, ([^,]+)$/," and $1")} drop out.`)}`],
[/^(\d+) con sprint\. Arranca el (.+) en (.+)\.$/,m=>`${m[1]} with a sprint. Starts ${m[2]} in ${gp(m[3])}.`],
[/^Parrilla (\d+)$/,m=>`${m[1]} grid`],
[/^(\d+) equipos y (\d+) pilotos en la última carrera$/,m=>`${m[1]} teams and ${m[2]} drivers in the latest race`],
[/^(.+) · motor (.+)$/,m=>`${m[1]} · ${m[2]} engine`],
[/^Carreras en (\d+)$/,m=>`Races in ${m[1]}`],
[/^Abrir (\d+)$/,m=>`Open ${m[1]}`],
[/^(\d+) fines de semana al año tienen sprint: una carrera corta el sábado que da puntos a los (\d+) primeros\.$/,m=>`${m[1]} weekends a year have a sprint: a short Saturday race that gives points to the top ${m[2]}.`],
[/^El auto de (\d+)$/,m=>`The ${m[1]} car`],
[/^(\d+) kg menos que en (\d+), con el piloto\.$/,m=>`${m[1]} kg less than in ${m[2]}, including the driver.`],
[/^(\d+) cm menos de ancho, para que sea más ágil\.$/,m=>`${m[1]} cm narrower, to make it more agile.`],
[/^Récords de toda la historia y de las temporadas (\d+)–(\d+)$/,m=>`All-time records and from the ${m[1]}–${m[2]} seasons`],
[/^(.+) es el piloto con más victorias de la historia$/,m=>`${m[1]} has more wins than any driver in history`],
[/^Le siguen (.+) con (\d+) y (.+) con (\d+)$/,m=>`Followed by ${m[1]} with ${m[2]} and ${m[3]} with ${m[4]}`],
[/^(.+), el campeón más joven$/,m=>`${m[1]}, the youngest champion`],
[/^Se aseguró el título de (\d+) en el GP de (.+) con (\d+) años y (\d+) días$/,m=>`Clinched the ${m[1]} title at the ${gps(m[2])} aged ${m[3]} years and ${m[4]} days`],
[/^(.+) y (.+), los reyes$/,m=>`${m[1]} and ${m[2]}, the kings`],
[/^(.+), el ganador más joven$/,m=>`${m[1]}, the youngest winner`],
[/^Ganó en (\d+) con (\d+) años\. Segundo: (.+), con (\d+) años en (\d+)$/,m=>`Won in ${m[1]} aged ${m[2]}. Second: ${m[3]}, aged ${m[4]} in ${m[5]}`],
[/^Desde el primero: Gran Bretaña, (\d+), ganado por (.+)$/,m=>`Since the first: Great Britain, ${m[1]}, won by ${m[2]}`],
[/^La carrera más rápida desde (\d+)$/,m=>`The fastest race since ${m[1]}`],
[/^Media del ganador en el GP de (.+?) (\d{4}): (.+)$/,m=>`Winner's average at the ${gps(m[1])} ${m[2]}: ${m[3]}`],
[/^(.+) le ganó a (.+) en el GP de (.+?) (\d{4})$/,m=>`${m[1]} beat ${m[2]} at the ${gps(m[3])} ${m[4]}`],
[/^(.+) salió (\d+)\.º y ganó el GP de (.+?) (\d{4})$/,m=>`${m[1]} started ${m[2]}th and won the ${gps(m[3])} ${m[4]}`],
[/^de (\d+)$/,m=>`of ${m[1]}`],
[/^(.+) en (\d{4}), el récord desde (\d+)$/,m=>`${m[1]} in ${m[2]}, the record since ${m[3]}`],
[/^Desde (\d+)\. La más reciente: (.+) (\d{4})\.$/,m=>`Since ${m[1]}. The most recent: ${gp(m[2])} ${m[3]}.`],
[/^Ganadores distintos en (\d+)$/,m=>`Different winners in ${m[1]}`],
[/^La temporada más repartida desde (\d+)$/,m=>`The most open season since ${m[1]}`],
[/^Disputadas desde que se estrenaron en (\d+)$/,m=>`Held since their debut in ${m[1]}`],
[/^(.+) es el circuito más corto$/,m=>`${m[1]} is the shortest circuit`],
[/^(.+) km por vuelta\. El más largo es (.+), con (.+) km$/,m=>`${m[1]} km per lap. The longest is ${m[2]}, at ${m[3]} km`],
[/^Más puntos desde (\d+)$/,m=>`Most points since ${m[1]}`],
[/^(.+) es quien más ha sumado en carreras de Gran Premio en este periodo$/,m=>`${m[1]} has scored the most in Grand Prix races in this period`],
[/^Campeones desde (\d+)$/,m=>`Champions since ${m[1]}`],
[/^Este GP desde (\d+)$/,m=>`This GP since ${m[1]}`],
[/^Estimación propia según los resultados de las últimas (\d+) carreras\. No son cuotas de apuestas\.$/,m=>`Our own estimate based on the last ${m[1]} races. These aren't betting odds.`],
[/^La parrilla aparece después de la clasificación, el (.+)$/,m=>`The grid appears after qualifying, on ${m[1]}`],
[/^Se llamaba GP de (.+) hasta (\d+)$/,m=>`Called the ${gps(m[1])} until ${m[2]}`],
[/^en (\d+)$/,m=>`in ${m[1]}`],
[/^victorias en (\d+)$/,m=>`wins in ${m[1]}`],
[/^Auto (\d+)$/,m=>`${m[1]} car`],
[/^V6 turbo híbrido de 1,6 litros$/,()=>"1.6-litre V6 turbo hybrid"],
[/^Medidas del reglamento (\d+), iguales para los (\d+) equipos$/,m=>`${m[1]} regulation dimensions, the same for all ${m[2]} teams`],
[/^Lo nuevo de (\d+)$/,m=>`New for ${m[1]}`],
[/^También corrieron con el equipo en (\d+):$/,m=>`Also raced for the team in ${m[1]}:`],
[/^Debut de (.+)$/,m=>`${m[1]}'s debut`],
[/^Desde (\d+)$/,m=>`Since ${m[1]}`],
[/^El equipo número (\d+)$/,m=>`Team number ${m[1]}`],
[/^(.+)\. Nació en (.+) el ([A-Z][a-z]+ \d+) de (\d+)$/,m=>`${m[1]}. Born in ${m[2]} on ${m[3]}, ${m[4]}`],
[/^(.+)\. Nació en (.+) el (\d+) de (\w+) de (\d+)$/,m=>`${m[1]}. Born in ${m[2]} on ${MES[m[4]]||m[4]} ${m[3]}, ${m[5]}`],
[/^(.+?)\. Semáforo en verde a las (.+)$/,m=>`${m[1]}. Lights out at ${m[2]}`],
[/^Última carrera del año, (.+)$/,m=>`Last race of the year, ${m[1]}`],
[/^(.+), (Reino Unido|Italia|Suiza|Alemania|Francia|EE\. UU\.)$/,m=>`${m[1]}, ${{"Reino Unido":"United Kingdom","Italia":"Italy","Suiza":"Switzerland","Alemania":"Germany","Francia":"France","EE. UU.":"USA"}[m[2]]}`]
];
function tr(s){
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s); const core=m[2]; if(!core) return s;
  if(D[core]!=null) return m[1]+D[core]+m[3];
  for(const [re,f] of R){const x=re.exec(core); if(x) return m[1]+f(x)+m[3];}
  const out=core.replace(reGP,(_,x)=>gps(x)).replace(/GP de ([A-ZÀ-Ý][^\s,.:;()\d]*(?: [A-ZÀ-Ý][^\s,.:;()\d]*)*)/g,"$1 GP").replace(reGPU,(_,x)=>gps(Object.keys(GPS).find(k=>k.toUpperCase()===x)||x).toUpperCase());
  return m[1]+out+m[3];
}
for(const k in GP)if(D[k]==null)D[k]=GP[k];
const ATTR=["aria-label","alt","title"];
function run(root){
  if(LANG!=="en"||!root) return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){const p=n.parentElement;if(!p||p.closest("script,style,[data-notr]"))continue;
    const v=n.nodeValue;if(!/[a-záéíóúñ]/i.test(v))continue;const t=tr(v);if(t!==v)n.nodeValue=t}
  root.querySelectorAll("[aria-label],[alt],[title]").forEach(e=>ATTR.forEach(a=>{const v=e.getAttribute(a);if(v){const t=tr(v);if(t!==v)e.setAttribute(a,t)}}));
}
function fix(n){if(n.nodeType===3){const p=n.parentElement;if(!p||p.closest("script,style"))return;const v=n.nodeValue;if(/[a-záéíóúñ]/i.test(v)){const t=tr(v);if(t!==v)n.nodeValue=t}}else if(n.nodeType===1)run(n)}
let busy=false;
const obs=new MutationObserver(recs=>{if(LANG!=="en"||busy)return;busy=true;let big=false;
  try{for(const r of recs){if(r.type==="characterData")fix(r.target);else r.addedNodes.forEach(n=>{fix(n);if(n.nodeType===1&&n.childElementCount>3)big=true})}}finally{obs.takeRecords();busy=false}
  if(big&&typeof fitAll==="function")requestAnimationFrame(fitAll)});
function start(){if(LANG!=="en")return;run(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true})}
return {tr,run,start,gp};
})();
function setLang(l){
  if(l===LANG) return;
  try{localStorage.setItem("lo-lang",l)}catch(e){}
  location.reload();
}
document.documentElement.lang=LANG;
