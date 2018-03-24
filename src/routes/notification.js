var express = require('express');
var router = express.Router();
var NotificationController = require('../controllers/Notification');

router.get('/', NotificationController.getIndex);
router.get('/create', NotificationController.getCreate);
router.post('/create', NotificationController.postCreate);

module.exports = router;
