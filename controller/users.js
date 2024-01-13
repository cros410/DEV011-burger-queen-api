const connect = require('../connect');

module.exports = {
  getUsers: (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    connect
      .connect()
      .then((db) => {
        const collection = db.collection('user');
        return collection.find().toArray();
      })
      .then((users) => {
        if (!users) {
          throw new Error('No se pudo obtener respuesta');
        }
        resp.json(users);
      })
      .catch((error) => {
        console.error('Error al obtener usuarios', error);
        resp.status(500).json({ error: 'Error al obtener usuarios' });
        next(error);
      });
  },
};
