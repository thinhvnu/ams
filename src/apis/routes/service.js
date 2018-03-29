var express = require('express');
var router = express.Router();
var serviceController = require('./../controllers/Service');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET users listing. */
router.get('/', serviceController.getIndex);

/* API create new request */
router.post('/create-request', passport.isAuthenticated, serviceController.postCreateRequest);

/* API get history details */
router.get('/history-transaction', passport.isAuthenticated, serviceController.getHistoryTransaction);

/*API update request history*/
router.post('/history-update',passport.isAuthenticated,serviceController.updateInvoiceService);
module.exports = router;
