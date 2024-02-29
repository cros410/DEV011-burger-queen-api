const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('user');

      // Obtener el número de página y el límite de usuarios por página de la consulta
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query._limit, 10) || 10;

      // Contar el total de user en la DB.
      const totalUsers = await collection.countDocuments();

      // Calcular el índice de inicio y fin de los usuarios en la consulta.
      const index = (page - 1) * limit;
      const indexEnd = index + limit;

      // Obtener los user de la DB.
      const users = await collection
        .find({}, { projection: { password: 0 } })
        .skip(index)
        .limit(indexEnd)
        .toArray();
      // Objeto de respuesta con la información de paginación y los usuarios obtenidos.
      const dataResponse = {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        users,
        limit,
      };

      if (limit) {
        resp.status(200).json(Object.values(users));
      } else {
        resp.status(200).json(Object.values(dataResponse));
      }
    } catch (error) {
      console.error('Error al obtener usuarios', error);
      resp.status(500).json({ error: 'Error al obtener usuarios.' });
      next();
    }
  },

  getUserUid: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('user');

      // Obtener el Id del user.
      const userId = req.params.uid;
      let user;
      if (ObjectId.isValid(userId)) {
        user = await collection.findOne({ _id: userId });
      } else {
        user = await collection.findOne({ email: userId });
      }

      if (!user) {
        return resp.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (req.userRole !== 'admin') {
        if (req.userId !== user._id.toString()) {
          return resp
            .status(403)
            .json({ error: 'No tienes permisos para acceder a este recurso' });
        }
      }
      resp.json(user);
    } catch (error) {
      console.error('Error al obtener usuario por id', error);
      resp.status(500).json({ error: 'Error al obtener usuario' });
      next();
    }
  },

  postUser: async (req, resp) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('user');

      // Validación de correo y contraseña.
      const { email, password, role } = req.body;
      if (!email || !password) {
        return resp
          .status(400)
          .json({ error: 'Se requiere correo y contraseña' });
      }
      if (password.length < 4) {
        return resp
          .status(400)
          .json({ error: 'La contraseña debe tener 4 caracteres min.' });
      }

      // Crear user en la DB.
      const createUser = {
        email,
        password: await bcrypt.hash(password, 10),
        role,
      };

      // Verificando user.
      const existinUser = await collection.findOne({ email: req.body.email });
      if (existinUser) {
        return resp.status(403).json({ error: 'El usuario ya existe' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return resp.status(400).json({ error: 'Formato no válido' });
      }
      if (!password) {
        return resp.status(400).json({ error: 'Contraseña obligatoria' });
      }

      // Insertar user y obtener el resultado
      await collection.insertOne(createUser);

      /* // Obtener id asignado al new user
      const createUserId = createUser.insertedId;
      // Inlcuir id en la respuesta
      const response = { _id: createUserId, ...createUser }; */
      delete createUser.password;
      return resp.status(200).json(createUser);
    } catch (error) {
      console.error('Error al agregar usuario', error);
      return resp.status(500).json({ error: 'Error al agregar usuario' });
    }
  },

  updateUser: async (req, resp, next) => {
    try {
      // Conexión a la DB.
      const db = connect();
      const collection = db.collection('user');
      const requestBody = req.body;

      // Obtener ID y verficar si el ID es válido
      const userId = req.params.uid;

      let userToUpdate;
      if (ObjectId.isValid(userId)) {
        userToUpdate = await collection.findOne({ _id: userId });
      } else {
        userToUpdate = await collection.findOne({ email: userId });
      }
      // console.log('usuario encontrado:', userToUpdate);
      if (!userToUpdate) {
        return resp.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si es propietario o admin
      const authenticatedUserId = req.userId.toString();
      if (authenticatedUserId !== userToUpdate._id.toString()) {
        if (req.userRole !== 'admin') {
          return resp
            .status(403)
            .json({ error: 'No tienes permiso para este recurso' });
        }
      }
      if (
        Object.prototype.hasOwnProperty.call(requestBody, 'role') &&
        authenticatedUserId !== req.params.uid
      ) {
        return resp
          .status(403)
          .json({ error: 'No puedes actuazlizar tu role' });
      }

      // Validar y procesar los datos de actualización.
      const updateData = {};

      if (requestBody.email) {
        updateData.email = requestBody.email;
      }
      if (requestBody.password) {
        const hashedPassword = bcrypt.hashSync(requestBody.password, 10);
        updateData.password = hashedPassword;
      }

      if (requestBody.role && req.userRole === 'admin') {
        updateData.role = requestBody.role;
      }

      // Verificar si se proprcionaron datos para actualizar.
      if (Object.keys(updateData).length === 0) {
        return resp
          .status(400)
          .json({ error: 'Ingresar datos para actualizar' });
      }

      // Actualizar el user en la DB.
      const result = await collection.updateOne(
        { _id: userToUpdate._id },
        {
          $set: updateData,
        }
      );

      // Verificar cambios
      if (result.modifiedCount > 0) {
        return resp.json({ message: 'Usuario actualizado' });
      }
      return resp.status(400).json({ error: 'No se realizaron cambios' });
    } catch (error) {
      console.error('Error al actualizar usuario', error);
      next(error);
    }
  },

  deleteUser: async (req, resp, next) => {
    try {
      // Conexión a la DB.
      const db = connect();
      const collection = db.collection('user');

      // Obtener el valor del parámetro
      const userId = req.params.uid;
      let userToDelete;

      if (ObjectId.isValid(userId)) {
        userToDelete = await collection.findOne({ _id: userId });
      } else {
        userToDelete = await collection.findOne({ email: userId });
      }
      if (!userToDelete) {
        return resp.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Buscarlo en la DB.
      const userFind = await collection.findOne(userToDelete);
      if (!userFind) {
        return resp.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si es propietario o admin
      const authenticatedUserId = userFind._id;
      if (req.userId !== authenticatedUserId.toString()) {
        if (req.userRole !== 'admin') {
          return resp
            .status(403)
            .json({ error: 'No tienes permiso para este recurso' });
        }
      }
      /* Verifica que no elimine su propia cuenta.
      if (authenticatedUserId === userToDelete._id.toString()) {
        return resp.status(403).json({ error: 'No puedes eliminarte' });
      } */

      // Eliminar user de la DB.
      await collection.deleteOne({ _id: userToDelete._id });
      resp.json({ message: 'Usuario eliminado' });
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      next(error);
    }
  },
};
