const express = require('express');
const router = express.Router();

const {getAllUsers,getUser,updateUser, deleteUser,getUserOrdersForAdmin,updateOrderStatus,getUserTestimonials,approveTestimonial,rejectTestimonial,getAllTestimonials} = require('../controllers/user.controller');
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUser);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

router.get('/:id/orders', authenticate, authorize('admin'), getUserOrdersForAdmin);
router.put('/orders/:orderId/status', authenticate, authorize('admin'), updateOrderStatus);
router.get('/:id/testimonials', authenticate, authorize('admin'), getUserTestimonials);
router.put('/testimonials/:testimonialId/approve', authenticate, authorize('admin'), approveTestimonial);
router.put('/testimonials/:testimonialId/reject', authenticate, authorize('admin'), rejectTestimonial);
router.get('/testimonials/all', authenticate, authorize('admin'), getAllTestimonials);
module.exports = router;
