const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    try {
      const db = connect();
      const collection = db.collection('user');
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const totalUsers = await collection.countDocuments();
      const index = (page - 1) * limit;
      const indexOff = page === 1 ? limit : page * limit;
      const users = await collection
        .find({}, { projection: { password: 0 } })
        .skip(index)
        .limit(indexOff)
        .toArray();

      const dataResponse = {
        totalItems: totalUsers,
        totalPage: Math.ceil(totalUsers / limit),
        currentPage: page,
        users,
        limit,
      };
      console.los('Respuesta:', dataResponse);
      resp.json(dataResponse);
    } catch (error) {
      console.error('Error al obtener usuarios', error);
      next(error);
    }
  },

  getUserUid: async (req, resp) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      // Convirtiendo el párametro de la url ('req.params.uid') a un objeto.
      const userId = new ObjectId(req.params.uid);
      // Luego busca en la colección el documento que tiene ese _id.
      const user = await collection.findOne({ _id: userId });

      if (!user) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      resp.json(user);
    } catch (error) {
      console.error('Error al obtener usuario por id', error);
      resp.status(500).json({ error: 'Error interno del servidor' });
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
      // Insertar user y obtener el resultado
      const result = await collection.insertOne(createUser);
      // Obtener id asignado al new user
      const createUserId = result.insertedId;
      // Inlcuir id en la respuesta
      const response = { _id: createUserId, ...createUser };
      resp.status(201).json({ user: response });
    } catch (error) {
      console.error('Error al agregar usuario', error);
      next(error);
    }
  },

  updateUser: async (req, resp, next) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      // Convirtiendo el párametro de la url ('req.params.uid') a un objeto.
      const userId = new ObjectId(req.params.uid);
      // Luego busca en la colección el documento que tiene ese _id.
      const existinUser = await collection.findOne({ _id: userId });
      if (!existinUser) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (Object.keys(req.body).length === 0) {
        resp.status(400).json({ error: 'Ingresar datos para actualizar' });
        return;
      }
      const updatedUser = await collection.updateOne(
        { _id: userId },
        {
          $set: {
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
          },
        }
      );
      if (updatedUser.modifiedCount > 0) {
        resp.json({ message: 'Usuario actualizado' });
      } else {
        resp.status(400).json({ error: 'No se realizaron cambios' });
      }
    } catch (error) {
      console.error('Error al actualizar usuario', error);
      next(error);
    }
  },

  deleteUser: async (req, resp, next) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      // Convirtiendo el párametro de la url ('req.params.uid') a un objeto.
      const userIdToDelete = new ObjectId(req.params.uid);
      const authenticatedUserId = req.userId;
      if (!authenticatedUserId) {
        return resp.status(401).json({ error: 'Usuario no autenticado' });
      }
      if (userIdToDelete.equals(authenticatedUserId)) {
        return resp.status(403).json({ error: 'No puedes eliminarte' });
      }

      // Luego busca en la colección el documento que tiene ese _id.
      const existinUser = await collection.findOne({ _id: userIdToDelete });
      if (!existinUser) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      await collection.deleteOne({ _id: userIdToDelete });
      resp.json({ message: 'Usuario eliminado' });
      console.log('usuario eliminado:', userIdToDelete);
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      next(error);
    }
  },
};
