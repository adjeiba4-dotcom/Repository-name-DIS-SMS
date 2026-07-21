exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        const roleName = req.user.role && req.user.role.name;

        if (!allowedRoles.includes(roleName)) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        next();
    };
};