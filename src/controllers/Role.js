const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Get all Categories
exports.getIndex = function (req, res) {
	Role.find({}).populate('users').exec(function (err, roles) {
		if (err) {
			console.log('err', err)
			return res.json({
				success: false,
				errorCode: '121',
				message: 'Lỗi không xác định'
			})
		}
		console.log('req.session.user', req.session.user);
		res.render('role/index', {
			title: 'Roles',
			current: ['role', 'index'],
			roles: roles
		});
	});
};

exports.getCreate = function (req, res) {
	// Permission.find({}, (err, permissions) => {
	// 	res.render('role/create', {
	// 		title: 'Create New Role',
	// 		current: ['role', 'create'],
	// 		permissions: permissions
	// 	});
	// });
	res.render('role/create', {
		title: 'Create New Role',
		current: ['role', 'create']
		// permissions: permissions
	});
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
  req.checkBody('roleName', 'Role name không được để trống').notEmpty();
  req.checkBody('roleCode', 'Mã không được để trống').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		console.log('req.body', req.body);
		if (!errors.isEmpty()) {
			var errors = errors.mapped();

			// Permission.find({}, (err, permissions) => {
			// 	res.render('role/create', {
			// 		title: 'Create New Role',
			// 		current: ['role', 'create'],
			// 		errors: errors,
			// 		data: req.body,
			// 		permissions: permissions
			// 	});
			// });
			return res.render('role/create', {
				title: 'Create New Role',
				current: ['role', 'create'],
				errors: errors,
				data: req.body,
				// permissions: permissions
			});;
		}

		/*
		* End validate
		*/
		var newRole = new Role();
	
		newRole.roleName = req.body.roleName;
		newRole.roleCode = req.body.roleCode.toUpperCase();
		newRole.permissions = req.body.permissions;
		newRole.description = req.body.description;
		newRole.type = req.body.type;
		newRole.status = req.body.status;
		// save the user
		newRole.save(function (err) {
			if (err) {
				console.log('Error in Saving: ' + err);
				return res.send({ "result": false });
			}
			return res.redirect('/role');
		});
	});
};