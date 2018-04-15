const Slider = require('../models/Slider');
const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');

// Get all images slider
exports.getIndex = function (req, res) {
  Slider.find({})
  .populate({
    path: 'buildingGroup',
    model: 'ApartmentBuildingGroup'
  })
  .populate({
    path: 'building',
    model: 'ApartmentBuilding'
  }).sort({
    updatedAt: -1
  }).exec(function (err, sliders) {
		if (err) {
			console.log('err', err)
			return res.json({
        success: false,
        errorCode: '121',
        message: 'Lỗi không xác định'
      })
		}
		
		res.render('slider/index', {
			title: 'Tất cả ảnh slide',
			current: ['slider', 'index'],
			sliders: sliders
		});
	});
};

exports.getCreate = function (req, res) {
  ApartmentBuildingGroup.find({
    status: 1
  }).exec((err, abgs) => {
    res.render('slider/create', {
      title: 'Thêm ảnh slide mới',
      current: ['slider', 'create'],
      abgs: abgs
    });
  })
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
        title: 'Thêm ảnh slide mới',
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
    newSlider.buildingGroup = req.body.apartmentBuildingGroup || null;
    newSlider.building = req.body.apartmentBuilding || null;
    newSlider.status = req.body.status;
    // save the user
    newSlider.save(function (err) {
      if (err) {
        console.log('Error in Saving: ' + err);
        res.send({ "result": false });
      }
      // Insert child to category
      req.flash('success', 'Thêm ảnh slide thành công');
      res.redirect('/slider');
    });
	});
};

exports.getEdit = (req, res, nex) => {
  Slider.findById(req.params.sliderId)
  .populate('building').exec((err, slider) => {
    ApartmentBuildingGroup.find({
      status: 1
    }).exec((err, abgs) => {
      res.render('slider/edit', {
        title: 'Chỉnh sửa ảnh slide',
        current: ['slider', 'edit'],
        data: slider,
        abgs: abgs,
        abs: slider.building ? [slider.building] : []
      });
    })
  })
}

exports.postUpdate = (req, res, nex) => {
  Slider.findById(req.params.sliderId, (err, slider) => {
    if (err) {
      req.flash('errors', 'Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại')
      return res.redirect('/slider/edit/' + req.params.sliderId);
    }

    if (slider) {
      slider.name = req.body.name;
      slider.image = req.body.image;
      slider.link = req.body.link;
      slider.buildingGroup = req.body.apartmentBuildingGroup || null;
      slider.building = req.body.apartmentBuilding || null;
      slider.status = req.body.status;
      // save the user
      slider.save(function (err) {
        if (err) {
          req.flash('errors', 'Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại')
          return res.redirect('/slider/edit/' + req.params.sliderId);
        }

        req.flash('success', 'Cập nhật thành công ' + slider.name);
        // Insert child to category
        return res.redirect('/slider');
      });
    } else {
      req.flash('errors', 'Không tìm thấy dữ liệu')
      return res.redirect('/slider');
    }
  })
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