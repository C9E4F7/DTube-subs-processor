const http = require('http');
const uuidv4 = require('uuid/v4');
const formidable = require('formidable');
const webvtt = require('node-webvtt');
var fs = require("fs");
var cmds = require('./subs-processor-cmds.js');

corsVar = process.env.CORSVAR || 'https://dtube.nannal.com';

// variable to assure only one upload request happens
var reqhappened = false;

// generated token
const genToken = uuidv4();


http.createServer(function (req, res) {

	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, Authorization, Accept');
	res.setHeader('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range');
	res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
	res.setHeader('access-control-allow-origin', corsVar);
	res.setHeader('Access-Control-Max-Age', '1728000');
	res.setHeader('Connection', 'keep-alive');

	// sending progress to user
	if (req.url.match(/\/getProgressByToken.*/)) {
		res.end(JSON.stringify(cmds.processResponse));
	};

	if (req.url == '/uploadSubtitle' && !reqhappened) {

		if (req.method === 'OPTIONS'){
			res.statusCode = 204;
			res.end();

		} else {

			res.statusCode = 200;

			reqhappened = true;
			var form = new formidable.IncomingForm();

			//Sane Form options
			form.maxFields = 1
			form.encoding = 'utf-8';
			form.maxFileSize = '1024000';

			form.parse(req, function (err, fields, files) {
			});

			// file is moved to upload folder and renamed to uuid
			form.on('fileBegin', function (name, file){
				file.path = "./upload/" + genToken;
			});

			form.on('file', function (name, file) {

				//frontend needs to know if upload was successful and receive the token
				var successResponse = { success: "", token: ""};
				var fileText = fs.readFileSync(file.path).toString('utf-8');

				try {
					const parsedFile = webvtt.parse(fileText);

					if (parsedFile.valid == true) {

						// if file is valid, success is true and provide token
						successResponse.success = "true";
						successResponse.token = genToken;
						res.end(JSON.stringify(successResponse));

						// upload file to ipfs
						cmds.ipfs_cmds.ipfsUpload(file.path, "ipfsAddSource");
						cmds.checkIfFinished();

					} else {

						// if not valid, success is false, no token, end process
						successResponse.success = "false";
						res.end(JSON.stringify(successResponse));
						process.exit();
					}


				}
				catch(err) {
					// if error, success is false, no token, end process
					console.log(err);
					successResponse.success = "false";
					res.end(JSON.stringify(successResponse));
					process.exit();
				}

			});

			form.on('error', function(err) {
				console.error('Error', err);
				process.exit();
			});

		}

	} else {
		res.end("There's nothing here for you");
	}

}).listen(5000, ()=> {

	console.log("listening on port 5000");

});
