const express = require('express');
const router = express.Router();
const { register, loginUser,adminRegister } = require('../controllers/authController');

router.post('/register', register);

router.post('/admin/register', adminRegister); 
// Login route (POST)
router.post('/login', loginUser);


module.exports = router;
