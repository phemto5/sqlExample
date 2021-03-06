import sql = require('mssql');
import { Day } from './Day';

export function UpsertDay(day: Day) {
    let sqlServerConfig = {
        user: '<USERNAME>',
        password: '<PASSWORD>',
        server: 'sqldb1.wagstaff.com\\WAGENG',
        database: 'WagEngineering'
    }
    let sqlTable: string = 'SolidworksLicData'

    let connection = new sql.Connection(sqlServerConfig);
    connection.connect((err) => {
        if (err) {
            console.log(err);
        }
    })
    let request = new sql.Request(connection);
    request.query(`select * from ${sqlTable} where date = ${day.getDate()}`, handelSelectResponse);

    function handelSelectResponse(err: any, recordset: sql.recordSet) {
        if (err) {
            console.log(err);
        }
        if (recordset.length == 0) {
            //insert record
            // console.log('Did not find date');
            insertRow(day);

        }
        // else {
        //updateRecord
        updateMax(day);
        // console.log(`Found Date: `);
        // console.log(recordset);
        // }
    }
    function insertRow(day: Day) {
        request.query(`insert into ${sqlTable} values ('${day.getDate()}',0,0,0,0,0,0,0)`);
        // console.log('Inserted Date');
    }
    function updateMax(day: Day) {
        day.products.foreach((product: string) => {
            request.query(`update ${sqlTable} set ${product} = ${day.getHighMark(product)} where date = ${day.getDate()}`);
            // console.log(`Updated ${product}`);
        });
    }
}
