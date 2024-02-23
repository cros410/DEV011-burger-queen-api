const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  postOrders: async (req, resp, next) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return resp.status(400).json({ error: 'Propiedades inválidas' });
      }
      // Conexión a la base de datos
      const db = connect();
      const collection = db.collection('orders');

      const { userId, client, products, status } = req.body;
      const user = req.userId;

      // Crear nueva orden.
      const newOrder = {
        userId: req.user._id,
        client,
        products,
        status,
        dateEntry: new Date(),
      };

      // Insertar nueva orden.
      const result = await collection.insertOne(newOrder);

      // Verificar si se insertó.
      if (result.isertedCount !== 1) {
        throw new Error('No se pudo crear la orden');
      }
      // Respuesta orden creada.
      resp.status(201).json(newOrder);
    } catch (error) {
      console.error('Errorl al crear orden');
      resp.status(500).json({ error: ' Error al crear orden' });
      next();
    }
  },
};
