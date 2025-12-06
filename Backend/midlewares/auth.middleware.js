const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utilities/app-error.utils');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Unauthorized: No token provided', 401));
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const userId = decoded.id;
            const myUser = await User.findById(userId).select('-password');
            if (!myUser) {
                return next(new AppError('Unauthorized: Invalid token', 401));
            }
            req.user = myUser;
            next();
        } catch (err) {
            return next(new AppError('Unauthorized: Invalid token', 401));
        }
    } catch (error) {
        return next(new AppError('Unauthorized', 401));
    }
};
