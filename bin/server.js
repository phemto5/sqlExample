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
	var LogFile_1 = __webpack_require__(1);
	console.log("Started Server " + new Date());
	var config = __webpack_require__(5);
	console.log("Config Loaded");
	console.log(config);
	var processing = false;
	console.log("Processing : " + processing);
	console.log("Setting up Intervals");
	setInterval(function () {
	    if (!processing) {
	        console.log(processing + " ...\n\tStarting next process");
	        var days = new LogFile_1.LogFile(config.filePath).days;
	        days.forEach(function (day) {
	        });
	    }
	    else {
	        console.log(processing + " ...\n\tDelaying next process for " + config.delaySeconds + " seconds");
	    }
	}, 1000 * config.delaySeconds);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Day_1 = __webpack_require__(2);
	var fs = __webpack_require__(4);
	var LogFile = (function () {
	    function LogFile(sourcePath) {
	        this.logPath = sourcePath;
	        this.days = this.consumeFile(this.logPath);
	    }
	    ;
	    LogFile.prototype.consumeFile = function (filePath) {
	        var days;
	        var fileString = fs.readFileSync(filePath, 'utf-8');
	        var lineArray = fileString.split(/\n\r/g);
	        var window = new TwoDayWindow(new Day_1.Day());
	        lineArray.forEach(function (str) {
	            if (parseInt(str.substr(0, 2), 10) > 10) {
	            }
	        });
	        return days;
	    };
	    return LogFile;
	}());
	exports.LogFile = LogFile;
	var TwoDayWindow = (function () {
	    function TwoDayWindow(day, prev) {
	        this.current = day;
	        if (prev) {
	            this.previous = prev;
	        }
	    }
	    TwoDayWindow.prototype.nextDay = function (day) {
	        this.previous = this.current;
	        this.current = day;
	    };
	    return TwoDayWindow;
	}());
	exports.TwoDayWindow = TwoDayWindow;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Day = (function () {
	    function Day() {
	        this.products = __webpack_require__(3).products;
	    }
	    Day.prototype.getHighMark = function (product) {
	        var highwater = 0;
	        var prodExp = new RegExp(product, 'g');
	        this.lines.forEach(function (line) {
	            if (line.match(prodExp)) {
	                if (line.match(/IN:/gi)) {
	                    highwater++;
	                }
	                if (line.match(/OUT:/gi)) {
	                    highwater--;
	                }
	            }
	        });
	        return highwater;
	    };
	    Day.prototype.getDate = function () {
	        var dateString;
	        this.lines.forEach(function (line) {
	            if (line.match(/TIMESTAMP/gi)) {
	                dateString = line.split(" ").pop();
	            }
	        });
	        return new Date(dateString);
	    };
	    Day.prototype.addLine = function (string) {
	        if (string) {
	            this.lines.push(string);
	        }
	    };
	    return Day;
	}());
	exports.Day = Day;


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
		"products": [
			"swofficepremium",
			"draftsightpremium",
			"solidworks",
			"swepdm_cadeditorandweb",
			"swepdm_processor",
			"swinspection_std",
			"swofficepro"
		]
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"filePath": "\\\\wsepdm\\c$\\Program Files (x86)\\SolidWorks Corp\\SolidNetWork License Manager\\lmgrd.log",
		"delaySeconds": 30
	};

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map