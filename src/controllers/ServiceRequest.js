const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');

exports.getIndex = function (req, res) {
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
				res.render('notification/view', {
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