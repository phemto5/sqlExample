import { Day } from './Day';
export class TwoDayWindow {
    allDays: Day[];
    current: Day;
    previous: Day;
    constructor(day: Day, prev?: Day) {
        this.allDays = [];
        this.current = day;
        if (prev) {
            this.previous = prev;
        }
    }
    nextDay(day: Day) {
        if (this.previous) {
            this.allDays.push(this.previous);
        }
        this.previous = this.current;
        this.current = day;
        return this;
    }
    finishWindow() {
        if (this.previous) {
            this.allDays.push(this.previous);
        }
        this.allDays.push(this.current);
        return this;
    }
}