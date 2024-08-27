import pool from '../config/connect';
import * as functionGlobal from './global_function';
import * as typeGlobal from '../type/global'
import * as type from '../type/jvape'
import * as typeNotification from '../type/jvape_notification'

type getVariable = {
    key: string,
    value: string
}
export function getVariable({connection, res}:typeGlobal.functions): Promise<getVariable[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_key AS 'key',
                            a.v_value AS 'value'
                        FROM tkd_jvape.jvp_variable a`;

        functionGlobal.query(query, res, connection, 'function/jvape/getVariable', resolve);
    })
}


type getUser = {
    id: number,
    otp: string,
    name: string,
    email: string,
    address: string,
    date_birth: string,
    phone: string,
    gender: number,
    date_join: string,
    member: number,
    transaction_count?: number,
    transaction_nominal?: number
}
export function getUser({connection, res}:typeGlobal.functions, {phone}:{phone:string}): Promise<getUser> {
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS id,
                            a.v_otp AS otp,
                            a.v_name AS name,
                            a.v_email AS email,
                            a.v_phone AS phone,
                            a.v_address AS address,
                            a.v_birth_date AS date_birth,
                            a.b_gender AS gender,
                            a.b_member AS member,
                            a.dt_created AS date_join
                        FROM tkd_jvape.jvp_user a
                        WHERE a.v_phone LIKE '${phone}'`;

        functionGlobal.querySingle(query, res, connection, 'function/jvape/getUser', resolve);
    })
}
export function getUserById({connection, res}:typeGlobal.functions, {id}:{id:number}): Promise<getUser> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.i_code AS id,
                            a.v_otp AS otp,
                            a.v_name AS name,
                            a.v_email email,
                            a.v_phone AS phone,
                            a.v_address AS address,
                            a.v_birth_date AS date_birth,
                            a.b_gender AS gender,
                            a.b_member AS member,
                            a.dt_created AS date_join
                        FROM tkd_jvape.jvp_user a
                        WHERE a.i_code = ${id}`;

        functionGlobal.querySingle(query, res, connection, 'function/jvape/getUserById', resolve);
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
                            AND e.b_jvape = 1
                            AND a.b_isvoid = 0
                            AND YEAR(a.dt_paid) = YEAR(NOW())
                            AND (
                                d.v_phone = '0${phone}'
                                OR d.v_phone = '62${phone}'
                                OR d.v_phone = '+62${phone}'
                            ) `;

        functionGlobal.querySingle(query, res, connection, 'function/jvape/getTransactionYearly', resolve);
    })
}


export function insertNewUser({connection, res}:typeGlobal.functions, {phone, otp}:{phone:string, otp:string}){
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_jvape.jvp_user SET
                            v_phone = '${phone}',
                            v_otp = '${otp}'`;

        functionGlobal.query(query, res, connection, 'function/jvape/insertNewUser', resolve);
    })
}

export function updateUserOtp({connection, res}:  typeGlobal.functions, {phone, otp}:{phone:string, otp:string}) {
    if (phone.indexOf('0') === 0) phone = "62" + phone.substring(1)
    else if (phone.indexOf('+') === 0) phone = phone.substring(1)

    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_jvape.jvp_user SET
                            v_otp = '${otp}'
                        WHERE v_phone = '${phone}'`;

        functionGlobal.query(query, res, connection, 'function/jvape/updateUserOtp', resolve);
    })
}

export function updateProfile({connection, res}:  typeGlobal.functions, data:{id:number, name:string, email:string, address:string, date_birth:string, gender:number}) {
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_jvape.jvp_user SET
                            v_name = '${data.name}',
                            v_email = '${data.email}',
                            v_address = '${data.address}',
                            v_birth_date = '${data.date_birth}',
                            b_gender = ${data.gender}
                        WHERE i_code = ${data.id}`;

        functionGlobal.query(query, res, connection, 'function/jvape/updateProfile', resolve);
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
                        FROM tkd_jvape.jvp_point_movement a
                        WHERE a.fk_user = ${id_user}
                            AND i_value_left > 0
                            AND DATE(dt_expired) > DATE(NOW())
                        ORDER BY dt_created ${order}`;

        functionGlobal.query(query, res, connection, 'function/jvape/getPointsActive', resolve);
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
                            a.dt_created AS date,
                            a.b_type AS type,
                            a.fk_source AS source,
                            (a.i_value) AS value,
                            IFNULL(b.v_name, '') AS store_name
                        FROM tkd_jvape.jvp_point_movement a
                        LEFT JOIN dvw_account.vw_business b ON b.i_code = a.fk_store
                        WHERE a.fk_user = ${data.id_user}
                        ORDER BY a.dt_created DESC`;

        functionGlobal.query(query, res, connection, 'function/jvape/getPointsStatement', resolve);
    })
}


type getUserVoucher = {
    date: string,
    type: string,
    source: string,
    value: number,
    store_name: string
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
                        FROM tkd_jvape.jvp_user_voucher a
                        JOIN tkd_jvape.jvp_voucher b ON b.v_code = a.fk_voucher
                        WHERE a.fk_user = ${data.id_user}`;

        functionGlobal.query(query, res, connection, 'function/jvape/getUserVoucher', resolve);
    })
}





type getNotification = {
    code: string,
    type: number,
    title: string,
    notification: string,
    date: string,
}
export function getNotification({connection, res}:  typeGlobal.functions): Promise<getNotification[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_code AS 'code',
                            a.b_type AS 'type',
                            a.v_title AS 'title',
                            a.v_notification AS 'notification',
                            a.dt_created AS 'date'
                        FROM tkd_jvape.jvp_notification a
                        WHERE a.b_status = 1`;

        functionGlobal.query(query, res, connection, 'function/jvape/getNotification', resolve);
    })
}


type getStore = {
    code: string,
    name: string,
    address: string,
    city: string,
    phone: string,
    latitude: string,
    longitude: string,
    sunday: string,
    monday: string,
    tuesday: string,
    wednesday: string,
    thursday: string,
    friday: string,
    saturday: string,
    banner: string,
}
export function getStore({connection, res} :  typeGlobal.functions ): Promise<getStore[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            SHA1(a.i_code) AS 'code',
                            a.v_name AS 'name',
                            a.v_address AS 'address',
                            a.v_city AS 'city',
                            a.v_phone AS 'phone',
                            IFNULL(a.v_latitude, '-6.189969278616248') AS 'latitude',
                            IFNULL(a.v_longitude, '106.82433322443394') AS 'longitude',
                            IFNULL(c.v_sunday, '-') AS 'sunday',
                            IFNULL(c.v_monday, '-') AS 'monday',
                            IFNULL(c.v_tuesday, '-') AS 'tuesday',
                            IFNULL(c.v_wednesday, '-') AS 'wednesday',
                            IFNULL(c.v_thursday, '-') AS 'thursday',
                            IFNULL(c.v_friday, '-') AS 'friday',
                            IFNULL(c.v_saturday, '-') AS 'saturday',
                            IFNULL(c.v_banner, '') AS 'banner'
                        FROM dvw_account.vw_business a
                        JOIN dvw_setting.vw_other b ON a.i_code = b.fk_business
                        LEFT JOIN dvw_setting.vw_online c ON a.i_code = c.fk_business
                        WHERE a.b_isactive = 1
                            AND b.b_jvape = 1
                            AND a.i_code <> 57
                        ORDER BY a.v_name `;

        functionGlobal.query(query, res, connection, 'function/jvape/getStore', resolve);
    })
}


type getProduct = {
    name: string,
    sku: string,
    photo: string,
    category: number,
    price: number,
    qty: number,
}
export function getProduct({connection, res, data} :  typeGlobal.functions & {data: type.getStore} ): Promise<getProduct[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_code AS 'sku',
                            a.v_image AS 'photo',
                            b.v_name AS 'category',
                            a.i_price AS 'price',
                            a.i_qty AS 'qty'
                        FROM dvw_master.vw_item a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        WHERE a.b_isactive = 1
                            AND SHA1(a.fk_business) = '${data.store}'
                        ORDER BY a.v_name `;

        functionGlobal.query(query, res, connection, 'function/jvape/getProduct', resolve);
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
                        FROM tkd_jvape.jvp_banner a
                        WHERE a.b_status = 1
                        ORDER BY a.i_order `;

        functionGlobal.query(query, res, connection, 'function/jvape/getBanner', resolve);
    })
}


type getProductByKeyword = {
    name: string,
    sku: string,
    photo: string,
    category: string,
    price: string,
    qty: string,
    store_code: string,
    store_name: string,
    store_latitude: string,
    store_longitude: string,
    store_city: string,
    store_sunday: string,
    store_monday: string,
    store_tuesday: string,
    store_wednesday: string,
    store_thursday: string,
    store_friday: string,
    store_saturday: string,
}
export function getProductByKeyword({connection, res, data} :  typeGlobal.functions & {data: {keyword: string} } ): Promise<getProductByKeyword[]> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_code AS 'sku',
                            a.v_image AS 'photo',
                            b.v_name AS 'category',
                            a.i_price AS 'price',
                            a.i_qty AS 'qty',
                            SHA1(c.i_code) AS 'store_code',
                            c.v_name AS 'store_name',
                            IFNULL(c.v_latitude, '-6.189969278616248') AS 'store_latitude',
                            IFNULL(c.v_longitude, '106.82433322443394') AS 'store_longitude',
                            c.v_city AS 'store_city',
                            IFNULL(d.v_sunday, '-') AS 'store_sunday',
                            IFNULL(d.v_monday, '-') AS 'store_monday',
                            IFNULL(d.v_tuesday, '-') AS 'store_tuesday',
                            IFNULL(d.v_wednesday, '-') AS 'store_wednesday',
                            IFNULL(d.v_thursday, '-') AS 'store_thursday',
                            IFNULL(d.v_friday, '-') AS 'store_friday',
                            IFNULL(d.v_saturday, '-') AS 'store_saturday'
                        FROM dvw_master.vw_item a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        LEFT JOIN dvw_setting.vw_online d ON a.fk_business = d.fk_business
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND e.b_jvape = 1
                            AND a.v_name LIKE '%${data.keyword}%'
                        ORDER BY a.v_name `;

        functionGlobal.query(query, res, connection, 'function/jvape/getProductByKeyword', resolve);
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
                        FROM tkd_jvape.jvp_voucher a
                        WHERE a.b_status = 1
                            AND a.v_code LIKE '${code}'
                        ORDER BY a.dt_created DESC `;

        if(code=="%") functionGlobal.query(query, res, connection, 'function/jvape/getVoucher', resolve);
        else functionGlobal.querySingle(query, res, connection, 'function/jvape/getVoucher', resolve);
    })
}

export async function buyVoucher({connection, res}:typeGlobal.functions, {user, voucher}:{user:getUser, voucher:getVoucher} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_jvape.jvp_user_voucher SET
                            v_code = '${hash}',
                            fk_user = '${user.id}',
                            fk_voucher = '${voucher.code}',
                            dt_expired = DATE_ADD(NOW(),INTERVAL 2 DAY)`;

        functionGlobal.query(query, res, connection, 'function/jvape/buyVoucher', resolve, {id: hash});
    })
}

export async function minusPoint({connection, res}:typeGlobal.functions, {user, value, type, source, source_point}:{user:getUser, value:number, type:number, source:string, source_point:string} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_jvape.jvp_point_movement SET
                            v_code = '${hash}',
                            fk_source = '${source}',
                            fk_point_source = '${source_point}',
                            fk_user = '${user.id}',
                            i_value = ${value},
                            b_type = ${type}`;

        functionGlobal.query(query, res, connection, 'function/jvape/minusPoint', resolve, {id: hash});
    })
}

export async function updatePoint({connection, res}:typeGlobal.functions, {user, value_left, source_point}:{user:getUser, value_left:number, source_point:string} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)
    return new Promise(function(resolve, reject) {
        let query = `   UPDATE tkd_jvape.jvp_point_movement SET
                            i_value_left = ${value_left}
                        WHERE v_code = '${source_point}'`;

        functionGlobal.query(query, res, connection, 'function/jvape/updatePoint', resolve, {id: hash});
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
                        FROM tkd_jvape.jvp_point_movement a
                        WHERE a.fk_source = '${receipt}' `;

        functionGlobal.querySingle(query, res, connection, 'function/jvape/checkPointUsed', resolve);
    })
}


type pointDetail = {
    store: number,
    point: number,
    phone: string
}
export function pointDetail({connection, res}:typeGlobal.functions, {receipt}:{receipt:string} ): Promise<pointDetail> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            a.fk_business AS store,
                            FLOOR(a.i_totalnet / 10000) AS point,
                            b.v_phone AS phone
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                        JOIN dvw_setting.vw_other c ON a.fk_business = c.fk_business AND c.b_jvape = 1
                        WHERE a.s_offlinecode = '${receipt}'
                            AND a.b_isvoid = 0 `;

        functionGlobal.querySingle(query, res, connection, 'function/jvape/pointDetail', resolve);
    })
}


export function redeemPoint({connection, res}:typeGlobal.functions, {receipt, user, store, point}:{receipt:string, user:number, store:number, point:number} ) {
    var hash = Date.now().toString(36) + Math.random().toString(36)

    return new Promise(function(resolve, reject) {
        let query = `   INSERT INTO tkd_jvape.jvp_point_movement SET
                            v_code = '${hash}', 
                            fk_source = '${receipt}', 
                            fk_user = '${user}', 
                            fk_store = ${store}, 
                            i_value = ${point}, 
                            i_value_left = ${point},
                            dt_expired = CONCAT(YEAR(NOW()) + 1, '-01-01 00:00:00'),
                            b_type = 1 `;

        functionGlobal.query(query, res, connection, 'function/jvape/redeemPoint', resolve, {id: hash});
    })
}
//=====================================================================



//TRANSACTION=====================================================================
type getHistory = {
    receipt: string,
    date: string,
    store: number,
    void_status: number,
    subtotal: number,
    discount: number,
    total: number,
    order_type: number
}
export function getHistory({connection, res, phone, start = 0, limit = 100} :  typeGlobal.functions & {phone: string, start?: number, limit?: number} ): Promise<getHistory[]> {
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
                            a.s_offlinecode AS receipt,
                            a.dt_paid AS date,
                            c.v_name AS store,
                            a.b_isvoid AS void_status,
                            a.i_total AS subtotal,
                            IFNULL(a.i_totalpromotion,0) AS discount,
                            a.i_totalnet AS total,
                            CASE
                                WHEN IFNULL(b.fk_transaction, 0) = 0 THEN 'on-site'
                                ELSE 'online'
                            END AS order_type
                        FROM dvw_transaction.vw_transaction a
                        LEFT JOIN dvw_transaction.vw_transaction_online b ON a.i_code = b.fk_transaction
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        JOIN dvw_master.vw_customer d ON a.fk_customer = d.i_code
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND e.b_jvape = 1
                            AND (
                                d.v_phone = '0${phone}'
                                OR d.v_phone = '62${phone}'
                                OR d.v_phone = '+62${phone}'
                            )
                        ORDER BY a.dt_paid DESC
                        LIMIT ${start},${limit} `;

        functionGlobal.query(query, res, connection, 'function/jvape/getHistory', resolve);
    })
}
//=====================================================================