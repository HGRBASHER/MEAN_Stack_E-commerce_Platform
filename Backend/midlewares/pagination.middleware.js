module.exports = (model) => {
    return async (req, res, next) => {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        res.pagination = {
            limit,
            skip
        };

        next();
    };
};
