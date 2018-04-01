const Service = require('./../../models/Service');
const ServiceRequest = require('./../../models/ServiceRequest');
const ServiceCategory = require('./../../models/ServiceCategory');

exports.getCategories = (req, res, next) => {
	ServiceCategory.find({
		status: 1
	}).exec((err, data) => {
		if (err) {
			return res.json({
				success: false,
				errorCode: '112',
				message: 'Có lỗi xảy ra'
			})
		}

		return res.json({
			success: true,
			errorCode: 0,
			data: data,
			message: 'Get data successfully'
		})
	})
}

// Get all services
exports.getIndex = function (req, res) {
	try {
		Service.find({
			status: 1,
			category: req.params.categoryId
		})
		.populate({
			path: 'category',
			model: 'ServiceCategory'
		})
		.exec(function (err, services) {
			if (err) {
				return res.json({
					success: false,
					errorCode: '112',
					message: "Error happen"
				})
			}
			return res.json({
				success: true,
				errorCode: 0,
				data: services,
				message: 'Get list services successfully'
			});
		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			data: [],
			message: 'Exception'
		})
	}
};

exports.postCreateRequest = (req, res, next) => {
	req.checkBody('fullName', 'Vui lòng nhập họ tên đầy đủ').notEmpty();
	req.checkBody('phoneNumber', 'Vui lòng nhập số điện thoại').notEmpty();
	req.checkBody('serviceId', 'Mã dịch vụ không được để trống').notEmpty();

	var errors = req.getValidationResult().then(function (errors) {
		if (!errors.isEmpty()) {
			return res.json({
				success: false,
				errorCode: '011',
				message: errors,
			});
		} else {
			Service.findById(req.body.serviceId, (err, service) => {
				if (!service) {
					return res.json({
						success: false,
						errorCode: '0111',
						message: 'Dịch vụ không tồn tại'
					});
				}
				let data = req.body;
				let newServiceRequest = new ServiceRequest();

				newServiceRequest.fullName = data.fullName;
				newServiceRequest.phoneNumber = data.phoneNumber;
				newServiceRequest.address = data.address;
				newServiceRequest.images = data.images;
				newServiceRequest.description = data.description;
				newServiceRequest.orderAt = data.orderAt;
				newServiceRequest.status = 1;
				newServiceRequest.done = false;
				newServiceRequest.invoice_imgs = "";
				newServiceRequest.service = service._id;
				newServiceRequest.createdBy = req.session.user._id;
				newServiceRequest.save(function (err, newServiceRequest) {
					if (err) {
						return res.json({
							success: false,
							errorCode: '010',
							message: errors,
							data: req.body
						})
					} else {
						return res.json({
							success: true,
							errorCode: 0,
							message: 'Gửi yêu cầu thành công'
						});
					}
				})
			})
		}
	});
}
exports.updateInvoiceService = (req, res, next) => {
	try {
		req.checkBody('id', 'id không được để trống').notEmpty();
		req.checkBody('invoice_imgs', 'Ảnh hóa đơn không được để  trống').notEmpty();
		let id = req.body.id,
		invoice_imgs = req.body.invoice_imgs;

		ServiceRequest.findById(id).exec(function (err, srs) {
			if (err) {
				return res.json({
					success: false,
					errorCode: '011',
					message: err,
				});
			}
		console.log("srs",srs);
		if(srs){
			srs.done = true;
			srs.invoice_imgs = req.body.invoice_imgs;
			srs.save(function (err, updateServiceRequest) {
				if (err) {
					return res.json({
						success: false,
						errorCode: '010',
						message: errors,
						data: req.body
					})
				} else {
					return res.json({
						success: true,
						errorCode: 0,
						message: 'Cập nhật thanh toán thành công'
					});
				}
			})
		}else{
			return res.json({
				success: false,
				errorCode: '002',
				message: 'Không tìm thấy id services request'
			})
		}

		});
	} catch (e) {
		return res.json({
			success: false,
			errorCode: '111',
			message: 'Server exception'
		})
	}

}
exports.getHistoryTransaction = (req, res, next) => {
	ServiceRequest.find({ createdBy: req.session.user._id })
		.populate({
			path: 'service',
			model: 'Service',
			select: { '_id': 0, 'serviceName': 1, 'image': 1, 'imageUrl': 1 }
		})
		.sort('-createdAt')
		.exec(function (err, srs) {
			if (err) {
				console.log('err', err)
				return done(err);
			}
			res.send({
				success: true,
				errorCode: 0,
				data: srs,
				message: 'Get list history transaction successfully'
			});
		});
}