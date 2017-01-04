/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Promise = __webpack_require__(2);
	var fs = __webpack_require__(3);
	var Entry_1 = __webpack_require__(4);
	var LogData_1 = __webpack_require__(5);
	var sql = __webpack_require__(6);
	var filePath = "\\\\wsepdm\\c$\\Program Files (x86)\\SolidWorks Corp\\SolidNetWork License Manager\\lmgrd.log";
	var startLineNumber = 0;
	var processing = false;
	var dString = null;
	var seconds = 30;
	setInterval(function () {
	    var logData = new LogData_1.LogData(filePath, null, startLineNumber, dString);
	    console.log("Still processing:");
	    if (!processing) {
	        console.log(processing + " ...\n\tStarting next process");
	        startProcessing(logData)
	            .then(function (ld) {
	            dString = ld.getDateString();
	            startLineNumber = ld.getLine();
	            logData = ld;
	        })
	            .catch(catcher);
	    }
	    else {
	        console.log(processing + " ...\n\tDelaying next process for " + seconds + " seconds");
	    }
	}, 1000 * seconds);
	console.log("Started Server " + new Date());
	function startProcessing(logData) {
	    console.log("Start Processing");
	    processing = true;
	    return checkFileExists(logData)
	        .then(processLogFile)
	        .then(processLogLines)
	        .then(function (res) {
	        processing = false;
	        console.log("Processes are cleared " + new Date().toLocaleString());
	        console.log("Last Date " + res.getDateString());
	        return Promise.resolve(res);
	    });
	}
	function processLogFile(logData) {
	    console.log("Processing Log File");
	    return new Promise(function (resolve, reject) {
	        fs.readFile(logData.getPath(), 'utf8', function (err, data) {
	            if (err) {
	                reject(err);
	            }
	            logData.setLogData(data.trim().split('\r\n'));
	            console.log("Found " + logData.getLineCount() + " lines");
	            resolve(logData);
	        });
	    });
	}
	function processLogLines(logData) {
	    console.log("Processing Line " + logData.getLine());
	    var nextStep;
	    if (!logData.isLastLine()) {
	        logData.setLineData();
	        switch (logData.getLineType()) {
	            case 'IN:': {
	                logData.setLineEntry(new Entry_1.LoginLine(logData.getLineParams()));
	                nextStep = addRow(logData, 1);
	                break;
	            }
	            case 'TIMESTAMP': {
	                logData.setLineEntry(new Entry_1.TimestampLine(logData.getLineParams()));
	                console.log("Setting Date to: " + logData.getLineEntry().dateString);
	                logData.setDateString(logData.getLineEntry().dateString);
	                nextStep = nextRow(logData);
	                break;
	            }
	            case 'OUT:': {
	                logData.setLineEntry(new Entry_1.LoginLine(logData.getLineParams()));
	                nextStep = addRow(logData, -1);
	                break;
	            }
	            default: {
	                nextStep = nextRow(logData);
	                break;
	            }
	        }
	    }
	    else {
	        logData.setLine(logData.getLogLength());
	        nextStep = Promise.resolve(logData);
	    }
	    return nextStep;
	}
	function nextRow(logData) {
	    logData.incramentLine();
	    return processLogLines(logData);
	}
	function addRow(logData, maxModifyer) {
	    console.log("Adding Row");
	    var dateString = logData.getDateString();
	    var row = logData.getLineEntry();
	    var rowResponse;
	    var config = {
	        user: 'readwrite',
	        password: 'readwrite',
	        server: 'sqldb1.wagstaff.com\\WAGENG',
	        database: 'WagEngineering'
	    };
	    if (dateString) {
	        console.log("Found Date String");
	        rowResponse = sql.connect(config)
	            .then(function () {
	            var dailyMaxRow = "select top 1 DailyMax from SolidworksLicUse where CAST(DateTime as DATE) = CAST ('" + dateString + "' as DATE) and Entrypoint = '" + row.entryPoint + "' order by LineNumber DESC";
	            console.log("Getting Daily Max");
	            return new sql.Request().query(dailyMaxRow);
	        }).catch(catcher)
	            .then(function (recordset) {
	            var max;
	            if (recordset && recordset.length == 0) {
	                max = setMax(0);
	            }
	            else {
	                max = setMax(parseInt(recordset[0].DailyMax));
	            }
	            row.dailyMax = max;
	            var existingRow = "select * from SolidworksLicUse where DateTime = '" + row.dateTime.toISOString() + "' and EntryPoint = '" + row.entryPoint + "' and LineNumber = " + row.lineNumber;
	            console.log("Getting existing Row");
	            return new sql.Request().query(existingRow);
	        }).catch(catcher)
	            .then(function (recordset) {
	            var response;
	            if (recordset.length == 0) {
	                console.log(row);
	                var insertRow = "insert into SolidworksLicUse values ('" + row.dateTime.toISOString() + "','" + row.product + "','" + row.action + "','" + row.entryPoint + "','" + row.user + "','" + row.stringData + "'," + row.dailyMax + ", " + row.lineNumber + " )";
	                response = new sql.Request().query(insertRow);
	            }
	            else {
	                console.log("Exists already");
	                response = Promise.resolve([]);
	            }
	            return response;
	        }).catch(catcher)
	            .then(function (recordset) {
	            return nextRow(logData);
	        })
	            .catch(catcher);
	    }
	    else {
	        console.log("No Date String");
	        rowResponse = nextRow(logData);
	    }
	    return rowResponse;
	    function setMax(num) {
	        var max = num + maxModifyer;
	        if (max < 0) {
	            max = 0;
	        }
	        return max;
	    }
	}
	function catcher(err) {
	    processing = false;
	    console.error("Error was Caught. processing:" + processing);
	    if (err.code == "ECONNCLOSED") {
	        setTimeout(function () {
	            console.log('Done waiting');
	        }, 3000);
	    }
	    else {
	        console.error(err);
	    }
	}
	exports.catcher = catcher;
	function checkFileExists(logData) {
	    console.log("Check File Exists");
	    return new Promise(function (resolve, reject) {
	        fs.stat(logData.getPath(), function (err, stats) {
	            if (err) {
	                reject(err);
	            }
	            resolve(logData);
	        });
	    });
	}


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	module.exports = require("promise");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Entry = (function () {
	    function Entry(lineParams) {
	        this.stringData = lineParams.linedata.join(' ');
	        this.action = lineParams.linedata[2].slice(0, -1);
	        this.dateTime = this.createDateTime(lineParams.dateString, lineParams.linedata[0]);
	        this.product = lineParams.linedata[1].slice(1, -1);
	        this.lineNumber = lineParams.line;
	    }
	    Entry.prototype.createDateTime = function (dateString, timeString) {
	        var d = new Date(dateString + " " + timeString);
	        d.setHours(d.getHours() - 8);
	        return d;
	    };
	    return Entry;
	}());
	exports.Entry = Entry;
	var TimestampLine = (function (_super) {
	    __extends(TimestampLine, _super);
	    function TimestampLine(lineParams) {
	        _super.call(this, lineParams);
	        this.dateString = lineParams.linedata[3];
	    }
	    return TimestampLine;
	}(Entry));
	exports.TimestampLine = TimestampLine;
	var LoginLine = (function (_super) {
	    __extends(LoginLine, _super);
	    function LoginLine(lineParams) {
	        _super.call(this, lineParams);
	        this.entryPoint = lineParams.linedata[3].slice(1, -1);
	        this.user = lineParams.linedata[4];
	        this.dailyMax = 0;
	    }
	    return LoginLine;
	}(Entry));
	exports.LoginLine = LoginLine;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	var LogData = (function () {
	    function LogData(path, logdata, currentLine, dateString) {
	        this.path = path;
	        this.setLogData(logdata || null);
	        this.setLine(currentLine || 0);
	        if (dateString) {
	            this.dateString = dateString;
	        }
	    }
	    LogData.prototype.incramentLine = function () {
	        this.line += 1;
	    };
	    LogData.prototype.getLine = function () {
	        return this.line;
	    };
	    LogData.prototype.setLine = function (value) {
	        this.line = value;
	    };
	    LogData.prototype.setLineData = function () {
	        this.lineData = this.log[this.line].trim().split(" ");
	    };
	    LogData.prototype.setLogData = function (logData) {
	        this.log = logData;
	    };
	    LogData.prototype.getLineType = function () {
	        return this.lineData[2];
	    };
	    LogData.prototype.setLineEntry = function (entry) {
	        this.lineEntry = entry;
	    };
	    LogData.prototype.getLineEntry = function () {
	        return this.lineEntry;
	    };
	    LogData.prototype.getLineParams = function () {
	        var adjustedLine = this.line + 1;
	        return {
	            linedata: this.lineData,
	            dateString: this.dateString,
	            line: adjustedLine
	        };
	    };
	    LogData.prototype.getPath = function () {
	        return this.path;
	    };
	    LogData.prototype.getLogLength = function () {
	        return this.log.length;
	    };
	    LogData.prototype.setDateString = function (date) {
	        this.dateString = date;
	    };
	    LogData.prototype.getDateString = function () {
	        return this.dateString;
	    };
	    LogData.prototype.isLastLine = function () {
	        return !(this.getLine() < this.getLogLength());
	    };
	    LogData.prototype.getLineCount = function () {
	        return this.log.length;
	    };
	    return LogData;
	}());
	exports.LogData = LogData;


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("mssql");

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map