# Mora Petraglia — Landing & Panel CMS

Aplicación para Mora Petraglia, artista plástica y muralista de La Plata. El repositorio reúne una **landing pública en React + TypeScript** y un **panel privado `/admin`** conectado a un backend de Google Apps Script.

## Arquitectura

```text
public landing + /admin
        ↓
React 19 + TypeScript + Vite
        ↓
Google Apps Script HTTP API
      ↙     ↘
Google Sheets   Google Drive
```

- **Frontend**: React + TypeScript + Vite + Sass + GSAP.
- **Backend**: Google Apps Script como boundary HTTP.
- **Datos**: Google Sheets.
- **Media**: Google Drive.
- **Routing**: `/` para landing y `/admin` para gestión.

## Variables de entorno

Creá un `.env` local tomando `.env.example` como base:

```env
VITE_MORA_CMS_URL=https://script.google.com/macros/s/XXXXXXX/exec
```

Los valores productivos no forman parte del repositorio ni del quality gate.

## Rutas principales

- `/`: landing pública con animaciones, video y responsive. Consume contenido remoto cuando está disponible y mantiene fallback local cuando ese contrato lo contempla.
- `/admin`: panel privado para autenticación y gestión de contenido a través del backend existente.

## Desarrollo

```bash
npm ci
npm run dev
```

## Quality gate

El contrato bloqueante de V1 valida comportamiento reproducible sin mezclar una reescritura mecánica de formato de todo el árbol:

```bash
npm ci
npm run typecheck
npm run build
```

También podés ejecutar ambos checks con:

```bash
npm run check
```

GitHub Actions ejecuta ese mismo contrato en PRs y pushes a `main` usando Node.js 22 y sin credenciales de Google/Vercel de producción.

### Formato

Oxfmt sigue disponible explícitamente:

```bash
npm run format
npm run format:check
```

El árbol actual tiene formato histórico previo a este quality gate. La normalización completa está separada en una issue dedicada para que pueda revisarse como un commit mecánico y, una vez normalizado el repositorio, `format:check` pase a ser bloqueante sin ocultar cambios funcionales.

### Qué valida CI hoy

- TypeScript compila sin emitir archivos (`tsc --noEmit`).
- Vite produce un build de producción.
- Instalación reproducible desde `package-lock.json`.

No se agregan tests vacíos sólo para mostrar un badge verde. La cobertura futura debe enfocarse en contratos reales del CMS: normalización de respuestas, fallback, auth state y mapping de payloads sin depender de servicios Google en vivo.

## Boundary determinístico del CMS

El contrato detallado está documentado en [`docs/cms-boundary.md`](./docs/cms-boundary.md).

Las reglas principales son:

- la landing pública usa el bootstrap del CMS cuando responde con éxito;
- un CMS público no disponible activa fallback local para productos, murales y exhibiciones;
- un resultado CMS exitoso pero vacío sigue siendo autoritativo: no se mezcla silenciosamente con fallback;
- `/admin` **no** sustituye datos editables por el fallback público cuando falla el backend;
- una sesión administrativa válida vive actualmente en `sessionStorage` y los POST autenticados envían el token en el body;
- media con ids `med_*` se normaliza hacia `/api/media`, que actúa como proxy server-side hacia el backend de imágenes;
- las credenciales y endpoints productivos quedan fuera del repositorio y del quality gate;
- los tests futuros deben usar fixtures/mocks para representar respuestas válidas, vacías, fallidas y malformadas.

El documento también deja explícitos los límites actuales: los payloads están tipados en TypeScript pero no tienen validación de esquema en runtime, y la autenticación del panel no se presenta como si utilizara cookies HttpOnly cuando hoy usa `sessionStorage`.

Esto permite que la arquitectura siga siendo realista sin transformar CI en una prueba frágil contra servicios externos.
