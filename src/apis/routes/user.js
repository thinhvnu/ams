var express = require('express');
var router = express.Router();
var userController = require('./../controllers/User');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

router.post('/register', userController.postRegister);

/* GET users Info. */
router.get('/info', passport.isAuthenticated, userController.getInfo);

/* POST firebase device token. */
router.post('/update-info', passport.isAuthenticated, userController.postUpdateInfo);

/* POST firebase device token. */
router.post('/firebase-device-token', passport.isAuthenticated, userController.postFirebaseDeviceToken);

router.get('/search', userController.getSearch);

/* DELETE firebase token logout*/
router.get('/remove-token-firebase/:token_firebase',passport.isAuthenticated,userController.deleteTokenFirebase);

router.post('/change-password', passport.isAuthenticated, userController.postChangePassword);

router.get('/logout', passport.isAuthenticated, userController.getLogout);

module.exports = router;
