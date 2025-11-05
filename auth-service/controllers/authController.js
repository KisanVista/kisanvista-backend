const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// 1. Import the PostgreSQL query client
const db = require('./db'); 

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Changed to 30d as per standard practice
    });
};

// --- Helper for Shared Validation Logic ---
const validateRegistration = (reqBody) => {
    const { name, mobile, password, confirmPassword, state, district } = reqBody;

    // 1. Basic Validation
    if (!name || !mobile || !password || !confirmPassword || !state || !district) {
        return { valid: false, error: 'Required fields missing' };
    }

    // 2. Password Confirmation Check
    if (password !== confirmPassword) {
        return { valid: false, error: "Passwords do not match" };
    }

    // 3. Mobile Number Validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        return { valid: false, error: 'Mobile number must be exactly 10 digits' };
    }

    // 4. Password Strength Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|(?=.*\W)).{6,}$/;
    if (!passwordRegex.test(password)) {
        return { 
            valid: false, 
            error: 'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, and one number or special character.' 
        };
    }
    return { valid: true };
};


// --- ADMIN REGISTRATION (PostgreSQL Logic) ---
exports.adminRegister = async (req, res) => {
    try {
        const { name, mobile, password, confirmPassword, state, district, village, referral_code } = req.body;

        // 1. Validation Check
        const validation = validateRegistration(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // 2. Check if user already exists (SQL Query)
        const existingUserResult = await db.query('SELECT role FROM users WHERE mobile = $1', [mobile]);
        const existingUser = existingUserResult.rows[0];

        if (existingUser) {
            if (existingUser.role === 'admin') {
                return res.status(409).json({ error: 'Admin account already exists for this mobile number.' });
            }
            return res.status(409).json({ error: 'Mobile number already registered as a standard user.' });
        }
        
        // 3. Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // 4. Create new user instance with ROLE: 'admin' (SQL Insert)
        const role = 'admin';
        const result = await db.query(
            `INSERT INTO users (name, mobile, password_hash, state, district, village, referral_code, role)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [name, mobile, password_hash, state, district, village, referral_code, role]
        );

        res.status(201).json({ 
            message: 'Admin registration successful. You can now log in.', 
            userId: result.rows[0].id 
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ error: 'Server error during admin registration' });
    }
};


// --- FARMER REGISTRATION (PostgreSQL Logic) ---
exports.register = async (req, res) => {
    try {
        const { name, mobile, password, confirmPassword, state, district, village, referral_code } = req.body;
        console.log('Execution reached async block. Checking validation...');
        // 1. Validation Check
        const validation = validateRegistration(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // 2. Check if user already exists (SQL Query)
        const existingUserResult = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        if (existingUserResult.rows.length > 0) {
            return res.status(409).json({ error: 'Mobile number already registered' });
        }

        // 3. Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // 4. Create new user instance (SQL Insert)
        const role = 'farmer'; // Default role
        console.log('Attempting to check user existence...');
        await db.query(
            `INSERT INTO users (name, mobile, password_hash, state, district, village, referral_code, role)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [name, mobile, password_hash, state, district, village, referral_code, role]
        );
        console.log('User check completed.');
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// --- LOGIN USER (PostgreSQL Logic) ---
exports.loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({ error: "Mobile and password required" });
        }

        // 1. Find user by mobile (SQL Query)
        const userResult = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        const user = userResult.rows[0]; // Get the single user record

        if (!user) {
            return res.status(401).json({ error: "Invalid mobile number or password" });
        }

        // 2. Compare entered password with stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid mobile number or password" });
        }

        // 3. Generate JWT
        const token = generateToken(user.id, user.role); // Use user.id (from SQL SERIAL)

        // 4. Return response (Include role and token)
        res.json({
            message: "Login successful",
            token,
            user: {
                _id: user.id, // Using user.id from SQL as the unique identifier
                name: user.name,
                mobile: user.mobile,
                state: user.state,
                district: user.district,
                village: user.village,
                referral_code: user.referral_code,
                role: user.role, 
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
};