var express = require('express');
var router = express.Router();
var serviceController = require('./../controllers/Service');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* GET categories listing. */
router.get('/categories', serviceController.getCategories);

/* API create new request */
router.post('/create-request', passport.isAuthenticated, serviceController.postCreateRequest);

/* API get history details */
router.get('/history-transaction', passport.isAuthenticated, serviceController.getHistoryTransaction);

/*API update request history*/
router.post('/history-update',passport.isAuthenticated,serviceController.updateInvoiceService);

/* Update category order */
router.post('/update-category-order', serviceController.postUpdateCategoryOrder);

/* Update category order */
router.post('/update-service-order', serviceController.postUpdateServiceOrder);

/* GET services listing. */
router.get('/:categoryId', serviceController.getIndex);

module.exports = router;
