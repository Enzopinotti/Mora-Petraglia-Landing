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

El repositorio expone un contrato de calidad reproducible:

```bash
npm ci
npm run typecheck
npm run format:check
npm run build
```

También podés ejecutar todo con:

```bash
npm run check
```

GitHub Actions ejecuta ese mismo contrato en PRs y pushes a `main` usando Node.js 22 y sin credenciales de Google/Vercel de producción.

### Qué valida CI hoy

- TypeScript compila sin emitir archivos (`tsc --noEmit`).
- El código respeta el formateo esperado por Oxfmt.
- Vite produce un build de producción.

No se agregan tests vacíos sólo para mostrar un badge verde. La cobertura futura debe enfocarse en contratos reales del CMS: normalización de respuestas, fallback, auth state y mapping de payloads sin depender de servicios Google en vivo.

## Boundary determinístico del CMS

Para mantener CI reproducible:

- las credenciales y endpoints productivos quedan fuera del repositorio;
- las integraciones Google se tratan como un boundary externo;
- los tests que se incorporen deben usar fixtures/mocks para representar respuestas válidas, vacías y malformadas;
- el frontend público no debería depender de disponibilidad en vivo del CMS para poder construir y validarse.

Esto permite que la arquitectura siga siendo realista sin transformar CI en una prueba frágil contra servicios externos.
