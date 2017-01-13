import { Day } from './Day';
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