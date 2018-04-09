var express = require('express');
var router = express.Router();
var LikeController = require('./../controllers/Like');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* API like post */
router.post('/create-new', passport.isAuthenticated, LikeController.postCreateNew);


module.exports = router;
