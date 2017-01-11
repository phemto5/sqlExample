export class Day {
    products = require('./products.json').products;
    lines: string[]
    constructor() { }
    getHighMark(product: string): number {
        let highwater: number = 0;
        let prodExp: RegExp = new RegExp(product, 'g');
        this.lines.forEach((line: string) => {
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
    }
    getDate() {
        let dateString: string;
        this.lines.forEach((line: string) => {
            if (line.match(/TIMESTAMP/gi)) {
                dateString = line.split(" ").pop();
            }
        })
        return new Date(dateString);
    }
    addLine(string: string): void {
        if (string) {
            this.lines.push(string);
        }
    }
}