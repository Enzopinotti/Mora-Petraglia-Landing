const ADMIN_AUTH = Object.freeze({
  passwordHashKey:
    'ADMIN_PASSWORD_HASH',

  passwordSaltKey:
    'ADMIN_PASSWORD_SALT',

  passwordSetupKey:
    'ADMIN_PASSWORD_SETUP',

  sessionPrefix:
    'ADMIN_SESSION_',

  // 6 horas
  sessionTtlMs:
    6 * 60 * 60 * 1000,
});


/**
 * Configura o cambia la contraseña administrativa.
 *
 * NO se escribe la contraseña en este archivo.
 *
 * Procedimiento:
 *
 * 1. Apps Script → Configuración del proyecto.
 * 2. Propiedades del script.
 * 3. Crear:
 *
 *    ADMIN_PASSWORD_SETUP
 *
 *    con la contraseña deseada.
 *
 * 4. Ejecutar configurarPasswordAdmin().
 *
 * 5. Esta función elimina automáticamente
 *    ADMIN_PASSWORD_SETUP cuando termina.
 */
function configurarPasswordAdmin() {
  var props =
    getScriptProps_();


  var password =
    props.getProperty(
      ADMIN_AUTH.passwordSetupKey
    );


  assert_(
    password,
    'Falta la propiedad temporal ADMIN_PASSWORD_SETUP.'
  );


  assert_(
    String(password).length >= 10,
    'La contraseña debe tener al menos 10 caracteres.'
  );


  setAdminPassword_(
    String(password)
  );


  /*
   * La contraseña plana deja de existir
   * inmediatamente después de crear el hash.
   */
  props.deleteProperty(
    ADMIN_AUTH.passwordSetupKey
  );


  Logger.log(
    'Contraseña administrativa configurada correctamente.'
  );


  return {
    success: true,
  };
}


/**
 * Guarda únicamente hash + salt.
 */
function setAdminPassword_(
  password
) {
  password =
    String(
      password || ''
    );


  assert_(
    password.length >= 10,
    'La contraseña debe tener al menos 10 caracteres.'
  );


  var props =
    getScriptProps_();


  /*
   * Generamos un salt nuevo cada vez que
   * se cambia la contraseña.
   */
  var salt =
    generateSecureRandomString_();


  var hash =
    hashSecret_(
      password,
      salt
    );


  props.setProperties(
    {
      ADMIN_PASSWORD_SALT:
        salt,

      ADMIN_PASSWORD_HASH:
        hash,
    },
    false
  );


  /*
   * Cambiar la contraseña invalida todas
   * las sesiones existentes.
   */
  clearAllAdminSessions_();


  return true;
}


/**
 * Login.
 */
function loginAdmin_(
  password
) {
  var props =
    getScriptProps_();


  var storedHash =
    props.getProperty(
      ADMIN_AUTH.passwordHashKey
    );


  var salt =
    props.getProperty(
      ADMIN_AUTH.passwordSaltKey
    );


  assert_(
    storedHash && salt,
    'La contraseña del administrador todavía no fue configurada.'
  );


  var candidateHash =
    hashSecret_(
      String(
        password || ''
      ),
      salt
    );


  assert_(
    secureCompare_(
      storedHash,
      candidateHash
    ),
    'Contraseña incorrecta.'
  );


  cleanupExpiredAdminSessions_();


  var token =
    generateSessionToken_();


  var expiresAt =
    Date.now()
    +
    ADMIN_AUTH.sessionTtlMs;


  var session = {
    tokenHash:
      hashSessionToken_(
        token
      ),

    user:
      'Mora',

    createdAt:
      Date.now(),

    expiresAt:
      expiresAt,
  };


  props.setProperty(
    getSessionPropertyKey_(
      token
    ),
    JSON.stringify(
      session
    )
  );


  try {
    auditLog_(
      'LOGIN',
      'admin',
      'mora',
      'Inicio de sesión administrativo'
    );
  } catch (error) {
    /*
     * Un problema en auditoría no debe
     * impedir un login válido.
     */
    Logger.log(
      'Audit LOGIN: '
      + error.message
    );
  }


  return {
    token:
      token,

    expiresAt:
      expiresAt,

    user:
      'Mora',
  };
}


/**
 * Exige una sesión administrativa válida.
 */
function requireAdmin_(token) {
  token =
    sanitizeString_(token);


  assert_(
    token,
    'Sesión administrativa requerida.'
  );


  var props =
    getScriptProps_();


  var propertyKey =
    getSessionPropertyKey_(
      token
    );


  var raw =
    props.getProperty(
      propertyKey
    );


  assert_(
    raw,
    'La sesión no existe o venció.'
  );


  var session;


  try {
    session =
      JSON.parse(raw);

  } catch (error) {
    props.deleteProperty(
      propertyKey
    );

    throw new Error(
      'La sesión es inválida.'
    );
  }


  if (
    !session.expiresAt
    ||
    Number(session.expiresAt)
      <= Date.now()
  ) {
    props.deleteProperty(
      propertyKey
    );

    throw new Error(
      'La sesión venció. Iniciá sesión nuevamente.'
    );
  }


  var expectedHash =
    hashSessionToken_(
      token
    );


  assert_(
    secureCompare_(
      String(
        session.tokenHash || ''
      ),
      expectedHash
    ),
    'Token de sesión inválido.'
  );


  return session;
}


/**
 * Comprueba una sesión sin lanzar error.
 */
function tryAdminSession_(token) {
  try {
    return requireAdmin_(token);
  } catch (error) {
    return null;
  }
}


/**
 * Logout idempotente.
 */
function logoutAdmin_(token) {
  token =
    sanitizeString_(token);


  if (!token) {
    return true;
  }


  getScriptProps_()
    .deleteProperty(
      getSessionPropertyKey_(
        token
      )
    );


  return true;
}


/**
 * Token de sesión.
 */
function generateSessionToken_() {
  return (
    generateSecureRandomString_()
    +
    generateSecureRandomString_()
  );
}


/**
 * Random string suficientemente largo para
 * salts y tokens del CMS.
 */
function generateSecureRandomString_() {
  return (
    Utilities
      .getUuid()
      .replace(/-/g, '')
    +
    Utilities
      .getUuid()
      .replace(/-/g, '')
  );
}


/**
 * SHA-256 de value + salt.
 */
function hashSecret_(
  value,
  salt
) {
  var bytes =
    Utilities.computeDigest(
      Utilities
        .DigestAlgorithm
        .SHA_256,

      String(value)
      + ':'
      + String(salt),

      Utilities
        .Charset
        .UTF_8
    );


  return bytes
    .map(
      function(byte) {
        var normalized =
          (byte + 256) % 256;

        return (
          normalized < 16
            ? '0'
            : ''
        )
        +
        normalized.toString(16);
      }
    )
    .join('');
}


function hashSessionToken_(token) {
  return hashSecret_(
    token,
    'mora-petraglia-cms-session-v1'
  );
}


function getSessionPropertyKey_(
  token
) {
  return (
    ADMIN_AUTH.sessionPrefix
    +
    hashSessionToken_(
      token
    )
  );
}


/**
 * Comparación que recorre toda la cadena.
 */
function secureCompare_(
  left,
  right
) {
  left =
    String(left || '');

  right =
    String(right || '');


  if (
    left.length
    !== right.length
  ) {
    return false;
  }


  var result = 0;


  for (
    var i = 0;
    i < left.length;
    i += 1
  ) {
    result |=
      left.charCodeAt(i)
      ^
      right.charCodeAt(i);
  }


  return result === 0;
}


/**
 * Limpia sesiones vencidas.
 */
function cleanupExpiredAdminSessions_() {
  var props =
    getScriptProps_();


  var all =
    props.getProperties();


  Object.keys(all)
    .filter(
      function(key) {
        return key.indexOf(
          ADMIN_AUTH.sessionPrefix
        ) === 0;
      }
    )
    .forEach(
      function(key) {
        try {
          var session =
            JSON.parse(
              all[key]
            );


          if (
            !session.expiresAt
            ||
            Number(
              session.expiresAt
            ) <= Date.now()
          ) {
            props.deleteProperty(
              key
            );
          }

        } catch (error) {
          props.deleteProperty(
            key
          );
        }
      }
    );
}


/**
 * Invalida todas las sesiones.
 */
function clearAllAdminSessions_() {
  var props =
    getScriptProps_();


  Object.keys(
    props.getProperties()
  )
  .filter(
    function(key) {
      return key.indexOf(
        ADMIN_AUTH.sessionPrefix
      ) === 0;
    }
  )
  .forEach(
    function(key) {
      props.deleteProperty(
        key
      );
    }
  );
}