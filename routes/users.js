const bcrypt = require('bcrypt');
const express = require('express');
const { connect } = require('../connect');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const {
  getUsers,
  getUserUid,
  postUser,
  updateUser,
  deleteUser,
} = require('../controller/users');

const initAdminUser = async (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    role: 'admin',
  };

  // TODO: Create admin user
  // First, check if adminUser already exists in the database
  try {
    const db = connect();
    const collection = db.collection('user');

    const existingAdminUser = await collection.findOne({ email: adminEmail });
    if (!existingAdminUser) {
      await collection.insertOne(adminUser);
    } else {
      console.log('Admin existente');
    }
    console.log('Usuario creado');
    next();
  } catch (error) {
    console.error('Error al crear admin', error);
    next();
  }
};

module.exports = (app, next) => {
  // Solicitar=get users
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, getUserUid);

  // implementar ruta para agregar nuevo usuario TODO: Implement the route to add new users
  app.post('/users', requireAdmin, postUser);

  // Actualizar=put usuario
  app.put('/users/:uid', requireAuth, updateUser);

  // Ruta para eleminar=delete user
  app.delete('/users/:uid', requireAuth, deleteUser);

  initAdminUser(app, next);
};
