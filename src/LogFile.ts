import { Day } from './Day';
import { StringLine } from './StringLine';
import { TwoDayWindow } from './TwoDayWindow';
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
        let lineArray: StringLine[] = fileString.split(/\r\n/g).map(str => {
            return new StringLine(str);
        });
        let window = new TwoDayWindow(new Day());
        lineArray.forEach((line: StringLine, ind: number, arr: StringLine[]) => {
            if (ind === 0) {
                window.current.addLine(line.lineString);
            } else {
                let lineWindow = [line, arr[ind - 1]];
                if (LogFile.isNewDay(lineWindow)) {
                    window.nextDay(new Day());
                }
                if (LogFile.isPreviousDay(lineWindow)) {
                    window.previous.addLine(line.lineString);
                } else {
                    window.current.addLine(line.lineString);
                }
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
            // return 5;
        })
        let currentTime = times[0],
            previousTime = times[1]
        if (currentTime < previousTime) {
            if (previousTime - currentTime > .5) {
                result = true;
            }
        }
        return result;
    }
    private static isPreviousDay(lineInd: StringLine[]) {
        let result: boolean = false;
        let times = lineInd.map(stringLine => {
            return stringLine.getLineHour();
            // return 6;
        })
        let currentTime = times[0],
            previousTime = times[1]
        if (currentTime > (previousTime + 12)) {
            result = true;
        }
        return result;
    }

}


