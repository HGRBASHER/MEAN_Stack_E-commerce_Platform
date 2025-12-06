const Order = require('../models/order.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');

exports.getSalesReport = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const matchStage = {};
    if (startDate && !endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate)
        };
    }
    else if (!startDate && endDate) {
        matchStage.createdAt = {
            $lte: new Date(endDate)
        };
    }
    else if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    const summary = await Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $addFields: { totalPrice: { $multiply: ['$items.quantity', '$items.price'] } } },
        {
            $facet: {
                overallStats: [
                    { $group: {
                        _id: null,
                        totalSalesAmount: { $sum: '$totalPrice' },
                        totalQuantity: { $sum: '$items.quantity' },
                        totalOrders: { $sum: 1 }
                    }}
                ],
                topProducts: [
                    { $group: {
                        _id: '$product._id',
                        name: { $first: '$product.name' },
                        revenue: { $sum: '$totalPrice' },
                        quantitySold: { $sum: '$items.quantity' }
                    }},
                    { $sort: { revenue: -1 } },
                    { $limit: 5 }
                ],
                topUsers: [
                    { $group: {
                        _id: '$user._id',
                        name: { $first: '$user.name' },
                        email: { $first: '$user.email' },
                        totalSpent: { $sum: '$totalPrice' },
                        totalQuantity: { $sum: '$items.quantity' },
                        totalOrders: { $sum: 1 }
                    }},
                    { $sort: { totalSpent: -1 } },
                    { $limit: 5 }
                ],
                monthlyStats: [
                    { $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        totalRevenue: { $sum: '$totalPrice' },
                        totalQuantity: { $sum: '$items.quantity' },
                    }},
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]
            }
        }
    ]);
    if (!summary || summary.length === 0) {
        return next(new AppError('No sales data found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: startDate && endDate 
            ? `Sales report from ${startDate} to ${endDate}` 
            : 'Sales report',
        data: summary
    });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaySales = await Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            todayRevenue: todaySales[0]?.total || 0,
            averageOrderValue: totalRevenue[0]?.total / (totalOrders || 1)
        }
    });
});

exports.exportReport = catchAsync(async (req, res, next) => {
    const { format } = req.params;
    const { startDate, endDate } = req.query;
    const matchStage = {};
    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    const orders = await Order.find(matchStage)
        .populate('user', 'name email')
        .populate('items.product', 'name price');
    if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.pdf"`);
        res.send('PDF content would be here');
    } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.xlsx"`);
        res.send('Excel content would be here');
    } else {
        return next(new AppError('Invalid format', 400));
    }
});