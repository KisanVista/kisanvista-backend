const Order = require('../models/Order');
const axios = require('axios');
const kafkaProducer = require('../../utils/kafkaProducer');

// --- Environment Variables for Service Discovery ---
// We must use environment variables for the URL (production-level practice)
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002'; 

// Helper to fetch product details from the Catalog Service (Port 5002)
const fetchProductDetails = async (productId) => {
    try {
        // This is the correct microservices approach: HTTP request to another service
        const response = await axios.get(`${CATALOG_SERVICE_URL}/products/${productId}`); 
        return response.data; // This is the single product object
    } catch (error) {
        // Handle 404s or other service errors
        console.error(`Failed to fetch product ${productId} from Catalog Service:`, error.message);
        return null;
    }
};


// @desc    Create a new order from a user's cart
// @route   POST /api/orders
// @access  Private (Farmer Role)
exports.createOrder = async (req, res) => {
    // In a real system, cart items would be passed, and we would lock them in the DB.
    const { items, shippingAddress } = req.body; 
    const userId = req.userId; // Secure ID from auth middleware

    try {
        let totalPrice = 0;
        let orderItems = [];

        for (const item of items) {
            const productDetail = await fetchProductDetails(item.productId);
            
            if (!productDetail || productDetail.product_quantity < item.quantity) {
                // IMPORTANT: This should send a rollback event in production
                return res.status(400).json({ message: `Insufficient stock for product ID: ${item.productId}` });
            }
            
            totalPrice += productDetail.product_price * item.quantity;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtOrder: productDetail.product_price,
                // supplierId: (Assigned based on routing logic, simplified for now)
            });
        }

        const newOrder = await Order.create({
            userId,
            items: orderItems,
            shippingAddress: shippingAddress || 'Default Address',
            totalPrice: totalPrice,
            paymentStatus: 'Paid', // Assuming payment is processed
            status: 'Placed',
        });

        // --- KAFKA INTEGRATION FOR ORDER PLACEMENT ---
        kafkaProducer.send('ORDER_PLACED_TOPIC', {
            orderId: newOrder._id,
            userId: newOrder.userId,
            items: newOrder.items
        });
        
        // Success: Respond with the new order ID. Stock deduction is done asynchronously later.
        res.status(201).json({ 
            message: 'Order placed successfully.', 
            orderId: newOrder._id,
            totalPrice: totalPrice 
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Server error creating order.' });
    }
};


// @desc    Get all orders (Admin/Supplier View)
// @route   GET /api/orders
// @access  Private (Admin/Supplier/DP Role)
exports.getOrders = async (req, res) => {
    const role = req.userRole;
    const userId = req.userId;
    let filter = {};

    // Filter logic based on role
    if (role === 'supplier') {
        // Suppliers only see orders assigned to their warehouse (need supplierId field)
        // For now, we simulate by letting them see only Orders awaiting acknowledgment (Status: Placed)
        filter.status = 'Placed'; 
    } else if (role === 'delivery_partner') {
        // DPs only see orders assigned to them (Status: Ready for Pickup or Dispatched)
        // We'll need a DP_ID field later, but for now, we just look at statuses
        filter.$in = [{ status: 'Ready for Pickup' }, { status: 'Dispatched' }];
    } else if (role === 'farmer') {
        // Farmers only see their own orders
        filter.userId = userId;
    }

    try {
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId', 'name mobile') // Show who placed the order
            .populate('items.productId', 'product_name product_price'); // Populate product names

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders.' });
    }
};


// @desc    Update order status (Used by Supplier/DP)
// @route   PATCH /api/orders/status/:id
// @access  Private (Admin/Supplier/DP Role)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    const role = req.userRole;
    const validStatuses = ['Acknowledged', 'Ready for Pickup', 'Dispatched', 'Completed'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // --- 1. Basic State Machine Validation ---
        // Suppliers can only move Placed -> Acknowledged -> Ready for Pickup
        let isAllowed = false;
        if (role === 'supplier') {
            if ((order.status === 'Placed' && status === 'Acknowledged') ||
                (order.status === 'Acknowledged' && status === 'Ready for Pickup')) {
                isAllowed = true;
            }
        } 
        // NOTE: Admin role would be handled here (e.g., if (role === 'admin') isAllowed = true;)

        if (!isAllowed) {
             return res.status(403).json({ message: `Forbidden. Role '${role}' cannot move order from ${order.status} to ${status}.` });
        }

        // --- 2. STOP MongoDB Update (Decoupling) ---
        // We NO LONGER update the status in the Order Service database (SAGA pattern).
        // const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });
        
        // --- 3. KAFKA: Emit the Intent as an Event ---
        // We emit the event containing the data required to update the order elsewhere.
        kafkaProducer.send('ORDER_STATUS_TRANSITION_TOPIC', {
            orderId: order._id, // Use order._id since we didn't update the status yet
            oldStatus: order.status,
            newStatus: status,
            triggeredByRole: role,
            userId: order.userId
        });
        
        // --- 4. SUCCESS RESPONSE (Event Acknowledged) ---
        // The service responds immediately, and the status update will happen asynchronously 
        // by the Logistics Service consuming the event.
        res.status(202).json({ 
            message: `Status transition request accepted. Event '${status}' sent to Logistics Service.`, 
            orderId: orderId,
            requestedStatus: status
        });

    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ message: 'Server error updating status.' });
    }
};