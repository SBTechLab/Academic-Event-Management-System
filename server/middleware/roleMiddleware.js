const supabase = require('../config/supabase');

const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if user has role in token
        if (req.user && req.user.role) {
            if (allowedRoles.includes(req.user.role)) {
                next();
            } else {
                res.status(403).json({ error: 'Access denied: Insufficient permissions' });
            }
        } else {
            res.status(403).json({ error: 'User role not found' });
        }
    };
};

module.exports = authorizeRole;
