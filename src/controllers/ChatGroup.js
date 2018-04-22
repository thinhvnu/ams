var ChatGroup = require('./../models/ChatGroup');

// Get all Categories
exports.getIndex = function (req, res) {
    ChatGroup.find({})
    .populate('building')
    .populate('buildingGroup').populate('members').exec(function (err, chatGroups) {
		if (err) {
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
		}
		
		res.render('chat-group/index', {
			title: 'Chat group',
			current: ['chat-group', 'index'],
			data: chatGroups
		});
	});
};

// exports.getCreate = function (req, res) {
// 	res.render('room/create', {
//     title: 'Create New Room',
//     current: ['room', 'create'],
//   });
// };

// exports.postCreate = function (req, res) {
// 	/*
// 	* Validate create category
// 	*/ 
//   req.checkBody('roomName', 'Tên phòng không được để trống').notEmpty();

// 	var errors = req.getValidationResult().then(function(errors) {
// 		if (!errors.isEmpty()) {
// 			var errors = errors.mapped();
// 			res.render('room/create', {
//         title: 'Create New Room',
//         current: ['room', 'create'],
// 				errors: errors,
// 				data: req.body
// 			});
// 			return;
// 		}

// 	/*
// 	* End validate
// 	*/
// 	var newRoom = new Room();
	
//     newRoom.roomName = req.body.roomName;
//     newRoom.description = req.body.description;
//     newRoom.status = req.body.status;
//     // save the user
//     newRoom.save(function (err) {
//         if (err) {
//             console.log('Error in Saving: ' + err);
//             res.send({ "result": false });
//         }
//         res.redirect('/room');
//     });
// 	});
// };