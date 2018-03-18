/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.postUploadImage = (req, res, next) => {
	const fs = require('fs'),
	path = require('path'),
	fileType = require('file-type');

	let uploadDir = '/media/images/';

	let imageData = req.body.imageData, imageType = req.body.imageType,
	fileName = 'post-' + Date.now(),
	ext = null;

	uploadDir += imageType ? (imageType + '/') : 'store/';

	/**
	 * Case no image data
	 */
	if (!imageData || !imageType) {
		return res.json({
			success: false,
			errorCode: '100',
			message: 'Image type or Image data empty'
		});
	}

	imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

	if (imageData.charAt(0) == '/') {
		ext = 'jpeg';
	} else if (imageData.charAt(0) == 'R') {
		ext = 'gif';
	} else if (imageData.charAt(0) == 'i') {
		ext = 'png';
	}

	if (!ext) {
		return res.json({
			success: false,
			errorCode: '101',
			message: 'Data is not image'
		});
	}

	fileName = fileName + '.' + ext;

	fs.writeFile(path.join(__dirname, '/../../..' + uploadDir + 'origin/' + fileName), new Buffer(imageData, "base64"), (err) => {
		if (err) {
			console.log(err);
			return res.json({
				success: false,
				errorCode: '102',
				message: 'Image data error'
			});
		} else {
			return res.json({
				success: false,
				errorCode: 0,
				data: {
					imageUrl: process.env.MEDIA_URL + uploadDir + 'origin/' + fileName,
					fileName: fileName
				},
				message: 'Save message successfully'
			})
		}
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.postUploadExcelFile = (req, res, next) => {
	var fs = require('fs'),
	path = require('path');
	formidable = require('formidable'),
	XLSX = require('xlsx'),
	form = new formidable.IncomingForm();

    form.on('file', function (name, file) {
		let uploadFilePath = path.join(__dirname, '/../../..' + '/media/files/import/' + Date.now() + '-' + file.name);

		fs.rename(file.path, uploadFilePath, function (err) {
			if (err) {
				return res.json({
					success: false,
					errorCode: 1312,
					message: 'Upload file failed'
				})
			};
			/**
			 * Read xlsx to data
			 */
			let wb = XLSX.readFile(uploadFilePath);
			let sheet_name_list = wb.SheetNames;
			let data = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]]);

			return res.json({
				success: true,
				errorCode: 0,
				filePath: uploadFilePath,
				data: data
			})
		});
	});

	// Parse the incoming form fields.
	form.parse(req);
}