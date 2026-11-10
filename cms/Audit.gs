function auditLog_(action, entityType, entityId, summary) {

  var row = {
    id: generateId_('aud'),
    timestamp: nowIso_(),
    action: sanitizeString_(action).toUpperCase(),
    entity_type: sanitizeString_(entityType),
    entity_id: sanitizeString_(entityId),
    summary: sanitizeString_(summary),
  };


  dbInsert_(
    CMS.database.sheets.audit,
    row
  );


  return row;
}


function listAudit_(limit) {

  var rows =
    dbReadAll_(
      CMS.database.sheets.audit
    );


  rows.sort(
    function(a, b) {

      return String(
        b.timestamp || ''
      ).localeCompare(
        String(
          a.timestamp || ''
        )
      );

    }
  );


  var max =
    Math.max(
      1,
      Math.min(
        Number(limit || 100),
        500
      )
    );


  return rows.slice(
    0,
    max
  );
}