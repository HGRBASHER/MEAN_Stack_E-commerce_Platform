const { getSalesReport } = require('../controllers/sales-report.controller');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');
const reportController = require('../controllers/sales-report.controller');
router.get('/', authenticate, authorize('admin'),reportController.getSalesReport);
router.get('/dashboard', authenticate, authorize('admin'), reportController.getDashboardStats);
router.get('/export/:format', authenticate, authorize('admin'), reportController.exportReport);

module.exports = router