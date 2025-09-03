const express = require('express');
const router = express.Router();
const { register, loginUser } = require('../controllers/authController');

router.post('/register', register);
// Login route (POST)
router.post('/login', loginUser);


module.exports = router;
