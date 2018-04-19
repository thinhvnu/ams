var express = require('express');
var router = express.Router();
var ChatGroupController = require('../controllers/ChatGroup');

/* get all categories. */
router.get('/', ChatGroupController.getIndex);
// router.get('/create', RoomController.getCreate);
// router.post('/create', RoomController.postCreate);

module.exports = router;
