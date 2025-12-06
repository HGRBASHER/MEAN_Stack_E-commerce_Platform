const AppError = require('../utilities/app-error.utils');
const logger = require('../utilities/logger.utils');

module.exports = (err, req, res, next) => {
    logger.error(err.message , { stack: err.stack });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
};
