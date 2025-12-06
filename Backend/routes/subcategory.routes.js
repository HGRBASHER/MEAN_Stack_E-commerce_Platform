const express = require('express');
const router = express.Router();

const {getAllSubcategories,getSubcategoryBySlug,addSubcategory,updateSubcategory,deleteSubcategory} = require('../controllers/subcategory.controller');

const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.get('/', getAllSubcategories);
router.get('/:slug', getSubcategoryBySlug);
router.post('/', authenticate, authorize('admin'), addSubcategory);
router.put('/:slug', authenticate, authorize('admin'), updateSubcategory);
router.delete('/:slug', authenticate, authorize('admin'), deleteSubcategory);

module.exports = router;
