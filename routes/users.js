const bcrypt = require('bcrypt');
const User = require('../models/user');

const { requireAuth, requireAdmin } = require('../middleware/auth');

const { getUsers } = require('../controller/users');
const users = require('../controller/users');

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
  console.log('Conexión establecida');
  User.findOne({ email: adminEmail })
    .then((existingAdminUser) => {
      if (!existingAdminUser) {
        // Si no existe, crear un admin
        return User.create(adminUser);
      }
      console.log('El admin ya existe en la base de datos');
      return Promise.resolve();
    })
    .then(() => {
      console.log('Usuarioi creado exitosamente.');
      next();
    })
    .catch((error) => {
      console.error('Error al crear admin', error);
      next();
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
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, async (req, resp) => {
    try {
      const userId = req.params.uid;
      const user = await User.findById(userId);

      if (!user) {
        return resp.status(404).json({ error: 'Usuario no encontrado' });
      }
      resp.json(user);
    } catch (error) {
      console.error('Error al obtener usuario por id', error);
      next(error);
    }
  });
// implementar ruta para agregar nuevo usuario TODO: Implement the route to add new users
  app.post('/users', requireAdmin, async (req, resp, next) => {
    try {
      const userData = req.body;
      const newUser = await User.create(userData);
      resp.status(201).json(newUser);
    } catch (error) {
      console.error('Error al crear un nuevo usuario', error);
      next(error)
    }
  });
// Actualizar=put usuario
  app.put('/users/:uid', requireAuth, async (req, resp, next) => {
    try {
      const userId = req.params.uid;
      const userData = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true});
      if (!updatedUser){
        return resp.status(404).json({ error: 'Usuario no ncontrado' });
      }
      resp.json(updatedUser);
    } catch (error);
    console.error('Erroral actualizar', error);
    next(error);
  });
// Ruta para eleminar=delete user
  app.delete('/users/:uid', requireAuth, async (req, resp, next) => {
    
  });

  initAdminUser(app, next);
};
