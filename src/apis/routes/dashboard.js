var express = require('express');
var router = express.Router();
var DashboardController = require('./../controllers/Dashboard');



/* GET users listing. */
router.get('/page/share', DashboardController.getSharePage);


module.exports = router;
