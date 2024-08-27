import { ResultSetHeader } from 'mysql2'
import * as functionGlobal from '../../function/global_function'
import * as typeGlobal from '../../type/global'

type removeBanner = ResultSetHeader
export function removeBanner({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_setting.vw_online SET
                        v_banner = ''
                    WHERE fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/online/removeBanner', resolve)
    })
}

type singleGet = {
    v_phone: string,
    v_information: string,
    i_cutoff: number,
    i_shipping_min_day: number,
    i_shipping_cost: number,
    b_shipping_cost_mode: number,
    b_shipping_date_use: number,
    b_can_pickup: number,
    b_use_notes_item: number,
    b_use_address: number,
    b_use_email: number,
    v_color_background: string,
    v_color_text: string,
    v_background_order: string,
    v_background_link: string,
    v_url_resi: string,
    v_banner: string,
    d_latitude: number,
    d_longitude: number,
    j_expedisi: any,
    v_sunday: string,
    v_monday: string,
    v_tuesday: string,
    v_wednesday: string,
    v_thursday: string,
    v_friday: string,
    v_saturday: string,
}
export function singleGet({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<singleGet> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM dvw_setting.vw_online a
                    WHERE a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/setting/online/singleGet', resolve)
    })
}

export function updateImage({res, connection}: typeGlobal.functions, {v_banner, fk_business}: {v_banner: string, fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE
                        dvw_setting.vw_online
                    SET
                        v_banner = '${v_banner}'
                    WHERE
                        fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/online/updateImage', resolve)
    })
}

export function update({res, connection}: typeGlobal.functions, {v_name, v_address, v_phone, v_information, v_color_background, v_color_text, fk_business}: {v_name: string, v_address: string, v_phone: string, v_information: string, v_color_background: string, v_color_text: string, fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_setting.vw_online SET
                        v_name = '${v_name}',
                        v_address = '${v_address}',
                        v_phone = '${v_phone}',
                        v_information = '${v_information}',
                        v_color_background = '${v_color_background}',
                        v_color_text = '${v_color_text}'
                    WHERE fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/online/update', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {fk_business, v_name, v_address, v_phone, v_information, v_color_background, v_color_text}: {fk_business: number, v_name: string, v_address: string, v_phone: string, v_information: string, v_color_background: string, v_color_text: string}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_setting.vw_online
                    SET
                        fk_business = ${fk_business}
                        v_name = '${v_name}'
                        v_address = '${v_address}'
                        v_phone = '${v_phone}'
                        v_information = '${v_information}'
                        v_color_background = '${v_color_background}'
                        v_color_text = '${v_color_text}'
                    ` 
        functionGlobal.query(query, res, connection, 'function/settiong/online/insert', resolve)
    })
}

export function select({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<any> {
    return new Promise((resolve, reject) => {
        let query = `SELECT *
                    FROM dvw_setting.vw_online a
                    WHERE a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/setting/online/select', resolve)
    })
}

export function updateOperationalTime({res, connection}: typeGlobal.functions, {fk_business, v_sunday, v_monday, v_tuesday, v_wednesday, v_thursday, v_friday, v_saturday}: {fk_business: number, v_sunday: string, v_monday: string, v_tuesday: string, v_wednesday: string, v_thursday: string, v_friday: string, v_saturday: string}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_setting.vw_online SET
                        v_sunday = '${v_sunday}',
                        v_monday = '${v_monday}',
                        v_tuesday = '${v_tuesday}',
                        v_wednesday = '${v_wednesday}',
                        v_thursday = '${v_thursday}',
                        v_friday = '${v_friday}',
                        v_saturday = '${v_saturday}'
                    WHERE fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/setting/online/updateOperationalTime', resolve)
    })
}

export function insertOperationalTime({res, connection}: typeGlobal.functions, {fk_business, v_sunday, v_monday, v_tuesday, v_wednesday, v_thursday, v_friday, v_saturday}: {fk_business: number, v_sunday: string, v_monday: string, v_tuesday: string, v_wednesday: string, v_thursday: string, v_friday: string, v_saturday: string}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_setting.vw_online
                    SET
                        fk_business = ${fk_business}, 
                        v_sunday = '${v_sunday}', 
                        v_monday = '${v_monday}', 
                        v_tuesday = '${v_tuesday}',
                        v_wednesday = '${v_wednesday}',
                        v_thursday = '${v_thursday}',
                        v_friday = '${v_friday}',
                        v_saturday = '${v_saturday}'
                    `
        functionGlobal.query(query, res, connection, 'function/setting/online/insertOperationalTime', resolve)
    })
}