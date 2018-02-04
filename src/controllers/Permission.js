var Permission = require('../models/Permission');

// Get all permissons
exports.getIndex = function (req, res) {
	Permission.find().exec(function (err, permissions) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('permission/index', {
			title: 'Quyền truy cập',
			current: ['permission', 'index'],
			data: permissions
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('permission/create', {
    title: 'Thêm quyền truy cập',
    current: ['permission', 'create'],
  });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
	*/ 
  req.checkBody('permissionName', 'Permission name is required').notEmpty();
  req.checkBody('accessRouter', 'Access router is required').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			//If there are errors render the form again, passing the previously entered values and errors
			res.render('permission/create', {
        title: 'Create New Permission',
        current: ['permission', 'create'],
        data: req.body,
        errors: errors
      });
		}

    /*
    * End validate
    */
    var newPermission = new Permission();
    
    newPermission.permissionName = req.body.permissionName;
    newPermission.accessRouter = req.body.accessRouter;
    newPermission.description = req.body.description;
    newPermission.status = req.body.status;
    // save the user
    newPermission.save(function (err) {
      if (err) {
        console.log('Error in Saving: ' + err);
        res.send({ "result": false });
      }
      // Insert child to category
      res.redirect('/permission');
    });
	});
};