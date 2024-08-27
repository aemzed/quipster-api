import pool from "../config/connect"
import * as category from '../function/master/category'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as typeCart from "../type/cart"

import * as functionCart from "../function/transaction/cart"
import * as functionCartDetail from "../function/transaction/cartdetail"
import * as functionCartAdditional from "../function/transaction/cartadditional"
import * as functionCartPromotionDetail from "../function/transaction/cartpromotiondetail"
import * as functionCartPromotion from "../function/transaction/cartpromotion"
import * as functionCartPayment from "../function/transaction/cartpayment"
import * as functionWatzap from '../function/watzap'

import * as functionUser from "../function/account/user"
import { Request, Response } from "express"
import { ResultSetHeader } from "mysql2"
import { globalHandler } from "../function/global"
import { executeQuery, startTransaction } from "../util/mysql"
import { User } from "../type/user"
import moment from "moment"
import md5 from "md5"
import qrcode from "qrcode"

export async function saveCart({body: saveCart}: typeCart.saveCart, res: Response) {
    let success = false
    let data: {data: Array<any>} = {data: []}

    if (saveCart.guest === "null") saveCart.guest = ""
    if (saveCart.customername === "null") saveCart.customername = ""
    if (saveCart.email === "null") saveCart.email = ""
    
    let total = 0
    let totalpromotion = 0
    let vatnominal = 0
    let scnominal = 0
    let totalnet = 0

    let paid = false
    let issplit = false

    try {
        pool.getConnection(function (err, connection) {
            connection.beginTransaction(async function () {
                let querytest = `SELECT a.s_offlinecode
                                FROM vw_cart a
                                WHERE a.s_offlinecode = '${saveCart.offlinecode}'
                                    AND a.fk_business = ${parseInt(saveCart.business)}`
                let resGetOfflineCode = await functionCart.getOfflinecode({res, connection}, {offlinecode: saveCart.offlinecode, fk_business: parseFloat(saveCart.business)})
                if (resGetOfflineCode.length > 0) {
                    querytest = `UPDATE vw_cart SET b_isactive = 0
                                WHERE s_offlinecode = '$offlinecode'
                                    AND fk_business = $business`
                    await functionCart.setInactiveByOfflinecodeBusiness({res, connection}, {fk_business: parseInt(saveCart.business), offlinecode: saveCart.offlinecode})
                }
                querytest = `INSERT INTO vw_cart (s_offlinecode, fk_business, fk_customer, fk_salestype, v_code, i_ordernumber, v_createdby, dt_created, v_guest, v_email, b_issplit)
                            VALUES ('${saveCart.offlinecode}', ${saveCart.business}, ${saveCart.customer}, '${saveCart.salestype}', '', '${saveCart.ordernumber}', '${saveCart.server}', '${saveCart.date}', '${saveCart.guest}', '${saveCart.email}', ${saveCart.splitbill})`
                let resCartInsert: ResultSetHeader = await functionCart.insert({res, connection}, {
                    offlinecode: saveCart.offlinecode,
                    fk_business: parseInt(saveCart.business),
                    fk_customer: parseInt(saveCart.customer || "0"),
                    fk_salestype: parseInt(saveCart.salestype),
                    ordernumber: parseInt(saveCart.ordernumber),
                    createdby: saveCart.server,
                    dt_created: saveCart.date,
                    guest: saveCart.guest,
                    email: saveCart.email,
                    issplit: parseInt(saveCart.splitbill)
                })
                
                let items: typeCart.saveCartItem[]
                try {
                    items = (JSON.parse(saveCart.item)['datas'])
                } catch {
                    items = []
                }
                for (let item of items) {
                    let subtotal = 0
                    let subtotalpromotion = 0
                    
                    let itemcode = parseInt(item["code"])
                    let itemprice = parseFloat(item["sellingprice"])
                    let itemqty = parseFloat(item["qty"])
                    let preferences = item["preferences"]

                    let additional: typeCart.saveCartItemAdditional[], promotion: typeCart.saveCartItemPromotion[];
                    try {additional = JSON.parse(item['additional'])} catch {additional = []}
                    try {promotion = JSON.parse(item['promotion'])} catch {promotion = []}

                    let isvoid         = parseInt(item["isvoid"] ?? "0");
					let dtvoid         = (item["dtvoid"] ?? "");
					let voidby         = (item["voidby"] ?? "");
					let voidreason     = (item["voidreason"] ?? "");
					let printed        = parseInt(item["isprinted"] ?? "0");
					let paid           = parseInt(item["ispaid"] ?? "0");
					let type           = parseInt(item["ispackage"] ?? "1");
					let unitcode       = parseInt(item["unit"] ?? "0");

                    type += 1
                    querytest = `INSERT INTO vw_cartdetail (fk_business, fk_cart, fk_item, fk_unit, i_qty, i_price, v_preference, v_createdby, dt_created, b_isvoid, dt_void, v_voidby, b_isprinted, b_type, b_ispaid, v_voidreason)
                                VALUES ($business, $id, $itemcode, $unitcode, $itemqty, $itemprice, $preferences, '$server', '$date', $void, '$dtvoid, '$voidby', :printed, :type, :paid, '$voidreason')`
                    let resCartDetailInsert: ResultSetHeader = await functionCartDetail.insertItem({res, connection}, {
                        fk_business: parseInt(saveCart.business),
                        fk_cart: resCartInsert.insertId,
                        fk_item: itemcode,
                        fk_unit: unitcode,
                        qty: itemqty,
                        price: itemprice,
                        preference: preferences,
                        createdby: saveCart.server,
                        dt_created: saveCart.date,
                        isvoid: isvoid,
                        voidby: voidby,
                        dt_void: dtvoid,
                        isprinted: printed,
                        type: type,
                        ispaid: paid,
                        voidreason: voidreason
                    })

                    if (type === 2) {
                        functionCartDetail.insertPackage({res, connection}, {
                            fk_business: parseInt(saveCart.business),
                            fk_cart: resCartInsert.insertId,
                            fk_package: parseFloat(item.code),
                            qty: itemqty,
                            createdby: saveCart.server,
                            dt_created: saveCart.date,
                            isvoid: isvoid,
                        })
                    }

                    for(let eachAdditional of additional) {
                        let additionalcode = parseInt(eachAdditional["additionalCode"])
                        let additionalprice = parseFloat(eachAdditional["additionalPrice"])
                        let additionalqty = parseFloat(eachAdditional["additionalQty"])

                        if (isvoid === 0) subtotal = subtotal + (additionalprice * additionalqty)
                        let querytest = `INSERT INTO vw_cartadditional (fk_business, fk_cart, fk_cartdetail, fk_additional, i_price, i_qty, v_createdby, dt_created)
                                        VALUES (${parseInt(saveCart.business)}, ${resCartInsert.insertId}, ${resCartDetailInsert.insertId}, ${additionalcode}, ${additionalprice}, ${additionalqty}, '${saveCart.server}', '${saveCart.date}')`
                        await functionCartAdditional.insert({res, connection}, {
                            fk_business: parseInt(saveCart.business),
                            fk_cart: resCartInsert.insertId,
                            fk_cartdetail: resCartDetailInsert.insertId,
                            fk_additional: additionalcode,
                            price: additionalprice,
                            qty: additionalqty,
                            createdby: saveCart.server,
                            dt_created: saveCart.date
                        })
                    }

                    for (let eachPromotion of promotion) {
                        let promotioncode = parseInt(eachPromotion['promotionCode'])
                        let promotionvalue = parseFloat(eachPromotion["promotionValue"])
                        let promotiontype = parseInt(eachPromotion["promotionType"])

                        let discountitem = promotionvalue
                        if (promotiontype === 1) discountitem = itemprice * promotionvalue / 100
                        else if (promotiontype === 3) {
                            promotionvalue = 0
                            discountitem = 0
                        }
                        else if (promotiontype === 4) discountitem = promotionvalue
                        else {
                            if (itemprice < discountitem) {
                                discountitem = itemprice
                                promotionvalue = itemprice
                            }
                        }

                        if (isvoid === 0)
                        subtotalpromotion = subtotalpromotion + discountitem

                        querytest = `INSERT INTO vw_cartpromotiondetail (fk_business, fk_cart, fk_cartdetail, fk_promotion, i_promotion, i_promotionnominal, v_createdby, dt_created)
                                    VALUES (${parseInt(saveCart.business)}, ${resCartInsert.insertId}, ${resCartDetailInsert.insertId}, ${promotioncode}, ${promotionvalue}, ${discountitem}, ${saveCart.server}, ${saveCart.date})`
                        await functionCartPromotionDetail.insert({res, connection}, {
                            fk_business: parseInt(saveCart.business),
                            fk_cart: resCartInsert.insertId,
                            fk_cartdetail: resCartDetailInsert.insertId,
                            fk_promotion: promotioncode,
                            promotion: promotionvalue,
                            promotionnominal: discountitem,
                            createdby: saveCart.server,
                            dt_created: saveCart.date,
                        })
                    }

                    if (isvoid === 0) {
                        subtotal = subtotal + itemprice
                        subtotal = subtotal + itemqty
                        subtotalpromotion = subtotalpromotion * itemqty
                    }
                    else {
                        subtotal = 0
                        subtotalpromotion = 0
                    }
                    total = total + subtotal
                    totalpromotion = totalpromotion + subtotalpromotion
                }

                let discountcart
                if (saveCart.promotion !== "") {
                    let temp = saveCart.promotion.split("~")
                    let cartPromotion = {
                        code: parseInt(temp[0] || "0"),
                        value: parseFloat(temp[1] || "0"),
                        type: parseInt(temp[2] || "0")
                    }
                    discountcart = cartPromotion.value
                    if (cartPromotion.type === 1) discountcart = (total - totalpromotion) * discountcart / 100
                    else if ( (total - totalpromotion) < cartPromotion.value) {
                        discountcart = total - totalpromotion
                        cartPromotion.value = total - totalpromotion
                    }

                    totalpromotion = totalpromotion + discountcart

                    if (discountcart > 0) {
                        let querytest = `INSERT INTO vw_cartpromotion (fk_business, fk_cart, fk_promotion, i_promotion, i_promotionnominal, v_createdby, dt_created)
								        VALUES (${parseInt(saveCart.business)}, ${resCartInsert.insertId}, ${cartPromotion.code}, ${cartPromotion.value}, ${discountcart}, '${saveCart.server}', '${saveCart.date}')`;
                        await functionCartPromotion.insert({res, connection}, {
                            fk_business: parseInt(saveCart.business),
                            fk_cart: resCartInsert.insertId,
                            fk_promotion: cartPromotion.code,
                            promotion: cartPromotion.value,
                            promotionnominal: discountcart,
                            createdby: saveCart.server,
                            dt_created: saveCart.date
                        })
                    }
                }
                
                let totalpaid = 0
                let saveCartPayments: typeCart.saveCartPayment[]
                try {saveCartPayments = JSON.parse(saveCart.payment)} catch {saveCartPayments = []}
                for( let payment of saveCartPayments) {
                    querytest = `INSERT INTO vw_cartpayment (fk_business, fk_cart, fk_paymentmethod, i_paidmoney, v_information)
                                VALUES (${parseInt(saveCart.business)}, ${resCartInsert.insertId}, ${payment.paymentCode}, ${payment.paymentValue}, '${payment.paymentInformation}')`
                    await functionCartPayment.insert({res, connection}, {
                        fk_business: parseInt(saveCart.business),
                        fk_cart: resCartInsert.insertId,
                        fk_paymentmethod: parseInt(payment.paymentCode),
                        paidmoney: parseFloat(payment.paymentValue),
                        information: payment.paymentInformation
                    })
                }

                totalnet = total - totalpromotion
                
                vatnominal = parseFloat(saveCart.tax) * totalnet / 100
                scnominal = parseFloat(saveCart.servicecharge) * totalnet / 100
                totalnet = totalnet + vatnominal + scnominal

                if (totalpaid >= totalnet) paid = true

                querytest = `UPDATE vw_cart SET
                                i_total = ${total},
                                i_totalpromotion = ${totalpromotion},
                                i_vatnominal = ${vatnominal},
                                i_scnominal = ${scnominal},
                                i_totalnet = ${totalnet}
                            WHERE i_code = ${resCartInsert.insertId}`
                await functionCart.update({res, connection}, {total, totalpromotion, vatnominal, scnominal, totalnet, code: resCartInsert.insertId})
                data.data.push({
                    success: "true",
                    id: resCartInsert.insertId,
                    ordernumber: parseInt(saveCart.ordernumber)
                })
                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/cart/saveCart');
                    } else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: data
                        })
                        connection.release();
                    };
                })
            })
        })
    } catch(error) {
        console.log("Error occured in controller/cart/saveCart")
    }
}

type getV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        createdby: string,
        role: string
    }
}
export async function getV3 (req: getV3Request, res: Response) {

    function convertBody() {
        let requestBody = {
            user: req.body.user,
            createdBy: req.body.createdby ?? '%',
            role: parseFloat(!req.body.role || req.body.role === '' ? '0' : req.body.role)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }

    await globalHandler('controller/cart/getV3', req, res, async () => {
        let requestBody = convertBody()
        let responseBody: any = []
        if (requestBody.role === 1) requestBody.createdBy = '%'
        await executeQuery(`
            UPDATE 
                dvw_transaction.vw_cart a 
            SET
                a.b_isactive = 0
            WHERE 
                a.b_isactive = 1
                AND a.fk_business = ${req.body.user.business_code}
                AND a.s_offlinecode IN  (
                                            SELECT z.s_offlinecode
                                            FROM dvw_transaction.vw_transaction z
                                            WHERE 
                                                z.s_offlinecode = a.s_offlinecode
                                                AND z.fk_business = ${req.body.user.business_code}
                                        )
        `)
        let resultGetCart: {
            cart_code: any,
            cart_ordernumber: any,
            cart_receipt: any,
            customer_code: any,
            customer_name: any,
            cart_guest: any,
            cart_businessCode: any,
            cart_server: any,
            cart_dateCreated: any,
            cart_total: any,
            cart_tax: any,
            cart_serviceCharge: any,
            cart_totalPromotion: any,
            cart_hpp: any,
            cart_changes: any,
            cart_isVoid: any,
            cart_voidReason: any,
            cart_salesTypeCode: any,
            salestype_name: any,
            cart_createdBy: any,
            cart_isSplit: any
        }[] = await executeQuery(`
            SELECT
                a.i_code AS cart_code,
                a.i_ordernumber AS cart_ordernumber,
                a.s_offlinecode AS cart_receipt,
                IFNULL(b.i_code, 0) AS customer_code,
                IFNULL(b.v_name, '') AS customer_name,
                IFNULL(a.v_guest, '') AS cart_guest,
                a.fk_business AS cart_businessCode,
                a.v_createdby AS cart_server,
                a.dt_created AS cart_dateCreated,
                a.i_total AS cart_total,
                a.i_vatnominal AS cart_tax,
                a.i_scnominal AS cart_serviceCharge,
                a.i_totalpromotion AS cart_totalPromotion,
                a.i_totalnet AS cart_hpp,
                a.i_changes AS cart_changes,
                a.b_isvoid AS cart_isVoid,
                a.v_voidreason AS cart_voidReason,
                a.fk_salestype AS cart_salesTypeCode,
                c.v_name AS salestype_name,
                a.v_createdby AS cart_createdBy,
                a.b_issplit AS cart_isSplit
            FROM dvw_transaction.vw_cart a
            LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
            LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
            WHERE 
                a.b_isactive = 1
                AND a.fk_business = ${requestBody.user.business_code}
                AND a.v_createdby LIKE '${requestBody.createdBy}'
            ORDER BY cart_dateCreated ASC, cart_code DESC
            LIMIT 800
        `)
        let carts: {
            cart_businessCode: any,
            cart_changes: any,
            cart_code: any,
            cart_createdBy: any,
            cart_dateCreated: any,
            cart_detail: any,
            cart_guest: any,
            cart_hpp: any,
            cart_isSplit: any
            cart_isVoid: any,
            cart_ordernumber: any,
            cart_payment: any,
            cart_promotion: any,
            cart_receipt: any,
            cart_salesTypeCode: any,
            cart_server: any,
            cart_serviceCharge: any,
            cart_tax: any,
            cart_total: any,
            cart_totalPromotion: any,
            cart_voidReason: any,
            customer_code: any,
            customer_name: any,
            salestype_name: any,
        }[] = []
        for (let eachCart of resultGetCart) {
            let resultGetCartDetail: {
                cartdetail_code: any,
                item_code: any,
                unit_code: any,
                item_sku: any,
                item_name: any,
                cartdetail_price: any,
                cartdetail_qty: any,
                cartdetail_preference: any,
                cartdetail_isVoid: any,
                cartdetail_isPaid: any,
                cartdetail_voidReason: any,
                isPackage: any,
                category_pph: any,
                cartdetail_isPrinted: any,
                category_name: any,
                category_code: any,
                detail: any
            }[] = await executeQuery(`
                SELECT 
                    a.i_code AS cartdetail_code, 
                    a.fk_item AS item_code,
                    a.fk_unit AS unit_code,
                    b.v_code AS item_sku,
                    CASE
                        WHEN a.fk_unit = b.fk_unit THEN b.v_name
                        ELSE CONCAT(b.v_name, ' (', e.v_name, ')')
                    END AS item_name,
                    a.i_price AS cartdetail_price,
                    a.i_qty AS cartdetail_qty,
                    a.v_preference AS cartdetail_preference,
                    a.b_isvoid AS cartdetail_isVoid,
                    a.b_ispaid AS cartdetail_isPaid,
                    a.v_voidreason AS cartdetail_voidReason,
                    0 AS isPackage,
                    CASE
                        WHEN IFNULL(f.d_pph, 0) = 0 THEN c.d_pph
                        ELSE f.d_pph * f.d_itemservice / 100
                    END AS category_pph,
                    IFNULL(a.b_isprinted, 0) AS cartdetail_isPrinted,
                    c.v_name AS category_name,
                    c.i_code AS category_code,
                    '' AS detail
                FROM dvw_transaction.vw_cartdetail a
                JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                LEFT JOIN dvw_master.vw_unit e ON a.fk_unit = e.i_code
                LEFT JOIN dvw_setting.vw_other f ON f.fk_business = a.fk_business
                WHERE 
                    a.b_isactive = 1
                    AND a.b_type = 1
                    AND a.fk_cart = ${eachCart.cart_code}
                UNION ALL
                SELECT 
                    d.i_code AS cartdetail_code,
                    d.fk_item AS item_code,
                    0 AS unit_code,
                    e.v_code AS item_sku,
                    e.v_name AS item_name,
                    d.i_price AS cartdetail_price,
                    d.i_qty AS cartdetail_qty,
                    d.v_preference AS cartdetail_preference,
                    d.b_isvoid AS cartdetail_isVoid,
                    d.b_ispaid AS cartdetail_isPaid,
                    d.v_voidreason AS cartdetail_voidReason,
                    1 AS isPackage,
                    0 AS category_pph,
                    IFNULL(d.b_isprinted, 0) AS cartdetail_isPrinted,
                    'Paket' AS category_name,
                    -1 AS category_code,
                    (
                        SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                        FROM dvw_master.vw_packagedetail f
                        JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                        WHERE f.fk_package = d.fk_item
                    ) AS detail
                FROM dvw_transaction.vw_cartdetail d
                JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                WHERE 
                    d.b_isactive = 1
                    AND d.b_type = 2
                    AND d.fk_cart = ${eachCart.cart_code}
                ORDER BY cartdetail_code;
            `)
            let cartDetail: {
                cartdetail_code: any,
                cartdetail_isPaid: any,
                cartdetail_isPrinted: any,
                cartdetail_isVoid: any,
                cartdetail_preference: any,
                cartdetail_price: any,
                cartdetail_qty: any,
                cartdetail_voidReason: any,
                category_code: any,
                category_name: any,
                category_pph: any,
                detail: any
                isPackage: any,
                item_code: any,
                item_name: any,
                item_sku: any,
                unit_code: any,
                additional: any,
                promotion: any
            }[] = []
            for (let eachCartDetail of resultGetCartDetail) {
                let resultGetCartDetailAdditional: {
                    additional_name: any,
                    cartadditional_additionalCode: any,
                    cartadditional_price: any,
                    cartadditional_qty: any
                }[] = await executeQuery(`
                    SELECT 
                        a.fk_additional AS additional_code, 
                        b.v_name AS additional_name,
                        a.i_price AS cartadditional_price,
                        a.i_qty AS cartadditional_qty
                    FROM dvw_transaction.vw_cartadditional a
                    JOIN dvw_master.vw_additional b ON a.fk_additional = b.i_code
                    WHERE 
                        a.b_isactive = 1
                        AND a.fk_cartdetail = ${eachCart.cart_code}
                `)
                let resultGetCartDetailPromotion: {
                    cartpromotiondetail_promotion: any,
                    cartpromotiondetail_promotionNominal: any,
                    promotion_code: any,
                    promotion_maximumPromo: any
                    promotion_minimumSpend: any,
                    promotion_name: any,
                    promotion_system: any,
                }[] = await executeQuery(`
                    SELECT 
                        a.fk_promotion AS promotion_code,
                        CASE
                            WHEN b.fk_systempromotion <> 4 THEN b.v_name
                            ELSE CONCAT('Redeem ', FLOOR(a.i_promotionnominal) ,' Point')
                        END AS promotion_name,
                        a.i_promotionnominal AS cartpromotiondetail_promotionNominal,
                        a.i_promotion AS cartpromotiondetail_promotion,
                        b.fk_systempromotion AS promotion_system,
                        b.i_minimum_spend AS promotion_minimumSpend,
                        b.i_maximum_promo AS promotion_maximumPromo
                    FROM dvw_transaction.vw_cartpromotiondetail a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    WHERE 
                        a.b_isactive = 1
                        AND a.fk_cartdetail = ${eachCart.cart_code}
                `)
                cartDetail.push({...eachCartDetail, additional: resultGetCartDetailAdditional, promotion: resultGetCartDetailPromotion})
            }
            let resultGetCartPromotion: {
                promotion_code: any,
                promotion_name: any,
                cartpromotion_promotion: any,
                cartpromotion_promotionnominal: any,
                promotion_systempromotion: any,
                systempromotion_name: any,
                promotion_minimumSpend: any,
                promotion_maximumPromo: any
            } = await executeQuery(`
                SELECT 
                    a.fk_promotion AS promotion_code, 
                    b.v_name AS promotion_name,
                    a.i_promotion AS cartpromotion_promotion,
                    a.i_promotionnominal AS cartpromotion_promotionnominal,
                    b.fk_systempromotion AS promotion_systempromotion,
                    c.v_name AS systempromotion_name,
                    b.i_minimum_spend AS promotion_minimumSpend,
                    b.i_maximum_promo AS promotion_maximumPromo
                FROM dvw_transaction.vw_cartpromotion a
                JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                JOIN dvw_system.vw_promotion c ON b.fk_systempromotion = c.i_code AND c.b_isactive=1
                WHERE
                    a.b_isactive = 1
                    AND a.fk_cart = ${eachCart.cart_code}
            `)
            let resultGetCartPayment: {
                cartpayment_code: any,
                paymentmmethod_name: any,
                cartpayment_information: any,
                cartpayment_paidMoney: any
            } = await executeQuery(`
                SELECT
                    a.fk_paymentmethod AS cartpayment_code,
                    b.v_name AS paymentmmethod_name,
                    a.v_information AS cartpayment_information,
                    a.i_paidmoney AS cartpayment_paidMoney
                FROM dvw_transaction.vw_cartpayment a
                JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                WHERE a.fk_cart = ${eachCart.cart_code}
            `)

            eachCart.cart_dateCreated = moment(eachCart.cart_dateCreated).format('YYYY-MM-DD HH:mm:ss')
            carts.push({...eachCart, cart_detail: cartDetail, cart_payment: resultGetCartPayment, cart_promotion: resultGetCartPromotion})
        }
        return res.status(200).json({success: true, message: `${carts.length} data/s found.`, data: carts})
    })
}

type insertV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,

    }
}
export async function getOpenCart({body: getOpenCart}: typeCart.getOpenCart, res: Response) {
    let data: {data: Array<any>} = {data: []}
    getOpenCart = {
        business: getOpenCart.business ?? "1524",
        createdby: getOpenCart.createdby ?? "%",
        role: getOpenCart.role ?? "1"
    }
    
    pool.getConnection(async function (err, connection) {
        if (parseInt(getOpenCart.role) === 1) getOpenCart.createdby = '%'
        await functionCart.setInactive({res, connection}, {fk_business: parseInt(getOpenCart.business)})
        let resGetCart = await functionCart.getCart({res, connection}, {fk_business: parseInt(getOpenCart.business), createdby: getOpenCart.createdby})
        if (resGetCart.length > 0) {
            let items = {}
            let detail = []
            let promotionData = []
            let payment = []
            let itemsString = ""
            let counter = 0
            
            for(let cart of resGetCart) {
                let ordercode = cart["ordercode"]
                let ordernumber = cart["ordernumber"]
                let offlinecode = cart["offlinecode"]
                let customcode = cart["customcode"]
                let email = (/*cart["email"] ??*/ "null")
                let customercode = cart["customercode"];
                let customername = cart["customername"];
                let guest = cart["guest"];
                let orderbusiness = cart["orderbusiness"];
                let orderserver = cart["orderserver"];
                let ordercashier = /*cart["order_cashier"] ??*/ "null";
                let orderdate = cart["orderdate"];
                let total = cart["total"];
                let tax = cart["tax"];
                let sc = cart["sc"];
                let promotion = cart["promotion"];
                let totalnet = cart["totalnet"];
                let changes = cart["changes"];
                let isvoid = cart["void"] || "0";
                let voidreason = cart["voidreason"];
                let salestypecode = cart["salestypecode"];
                let user = cart["created"];
                let split = cart["split"] || "0";

                itemsString += (
                    ordernumber + "~~" + 
                    offlinecode + "~~" +
                    customercode + "~~" + 
                    customername + "~~" +
                    orderbusiness + "~~" +
                    orderserver + "~~" +
                    orderdate + "~~" +
                    tax + "~~" +
                    sc + "~~" + 
                    salestypecode + "~~" +
                    totalnet + "~~" + 
                    guest + "~~" + 
                    isvoid + "~~" +
                    email + "~~" +
                    split + "~~" +
                    user + "|~"
                );

                items = {
                    'ordercode': cart["ordercode"],
                    'ordernumber': cart["ordernumber"],
                    'offlinecode': cart["offlinecode"],
                    'customcode': cart["customcode"],
                    'email': /*cart["email"]*/ null,
                    'customercode': cart["customercode"],
                    'customername': cart["customername"],
                    'guest': cart["guest"],
                    'orderbusiness': cart["orderbusiness"],
                    'orderserver': cart["orderserver"],
                    'ordercashier': /*cart["order_cashier"]*/ "null",
                    'orderdate': cart["orderdate"],
                }

                let querytest = `CALL GET_CART_DETAIL(${ordercode})`
                let resGetCartDetail = await functionCart.getCartDetail({res, connection}, {fk_cart: ordercode})
                let tempDetail:any = []
                if (resGetCartDetail.length > 0) {
                    for (let cartDetail of resGetCartDetail) {
                        let additional = []
                        let promotion = []

                        let detailcode = cartDetail["detail_code"]

                        let resGetCartDetailAdditional = await functionCart.getCartDetailAdditional({res, connection}, {fk_cartdetail: detailcode})
                        for (let cartDetailAdditional of resGetCartDetailAdditional) {
                            additional.push({
                                'additionalCode' : cartDetailAdditional["additionalcode"],
                                'additionalName' : cartDetailAdditional["additionalname"],
                                'additionalPrice' : cartDetailAdditional["price"],
                                'additionalQty' : cartDetailAdditional["qty"]
                            })
                        }

                        let resGetCartDetailPromotion = await functionCart.getCartDetailPromotion({res, connection}, {fk_cartdetail: detailcode})
                        for(let cartDetailPromotion of resGetCartDetailPromotion) {
                            promotion.push({
                                'promotionCode': cartDetailPromotion["promotioncode"],
                                'promotionName': cartDetailPromotion["promotionname"],
                                'promotionValue': cartDetailPromotion["value"],
                                'promotionType': cartDetailPromotion["type"],
                                'promotionMinimumSpend': cartDetailPromotion["promotionMinimumSpend"],
                                'promotionMaximumPromo': cartDetailPromotion["promotionMaximumPromo"],
                            })
                        }

                        let printed = cartDetail["isprinted"]
                        // if(parseInt(getOpenCart.business) === 5525 || parseInt(getOpenCart.business) === 851) printed = 0
                        tempDetail.push({
                            'code': cartDetail["item_code"],
                            'unit': cartDetail["unit_code"],
                            'customcode': cartDetail["alias"],
                            'name': cartDetail["itemname"],
                            'image': "",
                            'category': cartDetail["category"],
                            'categorycode': cartDetail["category_code"],
                            'categorypph': cartDetail["category_pph"],
                            'sellingprice': cartDetail["price"],
                            'qty': cartDetail["qty"].toString().replace(".0000", ""),
                            'preferences': cartDetail["preference"],
                            'additional': additional,
                            'promotion': promotion,
                            'isvoid': cartDetail["isvoid"],
                            'ispaid': cartDetail["ispaid"],
                            'isprinted': printed,
                            'ispackage': cartDetail["ispackage"],
                            'voidreason': cartDetail["void_reason"],
                            'detail': cartDetail["detail"],
                            'hasstock': "0"
                        })
                    }
                }
                detail.push({
                    datas: tempDetail
                })
                let resGetCartPromotion = await functionCart.getCartPromotion({res, connection}, {fk_cart: ordercode})
                let tempPromotion = []
                let promotionString = ""
                if (resGetCartPromotion.length > 0) {
                    for (let cartPromotion of resGetCartPromotion) {
                    let promotionCode = cartPromotion["promotioncode"];
                    let promotionName = cartPromotion["promotionname"];
                    let promotionn = cartPromotion["promotion"];
                    let promotionNominal = cartPromotion["promotionnominal"];
                    let promotionType = cartPromotion["promotiontypecode"];
                    let minimumSpend = cartPromotion["minimum_spend"];
                    let maximumPromo = cartPromotion["maximum_promo"];

                    promotionString = promotionCode + "~" + promotionn + "~" + promotionType + "~" + promotionName + "~" + minimumSpend + "~" + maximumPromo
                    }
                }
                promotionData.push({
                    datas: promotionString
                })

                let resultGetPayment = await functionCartPayment.getPayment({res, connection}, {ordercode})
                let tempPayment: any = []
                if (resultGetPayment.length > 0) {
                    for (let eachPayment of resultGetPayment) {
                        tempPayment.push({
                            paymentCode: eachPayment["paymentCode"],
                            paymentName: eachPayment["paymentName"],
                            paymentInformation: eachPayment["paymentInformation"],
                            paymentValue: eachPayment["paymentValue"], 
                        })
                    }
                }
                payment.push({
                    datas: tempPayment    
                })
            }
            data.data.push({
                transaction: itemsString,
                transactionDetail: detail,
                transactionPromotion: promotionData,
                transactionPayment: payment          
            })
        } else {
            data.data.push({
                transaction: "",
                transactionDetail: "",
                transactionPromotion: "",
                transactionPayment: ""
            })
        }

        res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
            data: data.data
        })
        connection.release();
    })
}

export async function selectV3(req: typeCart.selectV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/cart/selectV3/getConnection')
            
        let responseData: any = []
            
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
            
            let resGetCart = await functionCart.getCart({res, connection}, {fk_business: user.business, online: req.body.online})
            let newCart: any = []
            if (resGetCart.length > 0) {
                for (let eachGetCart of resGetCart) {
                    let eachCart: any = eachGetCart
                    
                    let resGetCartDetail = await functionCart.getCartDetail({res, connection}, {fk_cart: eachGetCart.ordercode})
                    let newCartDetail: any = []
                    
                    for (let eachGetCartDetail of resGetCartDetail) {
                        let eachCartDetail: any = eachGetCartDetail
                        let resGetCartDetailAdditional = await functionCart.getCartDetailAdditional({res, connection}, {fk_cartdetail: eachGetCartDetail.detail_code})
                        eachCartDetail.additional = resGetCartDetailAdditional
                        
                        let resGetCartDetailPromotion = await functionCart.getCartDetailPromotion({res, connection}, {fk_cartdetail: eachGetCartDetail.detail_code})
                        eachCartDetail.promotion = resGetCartDetailPromotion

                        newCartDetail.push(eachCartDetail)
                    }
                    eachCart.detail = newCartDetail
                    newCart.push(eachCart)
                }
                responseData = newCart
            }
            return res.status(200).json({success: true, message: "OK", data: responseData})
        } catch {
            return errors.rollback(connection, res, err, 'controller/cart/selectV3')
        }
    })
}

export async function saveV3(req: typeCart.saveV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) errors.rollback(connection, res, err, 'controller/cart/saveV3/getConnection')
    
        let total = 0
        let total_promotion = 0
        let vatnominal = 0
        let scnominal = 0
        let totalnet = 0

        let paid = false
        let issplit = false

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetOfflineCode = await functionCart.getOfflinecode({res, connection}, {offlinecode: req.body.receipt, fk_business: user.business})
            // if exists, disable the old one
            connection.beginTransaction(async function (err) {
                if (resGetOfflineCode.length > 0) await functionCart.setInactiveByOfflinecodeBusiness({res, connection}, {fk_business: user.business, offlinecode: req.body.receipt})
                let resInsertCart = await functionCart.insert({res, connection}, {
                    offlinecode: req.body.receipt,
                    fk_business: user.business,
                    fk_customer: parseInt(req.body.customer_code),
                    fk_salestype: parseInt(req.body.sales_type),
                    ordernumber: parseInt(req.body.order_number),
                    createdby: req.body.server,
                    dt_created: req.body.date,
                    guest: req.body.guest,
                })

                let items: Array<{
                    code: string,
                    price: string,
                    qty: string,
                    preferences: string,
                    additional: Array<any>,
                    promotion: Array<any>,
                    isvoid?: string,
                    dt_void?: string,
                    void_by?: string,
                    void_reason?: string,
                    isprinted?: string,
                    ispaid?: string,
                    ispackage?: string,
                    unit?: string
                }> = JSON.parse(req.body.item)

                for(let eachItem of items) {
                    let newItem = {
                        code: parseInt(eachItem.code),
                        price: parseFloat(eachItem.price),
                        qty: parseFloat(eachItem.qty),
                        preferences: eachItem.preferences,
                        additional: eachItem.additional,
                        promotion: eachItem.promotion,
                        isvoid: parseInt(eachItem.isvoid ?? '0'),
                        dt_void: eachItem.dt_void ?? '',
                        void_by: eachItem.void_by ?? '',
                        void_reason: eachItem.void_reason ?? '',
                        isprinted: parseInt(eachItem.isprinted ?? "0"),
                        ispaid: parseInt(eachItem.ispaid ?? '0') ,
                        type: eachItem.ispackage === "1" ? 2 : 1,
                        unit: parseInt(eachItem.unit ?? "0")
                    }
                    let subtotal = 0
                    let subtotal_promotion = 0

                    let resInsertCartDetail = await functionCartDetail.insertItem({res, connection}, {
                        fk_business: user.business,
                        fk_cart: resInsertCart.insertId,
                        fk_item: newItem.code,
                        fk_unit: newItem.unit,
                        qty: newItem.qty,
                        price: newItem.price,
                        preference: newItem.preferences,
                        createdby: req.body.server,
                        dt_created: req.body.date,
                        isvoid: newItem.isvoid,
                        voidby: newItem.void_by,
                        dt_void: newItem.dt_void,
                        isprinted: newItem.isprinted,
                        type: newItem.type,
                        ispaid: newItem.ispaid,
                        voidreason: newItem.void_reason,
                    })
                    if (newItem.type === 2) await functionCartDetail.insertPackage({res, connection}, {
                        fk_package: newItem.code,
                        fk_business: user.business,
                        fk_cart: resInsertCart.insertId,
                        createdby: req.body.server,
                        dt_created: req.body.date,
                        isvoid: newItem.isvoid,
                        qty: newItem.qty  
                    })
                    
                    for (let eachAdditional of eachItem.additional) {
                        let newAdditional = {
                            code: parseInt(eachAdditional.code),
                            price: parseFloat(eachAdditional.price),
                            qty: parseFloat(eachAdditional.qty)
                        }

                        if (newItem.isvoid === 0) subtotal = subtotal + (newAdditional.price * newAdditional.qty)
                        let resInsertCartDetailAdditional = await functionCartAdditional.insert({res, connection}, {
                            fk_business: user.business,
                            fk_cart: resInsertCart.insertId,
                            fk_cartdetail: resInsertCartDetail.insertId,
                            fk_additional: newAdditional.code,
                            price: newAdditional.price,
                            qty: newAdditional.qty,
                            createdby: req.body.server,
                            dt_created: req.body.date
                        })
                    }
                    for (let eachPromotion of eachItem.promotion) {
                        let newPromotion = {
                            code: parseInt(eachPromotion.code),
                            value: parseFloat(eachPromotion.value),
                            type: parseInt(eachPromotion.type),
                        }
                        
                        let discount: number = 0
                        //Promotion by percentage
                        if (newPromotion.type === 1) discount = newItem.price * newPromotion.value / 100
                        //Promotion by value
                        else if (newPromotion.type === 2) discount = newPromotion.value
                        //Promotion with compliment(Other item)
                        else if (newPromotion.type === 3) {
                            newPromotion.value = 0
                            discount = 0
                        }
                        //Not promotion, but buying item with point count as promotion
                        else if (newPromotion.type === 4) {
                            newPromotion.value = newPromotion.value
                            discount = newPromotion.value
                        }

                        if (newItem.isvoid === 0) subtotal_promotion = subtotal_promotion + discount
                        let resCartPromotionDetail = await functionCartPromotionDetail.insert({res, connection}, {
                            fk_business: user.business,
                            fk_cart: resInsertCart.insertId,
                            fk_cartdetail: resInsertCartDetail.insertId,
                            fk_promotion: newPromotion.code,
                            promotion: newPromotion.value,
                            promotionnominal: discount,
                            createdby: req.body.server,
                            dt_created: req.body.date
                        })
                    }

                    if (newItem.isvoid === 0) {
                        subtotal = subtotal + newItem.price
                        subtotal = subtotal * newItem.qty
                        subtotal_promotion = subtotal_promotion * newItem.qty
                    } else {
                        subtotal = 0
                        subtotal_promotion = 0
                    }

                    total = total + subtotal
                    total_promotion = total_promotion + subtotal_promotion
                }
                
                let cartPromotions: Array<{
                    code: number,
                    value: number,
                    type: number,
                }> = JSON.parse(req.body.promotion)

                for (let cartPromotion of cartPromotions) {
                    let discountCart: number = 0
                    //Promotion by percentage
                    if (cartPromotion.type === 1) discountCart = (total - total_promotion) * discountCart / 100
                    else {
                        if ((total - total_promotion) < cartPromotion.value) {
                            discountCart = total - total_promotion
                            cartPromotion.value = total - total_promotion
                        }
                    }

                    total_promotion = total_promotion + discountCart

                    if (total_promotion > 0) { 
                        let resCartPromotionDetail = await functionCartPromotion.insert({res, connection}, {
                            fk_business: user.business,
                            fk_cart: resInsertCart.insertId,
                            fk_promotion: cartPromotion.code,
                            promotion: cartPromotion.value,
                            promotionnominal: discountCart,
                            createdby: req.body.server,
                            dt_created: req.body.date
                        })
                    }
                }
                
                let totalpaid = 0
                let payments: Array<{
                    code: string,
                    value: string,
                    information: string
                }> = JSON.parse(req.body.payment)
                for(let eachPayment of payments) {
                    await functionCartPayment.insert({res, connection}, {
                        fk_business: user.business,
                        fk_cart: resInsertCart.insertId,
                        fk_paymentmethod: parseInt(eachPayment.code),
                        paidmoney: parseFloat(eachPayment.value),
                        information: eachPayment.information
                    })
                }

                totalnet = total - total_promotion

                vatnominal = parseFloat(req.body.tax) * totalnet / 100
                scnominal = parseFloat(req.body.service_charge) * totalnet / 100
                totalnet = totalnet + vatnominal + scnominal

                if (totalpaid > totalnet) paid = true

                await functionCart.update({res, connection}, {
                    total: total,
                    totalpromotion:total_promotion,
                    vatnominal: vatnominal,
                    scnominal: scnominal,
                    totalnet: totalnet,
                    code: resInsertCart.insertId
                })

                connection.commit(function (err) {
                    if (err) errors.rollback(connection, res, err, 'controller/cart/saveV3/commit')
                    res.status(200).json({success: true, message: `Data inserted.`, data: resInsertCart.insertId})
                    connection.release()
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/cart/saveV3')
        }
    })
}

export async function voidDetailV3(req: typeCart.voidDetailV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['detail_code', 'reason'])
            let requestBody = {
                detailCode: parseFloat(req.body.detail_code),
                reason: req.body.reason
            }
            return requestBody
        } catch (err: any){
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(function (err, connection){
        if (err) return errors.rollback(connection, res, err, 'controller/cart/voidDetailV3/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/cart/voidDetailV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})
    
                let requestBody = convertBody()!
                if (res.headersSent) return 

                await functionCartDetail.updateVoid({res, connection}, {i_code: requestBody.detailCode, v_voidby: user.name, v_voidreason: requestBody.reason})
                let resCartId = await functionCartDetail.getFKCart({res, connection}, {i_code: requestBody.detailCode})

                let subtotal = 0
                let promotion = 0
                
                let resGetDetail = await functionCartDetail.getCodeQTYPrice({res, connection}, {fk_cart: resCartId.cart})
                for (let eachDetail of resGetDetail) {
                    let resGetDetailAdditional = await functionCartAdditional.getQtyPrice({res, connection}, {fk_cartdetail: eachDetail.code})
                    let totalAdditional = 0
                    for (let eachDetailAdditional of resGetDetailAdditional) {
                        let additionalQty = eachDetailAdditional.qty
                        let additionalPrice = eachDetailAdditional.price

                        totalAdditional += additionalQty * additionalPrice
                    }
                    
                    let resGetDetailPromotion = await functionCartPromotionDetail.getPromotionNominal({res, connection}, {fk_cartdetail: eachDetail.code})
                    let totalPromotion = 0
                    for (let eachPromotion of resGetDetailPromotion) {
                        let promotionNominal = eachPromotion.nominal
                        
                        totalPromotion += promotionNominal
                    }

                    let detailPrice = eachDetail.price
                    let detailQty = eachDetail.qty

                    subtotal += ( detailPrice + totalAdditional - totalPromotion) * detailQty
                }

                let resGetPromotion = await functionCartPromotion.getNominal({res, connection}, {fk_cart: resCartId.cart})
                for (let eachPromotion of resGetPromotion) {
                    promotion += eachPromotion.nominal
                }

                let grandtotal = subtotal - promotion
                let resUpdate = await functionCart.updateTotalNTotalpromotionNTotalnet({res, connection}, {i_code: resCartId.cart, i_total: subtotal, i_totalpromotion: promotion, i_totalnet: grandtotal})
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/cart/voidDetailV3/commit')

                    return res.status(200).json({success: true, message: 'Void detail updated.', data: resUpdate})
                })
            } catch (err) {
                return errors.rollback(connection, res, err, 'controller/cart/voidDetailV3')
            }
        })
    })
}

type createOnlineOrderRequest = Omit<Request, 'body'> & {
    body: {
        cart_guest: string,
        business_code: string,
        customer_code: string,
        salesType_code: string
    }
}
export async function createOnlineOrder(req: createOnlineOrderRequest, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, ['idBusiness'])
        let requestBody = {
            cart_guest: req.body.cart_guest,
            business_code: parseFloat(req.body.business_code),
            customer_code: parseFloat(req.body.customer_code),
            salesType_code: parseFloat(req.body.salesType_code)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }

    await globalHandler('controller/cart/createOnlineOrder', req, res, async () => {
        let requestBody = convertBody()
        let resultInsert = await executeQuery(`
            INSERT INTO
                dvw_cart.vw_cart
            SET
                s_offlinecode = '${md5(moment().format('YYYY-MM-DD HH:mm:ss')).substring(0, 12)}'
                fk_business = '${requestBody.business_code}',
                fk_customer = '${requestBody.customer_code}',
                fk_salestype = '${requestBody.salesType_code}',
                i_order = SELECT a.i_ordernumber FROM dvw_transaction.vw_transaction a WHERE a.fk_business = ${requestBody.business_code} AND DATE(a.dt_created) = CURDATE(),
                v_createdby = 'Chatbot Online Order',
                dt_created = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                v_guest = '${requestBody.cart_guest}',
                b_issplit = '0'
        `)
        return res.status(200).json({success: true, message: `Online order telah dibuat.`, data: resultInsert.insertId, info: resultInsert})
    })
}

type insertItemOnlineOrderRequest = Omit<Request, 'body'> & {
    body: {
        cart_code: string,
        cart_dateCreated: string,
        cart_business_code: string,
        cart_item_code: string,
        cart_item_price: string,
        cart_item_preference: string,
        cart_item_qty: string,
        cart_item_type: string,
        cart_item_unit_code: string
    }
}
export async function insertItemOnlineOrder(req: insertItemOnlineOrderRequest, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, [ 'cart_code', 'cart_dateCreated', 'cart_business_code', 'cart_item_code', 'cart_item_price', 'cart_item_preference', 'cart_item_qty', 'cart_item_type', 'cart_item_unit_code'])
        let requestBody = {
            cart_code: parseFloat(req.body.cart_code),
            cart_dateCreated: req.body.cart_dateCreated,
            cart_business_code: parseFloat(req.body.cart_business_code),
            cart_item_code: parseFloat(req.body.cart_item_code),
            cart_item_price: parseFloat(req.body.cart_item_price),
            cart_item_preference: req.body.cart_item_preference,
            cart_item_qty: parseFloat(req.body.cart_item_qty),
            cart_item_type: parseFloat(req.body.cart_item_type),
            cart_item_unit_code: parseFloat(req.body.cart_item_unit_code)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }
    await globalHandler(`controller/cart/insertItemOnlineOrder`, req, res, async() => {
        let requestBody = convertBody()
        let resultInsert = await startTransaction(async (executeQuery) => {
            let resultInsertItemOnlineOrder = await executeQuery(`
                INSERT INTO
                    dvw_transaction.vw_cartdetail
                SET
                    fk_business = ${requestBody.cart_business_code},
                    fk_cart = ${requestBody.cart_code},
                    fk_item = ${requestBody.cart_item_code},
                    fk_unit = ${requestBody.cart_item_unit_code},
                    i_qty = ${requestBody.cart_item_qty},
                    i_price = ${requestBody.cart_item_price},
                    i_pricenet = (SELECT i_pricenet FROM dvw_master.vw_item WHERE i_code = ${requestBody.cart_item_code}),
                    v_preference = '${requestBody.cart_item_preference}',
                    v_createdby = 'Chatbot',
                    dt_created = '${requestBody.cart_dateCreated}',
                    b_isvoid = 1,
                    v_voidby = '',
                    dt_void = '',
                    b_isprinted = 0,
                    b_type = ${requestBody.cart_item_type},
                    b_ispaid = 0,
                    v_voidreason = ''
            `)
            await executeQuery(`
                UPDATE dvw_transaction.vw_cart
                SET i_total = (
                    SELECT SUM(i_price * i_qty)
                    FROM dvw_transaction.vw_cartdetail
                    WHERE 
                        fk_cart = ${requestBody.cart_code}
                        AND b_isactive = 1
                )
                WHERE i_code = ${requestBody.cart_code}
            `)
            return resultInsertItemOnlineOrder
        })
        return res.status(200).json({success: true, message: 'Berhasil menambahkan item.', data: resultInsert.insertId, info: resultInsert})
    })
}
type updateItemOnlineOrderRequest = Omit<Request, 'body'> & {
    body: {
        cartdetail_code: string,
        cartdetail_dateCreated: string,
        cart_code: string,
        cart_item_price: string,
        cart_item_preference: string,
        cart_item_qty: string,
        cart_item_type: string,
        cart_item_unit_code: string
    }
}
export async function updateItemOnlineOrder(req: updateItemOnlineOrderRequest, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, ['cartdetail_code', 'cartdetail_dateCreated', 'cart_code', 'cart_item_price', 'cart_item_preference', 'cart_item_qty', 'cart_item_type', 'cart_item_unit_code'])
        let requestBody = {
            cartdetail_code: parseFloat(req.body.cartdetail_code),
            cartdetail_dateCreated: req.body.cartdetail_dateCreated,
            cart_code: parseFloat(req.body.cart_code),
            cart_item_price: parseFloat(req.body.cart_item_price),
            cart_item_preference: req.body.cart_item_preference,
            cart_item_qty: parseFloat(req.body.cart_item_qty),
            cart_item_type: parseFloat(req.body.cart_item_type),
            cart_item_unit_code: parseFloat(req.body.cart_item_unit_code)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }
    await globalHandler(`controller/cart/updateItemOnlineOrder`, req, res, async() => {
        let requestBody = convertBody()
        let resultUpdate = await executeQuery(`
            UPDATE
                dvw_transaction.vw_cartdetail
            SET
                fk_unit = ${requestBody.cart_item_unit_code},
                i_qty = ${requestBody.cart_item_qty},
                i_price = ${requestBody.cart_item_price},
                v_preference = '${requestBody.cart_item_preference}',
                dt_created = '${requestBody.cartdetail_dateCreated}',
                b_type = ${requestBody.cart_item_type}
            WHERE
                i_code = ${requestBody.cartdetail_code}
        `)
        await executeQuery(`
            UPDATE dvw_transaction.vw_cart
            SET i_total = (
                SELECT SUM(i_price * i_qty)
                FROM dvw_transaction.vw_cartdetail
                WHERE 
                    fk_cart = (SELECT fk_cart FROM dvw_transaction.vw_cartdetail WHERE i_code = ${requestBody.cartdetail_code})
                    AND b_isactive = 1
            )
            WHERE
                i_code = ${requestBody.cart_code}
        `)
        return res.status(200).json({success: true, message: 'Berhasil mengubah item.', data: requestBody.cartdetail_code, info: resultUpdate})
    })
}
type submitOnlineOrderRequest = Omit<Request, 'body'> & {
    body: {
        cart_business_code: string,
        cart_receipt: string
    }
}
export async function submitOnlineOrder(req: submitOnlineOrderRequest, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['cart_receipt'])
        let requestBody = {
            cart_business_code: req.body.cart_business_code,
            cart_receipt: req.body.cart_receipt
        }
        return requestBody
    }
    await globalHandler('controller/cart/submitOnlineOrder', req, res, async () => {
        let requestBody = convertBody()
        let resultGetCart = await executeQuery(`
            SELECT
                d.v_api_key as admin_apiKey,
                d.v_number_key as admin_numberKey,
                d.v_number as admin_phone,
                b.v_phone as customer_phone,
                a.i_total as cart_total
            FROM dvw_transaction.vw_cart a
            JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
            JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
            JOIN tkd_broadcast.bc_user_number d ON c.fk_wooblazz = d.v_number
            WHERE s_offlinecode = '${requestBody.cart_receipt}'
        `)
        if (resultGetCart.length === 0) throw ({httpResponse: {code: 400, success: false, message: 'Kode nota tidak valid.'}})
        let qrisCode = await fetch(`https://api.woogigs.com/v3/qris/insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'x-auth-token': '62eff02eb49f0'
            },
            body: JSON.stringify({
                receipt: requestBody.cart_receipt,
                amount: parseInt(resultGetCart[0].cart_total),
                payment_method_name: 'QRIS'
            })
        }).then(response => response.json())
        .then(result => result.data)

        await qrcode.toFile(`assets/image/chatbottransactionsqrcode/${req.body.cart_receipt}.png`, qrisCode, {
            errorCorrectionLevel: 'H'
        }, function(err: any) {
            if (err) throw err;
        })
        let resultGetAdminMessage = await executeQuery(`
            SELECT 
                i_code as templatechat_code,
                v_message as templatechat_message
            FROM tkd_broadcast.bc_templatechat
            WHERE 
                fk_business = ${requestBody.cart_business_code}
                AND i_type = 11
        `)

        await fetch(`https://api.watzap.id/v1/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                api_key: resultGetCart[0].admin_apiKey,
                number_key: resultGetCart[0].admin_numberKey,
                phone_no: resultGetCart[0].customer_phone,
                message: `Berikut QRIS untuk pembayaran nota ${requestBody.cart_receipt}`,
            })
        })
        
        await fetch(`https://api.watzap.id/v1/send_image_url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                api_key: resultGetCart[0].admin_apiKey,
                number_key: resultGetCart[0].admin_numberKey,
                phone_no: resultGetCart[0].customer_phone,
                message: resultGetAdminMessage[0].templatechat_message,
                url: `https://api-dev.looyal.id/chatbotreceipts/${requestBody.cart_receipt}.png`
            })
        }).then(response => response.json())
        .then(result => console.log(result))

        await executeQuery(`
            INSERT INTO
                tkd_broadcast.bc_logchat
            SET
                fk_templatechat = ${resultGetAdminMessage[0].templatechat_code},
                v_phone_admin = '${resultGetCart[0].admin_phone}',
                v_phone_user = '${resultGetCart[0].customer_phone}',
                v_message = '${resultGetAdminMessage[0].templatechat_message.replaceAll("'", "''")}',
                b_from_admin = 1
        `)
        functionCart.checkOnlineOrderQRISPayment({admin_apiKey: resultGetCart[0].admin_apiKey, admin_numberKey: resultGetCart[0].admin_numberKey, admin_phone: resultGetCart[0].admin_phone, customer_phone: resultGetCart[0].customer_phone, cart_business_code: requestBody.cart_business_code, cart_receipt: requestBody.cart_receipt, cart_amount: parseInt(resultGetCart[0].cart_total), counter: 1, token: req.headers['x-auth-token'], })
        return res.status(200).json({success: true, message: 'Online order berhasil disubmit.'})
    })
}

type getOnlineOrderRequest = Omit<Request, 'body'> & {
    body: {
        user: User,
        cart_receipt: string
    }
}
export async function getOnlineOrder(req: getOnlineOrderRequest, res: Response) {
    function convertBody() {
        errors.checkField(req.body, ['cart_receipt'])
        let requestBody = {
            user: req.body.user,
            cart_receipt: req.body.cart_receipt
        }
        return requestBody
    }
    await globalHandler('controller/cart/getOnlineOrder', req, res, async () => {
        let requestBody = convertBody()
        let resultGetOnlineOrder = await executeQuery(`
            SELECT 
                i_code as cart_code,
                fk_business as cart_business_code,
                fk_customer as cart_customer_code,
                fk_salestype as cart_salesType_code,
                i_ordernumber as cart_orderNumber,
                i_total as cart_totalPrice,
                v_createdby as cart_server,
                dt_created as cart_dateCreated,
                v_guest as cart_guest
            FROM dvw_transaction.vw_cart
            WHERE s_offlinecode = '${requestBody.cart_receipt}'
        `)
        if (resultGetOnlineOrder.length === 0) return res.status(404).json({successs: false, message: 'Kode nota tidak valid.'})
        let resultGetOnlineOrderItems = await executeQuery(`
            SELECT
                a.i_code as cartdetail_code,
                a.fk_item as cart_item_code,
                a.i_price as cart_item_price,
                a.v_preference as cart_item_preference,
                a.i_qty as cart_item_qty,
                a.b_type as cart_item_type,
                a.fk_unit as cart_item_unit_code,
                b.b_hasstock as cart_item_hasStock,
                CASE
                    WHEN IFNULL(b.v_image_link, '') <> '' THEN b.v_image_link
                    WHEN b.v_image = '' THEN 'https://api.looyal.id/asset/image/logo/logogram.png?112496161'
                    WHEN INSTR(b.v_image, 'http') > 0 THEN CONCAT(b.v_image, '?', ". rand(0, 999) .")
                    ELSE CONCAT('https://www.woogigs.com/assets/img/business/', c.v_code, '/item/', b.v_image, '?', ". rand(0, 999) .") 
                END AS \`cart_item_image\`,
                b.v_name as cart_item_name,
                b.i_qty as cart_item_stock,
                0 as cart_item_discount
            FROM dvw_transaction.vw_cartdetail a
            JOIN dvw_master.vw_item b ON b.i_code = a.fk_item AND b.fk_business = a.fk_business
            JOIN dvw_account.vw_business c ON c.i_code = a.fk_business
            WHERE fk_cart = ${resultGetOnlineOrder[0].cart_code}
        `)
        return res.status(200).json({success: true, message: 'Data ditemukan.', data: {...resultGetOnlineOrder[0], items: resultGetOnlineOrderItems}})
    })
}