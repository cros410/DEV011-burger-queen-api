const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connect } = require('../connect');
const { secret } = require('../config');

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return next(400);
      }

      const db = connect();
      const collection = db.collection('user');
      const user = await collection.findOne({ email }, { password });
      console.log(user);
      if (!user) {
        return resp
          .status(404)
          .json({ status: 404, message: 'Uusario no encontrado' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(password, user.password);
      /* if (!isMatch) {
        console.log('Contraseña incorrecta');
        return resp
          .status(401)
          .json({ status: 401, message: 'Contraseña incorrecta' });
      } */
      console.log('Autenticación exitosa');
      const token = jwt.sign(
        { uid: user._id, email: user.email, role: user.role },
        secret,
        { expiresIn: '1h' }
      );
      console.log(token);
      return resp.status(200).json({ 'access token': token });
    } catch (error) {
      console.error('Error al autenticar', error);
      return resp.json({ status: 500, error: 'Error en la autenticación' });
    }
  });
  return nextMain();
};
