const express = require('express');
const router = express.Router();

const {getAllProducts,getProductBySlug,addProduct,updateProduct,deleteProduct,getRelatedProducts,getProductById} = require('../controllers/product.controller');
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');
const { upload } = require('../midlewares/upload.middleware');

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.post('/',authenticate, authorize('admin'),upload.single('img'),addProduct);
router.put('/:slug',authenticate,authorize('admin'),upload.single('img'),updateProduct);
router.delete('/:slug', authenticate, authorize('admin'), deleteProduct);
router.get('/id/:id', getProductById);
router.get('/relatedproducts/:slug', getRelatedProducts);
module.exports = router;
