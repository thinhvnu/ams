var express = require('express');
var router = express.Router();
var userController = require('../controllers/User');

/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* GET users listing. */
router.get('/', passport.isAuthenticated, userController.getIndex);

router.get('/create', userController.getCreate);
router.post('/create', userController.postCreate);

router.get('/edit/:userId', passport.isAuthenticated, userController.getEdit);
router.post('/update/:userId', passport.isAuthenticated, userController.postUpdate);

router.get('/change-password/:userId', passport.isAuthenticated, userController.getChangePassword);
router.post('/update-password/:userId', passport.isAuthenticated, userController.postUpdatePassword);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/logout', passport.isAuthenticated, userController.logout)

module.exports = router;
