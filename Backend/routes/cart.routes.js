
const express = require('express');
const router = express.Router();
const { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeItem, 
    clearCart 
} = require('../controllers/cart.controller');

const { authenticate } = require('../midlewares/auth.middleware');

router.get('/me', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/update', authenticate, updateCartItem);
router.delete('/remove/:productId', authenticate, removeItem);
router.delete('/clear', authenticate, clearCart);

module.exports = router;