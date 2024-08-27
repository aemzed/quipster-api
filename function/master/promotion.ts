import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global';
import { ResultSetHeader } from 'mysql2';

type get = {
    code: number,
    customcode: string,
    alias: string,
    name: string,
    type: number,
    value: string,
    valuename: string,
    start: string,
    end: string,
    notes: string,
    usepin: number,
    pin: string,
    minimum_spend: number,
    maximum_prommo: number,
    online: number,
    monday: number,
    tuesday: number,
    wednesday: number,
    thursday: number,
    friday: number,
    saturday: number,
    sunday: number
}
export function get({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT
                            i_code AS code,
                            v_code AS customcode,
                            v_code AS alias,
                            v_name AS name,
                            fk_systempromotion AS type,
                            REPLACE(v_value, '.00', '') AS value,
                            IF(fk_systempromotion = 3, (SELECT v_name FROM dvw_master.vw_item b WHERE b.i_code = v_value), '') as valuename,
                            DATE_FORMAT(dt_start, '%Y-%m-%d %T') AS start,
                            DATE_FORMAT(dt_end, '%Y-%m-%d %T') AS end,
                            v_notes AS notes,
                            b_usepin AS usepin,
                            v_pin AS pin,
                            i_minimum_spend AS minimum_spend,
                            i_maximum_promo AS maximum_promo,
                            b_online AS online,
                            b_monday AS monday,
                            b_tuesday AS tuesday,
                            b_wednesday AS wednesday,
                            b_thursday AS thursday,
                            b_friday AS friday,
                            b_saturday AS saturday,
                            b_sunday AS sunday
                        FROM dvw_master.vw_promotion
                        WHERE b_isactive = 1
                            AND fk_business = ${fk_business}
                            AND b_show = 1`
        functionGlobal.query(query, res, connection, 'function/promotion/get', resolve);
    })
}

type getByName = {
    promotion_code: number,
    promotion_type: number,
    promotion_name: string,
    promotion_value: number,
    promotion_minimumSpend: number,
    promotion_maximumPromo: number
}
export function getByName({ res, connection }: typeGlobal.functions, { fk_business, v_name }: { fk_business: number, v_name: string }): Promise<Array<getByName>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.v_code as promotion_code,
                        b.v_name as promotion_type,
                        a.v_name as promotion_name,
                        a.v_value as promotion_value,
                        a.i_minimum_spend as promotion_minimumSpend,
                        a.i_maximum_promo as promotion_maximumPromo
                    FROM dvw_master.vw_promotion a
                    JOIN dvw_system.vw_promotion b ON b.i_code = a.fk_systempromotion
                    WHERE 
                        a.fk_business = ${fk_business}
                        AND a.v_name = '${v_name}'
                    `
        functionGlobal.query(query, res, connection, 'function/master/promotion/getByCode', resolve)
    })
}

type remove = ResultSetHeader
export function remove({ res, connection }: typeGlobal.functions, { fk_business, code }: { fk_business: number, code: number }): Promise<remove> {
    return new Promise(function (resolve, reject) {
        let query = `  UPDATE dvw_master.vw_promotion SET
                                b_isactive = 0
                            WHERE i_code = ${code}
                            AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/remove/get', resolve);
    })
}

type getNamePromotion = {
    name: string
}
export function getNamePromotion({ res, connection }: typeGlobal.functions, { fk_business, name, alias }: { fk_business: number, name: string, alias: string }): Promise<Array<getNamePromotion>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                            a.v_name AS name
                        FROM dvw_master.vw_promotion a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${name ?
                            `AND v_name = '${name}'` : ""}
                                        ${alias ?
                            `AND v_code = '${alias}'` : ""}`
        functionGlobal.query(query, res, connection, 'function/getNamePromotion/get', resolve);
    })
}

type getBusinessPromotion = {
    business: string
}
export function getBusinessPromotion({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<getBusinessPromotion>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                            a.i_code AS business
                        FROM dvw_account.vw_business a
                        WHERE a.fk_businessowner = (SELECT z.fk_businessowner FROM dvw_account.vw_business z WHERE z.i_code = ${fk_business})`
        functionGlobal.query(query, res, connection, 'function/getBusinessPromotion/get', resolve);
    })
}

type getValuePromotion = {
    value: string
}
export function getValuePromotion({ res, connection }: typeGlobal.functions, { fk_business, code, businessTarget }: { fk_business: number, code: string, businessTarget: string }): Promise<getValuePromotion> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                                b.i_code AS value
                            FROM dvw_master.vw_item a
                            JOIN dvw_master.vw_item b ON a.v_name = b.v_name
                            WHERE a.i_code = ${code}
                                AND a.fk_business = ${fk_business}
                                AND b.fk_business = ${businessTarget}
                                AND b.b_isactive = 1
                            LIMIT 1`
        functionGlobal.query(query, res, connection, 'function/getValuePromotion/get', resolve);
    })
}

type insertPromotion = ResultSetHeader
export function insertPromotion({ res, connection }: typeGlobal.functions, { fk_business, alias, name, type, value, start , end, notes, usepin, pin, minimumSpend, maximumPromo, online, monday, tuesday, wednesday, thursday, friday, saturday, sunday  }: { fk_business: string, alias: string, name: string, type: number, value: string, start: string, end: string, notes: string, usepin: number, pin: string, minimumSpend: number, maximumPromo: number, online: number, monday:number, tuesday: number, wednesday: number, thursday: number, friday: number, saturday: number, sunday: number }): Promise<insertPromotion> {
    return new Promise(function (resolve, reject) {
        let query = `  INSERT INTO dvw_master.vw_promotion SET 
                            fk_business = ${fk_business}, 
                            v_code =  '${alias}', 
                            v_name =  '${name}', 
                            fk_systempromotion =  ${type}, 
                            v_value =  '${value}', 
                            dt_start =  '${start}', 
                            dt_end =  '${end}', 
                            v_notes =  '${notes}', 
                            b_usepin =  ${usepin}, 
                            v_pin =  '${pin}', 
                            i_minimum_spend =  ${minimumSpend}, 
                            i_maximum_promo =  ${maximumPromo}, 
                            b_online =  ${online}, 
                            b_monday =  ${monday},
                            b_tuesday =  ${tuesday}, 
                            b_wednesday =  ${wednesday}, 
                            b_thursday =  ${thursday}, 
                            b_friday =  ${friday}, 
                            b_saturday =  ${saturday}, 
                            b_sunday  =  ${sunday}`
        functionGlobal.query(query, res, connection, 'function/insertPromotion/get', resolve);
    })
}

