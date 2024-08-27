import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import fs from 'fs'
import { ResultSetHeader } from "mysql2"

type absenceSelectCheck = {
    hash: string,
    date_in: string,
    absence_type: number
}
export function absenceSelectCheck({res, connection}: typeGlobal.functions, {fk_employee}: {fk_employee: number}): Promise<Array<absenceSelectCheck>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT hash, 
                            date_in, 
                            absence_type
                    FROM (
                        SELECT hash, date_in, date, absence_type,
                            CASE
                                WHEN end < start THEN DATE(SUBDATE(NOW(),1))
                                ELSE DATE(NOW())
                            END AS param
                        FROM (
                            SELECT 
                                a.v_hash AS hash,
                                a.dt_absence AS date_in,
                                a.dt_absence AS date,
                                a.fk_absence_type AS absence_type,
                                b.i_start_hour AS start,
                                b.i_end_hour AS end
                            FROM dvw_operational.vw_absence a
                            JOIN dvw_master.vw_absence_type b ON a.fk_absence_type = b.i_code
                            WHERE a.fk_employee = ${fk_employee}
                                AND a.fk_end = ''
                        ) temp
                    ) temp
                    WHERE date >= param`
        functionGlobal.query(query, res, connection, 'function/operational/absence/absenceSelectCheck', resolve)
    })
}

type getAbsence = {
    employee: string,
    absence_type: string,
    date_start: string,
    image_start: string,
    user_start: string,
    different_start: string,
    latitude_start: number,
    longitude_start: number,
    end: string
}
export function getStartAbsence({res, connection}: typeGlobal.functions, {fk_business, dt_absence}: {fk_business: number, dt_absence: {startdate: string, enddate: string}}): Promise<Array<getAbsence>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        c.v_name AS 'employee',
                        d.v_name AS 'absence_type',
                        a.dt_absence AS 'date_start',
                        a.v_image AS 'image_start',
                        b.v_name AS 'user_start',
                        REPLACE(TIMEDIFF(CONCAT(HOUR(a.dt_absence), ':', MINUTE(a.dt_absence)), CONCAT(d.i_start_hour, ':', d.i_start_minute)), '.000000', '') AS 'different_start',
                        a.d_latitude AS 'latitude_start',
                        a.d_longitude AS 'longitude_start',
                        a.fk_end AS 'end'
                    FROM dvw_operational.vw_absence a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    JOIN dvw_master.vw_employee c ON a.fk_employee = c.i_code
                    JOIN dvw_master.vw_absence_type d ON a.fk_absence_type = d.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_type = 1
                        AND DATE(a.dt_absence) >= '${dt_absence.startdate}'
                        AND DATE(a.dt_absence) <= '${dt_absence.enddate}'`
        functionGlobal.query(query, res, connection, 'function/operational/absence/getAbsence', resolve)
    })
}

type getEndAbsence = {
    date_end: string,
    image_end: string,
    user_end: string,
    latitude: string,
    longitude: string,
    different_end: string
}
export function getEndAbsence({res, connection}:typeGlobal.functions, {fk_end}: {fk_end: string}): Promise<getEndAbsence> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.dt_absence AS 'date_end',
                        a.v_image AS 'image_end',
                        b.v_name AS 'user_end',
                        a.d_latitude AS 'latitude',
                        a.d_longitude AS 'longitude',
                        REPLACE(TIMEDIFF(CONCAT(HOUR(a.dt_absence), ':', MINUTE(a.dt_absence)), CONCAT(c.i_end_hour, ':', c.i_end_minute)), '.000000', '') AS 'different_end'
                    FROM dvw_operational.vw_absence a
                    JOIN dvw_account.vw_user b ON a.fk_user = b.i_code
                    JOIN dvw_master.vw_absence_type c ON a.fk_absence_type = c.i_code
                    WHERE a.b_type = 2
                        AND a.fk_end = '${fk_end}'`
        functionGlobal.querySingle(query, res, connection, 'function/operational/absence', resolve)
    })
}

export function insert(
    {res, connection}: typeGlobal.functions,
    {
        hash, fk_business, fk_user, fk_employee, fk_absence_type, image, latitude, longitude,
        fk_customer, notes
    }   : {
            hash: string, fk_business: number, fk_user: number, fk_employee: number, fk_absence_type: number,
            image: string, latitude: number, longitude: number, fk_customer: number,
            notes: string    
        }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_operational.vw_absence(v_hash, fk_business, fk_user, fk_employee, fk_absence_type, dt_absence, v_image, d_latitude, d_longitude)
                    VALUES ('${hash}', ${fk_business}, ${fk_user}, ${fk_employee}, ${fk_absence_type}, NOW(), '${image}', ${latitude}, ${longitude})`
        functionGlobal.query(query, res, connection, 'function/operational/absence/insertAbsence', resolve)
    })
}

export function updateHash({res, connection}: typeGlobal.functions, {fk_end, hash}: {fk_end: string, hash: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_absence SET
                        fk_end = '${fk_end}',
                        b_type = 2
                    WHERE v_hash = '${hash}'`
        functionGlobal.query(query, res, connection, 'function/operational/absence/updateHash', resolve)
    })
}

export function updateHashs({res, connection}: typeGlobal.functions, {fk_end, hash}: {fk_end: string, hash: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_operational.vw_absence SET
                        fk_end = '${fk_end}'
                    WHERE v_hash = '${hash}'`
        functionGlobal.query(query, res, connection, 'function/operational/absence/updateHashs', resolve)
    })
}