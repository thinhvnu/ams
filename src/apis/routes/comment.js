var express = require('express');
var router = express.Router();
var commentController = require('./../controllers/Comment');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* API create new post */
router.post('/create-new', passport.isAuthenticated, commentController.postCreateNew);


module.exports = router;
