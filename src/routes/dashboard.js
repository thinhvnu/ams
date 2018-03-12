const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/Dashboard');

/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, dashboardController.getIndex);

module.exports = router;