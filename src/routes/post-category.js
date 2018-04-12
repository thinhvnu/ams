var express = require('express');
var router = express.Router();
var PostCategoryController = require('../controllers/PostCategory');


/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, PostCategoryController.getIndex);
router.get('/create', passport.isAuthenticated, PostCategoryController.getCreate);
router.post('/create', passport.isAuthenticated, PostCategoryController.postCreate);
router.get('/edit/:categoryId', passport.isAuthenticated, PostCategoryController.getEdit);
router.post('/update/:categoryId', passport.isAuthenticated, PostCategoryController.postUpdate);
router.get('/delete/:postCategoryId', passport.isAuthenticated, PostCategoryController.getDelete)

module.exports = router;
