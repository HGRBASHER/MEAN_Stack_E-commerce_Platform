const Footer = require('../models/footer.model');
const catchAsync = require('../utilities/catch-async.utils');
const AppError = require('../utilities/app-error.utils');

exports.getFooter = catchAsync(async (req, res) => {
    let footer = await Footer.findOne({});
    if (!footer) {
        footer = {
            name: '',
            desc: '',
            facebook: '',
            github: '',
            linkedin: '',
            instagram: ''
        };
    }
    res.status(200).json({
        status: 'success',
        data: footer
    });
});

exports.updateFooter = catchAsync(async (req, res) => {
    const footer = await Footer.findOneAndUpdate(
        {},
        req.body,
        {
            new: true, 
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true
        }
    );
    res.status(200).json({
        status: 'success',
        message: 'Footer updated successfully',
        data: footer
    });
});