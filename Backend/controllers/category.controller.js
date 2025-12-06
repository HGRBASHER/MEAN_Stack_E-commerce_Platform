const Category = require('../models/category.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');
const Subcategory = require('../models/subcategory.model');
const slugify = require('slugify');

exports.addCategory = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return next(new AppError('Category already exists', 400));
    const slug = slugify(name, { lower: true });
    const category = await Category.create({ name, description, slug });
    res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: category
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { name, description } = req.body;
    const newSlug = slugify(name, { lower: true });
    const category = await Category.findOneAndUpdate(
        { slug },
        { name, description, slug: newSlug },
        { new: true, runValidators: true }
    );
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: category
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({ slug });
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully'
    });
});

exports.getAllCategories = catchAsync(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({
        status: 'success',
        data: categories
    });
});

exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({
        status: 'success',
        data: category
    });
});
