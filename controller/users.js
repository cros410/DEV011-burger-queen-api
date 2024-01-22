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
      const user = collection.findOne({ _id: req.params.uid });
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
      const db = connect();
      const collection = db.collection('user');
      const existinUser = await collection.findOne({ email: req.body.email });
      if (existinUser) {
        throw new Error('Usuario ya está registrado');
      }
      const newUser = await collection.insertOne(req.body);
      resp.status(201).json(newUser.ops[0]);
    } catch (error) {
      console.error('Error al agregar usuario', error);
      next(error);
    }
  },

  updateUser: async (req, resp, next) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      const existinUser = await collection.findOne({ _id: req.params.uid });
      if (!existinUser) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      const updatedUser = await collection.findOneAndUpdate(
        { _id: req.params.uid },
        { $set: req.body },
        { returnDocument: 'after' }
      );
      resp.json(updatedUser.value);
    } catch (error) {
      console.error('Error al actualizar usuario', error);
      next(error);
    }
  },

  deleteUser: async (req, resp, next) => {
    try {
      const db = connect();
      const collection = db.collection('user');
      const existinUser = await collection.findOne({ _id: req.params.uid });
      if (!existinUser) {
        resp.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      const deleteUser = await collection.deleteOne({ _id: req.params.uid });
      if (deleteUser.deletedCount === 1) {
        resp.status(204).send();
      } else {
        resp.status(500).json({ error: 'No se pudo eliminar el usuario' });
      }
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      next(error);
    }
  },
};
