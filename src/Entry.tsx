
export class Entry {
    stringData: string
    dateTime: Date
    product: string
    action: string
    lineNumber: number
    constructor(lineParams: LineParams) {
        this.stringData = lineParams.linedata.join(' ');
        this.action = lineParams.linedata[2].slice(0, -1);
        this.dateTime = this.createDateTime(lineParams.dateString, lineParams.linedata[0]);
        this.product = lineParams.linedata[1].slice(1, -1);
        this.lineNumber = lineParams.line;
        // console.log(`Created Entry`);
    }
    createDateTime(dateString: string, timeString: string): Date {
        let d = new Date(`${dateString} ${timeString}`);
        d.setHours(d.getHours() - 8);
        return d;
    }
}
export class TimestampLine extends Entry {
    dateString: string;
    constructor(lineParams: LineParams) {
        super(lineParams);
        this.dateString = lineParams.linedata[3];
        // console.log(`Created Timestamp`);
    }
}
export class LoginLine extends Entry {
    entryPoint: string
    user: string
    dailyMax: number;
    constructor(lineParams: LineParams) {
        super(lineParams);
        this.entryPoint = lineParams.linedata[3].slice(1, -1);
        this.user = lineParams.linedata[4];
        this.dailyMax = 0;
        // console.log(`Created LogLine`);
    }
}
export interface LineParams {
    linedata: string[]
    dateString: string
    line: number
}