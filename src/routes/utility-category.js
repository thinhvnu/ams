var express = require('express');
var router = express.Router();
var UtilityCategoryController = require('../controllers/UtilityCategory');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, UtilityCategoryController.getIndex);
router.get('/create', passport.isAuthenticated, UtilityCategoryController.getCreate);
router.post('/create', passport.isAuthenticated, UtilityCategoryController.postCreate);
router.get('/edit/:categoryId', passport.isAuthenticated, UtilityCategoryController.getEdit);
router.post('/update/:categoryId', passport.isAuthenticated, UtilityCategoryController.postUpdate);
router.get('/delete/:categoryId', passport.isAuthenticated, UtilityCategoryController.getDelete)

module.exports = router;
