var express = require('express');
var router = express.Router();
var PaymentController = require('../controllers/Payment');

/* get all categories. */
router.get('/billing', PaymentController.getBilling);

router.post('/billing', PaymentController.postBilling);

module.exports = router;
