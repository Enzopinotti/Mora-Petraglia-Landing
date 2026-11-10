const MORA_CONTENT_DEFAULTS = Object.freeze([

  {
    key: 'header.announcement',
    group: 'header',
    label: 'Anuncio superior',
    type: 'text',
    value: 'Prints de edición limitada disponibles · Envíos a Argentina y exterior',
    sort_order: 10,
  },

  {
    key: 'hero.kicker',
    group: 'hero',
    label: 'Presentación corta',
    type: 'text',
    value: 'Artista plástica y muralista · La Plata',
    sort_order: 20,
  },

  {
    key: 'hero.title_part1',
    group: 'hero',
    label: 'Título línea 1',
    type: 'text',
    value: 'Mora',
    sort_order: 30,
  },

  {
    key: 'hero.title_part2',
    group: 'hero',
    label: 'Título línea 2',
    type: 'text',
    value: 'Petraglia',
    sort_order: 40,
  },

  {
    key: 'hero.description',
    group: 'hero',
    label: 'Descripción principal',
    type: 'textarea',
    value: 'Retratos pop, murales y cultura popular argentina en una obra de color intenso, memoria urbana y personajes que vuelven a mirar desde la calle.',
    sort_order: 50,
  },

  {
    key: 'intro.kicker',
    group: 'intro',
    label: 'Kicker de introducción',
    type: 'text',
    value: 'Mora Petraglia',
    sort_order: 60,
  },

  {
    key: 'intro.title',
    group: 'intro',
    label: 'Título de introducción',
    type: 'text',
    value: 'La calle, los íconos y el gesto pop.',
    sort_order: 70,
  },

  {
    key: 'intro.copy1',
    group: 'intro',
    label: 'Introducción · párrafo 1',
    type: 'textarea',
    value: 'Desde su archivo de Instagram aparece una Mora en movimiento: retratos de personajes argentinos, murales con frases de barrio, fotos de proceso, escenas de muestra y una paleta que mezcla rosa, azul, rojo y turquesa sin pedir permiso.',
    sort_order: 80,
  },

  {
    key: 'intro.copy2',
    group: 'intro',
    label: 'Introducción · párrafo 2',
    type: 'textarea',
    value: 'Este recorrido toma esa energía como punto de partida: ritmo, movimiento, obra real y una galería concentrada en el vínculo entre pintura, pared y cultura popular.',
    sort_order: 90,
  },

  {
    key: 'prints.title',
    group: 'prints',
    label: 'Título Prints',
    type: 'text',
    value: 'Prints y obra disponible.',
    sort_order: 100,
  },

  {
    key: 'murales.title',
    group: 'murales',
    label: 'Título Murales',
    type: 'text',
    value: 'Galería de murales.',
    sort_order: 110,
  },

  {
    key: 'about.title',
    group: 'about',
    label: 'Título Sobre Mora',
    type: 'text',
    value: 'Una mirada entre taller, vereda y cultura popular.',
    sort_order: 120,
  },

  {
    key: 'exhibiciones.title',
    group: 'exhibiciones',
    label: 'Título Exhibiciones',
    type: 'text',
    value: 'Muestras, obra pública y encuentros.',
    sort_order: 130,
  },

  {
    key: 'contacto.title',
    group: 'contacto',
    label: 'Título Contacto',
    type: 'text',
    value: 'Encargos, obra disponible y proyectos.',
    sort_order: 140,
  },

]);


function getContentMap_() {

  var result = {};


  dbReadAll_(
    CMS.database.sheets.content
  )
  .forEach(
    function(row) {

      if (!row.key) {
        return;
      }

      result[
        String(row.key)
      ] =
        String(
          row.value || ''
        );

    }
  );


  return result;
}


function updateContent_(
  content
) {

  assert_(
    content
    && typeof content === 'object',
    'Contenido inválido.'
  );


  var now =
    nowIso_();


  Object.keys(content)
    .forEach(
      function(key) {

        var existing =
          dbFindByKey_(
            CMS.database.sheets.content,
            'key',
            key
          );


        var definition =
          getContentDefinition_(
            key
          );


        var row = {

          id:
            existing
              ? existing.id
              : generateId_('cnt'),

          key:
            key,

          group:
            existing
              ? existing.group
              : definition.group,

          label:
            existing
              ? existing.label
              : definition.label,

          value:
            String(
              content[key] === null
              || content[key] === undefined
                ? ''
                : content[key]
            ),

          type:
            existing
              ? existing.type
              : definition.type,

          sort_order:
            existing
              ? existing.sort_order
              : definition.sort_order,

          updated_at:
            now,

        };


        dbUpsertByKey_(
          CMS.database.sheets.content,
          'key',
          key,
          row
        );

      }
    );


  auditLog_(
    'UPDATE_CONTENT',
    'content',
    'site',
    'Textos de la landing actualizados'
  );


  invalidatePublicCache_();


  return getContentMap_();
}


function seedMoraContent_() {

  MORA_CONTENT_DEFAULTS
    .forEach(
      function(definition) {

        var existing =
          dbFindByKey_(
            CMS.database.sheets.content,
            'key',
            definition.key
          );


        if (existing) {
          return;
        }


        dbInsert_(
          CMS.database.sheets.content,
          {

            id:
              generateId_(
                'cnt'
              ),

            key:
              definition.key,

            group:
              definition.group,

            label:
              definition.label,

            value:
              definition.value,

            type:
              definition.type,

            sort_order:
              definition.sort_order,

            updated_at:
              nowIso_(),

          }
        );

      }
    );


  invalidatePublicCache_();


  return getContentMap_();
}


function getContentDefinition_(
  key
) {

  var found =
    MORA_CONTENT_DEFAULTS
      .find(
        function(item) {

          return item.key === key;

        }
      );


  if (found) {

    return found;

  }


  var group =
    String(key || '')
      .split('.')[0]
    || 'general';


  return {

    group:
      group,

    label:
      String(key || ''),

    type:
      'text',

    sort_order:
      nextSortOrder_(
        CMS.database.sheets.content
      ),

  };
}