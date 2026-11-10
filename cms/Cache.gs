function getPublicCache_() {
  return CacheService
    .getScriptCache();
}


function getCachedJson_(
  key
) {

  var cached =
    getPublicCache_()
      .get(key);


  if (!cached) {
    return null;
  }


  try {

    return JSON.parse(
      cached
    );

  } catch (error) {

    return null;

  }
}


function setCachedJson_(
  key,
  value
) {

  getPublicCache_()
    .put(
      key,
      JSON.stringify(value),
      CMS.cache.ttlSeconds
    );


  return value;
}


function invalidatePublicCache_() {

  var keys =
    Object.keys(
      CMS.cache.keys
    )
    .map(
      function(key) {

        return CMS
          .cache
          .keys[key];

      }
    );


  getPublicCache_()
    .removeAll(keys);
}