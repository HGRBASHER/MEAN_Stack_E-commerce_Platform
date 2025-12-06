const User = require('../models/user.model');
const Order = require('../models/order.model');
const Testimonial = require('../models/testimonial.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');
const bcrypt = require('bcrypt');

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json({ status: 'success', data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ status: 'success', data: user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    if (req.body.role) delete req.body.role;
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 12);
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) return next(new AppError('User not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: updatedUser
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
    });
});

exports.getUserOrdersForAdmin = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status', 400));
    }
    const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    );
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Order status updated successfully',
        data: order
    });
});

exports.getUserTestimonials = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const testimonials = await Testimonial.find({ user: userId })
        .populate('order', 'orderNumber totalAmount')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: testimonials
    });
});

exports.approveTestimonial = catchAsync(async (req, res, next) => {
    const { testimonialId } = req.params;
    const { adminNotes } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
        testimonialId,
        { 
            status: 'approved',
            isApproved: true,
            adminNotes
        },
        { new: true, runValidators: true }
    );
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Testimonial approved successfully',
        data: testimonial
    });
});

exports.rejectTestimonial = catchAsync(async (req, res, next) => {
    const { testimonialId } = req.params;
    const { adminNotes } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
        testimonialId,
        { 
            status: 'rejected',
            isApproved: false,
            adminNotes
        },
        { new: true, runValidators: true }
    );
    if (!testimonial) {
        return next(new AppError('Testimonial not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Testimonial rejected',
        data: testimonial
    });
});

exports.getAllTestimonials = catchAsync(async (req, res) => {
    const { status } = req.query;
    let filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
    }
    const testimonials = await Testimonial.find(filter)
        .populate('user', 'name email') 
        .populate('order', 'orderNumber _id')  
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: testimonials
    });
});