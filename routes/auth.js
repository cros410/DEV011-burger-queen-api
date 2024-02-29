const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connect } = require('../connect');
const { secret } = require('../config');

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    try {
      // Conexión a la DB.
      const db = connect();
      const collection = db.collection('user');

      // Verificación de user.
      const user = await collection.findOne({ email }, { password });
      if (!email || !password) {
        return resp.status(400).json({ error: 'Ingresar email y contrtaseña' });
      }

      if (!user) {
        return resp.status(404).json({ error: 'Usario no encontrado' });
      }

      // Validación de contraseñas y creación de Token.
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const createToken = jwt.sign(
          { uid: user._id, email: user.email, role: user.role },
          secret,
          { expiresIn: '1h' }
        );
        return resp.json({ token: createToken });
      }
      return resp.status(401).json({ error: 'La contraseña no coincide' });
    } catch (error) {
      console.error('Error al autenticar', error);
      return next(500);
    }
  });
  return nextMain();
};
