const CMS = Object.freeze({
  version: '1.0.0',

  site: {
    id: 'mora-petraglia',
    name: 'Mora Petraglia',
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
  },

  database: {
    name: 'Mora Petraglia - CMS DB',

    sheets: {
      system: '_system',
      content: 'content',
      settings: 'settings',
      products: 'products',
      projects: 'projects',
      events: 'events',
      media: 'media',
      audit: '_audit',
    },
  },

  drive: {
    rootName: 'Mora Petraglia - CMS Media',

    folders: {
      products: 'products',
      projects: 'projects',
      events: 'events',
      site: 'site',
      archived: 'archived',
    },
  },

  cache: {
    ttlSeconds: 300,

    keys: {
      bootstrap: 'public_bootstrap_v1',
      products: 'public_products_v1',
      projects: 'public_projects_v1',
      events: 'public_events_v1',
      content: 'public_content_v1',
      settings: 'public_settings_v1',
    },
  },

  media: {
    maxBytes: 15 * 1024 * 1024,

    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
    ],

    allowedRoles: [
      'cover',
      'gallery',
      'detail',
      'ambient',
      'signature',
    ],
  },
});


const DB_SCHEMAS = Object.freeze({

  _system: [
    'key',
    'value',
    'updated_at',
  ],

  content: [
    'id',
    'key',
    'group',
    'label',
    'value',
    'type',
    'sort_order',
    'updated_at',
  ],

  settings: [
    'key',
    'label',
    'value',
    'type',
    'group',
    'public',
    'updated_at',
  ],

  products: [
    'id',
    'slug',
    'name',
    'subtype',

    'short_description',
    'description',

    'technique',
    'support',
    'year',

    'width',
    'height',
    'depth',
    'size_label',

    'price',
    'currency',

    'sale_mode',
    'payment_link',

    'stock',

    'edition_type',
    'edition_total',

    'signed',
    'certificate',

    'status',
    'featured',
    'sort_order',

    'seo_title',
    'seo_description',

    'internal_notes',

    'created_at',
    'updated_at',
    'archived_at',
  ],

  projects: [
    'id',
    'slug',
    'title',
    'subtype',

    'short_description',
    'description',

    'location',
    'city',
    'country',
    'year',

    'client',
    'technique',
    'dimensions',

    'status',
    'featured',
    'sort_order',

    'seo_title',
    'seo_description',

    'internal_notes',

    'created_at',
    'updated_at',
    'archived_at',
  ],

  events: [
    'id',
    'slug',
    'title',
    'subtype',

    'artwork_name',

    'institution',
    'venue',

    'city',
    'country',

    'start_date',
    'end_date',
    'year',

    'participation_type',
    'description',

    'status',
    'featured',
    'sort_order',

    'seo_title',
    'seo_description',

    'internal_notes',

    'created_at',
    'updated_at',
    'archived_at',
  ],

  media: [
    'id',

    'entity_type',
    'entity_id',

    'drive_file_id',

    'file_name',
    'mime_type',

    'role',
    'alt_text',

    'sort_order',

    'created_at',
    'archived_at',
  ],

  _audit: [
    'id',
    'timestamp',
    'action',
    'entity_type',
    'entity_id',
    'summary',
  ],

});