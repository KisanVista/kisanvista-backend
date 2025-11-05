// routes/chatbotRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const { handleChatbot } = require('../controllers/chatbotController');

router.post('/', upload.single('file'), handleChatbot);

module.exports = router;
