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
	var config = __webpack_require__(7);
	var processing = false;
	setInterval(function () {
	    if (!processing) {
	        var days = new LogFile_1.LogFile(config.filePath).days;
	        days.forEach(function (day) {
	        });
	    }
	    else {
	    }
	}, 1000 * config.delaySeconds);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Day_1 = __webpack_require__(2);
	var StringLine_1 = __webpack_require__(4);
	var TwoDayWindow_1 = __webpack_require__(5);
	var fs = __webpack_require__(6);
	var LogFile = (function () {
	    function LogFile(sourcePath) {
	        this.logPath = sourcePath;
	        this.days = this.consumeFile(this.logPath);
	    }
	    ;
	    LogFile.prototype.consumeFile = function (filePath) {
	        var days;
	        var fileString = fs.readFileSync(filePath, 'utf-8');
	        var lineArray = fileString.split(/\r\n/g).map(function (str) {
	            return new StringLine_1.StringLine(str);
	        });
	        var window = new TwoDayWindow_1.TwoDayWindow(new Day_1.Day());
	        lineArray.forEach(function (line, ind, arr) {
	            if (ind === 0) {
	                window.current.addLine(line.lineString);
	            }
	            else {
	                var lineWindow = [line, arr[ind - 1]];
	                if (LogFile.isNewDay(lineWindow)) {
	                    window.nextDay(new Day_1.Day());
	                }
	                if (LogFile.isPreviousDay(lineWindow)) {
	                    window.previous.addLine(line.lineString);
	                }
	                else {
	                    window.current.addLine(line.lineString);
	                }
	            }
	        });
	        days = window
	            .finishWindow()
	            .allDays;
	        return days;
	    };
	    LogFile.isNewDay = function (lineInd) {
	        var result = false;
	        var times = lineInd.map(function (stringLine) {
	            return stringLine.getLineHour();
	        });
	        var currentTime = times[0], previousTime = times[1];
	        if (currentTime < previousTime) {
	            if (previousTime - currentTime > .5) {
	                result = true;
	            }
	        }
	        return result;
	    };
	    LogFile.isPreviousDay = function (lineInd) {
	        var result = false;
	        var times = lineInd.map(function (stringLine) {
	            return stringLine.getLineHour();
	        });
	        var currentTime = times[0], previousTime = times[1];
	        if (currentTime > (previousTime + 12)) {
	            result = true;
	        }
	        return result;
	    };
	    return LogFile;
	}());
	exports.LogFile = LogFile;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Day = (function () {
	    function Day() {
	        this.products = __webpack_require__(3).products;
	        this.lines = [];
	    }
	    Day.prototype.getHighMark = function (product) {
	        var highwater = 0;
	        var current = 0;
	        var prodExp = new RegExp(product, 'g');
	        this.lines.forEach(function (line) {
	            if (line.match(prodExp)) {
	                if (line.match(/IN:/gi)) {
	                    current++;
	                }
	                if (line.match(/OUT:/gi)) {
	                    current--;
	                }
	            }
	            if (current > highwater) {
	                highwater = current;
	            }
	            if (current < 0) {
	                current = 0;
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

	"use strict";
	var StringLine = (function () {
	    function StringLine(str) {
	        this._string = '';
	        this.lineString = str;
	    }
	    Object.defineProperty(StringLine.prototype, "lineString", {
	        get: function () {
	            return this._string;
	        },
	        set: function (str) {
	            this._string = str;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    StringLine.prototype.getLineHour = function () {
	        var timeStringArray = this._string.substr(0, 8).split(':');
	        var timeNumbersArray = timeStringArray.map(function (segment) { return parseInt(segment, 10); });
	        var hours = timeNumbersArray[0] + (timeNumbersArray[1] / 60) + (timeNumbersArray[2] / 60 / 60);
	        return hours;
	    };
	    return StringLine;
	}());
	exports.StringLine = StringLine;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	var TwoDayWindow = (function () {
	    function TwoDayWindow(day, prev) {
	        this.allDays = [];
	        this.current = day;
	        if (prev) {
	            this.previous = prev;
	        }
	    }
	    TwoDayWindow.prototype.nextDay = function (day) {
	        if (this.previous) {
	            this.allDays.push(this.previous);
	        }
	        this.previous = this.current;
	        this.current = day;
	        return this;
	    };
	    TwoDayWindow.prototype.finishWindow = function () {
	        if (this.previous) {
	            this.allDays.push(this.previous);
	        }
	        this.allDays.push(this.current);
	        return this;
	    };
	    return TwoDayWindow;
	}());
	exports.TwoDayWindow = TwoDayWindow;


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"filePath": "\\\\wsepdm\\c$\\Program Files (x86)\\SolidWorks Corp\\SolidNetWork License Manager\\lmgrd.log",
		"delaySeconds": 1
	};

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map