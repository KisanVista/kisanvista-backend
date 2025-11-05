// logistics-service/routes/dpRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../controllers/db');
const { protect } = require('../middleware/authMiddleware'); 

// @route   POST /api/logistics/dp/location
// @desc    Update Delivery Partner's real-time location
// @access  Private (Delivery Partner Role Required)
router.post('/location', protect, async (req, res) => {
    // Note: The protect middleware checks for a 'delivery_partner' role
    const { latitude, longitude } = req.body;
    const userId = req.userId; // Secure integer ID from JWT payload

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and Longitude are required.' });
    }

    // PostGIS Query: 
    // ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) converts standard coordinates 
    // into the required geospatial format (SRID 4326).
    // ON CONFLICT (user_id) DO UPDATE handles high-frequency updates without creating duplicate DPs.
    const query = `
        INSERT INTO delivery_partners (user_id, last_known_location, updated_at)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), NOW())
        ON CONFLICT (user_id) DO UPDATE 
        SET last_known_location = ST_SetSRID(ST_MakePoint($2, $3), 4326), updated_at = NOW()
        RETURNING user_id;
    `;
    
    try {
        await db.query(query, [userId, longitude, latitude]);
        res.status(200).json({ message: 'Location updated successfully.' });
    } catch (error) {
        console.error('Location update failed:', error);
        res.status(500).json({ message: 'Server error updating location.' });
    }
});

module.exports = router;