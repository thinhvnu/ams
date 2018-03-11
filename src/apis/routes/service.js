var express = require('express');
var router = express.Router();
var serviceController = require('./../controllers/Service');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET users listing. */
router.get('/', serviceController.getIndex);

/* API create new post */
// router.post('/create-new', passport.isAuthenticated, postController.postCreateNew);

/* API get post details */
// router.get('/:postId', postController.getDetail);


module.exports = router;
