var myProductName = "staticfilesinsql", myVersion = "0.4.0";

const fs = require ("fs");
const utils = require ("daveutils"); 
const request = require ("request");
const davesql = require ("davesql"); 

var config = {
	};

function readConfig (f, config, callback) {
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					config [x] = jstruct [x];
					}
				}
			catch (err) {
				console.log ("Error reading " + f);
				}
			}
		callback ();
		});
	}

function getFile (screenname, filename, callback) {
	const sqltext = "select * from staticfiles where screenname = " + davesql.encode (screenname) + " and filename = " + davesql.encode (filename);
	davesql.runSqltext (sqltext, function (err, result) {
		if (err) {
			callback (err);
			}
		else {
			if (result.length == 0) {
				const message = "Can't find the file " + filename + " for the user " + screenname + ".";
				callback ({message});
				}
			else {
				const theFile = {
					screenname: result [0].screenname,
					filename: result [0].filename,
					filecontents: result [0].filecontents.toString (),
					whenCreated: result [0].whenCreated,
					whenUpdated: result [0].whenUpdated,
					ctSaves: result [0].ctSaves
					}
				callback (undefined, theFile);
				}
			}
		});
	}
function saveFile (screenname, filename, filecontents, callback) {
	const now = new Date ();
	const fileRec = {
		screenname, 
		filename, 
		filecontents,
		whenCreated: now,
		whenUpdated: now,
		ctSaves: 1
		};
	getFile (screenname, filename, function (err, theOriginalFile) {
		if (!err) {
			fileRec.whenCreated = theOriginalFile.whenCreated;
			fileRec.ctSaves = theOriginalFile.ctSaves + 1;
			}
		const sqltext = "replace into staticfiles " + davesql.encodeValues (fileRec);
		davesql.runSqltext (sqltext, function (err, result) {
			if (err) {
				callback (err);
				}
			else {
				callback (undefined, true);
				}
			});
		});
	
	
	
	}

var theTestData = {
	theArray: new Array ()
	}
for (var i = 1; i <= 15; i++) {
	theTestData.theArray.push (utils.getRandomSnarkySlogan ());
	}
readConfig ("config.json", config, function ()  {
	console.log ("config == " + utils.jsonStringify (config));
	davesql.start (config.database, function () {
		const screenname = "davewiner", filename = "test.json";
		saveFile (screenname, filename, utils.jsonStringify (theTestData), function (err, result) {
			if (err) {
				console.log (err.message);
				}
			else {
				getFile (screenname, filename, function (err, theFile) {
					console.log (theFile.filecontents);
					});
				}
			});
		});
	});

