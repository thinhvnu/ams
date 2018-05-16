var ChatGroup = require('./../models/ChatGroup');
var ApartmentBuildingGroup = require('./../models/ApartmentBuildingGroup');
var ApartmentBuilding = require('./../models/ApartmentBuilding');

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

exports.getAddBlackList = (req, res, next) => {
	let groupId = req.params.groupId;
	let userId = req.query.userId;

	ChatGroup.findById(groupId).exec((err, group) => {
		if (group) {
			if (!group.blackList) {
				group.blackList = [];
			}
			group.blackList.pull(userId);
			group.blackList.push(userId);
			group.save((err) => {
				return res.json({
					success: true,
					errorCode: 0
				})
			})
		} else {
			return res.json({
				success: false,
				errorCode: '111'
			})
		}
	})
}
exports.getRemoveBlackList = (req, res, next) => {
	let groupId = req.params.groupId;
	let userId = req.query.userId;

	ChatGroup.findById(groupId).exec((err, group) => {
		if (group) {
			if (!group.blackList) {
				group.blackList = [];
			}
			group.blackList.pull(userId);
			group.save((err) => {
				return res.json({
					success: true,
					errorCode: 0
				})
			})
		} else {
			return res.json({
				success: false,
				errorCode: '111'
			})
		}
	})
}

exports.getDelete = (req, res, next) => {
	ChatGroup.findById(req.params.groupId).exec((err, group) => {
		if (group) {
			group.remove((err) => {
				req.flash('success', 'Xóa nhóm chat thành công');
				res.redirect('/chat-group');
			})
		} else {
			req.flash('errors', 'Nhóm chat đã bị xóa');
			res.redirect('/chat-group');
		}
	})
}

exports.getEdit = (req, res, next) => {
	ChatGroup.findById(req.params.groupId).exec((err, data) => {
		ApartmentBuildingGroup.find({}).exec((err, abgs) => {
			ApartmentBuilding.find({apartmentBuildingGroup: data.buildingGroup}).exec((err, abs) => {
				res.render('chat-group/edit', {
					title: 'Chỉnh sửa thông tin nhóm chat',
					current: ['chat-group', 'edit'],
					data: data,
					abgs: abgs,
					abs: abs
				});
			});
		});
	});
};

exports.postUpdate = (req, res, next) => {
	/*
	* Validate create category
	*/ 
  	req.checkBody('groupname', 'Tên nhóm không được để trống').notEmpty();
	req.checkBody('building', 'Chọn tòa nhà').notEmpty();
	req.checkBody('buildingGroup', 'Chọn chung cư').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.array();
			req.flash('errors', errors[0].msg);
			return res.redirect('/chat-group/edit/' + req.params.groupId);
		}

		/*
		* End validate
		*/
		ChatGroup.findById(req.params.groupId).exec((err, group) => {
			if (group) {
				group.groupName = req.body.groupName || group.groupName;
				group.building = req.body.building || group.building;
				group.buildingGroup = req.body.buildingGroup || group.buildingGroup;
				// save the user
				group.save(function (err) {
					req.flash('success', 'Cập nhật thành công');
					res.redirect('/chat-group');
				});
			} else {
				req.flash('errors', 'Không tìm thấy nhóm');
				return res.redirect('/chat-group');
			}
		})
	});
};