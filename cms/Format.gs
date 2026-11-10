const CMS_THEME = {
  dark: '#181615',
  text: '#2D2926',
  muted: '#746B64',

  paper: '#FBF8F3',
  soft: '#F1EAE2',
  accent: '#C76050',

  green: '#668071',
  blue: '#68859A',
  gold: '#B9965B',

  white: '#FFFFFF',
  border: '#DED5CC',
};


/**
 * Aplica todo el formato visual.
 */
function formatCmsSpreadsheet_(
  spreadsheet,
  rootFolderId
) {
  createCmsHomeSheet_(
    spreadsheet,
    rootFolderId
  );


  Object.keys(
    DB_SCHEMAS
  )
  .forEach(
    function(sheetName) {
      var sheet =
        spreadsheet
          .getSheetByName(
            sheetName
          );


      if (!sheet) {
        return;
      }


      formatCmsSheet_(
        sheet,
        sheetName
      );


      applyCmsValidations_(
        sheet,
        sheetName
      );


      applyCmsNumberFormats_(
        sheet,
        sheetName
      );
    }
  );


  var systemSheet =
    spreadsheet
      .getSheetByName(
        '_system'
      );


  var auditSheet =
    spreadsheet
      .getSheetByName(
        '_audit'
      );


  if (
    systemSheet
    &&
    !systemSheet.isSheetHidden()
  ) {
    systemSheet.hideSheet();
  }


  if (
    auditSheet
    &&
    !auditSheet.isSheetHidden()
  ) {
    auditSheet.hideSheet();
  }


  var home =
    spreadsheet
      .getSheetByName(
        'Inicio'
      );


  if (home) {
    spreadsheet
      .setActiveSheet(home);

    spreadsheet
      .moveActiveSheet(1);
  }
}


/**
 * Formato general.
 */
function formatCmsSheet_(
  sheet,
  sheetName
) {
  var headers =
    DB_SCHEMAS[
      sheetName
    ];


  if (!headers) {
    return;
  }


  var lastColumn =
    headers.length;


  var maxRows =
    sheet.getMaxRows();


  sheet.setHiddenGridlines(
    true
  );


  sheet.setFrozenRows(1);


  sheet.setRowHeight(
    1,
    38
  );


  /*
   * HEADER
   */
  var headerRange =
    sheet.getRange(
      1,
      1,
      1,
      lastColumn
    );


  headerRange
    .setBackground(
      CMS_THEME.dark
    )
    .setFontColor(
      CMS_THEME.white
    )
    .setFontWeight(
      'bold'
    )
    .setFontFamily(
      'Arial'
    )
    .setFontSize(10)
    .setVerticalAlignment(
      'middle'
    )
    .setHorizontalAlignment(
      'left'
    )
    .setWrap(true);


  /*
   * CUERPO
   */
  if (maxRows > 1) {
    sheet
      .getRange(
        2,
        1,
        maxRows - 1,
        lastColumn
      )
      .setBackground(
        CMS_THEME.paper
      )
      .setFontColor(
        CMS_THEME.text
      )
      .setFontFamily(
        'Arial'
      )
      .setFontSize(10)
      .setVerticalAlignment(
        'middle'
      );
  }


  var tabColors = {
    content:
      CMS_THEME.gold,

    settings:
      CMS_THEME.muted,

    products:
      CMS_THEME.accent,

    projects:
      CMS_THEME.green,

    events:
      CMS_THEME.blue,

    media:
      '#9A7B98',

    _system:
      CMS_THEME.dark,

    _audit:
      '#888888',
  };


  if (
    tabColors[
      sheetName
    ]
  ) {
    sheet.setTabColor(
      tabColors[
        sheetName
      ]
    );
  }


  applyCmsColumnWidths_(
    sheet,
    sheetName
  );


  var wrapColumns = [
    'short_description',
    'description',
    'seo_description',
    'internal_notes',
    'value',
    'alt_text',
    'summary',
  ];


  wrapColumns.forEach(
    function(columnName) {
      var column =
        getColumnIndex_(
          sheetName,
          columnName
        );


      if (!column) {
        return;
      }


      if (
        sheet.getMaxRows()
        <= 1
      ) {
        return;
      }


      sheet
        .getRange(
          2,
          column,
          sheet.getMaxRows() - 1,
          1
        )
        .setWrap(true);
    }
  );
}


/**
 * Anchos de columnas.
 */
function applyCmsColumnWidths_(
  sheet,
  sheetName
) {
  var headers =
    DB_SCHEMAS[
      sheetName
    ];


  headers.forEach(
    function(header, index) {
      var width = 130;


      if (
        [
          'id',
          'slug',
          'key',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 170;
      }


      if (
        [
          'name',
          'title',
          'label',
          'institution',
          'artwork_name',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 200;
      }


      if (
        [
          'short_description',
          'description',
          'seo_description',
          'internal_notes',
          'value',
          'alt_text',
          'summary',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 300;
      }


      if (
        [
          'created_at',
          'updated_at',
          'archived_at',
          'start_date',
          'end_date',
          'timestamp',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 175;
      }


      if (
        [
          'year',
          'stock',
          'width',
          'height',
          'depth',
          'price',
          'sort_order',
          'edition_total',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 100;
      }


      if (
        [
          'featured',
          'signed',
          'certificate',
          'public',
        ]
        .indexOf(header)
        !== -1
      ) {
        width = 95;
      }


      sheet.setColumnWidth(
        index + 1,
        width
      );
    }
  );
}


/**
 * Validaciones.
 */
function applyCmsValidations_(
  sheet,
  sheetName
) {
  if (
    sheet.getMaxRows()
    <= 1
  ) {
    return;
  }


  if (
    sheetName
    === 'products'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'subtype',
      [
        'print',
        'original_artwork',
        'physical_product',
        'service',
        'other',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'sale_mode',
      [
        'inquiry',
        'direct',
        'unavailable',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'status',
      [
        'draft',
        'published',
        'hidden',
        'sold',
        'out_of_stock',
        'archived',
      ]
    );


    [
      'featured',
      'signed',
      'certificate',
    ]
    .forEach(
      function(field) {
        setDropdown_(
          sheet,
          sheetName,
          field,
          [
            'TRUE',
            'FALSE',
          ]
        );
      }
    );
  }


  if (
    sheetName
    === 'projects'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'subtype',
      [
        'mural',
        'installation',
        'collaboration',
        'other',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'status',
      [
        'draft',
        'published',
        'hidden',
        'archived',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'featured',
      [
        'TRUE',
        'FALSE',
      ]
    );
  }


  if (
    sheetName
    === 'events'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'subtype',
      [
        'exhibition',
        'award',
        'competition',
        'talk',
        'launch',
        'other',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'status',
      [
        'draft',
        'published',
        'hidden',
        'archived',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'featured',
      [
        'TRUE',
        'FALSE',
      ]
    );
  }


  if (
    sheetName
    === 'media'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'entity_type',
      [
        'products',
        'projects',
        'events',
        'site',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'role',
      [
        'cover',
        'gallery',
        'detail',
        'ambient',
        'signature',
      ]
    );
  }


  if (
    sheetName
    === 'content'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'type',
      [
        'text',
        'textarea',
        'richtext',
      ]
    );
  }


  if (
    sheetName
    === 'settings'
  ) {
    setDropdown_(
      sheet,
      sheetName,
      'type',
      [
        'text',
        'textarea',
        'email',
        'url',
        'boolean',
        'number',
      ]
    );


    setDropdown_(
      sheet,
      sheetName,
      'public',
      [
        'TRUE',
        'FALSE',
      ]
    );
  }
}


/**
 * Formatos numéricos.
 */
function applyCmsNumberFormats_(
  sheet,
  sheetName
) {
  if (
    sheet.getMaxRows()
    <= 1
  ) {
    return;
  }


  var numericFields = [
    'width',
    'height',
    'depth',
    'stock',
    'edition_total',
    'sort_order',
    'year',
  ];


  numericFields.forEach(
    function(field) {
      var column =
        getColumnIndex_(
          sheetName,
          field
        );


      if (!column) {
        return;
      }


      sheet
        .getRange(
          2,
          column,
          sheet.getMaxRows() - 1,
          1
        )
        .setNumberFormat(
          '#,##0'
        );
    }
  );


  var priceColumn =
    getColumnIndex_(
      sheetName,
      'price'
    );


  if (priceColumn) {
    sheet
      .getRange(
        2,
        priceColumn,
        sheet.getMaxRows() - 1,
        1
      )
      .setNumberFormat(
        '#,##0.00'
      );
  }
}


/**
 * Dropdown.
 */
function setDropdown_(
  sheet,
  sheetName,
  columnName,
  values
) {
  var column =
    getColumnIndex_(
      sheetName,
      columnName
    );


  if (!column) {
    return;
  }


  if (
    sheet.getMaxRows()
    <= 1
  ) {
    return;
  }


  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(
        values,
        true
      )
      .setAllowInvalid(false)
      .build();


  sheet
    .getRange(
      2,
      column,
      sheet.getMaxRows() - 1,
      1
    )
    .setDataValidation(
      rule
    );
}


/**
 * Índice de columna.
 */
function getColumnIndex_(
  sheetName,
  columnName
) {
  var headers =
    DB_SCHEMAS[
      sheetName
    ];


  if (!headers) {
    return 0;
  }


  var index =
    headers.indexOf(
      columnName
    );


  return index >= 0
    ? index + 1
    : 0;
}


/**
 * Hoja Inicio.
 */
function createCmsHomeSheet_(
  spreadsheet,
  rootFolderId
) {
  var sheet =
    spreadsheet
      .getSheetByName(
        'Inicio'
      );


  if (!sheet) {
    sheet =
      spreadsheet
        .insertSheet(
          'Inicio'
        );
  }


  /*
   * clear() no desarma celdas combinadas.
   * Las rompemos explícitamente antes.
   */
  sheet
    .getRange(
      'A1:E30'
    )
    .breakApart();


  sheet.clear();


  sheet.setHiddenGridlines(
    true
  );


  sheet.setTabColor(
    CMS_THEME.accent
  );


  sheet.setColumnWidth(
    1,
    48
  );

  sheet.setColumnWidth(
    2,
    220
  );

  sheet.setColumnWidth(
    3,
    230
  );

  sheet.setColumnWidth(
    4,
    230
  );

  sheet.setColumnWidth(
    5,
    48
  );


  sheet
    .getRange(
      'A1:E30'
    )
    .setBackground(
      CMS_THEME.paper
    );


  /*
   * Título
   */
  sheet
    .getRange(
      'B3:D3'
    )
    .merge();


  sheet
    .getRange(
      'B3'
    )
    .setValue(
      'Mora Petraglia'
    )
    .setFontFamily(
      'Georgia'
    )
    .setFontSize(28)
    .setFontWeight(
      'bold'
    )
    .setFontColor(
      CMS_THEME.dark
    );


  sheet
    .getRange(
      'B4:D4'
    )
    .merge();


  sheet
    .getRange(
      'B4'
    )
    .setValue(
      'Landing CMS · Administración de contenido'
    )
    .setFontFamily(
      'Arial'
    )
    .setFontSize(11)
    .setFontColor(
      CMS_THEME.muted
    );


  sheet
    .getRange(
      'B6:D6'
    )
    .setBackground(
      CMS_THEME.accent
    );


  sheet.setRowHeight(
    6,
    4
  );


  /*
   * Información
   */
  sheet
    .getRange(
      'B8'
    )
    .setValue('CMS')
    .setFontWeight('bold')
    .setFontColor(
      CMS_THEME.muted
    );


  sheet
    .getRange(
      'C8:D8'
    )
    .merge();


  sheet
    .getRange(
      'C8'
    )
    .setValue(
      'Versión '
      + CMS.version
    );


  sheet
    .getRange(
      'B9'
    )
    .setValue('Sitio')
    .setFontWeight('bold')
    .setFontColor(
      CMS_THEME.muted
    );


  sheet
    .getRange(
      'C9:D9'
    )
    .merge();


  sheet
    .getRange(
      'C9'
    )
    .setValue(
      CMS.site.name
    );


  sheet
    .getRange(
      'B10'
    )
    .setValue('Idioma')
    .setFontWeight('bold')
    .setFontColor(
      CMS_THEME.muted
    );


  sheet
    .getRange(
      'C10:D10'
    )
    .merge();


  sheet
    .getRange(
      'C10'
    )
    .setValue(
      CMS.site.locale
    );


  /*
   * Accesos
   */
  sheet
    .getRange(
      'B13:D13'
    )
    .merge();


  sheet
    .getRange(
      'B13'
    )
    .setValue(
      'Accesos rápidos'
    )
    .setFontFamily(
      'Georgia'
    )
    .setFontSize(16)
    .setFontWeight('bold');


  var dbUrl =
    spreadsheet.getUrl();


  sheet
    .getRange(
      'B15:C16'
    )
    .merge()
    .setBackground(
      CMS_THEME.dark
    )
    .setFontColor(
      CMS_THEME.white
    )
    .setFontWeight('bold')
    .setHorizontalAlignment(
      'center'
    )
    .setVerticalAlignment(
      'middle'
    );


  var dbLink =
    SpreadsheetApp
      .newRichTextValue()
      .setText(
        'Base de datos'
      )
      .setLinkUrl(
        dbUrl
      )
      .build();


  sheet
    .getRange(
      'B15'
    )
    .setRichTextValue(
      dbLink
    );


  if (rootFolderId) {
    var driveUrl =
      'https://drive.google.com/drive/folders/'
      + rootFolderId;


    sheet
      .getRange(
        'D15:D16'
      )
      .merge()
      .setBackground(
        CMS_THEME.accent
      )
      .setFontColor(
        CMS_THEME.white
      )
      .setFontWeight('bold')
      .setHorizontalAlignment(
        'center'
      )
      .setVerticalAlignment(
        'middle'
      );


    var driveLink =
      SpreadsheetApp
        .newRichTextValue()
        .setText(
          'Imágenes'
        )
        .setLinkUrl(
          driveUrl
        )
        .build();


    sheet
      .getRange(
        'D15'
      )
      .setRichTextValue(
        driveLink
      );
  }


  /*
   * Módulos
   */
  sheet
    .getRange(
      'B19:D19'
    )
    .merge();


  sheet
    .getRange(
      'B19'
    )
    .setValue(
      'Estructura del CMS'
    )
    .setFontFamily(
      'Georgia'
    )
    .setFontSize(16)
    .setFontWeight('bold');


  var modules = [
    [
      'Productos y obras',
      'products',
      'Prints y obra original',
    ],

    [
      'Murales',
      'projects',
      'Proyectos e intervenciones',
    ],

    [
      'Exhibiciones',
      'events',
      'Muestras, premios y salones',
    ],

    [
      'Textos',
      'content',
      'Contenido editable de la landing',
    ],

    [
      'Multimedia',
      'media',
      'Imágenes asociadas',
    ],

    [
      'Ajustes',
      'settings',
      'Configuración general',
    ],
  ];


  sheet
    .getRange(
      21,
      2,
      modules.length,
      3
    )
    .setValues(
      modules
    );


  sheet
    .getRange(
      21,
      2,
      modules.length,
      1
    )
    .setFontWeight(
      'bold'
    );


  sheet
    .getRange(
      21,
      3,
      modules.length,
      1
    )
    .setFontColor(
      CMS_THEME.accent
    );


  sheet
    .getRange(
      21,
      2,
      modules.length,
      3
    )
    .setVerticalAlignment(
      'middle'
    );


  for (
    var row = 21;
    row < 21 + modules.length;
    row += 1
  ) {
    sheet.setRowHeight(
      row,
      30
    );
  }


  sheet
    .getRange(
      'B29:D29'
    )
    .merge();


  sheet
    .getRange(
      'B29'
    )
    .setValue(
      'La administración principal se realizará desde el panel del CMS. Esta planilla funciona como base de datos.'
    )
    .setFontColor(
      CMS_THEME.muted
    )
    .setFontStyle(
      'italic'
    )
    .setWrap(true);
}