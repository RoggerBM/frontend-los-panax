# Rostros de la tripulación

Cada imagen de esta carpeta aparece como un usuario en la pantalla de login.

- Formatos: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- El nombre del archivo define el nombre del usuario:
  `maria-quispe.jpg` → **Maria Quispe** (separa palabras con `-` o `_`)
- Se recomiendan fotos cuadradas (p. ej. 400×400) con el rostro centrado.

Los `.svg` incluidos son solo marcadores de posición: puedes borrarlos y poner fotos reales.
Tras agregar o quitar imágenes, Vite recarga la lista automáticamente en modo `dev`.

## Imágenes generadas con IA

Agrega el id (nombre del archivo sin extensión) de cada imagen generada con IA a `ai-generated.json`.
La app le pondrá la marca **AI generated** en todos los lugares donde aparezca.
Si la imagen es un SVG, conviene incluir también la franja `AI GENERATED` dentro del archivo (ver `ana-torres.svg`).
