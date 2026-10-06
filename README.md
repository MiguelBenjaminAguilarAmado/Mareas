# 🌊 Mareas

**Diario de ánimo + agenda escolar en una sola página.**
Sin servidor, sin dependencias, sin cuentas. Tus datos se quedan en tu dispositivo.

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

### 🧠 Estado anímico y conexiones
- **Estado anímico:** análisis de 7 días, 30 días o 3 meses con diagnóstico (nivel, tendencia, estabilidad, rachas bajas, escalas, carga escolar, día más bajo), avisos y pautas concretas para mejorar. Es orientativo, no un diagnóstico clínico.
- **Acciones avanzadas → Conexiones:** vincula una acción (por ejemplo Amigos, también tras importar de Daylio) y, al elegirla en una entrada, se despliega la lista de personas con las que has estado ese día.
- **Sub-acciones:** detalle derivado de una acción principal (Ejercicio → Correr, Gimnasio…).
- **Personas:** menú aparte con estadísticas por persona y insights como «¡Estar con Mariano hace que estés un +12% más feliz!» (ánimo con y sin esa persona; muestra relación, no causa).

### 📦 Mega-packs
Un único archivo con TODO (entradas, personas, escalas, objetivos, agenda escolar, ajustes y fotos/vídeos). Se importa combinando con tus datos o reemplazándolo todo.

### 🎨 Apariencia
Cinco estilos visuales sobre el mismo código, con diseño adaptado a móvil, tablet vertical y pantallas anchas (iPad horizontal y ordenador: barra lateral, dos columnas y ventanas centradas):

| Estilo | Descripción |
|---|---|
| **Open-Code** | Terminal oscuro en monoespaciada |
| **Minimalista** | Plano y muy rápido, sin efectos |
| **Liquid Glass** | Cristal translúcido en azul cielo |
| **Android** | Superficies tonales y esquinas suaves |
| **Apple Silicon** | Negro puro, cristal esmerilado y gradientes líquidos (siempre oscuro) |

Además hay tres paletas de ánimo (Marea, Semáforo, Pastel), nombres de nivel personalizables y modo claro/oscuro automático según el dispositivo.

## 🔒 Privacidad y datos

- Todo se guarda en el navegador: `localStorage` para los datos y `IndexedDB` para fotos y vídeos, con una segunda copia interna de seguridad.
- No se envía nada a ningún servidor.
- **Notificaciones** opcionales (Pomodoro, recordatorio diario y agenda). Se piden con el permiso nativo del navegador y solo llegan con la app abierta o en segundo plano.
- **Exportar:** copia JSON, CSV o copia completa con fotos y vídeos.
- **Importar:** copias de Mareas y archivos CSV exportados desde **Daylio**.

> ⚠️ Si borras los datos del sitio o cambias de dispositivo, se perderán. Descarga una copia de seguridad de vez en cuando.

## 🛠️ Tecnología

- HTML, CSS y JavaScript puros, sin frameworks ni librerías.
- Iconos SVG propios en un sprite único.
- Service Worker con caché para funcionar sin conexión.
- Web App Manifest para la instalación como app.

## 👤 Autor

Creado por **Miguel Benjamín Aguilar Amado**.
