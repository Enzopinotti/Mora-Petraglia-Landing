# Mora Petraglia — Landing & Panel CMS

Aplicación para Mora Petraglia, artista plástica y muralista de La Plata.
Incluye landing pública dinámica y panel de administración privado `/admin` conectado al backend existente de Google Apps Script.

## Arquitectura

- **Frontend**: React + TypeScript + Vite + Sass + GSAP (Landing pública + Panel `/admin`)
- **Backend**: Google Apps Script (Servicio API HTTP)
- **Base de Datos**: Google Sheets
- **Media**: Google Drive
- **Routing**: Detección dinámica `/` vs `/admin`

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
VITE_MORA_CMS_URL=https://script.google.com/macros/s/XXXXXXX/exec
```

## Rutas Principales

- `/`: Landing pública (retiene 100% de la identidad visual, animaciones GSAP, videos y responsive actual; consume datos de Apps Script con fallback a `src/data/landing.ts`).
- `/admin`: Panel administrativo (autenticación contra Apps Script, gestión CRUD de productos/obras, murales, exhibiciones, edición de textos por secciones y configuración general).

## Desarrollo

```bash
npm install
npm run dev
npm run build
```
