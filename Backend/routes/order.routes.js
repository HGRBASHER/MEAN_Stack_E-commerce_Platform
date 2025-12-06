const express = require('express');
const router = express.Router();

const {submitOrder,getAllOrders,getOrderById,updateOrder,getUserOrders,checkStock,cancelOrder,updateUserOrder} = require('../controllers/order.controller');

const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.post('/', authenticate, authorize('user'), submitOrder);
router.get('/my-orders', authenticate, getUserOrders); 
router.put('/user/:id', authenticate, authorize('user'), updateUserOrder);
router.delete('/user/:id', authenticate, authorize('user'), cancelOrder); 
router.get('/', authenticate, authorize('admin'), getAllOrders);

router.get('/:id', authenticate, getOrderById);

router.put('/:id', authenticate, updateOrder);
router.post('/check-stock', authenticate, checkStock);
module.exports = router;
