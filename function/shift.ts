import pool from '../config/connect';
import * as functionGlobal from './global_function';
import * as typeGlobal from '../type/global'
import * as type from '../type/shift'
import { ResultSetHeader } from 'mysql2';


export function checkCash({connection, res, data}:  typeGlobal.functions & {data: type.insertCash}): Promise<type.checkShift> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            COUNT(1) AS 'count'
                        FROM dvw_operational.vw_cash a
                        WHERE a.fk_business = ${data.business}
                            AND a.fk_user = ${data.user}
                            AND a.i_value = ${data.value}
                            AND a.i_type = ${data.type}
                            AND a.dt_created  <= date_sub('${data.date}', INTERVAL -5 minute)
                            AND a.dt_created  >= date_sub('${data.date}', INTERVAL 5 minute)`;

        functionGlobal.querySingle(query, res, connection, 'function/shift/checkCash', resolve);
    })
}


export function getOpenClose({connection, res, business, date}:  typeGlobal.functions & {business: string, date: string}): Promise<type.getOpenClose> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${date}') THEN CONCAT(DATE('${date}') - INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT((DATE('${date}') + INTERVAL 1 DAY) - INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE('${date}')- INTERVAL 1 day, ' 00:00')
                            ) AS 'open',
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${date}') THEN CONCAT(DATE('${date}'), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT(DATE('${date}') + INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE('${date}'), ' 00:00')
                            ) AS 'close',
                            COUNT(1)
                        FROM dvw_account.vw_business b
                        WHERE b.i_code = ${business}`;

        functionGlobal.querySingle(query, res, connection, 'function/shift/getOpenClose', resolve);
    })
}


export function insertCash({connection, res, data}:  typeGlobal.functions & {data: type.insertCash}): Promise<ResultSetHeader> {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO dvw_operational.vw_cash SET 
                            fk_business = '${data.business}', 
                            fk_user = '${data.user}', 
                            i_type = '${data.type}', 
                            i_value = '${data.value}', 
                            v_notes = '${data.notes}', 
                            dt_created = '${data.date}'`;

        functionGlobal.query(query, res, connection, 'function/shift/insertCash', resolve);
    })
}