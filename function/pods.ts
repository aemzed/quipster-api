import pool from '../config/connect';
import * as functionGlobal from './global_function';
import * as typeGlobal from '../type/global'

type getUser = {
    id: number,
    refferal_code: string,
    refferal_from: string,
    otp: string,
    name: string,
    email: string,
    address: string,
    date_birth: string,
    phone: string,
    gender: number,
    date_join: string,
    transaction_count?: number,
    transaction_nominal?: number
}
export function getUser({connection, res}:typeGlobal.functions, {phone}:{phone:string}): Promise<getUser> {
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.id,
                            a.refferal_code,
                            a.refferal_from,
                            a.otp,
                            a.name,
                            a.email,
                            a.phone,
                            a.address,
                            a.birth_date AS date_birth,
                            a.gender,
                            a.created_at AS date_join
                        FROM tkd_relx.rlx_users a
                        WHERE a.phone LIKE '${phone}'`;

        functionGlobal.querySingle(query, res, connection, 'function/pods/getUser', resolve);
    })
}

export function getMember({connection, res}: typeGlobal.functions) {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        id,
                        refferal_code,
                        refferal_from,
                        refferal_point_get,
                        refferal_point_give,
                        otp,
                        name,
                        email,
                        phone,
                        address,
                        birth_date AS date_birth,
                        gender,
                        created_at AS date_join
                    FROM tkd_relx.rlx_users
                    WHERE name <> ''
                    `
        functionGlobal.query(query, res, connection, 'function/pods/getMember', resolve)
    })
}

export function updateRefferalCode({connection, res}: typeGlobal.functions, {id, refferal_code}: {id: number, refferal_code: string}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE
                        tkd_relx.rlx_users
                    SET
                        refferal_code = '${refferal_code}'
                    WHERE
                        id = ${id}
                    `
        functionGlobal.query(query, res, connection, 'function/pods/updateReferralCode', resolve)
    })
}

export function updateRefferalFromByRefferalCode({connection, res}: typeGlobal.functions, {refferal_from_before, refferal_from_after}: {refferal_from_before: string, refferal_from_after: string}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE
                        tkd_relx.rlx_users
                    SET
                        refferal_from = '${refferal_from_after}'
                    WHERE
                        refferal_from = '${refferal_from_before}'
                    `
        
        functionGlobal.query(query, res, connection, 'function/pods/updateRefferalCodeFromByRefferalCode', resolve)
    })
}

export function updateRefferalPoint({connection, res}: typeGlobal.functions, {id, refferal_point_get, refferal_point_give}: {id: number, refferal_point_get?: number, refferal_point_give?: number}) {
    return new Promise((resolve, reject) => {
        let query = `
                    UPDATE
                        tkd_relx.rlx_users
                    SET
                        ${refferal_point_get !== undefined ?
                        `refferal_point_get = '${refferal_point_get}',`
                        : ``}
                        ${refferal_point_give !== undefined ?
                        `refferal_point_give = '${refferal_point_give}',`
                        : ``}
                        id = id
                    WHERE
                        id = ${id}`
        functionGlobal.query(query, res, connection, 'function/pods/updateRefferalPoint', resolve)
    })
}

export function getUserById({connection, res}:typeGlobal.functions, {id}:{id:number}): Promise<getUser> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.id,
                            a.refferal_code,
                            a.refferal_from,
                            a.otp,
                            a.name,
                            a.email,
                            a.phone,
                            a.address,
                            a.birth_date AS date_birth,
                            a.gender,
                            a.created_at AS date_join
                        FROM tkd_relx.rlx_users a
                        WHERE a.id = ${id}`;

        functionGlobal.querySingle(query, res, connection, 'function/pods/getUserById', resolve);
    })
}


type getTransactionYearly = {
    transaction_count: number,
    transaction_nominal: number
}
export function getTransactionYearly({connection, res}:typeGlobal.functions, {phone}:{phone:string}): Promise<getTransactionYearly> {
    phone = phone.replace(" ", "");
    phone = phone.replace("-", "");
    
    var prefix = '0';
    if (phone.substring(0, prefix.length) == prefix) phone = phone.substring(prefix.length);
    
    prefix = '62';
    if (phone.substring(0, prefix.length) == prefix) phone = phone.substring(prefix.length);
    
    prefix = '+62';
    if (phone.substring(0, prefix.length) == prefix) phone = phone.substring(prefix.length);

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            COUNT(1) AS transaction_count,
                            IFNULL(SUM(a.i_totalnet),0) AS transaction_nominal
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        JOIN dvw_master.vw_customer d ON a.fk_customer = d.i_code
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND e.b_relx = 1
                            AND a.b_isvoid = 0
                            AND YEAR(a.dt_paid) = YEAR(NOW())
                            AND (
                                d.v_phone = '0${phone}'
                                OR d.v_phone = '62${phone}'
                                OR d.v_phone = '+62${phone}'
                            ) `;

        functionGlobal.querySingle(query, res, connection, 'function/pods/getTransactionYearly', resolve);
    })
}


export function insertNewUser({connection, res}:typeGlobal.functions, {phone, otp}:{phone:string, otp:string}){
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_relx.rlx_users SET
                            phone = '${phone}',
                            otp = '${otp}'`;

        functionGlobal.query(query, res, connection, 'function/pods/insertNewUser', resolve);
    })
}

export function updateUserOtp({connection, res}:  typeGlobal.functions, {phone, otp}:{phone:string, otp:string}) {
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_relx.rlx_users SET
                            otp = '${otp}'
                        WHERE phone = '${phone}'`;

        functionGlobal.query(query, res, connection, 'function/pods/updateUserOtp', resolve);
    })
}

export function updateProfile({connection, res}:  typeGlobal.functions, data:{id:number, name:string, email:string, address:string, date_birth:string, gender:number}) {

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_relx.rlx_users SET
                            name = '${data.name}',
                            email = '${data.email}',
                            address = '${data.address}',
                            birth_date = ${data.date_birth ? `'${data.date_birth}'` : null},
                            gender = ${data.gender ? `'${data.gender}'` : null}
                        WHERE id = ${data.id}`;

        functionGlobal.query(query, res, connection, 'function/pods/updateProfile', resolve);
    })
}

export function updateRefferal({connection, res}:  typeGlobal.functions, data:{id:number, refferal:string}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_relx.rlx_users SET
                            refferal_from = '${data.refferal}'
                        WHERE id = ${data.id}`;

        functionGlobal.query(query, res, connection, 'function/pods/updateRefferal', resolve);
    })
}

type checkRefferal = {
    code: string
}
export function checkRefferal({connection, res}:  typeGlobal.functions, {refferal}:{refferal:string}):Promise<checkRefferal> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            id AS code
                        FROM tkd_relx.rlx_users a
                        WHERE a.refferal_code = '${refferal}'`;

        functionGlobal.querySingle(query, res, connection, 'function/pods/checkRefferal', resolve);
    })
}

type getRefferalUser = {
    code: string,
    name: string,
    phone: string,
    date_join: string
}
export function getRefferalUser({connection, res}:  typeGlobal.functions, {id}:{id:number}):Promise<getRefferalUser[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            b.id AS code,
                            b.name AS name,
                            b.phone AS phone,
                            b.created_at AS date_join
                        FROM tkd_relx.rlx_users a
                        JOIN tkd_relx.rlx_users b ON b.refferal_from = a.refferal_code
                        WHERE a.id = ${id}`;

        functionGlobal.query(query, res, connection, 'function/pods/getRefferalUser', resolve);
    })
}

type getPointsActive = {
    code: string,
    store_code: string,
    value: number,
    value_left: number,
    type: number,
    date_expired: string,
    date_created: string,
    point_source: string,
}
export function getPointsActive({connection, res}:  typeGlobal.functions, {id_user, order="DESC"}:{id_user:number, order?:string}):Promise<getPointsActive[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            v_code AS code,
                            fk_store AS store_code,
                            i_value AS value,
                            i_value_left AS value_left,
                            b_type AS type,
                            dt_expired AS date_expired,
                            dt_created AS date_created,
                            fk_point_source AS point_source
                        FROM tkd_relx.rlx_point_movement a
                        WHERE a.fk_user = ${id_user}
                            AND i_value_left > 0
                            AND DATE(dt_expired) > DATE(NOW())
                        ORDER BY dt_created ${order}`;

        functionGlobal.query(query, res, connection, 'function/pods/getPointsActive', resolve);
    })
}


type getPointsStatement = {
    date: string,
    type: string,
    source: string,
    value: number,
    store_name: string
}
export function getPointsStatement({connection, res}:  typeGlobal.functions, data:{id_user:number}):Promise<getPointsStatement[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            MAX(a.dt_created) AS date,
                            a.b_type AS type,
                            a.fk_source AS source,
                            SUM(a.i_value) AS value,
                            IFNULL(b.v_name, '') AS store_name
                        FROM tkd_relx.rlx_point_movement a
                        LEFT JOIN dvw_account.vw_business b ON b.i_code = a.fk_store
                        WHERE a.fk_user = ${data.id_user}
                        GROUP BY a.b_type, a.dt_expired, a.fk_source
                        ORDER BY a.dt_created DESC`;

        functionGlobal.query(query, res, connection, 'function/pods/getPointsStatement', resolve);
    })
}


type getUserVoucher = {
    code: string,
    date_expired: string,
    date_created: string,
    voucher_name: string,
    voucher_product_name: string,
    voucher_product_sku: string
    status: number,
}
export function getUserVoucher({connection, res}:  typeGlobal.functions, data:{id_user:number}):Promise<getUserVoucher[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT 
                            a.v_code AS code,
                            a.dt_expired AS date_expired,
                            a.dt_created AS date_created,
                            a.b_status AS status,
                            b.v_name AS voucher_name,
                            b.v_product_sku AS voucher_product_name,
                            b.v_product_name AS voucher_product_sku
                        FROM tkd_relx.rlx_user_voucher a
                        JOIN tkd_relx.rlx_voucher b ON b.v_code = a.fk_voucher
                        WHERE a.fk_user = ${data.id_user}`;

        functionGlobal.query(query, res, connection, 'function/pods/getUserVoucher', resolve);
    })
}





type getNotification = {
    code: string,
    read: number,
    title: string,
    notification: string,
    date: string,
}
export function getNotification({connection, res}:  typeGlobal.functions, data:{id_user:number}): Promise<getNotification[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            b.v_code AS 'code',
                            a.b_read AS 'read',
                            b.v_title AS 'title',
                            b.v_notification AS 'notification',
                            b.dt_created AS 'date'
                        FROM tkd_relx.rlx_notification_users a
                        JOIN tkd_relx.rlx_notification b ON b.v_code = a.fk_notification
                        WHERE a.b_status = 1
                            AND a.fk_user = ${data.id_user}
                        ORDER BY b.dt_created DESC`;

        functionGlobal.query(query, res, connection, 'function/pods/getNotification', resolve);
    })
}


type getBanner = {
    name: string,
    banner: string
}
export function getBanner({connection, res} :  typeGlobal.functions ): Promise<getBanner[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_banner AS 'banner'
                        FROM tkd_relx.rlx_banner a
                        WHERE a.b_status = 1
                        ORDER BY a.i_order, a.dt_created `;

        functionGlobal.query(query, res, connection, 'function/pods/getBanner', resolve);
    })
}




//VOUCHER=====================================================================
export type getVoucher = {
    code: string,
    name: string,
    product_sku: string,
    price: number,
    price_sale: number,
    date_start_sale: string,
    date_end_sale: string,
}
export function getVoucher<t extends getVoucher | getVoucher[]>({connection, res}:typeGlobal.functions, {code="%"}:{code?:string} ): Promise<t> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_code AS code,
                            a.v_name AS name,
                            a.v_product_sku AS product_sku,
                            a.v_product_name AS product_name,
                            a.i_point AS price,
                            a.i_point_sale AS price_sale,
                            a.dt_start_sale AS date_start_sale,
                            a.dt_end_sale AS date_end_sale
                        FROM tkd_relx.rlx_voucher a
                        WHERE a.b_status = 1
                            AND a.v_code LIKE '${code}'
                        ORDER BY a.dt_created DESC `;

        if(code=="%") functionGlobal.query(query, res, connection, 'function/pods/getVoucher', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/pods/getVoucher', resolve);
    })
}

export async function buyVoucher({connection, res}:typeGlobal.functions, {user, voucher}:{user:getUser, voucher:getVoucher} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_relx.rlx_user_voucher SET
                            v_code = '${hash}',
                            fk_user = '${user.id}',
                            fk_voucher = '${voucher.code}',
                            dt_expired = DATE_ADD(NOW(),INTERVAL 2 DAY)`;

        functionGlobal.query(query, res, connection, 'function/pods/buyVoucher', resolve, {id: hash});
    })
}

export async function minusPoint({connection, res}:typeGlobal.functions, {user, value, type, source, source_point}:{user:getUser, value:number, type:number, source:string, source_point:string} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_relx.rlx_point_movement SET
                            v_code = '${hash}',
                            fk_source = '${source}',
                            fk_point_source = '${source_point}',
                            fk_user = '${user.id}',
                            i_value = ${value},
                            b_type = ${type}`;

        functionGlobal.query(query, res, connection, 'function/pods/minusPoint', resolve, {id: hash});
    })
}

export async function updatePoint({connection, res}:typeGlobal.functions, {user, value_left, source_point}:{user:getUser, value_left:number, source_point:string} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_relx.rlx_point_movement SET
                            i_value_left = ${value_left}
                        WHERE v_code = '${source_point}'`;

        functionGlobal.query(query, res, connection, 'function/pods/updatePoint', resolve, {id: hash});
    })
}
//=====================================================================


//POINT ==============================================================
type checkPointUsed = {
    count: number
}
export function checkPointUsed({connection, res}:typeGlobal.functions, {receipt}:{receipt:string} ): Promise<checkPointUsed> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            COUNT(1) AS count
                        FROM tkd_relx.rlx_point_movement a
                        WHERE a.fk_source = '${receipt}' `;

        functionGlobal.querySingle(query, res, connection, 'function/pods/checkPointUsed', resolve);
    })
}


type pointDetail = {
    store: number,
    point: number,
    phone: string,
    contain_package: number
}
export function pointDetail({connection, res}:typeGlobal.functions, {receipt}:{receipt:string} ): Promise<pointDetail> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.fk_business AS store,
                            FLOOR(a.i_totalnet / 10000) AS point,
                            b.v_phone AS phone,
                            (
                                SELECT COUNT(1)
                               FROM dvw_transaction.vw_transactiondetail z
                               WHERE z.b_isactive = 1
                                   AND z.b_isvoid = 0
                                   AND z.b_type = 2
                                   AND z.fk_transaction = a.i_code
                           ) AS contain_package
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                        JOIN dvw_setting.vw_other c ON a.fk_business = c.fk_business AND c.b_relx = 1
                        WHERE a.s_offlinecode = '${receipt}'
                            AND a.b_isvoid = 0 `;

        functionGlobal.querySingle(query, res, connection, 'function/pods/pointDetail', resolve);
    })
}


export function redeemPoint({connection, res}:typeGlobal.functions, {receipt, user, store, point}:{receipt:string, user:number, store:number, point:number} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_relx.rlx_point_movement SET
                            v_code = '${hash}', 
                            fk_source = '${receipt}', 
                            fk_user = '${user}', 
                            fk_store = ${store}, 
                            i_value = ${point}, 
                            i_value_left = ${point},
                            dt_expired = CONCAT(YEAR(NOW()) + 1, '-01-01 00:00:00'),
                            b_type = 1 `;

        functionGlobal.query(query, res, connection, 'function/pods/redeemPoint', resolve, {id: hash});
    })
}

type getRefferalCode = {
    refferal_code: string
}
export function getRefferalCode({connection, res}: typeGlobal.functions, {id}: {id: number}): Promise<getRefferalCode> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        refferal_code
                    FROM
                        tkd_relx.rlx_users
                    WHERE
                        id = ${id}
                    `
        functionGlobal.querySingle(query, res, connection, 'function/pods/getReferralCode', resolve)
    })
}

export function getSimilarRefferalCode({res, connection}: typeGlobal.functions, {refferal_code}: {refferal_code: string}) {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        id
                    FROM
                        tkd_relx.rlx_users
                    WHERE
                        refferal_code = '${refferal_code}'
                    `
        functionGlobal.query(query, res, connection, 'function/pods/getSimilarRefferalCode', resolve)
    })
}
//=====================================================================