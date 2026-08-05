# Mora Petraglia — Landing

Landing responsive para Mora Petraglia, artista plástica y muralista de La Plata.

El sitio está migrado a una estructura limpia de Vite + React + TypeScript + Sass, con animaciones GSAP, hero con video y secciones reales para obra, prints, murales, sobre Mora, exhibiciones y contacto.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

## Videos del hero

Los videos existentes se mantienen en:

- `public/videos/hero-desktop.mp4`
- `public/videos/hero-mobile.mp4`
- `public/videos/hero-poster.jpg`

No hace falta moverlos. El hero ahora usa WebM primero y conserva esos MP4 como respaldo:

- `public/videos/hero-desktop.webm`
- `public/videos/hero-mobile.webm`
- `public/videos/hero-poster.webp`

El frame optimizado está en `public/videos/frames/hero-frame-01.webp`.

## Carpetas para próximos assets

- `src/assets/images/hero/`
- `src/assets/images/works/`
- `src/assets/images/prints/`
- `src/assets/images/murals/`
- `src/assets/images/exhibitions/`
- `src/assets/images/textures/`
- `public/videos/process/`
- `public/videos/exhibitions/`
- `public/videos/social/`

La lista de material pendiente está en `ASSETS_PENDIENTES.md`.
