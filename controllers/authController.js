const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body); // Debug log
    const { name, mobile, password, confirmPassword, state, district, village, referral_code } = req.body;

    // --- Start of New/Updated Validation ---

    // 1. Basic Validation: Check for all required fields (added confirmPassword here for backend check)
    if (!name || !mobile || !password || !confirmPassword || !state || !district) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // 2. Password Confirmation Check (moved from frontend to backend)
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    // 3. Mobile Number Validation: Must be 10 digits
    // Using a regular expression to check for exactly 10 digits
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ error: 'Mobile number must be exactly 10 digits' });
    }

    // 4. Password Strength Validation
    // Regex for:
    // - Minimum 6 characters (.{6,})
    // - At least one uppercase letter (?=.*[A-Z])
    // - At least one lowercase letter (?=.*[a-z])
    // - At least one number or special character (?=.*[\d\W]) - \d for digit, \W for non-alphanumeric (special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|(?=.*\W)).{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, and one number or special character.'
        });
    }

    // --- End of New/Updated Validation ---

    // 5. Check if user (mobile number) already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(409).json({ error: 'Mobile number already registered' });
    }

    // 6. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 7. Create new user instance and save to DB
    const newUser = new User({
      name,
      mobile,
      password_hash,
      state,
      district,
      village,
      referral_code
    });
    await newUser.save();

    // 8. Send success response
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile and password required" });
    }

    // 1. Find user by mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ error: "Invalid mobile number or password" });
    }

    // 2. Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash); // you use 'password_hash'
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid mobile number or password" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user._id, name: user.name, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    // 4. Return response (never include password_hash!)
    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        mobile: user.mobile,
        state: user.state,
        district: user.district,
        village: user.village,
        referral_code: user.referral_code
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

