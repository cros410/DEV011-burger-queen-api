const bcrypt = require('bcrypt');
const express = require('express');
const connect = require('../connect');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const app = express();

const { getUsers } = require('../controller/users');
const users = require('../controller/users');
const error = require('../middleware/error');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };

  // TODO: Create admin user
  // First, check if adminUser already exists in the database
  connect.connect().then((db) => {
    const collection = db.collection('user');
    collection
      .findOne({ email: adminEmail })
      .then((existingAdminUser) => {
        if (!existingAdminUser) {
          return collection.insertOne(adminUser);
        }
        console.log('El admin existente');
        return Promise.resolve(existingAdminUser);
      })
      .then(() => {
        console.log('Usuario creado');
        next();
      })
      .catch((error) => {
        console.error('Error al crear admin', error);
        next();
      });
  });
};

/*
 * Español:
 *
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

module.exports = (app, next) => {
  // Solicitar=get users
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, (req, resp) => {
    const userId = req.params.uid;
    connect
      .connect()
      .then((db) => {
        const collection = db.collection('user');
        return collection.findOne({ _id: userId });
      })
      .then((user) => {
        if (!user) {
          resp.status(404).json({ message: 'Usuario no encontrado' });
        } else {
          resp.json(user);
        }
      })
      .catch((error) => {
        console.error('Error al obtener usuario', error);
        resp.status(500).json({ error: 'Error al obtener usuer por id' });
        next(error);
      });
  });

  // implementar ruta para agregar nuevo usuario TODO: Implement the route to add new users
  app.post('/users', requireAdmin, (req, resp, next) => {
    const userData = req.body;
    User.create(userData)
      .then((newUser) => resp.json(newUser))
      .catch((error) => next(error));
  });
  // Actualizar=put usuario
  app.put('/users/:uid', requireAuth, (req, resp, next) => {
    const userId = req.params.uid;
    const userData = req.body;
    User.findByIdAndUpdate(userId, userData, { new: true })
      .then((updatedUser) => resp.json(updatedUser))
      .catch((error) => next(error));
  });

  // Ruta para eleminar=delete user
  app.delete('/users/:uid', requireAuth, (req, resp, next) => {
    const userId = req.params.uid;
    User.findByIdAndDelete(userId)
      .then((deletedUser) => resp.json({ message: 'Usuario eliminado' }))
      .catch((error) => next(error));
  });

  initAdminUser(app, next);
};
