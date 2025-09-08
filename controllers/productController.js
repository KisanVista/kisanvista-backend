// const { default: API } = require('razorpay/dist/types/api');
const Product = require('../models/product');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
    try {
        const { category, product_brand, sort, page = 1, limit = 10 } = req.query;

        // Build the filter object
        const filter = {};
        if (category) {
            filter['product_category.en'] = category;
        }
        if (product_brand) {
            filter.product_brand = product_brand;
        }

        // Build the sort object
        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        // Calculate skip value for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            totalProducts,
            page: parseInt(page),
            pages: Math.ceil(totalProducts / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create a new product (for admin only)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product by ID (for admin only)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // The `findByIdAndUpdate` method updates the product with all
        // fields passed in `req.body`. `new: true` returns the updated document.
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// AI Insights
// ...existing code...

exports.getAiInsights = async (req, res) => {
    const { productName, productCategory, userLocation } = req.body;

    console.log("AI Insights request body:", req.body);

    if (!productName || !productCategory) {
        console.log("Missing productName or productCategory");
        return res.status(400).json({ message: 'Product name and description are required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an expert agricultural advisor for KisanVista.

Review the following fertilizer product details and provide structured, concise, farmer-friendly advice as a JSON object with exactly 5 sections:

Instructions:
- Provide exactly 3 key points each for: "applicationTips", "uses", "methodOfApplication", "safetyPrecautions", "suitablePlants".
- Use simple language suitable for farmers.
- ONLY respond with a valid JSON object, no extra text or explanation.
- Output format:
{
  "applicationTips": ["Tip 1", "Tip 2", "Tip 3"],
  "uses": ["Use 1", "Use 2", "Use 3"],
  "methodOfApplication": ["Method 1", "Method 2", "Method 3"],
  "safetyPrecautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
  "suitablePlants": ["Plant 1", "Plant 2", "Plant 3"]
}

Product Name: ${productName}
Product Category: ${productCategory}
User's Location: ${userLocation}

`;

        console.log("Sending prompt to Gemini:", prompt);

        const result = await model.generateContent(prompt);
        const response = result.response;

        // FIX: Call .text() as a function
        const aiText = await response.text();

        console.log("AI Insights response:", aiText);

        res.json({ insights: aiText });

    } catch (error) {
        console.error("Error generating AI insights:", error);
        res.status(500).json({ message: "Failed to generate AI insights." });
    }
};