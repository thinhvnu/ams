var express = require('express');
var router = express.Router();
var ServiceRequestController = require('../controllers/ServiceRequest');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, ServiceRequestController.getIndex);
router.get('/delete/:requestId', passport.isAuthenticated, ServiceRequestController.getDelete)

module.exports = router;
