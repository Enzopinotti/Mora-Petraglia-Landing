const PROJECT_SUBTYPES = Object.freeze([
  'mural',
  'installation',
  'collaboration',
  'other',
]);


function listProjects(options) {

  return listEntities_(
    'projects',
    options || {}
  );

}


function getProject(id) {

  return getEntityById_(
    'projects',
    id
  );

}


function getProjectBySlug(slug) {

  return getEntityBySlug_(
    'projects',
    slug
  );

}


function createProject(data) {

  data =
    data || {};


  var title =
    sanitizeString_(
      data.title
    );


  assert_(
    title,
    'El título del proyecto es obligatorio.'
  );


  var subtype =
    normalizeStatus_(
      data.subtype,
      PROJECT_SUBTYPES,
      'mural'
    );


  var status =
    normalizeStatus_(
      data.status,
      ENTITY_DEFINITIONS
        .projects
        .statuses,
      'draft'
    );


  var now =
    nowIso_();


  var project = {

    id:
      generateId_(
        'prj'
      ),

    slug:
      makeUniqueSlug_(
        'projects',
        data.slug
        || title
      ),

    title:
      title,

    subtype:
      subtype,


    short_description:
      sanitizeString_(
        data.short_description
      ),

    description:
      sanitizeString_(
        data.description
      ),


    location:
      sanitizeString_(
        data.location
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

    year:
      toNumber_(
        data.year,
        ''
      ),


    client:
      sanitizeString_(
        data.client
      ),

    technique:
      sanitizeString_(
        data.technique
      ),

    dimensions:
      sanitizeString_(
        data.dimensions
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
            'projects'
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
    'projects',
    project
  );


  auditLog_(
    'CREATE',
    'projects',
    project.id,
    'Creado: '
    + project.title
  );


  invalidatePublicCache_();


  return project;
}


function updateProject(
  id,
  data
) {

  data =
    data || {};


  var current =
    getEntityById_(
      'projects',
      id
    );


  var patch = {};


  [
    'title',
    'short_description',
    'description',
    'location',
    'city',
    'country',
    'client',
    'technique',
    'dimensions',
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


  if (
    hasOwn_(
      data,
      'title'
    )
  ) {

    assert_(
      patch.title,
      'El título del proyecto no puede quedar vacío.'
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
        'projects',
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
        PROJECT_SUBTYPES,
        current.subtype
        || 'mural'
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
          .projects
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


  patch.updated_at =
    nowIso_();


  var updated =
    dbUpdateById_(
      'projects',
      id,
      patch
    );


  auditLog_(
    'UPDATE',
    'projects',
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


function archiveProject(id) {

  return archiveEntity_(
    'projects',
    id
  );

}


function restoreProject(id) {

  return restoreEntity_(
    'projects',
    id
  );

}


function publishProject(id) {

  return publishEntity_(
    'projects',
    id
  );

}


function hideProject(id) {

  return hideEntity_(
    'projects',
    id
  );

}


function setProjectFeatured(
  id,
  featured
) {

  return setEntityFeatured_(
    'projects',
    id,
    featured
  );

}


function duplicateProject(id) {

  var current =
    getEntityById_(
      'projects',
      id
    );


  return createProject({

    title:
      String(
        current.title
        || 'Proyecto'
      )
      + ' (copia)',

    subtype:
      current.subtype,

    short_description:
      current.short_description,

    description:
      current.description,

    location:
      current.location,

    city:
      current.city,

    country:
      current.country,

    year:
      current.year,

    client:
      current.client,

    technique:
      current.technique,

    dimensions:
      current.dimensions,

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