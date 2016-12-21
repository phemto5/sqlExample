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

export function init(): void {
    let logData: LogData = new LogData(filePath, null, startLineNumber)
    let seconds: number = 30;
    console.log(`Initial run ...`);
    startProcessing(logData);
    setInterval(() => {
        // console.log(`Processes Running ${processes.length}`)
        if (!processing) {
            console.info('Filling Data from licence file');
            processing = true;
            startProcessing(logData);
        } else {
            console.log(`Still processing ...\n\tDelaying next process for ${seconds} seconds`);
        }
    }, 1000 * seconds);
}

function startProcessing(logData: LogData): void {
    checkFileExists(logData)
        .then(processLogFile)
        .then(processLogLine)
        .then((res: LogData) => {
            processing = false;
            console.log(`Processes are cleared ${new Date().toLocaleString()}`);
        })
        .catch(catcher)
}

function processLogFile(logData: LogData): Promise.IThenable<LogData> {
    return new Promise<LogData>((resolve, reject) => {
        fs.readFile(logData.getPath(), 'utf8', (err: NodeJS.ErrnoException, data: string): void => {
            if (err) {
                reject(err)
            }
            console.log(`Loading new File Data`)
            logData.setLogData(data.trim().split('\r\n'));
            resolve(logData);
        });
    })
}
function nextRow(logData: LogData): Promise.IThenable<LogData> {
    logData.incramentLine();
    return processLogLine(logData);
}

function addRow(logData: LogData, maxModifyer: number): Promise.IThenable<LogData> {
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
        rowResponse = sql.connect(config)
            .then(() => {
                let dailyMaxRow: string =
                    `select top 1 DailyMax from SolidworksLicUse where CAST(DateTime as DATE) = CAST ('${dateString}' as DATE) and Entrypoint = '${row.entryPoint}' order by LineNumber DESC`
                return new sql.Request().query(dailyMaxRow);
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                let max: number;
                if (recordset.length == 0) {
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
                return new sql.Request().query(existingRow)
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                let response: Promise.IThenable<any>
                if (recordset.length == 0) {
                    // console.log(`Row Insert`);
                    console.log(row);
                    let insertRow: string =
                        `insert into SolidworksLicUse values ('${row.dateTime.toISOString()}','${row.product}','${row.action}','${row.entryPoint}','${row.user}','${row.stringData}',${row.dailyMax}, ${row.lineNumber} )`;
                    response = new sql.Request().query(insertRow);
                } else {
                    response = Promise.resolve([] as mssql.recordSet);
                }
                return response;
            }).catch(catcher)
            .then((recordset: mssql.recordSet) => {
                return nextRow(logData);
            })
    } else {
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
    console.error(`Error was Caught`);
    console.error(err);
}

function processLogLine(logData: LogData): Promise.IThenable<LogData> {
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
                console.log(`Found Timestamp ${(logData.getLineEntry() as TimestampLine).dateString}`);
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
                console.log(`No line Recorded`);
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
    console.log(`LoadFile`)
    return new Promise<LogData>((resolve, reject) => {
        fs.stat(logData.getPath(), (err: NodeJS.ErrnoException, stats: fs.Stats): void => {
            if (err) {
                reject(err);
            }
            console.log(`Processing Log File`);
            // logData.updateDateString(new Date(stats.birthtime).toLocaleDateString());
            logData.updateDateString(null);
            resolve(logData)
        });
    });
}