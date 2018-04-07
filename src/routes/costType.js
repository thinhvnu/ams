var express = require('express');
var router = express.Router();
var CostTypeController = require('../controllers/CostType');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, CostTypeController.getIndex);
router.get('/create', passport.isAuthenticated, CostTypeController.getCreate);
router.post('/create', passport.isAuthenticated, CostTypeController.postCreate);
router.get('/edit/:costTypeId', passport.isAuthenticated, CostTypeController.getEdit);
router.post('/update/:costTypeId', passport.isAuthenticated, CostTypeController.postUpdate);
router.get('/delete/:costTypeId', passport.isAuthenticated, CostTypeController.getDelete);

module.exports = router;
