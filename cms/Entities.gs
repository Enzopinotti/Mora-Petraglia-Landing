const ENTITY_DEFINITIONS = Object.freeze({

  products: {

    sheet: 'products',

    prefix: 'prd',

    titleField: 'name',

    statuses: [
      'draft',
      'published',
      'hidden',
      'sold',
      'out_of_stock',
      'archived',
    ],

  },


  projects: {

    sheet: 'projects',

    prefix: 'prj',

    titleField: 'title',

    statuses: [
      'draft',
      'published',
      'hidden',
      'archived',
    ],

  },


  events: {

    sheet: 'events',

    prefix: 'evt',

    titleField: 'title',

    statuses: [
      'draft',
      'published',
      'hidden',
      'archived',
    ],

  },

});


function entityDefinition_(entityType) {

  var definition =
    ENTITY_DEFINITIONS[
      entityType
    ];


  assert_(
    definition,
    'Tipo de entidad inválido: '
    + entityType
  );


  return definition;
}


function hasOwn_(object, key) {

  return Object.prototype
    .hasOwnProperty
    .call(
      object || {},
      key
    );

}


function patchStringField_(
  patch,
  data,
  key
) {

  if (
    hasOwn_(
      data,
      key
    )
  ) {

    patch[key] =
      sanitizeString_(
        data[key]
      );

  }

}


function patchNumberField_(
  patch,
  data,
  key
) {

  if (
    hasOwn_(
      data,
      key
    )
  ) {

    patch[key] =
      toNumber_(
        data[key],
        ''
      );

  }

}


function patchBooleanField_(
  patch,
  data,
  key
) {

  if (
    hasOwn_(
      data,
      key
    )
  ) {

    patch[key] =
      toBoolean_(
        data[key]
      );

  }

}


function patchDateField_(
  patch,
  data,
  key
) {

  if (
    hasOwn_(
      data,
      key
    )
  ) {

    patch[key] =
      normalizeDateString_(
        data[key]
      );

  }

}


/*
 * LISTADO GENÉRICO
 */

function listEntities_(
  entityType,
  options
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var filters =
    options || {};


  var rows =
    dbReadAll_(
      definition.sheet
    );


  /*
   * Por defecto no mostramos archivados.
   */

  if (
    !toBoolean_(
      filters.includeArchived
    )
  ) {

    rows =
      rows.filter(
        function(row) {

          return String(
            row.status || ''
          ) !== 'archived';

        }
      );

  }


  /*
   * FILTRO ESTADO
   */

  if (filters.status) {

    rows =
      rows.filter(
        function(row) {

          return String(
            row.status || ''
          ) === String(
            filters.status
          );

        }
      );

  }


  /*
   * FILTRO SUBTIPO
   */

  if (filters.subtype) {

    rows =
      rows.filter(
        function(row) {

          return String(
            row.subtype || ''
          ) === String(
            filters.subtype
          );

        }
      );

  }


  /*
   * DESTACADOS
   */

  if (
    hasOwn_(
      filters,
      'featured'
    )
  ) {

    var featured =
      toBoolean_(
        filters.featured
      );


    rows =
      rows.filter(
        function(row) {

          return toBoolean_(
            row.featured
          ) === featured;

        }
      );

  }


  /*
   * BÚSQUEDA
   */

  if (filters.query) {

    var query =
      sanitizeString_(
        filters.query
      )
      .toLowerCase();


    rows =
      rows.filter(
        function(row) {

          var title =
            String(
              row[
                definition.titleField
              ] || ''
            )
            .toLowerCase();


          var description =
            String(
              row.short_description
              || row.description
              || ''
            )
            .toLowerCase();


          return (
            title.indexOf(query) !== -1
            ||
            description.indexOf(query)
            !== -1
          );

        }
      );

  }


  return sortByOrder_(
    rows
  );
}


/*
 * OBTENER POR ID
 */

function getEntityById_(
  entityType,
  id
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var row =
    dbFindById_(
      definition.sheet,
      id
    );


  assert_(
    row,
    'No se encontró el registro '
    + id
    + '.'
  );


  return row;
}


/*
 * OBTENER POR SLUG
 */

function getEntityBySlug_(
  entityType,
  slug
) {

  var definition =
    entityDefinition_(
      entityType
    );


  return dbFindByKey_(
    definition.sheet,
    'slug',
    sanitizeString_(slug)
  );
}


/*
 * ARCHIVAR
 */

function archiveEntity_(
  entityType,
  id
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var current =
    getEntityById_(
      entityType,
      id
    );


  var updated =
    dbUpdateById_(
      definition.sheet,
      id,
      {

        status:
          'archived',

        archived_at:
          nowIso_(),

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'ARCHIVE',
    entityType,
    id,
    'Archivado: '
    + String(
      current[
        definition.titleField
      ] || id
    )
  );


  invalidatePublicCache_();


  return updated;
}


/*
 * RESTAURAR
 */

function restoreEntity_(
  entityType,
  id
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var current =
    getEntityById_(
      entityType,
      id
    );


  var updated =
    dbUpdateById_(
      definition.sheet,
      id,
      {

        status:
          'draft',

        archived_at:
          '',

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'RESTORE',
    entityType,
    id,
    'Restaurado como borrador: '
    + String(
      current[
        definition.titleField
      ] || id
    )
  );


  invalidatePublicCache_();


  return updated;
}


/*
 * PUBLICAR
 */

function publishEntity_(
  entityType,
  id
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var current =
    getEntityById_(
      entityType,
      id
    );


  var updated =
    dbUpdateById_(
      definition.sheet,
      id,
      {

        status:
          'published',

        archived_at:
          '',

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'PUBLISH',
    entityType,
    id,
    'Publicado: '
    + String(
      current[
        definition.titleField
      ] || id
    )
  );


  invalidatePublicCache_();


  return updated;
}


/*
 * OCULTAR
 */

function hideEntity_(
  entityType,
  id
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var current =
    getEntityById_(
      entityType,
      id
    );


  var updated =
    dbUpdateById_(
      definition.sheet,
      id,
      {

        status:
          'hidden',

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'HIDE',
    entityType,
    id,
    'Ocultado: '
    + String(
      current[
        definition.titleField
      ] || id
    )
  );


  invalidatePublicCache_();


  return updated;
}


/*
 * DESTACADO
 */

function setEntityFeatured_(
  entityType,
  id,
  featured
) {

  var definition =
    entityDefinition_(
      entityType
    );


  var current =
    getEntityById_(
      entityType,
      id
    );


  var value =
    toBoolean_(
      featured
    );


  var updated =
    dbUpdateById_(
      definition.sheet,
      id,
      {

        featured:
          value,

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'FEATURE',
    entityType,
    id,
    (
      value
        ? 'Destacado: '
        : 'Quitado de destacados: '
    )
    +
    String(
      current[
        definition.titleField
      ] || id
    )
  );


  invalidatePublicCache_();


  return updated;
}