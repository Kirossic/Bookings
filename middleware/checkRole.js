const { ApiError } = require('./errorHandler.js');
const roles = {
    ADMIN: 3,
    MANAGER: 2,
    USER: 1
};

const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role_id) {
            throw new ApiError(403, 'Доступ запрещен');
        }

        if (req.user.role_id < requiredRole) {
            throw new ApiError(403, 'Недостаточно прав');
        }

        next();
    };
};

module.exports = {
    roles,
    verifyRole
};