const ipfsAPI = require('ipfs-http-client');
const fs = require('fs');

var ipfsIp = process.env.IPFSIP || '127.0.0.1';
var ipfsPort = process.env.IPFSPORT || '5001';
var ipfsProtocol = process.env.IPFSPROTOCOL || 'http';

var cmds = {

  ipfs_cmds: {

  // uploads file to ipfs, second parameter is the property to update within response
  ipfsUpload: (filePath, prop) => {
  //Connceting to our http api
  const ipfs = ipfsAPI(ipfsIp, ipfsPort, {protocol: ipfsProtocol})
  let fileToUpload = fs.readFileSync(filePath);
  let testBuffer = new Buffer.from(fileToUpload);

  ipfs.add(testBuffer, function (err, file) {

  if (err) {
  console.log(err);
  process.exit();
  }
  // updating relevant encoder response fields
  cmds.setObjPropToValue(cmds.processResponse, prop+".progress", "100.00%");
  cmds.setObjPropToValue(cmds.processResponse, prop+".lastTimeProgress", Date());
  cmds.setObjPropToValue(cmds.processResponse, prop+".step", "success");
  cmds.setObjPropToValue(cmds.processResponse, prop+".hash", file[0].hash);
  cmds.setObjPropToValue(cmds.processResponse, prop+".fileSize", file[0].size);

  });
  }

  },
  // function for setting deep nested object property values
  setObjPropToValue: (obj, path, value) => {
  var i;
  path = path.split(/(?:\.|\[|\])+/);
  for (i = 0; i < path.length - 1; i++)
  obj = obj[path[i]];

  obj[path[i]] = value;
  },

  processResponse:{
  "ipfsAddSource": {
  "progress": "0.00%",
  "encodeSize": "source",
  "lastTimeProgress": null,
  "errorMessage": null,
  "step": "Started",
  "positionInQueue": null,
  "hash": null,
  "fileSize": null
  }
  },
  checkIfFinished: () => {

  var func = setInterval(()=>{
  if (cmds.processResponse.ipfsAddSource.progress == "100.00%"){
  clearInterval(func);
  // wait before ending process
  setTimeout(()=>{
  process.exit();
  },10000);
  }

  },2000);
  }

}

module.exports = cmds
