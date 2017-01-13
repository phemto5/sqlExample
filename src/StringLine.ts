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