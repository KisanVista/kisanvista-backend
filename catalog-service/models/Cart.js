const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    // Reference to the Product collection
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links to the Product model
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1, // Quantity must be at least 1
    },
});

const cartSchema = new mongoose.Schema({
    // Reference to the User collection
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to the User model
        required: true,
        unique: true, // Each user can only have one cart
    },
    items: [cartItemSchema], // Array of products in the cart
}, {
    timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;