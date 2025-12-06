const express = require('express');
const router = express.Router();

const { getAllCategories, addCategory, updateCategory, deleteCategory, getCategoryBySlug } = require('../controllers/category.controller');
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug); 

router.post('/', authenticate, authorize('admin'), addCategory);
router.put('/:slug', authenticate, authorize('admin'), updateCategory);
router.delete('/:slug', authenticate, authorize('admin'), deleteCategory);

module.exports = router;
