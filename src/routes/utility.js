var express = require('express');
var router = express.Router();
var UtilityController = require('../controllers/Utility');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, UtilityController.getIndex);
router.get('/create', passport.isAuthenticated, UtilityController.getCreate);
router.post('/create', passport.isAuthenticated, UtilityController.postCreate);
router.get('/edit/:utilityId', passport.isAuthenticated, UtilityController.getEdit)
router.post('/update/:utilityId', passport.isAuthenticated, UtilityController.postUpdate)
router.get('/delete/:utilityId', passport.isAuthenticated, UtilityController.getDelete)

module.exports = router;
