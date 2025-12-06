const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');
const { authenticate } = require('../midlewares/auth.middleware');
const { authorize } = require('../midlewares/role.middleware');

router.get('/approved', testimonialController.getApprovedTestimonials);
router.get('/approved/latest', testimonialController.getLatestApprovedTestimonials);
router.post('/', authenticate, testimonialController.createTestimonial);
router.get('/my-testimonials', authenticate, testimonialController.getMyTestimonials);
router.put('/:id', authenticate, testimonialController.updateMyTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteMyTestimonial);
router.get('/', authenticate, authorize('admin'), testimonialController.getAllTestimonials);
router.put('/:id/approve', authenticate, authorize('admin'), testimonialController.approveTestimonial);
router.put('/:id/reject', authenticate, authorize('admin'), testimonialController.rejectTestimonial);
router.delete('/:id', authenticate, authorize('admin'), testimonialController.adminDeleteTestimonial);

module.exports = router;