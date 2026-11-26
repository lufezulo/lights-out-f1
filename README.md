LIGHTS OUT · F1

Cómo publicarlo en Netlify
1. Entra a app.netlify.com y elige "Add new site" y luego "Deploy manually".
2. Arrastra esta carpeta completa (lights-out) a la zona de carga.
3. Listo. Netlify te da un link para compartir.

Cómo se actualiza
El navegador de cada visitante consulta APIs públicas, gratuitas y sin clave:
- Jolpica-F1 (api.jolpi.ca): resultados, clasificación, sprint y campeonatos.
- OpenF1 (api.openf1.org): clima real de cada sesión y neumáticos del podio.
- Open-Meteo (api.open-meteo.com): pronóstico del fin de semana, 7 días antes.
Los datos nuevos se guardan en el navegador y se vuelven a consultar cada 15 minutos.
Si una API no responde, el sitio muestra los datos guardados en data/f1.json.

Archivos
index.html        estructura
css/styles.css    estilos
js/app.js         vistas y navegación
js/live.js        conexión con las APIs
js/i18n.js        traducción al inglés (botón ES / EN)
data/f1.json      historia 2018–2027 (f1db), clima histórico y estrategias
data/tracks.json  trazados de los circuitos
data/grid.json    parrilla, carreras de pilotos y equipos
fonts/            Doto (Archivo se carga desde Google Fonts)
