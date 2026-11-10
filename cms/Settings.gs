const MORA_SETTINGS_DEFAULTS = Object.freeze([

  {
    key: 'instagram',
    label: 'Instagram',
    value: 'https://www.instagram.com/morapetraglia/',
    type: 'url',
    group: 'contact',
    public: true,
  },

  {
    key: 'email',
    label: 'Email de contacto',
    value: 'contacto@morapetraglia.com',
    type: 'email',
    group: 'contact',
    public: true,
  },

  {
    key: 'whatsapp',
    label: 'WhatsApp',
    value: '',
    type: 'text',
    group: 'contact',
    public: true,
  },

  {
    key: 'currency',
    label: 'Moneda',
    value: 'ARS',
    type: 'text',
    group: 'commerce',
    public: true,
  },

  {
    key: 'shipping_ar',
    label: 'Envíos Argentina',
    value: 'Envíos a toda Argentina',
    type: 'text',
    group: 'commerce',
    public: true,
  },

  {
    key: 'shipping_intl',
    label: 'Envíos exterior',
    value: 'Envíos internacionales bajo consulta',
    type: 'text',
    group: 'commerce',
    public: true,
  },

  {
    key: 'seo_title',
    label: 'Título SEO',
    value: 'Mora Petraglia — Artista Plástica y Muralista',
    type: 'text',
    group: 'seo',
    public: true,
  },

  {
    key: 'seo_description',
    label: 'Descripción SEO',
    value: 'Retratos pop, murales y arte contemporáneo desde La Plata, Argentina.',
    type: 'textarea',
    group: 'seo',
    public: true,
  },

]);


function getSettingsMap_(
  publicOnly
) {

  var result = {};


  dbReadAll_(
    CMS.database.sheets.settings
  )
  .filter(
    function(row) {

      if (!publicOnly) {
        return true;
      }


      return toBoolean_(
        row.public
      );

    }
  )
  .forEach(
    function(row) {

      if (!row.key) {
        return;
      }


      result[
        String(row.key)
      ] =
        parseSettingValue_(
          row.value,
          row.type
        );

    }
  );


  return result;
}


function updateSettings_(
  settings
) {

  assert_(
    settings
    && typeof settings === 'object',
    'Configuración inválida.'
  );


  var now =
    nowIso_();


  Object.keys(settings)
    .forEach(
      function(key) {

        var existing =
          dbFindByKey_(
            CMS.database.sheets.settings,
            'key',
            key
          );


        var definition =
          getSettingDefinition_(
            key
          );


        var row = {

          key:
            key,

          label:
            existing
              ? existing.label
              : definition.label,

          value:
            serializeSettingValue_(
              settings[key]
            ),

          type:
            existing
              ? existing.type
              : definition.type,

          group:
            existing
              ? existing.group
              : definition.group,

          public:
            existing
              ? toBoolean_(
                  existing.public
                )
              : definition.public,

          updated_at:
            now,

        };


        dbUpsertByKey_(
          CMS.database.sheets.settings,
          'key',
          key,
          row
        );

      }
    );


  auditLog_(
    'UPDATE_SETTINGS',
    'settings',
    'site',
    'Configuración general actualizada'
  );


  invalidatePublicCache_();


  return getSettingsMap_(
    false
  );
}


function seedMoraSettings_() {

  MORA_SETTINGS_DEFAULTS
    .forEach(
      function(definition) {

        var existing =
          dbFindByKey_(
            CMS.database.sheets.settings,
            'key',
            definition.key
          );


        if (existing) {
          return;
        }


        dbInsert_(
          CMS.database.sheets.settings,
          {

            key:
              definition.key,

            label:
              definition.label,

            value:
              definition.value,

            type:
              definition.type,

            group:
              definition.group,

            public:
              definition.public,

            updated_at:
              nowIso_(),

          }
        );

      }
    );


  invalidatePublicCache_();


  return getSettingsMap_(
    false
  );
}


function getSettingDefinition_(
  key
) {

  var found =
    MORA_SETTINGS_DEFAULTS
      .find(
        function(item) {

          return item.key === key;

        }
      );


  if (found) {
    return found;
  }


  return {

    label:
      key,

    type:
      'text',

    group:
      'general',

    public:
      true,

  };
}


function serializeSettingValue_(
  value
) {

  if (
    typeof value === 'object'
    && value !== null
  ) {

    return JSON.stringify(
      value
    );

  }


  return String(
    value === undefined
    || value === null
      ? ''
      : value
  );
}


function parseSettingValue_(
  value,
  type
) {

  if (type === 'boolean') {

    return toBoolean_(
      value
    );

  }


  if (type === 'number') {

    return toNumber_(
      value,
      0
    );

  }


  return String(
    value === undefined
    || value === null
      ? ''
      : value
  );
}