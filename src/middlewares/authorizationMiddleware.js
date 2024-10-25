import ForbiddenError from '../errors/forbiddenError.js';
import { User } from '../models/user.schema.js';

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => { 
        try {
            const user = await User.findById(req.user);
            if (!user || !allowedRoles.includes(user.role)){ 
                throw new ForbiddenError("Access denied. You are not allowed to do this action");
            }
            next(); 
        } catch (error) {
            next(error);
        }
    };
};

export default authorizeRoles; // Export as default