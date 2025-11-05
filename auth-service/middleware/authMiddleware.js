// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Protection Middleware (Verifies token and attaches user info to request)
exports.protect = (req, res, next) => {
    let token;

    // Check for token in the 'Authorization: Bearer <token>' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token part
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Attach user information (id and role) from the JWT payload to the request
            req.userId = decoded.id; 
            req.userRole = decoded.role;
            
            next(); // Token valid, proceed to the route handler

        } catch (error) {
            console.error('Token verification failed:', error);
            // 401 Unauthorized: Token is invalid, expired, or tampered with
            return res.status(401).json({ message: 'Not authorized, invalid or expired token.' });
        }
    }

    if (!token) {
        // 401 Unauthorized: No token was found in the header
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

// 2. Admin Authorization Middleware (Checks if the authenticated user has the 'admin' role)
exports.admin = (req, res, next) => {
    // This runs AFTER the 'protect' middleware, so req.userRole is guaranteed to exist.
    if (req.userRole && req.userRole === 'admin') {
        next(); // User is an admin, proceed
    } else {
        // 403 Forbidden: User is logged in but does not have the necessary permissions
        return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
};

