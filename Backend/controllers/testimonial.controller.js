const Testimonial = require('../models/testimonial.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');


exports.createTestimonial = catchAsync(async (req, res, next) => {
    const { orderId, rating, comment } = req.body;
    const userId = req.user._id;
if (!orderId || !rating || !comment) {
    return next(new AppError('All fields are required', 400));
    }
    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
if (order.status !== 'delivered' && order.status !== 'returned') {
        return next(new AppError('You can only review delivered or returned orders', 400));
    }
    const existingTestimonial = await Testimonial.findOne({
        user: userId,
        order: orderId
    });
    if (existingTestimonial) {
        return next(new AppError('You have already submitted a testimonial for this order', 400));
    }
    const testimonial = await Testimonial.create({
        user: userId,
        order: orderId,
        rating,
        comment,
        status: 'pending',
        isApproved: false
    });
    res.status(201).json({
        status: 'success',
        message: 'Testimonial submitted for review',
        data: testimonial
    });
});

exports.getApprovedTestimonials = catchAsync(async (req, res) => {
    const testimonials = await Testimonial.find({
        status: 'approved',
        isApproved: true
    })
        .populate('user', 'name email profilePicture')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: testimonials
    });
});

exports.getLatestApprovedTestimonials = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const testimonials = await Testimonial.find({
        status: 'approved',
        isApproved: true
    })
        .populate('user', 'name profilePicture')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 })
        .limit(limit);
    res.status(200).json({
        status: 'success',
        data: testimonials
    });
});

exports.getMyTestimonials = catchAsync(async (req, res) => {
    const testimonials = await Testimonial.find({ user: req.user._id })
        .populate('order', 'orderNumber totalAmount status')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        data: testimonials
    });
});

exports.updateMyTestimonial = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const testimonial = await Testimonial.findOne({
        _id: id,
        user: req.user._id,
        status: 'pending'
    });
    if (!testimonial) {
        return next(new AppError('Testimonial not found or cannot be edited', 404));
    }
    testimonial.rating = rating || testimonial.rating;
    testimonial.comment = comment || testimonial.comment;
    testimonial.status = 'pending';
    await testimonial.save();
    res.status(200).json({
        status: 'success',
        message: 'Testimonial updated and sent for re-review',
        data: testimonial
    });
});

exports.deleteMyTestimonial = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    res.status(204).json({
        status: 'success',
        message: 'Testimonial deleted successfully'
    });
});

exports.getAllTestimonials = catchAsync(async (req, res) => {
    const testimonials = await Testimonial.find()
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: testimonials
    });
});

exports.approveTestimonial = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    testimonial.status = 'approved';
    testimonial.isApproved = true;
    testimonial.adminNotes = adminNotes;
    await testimonial.save();
    res.status(200).json({
        status: 'success',
        message: 'Testimonial approved successfully',
        data: testimonial
    });
});

exports.rejectTestimonial = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    testimonial.status = 'rejected';
    testimonial.isApproved = false;
    testimonial.adminNotes = adminNotes;
    await testimonial.save();
    res.status(200).json({
        status: 'success',
        message: 'Testimonial rejected',
        data: testimonial
    });
});

exports.adminDeleteTestimonial = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    res.status(204).json({
        status: 'success',
        message: 'Testimonial deleted successfully'
    });
});