var express = require('express');
var router = express.Router();
var postController = require('./../controllers/Post');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/**
 * Get list post categories
 */
router.get('/categories', postController.getCategory);

/* GET users listing. */
router.get('/category/:categoryId', postController.getPostsOfCategory);

/* API create new post */
router.post('/create-new', passport.isAuthenticated, postController.postCreateNew);

/* API get post details */
router.get('/:postId', postController.getDetail);


module.exports = router;
