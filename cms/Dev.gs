function probarCrudMora() {

  var product =
    createProduct({

      name:
        'Producto de prueba',

      subtype:
        'print',

      short_description:
        'Registro temporal para probar el CMS.',

      technique:
        'Fine Art',

      size_label:
        '50 x 70 cm',

      price:
        85000,

      currency:
        'ARS',

      sale_mode:
        'inquiry',

      stock:
        1,

      status:
        'draft',

      featured:
        true,

      internal_notes:
        'PRUEBA CMS',

    });


  Logger.log(
    'CREADO'
  );

  Logger.log(
    JSON.stringify(
      product,
      null,
      2
    )
  );


  var updated =
    updateProduct(
      product.id,
      {

        price:
          90000,

        short_description:
          'Descripción actualizada correctamente.',

      }
    );


  Logger.log(
    'ACTUALIZADO'
  );

  Logger.log(
    JSON.stringify(
      updated,
      null,
      2
    )
  );


  var published =
    publishProduct(
      product.id
    );


  Logger.log(
    'PUBLICADO'
  );

  Logger.log(
    JSON.stringify(
      published,
      null,
      2
    )
  );


  return published;
}