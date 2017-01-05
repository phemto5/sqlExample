import mssql = require('mssql');
import fs = require('fs');

let sql: any = require('mssql');
let filePath: string = `\\\\wsepdm\\c$\\Program Files (x86)\\SolidWorks Corp\\SolidNetWork License Manager\\lmgrd.log`;
let startLineNumber: number = 0;
let processing: boolean = false
let dString: string = null;
let seconds: number = 30;
setInterval(() => {
    console.log(`Still processing:`);
    // console.log(`Processes Running ${processes.length}`)
    if (!processing) {
        // console.info('Filling Data from licence file');
        console.log(`${processing} ...\n\tStarting next process`);
    } else {
        console.log(`${processing} ...\n\tDelaying next process for ${seconds} seconds`);
    }
}, 1000 * seconds);
console.log(`Started Server ${new Date()}`);


