// order-service/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true },
    supplierId: { type: Number,}, // The warehouse/dealer ID
});

const orderSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    items: [orderItemSchema],
    shippingAddress: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    // CRUCIAL: The State Machine field
    status: { 
        type: String, 
        enum: ['Placed', 'Acknowledged', 'Ready for Pickup', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Placed'
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);