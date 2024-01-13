const jwt = require('jsonwebtoken');
const connect = require('../connect');
const config = require('../config');

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
    if (err) {
      return next(403);
    }

    // TODO: Verify user identity using `decodeToken.uid`
    module.exports.verifyUser = (decodedToken) =>
      connect
        .connect()
        .then((db) => {
          const collection = db.collection('user');
          return collection.findOne({ _id: decodedToken.uid });
        })
        .then((user) => {
          if (!user) {
            throw new Error('Usuario no encontrado');
          }
          return user;
        })
        .catch((error) => {
          console.error('Erro en la verificación:', error);
          throw error;
        });
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: Decide based on the request information whether the user is authenticated
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.secret);
      return { success: true, decoded };
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return { success: false, error: ' Autenticación fallida' };
    }
  }
  return false;
};

module.exports.isAdmin = (req) =>
  // TODO: Decide based on the request information whether the user is an admin

  false;

module.exports.requireAuth = (req, resp, next) =>
  !module.exports.isAuthenticated(req) ? next(401) : next();

module.exports.requireAdmin = (req, resp, next) =>
  // eslint-disable-next-line no-nested-ternary

  !module.exports.isAuthenticated(req)
    ? next(401)
    : !module.exports.isAdmin(req)
    ? next(403)
    : next();
