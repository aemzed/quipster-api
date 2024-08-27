import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"
import { executeQuery } from "../../util/mysql"
import moment from "moment"

type getOfflinecode = {
    offlinecode: string,
    fk_business: number
}

export async function insert(
    {res, connection}: typeGlobal.functions,
    {
        offlinecode, fk_business, fk_customer, fk_salestype, code, ordernumber,
        createdby, dt_created, guest, email, issplit
    }   : {
            offlinecode: string, fk_business: number, fk_customer: number,
            fk_salestype: number, code?: string, ordernumber: number, createdby: string,
            dt_created: string, guest: string, email?: string, issplit?: number
        }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_transaction.vw_cart (s_offlinecode, fk_business, fk_customer, fk_salestype, ${code ? 'v_code, ' : ''}i_ordernumber, v_createdby, dt_created, v_guest, ${email ? 'v_email, ' : '' }b_issplit)
                    VALUES ('${offlinecode}', ${fk_business}, ${fk_customer}, ${fk_salestype}, ${code ? `'${code}', ` : ''}${ordernumber}, '${createdby}', '${dt_created}', '${guest}', ${email ? `'${email}', ` : ''}${issplit ?? 0})`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/insert', resolve)
    })
}

export async function update(
    {res, connection} : typeGlobal.functions,
    {
        total, totalpromotion, vatnominal, scnominal, totalnet, code
    }   : {
            total: number, totalpromotion: number, vatnominal: number, scnominal: number,
            totalnet: number, code: number
        }
) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_cart SET
                        i_total = ${total},
                        i_totalpromotion = ${totalpromotion},
                        i_vatnominal = ${vatnominal},
                        i_scnominal = ${scnominal},
                        i_totalnet = ${totalnet}
                    WHERE i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/update', resolve)
    })
}

export async function getOfflinecode ({res, connection}: typeGlobal.functions, {offlinecode, fk_business}: {offlinecode: string, fk_business: number}): Promise<Array<getOfflinecode>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT a.s_offlinecode
                    FROM dvw_transaction.vw_cart a
                    WHERE a.s_offlinecode = '${offlinecode}'
                        AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/getOfflinecode', resolve)
    })
}

export async function setInactiveByOfflinecodeBusiness({res, connection}: typeGlobal.functions, {fk_business, offlinecode}: {fk_business: number, offlinecode: string}) {
    return new Promise((resolve, reject) => {
        let query  = `UPDATE dvw_transaction.vw_cart SET 
                        b_isactive = 0
                    WHERE s_offlinecode = '${offlinecode}'
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/setInactiveByOfflinecodeBusiness', resolve)
    })
}
export async function setInactive({res, connection}:typeGlobal.functions, {fk_business}: {fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_cart a SET
                        a.b_isactive = 0
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.s_offlinecode IN (
                            SELECT z.s_offlinecode
                            FROM dvw_transaction.vw_transaction z
                            WHERE z.s_offlinecode = a.s_offlinecode
                                AND z.fk_business = ${fk_business}
                        )`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/update', resolve)
    })
}

type getCart = {
    ordercode: any,
    ordernumber: any,
    offlinecode: any,
    customcode: any,
    customercode: any,
    customername: any,
    guest: any,
    orderbusiness: any,
    orderserver: any,
    orderdate: any,
    total: any,
    tax: any,
    sc: any,
    promotion: any,
    totalnet: any,
    changes: any,
    void: any,
    voidreason: any,
    salestypecode: any,
    salestype: any,
    created: any,
    split: any
}
export function getCart({res, connection}: typeGlobal.functions, {fk_business, createdby, online}: {fk_business: number, createdby?: string, online?: string}): Promise<Array<getCart>> {
    return new Promise(async (resolve, reject) => {
        let query = `SELECT
                        ordercode,
                        ordernumber,
                        offlinecode,
                        customcode,
                        customercode,
                        customername,
                        guest,
                        orderbusiness,
                        orderserver,
                        orderdate,
                        total,
                        tax,
                        sc,
                        promotion,
                        totalnet,
                        changes,
                        void,
                        voidreason,
                        salestypecode,
                        salestype,
                        created,
                        split
                    FROM
                    (
                        SELECT
                            a.i_code AS ordercode,
                            a.i_ordernumber AS ordernumber,
                            a.s_offlinecode AS offlinecode,
                            a.v_code AS customcode,
                            IFNULL(b.i_code, 0) AS customercode,
                            IFNULL(b.v_name, '') AS customername,
                            IFNULL(a.v_guest, '') AS guest,
                            a.fk_business AS orderbusiness,
                            a.v_createdby AS orderserver,
                            a.dt_created AS orderdate,
                            a.i_total AS total,
                            a.i_vatnominal AS tax,
                            a.i_scnominal AS sc,
                            a.i_totalpromotion AS promotion,
                            a.i_totalnet AS totalnet,
                            a.i_changes AS changes,
                            a.b_isvoid AS void,
                            a.v_voidreason AS voidreason,
                            a.fk_salestype AS salestypecode,
                            c.v_name AS salestype,
                            a.v_createdby AS created,
                            a.b_issplit AS split,
                            (
                                SELECT COUNT(1)
                                FROM dvw_transaction.vw_cartdetail z
                                WHERE z.fk_cart = a.i_code
                                    AND z.b_isactive = 1
                            ) AS count_detail
                        FROM dvw_transaction.vw_cart a
                        LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                        LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND a.v_createdby LIKE '${createdby}'
                        ORDER BY a.i_code DESC
                        LIMIT 800
                    ) AS TEMP
                    WHERE count_detail > 0
                    ORDER BY orderdate ASC;`
        let queryResult: any = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/transaction/cart/getCart', resolve))
        resolve(queryResult)
    })
} 

type getCartDetail = {
    detail_code: number,
    item_code: number,
    unit_code: number,
    alias: string,
    itemname: string,
    price: number,
    qty: number,
    preference: string,
    isvoid: number,
    ispaid: number,
    void_reason: number,
    ispackage: number,
    category_pph: number,
    isprinted: number,
    category: string,
    category_code: number,
    detail : string
}
export function getCartDetail({res, connection}: typeGlobal.functions, {fk_cart}: {fk_cart: number}): Promise<Array<getCartDetail>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM (
                        SELECT a.i_code AS detail_code, a.fk_item AS item_code, a.fk_unit AS unit_code, b.v_code AS alias,
                            CASE
                                WHEN a.fk_unit = b.fk_unit THEN b.v_name
                                ELSE CONCAT(b.v_name, ' (', e.v_name, ')')
                            END AS "itemname",
                            a.i_price AS price, a.i_qty AS qty, a.v_preference AS preference, a.b_isvoid AS isvoid, a.b_ispaid AS ispaid, a.v_voidreason AS void_reason, 0 AS ispackage,
                            CASE
                                WHEN IFNULL(f.d_pph, 0) = 0 THEN c.d_pph
                                ELSE f.d_pph * f.d_itemservice / 100
                            END AS category_pph,
                            IFNULL(a.b_isprinted, 0) AS isprinted, 
                            c.v_name AS category, c.i_code AS category_code, '' AS "detail" 
                        FROM dvw_transaction.vw_cartdetail a
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                        LEFT JOIN dvw_master.vw_unit e ON a.fk_unit = e.i_code
                        LEFT JOIN dvw_setting.vw_other f ON f.fk_business = a.fk_business
                        WHERE a.b_isactive = 1
                            AND a.b_type = 1
                            AND a.fk_cart = ${fk_cart}
                        UNION ALL
                            SELECT d.i_code AS detail_code, d.fk_item AS itemcode, 0 AS unitcode, e.v_code AS alias, e.v_name AS itemname, d.i_price AS price, d.i_qty AS qty, d.v_preference AS preference,
                            d.b_isvoid AS isvoid, d.b_ispaid AS ispaid, d.v_voidreason AS voidreason, 1 AS ispackage, 0 AS categorypph, IFNULL(d.b_isprinted, 0) AS isprinted, 'Paket' AS category, -1 AS categorycode,
                            (
                                SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                                FROM dvw_master.vw_packagedetail f
                                JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                                WHERE f.fk_package = d.fk_item
                            ) AS "detail"
                        FROM dvw_transaction.vw_cartdetail d
                        JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                        WHERE d.b_isactive = 1
                            AND d.b_type = 2
                            AND d.fk_cart = ${fk_cart}
                    ) AS TEMP
                    ORDER BY TEMP.detail_code;
                    `
        functionGlobal.query(query, res, connection, 'function/transaction/cart/getCartDetail', resolve)
    })
} 

export function getCartDetailAdditional({res, connection}: typeGlobal.functions, {fk_cartdetail}: {fk_cartdetail: number}): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_additional AS additionalcode, 
                        b.v_name AS additionalname,
                        a.i_price AS price,
                        a.i_qty AS qty
                    FROM dvw_transaction.vw_cartadditional a
                    JOIN dvw_master.vw_additional b ON a.fk_additional = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_cartdetail = ${fk_cartdetail}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/getCartDetailAdditional', resolve)
    })
}

export async function getCartDetailPromotion({res, connection}: typeGlobal.functions, {fk_cartdetail}: {fk_cartdetail: number}): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS promotioncode,
                        CASE
                            WHEN b.fk_systempromotion <> 4 THEN b.v_name
                            ELSE CONCAT('Redeem ', FLOOR(a.i_promotionnominal) ,' Point')
                        END AS promotionname,
                        a.i_promotionnominal AS nominal,
                        a.i_promotion AS value,
                        b.fk_systempromotion AS "type",
                        b.i_minimum_spend AS "promotionMinimumSpend",
                        b.i_maximum_promo AS "promotionMaximumPromo"
                    FROM dvw_transaction.vw_cartpromotiondetail a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_cartdetail = ${fk_cartdetail}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/getCartDetailPromotion', resolve)
    })
}

export async function getCartPromotion({res, connection}: typeGlobal.functions, {fk_cart}: {fk_cart: number}): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.fk_promotion AS promotioncode, 
                        b.v_name AS promotionname,
                        a.i_promotion AS promotion,
                        a.i_promotionnominal AS promotionnominal,
                        b.fk_systempromotion AS promotiontypecode,
                        c.v_name AS promotiontypename,
                        b.i_minimum_spend AS "minimum_spend",
                        b.i_maximum_promo AS "maximum_promo"
                    FROM dvw_transaction.vw_cartpromotion a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_system.vw_promotion c ON b.fk_systempromotion = c.i_code AND c.b_isactive=1
                    WHERE a.b_isactive = 1
                        AND a.fk_cart = ${fk_cart}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/getCartPromotion', resolve)
    })
}

export function updateTotalNTotalpromotionNTotalnet({res, connection}: typeGlobal.functions, {i_total, i_totalpromotion, i_totalnet, i_code}: {i_total: number, i_totalpromotion: number, i_totalnet: number, i_code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_transaction.vw_cart SET
                        i_total = ${i_total},
                        i_totalpromotion = ${i_totalpromotion},
                        i_totalnet = ${i_totalnet}
                    WHERE i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/transaction/cart/updateTotalNTotalpromotionNTotalnet', resolve)
    })
}

export function call({res, connection}: typeGlobal.functions) {
    return {
        GET_CART: async function ({fk_business, created}: {fk_business: number, created: string}): Promise<Array<any>> {
            return new Promise((resolve, reject) => {
                let query = `CALL dvw_view.GET_CART(${fk_business}, '${created}')`
                functionGlobal.query(query, res, connection, 'function/transaction/cart/call/GET_CART', resolve)
            })
        },
        GET_CART_DETAIL: async function({ordercode}: {ordercode: string}): Promise<Array<any>> {
            return new Promise((resolve, reject) => {
                let query = `CALL dvw_view.GET_CART_DETAIL(${ordercode})`
                functionGlobal.query(query, res, connection, 'function/transaction/cart/call/GET_CART_DETAIL', resolve)
            })
        },
        GET_CART_DETAIL_ADDITIONAL: async function({detailcode} : {detailcode: string}): Promise<Array<any>> {
            return new Promise((resolve, reject) => {
                let query = `CALL dvw_view.GET_CART_DETAIL_ADDITIONAL(${detailcode})`
                functionGlobal.query(query, res, connection, 'function/transaction/cart/call/GET_CART_DETAIL_ADDITIONAL', resolve)
            })
        },
        GET_CART_DETAIL_PROMOTION: async function({detailcode}: {detailcode: string}): Promise<Array<any>> {
            return new Promise((resolve, reject) => {
                let query = `CALL dvw_view.GET_CART_DETAIL_PROMOTION(${detailcode})`
                functionGlobal.query(query, res, connection, 'function/transaction/cart/call/GET_CART_DETAIL_PROMOTION', resolve)
            })
        },
        GET_CART_PROMOTION: async function({ordercode}: {ordercode: string}): Promise<Array<any>> {
            return new Promise((resolve, reject) => {
                let query = `CALL dvw_view.GET_CART_PROMOTION(${ordercode})`
                functionGlobal.query(query, res, connection, 'function/transaction/cart/call/GET_CART_PROMOTION', resolve)
            })
        }
    }
}

export async function checkOnlineOrderQRISPayment({admin_apiKey, admin_numberKey, admin_phone, customer_phone, cart_business_code, cart_receipt, cart_amount, counter, token}) {
    if (counter > 30) {
        return fetch(`https://api.watzap.id/v1/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                api_key: admin_apiKey,
                number_key: admin_numberKey,
                phone_no: customer_phone,
                message: `Sesi pembayaran untuk kode nota ${cart_receipt} telah berakhir`,
            })
        })
    }
    fetch(`https://api.woogigs.com/v3/qris/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'x-auth-token': token
        },
        body: JSON.stringify({
            receipt: cart_receipt,
            amount: cart_amount
        })
    }).then(response => response.json())
    .then(async (result: any) => {
        if (!result.success || parseFloat(result.data) === 0) {
            setTimeout(() => checkOnlineOrderQRISPayment({admin_apiKey, admin_numberKey, admin_phone, customer_phone, cart_business_code, cart_receipt, cart_amount, counter: counter+1, token}), 3000)
        } else {
            await fetch(`https://api.watzap.id/v1/send_message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    api_key: admin_apiKey,
                    number_key: admin_numberKey,
                    phone_no: customer_phone,
                    message: 'Pembelian telah berhasil dilakukan... Silahkan tunggu pesanan anda.',
                })
            }).then(response => response.json())
            .then(result => console.log(result))

            let resultGetAdminLastResponse = await executeQuery(`
                SELECT
                    i_code as idTemplateChat,
                    v_message as message
                FROM
                    tkd_broadcast.bc_templatechat
                WHERE
                    i_type = -2
                    AND fk_business = ${cart_business_code}
            `)
            await fetch(`https://api.watzap.id/v1/send_message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    api_key: admin_apiKey,
                    number_key: admin_numberKey,
                    phone_no: customer_phone,
                    message: resultGetAdminLastResponse[0].message
                })
            })
            await executeQuery(`
                INSERT INTO
                    tkd_broadcast.bc_logchat
                SET
                    fk_templatechat = ${resultGetAdminLastResponse[0].idTemplateChat},
                    v_phone_admin = '${admin_phone}',
                    v_phone_user = '${customer_phone}',
                    v_message = '${resultGetAdminLastResponse[0].message}',
                    b_from_admin = 1
            `)
        }
    })
}