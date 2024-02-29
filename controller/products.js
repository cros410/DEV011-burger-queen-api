const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('products');

      // Parametros para paginación.
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query._limit, 10) || 10;
      const start = (page - 1) * limit;

      // Información pagincaión.
      const products = await collection
        .find({})
        .skip(start)
        .limit(limit)
        .toArray();

      // Respuesta con info de paginación.
      const dataProduct = {
        totalItems: products.length,
        totalPages: Math.ceil(products.length / limit),
        currentPage: page,
        products,
        limit,
      };
      if (limit) {
        resp.status(200).json(products);
      } else {
        resp.status(200).json(dataProduct);
      }
    } catch (error) {
      console.error('Error al obtener productos', error);
      resp.status(500).json({ error: 'Error al obtener productos' });
      next();
    }
  },

  getProductsById: async (req, resp, next) => {
    try {
      // Conexión a DB.
      const db = connect();
      const collection = db.collection('products');
      const { productId } = req.params;
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return resp.status(404).json({ error: 'Id no válido' });
      }

      // Buscar en DB por Id.
      const objectId = new ObjectId(productId);
      const product = await collection.findOne({ _id: objectId });
      if (!product) {
        return resp.status(404).json({ error: 'Producto no encontrado' });
      }
      resp.json(product);
    } catch (error) {
      console.error('Error al obtener producto', error);
      resp.status(500).json({ error: 'Error al obtener producto' });
      next();
    }
  },

  postProduct: async (req, resp) => {
    try {
      // Conexión a DB.
      const db = connect();
      if (!db) {
        return resp
          .status(500)
          .json({ error: 'Error al conectar a la base de datos' });
      }
      const collection = db.collection('products');
      const { name, price, image, type } = req.body;

      // Verificar propiedades.
      if (!name || !price) {
        return resp.status(400).json({ error: 'Faltan propiedades' });
      }

      // Buscar producto.
      const productExist = await collection.findOne({ name });
      if (productExist) {
        return resp.status(400).json({ error: 'Producto existente' });
      }

      // Crear nuevo producto.
      const newProduct = {
        name,
        price,
        image,
        type,
        dateEntry: new Date(),
      };

      // Agergar a la colección.
      await collection.insertOne(newProduct);
      resp.status(200).json(newProduct);
    } catch (error) {
      console.error('error al crear el product', error);
      resp.status(500).json({ error: 'Error al crear producto' });
    }
  },

  updateProduct: async (req, resp) => {
    try {
      // Conexión a la DB.
      const db = connect();
      const collection = db.collection('products');

      // Obetener id del product.
      const { productId } = req.params;
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return resp.status(404).json({ error: 'El ID no válido' });
      }

      // Verificar si existe.
      const objectId = new ObjectId(productId);
      const existingProduct = await collection.findOne({
        _id: objectId,
      });
      if (!existingProduct) {
        return resp.status(404).json({ error: 'Producto no encontrado' });
      }

      // Verificar permiso admin.
      if (req.userRole !== 'admin') {
        return resp.status(403).json({ error: 'No tienes permiso' });
      }

      // Validar propiedades.
      const { body } = req;
      if (!body || Object.keys(body).length === 0) {
        return resp.status(400).json({ error: 'Faltan propiedades' });
      }

      // Validar propiedades del cuerpo de la solicitud.
      if (Object.prototype.hasOwnProperty.call(body, 'price')) {
        const { price } = body;
        if (typeof price !== 'number') {
          return resp
            .status(400)
            .json({ error: 'La propiedad "price" debe ser un número' });
        }
      }

      // Actualizar.
      await collection.updateOne({ _id: objectId }, { $set: body });

      // Obtener el proucto actualizado.
      const currentProduct = await collection.findOne({
        _id: objectId,
      });
      resp.status(200).json(currentProduct);
    } catch (error) {
      console.error('Error al actualizar', error);
      resp.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  deleteProduct: async (req, resp, next) => {
    try {
      // Obtener el ID del producto a eliminar
      const { productId } = req.params;
      // Obtener Id del producto.
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return resp
          .status(404)
          .json({ error: 'El ID del producto solicitado no es válido' });
      }

      // Conexión a DB
      const db = connect();
      const collection = db.collection('products');

      // Buscar el producto en la base de datos
      const objectId = new ObjectId(productId);
      const product = await collection.findOne({ _id: objectId });
      if (!product) {
        return resp.status(404).json({ error: 'Producto no encontrado' });
      }

      // Verificar permiso admin.
      if (req.userRole !== 'admin') {
        return resp.status(403).json({ error: 'No tienes permiso' });
      }

      // Eliminar el producto de la base de datos
      await collection.deleteOne({ _id: new ObjectId(productId) });

      // Respuesta exitosa
      resp.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto', error);
      resp.status(500).json({ error: 'Error al eliminar producto' });
      next(error);
    }
  },
};
