import fs = require('fs');
import { Day } from './Day';
import * as db from './Database';
import { LogFile } from './LogFile';

console.log(`Started Server ${new Date()}`);
let config = require('./config.json');
console.log(`Config Loaded`);
console.log(config);
let processing: boolean = false
console.log(`Processing : ${processing}`);
console.log(`Setting up Intervals`);
setInterval(() => {
    if (!processing) {
        console.log(`${processing} ...\n\tStarting next process`);
        var days = new LogFile(config.filePath).days;
        days.forEach(day => {
            // db.UpsertDay(day);//not readty to send to databse yet
        })
    } else {
        console.log(`${processing} ...\n\tDelaying next process for ${config.delaySeconds} seconds`);
    }
}, 1000 * config.delaySeconds);
