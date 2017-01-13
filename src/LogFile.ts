import { Day } from './Day';
import fs = require('fs');

export class LogFile {
    logPath: string;
    days: Day[];
    constructor(sourcePath: string) {
        this.logPath = sourcePath;
        this.days = this.consumeFile(this.logPath);
    };
    private consumeFile(filePath: string): Day[] {
        let days: Day[];
        let fileString = fs.readFileSync(filePath, 'utf-8');
        let lineArray: StringLine[] = fileString.split(/\n\r/g).map(str => {
            return new StringLine(str);

        });
        let window = new TwoDayWindow(new Day());
        lineArray.forEach((line: StringLine, ind: number, arr: StringLine[]) => {
            let lineWindow = [line, arr[ind - 1]];
            if (LogFile.isNewDay(lineWindow)) {
                window.nextDay(new Day());
            }
            if (LogFile.isPreviousDay(lineWindow)) {
                window.previous.addLine(line.lineString);
            } else {
                window.current.addLine(line.lineString);
            }
        })
        days = window
            .finishWindow()
            .allDays;
        return days;
    }
    private static isNewDay(lineInd: StringLine[]) {
        let result: boolean = false;
        let times = lineInd.map(stringLine => {
            return stringLine.getLineHour();
        })
        let currentTime = times[0],
            previousTime = times[1]
        if (currentTime < (previousTime + .5)) {
            result = true;
        }
        return result;
    }
    private static isPreviousDay(lineInd: StringLine[]) {
        let result: boolean = false;
        let times = lineInd.map(stringLine => {
            return stringLine.getLineHour();
        })
        let currentTime = times[0],
            previousTime = times[1]
        if (currentTime > (previousTime + 12)) {
            result = true;
        }
        return result;
    }

}
export class StringLine {
    private _string: string = '';
    constructor(str: string) {
        this.lineString = str;
    }
    set lineString(str: string) {
        this._string = str;
    }
    get lineString() {
        return this._string;
    }
    getLineHour() {
        let timeStringArray = this._string.substr(0, 8).split(':');
        let timeNumbersArray = timeStringArray.map(segment => { return parseInt(segment, 10) })
        let hours: number = timeNumbersArray[0] + (timeNumbersArray[1] / 60) + (timeNumbersArray[2] / 60 / 60);
        return hours;
    }
}

export class TwoDayWindow {
    allDays: Day[];
    current: Day;
    previous: Day;
    constructor(day: Day, prev?: Day) {
        this.current = day;
        if (prev) {
            this.previous = prev;
        }
    }
    nextDay(day: Day) {
        this.allDays.push(this.previous);
        this.previous = this.current;
        this.current = day;
        return this;
    }
    finishWindow() {
        this.allDays.push(this.previous);
        this.allDays.push(this.current);
        return this;
    }
}
