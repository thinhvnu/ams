var express = require('express');
var router = express.Router();
var serviceController = require('./../controllers/Service');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* GET categories listing. */
router.get('/categories', serviceController.getCategories);

/* GET services listing. */
router.get('/:categoryId', serviceController.getIndex);

/* API create new request */
router.post('/create-request', passport.isAuthenticated, serviceController.postCreateRequest);

/* API get history details */
router.get('/history-transaction', passport.isAuthenticated, serviceController.getHistoryTransaction);


module.exports = router;
