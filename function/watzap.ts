import * as typeGlobal from '../type/global'
import * as functionGlobal from './global_function'

export async function sendMessage({phoneDestination, message, sender}:{phoneDestination: string, message: string, sender: {apiKey: string, numberKey: string}}) {
    console.log({sender, phoneDestination, message})
    return new Promise(async (resolve, reject) => {
        await fetch(`https://api.watzap.id/v1/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                api_key: sender.apiKey,
                number_key: sender.numberKey,
                phone_no: phoneDestination,
                message: message
            })
        })
        .then(response => response.json())
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
}

export async function adminSentMessage({res, connection}: typeGlobal.functions, {idTemplateChat, phoneUser, admin, message}:{idTemplateChat: number, phoneUser: string, admin: {phoneAdmin: string, apiKey: string, numberKey: string}, message: string}) {
    return new Promise(async (resolve, reject) => {
        await fetch(`https://api-dev.looyal.id/v3/watzap/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                api_key: admin.apiKey,
                number_key: admin.numberKey,
                phone_destination: phoneUser,
                message: message
            })
        })
        .then(response => response.json())
        .then(async (result) => {
            await insertMessage({res, connection}, {fk_templatechat: idTemplateChat, v_message: message, v_phone_admin: admin.phoneAdmin, v_phone_user: phoneUser, b_from_admin: 1})
            resolve(result)
        })
        .catch(error => reject(error))
    })
}

type getLastMessage = {
    id: number,
    idTemplateChat: number,
    message: string,
    dateCreated: string,
    typeMessage: number
}
export async function getLastMessageFromAdmin({res, connection}: typeGlobal.functions, {fk_business, v_phone_admin, v_phone_user}: {fk_business: number, v_phone_admin: string, v_phone_user: string}):Promise<getLastMessage> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code as id,
                        a.fk_templatechat as idTemplateChat,
                        a.v_message as message,
                        a.dt_created as dateCreated,
                        b.i_type as typeMessage
                    FROM
                        tkd_broadcast.bc_logchat a
                    LEFT JOIN
                        tkd_broadcast.bc_templatechat b ON a.fk_templatechat = b.i_code AND b.fk_business = ${fk_business}
                    WHERE
                        a.v_phone_admin = '${v_phone_admin}'
                        AND a.v_phone_user = '${v_phone_user}'
                        AND a.dt_created >= DATE_SUB(NOW(),INTERVAL 15 MINUTE)
                        AND a.b_from_admin = 1
                    ORDER BY
                        dt_created DESC
                    `
        
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getLastMessage', resolve)
    })
}

type getBusinessCodeNPhoneFromNumberKey = {
    phone_number: string
}
export function getBusinessCodeNPhoneFromNumberKey({res, connection}: typeGlobal.functions, {v_number_key}: {v_number_key: string}): Promise<getBusinessCodeNPhoneFromNumberKey> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_number as phone_number,
                        a.v_api_key as api_key
                    FROM
                        tkd_broadcast.bc_user_number a
                    JOIN
                        dvw_account.vw_business b ON b.fk_wooblazz = a.v_number
                    WHERE
                        v_number_key = '${v_number_key}'
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getBusinessCodeNPhoneFromNumberKey', resolve)
    })
}

type getPhoneFromNumberKey = {
    phone: string,
    api_key: string
}
export async function getPhoneAndAPIKeyFromNumberKey({res, connection}: typeGlobal.functions, {v_number_key}: {v_number_key: string}): Promise<getPhoneFromNumberKey> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        v_number as phone,
                        v_api_key as api_key
                    FROM
                        tkd_broadcast.bc_user_number
                    WHERE
                        v_number_key = '${v_number_key}'
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getPhoneFromNumberKey', resolve)
    })
}

export function insertMessage({res, connection}: typeGlobal.functions, {fk_templatechat, v_phone_admin, v_phone_user, v_message, b_from_admin}: {fk_templatechat: number, v_phone_admin: string, v_phone_user: string, v_message: string, b_from_admin: number}) {
    return new Promise((resolve, reject) => {
        v_phone_admin = v_phone_admin.replaceAll("'", "''")
        v_phone_user = v_phone_user.replaceAll("'", "''")
        v_message = v_message.replaceAll("'", "''")
        let query = `
                    INSERT INTO
                        tkd_broadcast.bc_logchat
                    SET
                        fk_templatechat = ${fk_templatechat},
                        v_phone_admin = '${v_phone_admin}',
                        v_phone_user = '${v_phone_user}',
                        v_message = '${v_message}',
                        b_from_admin = '${b_from_admin}'
                    `
        functionGlobal.query(query, res, connection, 'function/watzap/insertMessage', resolve)
    })
}

type getWoogigsBusiness = {
    idBusiness: number,
    codeBusiness: string,
    apiKey: string,
    numberKey: string,
    phone: string
}
export function getWoogigsUserNBusiness({res, connection}: typeGlobal.functions, {bc_user_number}: {bc_user_number: {v_number_key: string}}): Promise<getWoogigsBusiness> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.i_code as idBusiness,
                        a.v_code as codeBusiness,
                        b.v_api_key as apiKey,
                        b.v_number_key as numberKey,
                        b.v_number as phone
                    FROM
                        dvw_account.vw_business a
                    JOIN
                        tkd_broadcast.bc_user_number b ON a.fk_wooblazz = b.v_number
                    WHERE
                        b.v_number_key = '${bc_user_number.v_number_key}'
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getWoogigsBusiness', resolve)
    })
}

type getAdminResponse = {
    idTemplateChat: number,
    message: string
}
export function getAdminResponse({res, connection}: typeGlobal.functions, {fk_templatechat_from, v_answer, fk_business}: {fk_templatechat_from: number, v_answer: string, fk_business: number}): Promise<getAdminResponse> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.i_code as idTemplateChat,
                        a.v_message as message
                    FROM
                        tkd_broadcast.bc_templatechat a
                    JOIN
                        tkd_broadcast.bc_flowchat b ON b.fk_templatechat_to = a.i_code AND b.fk_business = ${fk_business}
                    WHERE
                        fk_templatechat_from = ${fk_templatechat_from}
                        AND (b.v_answer = '${v_answer}' OR b.v_answer IS NULL)
                        AND a.fk_business = ${fk_business}
                    `
        
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getAdminResponse', resolve)
    })
}

type getAdminResponseForNewCustomer = {
    idTemplateChat: number,
    message: string
}
export function getAdminResponseForNewCustomer({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getAdminResponseForNewCustomer> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        i_code as idTemplateChat,
                        v_message as message
                    FROM
                        tkd_broadcast.bc_templatechat
                    WHERE
                        fk_business = ${fk_business}
                        AND i_type = -1
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getAdminResponseForNewCustomer', resolve)
    })
}

type getAdminFirstResponse = {
    idTemplateChat: number,
    message: string
}
export function getAdminFirstResponse({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getAdminFirstResponse> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        a.i_code as idTemplateChat,
                        a.v_message as message
                    FROM
                        tkd_broadcast.bc_templatechat a
                    JOIN
                        tkd_broadcast.bc_flowchat b ON b.fk_templatechat_to = a.i_code AND b.fk_business = ${fk_business}
                    WHERE
                        fk_templatechat_from IS NULL
                        AND a.fk_business = ${fk_business}
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getAdminFirstResponse', resolve)
    })
}

type getAdminLastResponse = {
    idTemplateChat: number,
    message: string
}
export function getAdminLastResponse({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<getAdminLastResponse> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        i_code as idTemplateChat,
                        v_message as message
                    FROM
                        tkd_broadcast.bc_templatechat
                    WHERE
                        i_type = -2
                        AND fk_business = ${fk_business}
                    `
        functionGlobal.querySingle(query, res, connection, 'function/watzap/getAdminLastResponse', resolve)
    })
}

type getShipping = {
    available_for_cash_on_delivery: boolean,
    available_for_proof_of_delivery: boolean,
    available_for_instant_waybill_id: boolean,
    available_for_insurance: number,
    company: string,
    courier_name: string,
    courier_code: string,
    courier_service_name: string,
    courier_service_code: string,
    description: string,
    duration: string,
    shipment_duration_range: string,
    shipment_duration_unit: string,
    price: number,
    service_type: string,
    shipping_type: string,
    type: string
}
export function getShipping({res, connection}: typeGlobal.functions, {idBusiness, location}: {idBusiness: number, location: {latitude: number, longitude: number}}): Promise<Array<getShipping>> {
    return new Promise(async (resolve, reject) => {
        let query = `
                    SELECT
                        v_latitude as latitude,
                        v_longitude as longitude
                    FROM
                        dvw_account.vw_business
                    WHERE
                        i_code = ${idBusiness}
                    `
        let resultGetLatitudeLongitude: {latitude: string, longitude: string} = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/watzap/getShipping', resolve))
        let dataShipping = await fetch('https://api.biteship.com/v1/rates/couriers', {
            method: 'POST',
            headers: {
                'authorization': 'biteship_live.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTG9veWFsIiwidXNlcklkIjoiNWZlYmVlYzE3YzFkZWM3N2EwM2FjMDQ2IiwiaWF0IjoxNjM0MDMzNjE2fQ.wk2zAb30unr7dLCtCSpjEwDxKMTSeQ2fSBJI-hZYOI8',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                origin_latitude: resultGetLatitudeLongitude.latitude,
                origin_longitude: resultGetLatitudeLongitude.longitude,
                destination_latitude: location.latitude,
                destination_longitude: location.longitude,
                couriers: 'jne,jnt,grab,gojek',
                items:[{
                    name:"Shoes",
                    description:"Black colored size 45",
                    length: 30,
                    width: 15,
                    height: 20,
                    weight: 200,
                    quantity: 2
                }]
            })
        })
        .then(response => response.json())
        .then(result => result.pricing)
        return resolve(dataShipping)
    })
}