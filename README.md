# Mareas

Diario de ánimo + agenda escolar. Una sola página (`index.html`), sin dependencias ni servidor.

## Publicar en GitHub Pages

1. Crea un repositorio y sube estos archivos a la raíz: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`.
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. Abre `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`. En el móvil puedes «Añadir a pantalla de inicio»: funciona sin conexión.

## Tus datos

Se guardan en el navegador de cada dispositivo (localStorage + IndexedDB para fotos y vídeos). Al estar en otra dirección web, **no se traen solos** los datos de la versión anterior: en la versión antigua usa *Ajustes → Descargar copia completa* y en la nueva *Elegir archivo*.

Cada vez que cambies `mareas.html` ejecuta `python3 build_site.py` y vuelve a subir los archivos.
