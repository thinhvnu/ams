var express = require('express');
var router = express.Router();
var userController = require('./../controllers/User');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* GET users Info. */
router.get('/info', passport.isAuthenticated, userController.getInfo);

/* POST firebase device token. */
router.post('/update-info', passport.isAuthenticated, userController.postUpdateInfo);

/* POST firebase device token. */
router.post('/firebase-device-token', passport.isAuthenticated, userController.postFirebaseDeviceToken);

module.exports = router;
