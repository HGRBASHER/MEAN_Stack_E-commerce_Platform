const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');

exports.submitOrder = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { items, address, phone, paymentMethod } = req.body;
    if (!items || items.length === 0)
        return next(new AppError('Cart is empty', 400));
    let totalPrice = 0;
    const orderItems = [];
    const stockUpdates = [];
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product)
            return next(new AppError(`Product ${item.productId} not found`, 404));
        if (product.stock < item.quantity) {
            return next(new AppError(
                `Not enough stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
                400
            ));
        }
        totalPrice += product.price * item.quantity;
        orderItems.push({
            product: product._id,
            price: product.price,
            quantity: item.quantity
        });
        stockUpdates.push({
            productId: product._id,
            productName: product.name,
            newStock: product.stock - item.quantity
        });
    }
    for (const item of items) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true }
        );
    }
    const order = await Order.create({
        user: userId,
        items: orderItems,
        totalPrice,
        address,
        phone,
        paymentMethod,
        status: 'pending'
    });
    await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] },
        { new: true }
    );
    res.status(201).json({
        status: 'success',
        message: 'Order submitted successfully',
        data: {
            order,
            stockUpdated: true,
            stockDetails: stockUpdates
        }
    });
});

exports.getAllOrders = catchAsync(async (req, res) => {
    const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price');
    res.status(200).json({
        status: 'success',
        data: orders
    });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price');
    if (!order)
        return next(new AppError('Order not found', 404));
    res.status(200).json({
        status: 'success',
        data: order
    });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const order = await Order.findById(id);
    if (!order)
        return next(new AppError('Order not found', 404));
    if (user.role === 'user') {
        if (order.status === 'shipped')
            return next(new AppError('Cannot modify order after shipping', 403));
        const { address, phone } = req.body;
        order.address = address || order.address;
        order.phone = phone || order.phone;
        await order.save();
        return res.status(200).json({
            status: 'success',
            message: 'Order updated successfully',
            data: order
        });
    }
    if (user.role === 'admin') {
        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'];
        if (!validStatuses.includes(status))
            return next(new AppError('Invalid status', 400));
        order.status = status;
        await order.save();
        return res.status(200).json({
            status: 'success',
            message: 'Order status updated',
            data: order
        });
    }
});

exports.checkStock = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    const stockIssues = [];
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product && product.stock < item.quantity) {
            stockIssues.push({
                productId: item.productId,
                productName: product.name,
                available: product.stock,
                requested: item.quantity
            });
        }
    }
    res.status(200).json({
        status: stockIssues.length === 0 ? 'success' : 'partial',
        message: stockIssues.length === 0
            ? 'All items are in stock'
            : 'Some items have stock issues',
        data: {
            stockIssues,
            allAvailable: stockIssues.length === 0
        }
    });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.user._id; 
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});

exports.updateUserOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { items, address, phone } = req.body;
    const order = await Order.findOne({ _id: id, user: userId, deleted: false });
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
    if (order.status === 'shipped' || order.status === 'delivered') {
        return next(new AppError('Cannot modify order after shipping', 400));
    }
    let totalPrice = order.totalPrice;
    const updatedItems = [];
    if (items && items.length > 0) {
        totalPrice = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return next(new AppError(`Product ${item.productId} not found`, 404));
            }
            const oldItem = order.items.find(i => i.product.toString() === item.productId);
            const oldQuantity = oldItem ? oldItem.quantity : 0;
            const quantityChange = item.quantity - oldQuantity;
            if (product.stock < quantityChange) {
                return next(new AppError(
                    `Not enough stock for product: ${product.name}. Available: ${product.stock}, Requested change: ${quantityChange}`,
                    400
                ));
            }
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -quantityChange } },
                { new: true }
            );
            totalPrice += product.price * item.quantity;
            updatedItems.push({
                product: product._id,
                price: product.price,
                quantity: item.quantity
            });
        }
    }
    order.items = updatedItems.length > 0 ? updatedItems : order.items;
    order.address = address || order.address;
    order.phone = phone || order.phone;
    order.totalPrice = totalPrice;
    await order.save();
    const updatedOrder = await Order.findById(order._id)
        .populate('items.product', 'name price');
    res.status(200).json({
        status: 'success',
        message: 'Order updated successfully',
        data: updatedOrder
    });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { cancelReason } = req.body;
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
    if (order.status === 'cancelled' || order.status === 'returned') {
        return next(new AppError(`Order is already ${order.status}`, 400));
    }
    let newStatus = '';
    let message = '';
    let isReturn = false;
    if (order.status === 'pending' || order.status === 'preparing') {
        newStatus = 'cancelled';
        isReturn = false;
        message = 'Order cancelled successfully.';
    } 
    else if (order.status === 'shipped' || order.status === 'delivered') {
        newStatus = 'returned';
        isReturn = true;
        message = order.status === 'shipped' 
            ? 'Return requested for shipped order.'
            : 'Return requested for delivered order.';
    }
    else {
        return next(new AppError('Cannot cancel order in current status', 400));
    }
    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }, 
            { new: true }
        );
    }
    if (!isReturn) {
        order.deleted = true;
        order.deletedAt = new Date();
    }
    order.status = newStatus;
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || (isReturn ? 'Return requested by user' : 'Cancelled by user');
    await order.save();
    res.status(200).json({
        status: 'success',
        message: message + ' Stock has been restocked.',
        data: {
            order,
            stockRestocked: true,
            isReturn: isReturn,
            itemsRestocked: order.items.length,
            nextSteps: isReturn 
                ? 'Please wait for return instructions and refund process.' 
                : 'Order cancelled completely.'
        }
    });
});
