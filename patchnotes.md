# 🌊 MAREAS v12 — PATCH NOTES
### Más control, estudio inteligente y una experiencia personal más completa.

## 👥 Entradas y personas

- **Búsqueda de personas:** al crear o editar una entrada, se podrá buscar personas para vincularlas a ella.
- **Añadir grupos completos:** se podrá seleccionar un grupo de personas y vincular a todos sus integrantes a una misma entrada, sin tener que agregarlos uno por uno.

## 🔐 Nuevo sistema de bloqueo mediante PIN

Se incorpora la posibilidad de proteger Mareas con un PIN configurable desde los ajustes. Habrá tres modos de funcionamiento:

### 1. Sin PIN
La aplicación funcionará como hasta ahora, sin solicitar ningún código para acceder.

### 2. Semi-PIN
Permite consultar información limitada sin desbloquear completamente la aplicación.

Sin introducir el PIN, el usuario podrá:
- Consultar la agenda.
- Consultar el apartado de estado anímico, mostrando únicamente el estado de ánimo registrado.

Quedarán bloqueadas las demás funciones que requieran acceso completo. En el apartado de ánimo no se mostrarán las notas ni la frase del día.

Para acceder al resto de la aplicación y editar información será necesario introducir el PIN.

### 3. PIN
Al abrir la aplicación, se solicitará el PIN antes de permitir el acceso a su contenido.

## 📚 Sesión de estudio avanzada

Se incorpora un nuevo sistema de planificación del estudio que organizará automáticamente las actividades académicas según la agenda, los plazos y la información disponible sobre las tareas.

### Planificación inteligente
La sesión de estudio avanzada seleccionará actividades y asignaturas que convenga preparar, teniendo en cuenta factores como:

- La proximidad de la fecha de entrega de una tarea.
- Los exámenes próximos.
- La prioridad de cada actividad.
- El tiempo estimado necesario para completar las tareas, cuando existan datos suficientes.
- El tiempo disponible para estudiar durante la sesión.

El objetivo será priorizar las actividades más urgentes y organizar el tiempo de estudio de manera útil y realista.

### Integración con Pomodoro
La sesión de estudio avanzada estará vinculada al sistema Pomodoro existente. Los ciclos de trabajo y descanso seguirán el mismo funcionamiento, integrando la planificación académica con las sesiones de concentración.

### Duración configurable
El usuario podrá elegir cuántas horas quiere estudiar en una sesión avanzada.

También podrá añadir «Hora de estudio» al horario. Cuando llegue ese momento, Mareas preguntará desde la página principal si se desea iniciar una sesión de estudio avanzada y enviará una notificación para recordarlo, siempre que las notificaciones estén disponibles y autorizadas.

### Aprendizaje a partir del tiempo empleado
Cuando una tarea no tenga suficiente información para estimar su duración, la aplicación utilizará una estimación inicial provisional.

Por ejemplo, si hay una tarea de Filosofía para mañana, una tarea de Lengua con prioridad alta para dentro de una semana y un examen de Inglés para el martes siguiente, la sesión priorizará inicialmente Filosofía por su proximidad.

Si no dispone de datos suficientes para estimar el tiempo necesario, podrá asignarle una hora inicial de estudio.

Cuando el usuario termine la tarea, Mareas registrará el tiempo empleado y la información disponible sobre ella. Con suficientes datos históricos, podrá calcular estimaciones más ajustadas para tareas similares.

Estas estimaciones permitirán planificar mejor las siguientes sesiones y calcular de forma aproximada cuánto trabajo se puede completar durante el tiempo disponible.

## 📝 Menú de notas del parche

Se incorporará un menú específico para consultar las notas de los parches de Mareas.

- Permitirá acceder a las notas de las distintas versiones de la aplicación.
- Las notas estarán organizadas por versión para facilitar la consulta de cambios, mejoras y correcciones.
- El usuario podrá revisar las novedades sin tener que buscarlas fuera de Mareas.

## 🌐 Implementación de idiomas

Se incorporará un sistema de idiomas para permitir que Mareas pueda utilizarse en diferentes lenguas.

- Se preparará una estructura de traducciones centralizada para facilitar la incorporación y el mantenimiento de idiomas.
- Los textos de la interfaz deberán utilizar las traducciones correspondientes en lugar de depender de textos fijos.
- La implementación deberá contemplar los distintos apartados de la aplicación, incluidos los ajustes, los menús, los mensajes y las ventanas emergentes.
- Cambiar de idioma no deberá modificar ni eliminar los datos guardados por el usuario.

## 🖥️ Mejoras en modo horizontal (landscape)

- **Información del Pomodoro:** cuando el temporizador Pomodoro esté activo, se mostrará su información en una esquina de la interfaz horizontal.
- La información deberá permanecer visible sin entorpecer el contenido principal ni interferir con la navegación.

---

### Objetivo de la versión 12

Mareas v12 busca mejorar la gestión de las relaciones vinculadas a las entradas, añadir diferentes niveles de privacidad mediante PIN, facilitar la organización del estudio con una planificación que aprenda progresivamente del tiempo real empleado e incorporar herramientas para consultar las novedades y utilizar la aplicación en diferentes idiomas.

Estas notas describen los cambios previstos para la versión 12; su publicación no implica que todas las funciones estén ya implementadas o verificadas.
