// logistics-service/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// This should match the secret used by your Auth Service
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; 

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Attach payload data to the request
            // IMPORTANT: The payload must contain userId and userRole (the PostgreSQL ID and role)
            req.userId = decoded.userId;
            req.userRole = decoded.role; 

            if (req.userRole !== 'delivery_partner' && req.userRole !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Delivery Partner or Admin role required.' });
            }

            next();
        } catch (error) {
            console.error('JWT Error:', error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};