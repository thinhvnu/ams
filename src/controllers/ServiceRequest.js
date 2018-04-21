const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');

exports.getIndex = function (req, res) {
	ServiceRequest.find({}).sort('-createdAt').populate('service').exec(function (err, serviceRequests) {
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
};

exports.getDelete = (req, res, nex) => {
	Service.remove({ _id: req.params.serviceId }, (err) => {
	  if (err) {
		req.flash('errors', 'Xóa dịch vụ không thành công');
	  } else {
		req.flash('success', 'Xóa dịch vụ thành công');
	  }
	  return res.redirect('/service-request');
	})
  }