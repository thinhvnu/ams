var Slider = require('../models/Slider');

// Get all images slider
exports.getIndex = function (req, res) {
	Slider.find().exec(function (err, sliders) {
		if (err) {
			console.log('err', err)
			return done(err);
		}
		
		res.render('slider/index', {
			title: 'Tất cả ảnh slide',
			current: ['slider', 'index'],
			sliders: sliders
		});
	});
};

exports.getCreate = function (req, res) {
	res.render('slider/create', {
    title: 'Create New Image Slider',
    current: ['slider', 'create'],
  });
};

exports.postCreate = function (req, res) {
	/*
	* Validate create category
  */ 
  req.checkBody('name', 'Tên không được để trống').notEmpty();
	req.checkBody('image', 'Ảnh không được để trống').notEmpty();

	var errors = req.getValidationResult().then(function(errors) {
		if (!errors.isEmpty()) {
			var errors = errors.mapped();
			//If there are errors render the form again, passing the previously entered values and errors
			return res.render('slider/create', {
        title: 'Create New Category Slider',
        current: ['slider', 'create'],
        data: req.body,
        errors: errors
      });
		}

    /*
    * End validate
    */
    var newSlider = new Slider();
    
    newSlider.name = req.body.name;
    newSlider.image = req.body.image;
    newSlider.link = req.body.link;
    newSlider.status = req.body.status;
    // save the user
    newSlider.save(function (err) {
      if (err) {
        console.log('Error in Saving: ' + err);
        res.send({ "result": false });
      }
      // Insert child to category
      res.redirect('/slider');
    });
	});
};

exports.getEdit = (req, res, nex) => {

}

exports.postEdit = (req, res, nex) => {
  
}

exports.getDelete = (req, res, nex) => {
  Slider.remove({ _id: req.params.sliderId }, (err) => {
    if (err) {
      req.flash('errors', 'Xóa ảnh không thành công');
    } else {
      req.flash('success', 'Xóa ảnh slide thành công');
    }
    return res.redirect('/slider');
  })
}