var express = require('express');
var router = express.Router();
var CostController = require('../controllers/Cost');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, CostController.getIndex);
router.get('/create', passport.isAuthenticated, CostController.getCreate);
router.post('/create', passport.isAuthenticated, CostController.postCreate);

/* GET import template file */
router.get('/import-template', passport.isAuthenticated, CostController.getImportTemplate);

module.exports = router;
