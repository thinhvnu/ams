const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../models/ApartmentBuilding');

exports.getIndex = async function (req, res) {
	let user = req.session.user;
  switch(user.role) {
    case 'BUILDING_GROUP_MANAGER':
      let buildingGroupIds = [];
      let buildingGroups = await ApartmentBuildingGroup.find({manager: user._id});
      for (let i=0; i<buildingGroups.length; i++) {
        buildingGroupIds.push(buildingGroups[i]._id);
      }
      User.find({buildingGroup: {$in: buildingGroupIds}})
      .sort('-createdAt')
      .exec(function (err, users) {
        if (err) {
          console.log('err', err)
          return res.json({
            success: false,
            errorCode: '121',
            message: 'Lỗi không xác định'
          })
				}
				
				let userIds = [];
				for (let j=0; j<users.length; j++) {
					userIds.push(users[j]._id);
				}

        ServiceRequest.find({createdBy: {$in: userIds}}).sort('-code').populate('service').exec(function (err, serviceRequests) {
					if (err) {
						return res.render('service-request/index', {
							title: 'Tất cả yêu cầu dịch vụ',
							current: ['service-request', 'index'],
							data: []
						});
					}
					
					res.render('service-request/index', {
							title: 'Tất cả yêu cầu dịch vụ',
							current: ['service-request', 'index'],
							data: serviceRequests
					});
				});
      });
      break;
    case 'BUILDING_MANAGER':
      let buildingIds = [];
      let buildings = await ApartmentBuilding.find({manager: user._id});
      for (let i=0; i<buildings.length; i++) {
        buildingIds.push(buildings[i]._id);
      }
      User.find({building: {$in: buildingIds}})
      .sort('-createdAt')
      .exec(function (err, users) {
        if (err) {
          console.log('err', err)
          return res.json({
            success: false,
            errorCode: '121',
            message: 'Lỗi không xác định'
          })
        }

        let userIds = [];
				for (let j=0; j<users.length; j++) {
					userIds.push(users[j]._id);
				}

        ServiceRequest.find({createdBy: {$in: userIds}}).sort('-code').populate('service').exec(function (err, serviceRequests) {
					if (err) {
						return res.render('service-request/index', {
							title: 'Tất cả yêu cầu dịch vụ',
							current: ['service-request', 'index'],
							data: []
						});
					}
					
					res.render('service-request/index', {
							title: 'Tất cả yêu cầu dịch vụ',
							current: ['service-request', 'index'],
							data: serviceRequests
					});
				});
      });
      break;
    default:
			ServiceRequest.find({}).sort('-code').populate('service').exec(function (err, serviceRequests) {
				if (err) {
					return res.render('service-request/index', {
						title: 'Tất cả yêu cầu dịch vụ',
						current: ['service-request', 'index'],
						data: []
					});
				}
				
				res.render('service-request/index', {
						title: 'Tất cả yêu cầu dịch vụ',
						current: ['service-request', 'index'],
						data: serviceRequests
				});
			});
      break;
  }
};

exports.getView = (req, res, next) => {
	try {
		ServiceRequest.findById(req.params.requestId)
			.populate({
				path: 'service',
				model: 'Service'
			}).exec((err, sr) => {
				if (!sr) {
					req.flash('errors', 'Yêu cầu dịch vụ đã bị xóa');
				}
				res.render('service-request/view', {
					data: sr || null
				})
			})
	} catch (e) {
		req.flash('errors', 'Không tìm thấy dữ liệu');
		res.redirect('/service-request');
	}
}

exports.getDelete = (req, res, nex) => {
	Service.remove({ _id: req.params.requestId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa dịch vụ không thành công');
	  } else {
		req.flash('success', 'Xóa dịch vụ thành công');
	  }
	  return res.redirect('/service-request');
	})
}