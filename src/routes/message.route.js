

const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const messageController = require('../controllers/message.controller');
const router = express.Router();

router.route('/').post(auth(),messageController.sendMessage);
router.route('/:chatId').get(messageController.getMessage);
router.route('/pusher/autenticate').post(auth(),messageController.authenticatePusher);
router.post('/pusher/webhooks', messageController.handlePresenceWebhook);







module.exports = router;