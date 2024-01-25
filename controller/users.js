const bcrypt = require('bcrypt');
const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    try {
      const db = connect();
      const collection = db.collection('user');
      const user = await collection
        .find({}, { projection: { password: 0 } })
        .toArray();
      resp.json(user);
    } catch (error) {
      console.error('Error al obtener usuarios', error);
      next(error);
    }
  },

  getUserUid: async (req, resp) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      const user = await collection.findOne({ _id: req.params.uid });

      if (!user) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      resp.json(user);
    } catch (error) {
      console.error('Error al obtener usuario por id', error);
    }
  },

  postUser: async (req, resp, next) => {
    try {
      if (!req.body.email || !req.body.password) {
        return resp
          .status(400)
          .json({ error: 'Se requiere correo y contraseña' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return resp.status(400).json({ error: 'Formato no válido' });
      }
      const db = connect();
      const collection = db.collection('user');
      const existinUser = await collection.findOne({ email: req.body.email });
      if (existinUser) {
        return resp.status(403).json({ error: 'El usuario ya existe' });
      }
      const createUser = {
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        role: req.body.role,
      };
      await collection.insertOne(createUser);
      console.log(createUser);
      resp.status(201).json({ createUser });
    } catch (error) {
      console.error('Error al agregar usuario', error);
      next(error);
    }
  },

  updateUser: async (req, resp, next) => {},

  deleteUser: async (req, resp, next) => {},
};
