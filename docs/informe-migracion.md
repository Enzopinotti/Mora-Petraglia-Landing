# Informe de migración — pendiente de implementación

Relevamiento de solo lectura del 10 de noviembre de 2026. **No se ha
ejecutado ninguna migración ni se ha preparado un respaldo de la base o de
Drive.** La lista siguiente no sustituye un dry-run idempotente.

## Origen y destino

La landing pública utiliza un deployment versionado de Apps Script (versión
4). Se descargaron tanto el HEAD como esa versión: sus 19 archivos coinciden
en contenido. El bootstrap público contiene el mismo ID de producto observado
en la planilla facilitada. La copia local no se ha enviado con `clasp push`.

| Original | Tipo previsto | Imagen local | Estado de migración |
| --- | --- | --- | --- |
| Beso en el espejo | Print | `prints/print-beso-espejo-card.webp` | Pendiente |
| Fleabag | Print | `prints/print-holy-bible.webp` | Pendiente |
| Maradona | Print | `prints/print-freddie-cigarrillo.webp` | Pendiente |
| Mujer en silla | Print | `prints/print-mujer-silla.webp` | Pendiente |
| Obra destacada | Obra original destacada | `works/featured/obra-destacada-cigarrillo.webp` | Pendiente |
| Mora pintando | Mural, proporción `tall` | `murals/mural-proceso.webp` | Pendiente |
| Imaginario urbano | Mural | `murals/mural-personajes-urbanos.webp` | Pendiente |
| Mural panorámico | Mural | `murals/mural-panoramico.webp` | Pendiente |
| Retrato en pared | Mural | `murals/mural-retrato-pared.webp` | Pendiente |
| Laura Palmer | Exhibición | `exhibitions/laura-palmer-mumbat-52-salon-nacional.webp` | Pendiente |
| Salón Provincial de Arte Joven 2024 | Exhibición | `exhibitions/salon-provincial-arte-joven-2024.webp` | Pendiente |

Las rutas de imagen son relativas a `src/assets/images/`. El orden de la
tabla sigue el orden original dentro de cada sección. La imagen `about-mora.webp`
y las configuraciones visuales, recortes y textos también deben inventariarse
para una migración completa. Ninguna imagen fue cargada a Drive.

## Registros observados y preservados

- Productos: `prd_25c21aa493a4`, «Producto de prueba», `published`.
  Ya aparecía en el bootstrap público antes de este trabajo; no se modificó.
- Murales y eventos: sin registros en las hojas respectivas.
- Media: `med_a676d2b5b564` (archivada) y `med_65db7b328ff8`
  (portada activa), asociadas al producto de prueba. No se modificaron.
- Contenido: 14 registros; configuraciones: 8 registros. No se sobrescribió
  ningún valor ni se evaluó si sus textos ya fueron editados.
- Importados: ninguno. Imágenes migradas: ninguna.

La planilla facilitada respondió a una lectura anónima, incluidas columnas de
notas internas. Revisar sus permisos de acceso antes de publicar; no cambiar
la configuración sin evaluar el impacto operativo.

## Diferencias y trabajo pendiente

- La fuente local contiene 4 prints, 1 obra destacada, 4 murales y 2
  exhibiciones; el bootstrap público actualmente muestra el producto de prueba
  y no contiene murales ni exhibiciones.
- El esquema descargado no incluye campos equivalentes a `availability` de
  producto, `span` de mural o `date_label` de evento. Tampoco contempla los
  recortes y escalas originales de imágenes. Antes de agregar campos se deben
  comprobar las columnas reales y los serializers y formularios completos.
- Hay textos aún hardcodeados, como la indicación para presupuestar la obra
  destacada; las claves de contenido existentes no cubren todos los textos
  utilizados por los componentes.
- La lectura pública de productos del backend incluye `published`, `sold` y
  `out_of_stock`; proyectos y eventos requieren `published`. Se debe validar
  que esta política sea la deseada y probar todos los estados.
- No existen aún el importador, sus identificadores estables, el dry-run, el
  respaldo previo, las pruebas de idempotencia ni las pruebas integrales del
  panel. Es imprescindible resolver coincidencias ambiguas sin sobrescribir
  registros y preservar los IDs existentes.
- La corrección local de precios interpreta separadores argentinos y normaliza
  el precio enviado desde el formulario; todavía no está desplegada.

## Validación de esta entrega parcial

Pasaron `npm ci`, `npm run typecheck`, `npm run build` y `npm test` (tres
pruebas de precios). `npm ci` informó 46 vulnerabilidades de dependencias de
desarrollo; `npm audit --omit=dev` informó cero en dependencias de producción.
No se ejecutaron pruebas end-to-end ni se modificó el deployment productivo.
**El proyecto no está listo para producción.**
