function setupMoraCms() {
  var props =
    getScriptProps_();


  /*
   * ========================================================
   * SPREADSHEET
   * ========================================================
   */

  var spreadsheetId =
    props.getProperty(
      'SPREADSHEET_ID'
    );


  var spreadsheet;


  if (spreadsheetId) {
    spreadsheet =
      SpreadsheetApp
        .openById(
          spreadsheetId
        );

  } else {
    spreadsheet =
      SpreadsheetApp.create(
        CMS.database.name
      );


    spreadsheetId =
      spreadsheet.getId();


    props.setProperty(
      'SPREADSHEET_ID',
      spreadsheetId
    );
  }


  /*
   * Locale y timezone.
   */
  try {
    spreadsheet
      .setSpreadsheetLocale(
        'es_AR'
      );

    spreadsheet
      .setSpreadsheetTimeZone(
        CMS.site.timezone
      );

  } catch (error) {
    /*
     * No queremos romper el setup solo
     * por un problema de presentación.
     */
    Logger.log(
      'No se pudo actualizar locale/timezone: '
      + error.message
    );
  }


  /*
   * ========================================================
   * TABLAS
   * ========================================================
   */

  Object.keys(
    DB_SCHEMAS
  )
  .forEach(
    function(sheetName) {
      ensureSheet_(
        spreadsheet,
        sheetName,
        DB_SCHEMAS[
          sheetName
        ]
      );
    }
  );


  /*
   * Limpiar hoja inicial de Google.
   */
  [
    'Hoja 1',
    'Sheet1',
  ]
  .forEach(
    function(
      defaultSheetName
    ) {
      var defaultSheet =
        spreadsheet
          .getSheetByName(
            defaultSheetName
          );


      if (
        defaultSheet
        &&
        defaultSheet
          .getLastRow() === 0
        &&
        spreadsheet
          .getSheets()
          .length > 1
      ) {
        spreadsheet
          .deleteSheet(
            defaultSheet
          );
      }
    }
  );


  /*
   * ========================================================
   * DRIVE
   * ========================================================
   */

  var rootFolderId =
    props.getProperty(
      'ROOT_FOLDER_ID'
    );


  var rootFolder;


  if (rootFolderId) {
    try {
      rootFolder =
        DriveApp
          .getFolderById(
            rootFolderId
          );

    } catch (error) {
      rootFolderId = '';
      rootFolder = null;

      props.deleteProperty(
        'ROOT_FOLDER_ID'
      );
    }
  }


  if (!rootFolderId) {
    rootFolder =
      DriveApp.createFolder(
        CMS.drive.rootName
      );


    rootFolderId =
      rootFolder.getId();


    props.setProperty(
      'ROOT_FOLDER_ID',
      rootFolderId
    );
  }


  /*
   * ========================================================
   * SUBCARPETAS
   * ========================================================
   */

  Object.keys(
    CMS.drive.folders
  )
  .forEach(
    function(key) {
      var propertyKey =
        'FOLDER_'
        + key.toUpperCase();


      var existingId =
        props.getProperty(
          propertyKey
        );


      if (existingId) {
        try {
          DriveApp
            .getFolderById(
              existingId
            );

          return;

        } catch (error) {
          props.deleteProperty(
            propertyKey
          );
        }
      }


      var folderName =
        CMS.drive
          .folders[key];


      var folders =
        rootFolder
          .getFoldersByName(
            folderName
          );


      var folder =
        folders.hasNext()
          ? folders.next()
          : rootFolder
              .createFolder(
                folderName
              );


      props.setProperty(
        propertyKey,
        folder.getId()
      );
    }
  );


  /*
   * ========================================================
   * SISTEMA
   * ========================================================
   */

  var createdAt =
    props.getProperty(
      'SETUP_AT'
    )
    ||
    nowIso_();


  props.setProperties(
    {
      CMS_VERSION:
        CMS.version,

      SITE_ID:
        CMS.site.id,

      SITE_NAME:
        CMS.site.name,

      SETUP_AT:
        createdAt,
    },
    false
  );


  dbBatchUpsertByKey_(
    CMS.database.sheets.system,
    'key',
    [
      {
        key:
          'cms_version',

        value:
          CMS.version,

        updated_at:
          nowIso_(),
      },

      {
        key:
          'site_id',

        value:
          CMS.site.id,

        updated_at:
          nowIso_(),
      },

      {
        key:
          'site_name',

        value:
          CMS.site.name,

        updated_at:
          nowIso_(),
      },

      {
        key:
          'spreadsheet_id',

        value:
          spreadsheetId,

        updated_at:
          nowIso_(),
      },

      {
        key:
          'root_folder_id',

        value:
          rootFolderId,

        updated_at:
          nowIso_(),
      },
    ]
  );


  /*
   * ========================================================
   * CACHE
   * ========================================================
   */

  invalidatePublicCache_();


  /*
   * ========================================================
   * FORMATO
   * ========================================================
   */

  formatCmsSpreadsheet_(
    spreadsheet,
    rootFolderId
  );


  /*
   * ========================================================
   * RESULTADO
   * ========================================================
   */

  var result =
    getSetupStatus_();


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );


  return result;
}


function getSetupStatus_() {
  var props =
    getScriptProps_();


  var spreadsheetId =
    props.getProperty(
      'SPREADSHEET_ID'
    );


  var rootFolderId =
    props.getProperty(
      'ROOT_FOLDER_ID'
    );


  return {
    ready:
      Boolean(
        spreadsheetId
        &&
        rootFolderId
      ),

    site:
      CMS.site,

    version:
      CMS.version,

    spreadsheetId:
      spreadsheetId || '',

    spreadsheetUrl:
      spreadsheetId
        ? (
            'https://docs.google.com/spreadsheets/d/'
            + spreadsheetId
            + '/edit'
          )
        : '',

    rootFolderId:
      rootFolderId || '',

    rootFolderUrl:
      rootFolderId
        ? (
            'https://drive.google.com/drive/folders/'
            + rootFolderId
          )
        : '',

    setupAt:
      props.getProperty(
        'SETUP_AT'
      ) || '',
  };
}