function getScriptProps_() {
  return PropertiesService
    .getScriptProperties();
}


function getDb_() {

  var id =
    getScriptProps_()
      .getProperty(
        'SPREADSHEET_ID'
      );

  assert_(
    id,
    'CMS no inicializado. Ejecutá setupMoraCms().'
  );

  return SpreadsheetApp
    .openById(id);
}


function getSheet_(sheetName) {

  var sheet =
    getDb_()
      .getSheetByName(
        sheetName
      );

  assert_(
    sheet,
    'No existe la hoja "' +
    sheetName +
    '".'
  );

  return sheet;
}


function ensureSheet_(
  spreadsheet,
  sheetName,
  headers
) {

  var sheet =
    spreadsheet
      .getSheetByName(
        sheetName
      );

  if (!sheet) {

    sheet =
      spreadsheet
        .insertSheet(
          sheetName
        );

  }


  var expected =
    headers
    || DB_SCHEMAS[sheetName];


  assert_(
    expected
    && expected.length,
    'No existe schema para '
    + sheetName
  );


  var currentHeaders =
    sheet
      .getRange(
        1,
        1,
        1,
        expected.length
      )
      .getValues()[0];


  expected.forEach(
    function(header, index) {

      if (
        currentHeaders[index]
        !== header
      ) {

        sheet
          .getRange(
            1,
            index + 1
          )
          .setValue(
            header
          );

      }

    }
  );


  sheet.setFrozenRows(1);


  sheet
    .getRange(
      1,
      1,
      1,
      expected.length
    )
    .setFontWeight('bold')
    .setBackground('#181615')
    .setFontColor('#ffffff');


  sheet.autoResizeColumns(
    1,
    Math.min(
      expected.length,
      12
    )
  );


  return sheet;
}


function dbHeaders_(sheetName) {

  return DB_SCHEMAS[
    sheetName
  ].slice();

}


function dbReadAll_(sheetName) {

  var sheet =
    getSheet_(sheetName);

  var headers =
    dbHeaders_(sheetName);

  var lastRow =
    sheet.getLastRow();


  if (lastRow < 2) {
    return [];
  }


  var values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        headers.length
      )
      .getValues();


  return values.map(
    function(row) {

      return rowToObject_(
        headers,
        row
      );

    }
  );
}


function rowToObject_(
  headers,
  row
) {

  var object = {};


  headers.forEach(
    function(header, index) {

      var value =
        row[index];


      if (
        Object.prototype
          .toString
          .call(value)
        === '[object Date]'
      ) {

        value =
          value.toISOString();

      }


      object[header] =
        value;

    }
  );


  return object;
}


function objectToRow_(
  headers,
  object
) {

  return headers.map(
    function(header) {

      var value =
        object[header];


      if (
        value === undefined
        || value === null
      ) {

        return '';

      }


      return value;

    }
  );
}


function dbFindById_(
  sheetName,
  id
) {

  if (!id) {
    return null;
  }


  return (
    dbReadAll_(sheetName)
      .find(
        function(row) {

          return String(row.id)
            === String(id);

        }
      )
    || null
  );
}


function dbFindByKey_(
  sheetName,
  key,
  value
) {

  return (
    dbReadAll_(sheetName)
      .find(
        function(row) {

          return String(
            row[key]
          ) === String(
            value
          );

        }
      )
    || null
  );
}


function dbFindRowIndex_(
  sheetName,
  key,
  value
) {

  var sheet =
    getSheet_(sheetName);

  var headers =
    dbHeaders_(sheetName);

  var columnIndex =
    headers.indexOf(key);


  assert_(
    columnIndex >= 0,
    'No existe columna '
    + key
  );


  var lastRow =
    sheet.getLastRow();


  if (lastRow < 2) {
    return -1;
  }


  var values =
    sheet
      .getRange(
        2,
        columnIndex + 1,
        lastRow - 1,
        1
      )
      .getValues();


  for (
    var index = 0;
    index < values.length;
    index += 1
  ) {

    if (
      String(
        values[index][0]
      )
      === String(value)
    ) {

      return index + 2;

    }

  }


  return -1;
}


function dbInsert_(
  sheetName,
  object
) {

  return withScriptLock_(
    function() {

      var sheet =
        getSheet_(sheetName);

      var headers =
        dbHeaders_(sheetName);


      sheet.appendRow(
        objectToRow_(
          headers,
          object
        )
      );


      return object;

    }
  );
}


function dbUpdateById_(
  sheetName,
  id,
  patch
) {

  return withScriptLock_(
    function() {

      var sheet =
        getSheet_(sheetName);

      var headers =
        dbHeaders_(sheetName);

      var rowIndex =
        dbFindRowIndex_(
          sheetName,
          'id',
          id
        );


      assert_(
        rowIndex >= 2,
        'No se encontró '
        + id
      );


      var current =
        rowToObject_(
          headers,
          sheet
            .getRange(
              rowIndex,
              1,
              1,
              headers.length
            )
            .getValues()[0]
        );


      var updated =
        Object.assign(
          {},
          current,
          patch
        );


      sheet
        .getRange(
          rowIndex,
          1,
          1,
          headers.length
        )
        .setValues([
          objectToRow_(
            headers,
            updated
          )
        ]);


      return updated;

    }
  );
}


function dbUpsertByKey_(
  sheetName,
  key,
  value,
  object
) {

  return withScriptLock_(
    function() {

      var sheet =
        getSheet_(sheetName);

      var headers =
        dbHeaders_(sheetName);

      var rowIndex =
        dbFindRowIndex_(
          sheetName,
          key,
          value
        );


      if (rowIndex >= 2) {

        var current =
          rowToObject_(
            headers,
            sheet
              .getRange(
                rowIndex,
                1,
                1,
                headers.length
              )
              .getValues()[0]
          );


        var updated =
          Object.assign(
            {},
            current,
            object
          );


        sheet
          .getRange(
            rowIndex,
            1,
            1,
            headers.length
          )
          .setValues([
            objectToRow_(
              headers,
              updated
            )
          ]);


        return updated;
      }


      var created =
        Object.assign(
          {},
          object
        );


      created[key] =
        value;


      sheet.appendRow(
        objectToRow_(
          headers,
          created
        )
      );


      return created;

    }
  );
}


function dbBatchUpsertByKey_(
  sheetName,
  key,
  items
) {

  if (
    !items
    || !items.length
  ) {

    return [];

  }


  items.forEach(
    function(item) {

      dbUpsertByKey_(
        sheetName,
        key,
        item[key],
        item
      );

    }
  );


  return items;
}


function dbCount_(
  sheetName,
  predicate
) {

  var rows =
    dbReadAll_(sheetName);


  if (predicate) {

    return rows
      .filter(predicate)
      .length;

  }


  return rows.length;
}