import mssql = require('mssql');
import Promise = require('promise');
import fs = require('fs');
import { Entry, LoginLine, TimestampLine, LineParams } from './Entry';
import { LogData } from './LogData';

let sql: any = require('mssql');
let filePath: string = `\\\\wsepdm\\c$\\Program Files (x86)\\SolidWorks Corp\\SolidNetWork License Manager\\lmgrd.log`;
let startLineNumber: number = 0;
// export let processes: Promise.IThenable<any>[] = [];
let processing: boolean = false
// let logData: LogData = new LogData(filePath, null, startLineNumber)
// let pTimer: NodeJS.Timer;
// let logData: LogData = new LogData(filePath, null, startLineNumber);
// let seconds: number = 30;

export function init(): void {
    let dString: string = null;
    let seconds: number = 30;
    // let seconds: number = 30;
    // console.log(`Initial run ...`);
    // startProcessing(logData)
    setInterval(() => {
        let logData: LogData = new LogData(filePath, null, startLineNumber, dString);
        console.log(`Still processing:`);
        // console.log(`Processes Running ${processes.length}`)
        if (!processing) {
            // console.info('Filling Data from licence file');
            console.log(`${processing} ...\n\tStarting next process`);
            startProcessing(logData)
                .then((ld: LogData) => {
                    dString = ld.getDateString();
                    startLineNumber = ld.getLine();
                    // console.log(ld);
                    logData = ld;
                })
                .catch(catcher);
        } else {
            console.log(`${processing} ...\n\tDelaying next process for ${seconds} seconds`);
        }
    }, 1000 * seconds);
}

function startProcessing(logData: LogData): Promise.IThenable<LogData> {
    console.log(`Start Processing`)
    processing = true;
    return checkFileExists(logData)
        .then(processLogFile)
        .then(processLogLine)
        .then((res: LogData) => {
            processing = false;
            console.log(`Processes are cleared ${new Date().toLocaleString()}`);
            console.log(`Last Date ${res.getDateString()}`);
            return Promise.resolve(res);
        })
}

function processLogFile(logData: LogData): Promise.IThenable<LogData> {
    console.log(`Processing Log File`);
    return new Promise<LogData>((resolve, reject) => {
        fs.readFile(logData.getPath(), 'utf8', (err: NodeJS.ErrnoException, data: string): void => {
            if (err) {
                reject(err)
            }
            // console.log(`Loading new File Data`)
            logData.setLogData(data.trim().split('\r\n'));
            console.log(`Found ${logData.getLineCount()} lines`)
            resolve(logData);
        });
    })
}
function nextRow(logData: LogData): Promise.IThenable<LogData> {
    logData.incramentLine();
    return processLogLine(logData);
}
// function repeatRow(): Promise.IThenable<LogData> {
//     return processLogLine(logData);
// }

function addRow(logData: LogData, maxModifyer: number): Promise.IThenable<LogData> {
    console.log(`Adding Row`);
    let dateString: string = logData.getDateString();
    let row: LoginLine = logData.getLineEntry() as LoginLine;
    let rowResponse: Promise.IThenable<any>
    let config: mssql.config = {
        user: 'readwrite',
        password: 'readwrite',
        server: 'sqldb1.wagstaff.com\\WAGENG',
        database: 'WagEngineering'
    }
    if (dateString) {
        console.log(`Found Date String`)
        rowResponse = sql.connect(config)
            .then(() => {
                let dailyMaxRow: string =
                    `select top 1 DailyMax from SolidworksLicUse where CAST(DateTime as DATE) = CAST ('${dateString}' as DATE) and Entrypoint = '${row.entryPoint}' order by LineNumber DESC`
                console.log(`Getting Daily Max`);
                return new sql.Request().query(dailyMaxRow);
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                let max: number;
                if (recordset && recordset.length == 0) {
                    // console.log(`DailyMax : 0 `)
                    max = setMax(0);
                } else {
                    // console.log(`DailyMax : ${recordset[0].DailyMax} `)
                    max = setMax(parseInt(recordset[0].DailyMax));
                }
                row.dailyMax = max;
                // console.log(`${row.dailyMax} for ${dateString} with ${row.action} at line ${row.lineNumber}`);
                let existingRow: string =
                    `select * from SolidworksLicUse where DateTime = '${row.dateTime.toISOString()}' and EntryPoint = '${row.entryPoint}' and LineNumber = ${row.lineNumber}`;
                console.log(`Getting existing Row`);
                return new sql.Request().query(existingRow)
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                let response: Promise.IThenable<any>
                if (recordset.length == 0) {
                    // console.log(`Row Insert`);
                    console.log(row);
                    let insertRow: string =
                        `insert into SolidworksLicUse values ('${row.dateTime.toISOString()}','${row.product}','${row.action}','${row.entryPoint}','${row.user}','${row.stringData}',${row.dailyMax}, ${row.lineNumber} )`;
                    // console.log(`Inserting New Row`);
                    response = new sql.Request().query(insertRow);
                } else {
                    console.log(`Exists already`);
                    response = Promise.resolve([] as mssql.recordSet);
                }
                return response;
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                return nextRow(logData);
            })
            .catch(catcher)
    } else {
        console.log(`No Date String`)
        rowResponse = nextRow(logData);
    }
    return rowResponse;
    function setMax(num: number): number {
        let max: number = num + maxModifyer;
        if (max < 0) {
            max = 0;
        }
        return max;
    }
}
export function catcher(err: any) {
    processing = false;
    console.error(`Error was Caught. processing:${processing}`);
    if (err.code == "ECONNCLOSED") {
        setTimeout(() => {
            console.log('Done waiting');
        }, 3000)
    } else {
        console.error(err);
    }
}

function processLogLine(logData: LogData): Promise.IThenable<LogData> {
    console.log(`Processing Line ${logData.getLine()}`);
    let nextStep: Promise.IThenable<LogData>;
    if (!logData.isLastLine()) {
        logData.setLineData();
        switch (logData.getLineType()) {
            case 'IN:': {
                logData.setLineEntry(new LoginLine(logData.getLineParams()));
                nextStep = addRow(logData, 1);
                break;
            }
            case 'TIMESTAMP': {
                logData.setLineEntry(new TimestampLine(logData.getLineParams()));
                // console.log(`Found Timestamp ${(logData.getLineEntry() as TimestampLine).dateString}`);
                console.log(`Setting Date to: ${(logData.getLineEntry() as TimestampLine).dateString}`)
                logData.setDateString((logData.getLineEntry() as TimestampLine).dateString);
                nextStep = nextRow(logData);
                break;
            }
            case 'OUT:': {
                logData.setLineEntry(new LoginLine(logData.getLineParams()));
                nextStep = addRow(logData, -1);
                break;
            }
            default: {
                // console.log(`No line Recorded`);
                nextStep = nextRow(logData)
                break;
            }
        }
        // console.log(`Found ${logData.getLineType()} on line ${logData.getLine()} `)
    } else {
        logData.setLine(logData.getLogLength());
        nextStep = Promise.resolve(logData);
    }
    return nextStep
}

function checkFileExists(logData: LogData): Promise.IThenable<LogData> {
    console.log(`Check File Exists`)
    return new Promise<LogData>((resolve, reject) => {
        fs.stat(logData.getPath(), (err: NodeJS.ErrnoException, stats: fs.Stats): void => {
            if (err) {
                reject(err);
            }
            // console.log(`Processing Log File`);
            // logData.updateDateString(new Date(stats.birthtime).toLocaleDateString());
            // logData.setDateString(null);
            resolve(logData)
        });
    });
}