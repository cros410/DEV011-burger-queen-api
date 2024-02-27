const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  postOrders: async (req, resp, next) => {
    try {
      const { userId, client, products, status } = req.body;
      if (!userId || !client || !products || !status) {
        return resp.status(400).json({ error: 'Propiedades inválidas' });
      }
      if (!client || !products) {
        return resp.status(400).json({ error: 'Faltan datos' });
      }

      // Conexión a la base de datos
      const db = connect();
      const collection = db.collection('orders');

      // Crear nueva orden.
      const createOrder = {
        userId,
        client,
        products,
        status,
        dateEntry: new Date(),
      };
      console.log('status:', createOrder);
      // Insertar nueva orden.
      await collection.insertOne(createOrder);

      // Respuesta orden creada.
      resp.status(200).json(createOrder);
    } catch (error) {
      console.error('Error al crear orden', error);
      resp.status(500).json({ error: ' Error al crear orden' });
    }
  },

  getOrders: async (req, resp, next) => {
    try {
      // Conexión a la DB.
      const db = connect();
      const collection = db.collection('orders');

      // Paginación.
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query._limit, 10) || 10;

      // Contar order en la db.
      const totalOrders = await collection.countDocuments();

      // Calcular índice.
      const start = (page - 1) * limit;
      const indexEnd = start + limit;

      // Obtener ordeners.
      const orders = await collection
        .find()
        .skip(start)
        .limit(indexEnd)
        .toArray();

      // Respuesta.
      const dataOrders = {
        totalItems: totalOrders,
        totalPages: Math.ceil(orders.length / limit),
        currentPage: page,
        orders,
        limit,
      };
      if (limit) {
        resp.status(200).json(orders);
      } else {
        resp.status(200).json({ dataOrders });
      }
    } catch (error) {
      console.error('Error al obtener ordenes', error);
      resp.status(500).json({ error: 'Error al obtener ordenes' });
      next();
    }
  },

  getOrdersById: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('orders');

      // Buscar por id.
      const { orderId } = req.params;
      if (!ObjectId.isValid(orderId)) {
        return resp.status(404).json({ error: 'Id no válido' });
      }
      if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
        return resp.status(404).json({ error: 'ID no es válido' });
      }

      // Convertir id a objeto.
      const objectId = new ObjectId(orderId);

      // Buscar y verificar si existe.
      const order = await collection.findOne({ _id: objectId });
      if (!order) {
        return resp.status(404).json({ error: 'Orden no encontrada' });
      }

      // Respuesta.
      resp.status(200).json(order);
    } catch (error) {
      console.error('Error al obtener orden por id', error);
      resp.status(500).json({ error: 'Error al obtener orden por su Id' });
      next();
    }
  },

  updateOrders: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('orders');

      // Buscar por id.
      const { orderId } = req.params;
      console.log('ID de la orden:', orderId);
      if (!ObjectId.isValid(orderId)) {
        return resp.status(404).json({ error: 'Id no válido' });
      }
      if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
        console.log('ID no válido');
        return resp.status(404).json({ error: 'ID no es válido' });
      }

      // Convertir id a objeto.
      const objectId = new ObjectId(orderId);
      // Buscar y verificar si existe.
      const order = await collection.findOne({ _id: objectId });
      if (!order) {
        return resp.status(404).json({ error: 'Orden no encontrada' });
      }

      // Obtener datos actualizados.
      const { status } = req.body;

      // Verificar si es un estado válido.
      const validStatus = [
        'pending',
        'canceled',
        'preparing',
        'delivering',
        'delivered',
      ];
      if (!status || !validStatus.includes(status)) {
        return resp.status(400).json({ error: 'Estado inválido' });
      }
      if (status === 'delivered') {
        order.dateProcessed = new Date();
      }

      // Actualizar el estado.
      await collection.updateOne(
        { _id: objectId },
        { $set: { status, dateProcessed: order.dateProcessed } }
      );

      // Obtener orden actual.
      const updateOrder = await collection.findOne({ _id: objectId });

      // Respuesta.
      resp.status(200).json(updateOrder);
    } catch (error) {
      console.error('Error al actualizar', error);
      resp.status(500).json({ error: 'Error al actualizar orden' });
      next();
    }
  },

  deleteOrders: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('orders');

      // Buscar por id.
      const { orderId } = req.params;
      if (!ObjectId.isValid(orderId)) {
        return resp.status(404).json({ error: 'Id no válido' });
      }
      if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
        return resp.status(404).json({ error: 'ID no es válido' });
      }

      // Convertir id a objeto.
      const objectId = new ObjectId(orderId);
      // Buscar y verificar si existe.
      const order = await collection.findOne({ _id: objectId });
      if (!order) {
        return resp.status(404).json({ error: 'Orden no encontrada' });
      }

      // Eliminar de la DB.
      await collection.deleteOne({ _id: objectId });

      // Respuesta.
      resp.status(200).json({ order, message: 'Orden eliminada' });
    } catch (error) {
      console.error('No se pudo eliminar:', error);
      resp.status(500).json({ error: 'Error al eliminar' });
    }
  },
};
