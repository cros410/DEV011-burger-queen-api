const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connect = require('../connect');
const { secret } = require('../config');

module.exports = (app, nextMain) => {
  app.post('/login', (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: Authenticate the user
    async function authenticateUser(email, password) {
      try {
        const db = await connect.connect();
        const collection = db.collection('user');
        const user = await collection.findOne({ email });
        if (!user) {
          return { status: 404, message: 'Usuario no encontrado' };
        }
        // match a user in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return { status: 401, message: 'Contraseña incorrecta' };
        }
        // If they match, send an access token created with JWT
        const token = jwt.sign({ uid: user._id, email: user.email }, secret);
        return { token };
      } catch (error) {
        console.error('Error al autenticar', error);
        return { status: 500, error: 'Error en la autenticación' };
      }
    }

    next();
  });

  return nextMain();
};
