const Subcategory = require('../models/subcategory.model');
const Category = require('../models/category.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');
const slugify = require('slugify');

exports.addSubcategory = catchAsync(async (req, res, next) => {
    const { name, categorySlug } = req.body;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return next(new AppError('Category not found', 404));
    const exists = await Subcategory.findOne({ name, category: category._id });
    if (exists) return next(new AppError('Subcategory already exists', 400));
    const slug = slugify(name, { lower: true });
    const subcategory = await Subcategory.create({
        name,
        slug,
        category: category._id
    });
    res.status(201).json({
        status: 'success',
        message: 'Subcategory created successfully',
        data: subcategory
    });
});

exports.updateSubcategory = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { name, categorySlug } = req.body;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return next(new AppError('Category not found', 404));
    const newSlug = slugify(name, { lower: true });
    const subcategory = await Subcategory.findOneAndUpdate(
        { slug },
        { name, slug: newSlug, category: category._id },
        { new: true, runValidators: true }
    );
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'Subcategory updated successfully',
        data: subcategory
    });
});

exports.deleteSubcategory = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const subcategory = await Subcategory.findOneAndUpdate(
        { slug },
        { isDeleted: true },
        { new: true }
    );
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'Subcategory deleted successfully'
    });
});

exports.getAllSubcategories = catchAsync(async (req, res) => {
    const subcategories = await Subcategory.find({ isDeleted: false })
        .populate('category', 'name');
    res.status(200).json({
        status: 'success',
        data: subcategories
    });
});

exports.getSubcategoryBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const subcategory = await Subcategory.findOne({ slug, isDeleted: false })
        .populate('category', 'name');
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    res.status(200).json({
        status: 'success',
        data: subcategory
    });
});
