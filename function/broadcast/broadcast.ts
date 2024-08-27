import pool from '../../config/connect';
import * as functionGlobal from '../global_function';
import * as task from '../operational/task';
import * as broadcastPackage from '../broadcast/broadcast_package';
import * as typeGlobal from '../../type/global'
import * as type from '../../type/broadcast'
import * as typeBroadcastUser from '../../type/broadcast_user'
import * as typeBroadcastList from '../../type/broadcast_list'
import * as typeBroadcastPackage from '../../type/broadcast_package'
import { resolve } from 'path';
import moment from 'moment';

const fs = require('fs');



export type get = {
    code: string,
    number_sender: string,
    broadcast_name: string,
    list_name: string,
    content_a: string,
    content_b: string,
    content_c: string,
    content_d: string,
    content_e: string,
    interval: string,
    image_1: string,
    image_2: string,
    image_3: string,
    image_4: string,
    image_5: string,
    image_name_1: string,
    image_name_2: string,
    image_name_3: string,
    image_name_4: string,
    image_name_5: string,
    file: string,
    message_sent: string,
    message_fail: string,
    message_full: string,
    message_detail?: object,
    status: string,
    date_created: string
}
export async function get<T extends get | get[]>({res, connection}: typeGlobal.functions,{phone, code="%"} : {phone: string, code?: string}): Promise<T> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            a.v_code AS code,
                            a.fk_user_number AS user_package_code,
                            a.v_number_sender AS number_sender,
                            a.v_name AS broadcast_name,
                            a.fk_list AS list_code,
                            c.v_name AS list_name,
                            a.v_content_1 AS content_a,
                            a.v_content_2 AS content_b,
                            a.v_content_3 AS content_c,
                            a.v_content_4 AS content_d,
                            a.v_content_5 AS content_e,
                            a.i_interval AS 'interval',
                            a.v_image_1 AS image_1,
                            a.v_image_2 AS image_2,
                            a.v_image_3 AS image_3,
                            a.v_image_4 AS image_4,
                            a.v_image_5 AS image_5,
                            a.v_image_name_1 AS image_name_1,
                            a.v_image_name_2 AS image_name_2,
                            a.v_image_name_3 AS image_name_3,
                            a.v_image_name_4 AS image_name_4,
                            a.v_image_name_5 AS image_name_5,
                            a.v_file AS file,
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_broadcast_detail z
                                WHERE fk_broadcast = a.v_code
                                    AND z.b_status = 1
                            ) AS message_sent,
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_broadcast_detail z
                                WHERE fk_broadcast = a.v_code
                                    AND (z.b_status = 3 || z.b_status = 4)
                            ) AS message_fail,
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_broadcast_detail z
                                WHERE fk_broadcast = a.v_code
                                    AND z.b_status >= 1
                            ) AS message_full,
                            a.b_status AS status,
                            a.dt_created AS date_created
                        FROM tkd_broadcast.bc_broadcast a
                        JOIN tkd_broadcast.bc_user_number b ON a.fk_user_number= b.i_code
                        JOIN tkd_broadcast.bc_list c ON a.fk_list= c.v_code
                        WHERE a.b_status >= 1
                            AND a.fk_user = '${user.code}'
                            AND a.v_code LIKE '${code}'
                        ORDER BY a.dt_created DESC`

        if(code == "%") functionGlobal.query(query, res, connection, 'function/broadcast/get', resolve)
        else functionGlobal.querySingle(query, res, connection, 'function/broadcast/get', resolve)
    })
}

export async function save(
    {connection, res}: typeGlobal.functions,
    {phone, user_package_code, list_code, name, content_a, content_b, content_c, content_d, content_e, interval, status} : {phone:string, user_package_code:string, list_code:string, name:string, content_a:string, content_b:string, content_c:string, content_d:string, content_e:string, interval:number, status?:number}
){
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    var userNumber: type.responseUserPackage = await getUserPackage({
        connection: connection,
        res: res,
        phone: phone,
        code: user_package_code
    });
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_broadcast SET
                            v_code = '${hash}',
                            fk_user = ${user.code},
                            fk_user_number = '${user_package_code}',
                            fk_list = '${list_code}',
                            v_number_sender = '${userNumber.number}',
                            v_name = '${name}',
                            v_content_1 = '${content_a}',
                            v_content_2 = '${content_b}',
                            v_content_3 = '${content_c}',
                            v_content_4 = '${content_d}',
                            v_content_5 = '${content_e}',
                            i_interval = ${interval},
                            b_status = ${status} `;

        functionGlobal.query(query, res, connection, 'function/broadcast/save', resolve, {id: hash});
    })
}

export async function saveImage(
    {connection, res}: typeGlobal.functions,
    {code, position, image="", image_name=""} : {code:string, position:number, image:string, image_name:string}
){
    var hash = Date.now().toString(36) + Math.random().toString(36)

    var imageLink = "";
    if(image != ""){
        if(image.indexOf("http") >= 0){
            imageLink = image;
        }
        else{
            //convert base64 to image
            let ext = image.split('/')[1].split(',')[0].split(';')[0];
            image = image.split(',')[1];

            if (ext === 'quicktime') ext = 'mov'

            var base64Data = image;
            imageLink = "https://data.looyal.id/asset/broadcast/" + code + "-" + position + "." + ext;
    
            fs.writeFile(`/var/www/test/asset/broadcast/${code}-${position}.${ext}`, base64Data, 'base64', function(err:any) {  
                console.log(err);
            });
        }
    }

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_broadcast SET
                            v_image_${position} = '${imageLink}',
                            v_image_name_${position} = '${image_name}'
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/saveImage', resolve);
    })
}

export function sendMessage({connection, res,} :  typeGlobal.functions, {phone_from, credit_code, api_key, number_key, phone_to, message} : {phone_from: string, credit_code:number, api_key:string, number_key:string, phone_to: string, message: string}) {
    return new Promise(async function(resolve, reject) {
        var hash = Date.now().toString(36) + Math.random().toString(36)

        let query = `   INSERT INTO tkd_broadcast.bc_broadcast_detail SET
                            v_code = '${hash}',
                            fk_broadcast = '',
                            v_name = '',
                            v_message = '${message.replaceAll("'", "''")}',
                            v_image = '',
                            v_phone = '${phone_to}',
                            b_status = 1,
                            dt_sent = NOW() `;

        await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/broadcast/sendMessage', resolve))

        query = `
                SELECT
                    b_connected as connectedNewAPI
                FROM
                    tkd_broadcast.bc_user_number
                WHERE
                    v_number = '${phone_from}'    
                `
        let resultConnected: {connectedNewAPI: number} = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/broadcast/broadcast/sendMessage', resolve))
        if (resultConnected && resultConnected.connectedNewAPI === 1) functionGlobal.sendNewWA(message, phone_from, phone_to)
        else functionGlobal.sendWA(phone_to, message, api_key, number_key)

        query = `   UPDATE tkd_broadcast.bc_user_credit SET
                        i_credit = i_credit + 1
                    WHERE i_code = ${credit_code}`;
        functionGlobal.query(query, res, connection, 'function/broadcast/sendMessage', resolve)
    })
}


export async function pauseBroadcast(
    {connection, res}: typeGlobal.functions,
    {code} : {code:string}
){
    await new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_broadcast SET
                            b_status = 3
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/pauseBroadcast', resolve);
    })

    return new Promise(function(resolve, reject) {
        let query = `   DELETE FROM dvw_system.vw_task_schedule 
                        WHERE fk_task = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/pauseBroadcast', resolve);
    })
}

export async function continueBroadcast(
    {connection, res}: typeGlobal.functions,
    {code} : {code:string}
){
    await task.savePending({
        connection: connection,
        res: res
    },{
        type: 1,
        task_reference: code
    })

    await new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_broadcast SET
                            b_status = 1
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/continueBroadcast', resolve);
    })

    runBroadcast({
        connection: connection,
        res: res
    }, {
        code: code
    })

    return;
}

export type runBroadcast = {
    phone_user: string,
    code: string,
    interval: number,
    user_number_code: string,
    admin_phone: string,
    connected_new_api: number,
    number_key: string,
    api_key: string,
    phone: string,
    message: string,
    image: string,
    file: string
}
export async function runBroadcast(
    {connection, res}: typeGlobal.functions,
    {code} : {code:string}
){
    var dataBroadcast:runBroadcast[] = await new Promise(function(resolve, reject) {
        let query = `   SELECT
                            d.v_phone AS phone_user,
                            b.i_interval AS 'interval',
                            b.fk_user_number AS user_number_code,
                            c.v_number AS admin_phone,
                            c.v_number_key AS number_key,
                            c.v_api_key AS api_key,
                            c.b_connected AS connected_new_api,
                            a.v_code AS code,
                            a.v_phone AS phone,
                            a.v_message AS message,
                            IFNULL(a.v_image, '') AS image,
                            IFNULL(b.v_file, '') AS file
                        FROM tkd_broadcast.bc_broadcast_detail a
                        JOIN tkd_broadcast.bc_broadcast b ON a.fk_broadcast = b.v_code
                        JOIN tkd_broadcast.bc_user_number c ON b.fk_user_number = c.i_code
                        JOIN tkd_broadcast.bc_user d ON d.i_code = c.fk_user
                        JOIN dvw_system.vw_task_schedule e ON b.v_code = e.fk_task
                        WHERE a.fk_broadcast = '${code}'
                            AND a.b_status = 2
                            AND b.b_status = 1`;

        functionGlobal.query(query, null, connection, 'function/broadcast/runBroadcast 1', resolve);
    })

    
    if(dataBroadcast.length > 0){
        var results = await checkCredit({
            connection: connection,
            res: null
        },{
            phone: dataBroadcast[0].phone_user,
            user_number: dataBroadcast[0].user_number_code
        });

        if(results.sent_today< results.sent_today_max){
            if(results.credit_remain > 0){
                var statusWA = await new Promise(async function(resolve, reject) {
                    await functionGlobal.checkWA(dataBroadcast[0].phone, function(response:any){
                        resolve(response);
                    });
                })

                if(statusWA==200){
                    var message = dataBroadcast[0].message
                    message = decodeURIComponent(message)
                    
                    if(dataBroadcast[0].image == "" && dataBroadcast[0].file == "") {
                        if (dataBroadcast[0].connected_new_api === 1) {
                            functionGlobal.sendNewWA(message, dataBroadcast[0].admin_phone, dataBroadcast[0].phone)
                        } else {
                            functionGlobal.sendWA(dataBroadcast[0].phone, message, dataBroadcast[0].api_key, dataBroadcast[0].number_key)
                        }
                    }
                    else if(dataBroadcast[0].image != ""){
                        if (dataBroadcast[0].connected_new_api === 0) {
                            var text = dataBroadcast[0].image.toLowerCase();
                            if(text.includes(".jpg") || text.includes(".jpeg") || text.includes(".png")){
                                functionGlobal.sendImageWA(dataBroadcast[0].phone, message, dataBroadcast[0].image, dataBroadcast[0].api_key, dataBroadcast[0].number_key)
                            }
                            else{
                                functionGlobal.sendFileWA(dataBroadcast[0].phone, message, dataBroadcast[0].image, dataBroadcast[0].api_key, dataBroadcast[0].number_key)
                            }
                        }
                        else if (dataBroadcast[0].connected_new_api === 1) {
                            var text = dataBroadcast[0].image.toLowerCase();
                            if(text.includes(".jpg") || text.includes(".jpeg") || text.includes(".png") || text.includes(".gif")){
                                functionGlobal.sendImageNewWAWithCaption(message, dataBroadcast[0].admin_phone, dataBroadcast[0].phone, dataBroadcast[0].image)
                            }
                            else if(text.includes(".mp4") || text.includes(".mov") || text.includes('.mpeg') || text.includes('.3gp')){
                                functionGlobal.sendVideoNewWAWithCaption(message, dataBroadcast[0].admin_phone, dataBroadcast[0].phone, dataBroadcast[0].image)
                            }
                            else{
                                functionGlobal.sendFilePDFNewWAWithCaption(message, dataBroadcast[0].admin_phone, dataBroadcast[0].phone, dataBroadcast[0].image, decodeURIComponent(dataBroadcast[0].image.replace('https://data.looyal.id/asset/broadcast/', '')))
                            }
                        }
                    } 
                    
                    await messageDone({
                        connection: connection,
                        res: null
                    },{
                        broadcast_detail: dataBroadcast[0].code,
                        user_number: dataBroadcast[0].user_number_code
                    });
                }
                else{
                    await messageInvalidNumber({
                        connection: connection,
                        res: null
                    },{
                        broadcast: code,
                        broadcast_detail: dataBroadcast[0].code
                    });
                }
            }
            else{
                await messageFail({
                    connection: connection,
                    res: null
                },{
                    broadcast: code,
                    broadcast_detail: dataBroadcast[0].code
                });
            }
        }
        else{
            await messageFail({
                connection: connection,
                res: null
            },{
                broadcast: code,
                broadcast_detail: dataBroadcast[0].code
            });
        }

        console.log("Message sent, next message will be sent in ", moment(moment().valueOf() + (dataBroadcast[0].interval * 1000)).format('YYYY-MM-DD HH:mm:ss'))
        setTimeout(async ()=>{
            runBroadcast({connection, res}, {code: code})
        }, dataBroadcast[0].interval * 1000)
    }
    else{
        if (res.headersSent) return
        return new Promise(async function(resolve, reject) {
            let query = `   DELETE FROM dvw_system.vw_task_schedule
                        WHERE fk_task = '${code}'
                            AND b_type = 1`;
            pool.query(query, (error) => {
                return
            })
        })
    }

    return;
}


type getDetailByBroadcast = {
    code: string,
    name: string,
    phone: string,
    message: string,
    date_sent: string,
    status: string,
    date_created: string
}
export async function getDetailByBroadcast({res, connection}: typeGlobal.functions,{broadcast_code} : {broadcast_code: string}): Promise<getDetailByBroadcast[]> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT
                            a.v_code AS code,
                            IFNULL(c.v_code, '') AS contact_code,
                            a.v_name AS name,
                            a.v_phone AS phone,
                            a.v_message AS message,
                            a.dt_sent AS date_sent,
                            a.b_status AS status,
                            a.dt_created AS date_created
                        FROM tkd_broadcast.bc_broadcast_detail a
                        JOIN tkd_broadcast.bc_broadcast b ON b.v_code = a.fk_broadcast
                        LEFT JOIN tkd_broadcast.bc_contact c ON c.fk_list = b.fk_list AND a.v_phone = c.v_wa
                        WHERE a.fk_broadcast = '${broadcast_code}'
                        GROUP BY a.v_phone `

        functionGlobal.query(query, res, connection, 'function/broadcast/get', resolve)
    })
}


export async function update(
    {connection, res}: typeGlobal.functions,
    {phone, code, user_package_code, list_code, name, content_a, content_b, content_c, content_d, content_e, interval, status} : {phone:string, user_package_code:string, list_code:string, code?:string, name:string, content_a:string, content_b:string, content_c:string, content_d:string, content_e:string, interval:number, status?:number}
){
    var userNumber: type.responseUserPackage = await getUserPackage({
        connection: connection,
        res: res,
        phone: phone,
        code: user_package_code
    });

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_broadcast SET
                            fk_user_number = '${user_package_code}',
                            fk_list = '${list_code}',
                            v_number_sender = '${userNumber.number}',
                            v_name = '${name}',
                            v_content_1 = '${content_a}',
                            v_content_2 = '${content_b}',
                            v_content_3 = '${content_c}',
                            v_content_4 = '${content_d}',
                            v_content_5 = '${content_e}',
                            i_interval = ${interval},
                            b_status = ${status}
                        WHERE v_code = '${code}' `;

        functionGlobal.query(query, res, connection, 'function/broadcast/update', resolve);
    })
}


export async function saveDetail(
    {connection, res}: typeGlobal.functions,
    {broadcast, name, phone, message, image} : {broadcast:string, name:string, phone:string, message:string, image:string}
){
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_broadcast_detail SET
                            v_code = '${hash}',
                            fk_broadcast = '${broadcast}',
                            v_name = '${name.replaceAll("'", "''")}',
                            v_message = '${message.replaceAll("'", "''")}',
                            v_image = '${image}',
                            v_phone = '${phone}' `;

        functionGlobal.query(query, res, connection, 'function/broadcast/saveDetail', resolve, {id: hash});
    })
}





export function checkExpired({connection, res}:  typeGlobal.functions) {
    return new Promise(async function(resolve, reject) {
        let query = `   SELECT *
                        FROM tkd_broadcast.bc_user_credit a
                        WHERE a.b_status = 1
                            AND DATE_FORMAT(a.dt_expiration, '%Y-%m-%d') < DATE_FORMAT(NOW(), '%Y-%m-%d')`;
        var result:any = await new Promise((resolve, reject)=>{functionGlobal.query(query, res, connection, 'function/broadcast/checkExpired', resolve) })

        if(result.length > 0){
            query = `   UPDATE tkd_broadcast.bc_user_credit a SET
                                a.b_status = 0
                            WHERE a.b_status = 1
                                AND DATE_FORMAT(a.dt_expiration, '%Y-%m-%d') < DATE_FORMAT(NOW(), '%Y-%m-%d')`;
    
            functionGlobal.query(query, res, connection, 'function/broadcast/checkExpired', resolve);
        }
        else resolve(null)
    })
}

export async function getUserByPhone({connection, res, phone}:  typeGlobal.functions & {phone: string}): Promise<typeBroadcastUser.broadcastUser> {
    await checkExpired({
        connection: connection,
        res: res
    });

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            i_code AS 'code',
                            v_phone AS 'phone',
                            v_name AS 'name',
                            v_otp AS 'otp',
                            i_limit AS 'limit',
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_list z
                                JOIN tkd_broadcast.bc_contact y ON y.fk_list = z.v_code AND y.b_status = 1
                                WHERE z.b_status = 1
                                    AND z.fk_user = a.i_code
                            ) AS 'contact',
                            i_max_contact AS 'max_contact',
                            b_get_trial AS 'get_trial',
                            v_referral AS 'referral',
                            b_can_connect AS 'can_connect',
                            dt_created AS 'date_joined'
                        FROM tkd_broadcast.bc_user a
                        WHERE a.b_status = 1
                            AND (
                                a.v_phone = '${phone}'
                                or SHA1(a.v_phone) = '${phone}'
                            )`;

        functionGlobal.querySingle(query, res, connection, 'function/broadcast/getUserByPhone', resolve);
    })
}

export function insertNewUser({connection, res, phone, otp}:  typeGlobal.functions & {phone: string, otp: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_user SET
                            v_phone = '${phone}',
                            v_otp = '${otp}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/insertNewUser', resolve);
    })
}


export function insertNewNumber({connection, res, user, type, maxSend, phone, numberKey, apiKey}:  typeGlobal.functions & {user: string, type: number, maxSend: number, phone: string, numberKey: string, apiKey: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_user_number SET
                            fk_user = ${user},
                            v_api_key = '${apiKey}',
                            v_number_key = '${numberKey}',
                            b_type = ${type},
                            v_number = '${phone}',
                            i_max_send = ${maxSend}`;

        functionGlobal.query(query, res, connection, 'function/broadcast/insertNewNumber', resolve);
    })
}

export function insertNewCredit({connection, res, user_number, credit, expired}:  typeGlobal.functions & {user_number:string, credit:number, expired:number}) {
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_user_credit SET
                            fk_user_number = '${user_number}',
                            i_credit_full = ${credit},
                            dt_expiration = DATE(DATE_ADD(NOW(), INTERVAL ${expired} DAY))`;

        functionGlobal.query(query, res, connection, 'function/broadcast/insertNewCredit', resolve);
    })
}



type checkCredit = {
    sent_today_max: number,
    sent_today: number,
    credit_remain: number
}
export async function checkCredit({res, connection}: typeGlobal.functions,{phone, user_number} : {phone: string, user_number: string}): Promise<checkCredit> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(async (resolve, reject) => {
        let query = `   SELECT 
                            a.i_max_send AS sent_today_max,
                            SUM(IFNULL(c.b_status, 0)) AS sent_today,
                            IFNULL((
                                SELECT SUM(z.i_credit_full - z.i_credit)
                                FROM tkd_broadcast.bc_user_credit z
                                WHERE z.fk_user_number = a.i_code
                                    AND z.b_status = 1
                                    AND DATE(z.dt_expiration) >= DATE(NOW())
                            ), 0) AS credit_remain
                        FROM tkd_broadcast.bc_user_number a
                        JOIN tkd_broadcast.bc_broadcast b ON a.i_code = b.fk_user_number
                        LEFT JOIN tkd_broadcast.bc_broadcast_detail c ON b.v_code = c.fk_broadcast AND c.b_status = 1 AND DATE(c.dt_sent) = DATE(NOW())
                        WHERE a.fk_user = ${user.code}
                            AND a.i_code = ${user_number}`

        functionGlobal.querySingle(query, res, connection, 'function/transaction/broadcast/checkCredit', resolve)
    })
}

type checkCreditMessage = {
    code: number,
    api_key: string,
    number_key: string
}
export async function checkCreditMessage({res, connection}: typeGlobal.functions,{user_number} : {user_number: string}): Promise<checkCreditMessage> {
    return new Promise(async (resolve, reject) => {
        let query = `   SELECT 
                            z.i_code AS code,
                            y.v_api_key AS api_key,
                            y.v_number_key AS number_key
                        FROM tkd_broadcast.bc_user_credit z
                        JOIN tkd_broadcast.bc_user_number y ON z.fk_user_number = y.i_code
                        WHERE z.i_credit < z.i_credit_full
                            AND z.fk_user_number = ${user_number}
                            AND DATE(z.dt_expiration) >= DATE(NOW())
                        ORDER BY z.i_code
                        LIMIT 1`;

        functionGlobal.querySingle(query, res, connection, 'function/transaction/broadcast/checkCreditMessage', resolve)
    })
}

export function messageDone({connection, res,} :  typeGlobal.functions, {user_number, broadcast_detail} : {user_number: string, broadcast_detail: string}) {
    return new Promise(async function(resolve, reject) {
        var query = `   SELECT z.i_code AS code
                        FROM tkd_broadcast.bc_user_credit z
                        WHERE z.i_credit < z.i_credit_full
                            AND z.fk_user_number = ${user_number}
                            AND DATE(z.dt_expiration) >= DATE(NOW())
                        ORDER BY z.dt_expiration
                        LIMIT 1`;

        let creditSelected:any = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/broadcast/messageDone 1', resolve))

        query = `   UPDATE tkd_broadcast.bc_user_credit SET
                        i_credit = i_credit + 1
                    WHERE i_code = ${creditSelected["code"]}`;
        await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/broadcast/messageDone 2', resolve))

        query = `   UPDATE tkd_broadcast.bc_broadcast_detail SET
                        b_status = 1,
                        dt_sent = NOW()
                    WHERE v_code = '${broadcast_detail}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/messageDone 3', resolve);
    })
}

export function messageFail({connection, res}:  typeGlobal.functions, {broadcast, broadcast_detail} : {broadcast: string, broadcast_detail: string}) {
    return new Promise(async function(resolve, reject) {
        var query = `   UPDATE tkd_broadcast.bc_broadcast_detail SET
                            b_status = 3
                        WHERE fk_broadcast = '${broadcast}'
                            AND b_status = 2`;

        functionGlobal.query(query, res, connection, 'function/broadcast/messageFail', resolve);
    })
}


export function messageInvalidNumber({connection, res}:  typeGlobal.functions, {broadcast, broadcast_detail} : {broadcast: string, broadcast_detail: string}) {
    return new Promise(async function(resolve, reject) {
        var query = `   UPDATE tkd_broadcast.bc_broadcast_detail SET
                            b_status = 4
                        WHERE v_code = '${broadcast_detail}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/messageFail', resolve);
    })
}



export function updateUserOtp({connection, res, phone, otp}:  typeGlobal.functions & {phone: string, otp: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_user SET
                            v_otp = '${otp}'
                        WHERE b_status = 1
                            AND v_phone = '${phone}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/updateUserOtp', resolve);
    })
}

export function updateUserToken({connection, res, phone, token}:  typeGlobal.functions & {phone: string, token: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_user SET
                            v_otp = '',
                            v_token = '${token}'
                        WHERE b_status = 1
                            AND v_phone = '${phone}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/updateUserToken', resolve);
    })
}

export function updateUser({connection, res, v_phone, v_name, v_referral}:  typeGlobal.functions & {v_phone: string, v_name: string, v_referral?: string}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_user SET
                            v_name = '${v_name}'
                            ${v_referral ?
                            `,v_referral = '${v_referral}'`
                            : ``}
                        WHERE b_status = 1
                            AND v_phone = '${v_phone}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/updateUser', resolve);
    })
}

export async function getUserPackage<T extends type.responseUserPackage | type.responseUserPackage[]>({connection, res, phone, code='%'}:  typeGlobal.functions & {phone: string, code?:string}): Promise<T> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.i_code AS 'code',
                            a.b_type AS 'type',
                            a.v_number AS 'number',
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_broadcast z
                                LEFT JOIN tkd_broadcast.bc_broadcast_detail y ON y.fk_broadcast =  z.v_code AND DATE(y.dt_sent) = DATE(NOW())
                                WHERE z.fk_user_number =  a.i_code
                                    AND y.b_status = 1
                            ) AS 'today_send',
                            a.i_max_send AS 'max_send',
                            a.v_api_key AS 'api_key',
                            a.v_number_key AS 'number_key',
                            SUM(IFNULL(b.i_credit,0)) AS 'credit',
                            SUM(IFNULL(b.i_credit_full,0)) AS 'credit_full',
                            a.b_connected AS connected_new_api
                        FROM tkd_broadcast.bc_user_number a
                        LEFT JOIN tkd_broadcast.bc_user_credit b ON b.fk_user_number = a.i_code AND b.dt_expiration >= DATE(NOW())
                        WHERE a.fk_user = ${user.code}
                            AND a.b_status = 1
                            AND a.i_code LIKE '${code}'
                        GROUP BY a.i_code`;

        if(code == "%") functionGlobal.query(query, res, connection, 'function/broadcast/getUserPackage', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/broadcast/getUserPackage', resolve);
    })
}

export async function getUserCredit<T extends type.responseUserCredit[]>({connection, res, phone, packagee}:  typeGlobal.functions & {phone: string, packagee: string}) : Promise<T> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.i_credit AS 'credit',
                            a.i_credit_full AS 'credit_full',
                            a.dt_expiration AS 'date_expiration'
                        FROM tkd_broadcast.bc_user_credit a
                        WHERE a.fk_user_number = ${packagee}
                            AND a.b_status = 1
                            AND a.dt_expiration >= DATE(NOW())
                        ORDER BY a.dt_expiration ASC`;

        functionGlobal.query(query, res, connection, 'function/broadcast/getUserCredit', resolve);
    })
}


export async function getTransactionHistory<T extends type.responseUserCredit[]>({connection, res, phone}:  typeGlobal.functions & {phone: string}) : Promise<T> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS 'code',
                            a.v_number AS 'number',
                            a.v_hash AS 'hash',
                            a.b_type AS 'type',
                            a.i_price AS 'price',
                            a.i_value AS 'value',
                            b.v_qr AS 'qr',
                            a.dt_created AS 'date',
                            a.b_status AS 'status'
                        FROM tkd_broadcast.bc_user_package a
                        JOIN dvw_operational.vw_qris b ON a.v_hash = b.v_receipt
                        WHERE a.fk_user = ${user.code}
                            AND a.b_status > 0
                        ORDER BY a.i_code DESC`;

        functionGlobal.query(query, res, connection, 'function/broadcast/getTransactionHistory', resolve);
    })
}


export async function buyPackage({connection, res, phone, hash, number, price, packagee}:  typeGlobal.functions & {phone: string, number: string, hash: string, price:string, packagee: string}) {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    var packageData: typeBroadcastPackage.broadcastPackage = await broadcastPackage.get({
        connection: connection,
        res: res,
        code: packagee
    });

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_user_package SET
                            fk_user = '${user.code}',
                            v_number = '${number}',
                            b_type = '${packageData.type}',
                            i_price = '${price}',
                            i_value = '${packageData.value}',
                            v_hash = '${hash}',
                            i_day = ${packageData.day}`;

        functionGlobal.query(query, res, connection, 'function/broadcast/buyPackage', resolve);
    })
}







export async function getList<T extends typeBroadcastList.broadcastList | typeBroadcastList.broadcastList[]>({connection, res, phone, code="%"}:  typeGlobal.functions & {phone: string, code?: string}):Promise<T> {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });

    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.v_code AS 'code',
                            a.v_name AS 'name',
                            a.v_description AS 'description',
                            a.v_param_1 AS 'param_1',
                            a.v_param_2 AS 'param_2',
                            a.v_param_3 AS 'param_3',
                            a.v_param_4 AS 'param_4',
                            a.v_param_5 AS 'param_5',
                            a.v_param_6 AS 'param_6',
                            a.v_param_7 AS 'param_7',
                            a.v_param_8 AS 'param_8',
                            a.v_param_9 AS 'param_9',
                            a.v_param_10 AS 'param_10',
                            (
                                SELECT COUNT(1)
                                FROM tkd_broadcast.bc_contact z
                                WHERE z.fk_list = a.v_code
                                    AND z.b_status = 1
                            ) AS 'total_contact',
                            a.dt_created AS 'date_created'
                        FROM tkd_broadcast.bc_list a
                        WHERE a.fk_user = ${user.code}
                            AND a.v_code LIKE '${code}'
                            AND a.b_status = 1`;

        if(code=="%") functionGlobal.query(query, res, connection, 'function/broadcast/getList', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/broadcast/getList', resolve);
    })
}

export async function insertList({connection, res, phone, name, description}:  typeGlobal.functions & typeBroadcastList.insert) {
    var user: typeBroadcastUser.broadcastUser = await getUserByPhone({
        connection: connection,
        res: res,
        phone: phone
    });
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_broadcast.bc_list SET
                            v_code = '${hash}',
                            fk_user = '${user.code}',
                            v_name = '${name}',
                            v_description = '${description}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/insertList', resolve, {id: hash});
    })
}


export function updateList({connection, res, code, name, description}:  typeGlobal.functions & {code:string, name: string, description: string}) {

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_list SET
                            v_name = '${name}',
                            v_description = '${description}'
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/updateList', resolve);
    })
}


export function updateListParam({connection, res, code, index, name}:  typeGlobal.functions & {code:string, name: string, index: number}) {

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_list SET
                            v_param_`+ index +` = '${name}'
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/updateListParam', resolve);
    })
}

export function deleteListParam({connection, res, code, index}:  typeGlobal.functions & {code:string, index: number}) {
    var setUpdate = "";
    for(var i=index; i<10; i++){
        setUpdate += `v_param_`+ i +` = v_param_`+ (i+1) + `,` ;
    }
    setUpdate += `v_param_10 = ''`;
    

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_list SET
                            `+ setUpdate +`
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/deleteListParam', resolve);
    })
}


export function deleteList({connection, res, code}:  typeGlobal.functions & {code:string}) {

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_broadcast.bc_list SET
                            b_status = 0
                        WHERE v_code = '${code}'`;

        functionGlobal.query(query, res, connection, 'function/broadcast/deleteList', resolve);
    })
}
