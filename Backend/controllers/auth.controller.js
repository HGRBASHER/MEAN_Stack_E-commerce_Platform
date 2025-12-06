const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');

const signToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name,email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError('Invalid email or password', 401));
    }
    const token = signToken(user);
    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data : token
    });
});

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const role = 'user';
    const userExists = await User.findOne({ email });
    if (userExists) return next(new AppError('Email already exists', 400));
    const newUser = await User.create({ name, email, password, role });
    const token = signToken(newUser);
    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        token,
        data: newUser
    });
});

