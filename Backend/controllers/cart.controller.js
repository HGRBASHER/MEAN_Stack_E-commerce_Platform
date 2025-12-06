const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

exports.getCart = catchAsync(async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return next(new AppError('Please login to view cart', 401));
        }
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId })
            .populate('products.productId', 'name price imgURL description').lean();
        if (!cart || !cart.products || cart.products.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: {
                    items: [],
                    total: 0,
                    message: "Cart is empty"
                }
            });
        }
        let total = 0;
        const items = cart.products.map(item => {
            const product = item.productId;
            const itemPrice = product?.price || 0;
            const itemQuantity = item.quantity || 1;
            const itemTotal = itemPrice * itemQuantity;
            total += itemTotal;
            return {
                productId: item.productId,
                quantity: itemQuantity,
                product: product ? {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    imgURL: product.imgURL
                } : null,
                itemTotal: itemTotal
            };
        });
        res.status(200).json({
            status: 'success',
            data: {
                cartId: cart._id,
                items: items,
                total: total,
                itemCount: items.length
            }
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
});

exports.addToCart = catchAsync(async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return next(new AppError('Please login to add items to cart', 401));
        }
        const userId = req.user._id;
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return next(new AppError('Product ID and quantity are required', 400));
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError('Invalid product ID', 400));
        }
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        let cart = await Cart.findOneAndUpdate(
            { user: userObjectId },
            {},
            { 
                upsert: false, new: true 
            }
        );
        if (!cart) {
            cart = new Cart({
                user: userObjectId,
                products: []
            });
            try {
                await cart.save();
            } catch (saveError) {
                if (saveError.code === 11000) {
                    cart = await Cart.findOne({ user: userObjectId });
                    if (!cart) {
                        throw new AppError('Failed to create or find cart', 500);
                    }
                } else {
                    throw saveError;
                }
            }
        }
        const existingProductIndex = cart.products.findIndex(
            item => item.productId.toString() === productId
        );
        if (existingProductIndex > -1) {
            cart.products[existingProductIndex].quantity += Number(quantity);
        } else {
            cart.products.push({
                productId: productObjectId,
                quantity: Number(quantity)
            });
        }
        await cart.save();
        res.status(200).json({
            status: "success",
            message: "Product added to cart",
            data: {
                productId,
                quantity: Number(quantity),
                cartId: cart._id,
                totalItems: cart.products.length
            }
        });
        
    } catch (error) {
        console.error('Error in addToCart:', error);
        if (error.code === 11000) {
            return next(new AppError('Cart already exists for this user. Please try again.', 400));
        }
        return next(new AppError(error.message || 'Failed to add to cart', 500));
    }
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        if (!req.user || !req.user._id) {
            return next(new AppError('Please login', 401));
        }
        if (!productId || !quantity) {
            return next(new AppError('Product ID and quantity are required', 400));
        }
        if (quantity < 1) {
            return next(new AppError('Quantity must be at least 1', 400));
        }
        const cart = await Cart.findOneAndUpdate(
            { 
                user: req.user._id,
                'products.productId': productId 
            },
            { 
                $set: { 'products.$.quantity': quantity } 
            },
            { new: true }
        );
        if (!cart) {
            return next(new AppError('Product not found in cart', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Cart item updated',
            data: { productId, quantity }
        });
        
    } catch (error) {
        next(new AppError(error.message, 500));
    }
});

exports.removeItem = catchAsync(async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!req.user || !req.user._id) {
            return next(new AppError('Please login', 401));
        }
        if (!productId) {
            return next(new AppError('Product ID is required', 400));
        }
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { 
                $pull: { products: { productId: productId } } 
            },
            { new: true }
        );
        if (!cart) {
            return next(new AppError('Cart not found', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Item removed from cart',
            data: { cartId: cart._id, remainingItems: cart.products.length }
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
});

exports.clearCart = catchAsync(async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return next(new AppError('Please login', 401));
        }
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { 
                $set: { products: [] } 
            },
            { new: true }
        );
        if (!cart) {
            return next(new AppError('Cart not found', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Cart cleared successfully',
            data: { cartId: cart._id }
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
});