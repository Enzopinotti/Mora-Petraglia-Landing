function doGet(e) {
  try {
    var params =
      e && e.parameter
        ? e.parameter
        : {};


    var action =
      sanitizeString_(
        params.action
      )
      || 'health';


    /*
     * ========================================================
     * GET PÚBLICOS
     * ========================================================
     *
     * No enviamos tokens administrativos
     * mediante query string.
     */

    switch (action) {

      /*
       * ------------------------------------------------------
       * HEALTH
       * ------------------------------------------------------
       */

      case 'health':
        return apiSuccess_({
          status:
            'ok',

          cms:
            CMS.site.name,

          siteId:
            CMS.site.id,

          version:
            CMS.version,

          timestamp:
            nowIso_(),
        });


      /*
       * ------------------------------------------------------
       * BOOTSTRAP PÚBLICO
       * ------------------------------------------------------
       */

      case 'bootstrap':
        return apiSuccess_(
          getPublicBootstrap_()
        );


      /*
       * ------------------------------------------------------
       * MEDIA REAL
       * ------------------------------------------------------
       *
       * Ejemplo:
       *
       * /exec?action=media&id=med_a676d2b5b564
       *
       * Devuelve:
       *
       * {
       *   success: true,
       *   data: {
       *     id,
       *     fileName,
       *     mimeType,
       *     sizeBytes,
       *     base64
       *   }
       * }
       */

      case 'media':
        return apiSuccess_(
          getPublicMediaPayload_(
            params.id
            || params.mediaId
          )
        );


      /*
       * ------------------------------------------------------
       * PRODUCTS
       * ------------------------------------------------------
       */

      case 'products':
        return apiSuccess_(
          getPublicProducts_()
        );


      /*
       * ------------------------------------------------------
       * PROJECTS
       * ------------------------------------------------------
       */

      case 'projects':
        return apiSuccess_(
          getPublicProjects_()
        );


      /*
       * ------------------------------------------------------
       * EVENTS
       * ------------------------------------------------------
       */

      case 'events':
        return apiSuccess_(
          getPublicEvents_()
        );


      /*
       * ------------------------------------------------------
       * CONTENT
       * ------------------------------------------------------
       */

      case 'content':
        return apiSuccess_(
          getContentMap_()
        );


      /*
       * ------------------------------------------------------
       * SETTINGS
       * ------------------------------------------------------
       */

      case 'settings':
        return apiSuccess_(
          getSettingsMap_(
            true
          )
        );


      default:
        throw new Error(
          'Acción GET desconocida: '
          + action
        );
    }


  } catch (error) {
    return apiFailure_(
      error
    );
  }
}


/**
 * ============================================================
 * POST
 * ============================================================
 */


function doPost(e) {
  try {
    var body =
      parseApiBody_(
        e
      );


    var action =
      sanitizeString_(
        body.action
      );


    assert_(
      action,
      'Falta indicar action.'
    );


    /*
     * ========================================================
     * LOGIN
     * ========================================================
     *
     * Única operación de escritura
     * que no requiere sesión previa.
     */

    if (
      action === 'login'
    ) {
      var session =
        loginAdmin_(
          body.password
        );


      return apiSuccess_(
        session,
        'Sesión iniciada correctamente.'
      );
    }


    /*
     * ========================================================
     * LOGOUT
     * ========================================================
     *
     * Idempotente.
     */

    if (
      action === 'logout'
    ) {
      logoutAdmin_(
        sanitizeString_(
          body.token
        )
      );


      return apiSuccess_(
        true,
        'Sesión cerrada correctamente.'
      );
    }


    /*
     * ========================================================
     * AUTH
     * ========================================================
     */

    var token =
      sanitizeString_(
        body.token
      );


    requireAdmin_(
      token
    );


    /*
     * ========================================================
     * ACCIONES ADMINISTRATIVAS
     * ========================================================
     */

    switch (action) {

      /*
       * ------------------------------------------------------
       * BOOTSTRAP ADMIN
       * ------------------------------------------------------
       */

      case 'bootstrap':
        return apiSuccess_(
          getAdminBootstrap_()
        );


      /*
       * Lecturas administrativas.
       */

      case 'products':
        return apiSuccess_(
          getAdminProducts_()
        );


      case 'projects':
        return apiSuccess_(
          getAdminProjects_()
        );


      case 'events':
        return apiSuccess_(
          getAdminEvents_()
        );


      case 'content':
        return apiSuccess_(
          getContentMap_()
        );


      case 'settings':
        return apiSuccess_(
          getSettingsMap_(
            false
          )
        );


      /*
       * ======================================================
       * PRODUCTS
       * ======================================================
       */

      case 'createProduct':
        return apiSuccess_(
          createProduct(
            normalizeProductApiPayload_(
              body.product || {}
            )
          ),
          'Producto creado correctamente.'
        );


      case 'updateProduct':
        assert_(
          body.product
          && body.product.id,
          'Falta el ID del producto.'
        );


        return apiSuccess_(
          updateProduct(
            body.product.id,
            normalizeProductApiPayload_(
              body.product
            )
          ),
          'Producto actualizado correctamente.'
        );


      case 'updateProductStatus':
        return apiSuccess_(
          apiUpdateProductStatus_(
            body.id,
            body.status
          ),
          'Estado del producto actualizado.'
        );


      /*
       * Compatibilidad con endpoints anteriores.
       */

      case 'publishProduct':
        return apiSuccess_(
          apiUpdateProductStatus_(
            body.id,
            'published'
          )
        );


      case 'hideProduct':
        return apiSuccess_(
          apiUpdateProductStatus_(
            body.id,
            'hidden'
          )
        );


      case 'restoreProduct':
        return apiSuccess_(
          apiUpdateProductStatus_(
            body.id,
            'draft'
          )
        );


      case 'markProductSold':
        return apiSuccess_(
          apiUpdateProductStatus_(
            body.id,
            'sold'
          )
        );


      case 'deleteProduct':
        assert_(
          body.id,
          'Falta el ID del producto.'
        );


        return apiSuccess_(
          archiveProduct(
            body.id
          ),
          'Producto archivado correctamente.'
        );


      /*
       * ======================================================
       * PROJECTS
       * ======================================================
       */

      case 'createProject':
        return apiSuccess_(
          createProject(
            normalizeProjectApiPayload_(
              body.project || {}
            )
          ),
          'Mural creado correctamente.'
        );


      case 'updateProject':
        assert_(
          body.project
          && body.project.id,
          'Falta el ID del mural.'
        );


        return apiSuccess_(
          updateProject(
            body.project.id,
            normalizeProjectApiPayload_(
              body.project
            )
          ),
          'Mural actualizado correctamente.'
        );


      case 'updateProjectStatus':
        return apiSuccess_(
          apiUpdateProjectStatus_(
            body.id,
            body.status
          ),
          'Estado del mural actualizado.'
        );


      case 'publishProject':
        return apiSuccess_(
          apiUpdateProjectStatus_(
            body.id,
            'published'
          )
        );


      case 'hideProject':
        return apiSuccess_(
          apiUpdateProjectStatus_(
            body.id,
            'hidden'
          )
        );


      case 'restoreProject':
        return apiSuccess_(
          apiUpdateProjectStatus_(
            body.id,
            'draft'
          )
        );


      case 'deleteProject':
        assert_(
          body.id,
          'Falta el ID del mural.'
        );


        return apiSuccess_(
          archiveProject(
            body.id
          ),
          'Mural archivado correctamente.'
        );


      /*
       * ======================================================
       * EVENTS
       * ======================================================
       */

      case 'createEvent':
        return apiSuccess_(
          createEvent(
            normalizeEventApiPayload_(
              body.event || {}
            )
          ),
          'Exhibición creada correctamente.'
        );


      case 'updateEvent':
        assert_(
          body.event
          && body.event.id,
          'Falta el ID del evento.'
        );


        return apiSuccess_(
          updateEvent(
            body.event.id,
            normalizeEventApiPayload_(
              body.event
            )
          ),
          'Exhibición actualizada correctamente.'
        );


      case 'updateEventStatus':
        return apiSuccess_(
          apiUpdateEventStatus_(
            body.id,
            body.status
          ),
          'Estado de la exhibición actualizado.'
        );


      case 'publishEvent':
        return apiSuccess_(
          apiUpdateEventStatus_(
            body.id,
            'published'
          )
        );


      case 'hideEvent':
        return apiSuccess_(
          apiUpdateEventStatus_(
            body.id,
            'hidden'
          )
        );


      case 'restoreEvent':
        return apiSuccess_(
          apiUpdateEventStatus_(
            body.id,
            'draft'
          )
        );


      case 'deleteEvent':
        assert_(
          body.id,
          'Falta el ID del evento.'
        );


        return apiSuccess_(
          archiveEvent(
            body.id
          ),
          'Exhibición archivada correctamente.'
        );


      /*
       * ======================================================
       * CONTENT
       * ======================================================
       */

      case 'updateContent':
        return apiSuccess_(
          updateContent_(
            body.content || {}
          ),
          'Textos actualizados correctamente.'
        );


      /*
       * ======================================================
       * SETTINGS
       * ======================================================
       */

      case 'updateSettings':
        return apiSuccess_(
          updateSettings_(
            body.settings || {}
          ),
          'Configuración actualizada correctamente.'
        );


      /*
       * ======================================================
       * MEDIA
       * ======================================================
       */

      case 'uploadMedia':
        return apiSuccess_(
          apiUploadMedia_(
            body
          ),
          'Imagen subida correctamente.'
        );


      case 'updateMediaRole':
        assert_(
          body.id,
          'Falta el ID de la imagen.'
        );


        return apiSuccess_(
          updateMediaRole(
            body.id,
            body.role
          ),
          'Rol de imagen actualizado.'
        );


      case 'updateMediaAlt':
        assert_(
          body.id,
          'Falta el ID de la imagen.'
        );


        return apiSuccess_(
          updateMediaAlt(
            body.id,
            body.altText
          ),
          'Texto alternativo actualizado.'
        );


      case 'archiveMedia':
        assert_(
          body.id,
          'Falta el ID de la imagen.'
        );


        return apiSuccess_(
          archiveMedia(
            body.id
          ),
          'Imagen archivada correctamente.'
        );


      case 'restoreMedia':
        assert_(
          body.id,
          'Falta el ID de la imagen.'
        );


        return apiSuccess_(
          restoreMedia(
            body.id
          ),
          'Imagen restaurada correctamente.'
        );


      case 'updateMediaOrder':
        assert_(
          body.id,
          'Falta el ID de la imagen.'
        );


        return apiSuccess_(
          updateMediaOrder(
            body.id,
            body.sortOrder
          ),
          'Orden de imagen actualizado.'
        );


      default:
        throw new Error(
          'Acción POST desconocida: '
          + action
        );
    }


  } catch (error) {
    return apiFailure_(
      error
    );
  }
}


/**
 * ============================================================
 * STATUS PRODUCTS
 * ============================================================
 */


function apiUpdateProductStatus_(
  id,
  status
) {
  id =
    sanitizeString_(
      id
    );


  status =
    sanitizeString_(
      status
    );


  assert_(
    id,
    'Falta el ID del producto.'
  );


  assert_(
    ENTITY_DEFINITIONS
      .products
      .statuses
      .indexOf(
        status
      ) !== -1,
    'Estado de producto inválido: '
    + status
  );


  switch (status) {

    case 'published':
      return publishProduct(
        id
      );


    case 'hidden':
      return hideProduct(
        id
      );


    case 'sold':
      return markProductSold(
        id
      );


    case 'out_of_stock':
      return updateProduct(
        id,
        {
          status:
            'out_of_stock',

          stock:
            0,
        }
      );


    case 'draft':
      return updateProduct(
        id,
        {
          status:
            'draft',
        }
      );


    case 'archived':
      return archiveProduct(
        id
      );


    default:
      throw new Error(
        'Estado de producto no soportado.'
      );
  }
}


/**
 * ============================================================
 * STATUS PROJECTS
 * ============================================================
 */


function apiUpdateProjectStatus_(
  id,
  status
) {
  id =
    sanitizeString_(
      id
    );


  status =
    sanitizeString_(
      status
    );


  assert_(
    id,
    'Falta el ID del mural.'
  );


  assert_(
    ENTITY_DEFINITIONS
      .projects
      .statuses
      .indexOf(
        status
      ) !== -1,
    'Estado de mural inválido: '
    + status
  );


  switch (status) {

    case 'published':
      return publishProject(
        id
      );


    case 'hidden':
      return hideProject(
        id
      );


    case 'draft':
      return updateProject(
        id,
        {
          status:
            'draft',
        }
      );


    case 'archived':
      return archiveProject(
        id
      );


    default:
      throw new Error(
        'Estado de mural no soportado.'
      );
  }
}


/**
 * ============================================================
 * STATUS EVENTS
 * ============================================================
 */


function apiUpdateEventStatus_(
  id,
  status
) {
  id =
    sanitizeString_(
      id
    );


  status =
    sanitizeString_(
      status
    );


  assert_(
    id,
    'Falta el ID de la exhibición.'
  );


  assert_(
    ENTITY_DEFINITIONS
      .events
      .statuses
      .indexOf(
        status
      ) !== -1,
    'Estado de exhibición inválido: '
    + status
  );


  switch (status) {

    case 'published':
      return publishEvent(
        id
      );


    case 'hidden':
      return hideEvent(
        id
      );


    case 'draft':
      return updateEvent(
        id,
        {
          status:
            'draft',
        }
      );


    case 'archived':
      return archiveEvent(
        id
      );


    default:
      throw new Error(
        'Estado de exhibición no soportado.'
      );
  }
}


/**
 * ============================================================
 * BOOTSTRAP
 * ============================================================
 */


function getPublicBootstrap_() {
  var cached =
    getCachedJson_(
      CMS.cache.keys.bootstrap
    );


  if (cached) {
    return cached;
  }


  var result = {
    content:
      getContentMap_(),

    settings:
      getSettingsMap_(
        true
      ),

    products:
      getPublicProducts_(),

    projects:
      getPublicProjects_(),

    events:
      getPublicEvents_(),
  };


  return setCachedJson_(
    CMS.cache.keys.bootstrap,
    result
  );
}


function getAdminBootstrap_() {
  return {
    content:
      getContentMap_(),

    settings:
      getSettingsMap_(
        false
      ),

    products:
      getAdminProducts_(),

    projects:
      getAdminProjects_(),

    events:
      getAdminEvents_(),
  };
}


/**
 * ============================================================
 * PRODUCTS
 * ============================================================
 */


function getPublicProducts_() {
  return dbReadAll_(
    CMS.database.sheets.products
  )
  .filter(
    function(product) {
      return [
        'published',
        'sold',
        'out_of_stock',
      ]
      .indexOf(
        String(
          product.status
          || ''
        )
      ) !== -1;
    }
  )
  .map(
    function(product) {
      return serializeProductForApi_(
        product,
        false
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function getAdminProducts_() {
  return dbReadAll_(
    CMS.database.sheets.products
  )
  .map(
    function(product) {
      return serializeProductForApi_(
        product,
        true
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function serializeProductForApi_(
  product,
  admin
) {
  var result =
    Object.assign(
      {},
      product
    );


  result.media =
    getApiMedia_(
      'products',
      product.id
    );


  if (
    !admin
  ) {
    delete result.internal_notes;
    delete result.archived_at;


    if (
      product.status
      === 'sold'
    ) {
      result.availability =
        'sold';

      result.status =
        'published';


    } else if (
      product.status
      === 'out_of_stock'
    ) {
      result.availability =
        'out_of_stock';

      result.status =
        'published';


    } else if (
      product.stock !== ''
      &&
      product.stock !== null
      &&
      product.stock !== undefined
      &&
      Number(
        product.stock
      ) === 0
    ) {
      result.availability =
        'out_of_stock';


    } else if (
      product.sale_mode
      === 'inquiry'
    ) {
      result.availability =
        'on_request';


    } else {
      result.availability =
        'available';
    }
  }


  var cover =
    result.media.find(
      function(media) {
        return media.role
          === 'cover';
      }
    );


  if (
    !cover
  ) {
    cover =
      result.media[0];
  }


  if (
    cover
  ) {
    result.image =
      cover.url;
  }


  return result;
}


/**
 * ============================================================
 * PROJECTS
 * ============================================================
 */


function getPublicProjects_() {
  return dbReadAll_(
    CMS.database.sheets.projects
  )
  .filter(
    function(project) {
      return String(
        project.status
        || ''
      ) === 'published';
    }
  )
  .map(
    function(project) {
      return serializeProjectForApi_(
        project,
        false
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function getAdminProjects_() {
  return dbReadAll_(
    CMS.database.sheets.projects
  )
  .map(
    function(project) {
      return serializeProjectForApi_(
        project,
        true
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function serializeProjectForApi_(
  project,
  admin
) {
  var result =
    Object.assign(
      {},
      project
    );


  result.media =
    getApiMedia_(
      'projects',
      project.id
    );


  if (
    !admin
  ) {
    delete result.internal_notes;
    delete result.archived_at;
  }


  var cover =
    result.media.find(
      function(media) {
        return media.role
          === 'cover';
      }
    )
    ||
    result.media[0];


  if (
    cover
  ) {
    result.image =
      cover.url;
  }


  return result;
}


/**
 * ============================================================
 * EVENTS
 * ============================================================
 */


function getPublicEvents_() {
  return dbReadAll_(
    CMS.database.sheets.events
  )
  .filter(
    function(event) {
      return String(
        event.status
        || ''
      ) === 'published';
    }
  )
  .map(
    function(event) {
      return serializeEventForApi_(
        event,
        false
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function getAdminEvents_() {
  return dbReadAll_(
    CMS.database.sheets.events
  )
  .map(
    function(event) {
      return serializeEventForApi_(
        event,
        true
      );
    }
  )
  .sort(
    apiSortOrder_
  );
}


function serializeEventForApi_(
  event,
  admin
) {
  var result =
    Object.assign(
      {},
      event
    );


  result.short_description =
    event.description
    || '';


  result.date_label =
    createEventDateLabel_(
      event
    );


  result.media =
    getApiMedia_(
      'events',
      event.id
    );


  if (
    !admin
  ) {
    delete result.internal_notes;
    delete result.archived_at;
  }


  var cover =
    result.media.find(
      function(media) {
        return media.role
          === 'cover';
      }
    )
    ||
    result.media[0];


  if (
    cover
  ) {
    result.image =
      cover.url;
  }


  return result;
}


/**
 * Fecha visible evento.
 */
function createEventDateLabel_(
  event
) {
  var pieces = [];


  if (
    event.institution
  ) {
    pieces.push(
      event.institution
    );
  }


  if (
    event.venue
    &&
    event.venue
    !== event.institution
  ) {
    pieces.push(
      event.venue
    );
  }


  if (
    event.year
  ) {
    pieces.push(
      String(
        event.year
      )
    );
  }


  return pieces.join(
    ' · '
  );
}


/**
 * ============================================================
 * MEDIA SERIALIZATION
 * ============================================================
 */


function getApiMedia_(
  entityType,
  entityId
) {
  return listEntityMedia(
    entityType,
    entityId,
    false
  )
  .map(
    function(media) {
      return {
        id:
          media.id,

        /*
         * Temporalmente sigue devolviendo
         * Drive directamente.
         *
         * En el próximo paso lo vamos a
         * reemplazar por /api/media?id=...
         */
        url:
          media.downloadUrl
          || '',

        role:
          media.role,

        alt:
          media.alt_text
          || '',

        sort_order:
          Number(
            media.sort_order
            || 0
          ),
      };
    }
  );
}


/**
 * ============================================================
 * MEDIA UPLOAD HTTP
 * ============================================================
 */


function apiUploadMedia_(
  payload
) {
  var entityType =
    sanitizeString_(
      payload.entityType
    );


  var entityId =
    sanitizeString_(
      payload.entityId
    );


  var fileName =
    safeFileName_(
      payload.fileName
    );


  var mimeType =
    sanitizeString_(
      payload.mimeType
    );


  var base64 =
    String(
      payload.base64
      || ''
    );


  assert_(
    entityType,
    'Falta entityType.'
  );


  assert_(
    entityId,
    'Falta entityId.'
  );


  assert_(
    fileName,
    'Falta fileName.'
  );


  assert_(
    mimeType,
    'Falta mimeType.'
  );


  assert_(
    base64,
    'No se recibió la imagen.'
  );


  var bytes =
    Utilities
      .base64Decode(
        base64
      );


  var blob =
    Utilities
      .newBlob(
        bytes,
        mimeType,
        fileName
      );


  var media =
    uploadMediaBlob_(
      entityType,
      entityId,
      blob,
      {
        role:
          payload.role
          || 'gallery',

        altText:
          payload.altText
          || '',
      }
    );


  return {
    id:
      media.id,

    url:
      media.downloadUrl
      || '',

    role:
      media.role,

    alt:
      media.alt_text
      || '',

    sort_order:
      Number(
        media.sort_order
        || 0
      ),
  };
}


/**
 * ============================================================
 * NORMALIZACIÓN PAYLOAD PRODUCTS
 * ============================================================
 */


function normalizeProductApiPayload_(
  product
) {
  var normalized =
    Object.assign(
      {},
      product
      || {}
    );


  delete normalized.media;
  delete normalized.image;
  delete normalized.availability;

  delete normalized.created_at;
  delete normalized.updated_at;
  delete normalized.archived_at;


  return normalized;
}


/**
 * ============================================================
 * NORMALIZACIÓN PAYLOAD PROJECTS
 * ============================================================
 */


function normalizeProjectApiPayload_(
  project
) {
  var normalized =
    Object.assign(
      {},
      project
      || {}
    );


  delete normalized.media;
  delete normalized.image;
  delete normalized.span;

  delete normalized.created_at;
  delete normalized.updated_at;
  delete normalized.archived_at;


  return normalized;
}


/**
 * ============================================================
 * NORMALIZACIÓN PAYLOAD EVENTS
 * ============================================================
 */


function normalizeEventApiPayload_(
  event
) {
  var normalized =
    Object.assign(
      {},
      event
      || {}
    );


  if (
    hasOwn_(
      normalized,
      'short_description'
    )
    &&
    String(
      normalized.short_description
      || ''
    )
    !==
    String(
      normalized.description
      || ''
    )
  ) {
    normalized.description =
      normalized.short_description;
  }


  if (
    hasOwn_(
      normalized,
      'date_label'
    )
  ) {
    var generatedLabel =
      createEventDateLabel_(
        normalized
      );


    var receivedLabel =
      sanitizeString_(
        normalized.date_label
      );


    if (
      receivedLabel
      !== generatedLabel
    ) {
      normalized.institution =
        receivedLabel;

      normalized.venue =
        '';

      normalized.year =
        '';
    }
  }


  delete normalized.short_description;
  delete normalized.date_label;

  delete normalized.media;
  delete normalized.image;

  delete normalized.created_at;
  delete normalized.updated_at;
  delete normalized.archived_at;


  return normalized;
}


/**
 * ============================================================
 * REQUEST
 * ============================================================
 */


function parseApiBody_(
  e
) {
  assert_(
    e
    && e.postData
    && e.postData.contents,
    'Request POST vacío.'
  );


  try {
    var parsed =
      JSON.parse(
        e.postData.contents
      );


    assert_(
      parsed
      &&
      typeof parsed
      === 'object',
      'El body debe ser un objeto JSON.'
    );


    return parsed;


  } catch (error) {
    if (
      error
      &&
      error.message
      !==
      'El body debe ser un objeto JSON.'
    ) {
      throw new Error(
        'El body debe ser JSON válido.'
      );
    }


    throw error;
  }
}


/**
 * ============================================================
 * RESPONSES
 * ============================================================
 */


function apiSuccess_(
  data,
  message
) {
  var response = {
    success:
      true,

    data:
      data,
  };


  if (
    message
  ) {
    response.message =
      message;
  }


  return apiJson_(
    response
  );
}


function apiFailure_(
  error
) {
  var message =
    error
    && error.message
      ? error.message
      : String(
          error
        );


  console.error(
    '[Mora CMS] '
    + message
  );


  return apiJson_({
    success:
      false,

    error:
      message,
  });
}


function apiJson_(
  value
) {
  return ContentService
    .createTextOutput(
      JSON.stringify(
        value
      )
    )
    .setMimeType(
      ContentService
        .MimeType
        .JSON
    );
}


/**
 * ============================================================
 * ORDER
 * ============================================================
 */


function apiSortOrder_(
  left,
  right
) {
  return (
    Number(
      left.sort_order
      || 0
    )
    -
    Number(
      right.sort_order
      || 0
    )
  );
}