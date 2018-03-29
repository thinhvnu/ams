var express = require('express');
var router = express.Router();
var feedbackController = require('./../controllers/FeedBack');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* API create new feedback */
router.post('/create', passport.isAuthenticated, feedbackController.postCreate);


module.exports = router;
