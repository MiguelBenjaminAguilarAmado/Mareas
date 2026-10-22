# 🌊 Mareas

**Diario de ánimo + agenda escolar en una sola página.**
Sin dependencias. Tus datos se quedan en tu dispositivo, y si quieres puedes sincronizarlos entre dispositivos con una cuenta gratuita.

🔗 **Pruébala:** https://miguelbenjaminaguilaramado.github.io/Mareas/

---

## ¿Qué es Mareas?

Mareas es una aplicación web (PWA) para registrar cómo te sientes día a día y, al mismo tiempo, organizar tu vida escolar: horario, asignaturas y profesores. Todo vive en un único `index.html`, funciona sin conexión y se puede instalar en la pantalla de inicio del móvil.

## ✨ Características

### 📓 Diario de ánimo
- **Registro rápido** con cinco niveles de ánimo (Fatal, Mal, Regular, Bien, Genial).
- **Actividades** agrupadas por categorías, con más de 150 iconos propios para crear las tuyas.
- **Escalas de 1 a 5** con niveles con nombre (dolor, energía, estrés, ansiedad, concentración, apetito o las que inventes).
- **Título, notas, fotos y vídeos** en cada entrada.
- **Búsqueda y filtros** por texto, ánimo, actividad o entradas con multimedia.
- **Vista previa** al tocar una entrada, con todos sus datos y un botón para editarla.
- **Fototeca** con todas las fotos y vídeos, por meses, con visor.
- **Fotos desde un ZIP:** asigna las fotos de un .zip a las entradas del mismo día (útil tras importar desde Daylio).

### 📅 Calendario y estadísticas
- Vista de **mes** y vista de **año** día a día, coloreadas según tu ánimo medio, con puntos de color para exámenes, entregas, tareas y clases puntuales pendientes. Al tocar un día ves sus clases, eventos y entradas de ánimo juntos.
- **Inicio** con el resumen del día: registro rápido, avisos, racha, ánimo de los últimos 7 días, clases de hoy, próximos pendientes y objetivos.
- Estadísticas por 7 días, 30 días, 3 meses o año: ánimo medio, rachas, distribución y gráficas.
- **Actividades y ánimo:** cuánto sube o baja tu media según lo que hiciste (muestra relación, no causa).
- Gráficas propias para cada escala.
- **Objetivos** semanales o mensuales (por ejemplo, «ejercicio 3 días por semana») y recordatorio diario opcional.

### 🎓 Agenda escolar
- **Asignaturas** con color, icono, profesor y aula.
- **Profesores** con correo, teléfono y despacho, enlazados a sus asignaturas.
- **Horario semanal** en vista de día o de semana, con aviso de la clase en curso.
- Soporte de **semanas A/B** y de semana de lunes a viernes, sábado o domingo.
- Detección de solapamientos al añadir clases.
- **Faltas y retrasos** por asignatura, con justificantes, porcentaje sobre las clases del curso y aviso al acercarse al máximo permitido.
- **Pomodoro** con ciclos de concentración y descanso, asignatura por sesión, aviso sonoro/vibración/notificación y estadísticas de estudio de los últimos 7 días.
- **Nivel de estrés** estimado a partir de exámenes, entregas y tareas pendientes cruzados con tu ánimo: índice de hoy, previsión de 21 días, resumen por semanas, avisos de acumulación y comparación de tu ánimo en días cargados y tranquilos. Es una estimación orientativa, no un diagnóstico.
- **Agenda** de tareas, exámenes, entregas y clases puntuales, con asignatura, fecha, hora, prioridad, estado de hecho y aviso. Vistas de pendientes, día y semana.
- **Días libres** (Más → Días libres): vacaciones, puentes y festivos, de un solo día o de **varios días seguidos** (campo «Hasta»), o repetidos cada año. En un día libre no hay clases en el horario (vista de día y de semana), no suma a las horas lectivas, no pesa en el nivel de estrés y, si lo eliges, añade una actividad a tus entradas. Se ven marcados en el calendario (mes y año), en el horario, en el inicio y en su propia lista (ahora, próximos y pasados). Los festivos importados también cuentan.
- **Períodos** (Más → Períodos): menú propio, separado de Asignaturas, notas y metas. Trimestres, cuatrimestres o evaluaciones comunes a todas las asignaturas, con estado (terminado, en curso, próximo), media y número de notas. Se pueden crear, editar y eliminar (si no tienen notas).

### 🧠 Estado anímico y conexiones
- **Estado anímico:** análisis de 7 días, 30 días o 3 meses con diagnóstico (nivel, tendencia, estabilidad, rachas bajas, escalas, carga escolar, día más bajo), avisos y pautas concretas para mejorar. Es orientativo, no un diagnóstico clínico.
- **Acciones avanzadas → Conexiones:** vincula una acción (por ejemplo Amigos, también tras importar de Daylio) y, al elegirla en una entrada, se despliega la lista de personas con las que has estado ese día.
- **Marea e Índice de Consistencia:** en lugar de una racha estricta, mide el porcentaje de días con registro en los últimos 30 días móviles. Saltarte un día solo baja el índice unos puntos. Estados: Marea viva, creciente, baja y calma.
- **Acción avanzada Sueño:** al elegir la acción vinculada pregunta horas dormidas, calidad y si te acostaste temprano, tarde o como siempre, y lo analiza junto a tu ánimo (Estadísticas y Estado anímico).
- **Acciones que suben o bajan el estrés:** marca acciones como «+ estrés» o «− estrés» y el nivel de estrés las tiene en cuenta como un ajuste suave.
- **Sub-acciones:** detalle derivado de una acción principal (Ejercicio → Correr, Gimnasio…).
- **Personas:** menú aparte con estadísticas por persona y insights como «¡Estar con Mariano hace que estés un +12% más feliz!» (ánimo con y sin esa persona; muestra relación, no causa).
- **Grafo de relaciones:** menú propio (Más → Grafo de relaciones, y en la barra lateral de pantallas anchas) con una red de personas al estilo del Graph View de Obsidian, dibujada en `canvas`:
  - **Física de fuerzas** en tiempo real: arrastra un nodo y la red se estira y se recoloca de forma elástica. Ajustes de fuerza central, repulsión, fuerza y distancia de enlaces.
  - **Filtros y búsqueda** con sintaxis (`cat:amigo`, `grupo:clase`, `conf:>=4`, `ciudad:`, `pais:`, `tipo:`, `con:` y `-término` para excluir), opción de ocultar personas sin conexiones y de mostrar u ocultar a «Yo».
  - **Grupos como nodos** (rombos unidos a sus miembros) y **co-apariciones** opcionales a partir de tus entradas y eventos.
  - **Grupos de color:** reglas con la misma sintaxis del buscador, cada una con su color; si ninguna coincide, color por categoría o color de cada persona.
  - **Modo local:** solo el entorno de la persona seleccionada, con profundidad de 1 a 5.
  - **Flechas** de dirección en las relaciones, desvanecimiento de texto según el zoom, tamaño de nodos y grosor de enlaces.
  - **Animar evolución:** reproduce cómo fue creciendo tu red desde la primera aparición de cada persona, con barra para recorrer el tiempo.
  - **Interacción:** zoom con rueda o pellizco, desplazamiento arrastrando el fondo, resaltado de vecinos al pasar o seleccionar, doble toque o Alt/Ctrl + clic para abrir la ficha, y lista equivalente accesible bajo el grafo.
  - Los ajustes del grafo se guardan en este dispositivo (no se sincronizan con la nube).

### 📦 Mega-packs
Un único archivo con TODO (entradas, personas, escalas, objetivos, agenda escolar, ajustes y fotos/vídeos). Se importa combinando con tus datos o reemplazándolo todo.

### 👤 Cuenta de Mareas
- **Menú propio** (Más → Cuenta de Mareas, y desde Ajustes) con foto de perfil, nombre, descripción, fecha de inicio y días usando la app.
- Estadísticas rápidas: días registrados, entradas y consistencia de los últimos 30 días.
- Secciones: **Perfil personal**, **Mi recorrido** (rachas, ánimo medio, entradas por mes y actividades más frecuentes), **Personalización**, **Mis datos** (nube, copias y exportación), **Privacidad** y **Desarrollador** (claves MCP).
- El perfil se exporta y se sincroniza con el resto de tus datos.

### 👋 Primer uso
- **Tutorial de bienvenida** de 7 pasos la primera vez que se abre la app (se puede saltar y repetir desde Ajustes).
- La app arranca vacía: ya no incluye entradas ni objetivos de ejemplo.

### 🎨 Apariencia
Seis estilos visuales sobre el mismo código, con diseño adaptado a móvil, tablet vertical y pantallas anchas (iPad horizontal y ordenador: barra lateral, dos columnas y ventanas centradas):

| Estilo | Descripción |
|---|---|
| **Open-Code** | Terminal oscuro en monoespaciada |
| **Minimalista** | Plano y limpio, con animaciones suaves |
| **Lite** | Como Minimalista, pero sin ninguna animación (máximo ahorro) |
| **Liquid Glass** | Cristal translúcido en azul cielo |
| **Android** | Superficies tonales y esquinas suaves |
| **Apple Silicon** | Negro puro, cristal esmerilado y gradientes líquidos (siempre oscuro) |

Además hay tres paletas de ánimo (Marea, Semáforo, Pastel), nombres de nivel personalizables y modo claro/oscuro automático según el dispositivo.

## 🔒 Privacidad y datos

- Todo se guarda en el navegador: `localStorage` para los datos y `IndexedDB` para fotos y vídeos, con una segunda copia interna de seguridad.
- Sin cuenta, no se envía nada a ningún servidor.
- **Nube opcional (Supabase):** con una cuenta, los datos, fotos y vídeos se sincronizan entre tus dispositivos. Cada cuenta solo ve sus propios datos (seguridad a nivel de fila) y no están cifrados de extremo a extremo.
- **Notificaciones** opcionales (Pomodoro, recordatorio diario y agenda). Se piden con el permiso nativo del navegador y solo llegan con la app abierta o en segundo plano.
- **Exportar:** copia JSON, CSV o copia completa con fotos y vídeos.
- **Importar:** copias de Mareas y archivos CSV exportados desde **Daylio**.

> ⚠️ Si borras los datos del sitio o cambias de dispositivo, se perderán. Descarga una copia de seguridad de vez en cuando.

## ☁️ Nube y sincronización

En **Ajustes → Nube y sincronización** puedes crear una cuenta (correo y contraseña) y entrar desde cualquier dispositivo.

- Se sincroniza todo (entradas, actividades, personas, agenda escolar, ajustes…) salvo el estilo visual y las notificaciones de cada dispositivo. Las fotos y los vídeos de hasta 45 MB también suben a tu carpeta privada.
- La sincronización es automática (opcional) y detecta conflictos con un número de revisión: si dos dispositivos cambian a la vez, eliges entre combinar, usar la nube o usar el dispositivo.
- **Combinar** añade lo que falte, pero no propaga borrados ni ediciones de elementos que existen en los dos lados.
- La clave `sb_publishable_…` del código es pública por diseño: lo que protege los datos son las políticas de seguridad a nivel de fila de la base de datos.

**¿Quieres tu propia nube?** Crea un proyecto en [Supabase](https://supabase.com), ejecuta [`supabase/schema.sql`](supabase/schema.sql) en su editor SQL y cambia `SBU` y `SBK` en `index.html`. En *Authentication → URL Configuration* pon la dirección de tu página como *Site URL* para que funcionen los enlaces de confirmación y de recuperación de contraseña.

## 🤖 Conexión MCP (opcional)

Con la nube activada puedes dejar que un asistente de IA compatible con MCP consulte tus entradas, estadísticas, personas, grafo y agenda, y (con una clave de escritura) cree entradas, tareas y conexiones. Las claves se crean y revocan en **Ajustes → Conexión con IA (MCP)**, y antes de cada escritura se guarda una copia. Instrucciones de despliegue en [`supabase/MCP.md`](supabase/MCP.md).

## 🛠️ Tecnología

- HTML, CSS y JavaScript puros, sin frameworks ni librerías.
- Iconos SVG propios en un sprite único.
- Grafo de relaciones con motor de física propio sobre `canvas` (sin librerías).
- Service Worker con caché para funcionar sin conexión y aviso de nueva versión (detecta cambios con ETag, sin releer los archivos).
- Guardado agrupado: varias acciones seguidas escriben una sola vez en `localStorage`, y se fuerza al ocultar o cerrar la página.
- Capa de animaciones común (cascada de entrada, pulsaciones con rebote, barras que crecen, paneles con transición) que respeta «reducir movimiento» del sistema.
- Web App Manifest para la instalación como app.
- Supabase (autenticación, PostgreSQL y Storage) consumido con `fetch`, sin librerías.

## 📁 Estructura del proyecto

```
/                     index.html, style.css, sw.js, manifest.webmanifest, README.md
├─ assets/
│  ├─ icons/          iconos de la app (192 y 512 px)
│  └─ Theme-assets/   imágenes y archivos que necesiten los estilos visuales
├─ themes/            CSS de cada estilo (glass, android, opencode, paper)
├─ i18n/              strings.csv: traducciones (key, es, en, ...)
├─ supabase/          schema.sql, mcp.sql, MCP.md y functions/mareas-mcp/index.ts
└─ dev-tools/         herramientas de desarrollo (no forman parte de la app)
```

`sw.js` y `manifest.webmanifest` deben quedarse en la raíz para que el service worker controle toda la app.

## 👤 Autor

Creado por **Miguel Benjamín Aguilar Amado**.


## Idiomas (traducir con el CSV)

- Las cadenas del código se piden con `t('clave','texto en español')`. El español vive en el código.
- `i18n/strings.csv` tiene una fila por clave y una columna por idioma (`key,es,en,ca,eu,gl,fr,de,pt,it`). La fila `lang.name` da el nombre del idioma. Una celda vacía usa el español.
- Para añadir un idioma, añade una columna con su código (por ejemplo `nl`) y rellénala.
- En Ajustes → Idioma se puede descargar la plantilla actual, importar un CSV para probarlo sin tocar el código y cambiar de idioma.
- Para registrar nuevas cadenas en el CSV, envuélvelas en `t()` y vuelve a generarlo (hay un script de extracción en el repositorio de desarrollo).
- Por ahora solo están traducidos los elementos principales (pestañas, menú Más y títulos de Ajustes); el resto se irá envolviendo en `t()`.
