const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');
const slugify = require('slugify');

exports.getAllProducts = catchAsync(async (req, res) => {
    const products = await Product.find({ isDeleted: false })
        .populate('category', 'name')
        .populate('subcategory', 'name');
    res.status(200).json({
        status: "success",
        data: products
    });
});

exports.getProductBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isDeleted: false })
        .populate('category', 'name')
        .populate('subcategory', 'name');
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({
        status: "success",
        data: product
    });
});

exports.addProduct = catchAsync(async (req, res, next) => {
    const { name, description, price, stock, categorySlug, subcategorySlug} = req.body;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return next(new AppError('Category not found', 404));
    const subcategory = await Subcategory.findOne({ slug: subcategorySlug, category: category._id });
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    const imgURL = req.file?.filename || null;
    const product = await Product.create({
        name,
        description,
        price,
        stock,
        slug: slugify(name, { lower: true }),
        category: category._id,
        subcategory: subcategory._id,
        imgURL
    });
    res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: product
    });
});

exports.getRelatedProducts = async (req, res) => {
    const slug = req.params.slug;
    const products = await Product.find({slug: { $ne: slug }});
    res.status(200).json({ message: `related products for (${slug})`, data: products })
}

exports.updateProduct = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { name, description, price, stock, categorySlug, subcategorySlug } = req.body;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return next(new AppError('Category not found', 404));
    const subcategory = await Subcategory.findOne({ slug: subcategorySlug, category: category._id });
    if (!subcategory) return next(new AppError('Subcategory not found', 404));
    const newSlug = slugify(name, { lower: true });
    const updateData = {
        name,
        description,
        price,
        stock,
        slug: newSlug,
        category: category._id,
        subcategory: subcategory._id
    };
    if (req.file?.filename) {
        updateData.imgURL = req.file.filename;
    }
    const product = await Product.findOneAndUpdate(
        { slug },
        updateData,
        { new: true, runValidators: true }
    );
    if (!product) return next(new AppError('Product not found', 404));
    res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: product
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const product = await Product.findOneAndUpdate(
        { slug },
        { isDeleted: true },
        { new: true }
    );
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({
        status: "success",
        message: "Product deleted successfully"
    });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id)
        .populate('category', 'name')
        .populate('subcategory', 'name');
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({
        status: "success",
        data: product
    });
});