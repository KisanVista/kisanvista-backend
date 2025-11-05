const Cart = require('../models/Cart');

// @desc    Add a product to the cart or update quantity
// @route   POST /api/cart/add
// @access  TEMPORARILY PUBLIC
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            // Cart exists for user
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // Product exists in cart, update quantity
                let productItem = cart.items[itemIndex];
                productItem.quantity += quantity;
                if (productItem.quantity <= 0) {
                     // Remove item if quantity becomes zero or less
                     cart.items.splice(itemIndex, 1);
                }
            } else {
                // Product does not exist in cart, add new item
                cart.items.push({ productId, quantity });
            }
            cart = await cart.save();
            return res.status(200).json(cart);

        } else {
            // No cart for user, create a new cart
            const newCart = await Cart.create({
                userId,
                items: [{ productId, quantity }],
            });
            return res.status(201).json(newCart);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  TEMPORARILY PUBLIC
exports.getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId })
            .populate('items.productId', 'product_name product_price product_image product_quantity'); // Populate product details

        if (!cart) {
            return res.status(200).json({ userId: req.userId, items: [] });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update-quantity
// @access  TEMPORARILY PUBLIC
exports.updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });

    try {
        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found.' });

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            const updatedCart = await cart.save();
            return res.status(200).json(updatedCart);
        } else {
            return res.status(404).json({ message: 'Product not in cart.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating quantity', error: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove-item/:id
// @access  TEMPORARILY PUBLIC
exports.removeItem = async (req, res) => {
    const { id } = req.params; // Item's productId

    try {
        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found.' });

        const initialLength = cart.items.length;
        // Filter out the item to be removed
        cart.items = cart.items.filter(item => item.productId.toString() !== id);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }
        
        const updatedCart = await cart.save();
        res.status(200).json(updatedCart);

    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error: error.message });
    }
};