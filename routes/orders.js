const { requireAuth } = require('../middleware/auth');
const {
  postOrders,
  getOrders,
  getOrdersById,
  updateOrders,
  deleteOrders,
} = require('../controller/orders');

module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, getOrders);

  app.get('/orders/:orderId', requireAuth, getOrdersById);

  app.post('/orders', requireAuth, postOrders);

  app.put('/orders/:orderId', requireAuth, updateOrders);

  app.delete('/orders/:orderId', requireAuth, deleteOrders);

  nextMain();
};
