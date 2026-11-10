const MEDIA_ENTITY_TYPES = Object.freeze([
  'products',
  'projects',
  'events',
  'site',
]);


const MEDIA_ROLES = Object.freeze([
  'cover',
  'gallery',
  'detail',
  'ambient',
  'signature',
]);


/**
 * ============================================================
 * LISTADO
 * ============================================================
 */


/**
 * Devuelve las imágenes de una entidad.
 */
function listEntityMedia(
  entityType,
  entityId,
  includeArchived
) {
  validateMediaEntity_(
    entityType,
    entityId
  );


  var rows =
    dbReadAll_(
      CMS.database.sheets.media
    )
    .filter(
      function(row) {
        return (
          String(row.entity_type)
          === String(entityType)

          &&

          String(row.entity_id)
          === String(entityId)
        );
      }
    );


  /*
   * Por defecto no devolvemos
   * imágenes archivadas.
   */
  if (
    !toBoolean_(
      includeArchived
    )
  ) {
    rows =
      rows.filter(
        function(row) {
          return !row.archived_at;
        }
      );
  }


  rows.sort(
    function(a, b) {
      return (
        Number(a.sort_order || 0)
        -
        Number(b.sort_order || 0)
      );
    }
  );


  return rows.map(
    function(row) {
      return hydrateMedia_(
        row
      );
    }
  );
}


/**
 * Obtiene una imagen por ID.
 */
function getMedia(mediaId) {
  mediaId =
    sanitizeString_(
      mediaId
    );


  assert_(
    mediaId,
    'Falta el ID de la imagen.'
  );


  var row =
    dbFindById_(
      CMS.database.sheets.media,
      mediaId
    );


  assert_(
    row,
    'No se encontró el archivo '
    + mediaId
  );


  return hydrateMedia_(
    row
  );
}


/**
 * ============================================================
 * UPLOAD
 * ============================================================
 */


/**
 * Compatibilidad con HtmlService.
 */
function uploadMediaForm(
  formObject
) {
  assert_(
    formObject,
    'No se recibió el formulario.'
  );


  var blob =
    formObject.file;


  assert_(
    blob,
    'Seleccioná una imagen.'
  );


  return uploadMediaBlob_(
    sanitizeString_(
      formObject.entityType
    ),

    sanitizeString_(
      formObject.entityId
    ),

    blob,

    {
      role:
        sanitizeString_(
          formObject.role
        )
        || 'gallery',

      altText:
        sanitizeString_(
          formObject.altText
        ),
    }
  );
}


/**
 * Función central para subir imágenes.
 */
function uploadMediaBlob_(
  entityType,
  entityId,
  blob,
  options
) {
  options =
    options || {};


  validateMediaEntity_(
    entityType,
    entityId
  );


  validateMediaBlob_(
    blob
  );


  var role =
    normalizeMediaRole_(
      options.role
    );


  var folder =
    getOrCreateEntityFolder_(
      entityType,
      entityId
    );


  var originalName =
    safeFileName_(
      blob.getName()
      || 'imagen'
    );


  var fileName =
    makeUniqueMediaFileName_(
      folder,
      originalName
    );


  blob.setName(
    fileName
  );


  /*
   * Crear archivo.
   */
  var file =
    folder.createFile(
      blob
    );


  /*
   * Por ahora conservamos acceso público.
   *
   * Más adelante, cuando el proxy de imágenes
   * esté funcionando, podríamos incluso
   * dejar de depender de esta configuración.
   */
  try {
    makeDriveFilePublic_(
      file
    );

  } catch (error) {
    try {
      file.setTrashed(
        true
      );
    } catch (
      cleanupError
    ) {
      Logger.log(
        'Error limpiando archivo: '
        + cleanupError.message
      );
    }


    throw error;
  }


  var now =
    nowIso_();


  var record = {
    id:
      generateId_(
        'med'
      ),

    entity_type:
      entityType,

    entity_id:
      entityId,

    drive_file_id:
      file.getId(),

    file_name:
      file.getName(),

    mime_type:
      file.getMimeType(),

    role:
      role,

    alt_text:
      sanitizeString_(
        options.altText
      ),

    sort_order:
      nextMediaSortOrder_(
        entityType,
        entityId
      ),

    created_at:
      now,

    archived_at:
      '',
  };


  /*
   * Guardar en DB.
   *
   * Si falla, limpiar Drive.
   */
  try {
    dbInsert_(
      CMS.database.sheets.media,
      record
    );

  } catch (error) {
    try {
      file.setTrashed(
        true
      );
    } catch (
      cleanupError
    ) {
      Logger.log(
        'Error limpiando archivo: '
        + cleanupError.message
      );
    }


    throw error;
  }


  /*
   * Solo una portada.
   */
  if (
    role === 'cover'
  ) {
    unsetExistingCover_(
      entityType,
      entityId,
      record.id
    );
  }


  auditLog_(
    'UPLOAD_MEDIA',
    entityType,
    entityId,
    'Imagen subida: '
    + file.getName()
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    record
  );
}


/**
 * ============================================================
 * EDICIÓN
 * ============================================================
 */


function updateMediaRole(
  mediaId,
  role
) {
  var current =
    getMedia(
      mediaId
    );


  assert_(
    !current.archived_at,
    'No se puede modificar una imagen archivada.'
  );


  var newRole =
    normalizeMediaRole_(
      role
    );


  if (
    newRole === 'cover'
  ) {
    unsetExistingCover_(
      current.entity_type,
      current.entity_id,
      mediaId
    );
  }


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        role:
          newRole,
      }
    );


  auditLog_(
    'UPDATE_MEDIA',
    current.entity_type,
    current.entity_id,
    'Rol actualizado: '
    + current.file_name
    + ' → '
    + newRole
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    updated
  );
}


/**
 * Actualiza alt text.
 */
function updateMediaAlt(
  mediaId,
  altText
) {
  var current =
    getMedia(
      mediaId
    );


  assert_(
    !current.archived_at,
    'No se puede modificar una imagen archivada.'
  );


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        alt_text:
          sanitizeString_(
            altText
          ),
      }
    );


  auditLog_(
    'UPDATE_MEDIA',
    current.entity_type,
    current.entity_id,
    'Alt text actualizado: '
    + current.file_name
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    updated
  );
}


/**
 * Cambia el orden.
 */
function updateMediaOrder(
  mediaId,
  sortOrder
) {
  var current =
    getMedia(
      mediaId
    );


  assert_(
    !current.archived_at,
    'No se puede ordenar una imagen archivada.'
  );


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        sort_order:
          toNumber_(
            sortOrder,
            0
          ),
      }
    );


  auditLog_(
    'UPDATE_MEDIA_ORDER',
    current.entity_type,
    current.entity_id,
    'Orden actualizado: '
    + current.file_name
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    updated
  );
}


/**
 * Definir como portada.
 */
function setMediaAsCover(
  mediaId
) {
  return updateMediaRole(
    mediaId,
    'cover'
  );
}


/**
 * ============================================================
 * ARCHIVADO
 * ============================================================
 */


/**
 * Soft delete.
 */
function archiveMedia(
  mediaId
) {
  var current =
    getMedia(
      mediaId
    );


  if (
    current.archived_at
  ) {
    return current;
  }


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        archived_at:
          nowIso_(),
      }
    );


  auditLog_(
    'ARCHIVE_MEDIA',
    current.entity_type,
    current.entity_id,
    'Imagen archivada: '
    + current.file_name
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    updated
  );
}


/**
 * Restaurar.
 */
function restoreMedia(
  mediaId
) {
  var current =
    getMedia(
      mediaId
    );


  if (
    !current.archived_at
  ) {
    return current;
  }


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        archived_at:
          '',
      }
    );


  auditLog_(
    'RESTORE_MEDIA',
    current.entity_type,
    current.entity_id,
    'Imagen restaurada: '
    + current.file_name
  );


  invalidatePublicCache_();


  return hydrateMedia_(
    updated
  );
}


/**
 * Eliminación definitiva.
 *
 * No se usa normalmente desde el panel.
 */
function permanentlyDeleteMedia(
  mediaId
) {
  var current =
    getMedia(
      mediaId
    );


  try {
    DriveApp
      .getFileById(
        current.drive_file_id
      )
      .setTrashed(
        true
      );

  } catch (error) {
    Logger.log(
      'No se pudo mandar el archivo a papelera: '
      + error.message
    );
  }


  var updated =
    dbUpdateById_(
      CMS.database.sheets.media,
      mediaId,
      {
        archived_at:
          nowIso_(),
      }
    );


  auditLog_(
    'DELETE_MEDIA',
    current.entity_type,
    current.entity_id,
    'Archivo enviado a papelera: '
    + current.file_name
  );


  invalidatePublicCache_();


  return updated;
}


/**
 * ============================================================
 * VALIDACIONES
 * ============================================================
 */


function validateMediaEntity_(
  entityType,
  entityId
) {
  assert_(
    MEDIA_ENTITY_TYPES
      .indexOf(
        entityType
      ) !== -1,
    'Tipo de entidad inválido.'
  );


  assert_(
    entityId,
    'Falta entityId.'
  );


  if (
    entityType === 'site'
  ) {
    return true;
  }


  var record =
    dbFindById_(
      entityType,
      entityId
    );


  assert_(
    record,
    'No existe '
    + entityType
    + ' con ID '
    + entityId
  );


  return true;
}


/**
 * Valida archivo.
 */
function validateMediaBlob_(
  blob
) {
  assert_(
    blob,
    'No se recibió ningún archivo.'
  );


  var mimeType =
    sanitizeString_(
      blob.getContentType()
    );


  assert_(
    CMS.media
      .allowedMimeTypes
      .indexOf(
        mimeType
      ) !== -1,
    'Formato no permitido: '
    + mimeType
  );


  var size =
    blob
      .getBytes()
      .length;


  assert_(
    size
    <= CMS.media.maxBytes,
    'La imagen supera el máximo permitido de '
    + Math.round(
        CMS.media.maxBytes
        / 1024
        / 1024
      )
    + ' MB.'
  );


  return true;
}


/**
 * Normaliza rol.
 */
function normalizeMediaRole_(
  role
) {
  role =
    sanitizeString_(
      role
    );


  if (
    MEDIA_ROLES
      .indexOf(
        role
      )
    === -1
  ) {
    return 'gallery';
  }


  return role;
}


/**
 * ============================================================
 * DRIVE
 * ============================================================
 */


function getEntityRootFolder_(
  entityType
) {
  var props =
    getScriptProps_();


  var propertyMap = {
    products:
      'FOLDER_PRODUCTS',

    projects:
      'FOLDER_PROJECTS',

    events:
      'FOLDER_EVENTS',

    site:
      'FOLDER_SITE',
  };


  var propertyName =
    propertyMap[
      entityType
    ];


  assert_(
    propertyName,
    'No existe carpeta configurada para '
    + entityType
  );


  var folderId =
    props.getProperty(
      propertyName
    );


  assert_(
    folderId,
    'Falta configurar '
    + propertyName
  );


  return DriveApp
    .getFolderById(
      folderId
    );
}


/**
 * Carpeta específica para cada entidad.
 */
function getOrCreateEntityFolder_(
  entityType,
  entityId
) {
  var root =
    getEntityRootFolder_(
      entityType
    );


  var folderName =
    sanitizeString_(
      entityId
    );


  var folders =
    root.getFoldersByName(
      folderName
    );


  if (
    folders.hasNext()
  ) {
    return folders.next();
  }


  return root.createFolder(
    folderName
  );
}


/**
 * Compartir archivo mediante enlace.
 */
function makeDriveFilePublic_(
  file
) {
  try {
    file.setSharing(
      DriveApp.Access
        .ANYONE_WITH_LINK,

      DriveApp.Permission
        .VIEW
    );

  } catch (error) {
    throw new Error(
      'Google Drive no permitió compartir la imagen públicamente. '
      + error.message
    );
  }


  return file;
}


/**
 * ============================================================
 * URL DRIVE
 * ============================================================
 *
 * La mantenemos temporalmente por compatibilidad.
 *
 * Ya comprobamos que Google puede responder 403 cuando
 * esta URL se embebe directamente desde otro sitio.
 *
 * El proxy que agregaremos después dejará de depender
 * de esta URL.
 */


function getPublicDriveImageUrl_(
  file
) {
  var fileId =
    encodeURIComponent(
      file.getId()
    );


  var url =
    'https://drive.google.com/uc'
    + '?export=view'
    + '&id='
    + fileId;


  try {
    var resourceKey =
      file.getResourceKey();


    if (resourceKey) {
      url +=
        '&resourcekey='
        +
        encodeURIComponent(
          resourceKey
        );
    }

  } catch (error) {
    /*
     * No todos los archivos necesitan resourceKey.
     */
  }


  return url;
}


/**
 * ============================================================
 * PORTADA
 * ============================================================
 */


function unsetExistingCover_(
  entityType,
  entityId,
  excludeMediaId
) {
  var media =
    dbReadAll_(
      CMS.database.sheets.media
    )
    .filter(
      function(row) {
        return (
          String(row.entity_type)
          === String(entityType)

          &&

          String(row.entity_id)
          === String(entityId)

          &&

          String(row.role)
          === 'cover'

          &&

          !row.archived_at

          &&

          String(row.id)
          !==
          String(
            excludeMediaId
            || ''
          )
        );
      }
    );


  media.forEach(
    function(item) {
      dbUpdateById_(
        CMS.database.sheets.media,
        item.id,
        {
          role:
            'gallery',
        }
      );
    }
  );
}


/**
 * ============================================================
 * ORDEN
 * ============================================================
 */


function nextMediaSortOrder_(
  entityType,
  entityId
) {
  var media =
    dbReadAll_(
      CMS.database.sheets.media
    )
    .filter(
      function(row) {
        return (
          String(row.entity_type)
          === String(entityType)

          &&

          String(row.entity_id)
          === String(entityId)
        );
      }
    );


  var max =
    media.reduce(
      function(
        current,
        item
      ) {
        return Math.max(
          current,
          Number(
            item.sort_order
            || 0
          )
        );
      },
      0
    );


  return max + 10;
}


/**
 * ============================================================
 * NOMBRE ÚNICO
 * ============================================================
 */


function makeUniqueMediaFileName_(
  folder,
  originalName
) {
  var name =
    safeFileName_(
      originalName
    );


  if (
    !folder
      .getFilesByName(
        name
      )
      .hasNext()
  ) {
    return name;
  }


  var dot =
    name.lastIndexOf('.');


  var base =
    dot > 0
      ? name.slice(
          0,
          dot
        )
      : name;


  var extension =
    dot > 0
      ? name.slice(dot)
      : '';


  var index = 2;


  while (true) {
    var candidate =
      base
      + '-'
      + index
      + extension;


    if (
      !folder
        .getFilesByName(
          candidate
        )
        .hasNext()
    ) {
      return candidate;
    }


    index += 1;
  }
}


/**
 * ============================================================
 * HYDRATION
 * ============================================================
 */


/**
 * Registro Sheets → objeto API/admin.
 */
function hydrateMedia_(
  record
) {
  var media =
    Object.assign(
      {},
      record
    );


  if (
    !media.drive_file_id
  ) {
    return media;
  }


  try {
    var file =
      DriveApp
        .getFileById(
          media.drive_file_id
        );


    media.driveUrl =
      file.getUrl();


    /*
     * Esto se mantiene por compatibilidad
     * mientras hacemos el proxy.
     */
    media.publicUrl =
      getPublicDriveImageUrl_(
        file
      );


    media.downloadUrl =
      media.publicUrl;


    media.sizeBytes =
      file.getSize();


    media.fileMissing =
      false;


  } catch (error) {
    media.driveUrl = '';
    media.publicUrl = '';
    media.downloadUrl = '';
    media.sizeBytes = 0;
    media.fileMissing = true;


    Logger.log(
      'No se pudo hidratar media '
      + String(
          media.id || ''
        )
      + ': '
      + error.message
    );
  }


  return media;
}


/**
 * ============================================================
 * PAYLOAD REAL DE IMAGEN
 * ============================================================
 *
 * Esta función es la nueva parte importante.
 *
 * Lee los bytes reales desde Google Drive usando
 * los permisos del usuario que ejecuta Apps Script.
 *
 * No depende de:
 *
 * drive.google.com/uc
 *
 * El próximo paso será que Vercel consuma este
 * endpoint y responda al navegador como image/png,
 * image/jpeg o image/webp.
 */


function getPublicMediaPayload_(
  mediaId
) {
  mediaId =
    sanitizeString_(
      mediaId
    );


  assert_(
    mediaId,
    'Falta el ID de la imagen.'
  );


  /*
   * Buscar registro en nuestra tabla.
   */
  var record =
    dbFindById_(
      CMS.database.sheets.media,
      mediaId
    );


  assert_(
    record,
    'No se encontró la imagen '
    + mediaId
    + '.'
  );


  /*
   * No servir imágenes archivadas.
   */
  assert_(
    !record.archived_at,
    'La imagen está archivada.'
  );


  assert_(
    record.drive_file_id,
    'La imagen no tiene archivo de Drive asociado.'
  );


  /*
   * Obtener archivo real.
   */
  var file =
    DriveApp
      .getFileById(
        record.drive_file_id
      );


  /*
   * Obtener Blob.
   */
  var blob =
    file.getBlob();


  var mimeType =
    sanitizeString_(
      blob.getContentType()
      || record.mime_type
    );


  /*
   * Solamente imágenes permitidas.
   */
  assert_(
    CMS.media
      .allowedMimeTypes
      .indexOf(
        mimeType
      ) !== -1,
    'Formato de imagen no permitido: '
    + mimeType
  );


  /*
   * Bytes reales.
   */
  var bytes =
    blob.getBytes();


  assert_(
    bytes
    && bytes.length > 0,
    'El archivo de imagen está vacío.'
  );


  return {
    id:
      record.id,

    fileName:
      record.file_name
      || file.getName(),

    mimeType:
      mimeType,

    sizeBytes:
      bytes.length,

    base64:
      Utilities
        .base64Encode(
          bytes
        ),
  };
}