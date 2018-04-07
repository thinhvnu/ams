// Upload image
exports.postFroalaUploadImage = (req, res, next) => {
	var FroalaEditor = require('wysiwyg-editor-node-sdk/lib/froalaEditor.js');
	// Store image.
  FroalaEditor.Image.upload(req, '../media/images/store/', function(err, data) {
    // Return data.
    if (err) {
      return res.send(JSON.stringify(err));
	}
	try {
		data.link = data.link.replace('../media', process.env.MEDIA_URL);
	} catch (e) {
		
	}
    res.send(data);
  });
}

// Get all images from folder
exports.getFroalaLoadImages = (req, res, next) => {
	const imageFolder = './media/images/store/';
	const fs = require('fs');

	let data = [];
	
	fs.readdir(imageFolder, (err, files) => {
		files.forEach(file => {
			data.push({
				url: process.env.MEDIA_URL + '/images/store/' + file,
				thumb: process.env.MEDIA_URL + '/images/store/' + file,
				tag: file
			})
		});
		res.send(data);
	})
}

exports.getUploadImage = (req, res, next) => {
	res.render('media/upload-image', {
		title: 'Media upload image',
		current: ['media', 'upload-image'],
	});
}

exports.postUploadImage = (req, res, next) => {
	var fs = require('fs'),
	path = require('path');
	formidable = require('formidable'),
	readChunk = require('read-chunk'),
	fileType = require('file-type'),
	sharp = require('sharp'),
	form = new formidable.IncomingForm(),
	uploadDir = '/media/',
	prefixFileName = 'image',
	thumbWidth = 100,
	thumbHeight = 100;

	form.multiples = true;

	form.on('field', function(name, value) {
		switch (name) {
			case 'uploadDir':
				uploadDir = value;
				break;
			case 'prefixFileName':
				prefixFileName = value;
			case 'thumbWidth':
				thumbWidth = Math.round(value);
				break;
			case 'thumbHeight':
				thumbHeight = Math.round(value);
				break;
			default:
				break;
		}
	});

	// Invoked when a file has finished uploading.
	form.on('file', function (name, file) {
		var buffer = null,
				type = null,
				filename = '', originPath, thumbPath;

		// Read a chunk of the file.
		buffer = readChunk.sync(file.path, 0, 262);
		// Get the file type using the buffer read using read-chunk
		type = fileType(buffer);

		// Check the file type, must be either png,jpg or jpeg
		if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
				// Assign new file name
				filename = prefixFileName + '-' + Date.now() + '.' + type.ext;//+ '.jpg';// + type.ext;
				originPath = path.join(__dirname, '/../..' + '/media' + uploadDir + 'origin/');
                thumbPath = path.join(__dirname, '/../..' + '/media' + uploadDir + 'thumb/');
				
				// Upload origin image
				sharp(file.path).toFile(originPath + filename, (err, info) => {});
				// Upload thumb image
				sharp(file.path).resize(thumbWidth, thumbHeight).ignoreAspectRatio().toFile(thumbPath + filename, (err, info) => {
					// Response 
					res.status(200).end(JSON.stringify({
						path: process.env.MEDIA_URL + uploadDir + 'thumb/' + filename,
						fileName: filename
					}));
				});
		}
	});

	// once all the files have been uploaded, send a response to the client
  // form.on('end', function(e) {
  //   res.end('success', e);
  // });

	// Parse the incoming form fields.
	form.parse(req);
}