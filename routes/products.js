const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  getProducts,
  getProductsById,
  postProduct,
  updateProduct,
  deleteProduct,
} = require('../controller/products');

module.exports = (app, nextMain) => {
  app.get('/products', requireAuth, getProducts);

  app.get('/products/:productId', requireAuth, getProductsById);

  app.post('/products', requireAdmin, postProduct);

  app.put('/products/:productId', requireAdmin, updateProduct);

  app.delete('/products/:productId', requireAdmin, deleteProduct);

  nextMain();
};
