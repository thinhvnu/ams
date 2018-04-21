var express = require('express');
var router = express.Router();
var ServiceController = require('../controllers/Service');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, ServiceController.getIndex);
router.get('/create', passport.isAuthenticated, ServiceController.getCreate);
router.post('/create', passport.isAuthenticated, ServiceController.postCreate);
router.get('/edit/:serviceId', passport.isAuthenticated, ServiceController.getEdit);
router.post('/update/:serviceId', passport.isAuthenticated, ServiceController.postUpdate);
router.get('/delete/:serviceId', passport.isAuthenticated, ServiceController.getDelete)

module.exports = router;
