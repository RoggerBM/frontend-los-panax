# Space-Qhealth · Frontend

SPA en **React 19 + Vite 6 + Tailwind v4** que simula un centro de control médico de tripulación. No hay login: `/` abre directamente el panel.

1. **Validación biométrica**: solo se pide al hacer un test. Se elige quién lo hace y la cámara confirma su identidad con un escaneo facial (simulado, no se envía nada).
2. **Test de fatiga** (~1 min, `/mod/fat/test`): bloque combinado PVT + Go/No-Go + Stroop que estima tiempos de reacción, decisión y control. Se lanza desde el módulo **Fatigue & Sleep** o desde la ficha de cada tripulante (`?crew=<id>` lo preselecciona).
3. **Panel de tripulación** (diseño basado en AEGIS-MED):
   - `/`: tripulación activa en tarjetas, con alerta global y voz IA.
   - `/ast/:id`: ficha del tripulante con gemelo 3D clicable, metas del día, tarjetas de los 7 módulos y protocolo clínico.
   - `/mod/:modulo`: comparación de toda la tripulación en un módulo. En **Nutrition & Glucose** incluye la vista completa *Nutrition · On-board AI* (registros de 30 días, riesgo explicable, recomendaciones, asistente y mensajes a Tierra).
   - `/emergencia`: pasos y temporizador de RCP.
   - Barra inferior: Atrás, Inicio, Pantallas (accesos y escenarios de demo) y Emergencia.

El último resultado de cada tripulante y su historial de tests se guardan en `localStorage`.

## Backend de sensores

El panel recibe los datos de sensores en vivo desde el backend FastAPI (`../backend`) por SSE. La URL se configura con `VITE_API_URL` (ver `.env.example`). En desarrollo, por defecto es `http://localhost:8000/api`.

Se abre un stream por tripulante. El escenario de cada uno depende del modo de demo elegido en **Pantallas**. Con las lecturas, `features/crew/lib/crewModel.js` calcula el estado de cada módulo. Cada tripulante que haya hecho el test de fatiga usa su PVT real en lugar del simulado.

Si el backend no está disponible, o en producción no se define `VITE_API_URL`, se usan las lecturas base de `features/crew/config/scenarios.js`. El indicador de la cabecera muestra el estado: **Sensores en vivo**, **Conectando**, **Sin enlace** o **Simulación local**.

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
    auth/         Tripulación (carpeta faces) y validación biométrica para los tests
    cognitive/    Pruebas PVT / Go-No-Go / Stroop y veredicto
    crew/         Panel de tripulación: inicio, ficha /ast, módulos, emergencia
  shared/         Componentes, hooks y utilidades comunes
  assets/faces/   Una imagen por tripulante (ver LEEME.md)
  styles/         Tailwind y tokens de tema
```

Cada feature expone su API pública en su `index.js`; importa con el alias `@/`.

## Tripulantes

Cada imagen en `src/assets/faces/` (`png`, `jpg`, `jpeg`, `webp`, `avif`, `svg`) se convierte en un tripulante. El nombre sale del archivo: `ana-torres.svg` da **Ana Torres**.

## Despliegue en Vercel

Es un sitio estático: Vercel ejecuta `npm run build` y sirve `dist/`. `vercel.json` ya incluye:

- rewrite de todas las rutas a `index.html`, para que `/ast/...`, `/mod/...` o `/mod/fat/test` no den 404 al recargar;
- caché inmutable para `/assets/*`, que llevan hash en el nombre;
- `Permissions-Policy` que permite la cámara en el propio dominio.

Si el repositorio contiene más carpetas además de `frontend/`, configura **Root Directory = `frontend`** en el proyecto de Vercel.
