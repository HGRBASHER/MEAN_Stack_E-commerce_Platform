exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not logged in' });
        }
        const role = req.user.role;
        if (allowedRoles.includes(role)) {
            return next();
        }
        return res.status(403).json({ message: 'Error: Access Denied' });
    };
};
