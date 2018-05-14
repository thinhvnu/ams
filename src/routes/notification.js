var express = require('express');
var router = express.Router();
var NotificationController = require('../controllers/Notification');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../middleware/passport');

router.get('/', passport.isAuthenticated, NotificationController.getIndex);
router.get('/create', NotificationController.getCreate);
router.post('/create', NotificationController.postCreate);
router.get('/send-fire-warning/:fbId', passport.isAuthenticated, NotificationController.getSendFireWarning);
router.get('/view/:notiId', passport.isAuthenticated, NotificationController.getView);

module.exports = router;
