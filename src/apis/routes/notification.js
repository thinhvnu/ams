var express = require('express');
var router = express.Router();
var notificationController = require('./../controllers/Notification');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET users listing. */
router.get('/list', passport.isAuthenticated, notificationController.getList);

router.get('/list-by-role', passport.isAuthenticated, notificationController.getListByRole);

/*GET câp nhật trạng thái đã xem của thông báo*/
router.get("/updateStatus/:noti_id",passport.isAuthenticated,notificationController.updateSeenStatus);


module.exports = router;
