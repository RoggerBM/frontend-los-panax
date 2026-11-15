# AEGIS-MED · Frontend

SPA en **React 19 + Vite 6 + Tailwind v4** que simula el acceso de la tripulación a un centro de control médico:

1. **Login biométrico simulado**: eliges tripulante y la cámara hace un escaneo facial (simulado, no se envía nada).
2. **Validación cognitiva** (~1 min): bloque combinado PVT + Go/No-Go + Stroop que estima tiempos de reacción, decisión y control.
3. **Panel AEGIS-MED**: telemetría por escenarios, bio-escáner 3D, ECG, índice de riesgos, triaje y copiloto de voz.

Todo corre en el navegador; no hay backend. La sesión vive en `sessionStorage` y el historial de validaciones en `localStorage`.

## Requisitos

- Node.js 20.19 o superior
- Navegador con cámara (la cámara solo funciona en `localhost` o bajo HTTPS)

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run lint
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```

## Estructura

```
src/
  app/            Router y providers
  features/
    auth/         Login, cámara, sesión, rutas protegidas
    cognitive/    Pruebas PVT / Go-No-Go / Stroop y veredicto
    dashboard/    Panel AEGIS-MED (canvas 3D, ECG, voz)
  shared/         Componentes, hooks y utilidades comunes
  assets/faces/   Una imagen por tripulante (ver LEEME.md)
  styles/         Tailwind y tokens de tema
```

Cada feature expone su API pública en su `index.js`; importa con el alias `@/`.

## Tripulantes

Cada imagen en `src/assets/faces/` (`png`, `jpg`, `jpeg`, `webp`, `avif`, `svg`) se convierte en un usuario. El nombre sale del archivo: `ana-torres.svg` da **Ana Torres**.

## Despliegue en Vercel

Es un sitio estático: Vercel ejecuta `npm run build` y sirve `dist/`. `vercel.json` ya incluye:

- rewrite de todas las rutas a `index.html`, para que `/dashboard` o `/validacion` no den 404 al recargar;
- caché inmutable para `/assets/*`, que llevan hash en el nombre;
- `Permissions-Policy` que permite la cámara en el propio dominio.

Si el repositorio contiene más carpetas además de `frontend/`, configura **Root Directory = `frontend`** en el proyecto de Vercel.
