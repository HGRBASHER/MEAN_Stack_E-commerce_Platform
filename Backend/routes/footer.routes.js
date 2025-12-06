const express = require('express');
const router = express.Router();

const {
    getFooter,
    updateFooter,
} = require('../controllers/footer.controller');

const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.get('/', getFooter);

router.patch('/', authenticate, authorize('admin'), updateFooter);
module.exports = router;