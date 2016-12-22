import fs = require('fs');
import Promise = require('promise');
import { Entry } from './Entry';

export class LogData {
    private log: string[];
    private line: number;
    private lineData: string[];
    private dateString: string;
    private path: string;
    private lineEntry: Entry;
    constructor(path: string, logdata?: string[], currentLine?: number, dateString?: string) {
        this.path = path;
        this.setLogData(logdata || null);
        this.setLine(currentLine || 0);
        if (dateString) {
            this.dateString = dateString;
        }
    }
    incramentLine() {
        this.line += 1;
    }
    getLine() {
        return this.line;
    }
    setLine(value: number) {
        this.line = value;
    }
    // updateDateString(date: string) {
    //     // console.log('Date updated');
    //     this.dateString = date;
    // }
    setLineData() {
        this.lineData = this.log[this.line].trim().split(` `);
    }
    setLogData(logData: string[]) {
        // console.log('Data updated');
        this.log = logData;
    }
    getLineType() {
        return this.lineData[2];
    }
    setLineEntry(entry: Entry) {
        // console.log(`Line Added`)
        this.lineEntry = entry;
    }
    getLineEntry(): Entry {
        return this.lineEntry;
    }
    getLineParams() {
        let adjustedLine = this.line + 1;
        return {
            linedata: this.lineData,
            dateString: this.dateString,
            line: adjustedLine
        }
    }
    getPath() {
        return this.path;
    }
    getLogLength() {
        return this.log.length;
    }
    setDateString(date: string) {
        this.dateString = date;
    }
    getDateString() {
        return this.dateString;
    }
    isLastLine() {
        return !(this.getLine() < this.getLogLength());
    }
    getLineCount() {
        return this.log.length;
    }
    // getFinalState() {
    //     return new FinalState(this.dateString, this.line);
    // }
}

// export class FinalState {
//     lastLine: number
//     dateString: string
//     constructor(ds: string, line: number) {
//         this.lastLine = line;
//         this.dateString = ds;
//     }
// }
