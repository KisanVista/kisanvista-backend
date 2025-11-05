const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: {
        en: { type: String, required: true },
        kn: { type: String, required: true }
    },
    product_description: {
        en: { type: String, required: true },
        kn: { type: String, required: true }
    },
    product_image: { type: String, required: true },
    product_price: { type: Number, required: true },
    product_discount: { type: Number, required: true },
    product_rating: { type: Number, required: true },
    product_category: {
        en: { type: String, required: true },
        kn: { type: String, required: true }
    },
    product_sub_category: { type: String, required: true },
    product_brand: { type: String, required: true },
    product_quantity: { type: Number, required: true, min: 0 },

    // New fields for "More Details"
    usage_instructions: { type: [String] },
    crop_suitability: { type: [String] },
    technical_specifications: { type: [String] }
    

}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;