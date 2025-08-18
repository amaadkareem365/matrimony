

const express = require('express');
const auth = require('../middlewares/auth');
const chatController = require('../controllers/chat.controller');
const router = express.Router();

router.route('/').post(auth(),chatController.accessChat);
router.get('/user-chats', auth(), chatController.getUserChats);
router.patch("/:chatId/mark-read", auth(), chatController.markChatAsRead);
router.patch('/reset-message-count', auth(), chatController.resetMessageCount);


module.exports = router;