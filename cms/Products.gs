const PRODUCT_SUBTYPES = Object.freeze([
  'print',
  'original_artwork',
  'physical_product',
  'service',
  'other',
]);


const PRODUCT_SALE_MODES = Object.freeze([
  'inquiry',
  'direct',
  'unavailable',
]);


function listProducts(options) {

  return listEntities_(
    'products',
    options || {}
  );

}


function getProduct(id) {

  return getEntityById_(
    'products',
    id
  );

}


function getProductBySlug(slug) {

  return getEntityBySlug_(
    'products',
    slug
  );

}


function createProduct(data) {

  data =
    data || {};


  var name =
    sanitizeString_(
      data.name
    );


  assert_(
    name,
    'El nombre del producto es obligatorio.'
  );


  var subtype =
    normalizeStatus_(
      data.subtype,
      PRODUCT_SUBTYPES,
      'print'
    );


  var status =
    normalizeStatus_(
      data.status,
      ENTITY_DEFINITIONS
        .products
        .statuses,
      'draft'
    );


  var saleMode =
    normalizeStatus_(
      data.sale_mode,
      PRODUCT_SALE_MODES,
      'inquiry'
    );


  var now =
    nowIso_();


  var product = {

    id:
      generateId_(
        'prd'
      ),

    slug:
      makeUniqueSlug_(
        'products',
        data.slug || name
      ),

    name:
      name,

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


    technique:
      sanitizeString_(
        data.technique
      ),

    support:
      sanitizeString_(
        data.support
      ),

    year:
      toNumber_(
        data.year,
        ''
      ),


    width:
      toNumber_(
        data.width,
        ''
      ),

    height:
      toNumber_(
        data.height,
        ''
      ),

    depth:
      toNumber_(
        data.depth,
        ''
      ),

    size_label:
      sanitizeString_(
        data.size_label
      ),


    price:
      toNumber_(
        data.price,
        ''
      ),

    currency:
      sanitizeString_(
        data.currency
      )
      || CMS.site.currency,


    sale_mode:
      saleMode,

    payment_link:
      sanitizeString_(
        data.payment_link
      ),


    stock:
      toNumber_(
        data.stock,
        ''
      ),


    edition_type:
      sanitizeString_(
        data.edition_type
      ),

    edition_total:
      toNumber_(
        data.edition_total,
        ''
      ),


    signed:
      toBoolean_(
        data.signed
      ),

    certificate:
      toBoolean_(
        data.certificate
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
            'products'
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
    'products',
    product
  );


  auditLog_(
    'CREATE',
    'products',
    product.id,
    'Creado: '
    + product.name
  );


  invalidatePublicCache_();


  return product;
}


function updateProduct(
  id,
  data
) {

  data =
    data || {};


  var current =
    getEntityById_(
      'products',
      id
    );


  var patch = {};


  patchStringField_(
    patch,
    data,
    'name'
  );

  patchStringField_(
    patch,
    data,
    'short_description'
  );

  patchStringField_(
    patch,
    data,
    'description'
  );

  patchStringField_(
    patch,
    data,
    'technique'
  );

  patchStringField_(
    patch,
    data,
    'support'
  );

  patchStringField_(
    patch,
    data,
    'size_label'
  );

  patchStringField_(
    patch,
    data,
    'currency'
  );

  patchStringField_(
    patch,
    data,
    'payment_link'
  );

  patchStringField_(
    patch,
    data,
    'edition_type'
  );

  patchStringField_(
    patch,
    data,
    'seo_title'
  );

  patchStringField_(
    patch,
    data,
    'seo_description'
  );

  patchStringField_(
    patch,
    data,
    'internal_notes'
  );


  patchNumberField_(
    patch,
    data,
    'year'
  );

  patchNumberField_(
    patch,
    data,
    'width'
  );

  patchNumberField_(
    patch,
    data,
    'height'
  );

  patchNumberField_(
    patch,
    data,
    'depth'
  );

  patchNumberField_(
    patch,
    data,
    'price'
  );

  patchNumberField_(
    patch,
    data,
    'stock'
  );

  patchNumberField_(
    patch,
    data,
    'edition_total'
  );

  patchNumberField_(
    patch,
    data,
    'sort_order'
  );


  patchBooleanField_(
    patch,
    data,
    'signed'
  );

  patchBooleanField_(
    patch,
    data,
    'certificate'
  );

  patchBooleanField_(
    patch,
    data,
    'featured'
  );


  if (
    hasOwn_(
      data,
      'name'
    )
  ) {

    assert_(
      patch.name,
      'El nombre del producto no puede quedar vacío.'
    );

  }


  /*
   * El slug NO cambia automáticamente
   * al editar el nombre.
   */

  if (
    hasOwn_(
      data,
      'slug'
    )
  ) {

    patch.slug =
      makeUniqueSlug_(
        'products',
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
        PRODUCT_SUBTYPES,
        current.subtype
        || 'print'
      );

  }


  if (
    hasOwn_(
      data,
      'sale_mode'
    )
  ) {

    patch.sale_mode =
      normalizeStatus_(
        data.sale_mode,
        PRODUCT_SALE_MODES,
        current.sale_mode
        || 'inquiry'
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
          .products
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
      'currency'
    )
    &&
    !patch.currency
  ) {

    patch.currency =
      CMS.site.currency;

  }


  patch.updated_at =
    nowIso_();


  var updated =
    dbUpdateById_(
      'products',
      id,
      patch
    );


  auditLog_(
    'UPDATE',
    'products',
    id,
    'Actualizado: '
    + String(
      updated.name
      || current.name
    )
  );


  invalidatePublicCache_();


  return updated;
}


function archiveProduct(id) {

  return archiveEntity_(
    'products',
    id
  );

}


function restoreProduct(id) {

  return restoreEntity_(
    'products',
    id
  );

}


function publishProduct(id) {

  return publishEntity_(
    'products',
    id
  );

}


function hideProduct(id) {

  return hideEntity_(
    'products',
    id
  );

}


function setProductFeatured(
  id,
  featured
) {

  return setEntityFeatured_(
    'products',
    id,
    featured
  );

}


function markProductSold(id) {

  var current =
    getEntityById_(
      'products',
      id
    );


  var updated =
    dbUpdateById_(
      'products',
      id,
      {

        status:
          'sold',

        stock:
          0,

        updated_at:
          nowIso_(),

      }
    );


  auditLog_(
    'SOLD',
    'products',
    id,
    'Marcado como vendido: '
    + String(
      current.name || id
    )
  );


  invalidatePublicCache_();


  return updated;
}


function duplicateProduct(id) {

  var current =
    getEntityById_(
      'products',
      id
    );


  return createProduct({

    name:
      String(
        current.name
        || 'Producto'
      )
      + ' (copia)',

    subtype:
      current.subtype,

    short_description:
      current.short_description,

    description:
      current.description,

    technique:
      current.technique,

    support:
      current.support,

    year:
      current.year,

    width:
      current.width,

    height:
      current.height,

    depth:
      current.depth,

    size_label:
      current.size_label,

    price:
      current.price,

    currency:
      current.currency,

    sale_mode:
      current.sale_mode,

    payment_link:
      '',

    stock:
      current.stock,

    edition_type:
      current.edition_type,

    edition_total:
      current.edition_total,

    signed:
      current.signed,

    certificate:
      current.certificate,

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