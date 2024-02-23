const { MongoClient } = require('mongodb');
const config = require('./config');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;
const client = new MongoClient(config.dbUrl);

function connect() {
  try {
    // await client.connect();
    // console.log('Conexión exitosa a la base de datos');
    const db = client.db('Burger-Queen-Api');
    return db;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);

    // Acciones para manejar algun tipo de error
    if (error.code === 'ENOTFOUND') {
      console.error('El servidor de la base de datos no se encuentra.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada');
      throw error;
    }
  }
}

module.exports = { connect };
