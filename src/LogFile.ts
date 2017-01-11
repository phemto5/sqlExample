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
        let lineArray: string[] = fileString.split(/\n\r/g);
        let window = new TwoDayWindow(new Day());
        lineArray.forEach((str: string) => {
            if (parseInt(str.substr(0, 2), 10) > 10) {

            }
        })
        return days;
    }
}
export class TwoDayWindow {
    current: Day;
    previous: Day;
    constructor(day: Day, prev?: Day) {
        this.current = day;
        if (prev) {
            this.previous = prev;
        }
    }
    nextDay(day: Day) {
        this.previous = this.current;
        this.current = day;
    }
}