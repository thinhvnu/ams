var express = require('express');
var router = express.Router();
var chatController = require('./../controllers/Chat');

/**
 * Passport
 */
const passport = require('./../../middleware/apiPassport');

/* GET users listing. */
router.get('/clients', passport.isAuthenticated, chatController.getClients);

/* GET message listing. */
/***
 * params: room=${room}
 */
router.get('/messages/:roomId', passport.isAuthenticated, chatController.getMessages);

router.post('/create-group', passport.isAuthenticated, chatController.postCreateGroup);

router.post('/add-member-to-group/:groupId', passport.isAuthenticated, chatController.postAddMemberToGroup);

router.get('/group', passport.isAuthenticated, chatController.getGroup);

module.exports = router;
