import { Request, Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"
import * as functionGlobal from "../function/global_function"
var sha1 = require("sha1")

import uniqid from "uniqid"

import * as functionBusiness from '../function/account/business'
import * as functionUser from "../function/account/user"

import * as typeAccount from "../type/account"
import moment from "moment"
import { User } from "../type/user"
import { globalHandler } from "../function/global"
import { executeQuery } from "../util/mysql"

type checkV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function checkUserV3(req: checkV3Request, res: Response) {
    await globalHandler('controller/account/checkUserV3', req, res, async () => {
        let resultSubscribeCheck = await executeQuery(`
            SELECT
                CASE
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) <= 30 THEN 100000
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) > 30 THEN 0
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_activated), 7) <= 30 THEN 100000
                    ELSE 0
                END AS program_discount,
                CASE
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) <= 30 THEN 0
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) > 30 THEN 0
                    WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_activated), 7) <= 30 THEN 0
                    ELSE 0
                END AS program_discountStatus,
                150000 AS program_price,
                299000 AS program_price1,
                829000 AS program_price3,
                3199000 AS program_price12,
                '6282330779799' AS program_adminPhone,
                '6287857650222' As program_woogigsPhone,
                a.v_code as business_code,
                a.v_name as business_name,
                a.v_currentplan as business_plan,
                a.dt_expired AS business_dateExpired,
                a.dt_lastpayment AS business_dateLastPayment,
                a.v_address AS business_address,
                a.v_city AS business_city,
                a.v_phone AS business_phone,
                a.v_image AS business_image,
                a.i_point AS business_point,
                a.i_tax AS business_tax,
                a.i_servicecharge AS business_serviceCharge,
                a.v_currency AS business_currency,
                a.v_thousandseparator AS business_thousandSeparator,
                a.v_decimalpoint AS business_decimalPoint,
                a.b_loyalty AS business_useLoyalty,
                a.b_communitymodule AS business_useCommunityModule,
                a.b_productionmodule AS business_useProductionModule,
                a.b_inventorymodule AS business_useInventoryModule,
                a.b_accountingmodule AS business_useAccountingModule,
                a.b_purchaseordermodule AS business_usePurchaseOrderModule,
                a.b_barcodesystemmodule AS business_useBarcodeSystemModule,
                a.b_packagesalemodule AS business_usePackageSaleModule,
                a.b_openbillmodule AS business_useOpenBillModule,
                a.b_openbillonlinemodule AS business_useOpenBillOnlineModule,
                a.b_splitbillmodule AS business_useSplitBillModule,
                a.b_websitereportmodule AS business_useWebsiteReportModule,
                a.b_reportfilteringmodule AS business_useReportFilteringModule,
                a.b_printermodule AS business_usePrinterModule,
                a.b_invoicemodule AS business_useInvoiceModule,
                a.b_shiftmodule AS business_useShiftModule,
                a.b_variantpricemodule AS business_useVariantPriceModule,
                a.b_multiunitmodule AS business_useMultiUnitModule,
                a.b_customerloyaltymodule AS business_useCustomerLoyaltyModule,
                a.b_whatsappmodule AS business_useWhatsappModule,
                a.b_limit_mastermodule AS business_useLimitMasterModule,
                a.i_limitmaster AS business_limitMaster,
                a.b_limit_transactionmodule AS business_useLimitTransactionModule,
                a.v_pin AS business_pin,
                a.b_pinvoid AS business_usePinVoid,
                a.v_pinvoid AS business_pinVoid,
                a.b_pindiscount AS business_usePinDiscount,
                a.v_pindiscount AS business_pinDiscount,
                a.v_pinpo AS business_pinPurchaseOrder,
                a.b_pinpo AS business_usePinPurhcaseOrder,
                a.v_cashlez_username AS business_cashlezUsername,
                a.v_cashlez_password AS business_cashlezPassword,
                a.v_token_looyal AS business_tokenLooyal,
                a.fk_wooblazz_salestype AS business_wooblazzSalesType,
                IFNULL(b.d_pph, 0) AS setting_pph,
                IFNULL(b.d_itemservice, 0) AS setting_itemService,
                IFNULL(b.b_tracking, 0) AS setting_tracking,
                IFNULL(b.b_stockinclude, 0) AS setting_stockInclude,
                IFNULL(b.b_stock_opname, 0) AS setting_stockOpname,
                IFNULL(b.b_absence, 0) AS setting_absence,
                IFNULL(b.b_table_management, 0) AS setting_tableManagement,
                IFNULL(b.b_ppn_sc_type, 0) AS setting_ppnScType,
                IFNULL(b.b_printer_special, 0) AS setting_printerSpecial,
                IFNULL(b.b_customer_phone_priority, 1) AS setting_customerPhonePriority,
                IFNULL(b.b_delivery_order, 0) AS setting_deliveryOrder,
                IFNULL(b.b_price_distributor_automatic, 0) AS setting_priceDistributorAutomatic,
                IFNULL(b.b_sku_important, 0) AS setting_skuImportant,
                IFNULL(b.b_nfc_customer, 0) AS setting_nfcCustomer,
                IFNULL(b.b_relx, 0) AS setting_relx,
                IFNULL(b.b_income, 0) AS setting_income,
                IFNULL(b.b_scan_discount, 0) AS setting_scanDiscount,
                IFNULL(b.b_print_receipt, 0) AS setting_printReceipt,
                IFNULL(b.b_commision, 0) AS setting_commision,
                IFNULL(b.b_ticketing, 0) AS setting_ticketing, 
                IFNULL(b.b_branch, 0) AS setting_branch,
                IFNULL(b.b_auto_retur, 0) AS setting_autoRetur,
                IFNULL(b.b_package_use_tax, 1) AS setting_packageUseTax,
                IFNULL(b.b_package_use_service_charge, 1) AS setting_packageUseServiceCharge,
                IFNULL(b.i_registration_item_code, 0) AS registration_item_code,
                CASE
                    WHEN b.i_registration_item_code <> 0 THEN (
                        SELECT z.v_name
                        FROM dvw_master.vw_item z
                        WHERE z.i_code = IFNULL(b.i_registration_item_code, 0)
                    )
                    ELSE ''
                END AS registration_item_name,
                CASE
                    WHEN b.i_registration_item_code <> 0 THEN (
                        SELECT z.i_price
                        FROM dvw_master.vw_item z
                        WHERE z.i_code = IFNULL(b.i_registration_item_code, 0)
                    )
                    ELSE 0
                END AS registration_item_price,
                c.i_code AS businessowner_code,
                c.v_phone AS businessowner_phone,
                c.b_isactive AS businessowner_isActive
            FROM dvw_account.vw_business a
            LEFT JOIN dvw_setting.vw_other b ON a.i_code = b.fk_business
            JOIN dvw_account.vw_businessowner c ON a.fk_businessowner = c.i_code
            WHERE a.i_code = ${req.body.user.business_code}
        `)
        if (resultSubscribeCheck.length === 0) return res.status(400).json({success: false, message: 'User tidak ditemukan.'})
        resultSubscribeCheck[0].business_dateExpired = moment(resultSubscribeCheck[0].business_dateExpired).format('YYYY-MM-DD HH:mm:ss')
        resultSubscribeCheck[0].business_dateLastPayment = moment(resultSubscribeCheck[0].business_dateLastPayment).format('YYYY-MM-DD HH:mm:ss')
        return res.status(200).json({success: true, message: 'OK.', data: {
            ...resultSubscribeCheck[0],
            user_name: req.body.user.user_name,
            user_isOwner: req.body.user.user_isOwner,
            user_isManager: req.body.user.user_isManager,
            user_accessMaster: req.body.user.user_accessMaster,
            user_accessProduction: req.body.user.user_accessProduction,
            user_accessInventory: req.body.user.user_accessInventory,
            user_accessStockAdjustment: req.body.user.user_accessStockAdjustment,
            user_accessExpense: req.body.user.user_accessExpense,
            user_accessRelation: req.body.user.user_accessRelation,
            user_accessTransaction: req.body.user.user_accessTransaction,
            user_accessGlobalTransaction: req.body.user.user_accessGlobalTransaction,
            user_accessInvoice: req.body.user.user_accessInvoice,
            user_accessOperational: req.body.user.user_accessOperational,
            user_accessFinance: req.body.user.user_accessFinance,
            user_startOrder: req.body.user.user_startOrder,
        }})
    })
}

export function checkUser({ body }: typeAccount.checkUser, res: Response) {

    pool.getConnection(async function (err, connection) {
        body.hash = body.hash ?? ""
        body.now = body.now ?? ""
        let openreal = ""
        let open = ""
        let close = ""
        try {
            await functionUser.updateUser({ res, connection }, { hash: body.hash })
            let resUserGetOpenClose = await functionUser.getOpenCloseByHash({ res, connection }, { hash: body.hash, now: body.now })
            if (!resUserGetOpenClose) return functionGlobal.sendResponse(res, connection, 400, false, 'Data not Found')
            
            for (let eachOpenClose of resUserGetOpenClose) {
                openreal = eachOpenClose.openreal + ":00"
                open = eachOpenClose.open + ":00"
                close = eachOpenClose.close + ":00"
            }
            let result: any = {}
            let resUserGetUserProperties = await functionUser.getUserProperties({ res, connection }, { hash: body.hash, dt_created: { startdate: open, enddate: close } })
            if (resUserGetUserProperties.code) {
                let businessExpired = resUserGetUserProperties.businessExpired
                if (resUserGetUserProperties.businessPlan === "Free Plan" && resUserGetUserProperties.lastpayment === "0000-00-00 00:00:00") businessExpired = '2100-12-31 00:00:00'
                else if (resUserGetUserProperties.businessPlan === "Free Plan" && resUserGetUserProperties.lastpayment !== "0000-00-00 00:00:00") businessExpired = '2050-12-31 00:00:00'

                return res.status(200).json({success: true, message: 'OK', data: {
                    ...resUserGetUserProperties,
                    image: resUserGetUserProperties.picture,
                    businessExpired: businessExpired,
                    woogigsphone: '6282330779799',
                    adminphone: '6287857650222',
                    open: open,
                    close: close,
                    hash: body.hash
                }})
            }
            else {
                return res.status(400).json({success: false, message: 'User has been login in another device'})
            }
        } catch (err) {
            errors.rollback(connection, res, err, 'controller/account/checkUser')
        }
    })
}

export function login({ body }: typeAccount.login, res: Response) {

    let checkBody = functionGlobal.checkBodyRequest({
        requestBody: body, requiredKeys: [
            { key: 'username', value_type: ['string'] },
            { key: 'password', value_type: ['string'] },
            { key: 'businessCode', value_type: ['string'] },
        ]
    })
    if (checkBody.success === false) return res.status(400).json({ success: false, message: checkBody.message })

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/account/login/getConnection')
        connection.beginTransaction(async function (err) {

            body.username = (body.username.toLocaleLowerCase()).trim()
            body.password = (sha1(body.password)).trim()
            body.application = body.application ?? ""
            body.sdk = body.sdk ?? ""
            body.android = body.android ?? ""
            body.idsmartphone = body.idsmartphone ?? ""
            body.smartphone = body.smartphone ?? ""
            body.now = body.now ?? ""
            body.firebaseToken = body.firebaseToken ?? ""
            body.apps_name = body.apps_name ?? ""

            let responsedata: any = ''

            if (err) return errors.rollback(connection, res, err, 'controller/account/login/beginTransaction')
            try {
                let resGetOpenClose = await functionUser.getOpenCloseByFKBusiness({ res, connection }, { code: body.businessCode, now: body.now })
                if (!resGetOpenClose) return res.status(400).json({ success: false, message: "Data not Found" })

                let openreal = resGetOpenClose.openreal + ":00"
                let open = resGetOpenClose.open + ":00"
                let close = resGetOpenClose.close + ":00"
                responsedata = ""

                if (body.username === "admin@woogigs.com" && body.password === "988317a0736985f297617bf3e1340d2e746dad21") {
                    let resUserGetAdminProperties = await functionUser.getAdminProperties({ res, connection }, { code: body.businessCode })
                    // if( !resUserGetAdminProperties ) return res.status(401).json({success: false, message: "User not found."})
                    responsedata = resUserGetAdminProperties
                    if (resUserGetAdminProperties.business) {
                        let businessExpired = resUserGetAdminProperties.businessExpired
                        if (resUserGetAdminProperties.businessPlan === "Free Plan" && resUserGetAdminProperties.lastpayment === "0000-00-00 00:00:00")
                            businessExpired = '2100-12-31 00:00:00'
                        else if (resUserGetAdminProperties.businessPlan === "Free Plan" && resUserGetAdminProperties.businessExpired < moment().format("YYYY-MM-DD HH:mm:ss")) businessExpired = "2100-12-31 00:00:00"
                        if(body.apps_name == "woogigs"){
                            responsedata['woogigsphone'] = '6282330779799';
                            responsedata['adminphone'] = '6287857650222';
                        }
                        else {
                            responsedata['woogigsphone'] = '6282340399639';
                            responsedata['adminphone'] = '6282340399639';
                        }
                        responsedata['open'] = open;
                        responsedata['close'] = close;
                        responsedata['userlogin'] = '0';
                        responsedata['limit'] = '0';
                        responsedata['businessExpired'] = businessExpired;
                        responsedata['cashin'] = 1;
                        responsedata['datecashin'] = '';
                        responsedata['feature_branch'] = 0
                        responsedata['ticketing'] = 1

                    }
                    else responsedata = ''
                }
                else {
                    let resBusinessGetById = await functionBusiness.getById({res, connection}, {v_code: body.businessCode})
                    if (!resBusinessGetById) return res.status(400).json({success: true, message: 'Kode Bisnis tidak ditemukan!'})
                    let resUserGetById = await functionUser.getById({res, connection}, {v_email: body.username, vw_business: {v_code: body.businessCode}})
                    if (!resUserGetById) return res.status(400).json({success: true, message: 'Pengguna tidak ditemukan!'})
                    
                    let resGetUserLogin = await functionUser.getUserLogin({ res, connection }, { email: body.username, password: body.password }, { business: { code: body.businessCode } })
                    if (!resGetUserLogin) return res.status(401).json({success: true, message: 'Password salah.'})
                    let userlogin: any
                    let limit: any
                    if (resGetUserLogin) responsedata = resGetUserLogin
                    if (resGetUserLogin.limit === 0) resGetUserLogin.limit = 100

                    if (resGetUserLogin.userlogin < resGetUserLogin.limit) {
                        let resUserGetUserPropertiesLogin = await functionUser.getUserPropertiesLogin({ res, connection }, { email: body.username, password: body.password, dt_created: { startdate: open, enddate: close }, woogigs: body.apps_name === 'woogigs' }, { business: { code: body.businessCode } })
                        responsedata = resUserGetUserPropertiesLogin
                        if (resUserGetUserPropertiesLogin.business) {
                            let hash = uniqid()
                            let resUserUpdate = await functionUser.update({ res, connection }, {
                                hash: hash ?? "",
                                woogigsversion: body.application ?? "",
                                androidversion: body.android ?? "",
                                sdk: body.sdk ?? "",
                                idsmartphone: body.idsmartphone ?? "",
                                smartphone: body.smartphone ?? "",
                                email: body.username,
                                password: body.password
                            }, {
                                business: {
                                    code: body.businessCode
                                }
                            })
                            let resUserUpdateFirebase
                            if (body.firebaseToken !== "") resUserUpdateFirebase = await functionUser.updateFirebaseToken({ res, connection }, { firebase_token: body.firebaseToken, email: body.username, password: body.password }, { business: { code: body.businessCode } })
                            let businessExpired = resUserGetUserPropertiesLogin.businessExpired
                            if (resUserGetUserPropertiesLogin.businessPlan === "Free Plan" && resUserGetUserPropertiesLogin.lastpayment === "0000-00-00 00:00:00") businessExpired = '2100-12-31 00:00:00'
                            else if (resUserGetUserPropertiesLogin.businessPlan === "Free Plan" && resUserGetUserPropertiesLogin.businessExpired < moment().format("YYYY-MM-DD HH:mm:ss")) businessExpired = '2100-12-31 00:00:00'

                            responsedata = resUserGetUserPropertiesLogin
                            if(body.apps_name == "woogigs"){
                                responsedata['woogigsphone'] = '6282330779799';
                                responsedata['adminphone'] = '6287857650222';
                            }
                            else {
                                responsedata['woogigsphone'] = '6282340399639';
                                responsedata['adminphone'] = '6282340399639';
                            }
                            responsedata['open'] = open;
                            responsedata['close'] = close;
                            responsedata['userlogin'] = userlogin;
                            responsedata['limit'] = limit;
                            responsedata['businessExpired'] = businessExpired;
                            responsedata['hash'] = hash;
                        } else {
                            let resUserGetCode = await functionUser.getCode({ res, connection }, { email: body.username, password: body.password }, { business: { code: body.businessCode } })
                            if (resUserGetCode.length > 0) return res.status(401).json({ success: false, message: "Check your email or spam to activate your account" })
                            else {
                                let resUserGetCode2 = await functionUser.getCode2({ res, connection }, { email: body.username, password: body.password }, { business: { code: body.businessCode } })
                                if (resUserGetCode2.length > 0) return res.status(401).json({ success: false, message: "Business license expired" })
                                else responsedata = ''
                            }
                        }

                    } else res.status(401).json({ success: false, message: "Limit user full" })
                }

                connection.commit(function (err) {
                    if (err) errors.rollback(connection, res, err, 'controller/account/login/commit')
                    if (responsedata) res.status(200).json({ success: true, message: "OK", data: responsedata })
                    else res.status(400).json({ success: false, message: "User not found" })
                    connection.release()
                })
            } catch {
                errors.rollback(connection, res, err, 'controller/account/login')
            }
        })
    })
}

export type loginOwner = {
    body: {
        business: string,
        application: string,
        sdk: string,
        android: string,
        idsmartphone: string,
        smartphone: string,
        firebaseToken: string,
        now: string
    }
}
export function loginOwner({ body }: loginOwner, res: Response) {

    let checkBody = functionGlobal.checkBodyRequest({
        requestBody: body, requiredKeys: [
            { key: 'business', value_type: ['string'] },
        ]
    })
    if (checkBody.success === false) return res.status(400).json({ success: false, message: checkBody.message })

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/account/login/getConnection')
        connection.beginTransaction(async function (err) {

            body.business = (body.business.toLocaleLowerCase()).trim()
            body.application = body.application ?? ""
            body.sdk = body.sdk ?? ""
            body.android = body.android ?? ""
            body.idsmartphone = body.idsmartphone ?? ""
            body.smartphone = body.smartphone ?? ""
            body.now = body.now ?? ""
            body.firebaseToken = body.firebaseToken ?? ""

            let responsedata: any = ''

            if (err) return errors.rollback(connection, res, err, 'controller/account/loginOwner/beginTransaction')
            try {
                let resGetOpenClose = await functionUser.getOpenCloseByFKBusiness({ res, connection }, { code: body.business, now: body.now })
                if (!resGetOpenClose) return res.status(400).json({ success: false, message: "Data not Found" })

                let openreal = resGetOpenClose.openreal + ":00"
                let open = resGetOpenClose.open + ":00"
                let close = resGetOpenClose.close + ":00"
                responsedata = ""

                
                let userlogin: any

                let resUserGetUserPropertiesLogin = await functionUser.getUserPropertiesLoginOwner({ res, connection }, { business: body.business } )
                responsedata = resUserGetUserPropertiesLogin
                if (resUserGetUserPropertiesLogin.business) {
                    let hash = uniqid()
                    let resUserUpdate = await functionUser.updateByCode({ res, connection }, {
                        hash: hash ?? "",
                        woogigsversion: body.application ?? "",
                        androidversion: body.android ?? "",
                        sdk: body.sdk ?? "",
                        idsmartphone: body.idsmartphone ?? "",
                        smartphone: body.smartphone ?? "",
                        code: responsedata.code
                    })

                    let resUserUpdateFirebase
                    if (body.firebaseToken !== "") resUserUpdateFirebase = await functionUser.updateFirebaseTokenByCode({ res, connection }, { firebase_token: body.firebaseToken, code: body.business } )
                    let businessExpired = resUserGetUserPropertiesLogin.businessExpired
                    if (resUserGetUserPropertiesLogin.businessPlan === "Free Plan" && resUserGetUserPropertiesLogin.lastpayment === "0000-00-00 00:00:00") businessExpired = '2100-12-31 00:00:00'
                    else if (resUserGetUserPropertiesLogin.businessPlan === "Free Plan" && resUserGetUserPropertiesLogin.businessExpired < moment().format("YYYY-MM-DD HH:mm:ss")) businessExpired = '2100-12-31 00:00:00'

                    responsedata = resUserGetUserPropertiesLogin
                    responsedata['woogigsphone'] = '6282340399639';
                    responsedata['adminphone'] = '6282340399639';
                    responsedata['open'] = open;
                    responsedata['close'] = close;
                    responsedata['userlogin'] = userlogin;
                    responsedata['limit'] = 5;
                    responsedata['businessExpired'] = businessExpired;
                    responsedata['hash'] = hash;
                }


                connection.commit(function (err) {
                    if (err) errors.rollback(connection, res, err, 'controller/account/loginOwner/commit')
                    if (responsedata) res.status(200).json({ success: true, message: "OK", data: responsedata })
                    else res.status(400).json({ success: false, message: "User not found" })
                    connection.release()
                })
            } catch {
                errors.rollback(connection, res, err, 'controller/account/loginOwner')
            }
        })
    })
}

export async function checkOwner(req: typeAccount.checkOwner, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/unit/checkOwner/getConnection')
        try {
            let resGetCheckOwner = await functionUser.checkOwner({ res, connection }, { hash: req.body.hash })
            return res.status(200).json({ success: true, message: "OK", data: resGetCheckOwner })
        } catch {
            return errors.rollback(connection, res, err, 'controller/unit/checkOwner')
        }
    })
}

export function loginLoyalty({ body }: loginLoyalty, res: Response) {

    let checkBody = functionGlobal.checkBodyRequest({
        requestBody: body, requiredKeys: [
            { key: 'username', value_type: ['string'] },
            { key: 'password', value_type: ['string'] },
        ]
    })
    if (checkBody.success === false) return res.status(400).json({ success: false, message: checkBody.message })

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/account/loginLoyalty/getConnection')
        connection.beginTransaction(async function (err) {

            body.username = (body.username.toLocaleLowerCase()).trim()
            body.password = (sha1(body.password)).trim()

            let responsedata: any = ''

            if (err) return errors.rollback(connection, res, err, 'controller/account/loginLoyalty/beginTransaction')
            try {
                responsedata = ""
                let userlogin: any

                let resUserGetUserPropertiesLogin = await functionUser.loginLoyalty({ res, connection }, { username: body.username, password: body.password } )
                responsedata = resUserGetUserPropertiesLogin
                
                connection.commit(function (err) {
                    if (err) errors.rollback(connection, res, err, 'controller/account/loginLoyalty/commit')
                    if (responsedata) res.status(200).json({ success: true, message: "OK", data: responsedata })
                    else res.status(400).json({ success: false, message: "User not found" })
                    connection.release()
                })
            } catch {
                errors.rollback(connection, res, err, 'controller/account/loginLoyalty')
            }
        })
    })
}

export async function logoutV3(req: typeAccount.logoutV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/account/logoutV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/account/logoutV3/beginTransaction')
                let resUpdatePreferences = await functionUser.logout({res, connection}, {hash: req.headers["x-auth-token"]})
                if (resUpdatePreferences.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/account/logoutV3/commit')
                    return res.status(200).json({success: true, message: "Logout", data: resUpdatePreferences})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/account/logoutV3')
        }
    })
}

export async function loginV3(req: typeAccount.loginV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['business_code', 'username', 'password'])
            let requestBody = {
                business_code: <string>req.body.business_code,
                username: <string>req.body.username,
                password: <string>req.body.password,
                version_woogigs: <string>req.body.version_woogigs ?? '',
                version_mobile: <string>req.body.version_mobile ?? '',
                imei: <string>req.body.imei ?? '',
                smartphone: <string>req.body.smartphone ?? '',
                now: <string>req.body.now ?? '',
                firebase_token: <string>req.body.firebase_token ?? '',
                source: <string>req.body.source ?? '',
                browser: <string>req.body.browser ?? ''
            }
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/account/loginV3')

        try {
            // if (businessCode === '%%') {}
        } catch (err) {
            return errors.rollback(connection, res, err, 'controller/account/loginV3')
        }
    })
}