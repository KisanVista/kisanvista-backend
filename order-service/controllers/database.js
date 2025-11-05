const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Get the MongoDB connection URI from the environment variables
const MONGODB_URI = process.env.MONGO_URI; 

// Define the function that establishes and manages the database connection
const connectDB = async () => {
    try {
        // Use mongoose.connect() to connect to the MongoDB instance
        await mongoose.connect(MONGODB_URI);

        console.log('✅ MongoDB connected successfully to the Auth Service.');

        // Return the connection instance if needed elsewhere
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        // Exit process with failure code
        process.exit(1); 
    }
};

// Export the function directly so it can be called immediately after 'require'
module.exports = connectDB;