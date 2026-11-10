const EVENT_SUBTYPES = Object.freeze([
  'exhibition',
  'award',
  'competition',
  'talk',
  'launch',
  'other',
]);


function listEvents(options) {

  return listEntities_(
    'events',
    options || {}
  );

}


function getEvent(id) {

  return getEntityById_(
    'events',
    id
  );

}


function getEventBySlug(slug) {

  return getEntityBySlug_(
    'events',
    slug
  );

}


function createEvent(data) {

  data =
    data || {};


  var title =
    sanitizeString_(
      data.title
    );


  assert_(
    title,
    'El título del evento es obligatorio.'
  );


  var subtype =
    normalizeStatus_(
      data.subtype,
      EVENT_SUBTYPES,
      'exhibition'
    );


  var status =
    normalizeStatus_(
      data.status,
      ENTITY_DEFINITIONS
        .events
        .statuses,
      'draft'
    );


  var startDate =
    normalizeDateString_(
      data.start_date
    );


  var endDate =
    normalizeDateString_(
      data.end_date
    );


  var year =
    toNumber_(
      data.year,
      ''
    );


  if (
    year === ''
    &&
    startDate
  ) {

    year =
      Number(
        startDate.slice(
          0,
          4
        )
      ) || '';

  }


  var now =
    nowIso_();


  var event = {

    id:
      generateId_(
        'evt'
      ),

    slug:
      makeUniqueSlug_(
        'events',
        data.slug
        || title
      ),

    title:
      title,

    subtype:
      subtype,


    artwork_name:
      sanitizeString_(
        data.artwork_name
      ),


    institution:
      sanitizeString_(
        data.institution
      ),

    venue:
      sanitizeString_(
        data.venue
      ),


    city:
      sanitizeString_(
        data.city
      ),

    country:
      sanitizeString_(
        data.country
      )
      || 'Argentina',


    start_date:
      startDate,

    end_date:
      endDate,

    year:
      year,


    participation_type:
      sanitizeString_(
        data.participation_type
      ),

    description:
      sanitizeString_(
        data.description
      ),


    status:
      status,

    featured:
      toBoolean_(
        data.featured
      ),

    sort_order:
      hasOwn_(
        data,
        'sort_order'
      )
        ? toNumber_(
            data.sort_order,
            0
          )
        : nextSortOrder_(
            'events'
          ),


    seo_title:
      sanitizeString_(
        data.seo_title
      ),

    seo_description:
      sanitizeString_(
        data.seo_description
      ),


    internal_notes:
      sanitizeString_(
        data.internal_notes
      ),


    created_at:
      now,

    updated_at:
      now,

    archived_at:
      status === 'archived'
        ? now
        : '',

  };


  dbInsert_(
    'events',
    event
  );


  auditLog_(
    'CREATE',
    'events',
    event.id,
    'Creado: '
    + event.title
  );


  invalidatePublicCache_();


  return event;
}


function updateEvent(
  id,
  data
) {

  data =
    data || {};


  var current =
    getEntityById_(
      'events',
      id
    );


  var patch = {};


  [
    'title',
    'artwork_name',
    'institution',
    'venue',
    'city',
    'country',
    'participation_type',
    'description',
    'seo_title',
    'seo_description',
    'internal_notes',
  ]
  .forEach(
    function(field) {

      patchStringField_(
        patch,
        data,
        field
      );

    }
  );


  patchNumberField_(
    patch,
    data,
    'year'
  );

  patchNumberField_(
    patch,
    data,
    'sort_order'
  );

  patchBooleanField_(
    patch,
    data,
    'featured'
  );

  patchDateField_(
    patch,
    data,
    'start_date'
  );

  patchDateField_(
    patch,
    data,
    'end_date'
  );


  if (
    hasOwn_(
      data,
      'title'
    )
  ) {

    assert_(
      patch.title,
      'El título del evento no puede quedar vacío.'
    );

  }


  if (
    hasOwn_(
      data,
      'slug'
    )
  ) {

    patch.slug =
      makeUniqueSlug_(
        'events',
        data.slug
        || current.slug,
        id
      );

  }


  if (
    hasOwn_(
      data,
      'subtype'
    )
  ) {

    patch.subtype =
      normalizeStatus_(
        data.subtype,
        EVENT_SUBTYPES,
        current.subtype
        || 'exhibition'
      );

  }


  if (
    hasOwn_(
      data,
      'status'
    )
  ) {

    patch.status =
      normalizeStatus_(
        data.status,
        ENTITY_DEFINITIONS
          .events
          .statuses,
        current.status
        || 'draft'
      );


    patch.archived_at =
      patch.status === 'archived'

        ? (
            current.archived_at
            || nowIso_()
          )

        : '';

  }


  if (
    hasOwn_(
      patch,
      'country'
    )
    &&
    !patch.country
  ) {

    patch.country =
      'Argentina';

  }


  if (
    hasOwn_(
      data,
      'start_date'
    )
    &&
    !hasOwn_(
      data,
      'year'
    )
    &&
    patch.start_date
  ) {

    patch.year =
      Number(
        patch.start_date
          .slice(
            0,
            4
          )
      )
      || current.year
      || '';

  }


  patch.updated_at =
    nowIso_();


  var updated =
    dbUpdateById_(
      'events',
      id,
      patch
    );


  auditLog_(
    'UPDATE',
    'events',
    id,
    'Actualizado: '
    + String(
      updated.title
      || current.title
    )
  );


  invalidatePublicCache_();


  return updated;
}


function archiveEvent(id) {

  return archiveEntity_(
    'events',
    id
  );

}


function restoreEvent(id) {

  return restoreEntity_(
    'events',
    id
  );

}


function publishEvent(id) {

  return publishEntity_(
    'events',
    id
  );

}


function hideEvent(id) {

  return hideEntity_(
    'events',
    id
  );

}


function setEventFeatured(
  id,
  featured
) {

  return setEntityFeatured_(
    'events',
    id,
    featured
  );

}


function duplicateEvent(id) {

  var current =
    getEntityById_(
      'events',
      id
    );


  return createEvent({

    title:
      String(
        current.title
        || 'Evento'
      )
      + ' (copia)',

    subtype:
      current.subtype,

    artwork_name:
      current.artwork_name,

    institution:
      current.institution,

    venue:
      current.venue,

    city:
      current.city,

    country:
      current.country,

    start_date:
      current.start_date,

    end_date:
      current.end_date,

    year:
      current.year,

    participation_type:
      current.participation_type,

    description:
      current.description,

    featured:
      false,

    seo_title:
      '',

    seo_description:
      '',

    internal_notes:
      'Duplicado de '
      + current.id,

    status:
      'draft',

  });
}