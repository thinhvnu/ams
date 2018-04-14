var express = require('express');
var router = express.Router();
var StaticPageController = require('../controllers/StaticPage');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, StaticPageController.getIndex);
router.get('/create', passport.isAuthenticated, StaticPageController.getCreate);
router.post('/create', passport.isAuthenticated, StaticPageController.postCreate);
router.get('/edit/:pageId', passport.isAuthenticated, StaticPageController.getEdit)
router.post('/update/:pageId', passport.isAuthenticated, StaticPageController.postUpdate)
router.get('/delete/:pageId', passport.isAuthenticated, StaticPageController.getDelete)

module.exports = router;
