var myProductName = "staticfilesinsql", myVersion = "0.4.1";

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

function getFile (screenname, relpath, flprivate, callback) {
	const sqltext = "select * from staticfiles where screenname = " + davesql.encode (screenname) + " and relpath = " + davesql.encode (relpath) + " and flprivate = " + davesql.encode (flprivate);
	davesql.runSqltext (sqltext, function (err, result) {
		if (err) {
			callback (err);
			}
		else {
			if (result.length == 0) {
				const message = "Can't find the file " + relpath + " for the user " + screenname + ".";
				callback ({message});
				}
			else {
				callback (undefined, result [0]);
				}
			}
		});
	}
function publishFile (screenname, relpath, type, flprivate, filecontents, callback) {
	const now = new Date ();
	const fileRec = {
		screenname, 
		relpath, 
		type,
		flprivate,
		filecontents,
		whenCreated: now,
		whenUpdated: now,
		ctSaves: 1
		};
	getFile (screenname, relpath, flprivate, function (err, theOriginalFile) {
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
				callback (undefined, fileRec);
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
		const screenname = "davewiner", relpath = "test.json", flprivate = true;
		publishFile (screenname, relpath, "application/json", flprivate, utils.jsonStringify (theTestData), function (err, result) {
			if (err) {
				console.log (err.message);
				}
			else {
				getFile (screenname, relpath, flprivate, function (err, theFile) {
					console.log (theFile.filecontents);
					});
				}
			});
		});
	});

