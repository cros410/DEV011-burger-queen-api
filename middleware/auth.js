const jwt = require('jsonwebtoken');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }
  const [type, token] = authorization.split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  jwt.verify(token, secret, (err, decodedToken) => {
    // console.log('Error al verificar el token:', err);
    if (err) {
      return next(new Error('No autenticado'));
    }

    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role;

    // console.log('usuario autenticado:', req.userId, 'rol:', req.userRole);
    return next();
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: Decide based on the request information whether the user is authenticated
  const userId = req.userId ? req.userId.toString() : null;
  if (userId) {
    // console.log('2°usuario autenticado', userId);
    return true;
  }

  // console.log('usuario no autenticado');
  return req.userId !== undefined;
};

module.exports.isAdmin = (req) => {
  // TODO: Decide based on the request information whether the user is an admin
  const userRole = req.userRole ? req.userRole : null;
  if (userRole === 'admin') {
    // console.log('el usuario es admin');
    return true;
  }
  // console.log('el usuario no es admin');
  return req.userRole === 'admin';
};

// eslint-disable-next-line no-nested-ternary
module.exports.requireAuth = (req, resp, next) => {
  !module.exports.isAuthenticated(req)
    ? resp.status(401).json({ error: 'No autenticado' })
    : next();
};

module.exports.requireAdmin = (req, resp, next) => {
  !module.exports.isAuthenticated(req)
    ? resp.status(401).json({ error: 'No autenticado' })
    : !module.exports.isAdmin(req)
    ? resp.status(403).json({ error: 'No autorizado' })
    : next();
};
