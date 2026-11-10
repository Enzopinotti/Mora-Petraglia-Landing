function nowIso_() {
  return new Date()
    .toISOString();
}


function generateId_(prefix) {
  return (
    String(prefix || 'id')
    + '_'
    + Utilities
        .getUuid()
        .replace(/-/g, '')
        .slice(0, 12)
  );
}


function slugify_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(
      0,
      120
    );
}


function sanitizeString_(value) {
  if (
    value === null
    ||
    value === undefined
  ) {
    return '';
  }


  return String(value)
    .trim();
}


function toNumber_(
  value,
  fallback
) {
  if (
    value === ''
    ||
    value === null
    ||
    value === undefined
  ) {
    return fallback === undefined
      ? ''
      : fallback;
  }


  var number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : (
        fallback === undefined
          ? ''
          : fallback
      );
}


/**
 * Convierte valores de formularios,
 * JSON y Google Sheets correctamente.
 *
 * Reconoce:
 *
 * true
 * TRUE
 * 1
 * on
 * yes
 * si
 * sí
 */
function toBoolean_(value) {
  if (
    value === true
    ||
    value === 1
  ) {
    return true;
  }


  if (
    value === false
    ||
    value === 0
    ||
    value === null
    ||
    value === undefined
    ||
    value === ''
  ) {
    return false;
  }


  var normalized =
    String(value)
      .trim()
      .toLowerCase();


  return [
    'true',
    '1',
    'on',
    'yes',
    'si',
    'sí',
  ]
  .indexOf(
    normalized
  ) !== -1;
}


function assert_(
  condition,
  message
) {
  if (!condition) {
    throw new Error(
      message
      || 'Operación inválida.'
    );
  }
}


function jsonSafe_(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}


function sortByOrder_(items) {
  return (items || [])
    .slice()
    .sort(
      function(a, b) {
        var orderA =
          Number(
            a.sort_order || 0
          );

        var orderB =
          Number(
            b.sort_order || 0
          );


        if (
          orderA !== orderB
        ) {
          return orderA
            - orderB;
        }


        return String(
          a.updated_at || ''
        )
        .localeCompare(
          String(
            b.updated_at || ''
          )
        );
      }
    );
}


function getEntityPrefix_(
  entityType
) {
  var prefixes = {
    products: 'prd',
    projects: 'prj',
    events: 'evt',
    media: 'med',
    content: 'cnt',
    audit: 'aud',
  };


  return prefixes[
    entityType
  ] || 'id';
}


function isValidEntityType_(
  entityType
) {
  return [
    'products',
    'projects',
    'events',
    'site',
  ]
  .indexOf(
    entityType
  ) !== -1;
}


function normalizeStatus_(
  value,
  allowed,
  fallback
) {
  var status =
    sanitizeString_(value);


  if (
    allowed.indexOf(
      status
    ) !== -1
  ) {
    return status;
  }


  return fallback;
}


function normalizeDateString_(value) {
  if (!value) {
    return '';
  }


  if (
    Object.prototype
      .toString
      .call(value)
    === '[object Date]'
  ) {
    return Utilities
      .formatDate(
        value,
        CMS.site.timezone,
        'yyyy-MM-dd'
      );
  }


  return sanitizeString_(
    value
  )
  .slice(
    0,
    10
  );
}


function safeFileName_(name) {
  return String(
    name || 'imagen'
  )
  .replace(
    /[\\\/:*?"<>|]+/g,
    '-'
  )
  .replace(
    /\s+/g,
    ' '
  )
  .trim()
  .slice(
    0,
    180
  );
}


function withScriptLock_(callback) {
  var lock =
    LockService
      .getScriptLock();


  lock.waitLock(
    30000
  );


  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}


function stripPrivateFields_(row) {
  var copy =
    Object.assign(
      {},
      row || {}
    );


  delete copy.internal_notes;
  delete copy.archived_at;


  return copy;
}


function makeUniqueSlug_(
  sheetName,
  baseValue,
  excludeId
) {
  var base =
    slugify_(
      baseValue
    );


  if (!base) {
    base =
      generateId_('item')
        .toLowerCase();
  }


  var rows =
    dbReadAll_(
      sheetName
    );


  var used = {};


  rows.forEach(
    function(row) {
      if (
        excludeId
        &&
        String(row.id)
        === String(excludeId)
      ) {
        return;
      }


      if (row.slug) {
        used[
          String(row.slug)
        ] = true;
      }
    }
  );


  if (!used[base]) {
    return base;
  }


  var index = 2;


  while (
    used[
      base
      + '-'
      + index
    ]
  ) {
    index += 1;
  }


  return (
    base
    + '-'
    + index
  );
}


function nextSortOrder_(
  sheetName,
  filterFunction
) {
  var rows =
    dbReadAll_(
      sheetName
    );


  if (filterFunction) {
    rows =
      rows.filter(
        filterFunction
      );
  }


  var maxValue =
    rows.reduce(
      function(max, row) {
        return Math.max(
          max,
          Number(
            row.sort_order
            || 0
          )
        );
      },
      0
    );


  return maxValue + 10;
}


function include_(filename) {
  return HtmlService
    .createHtmlOutputFromFile(
      filename
    )
    .getContent();
}