const express = require('express');
const router = express.Router();
const { createNewBackup, restoreNewDatabase } = require('../controllers/settings.controller');
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.post('/backup', authenticate, authorize('admin'), createNewBackup);
router.post('/restore/:folderName', authenticate, authorize('admin'), restoreNewDatabase);

module.exports = router;
