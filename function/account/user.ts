import { ResultSetHeader } from "mysql2"
import * as functionGlobal from "../../function/global_function"
import * as typeGlobal from "../../type/global"

type getFirebaseTokenBackoffice = {
    firebaseTokens: string[]
}
export async function getFirebaseTokenBackoffice({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<getFirebaseTokenBackoffice> {
    return new Promise(async (resolve, reject) => {
        type resultQuery = Array<{
            firebase_token: string
        }>
        let query = `SELECT a.v_firebase_token_backoffice AS "firebase_token"
                    FROM dvw_account.vw_user a
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_isactive = 1
                        AND a.v_firebase_token_backoffice <> ''
                    UNION ALL
                    SELECT a.v_firebase_token_monitor AS "firebase_token"
                    FROM dvw_account.vw_user a
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_isactive = 1
                        AND a.v_firebase_token_monitor <> ''`
        let result: resultQuery = await new Promise((resolve, reject) => functionGlobal.query(query, res, connection, 'function/account/getFirebaseTokenBackoffice', resolve))
        resolve(<getFirebaseTokenBackoffice>{
            firebaseTokens: result.map((eachResult) => eachResult.firebase_token)
        }
        )
    })
}

export async function updateUser({ res, connection }: typeGlobal.functions, { hash }: { hash: string }) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE 
                        dvw_account.vw_user a 
                    SET
                        a.dt_loginapp = NOW()
                    WHERE a.v_hash = '${hash}'`
        functionGlobal.query(query, res, connection, 'function/account/user/updateUser', resolve)
    })
}

type getOpenClose = {
    openreal: string,
    open: string,
    close: string
}
export async function getOpenCloseByHash({ res, connection }: typeGlobal.functions, { now, hash }: { now?: string, hash: string }): Promise<Array<getOpenClose>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        IFNULL
                        (
                            CASE
                                WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) <= TIME(${`'${now}'` || 'NOW()'}) THEN CONCAT(DATE(${`'${now}'` || 'NOW()'}) + INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                                ELSE CONCAT(DATE(${`'${now}'` || 'NOW()'}), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                            END,
                            CONCAT(DATE(${`'${now}'` || 'NOW()'}) - INTERVAL 1 day, ' 00:00')
                        ) AS openreal,
                        IFNULL
                        (
                            CASE
                                WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME(${`'${now}'` || 'NOW()'}) THEN CONCAT(DATE(${`'${now}'` || 'NOW()'}) - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                ELSE CONCAT((DATE(${`'${now}'` || 'NOW()'}) + INTERVAL 1 DAY) - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                            END,
                            CONCAT(DATE(${`'${now}'` || 'NOW()'}), ' 00:00')
                        ) AS open,
                        IFNULL
                        (
                            CASE
                                WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME(${`'${now}'` || 'NOW()'}) THEN CONCAT(DATE(${`'${now}'` || 'NOW()'}), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                ELSE CONCAT(DATE(${`'${now}'` || 'NOW()'}) + INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                            END,
                            CONCAT(DATE(${`'${now}'` || 'NOW()'}), ' 00:00')
                        ) AS close,
                        COUNT(1)
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.v_hash = '${hash}'`
        functionGlobal.query(query, res, connection, 'function/account/user/getOpenClose', resolve)
    })
}

export async function getOpenCloseByFKBusiness({ res, connection }: typeGlobal.functions, { code, now }: { code: string, now?: string }): Promise<getOpenClose> {
    return new Promise((resolve, reject) => {
        if(now == ""){
            let query = `SELECT
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) <= TIME(NOW()) THEN CONCAT(DATE(NOW()) + INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                                    ELSE CONCAT(DATE(NOW()), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                                END,
                                CONCAT(DATE(NOW()) - INTERVAL 1 day, ' 00:00')
                            ) AS openreal,
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME(NOW()) THEN CONCAT(DATE(NOW()) - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT((DATE(NOW()) + INTERVAL 1 DAY) - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE(NOW()), ' 00:00')
                            ) AS open,
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME(NOW()) THEN CONCAT(DATE(NOW()), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT(DATE(NOW()) + INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE(NOW()), ' 00:00')
                            ) AS close,
                            COUNT(1)
                        FROM dvw_account.vw_business b
                        WHERE b.v_code = '${code}'`
                functionGlobal.querySingle(query, res, connection, 'function/account/user/getOpenCloseByFKBusiness', resolve)
        }
        else{
            let query = `   SELECT
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) <= TIME('${now}') THEN CONCAT(DATE('${now}') + INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                                    ELSE CONCAT(DATE('${now}'), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',1))
                                END,
                                CONCAT(DATE('${now}') - INTERVAL 1 day, ' 00:00')
                            ) AS 'openreal',
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${now}') THEN CONCAT(DATE('${now}') - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT((DATE('${now}') + INTERVAL 1 DAY) - INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE('${now}'), ' 00:00')
                            ) AS 'open',
                            IFNULL
                            (
                                CASE
                                    WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${now}') THEN CONCAT(DATE('${now}'), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                    ELSE CONCAT(DATE('${now}') + INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                END,
                                CONCAT(DATE('${now}'), ' 00:00')
                            ) AS 'close',
                            COUNT(1)
                        FROM dvw_account.vw_business b
                        WHERE b.v_code = '${code}'`
                functionGlobal.querySingle(query, res, connection, 'function/account/user/getOpenCloseByFKBusiness', resolve)
        }
    })
}

type getUserProperties = {
    code: any,
    name: any,
    business: any,
    business_owner: any,
    password: any,
    owner: any,
    manager: any,
    businessExpired: any,
    ctrpayment: any,
    businessCode: any,
    businessName: any,
    businessPlan: any,
    businessAddress: any,
    businessCity: any,
    businessPhone: any,
    username: any,
    picture: any,
    master: any,
    production: any,
    inventory: any,
    expense: any,
    relation: any,
    transaction: any,
    globaltransaction: any,
    invoice: any,
    communityads: any,
    operational: any,
    finance: any,
    stock_adjustment: any,
    tax: any,
    sc: any,
    startorder: any,
    multidevice: any,
    extradevice: any,
    useformulasell: any,
    roundedtype: any,
    currency: any,
    thousandseparator: any,
    decimalpoint: any,
    loyalty: any,
    communitymodule: any,
    productionmodule: any,
    inventorymodule: any,
    accountingmodule: any,
    purchaseordermodule: any,
    barcodesystemmodule: any,
    packagesalemodule: any,
    openbillmodule: any,
    openbillonlinemodule: any,
    splitbillmodule: any,
    websitereportmodule: any,
    reportfilteringmodule: any,
    printermodule: any,
    invoicemodule: any,
    shiftmodule: any,
    variantpricemodule: any,
    multiunitmodule: any,
    customerloyaltymodule: any,
    whatsappmodule: any,
    limitmastermodule: any,
    limittransactionmodule: any,
    limitmaster: any,
    limittransaction: any,
    cashin: any,
    datecashin: any,
    point: any,
    pin: any,
    usevoidtransactionpin: any,
    voidtransactionpin: any,
    pinvoid: any,
    usepinvoid: any,
    pindiscount: any,
    usepindiscount: any,
    pinpo: any,
    usepinpo: any,
    lastpayment: any,
    cashlezusername: any,
    cashlezpassword: any,
    token_looyal: any,
    useovo: any,
    usegopay: any,
    pph: any,
    itemservice: any,
    tracking: any,
    stockinclude: any,
    absence: any,
    table_management: any,
    ppn_sc_type: any,
    printer_special: any,
    customer_phone_priority: any,
    delivery_order: any,
    price_distributor_automatic: any,
    sku_important: any,
    nfc_customer: any,
    stock_opname: any,
    auto_retur: any,
    branch: any,
    relx: any,
    income: any,
    scan_discount: any,
    print_receipt: any,
    commision: any,
    ticketing: any,
    status_verification: any,
}
export async function getUserProperties({ res, connection }: typeGlobal.functions, { hash, dt_created }: { hash: string, dt_created: { startdate: string, enddate: string } }): Promise<getUserProperties> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                    a.i_code AS code,
                    a.v_name AS name,
                    a.fk_business AS business,
                    b.fk_businessowner AS "business_owner",
                    a.v_password AS password,
                    a.b_isowner AS owner,
                    a.b_ismanager AS manager,
                    b.dt_expired AS businessExpired,
                    b.i_ctrpayment AS ctrpayment,
                    b.v_code AS businessCode,
                    b.v_name AS businessName,
                    b.v_currentplan AS businessPlan,
                    b.dt_expired AS businessExpired,
                    b.v_address AS businessAddress,
                    b.v_city AS businessCity,
                    b.v_phone AS businessPhone,
                    a.v_email AS username,
                    b.v_image AS picture,
                    a.b_master AS master,
                    a.b_production AS production,
                    a.b_inventory AS inventory,
                    a.b_expense AS expense,
                    a.b_relation AS relation,
                    a.b_transaction AS transaction,
                    a.b_globaltransaction AS globaltransaction,
                    a.b_invoice AS invoice,
                    a.b_communityads AS communityads,
                    a.b_operational AS operational,
                    a.b_finance AS finance,
                    a.b_stock_adjustment AS stock_adjustment,
                    b.i_tax AS tax,
                    b.i_servicecharge AS sc,
                    a.i_startorder AS startorder,
                    b.b_ismultidevice AS multidevice,
                    b.i_extradevice AS extradevice,
                    b_useformulasell AS useformulasell,
                    i_roundedtype AS roundedtype,
                    b.v_currency AS currency,
                    b.v_thousandseparator AS thousandseparator,
                    b.v_decimalpoint AS decimalpoint,
                    b.b_loyalty AS loyalty,
                    b.b_communitymodule AS communitymodule,
                    b.b_productionmodule AS productionmodule,
                    b.b_inventorymodule AS inventorymodule,
                    b.b_accountingmodule AS accountingmodule,
                    b.b_purchaseordermodule AS purchaseordermodule,
                    b.b_barcodesystemmodule AS barcodesystemmodule,
                    b.b_packagesalemodule AS packagesalemodule,
                    b.b_openbillmodule AS openbillmodule,
                    b.b_openbillonlinemodule AS openbillonlinemodule,
                    b.b_splitbillmodule AS splitbillmodule,
                    b.b_websitereportmodule AS websitereportmodule,
                    b.b_reportfilteringmodule AS reportfilteringmodule,
                    b.b_printermodule AS printermodule,
                    b.b_invoicemodule AS invoicemodule,
                    b.b_shiftmodule AS shiftmodule,
                    b.b_variantpricemodule AS variantpricemodule,
                    b.b_multiunitmodule AS multiunitmodule,
                    b.b_customerloyaltymodule AS customerloyaltymodule,
                    b.b_whatsappmodule AS whatsappmodule,
                    b.b_limit_mastermodule AS limitmastermodule,
                    b.b_limit_transactionmodule AS limittransactionmodule,
                    b.i_limitmaster AS limitmaster,
                    b.i_limittransaction AS limittransaction,
                    COUNT(c.i_code) AS cashin,
                    IFNULL(c.dt_created, '') AS datecashin,
                    b.i_point AS point,
                    b.v_pin AS pin,
                    b.b_voidtransactionpin AS usevoidtransactionpin,
                    b.v_pin AS voidtransactionpin,
                    b.v_pinvoid AS pinvoid,
                    b.b_pinvoid AS usepinvoid,
                    b.v_pindiscount AS pindiscount,
                    b.b_pindiscount AS usepindiscount,
                    b.v_pinpo AS pinpo,
                    b.b_pinpo AS usepinpo,
                    b.dt_lastpayment AS lastpayment,
                    b.v_cashlez_username AS cashlezusername,
                    b.v_cashlez_password AS cashlezpassword,
                    b.v_token_looyal AS "token_looyal",
                    IFNULL(d.b_ovo, '0') AS useovo,
                    IFNULL(d.b_gopay, '0') AS usegopay,
                    IFNULL(e.d_pph, '0') AS pph,
                    IFNULL(e.d_itemservice, '0') AS itemservice,
                    IFNULL(e.b_tracking, '0') AS "tracking",
                    IFNULL(e.b_stockinclude, '0') AS "stockinclude",
                    IFNULL(e.b_absence, '0') AS "absence",
                    IFNULL(e.b_table_management, '0') AS "table_management",
                    IFNULL(e.b_ppn_sc_type, '0') AS "ppn_sc_type",
                    IFNULL(e.b_printer_special, '0') AS "printer_special",
                    IFNULL(e.b_customer_phone_priority, '1') AS "customer_phone_priority",
                    IFNULL(e.b_delivery_order, '0') AS "delivery_order",
                    IFNULL(e.b_price_distributor_automatic, '0') AS "price_distributor_automatic",
                    IFNULL(e.b_sku_important, '0') AS "sku_important",
                    IFNULL(e.b_nfc_customer, '0') AS "nfc_customer",
                    IFNULL(e.b_stock_opname, '0') AS "stock_opname",
                    IFNULL(e.b_auto_retur, '0') AS "auto_retur",
                    IFNULL(e.b_branch, '0') AS "branch",
                    IFNULL(e.b_relx, '0') AS "relx",
                    IFNULL(e.b_income, '0') AS "income",
                    IFNULL(e.b_scan_discount, '0') AS "scan_discount",
                    IFNULL(e.b_print_receipt, '0') AS "print_receipt",
                    IFNULL(e.b_commision, '0') AS "commision",
                    IFNULL(e.b_ticketing, '0') AS "ticketing",
                    f.b_isactive AS "status_verification"
                FROM dvw_account.vw_user a
                JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                LEFT JOIN dvw_operational.vw_cash c ON a.fk_business = c.fk_business AND a.i_code = c.fk_user AND c.fk_cashrecap = 0 AND c.dt_created >= '${dt_created.startdate}' AND c.dt_created <= '${dt_created.enddate}' AND c.b_isactive = 1
                LEFT JOIN dvw_account.vw_payment_integration d ON a.fk_business = d.fk_business
                LEFT JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                JOIN dvw_account.vw_businessowner f ON b.fk_businessowner = f.i_code
                WHERE a.b_isactive = 1
                    AND a.v_hash = '${hash}'`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getUserProperties', resolve)
    })
}

type getAdminProperties = {
    code: number,
    name: string,
    business: number,
    business_owner: number,
    password: string,
    owner: number,
    manager: number,
    businessCode: string,
    businessName: string,
    businessPlan: string,
    businessExpired: string,
    ctrpayment: number,
    businessAddress: string,
    businessCity: string,
    businessPhone: string,
    username: string,
    image: string,
    master: number,
    production: number,
    inventory: number,
    expense: number,
    relation: number,
    transaction: number,
    globaltransaction: number,
    invoice: number,
    communityads: number,
    operational: number,
    finance: number,
    tax: number,
    sc: number,
    startorder: number,
    multidevice: number,
    extradevice: number,
    useformulasell: number,
    roundedtype: number,
    currency: string,
    thousandseparator: string,
    decimalpoint: string,
    loyalty: number,
    communitymodule: number,
    productionmodule: number,
    inventorymodule: number,
    accountingmodule: number,
    purchaseordermodule: number,
    barcodesystemmodule: number,
    packagesalemodule: number,
    openbillmodule: number,
    openbillonlinemodule: number,
    splitbillmodule: number,
    websitereportmodule: number,
    reportfilteringmodule: number,
    printermodule: number,
    invoicemodule: number,
    shiftmodule: number,
    variantpricemodule: number,
    multiunitmodule: number,
    customerloyaltymodule: number,
    whatsappmodule: number,
    limitmastermodule: number,
    limittransactionmodule: number,
    limitmaster: number,
    limittransaction: number,
    point: number,
    pin: string,
    usevoidtransactionpin: number,
    voidtransactionpin: string,
    pinvoid: string,
    usepinvoid: number,
    pindiscount: string,
    usepindiscount: number,
    pinpo: string,
    usepinpo: number,
    lastpayment: string,
    cashlezusername: string,
    cashlezpassword: string,
    token_looyal: string,
    useovo: number,
    usegopay: number,
    pph: number,
    itemservice: number,
    tracking: number,
    stockinclude: number,
    absence: number,
    table_management: number,
    printer_special: number,
    printer_special_fnb: number,
    ppn_sc_type: number,
    customer_phone_priority: number,
    delivery_order: number,
    price_distributor_automatic: number,
    sku_important: number,
    nfc_customer: number,
    stock_opname: number,
    auto_retur: number,
    branch: number,
    relx: number,
    jvape: number,
    income: number,
    scan_discount: number,
    print_receipt: number,
    commision: number,
    status_verification: number
}
export async function getAdminProperties({ res, connection }: typeGlobal.functions, { code }: { code: string }): Promise<getAdminProperties> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        0 AS 'code',
                        'Woogigs' AS 'name',
                        a.i_code AS 'business',
                        SHA1(a.i_code) AS 'hash',
                        a.fk_businessowner AS 'business_owner',
                        '' AS 'password',
                        1 AS 'owner',
                        1 AS 'manager',								
                        a.v_code AS 'businessCode',
                        a.v_name AS 'businessName',
                        a.v_currentplan AS 'businessPlan',
                        a.dt_expired AS 'businessExpired',
                        a.i_ctrpayment AS 'ctrpayment',
                        a.v_address AS 'businessAddress',
                        a.v_city AS 'businessCity',
                        a.v_phone AS 'businessPhone',
                        'admin@woogigs.com' AS 'username',
                        a.v_image AS 'image',
                        1 AS 'master',
                        1 AS 'production',
                        1 AS 'inventory',
                        1 AS 'expense',
                        1 AS 'relation',
                        1 AS 'transaction',
                        1 AS 'globaltransaction',
                        1 AS 'invoice',
                        1 AS 'communityads',
                        1 AS 'operational',
                        0 AS 'finance',
                        1 AS 'cashin',
                        '' AS 'datecashin',
                        a.i_tax AS 'tax',
                        a.i_servicecharge AS 'sc',
                        a.i_startorder AS 'startorder',
                        a.b_ismultidevice AS 'multidevice',
                        a.i_extradevice-1 AS 'extradevice',
                        a.b_useformulasell AS 'useformulasell',
                        a.i_roundedtype AS 'roundedtype',
                        a.v_currency AS 'currency',
                        a.v_thousandseparator AS 'thousandseparator',
                        a.v_decimalpoint AS 'decimalpoint',
                        a.b_loyalty AS 'loyalty',
                        a.b_communitymodule AS 'communitymodule',
                        a.b_productionmodule AS 'productionmodule',
                        a.b_inventorymodule AS 'inventorymodule',
                        a.b_accountingmodule AS 'accountingmodule',
                        a.b_purchaseordermodule AS 'purchaseordermodule',
                        a.b_barcodesystemmodule AS 'barcodesystemmodule',
                        a.b_packagesalemodule AS 'packagesalemodule',
                        a.b_openbillmodule AS 'openbillmodule',
                        a.b_openbillonlinemodule AS 'openbillonlinemodule',
                        a.b_splitbillmodule AS 'splitbillmodule',
                        a.b_websitereportmodule AS 'websitereportmodule',
                        a.b_reportfilteringmodule AS 'reportfilteringmodule',
                        a.b_printermodule AS 'printermodule',
                        a.b_invoicemodule AS 'invoicemodule',
                        a.b_shiftmodule AS 'shiftmodule',
                        a.b_variantpricemodule AS 'variantpricemodule',
                        a.b_multiunitmodule AS 'multiunitmodule',
                        a.b_customerloyaltymodule AS 'customerloyaltymodule',
                        a.b_whatsappmodule AS 'whatsappmodule',
                        a.b_limit_mastermodule AS 'limitmastermodule',
                        a.b_limit_transactionmodule AS 'limittransactionmodule',
                        1 AS 'stock_adjustment',
                        a.i_limitmaster AS 'limitmaster',
                        a.i_limittransaction AS 'limittransaction',
                        a.i_point AS 'point',
                        a.v_pin AS 'pin',
                        a.b_voidtransactionpin AS 'usevoidtransactionpin',
                        a.v_pin AS 'voidtransactionpin',
                        a.v_pinvoid AS 'pinvoid',
                        a.b_pinvoid AS 'usepinvoid',
                        a.v_pindiscount AS 'pindiscount',
                        a.b_pindiscount AS 'usepindiscount',
                        a.v_pinpo AS 'pinpo',
                        a.b_pinpo AS 'usepinpo',
                        a.dt_lastpayment AS 'lastpayment',
                        a.v_cashlez_username AS 'cashlezusername',
                        a.v_cashlez_password AS 'cashlezpassword',
                        a.v_token_looyal AS 'token_looyal',
                        IFNULL(b.b_ovo, '0') AS 'useovo',
                        IFNULL(b.b_gopay, '0') AS 'usegopay',
                        IFNULL(c.d_pph, '0') AS 'pph',
                        IFNULL(c.d_itemservice, '0') AS 'itemservice',
                        IFNULL(c.b_tracking, '0') AS 'tracking',
                        IFNULL(c.b_stockinclude, '0') AS 'stockinclude',
                        IFNULL(c.b_absence, '0') AS 'absence',
                        IFNULL(c.b_table_management, '0') AS 'table_management',
                        IFNULL(c.b_printer_special, '0') AS 'printer_special',
                        IFNULL(c.b_printer_special_fnb, '0') AS 'printer_special_fnb',
                        IFNULL(c.b_ppn_sc_type, '0') AS 'ppn_sc_type',
                        IFNULL(c.b_customer_phone_priority, '1') AS 'customer_phone_priority',
                        IFNULL(c.b_delivery_order, '0') AS 'delivery_order',
                        IFNULL(c.b_price_distributor_automatic, '0') AS 'price_distributor_automatic',
                        IFNULL(c.b_sku_important, '0') AS 'sku_important',
                        IFNULL(c.b_nfc_customer, '0') AS 'nfc_customer',
                        IFNULL(c.b_stock_opname, '0') AS 'stock_opname',
                        IFNULL(c.b_auto_retur, '0') AS 'auto_retur',
                        IFNULL(c.b_branch, '0') AS 'branch',
                        IFNULL(c.b_relx, '0') AS 'relx',
                        IFNULL(c.b_jvape, '0') AS 'jvape',
                        IFNULL(c.b_income, '0') AS 'income',
                        IFNULL(c.b_scan_discount, '0') AS 'scan_discount',
                        IFNULL(c.b_print_receipt, '0') AS 'print_receipt',
                        IFNULL(c.b_commision, '0') AS 'commision',
                        d.b_isactive AS 'status_verification'
                    FROM dvw_account.vw_business a
                    LEFT JOIN dvw_account.vw_payment_integration b ON a.i_code = b.fk_business
                    LEFT JOIN dvw_setting.vw_other c ON a.i_code = c.fk_business
                    JOIN dvw_account.vw_businessowner d ON a.fk_businessowner = d.i_code
                    WHERE (a.b_isactive = 1 OR a.b_isactive = 2)
                        AND LOWER(a.v_code) = '${code}'`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getAdminProperties', resolve)
    })
}

type getUserLogin = {
    userlogin: number,
    limit: number
}
export async function getUserLogin({ res, connection }: typeGlobal.functions, { email, password }: { email: string, password: string }, { business }: { business: { code: string } }): Promise<getUserLogin> {
    return new Promise((resolve, reject) => {
        let query = `SELECT COUNT(1) AS "userlogin", IFNULL(b.i_extradevice, 0) AS "limit"
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    WHERE b.v_code = '${business.code}'
                        AND a.b_isactive = 1
                        AND a.v_hash <> ''
                        AND NOT
                        (
                            a.v_email = '${email}'
                            AND 
                            a.v_password = '${password}'
                        )`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getUserLogin', resolve)
    })
}

type getUserPropertiesLogin = {
    code: number,
    name: string,
    business: number,
    business_owner: number,
    password: string,
    owner: number,
    manager: number,
    businessExpired: string,
    ctrpayment: number,
    businessCode: string,
    businessName: string,
    businessPlan: string,
    businessAddress: string,
    businessCity: string,
    businessPhone: string,
    username: string,
    image: string,
    master: number,
    production: number,
    inventory: number,
    expense: number,
    relation: number,
    transaction: number,
    globaltransaction: number,
    invoice: number,
    communityads: number,
    operational: number,
    finance: number,
    tax: number,
    sc: number,
    startorder: number,
    multidevice: number,
    extradevice: number,
    useformulasell: number,
    roundedtype: number,
    currency: string,
    thousandseparator: string,
    decimalpoint: string,
    loyalty: number,
    communitymodule: number,
    productionmodule: number,
    inventorymodule: number,
    accountingmodule: number,
    purchaseordermodule: number,
    barcodesystemmodule: number,
    packagesalemodule: number,
    openbillmodule: number,
    openbillonlinemodule: number,
    splitbillmodule: number,
    websitereportmodule: number,
    reportfilteringmodule: number,
    printermodule: number,
    invoicemodule: number,
    shiftmodule: number,
    variantpricemodule: number,
    multiunitmodule: number,
    customerloyaltymodule: number,
    whatsappmodule: number,
    limitmastermodule: number,
    limittransactionmodule: number,
    limitmaster: number,
    limittransaction: number,
    cashin: number,
    datecashin: string,
    point: number,
    pin: string,
    usevoidtransactionpin: number,
    voidtransactionpin: string,
    pinvoid: string,
    usepinvoid: number,
    pindiscount: string,
    usepindiscount: number,
    pinpo: string,
    usepinpo: number,
    lastpayment: string,
    cashlezusername: string,
    cashlezpassword: string,
    token_looyal: string,
    useovo: number,
    usegopay: number,
    pph: number,
    itemservice: number,
    tracking: number,
    stockinclude: number,
    absence: number,
    table_management: number,
    printer_special: number,
    printer_special_fnb: number,
    ppn_sc_type: number,
    customer_phone_priority: number,
    delivery_order: number,
    price_distributor_automatic: number,
    sku_important: number,
    nfc_customer: number,
    stock_opname: number,
    auto_retur: number,
    branch: number,
    relx: number,
    jvape: number,
    income: number,
    scan_discount: number,
    print_receipt: number,
    commision: number,
    status_verification: number,
}
export async function getUserPropertiesLogin({ res, connection }: typeGlobal.functions, { email, password, dt_created, woogigs }: { email: string, password: string, dt_created: { startdate: string, enddate: string }, woogigs: boolean }, { business: { code } }: { business: { code: string } }): Promise<getUserPropertiesLogin> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_code AS 'code',
                        a.v_name AS 'name',
                        a.fk_business AS 'business',
                        b.fk_businessowner AS 'business_owner',
                        a.v_password AS 'password',
                        a.b_isowner AS 'owner',
                        a.b_ismanager AS 'manager',
                        b.dt_expired AS 'businessExpired',
                        b.i_ctrpayment AS 'ctrpayment',
                        b.v_code AS 'businessCode',
                        b.v_name AS 'businessName',
                        b.v_currentplan AS 'businessPlan',
                        b.dt_expired AS 'businessExpired',
                        b.v_address AS 'businessAddress',
                        b.v_city AS 'businessCity',
                        b.v_phone AS 'businessPhone',
                        a.v_email AS 'username',
                        b.v_image AS 'image',
                        a.b_master AS 'master',
                        a.b_production AS 'production',
                        a.b_inventory AS 'inventory',
                        a.b_expense AS 'expense',
                        a.b_relation AS 'relation',
                        a.b_transaction AS 'transaction',
                        a.b_globaltransaction AS 'globaltransaction',
                        a.b_invoice AS 'invoice',
                        a.b_communityads AS 'communityads',
                        a.b_operational AS 'operational',
                        a.b_finance AS 'finance',
                        a.b_stock_adjustment AS 'stock_adjustment',
                        b.i_tax AS 'tax',
                        b.i_servicecharge AS 'sc',
                        a.i_startorder AS 'startorder',
                        b.b_ismultidevice AS 'multidevice',
                        b.i_extradevice-1 AS 'extradevice',
                        b.b_useformulasell AS 'useformulasell',
                        b.i_roundedtype AS 'roundedtype',
                        b.v_currency AS 'currency',
                        b.v_thousandseparator AS 'thousandseparator',
                        b.v_decimalpoint AS 'decimalpoint',
                        b.b_loyalty AS 'loyalty',
                        b.b_communitymodule AS 'communitymodule',
                        b.b_productionmodule AS 'productionmodule',
                        b.b_inventorymodule AS 'inventorymodule',
                        b.b_accountingmodule AS 'accountingmodule',
                        b.b_purchaseordermodule AS 'purchaseordermodule',
                        b.b_barcodesystemmodule AS 'barcodesystemmodule',
                        b.b_packagesalemodule AS 'packagesalemodule',
                        b.b_openbillmodule AS 'openbillmodule',
                        b.b_openbillonlinemodule AS 'openbillonlinemodule',
                        b.b_splitbillmodule AS 'splitbillmodule',
                        b.b_websitereportmodule AS 'websitereportmodule',
                        b.b_reportfilteringmodule AS 'reportfilteringmodule',
                        b.b_printermodule AS 'printermodule',
                        b.b_invoicemodule AS 'invoicemodule',
                        b.b_shiftmodule AS 'shiftmodule',
                        b.b_variantpricemodule AS 'variantpricemodule',
                        b.b_multiunitmodule AS 'multiunitmodule',
                        b.b_customerloyaltymodule AS 'customerloyaltymodule',
                        b.b_whatsappmodule AS 'whatsappmodule',
                        b.b_limit_mastermodule AS 'limitmastermodule',
                        b.b_limit_transactionmodule AS 'limittransactionmodule',
                        b.i_limitmaster AS 'limitmaster',
                        b.i_limittransaction AS 'limittransaction',
                        COUNT(c.i_code) AS 'cashin',
                        IFNULL(c.dt_created, '') AS 'datecashin',
                        b.i_point AS 'point',
                        b.v_pin AS 'pin',
                        b.b_voidtransactionpin AS 'usevoidtransactionpin',
                        b.v_pin AS 'voidtransactionpin',
                        b.v_pinvoid AS 'pinvoid',
                        b.b_pinvoid AS 'usepinvoid',
                        b.v_pindiscount AS 'pindiscount',
                        b.b_pindiscount AS 'usepindiscount',
                        b.v_pinpo AS 'pinpo',
                        b.b_pinpo AS 'usepinpo',
                        b.dt_lastpayment AS 'lastpayment',
                        b.v_cashlez_username AS 'cashlezusername',
                        b.v_cashlez_password AS 'cashlezpassword',
                        b.v_token_looyal AS 'token_looyal',
                        IFNULL(e.b_ovo, '0') AS 'useovo',
                        IFNULL(e.b_gopay, '0') AS 'usegopay',
                        IFNULL(f.d_pph, '0') AS 'pph',
                        IFNULL(f.d_itemservice, '0') AS 'itemservice',
                        IFNULL(f.b_tracking, '0') AS 'tracking',
                        IFNULL(f.b_stockinclude, '0') AS 'stockinclude',
                        IFNULL(f.b_absence, '1') AS 'absence',
                        IFNULL(f.b_table_management, '0') AS 'table_management',
                        IFNULL(f.b_printer_special, '0') AS 'printer_special',
                        IFNULL(f.b_printer_special_fnb, '0') AS 'printer_special_fnb',
                        IFNULL(f.b_ppn_sc_type, '0') AS 'ppn_sc_type',
                        IFNULL(f.b_customer_phone_priority, '1') AS 'customer_phone_priority',
                        IFNULL(f.b_delivery_order, '0') AS 'delivery_order',
                        IFNULL(f.b_price_distributor_automatic, '0') AS 'price_distributor_automatic',
                        IFNULL(f.b_sku_important, '0') AS 'sku_important',
                        IFNULL(f.b_nfc_customer, '0') AS 'nfc_customer',
                        IFNULL(f.b_stock_opname, '0') AS 'stock_opname',
                        IFNULL(f.b_auto_retur, '0') AS 'auto_retur',
                        IFNULL(f.b_branch, '0') AS 'branch',
                        IFNULL(f.b_relx, '0') AS 'relx',
                        IFNULL(f.b_jvape, '0') AS 'jvape',
                        IFNULL(f.b_income, '0') AS 'income',
                        IFNULL(f.b_scan_discount, '0') AS 'scan_discount',
                        IFNULL(f.b_print_receipt, '0') AS 'print_receipt',
                        IFNULL(f.b_commision, '0') AS 'commision',
                        ${woogigs ?
                        `IFNULL(f.b_ticketing, '0') AS 'ticketing',`
                        : ``}
                        d.b_isactive AS 'status_verification',
                        IFNULL(f.b_branch, '0') AS 'feature_branch'
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    JOIN dvw_account.vw_businessowner d ON b.fk_businessowner = d.i_code
                    LEFT JOIN dvw_operational.vw_cash c ON a.fk_business = c.fk_business AND a.i_code = c.fk_user AND c.fk_cashrecap = 0 AND c.dt_created >= '${dt_created.startdate}' AND c.dt_created <= '${dt_created.enddate}' AND c.b_isactive = 1
                    LEFT JOIN dvw_account.vw_payment_integration e ON a.fk_business = e.fk_business
                    LEFT JOIN dvw_setting.vw_other f ON a.fk_business = f.fk_business
                    WHERE a.b_isactive = 1
                        AND LOWER(b.v_code) = '${code}'
                        AND LOWER(a.v_email) = '${email}'
                        AND a.v_password = '${password}'`
        
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getUserPropertiesLogin', resolve)
    })
}

export async function getUserPropertiesLoginOwner({ res, connection }: typeGlobal.functions, { business }: { business: string } ): Promise<getUserPropertiesLogin> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_code AS 'code',
                        a.v_name AS 'name',
                        a.fk_business AS 'business',
                        b.fk_businessowner AS 'business_owner',
                        a.v_password AS 'password',
                        a.b_isowner AS 'owner',
                        a.b_ismanager AS 'manager',
                        b.dt_expired AS 'businessExpired',
                        b.i_ctrpayment AS 'ctrpayment',
                        b.v_code AS 'businessCode',
                        b.v_name AS 'businessName',
                        b.v_currentplan AS 'businessPlan',
                        b.dt_expired AS 'businessExpired',
                        b.v_address AS 'businessAddress',
                        b.v_city AS 'businessCity',
                        b.v_phone AS 'businessPhone',
                        a.v_email AS 'username',
                        b.v_image AS 'image',
                        a.b_master AS 'master',
                        a.b_production AS 'production',
                        a.b_inventory AS 'inventory',
                        a.b_expense AS 'expense',
                        a.b_relation AS 'relation',
                        a.b_transaction AS 'transaction',
                        a.b_globaltransaction AS 'globaltransaction',
                        a.b_invoice AS 'invoice',
                        a.b_communityads AS 'communityads',
                        a.b_operational AS 'operational',
                        a.b_finance AS 'finance',
                        b.i_tax AS 'tax',
                        b.i_servicecharge AS 'sc',
                        a.i_startorder AS 'startorder',
                        b.b_ismultidevice AS 'multidevice',
                        b.i_extradevice-1 AS 'extradevice',
                        b.b_useformulasell AS 'useformulasell',
                        b.i_roundedtype AS 'roundedtype',
                        b.v_currency AS 'currency',
                        b.v_thousandseparator AS 'thousandseparator',
                        b.v_decimalpoint AS 'decimalpoint',
                        b.b_loyalty AS 'loyalty',
                        b.b_communitymodule AS 'communitymodule',
                        b.b_productionmodule AS 'productionmodule',
                        b.b_inventorymodule AS 'inventorymodule',
                        b.b_accountingmodule AS 'accountingmodule',
                        b.b_purchaseordermodule AS 'purchaseordermodule',
                        b.b_barcodesystemmodule AS 'barcodesystemmodule',
                        b.b_packagesalemodule AS 'packagesalemodule',
                        b.b_openbillmodule AS 'openbillmodule',
                        b.b_openbillonlinemodule AS 'openbillonlinemodule',
                        b.b_splitbillmodule AS 'splitbillmodule',
                        b.b_websitereportmodule AS 'websitereportmodule',
                        b.b_reportfilteringmodule AS 'reportfilteringmodule',
                        b.b_printermodule AS 'printermodule',
                        b.b_invoicemodule AS 'invoicemodule',
                        b.b_shiftmodule AS 'shiftmodule',
                        b.b_variantpricemodule AS 'variantpricemodule',
                        b.b_multiunitmodule AS 'multiunitmodule',
                        b.b_customerloyaltymodule AS 'customerloyaltymodule',
                        b.b_whatsappmodule AS 'whatsappmodule',
                        b.b_limit_mastermodule AS 'limitmastermodule',
                        b.b_limit_transactionmodule AS 'limittransactionmodule',
                        b.i_limitmaster AS 'limitmaster',
                        b.i_limittransaction AS 'limittransaction',
                        b.i_point AS 'point',
                        b.v_pin AS 'pin',
                        b.b_voidtransactionpin AS 'usevoidtransactionpin',
                        b.v_pin AS 'voidtransactionpin',
                        b.v_pinvoid AS 'pinvoid',
                        b.b_pinvoid AS 'usepinvoid',
                        b.v_pindiscount AS 'pindiscount',
                        b.b_pindiscount AS 'usepindiscount',
                        b.v_pinpo AS 'pinpo',
                        b.b_pinpo AS 'usepinpo',
                        b.dt_lastpayment AS 'lastpayment',
                        b.v_cashlez_username AS 'cashlezusername',
                        b.v_cashlez_password AS 'cashlezpassword',
                        b.v_token_looyal AS 'token_looyal',
                        IFNULL(f.d_pph, '0') AS 'pph',
                        IFNULL(f.d_itemservice, '0') AS 'itemservice',
                        IFNULL(f.b_tracking, '0') AS 'tracking',
                        IFNULL(f.b_stockinclude, '0') AS 'stockinclude',
                        IFNULL(f.b_absence, '1') AS 'absence',
                        IFNULL(f.b_table_management, '0') AS 'table_management',
                        IFNULL(f.b_printer_special, '0') AS 'printer_special',
                        IFNULL(f.b_printer_special_fnb, '0') AS 'printer_special_fnb',
                        IFNULL(f.b_ppn_sc_type, '0') AS 'ppn_sc_type',
                        IFNULL(f.b_customer_phone_priority, '1') AS 'customer_phone_priority',
                        IFNULL(f.b_delivery_order, '0') AS 'delivery_order',
                        IFNULL(f.b_price_distributor_automatic, '0') AS 'price_distributor_automatic',
                        IFNULL(f.b_sku_important, '0') AS 'sku_important',
                        IFNULL(f.b_nfc_customer, '0') AS 'nfc_customer',
                        IFNULL(f.b_stock_opname, '0') AS 'stock_opname',
                        IFNULL(f.b_auto_retur, '0') AS 'auto_retur',
                        IFNULL(f.b_branch, '0') AS 'branch',
                        IFNULL(f.b_relx, '0') AS 'relx',
                        IFNULL(f.b_jvape, '0') AS 'jvape',
                        IFNULL(f.b_income, '0') AS 'income',
                        IFNULL(f.b_scan_discount, '0') AS 'scan_discount',
                        IFNULL(f.b_print_receipt, '0') AS 'print_receipt',
                        IFNULL(f.b_commision, '0') AS 'commision',
                        d.b_isactive AS 'status_verification'
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    JOIN dvw_account.vw_businessowner d ON b.fk_businessowner = d.i_code
                    LEFT JOIN dvw_setting.vw_other f ON a.fk_business = f.fk_business
                    WHERE a.b_isactive = 1
                        AND a.b_isowner = 1
                        AND a.fk_business = '${business}'
                    ORDER BY a.i_code ASC
                    LIMIT 1`
        
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getUserPropertiesLoginOwner', resolve)
    })
}

export async function update({ res, connection }: typeGlobal.functions, { hash, woogigsversion, androidversion, sdk, idsmartphone, smartphone, email, password }: { hash: string, woogigsversion: string, androidversion: string, sdk: string, idsmartphone: string, smartphone: string, email: string, password: string }, { business }: { business: { code: string } }) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    SET
                        a.v_hash = '${hash}',
                        a.v_woogigsversion = '${woogigsversion}',
                        a.v_androidversion = '${androidversion}',
                        a.v_sdk = '${sdk}',
                        a.v_idsmartphone = '${idsmartphone}',
                        a.v_smartphone = '${smartphone}',
                        a.dt_loginapp = NOW()
                    WHERE a.b_isactive = 1
                        AND LOWER(b.v_code) = '${business.code}'
                        AND LOWER(a.v_email) = '${email}'
                        AND a.v_password = '${password}'`
        functionGlobal.query(query, res, connection, 'function/account/user/update', resolve)
    })
}

export async function updateByCode({ res, connection }: typeGlobal.functions, { code, hash, woogigsversion, androidversion, sdk, idsmartphone, smartphone }: { hash: string, woogigsversion: string, androidversion: string, sdk: string, idsmartphone: string, smartphone: string, code: string } ) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    SET
                        a.v_hash = '${hash}',
                        a.v_woogigsversion = '${woogigsversion}',
                        a.v_androidversion = '${androidversion}',
                        a.v_sdk = '${sdk}',
                        a.v_idsmartphone = '${idsmartphone}',
                        a.v_smartphone = '${smartphone}',
                        a.dt_loginapp = NOW()
                    WHERE a.b_isactive = 1
                        AND a.i_code = '${code}'`
        functionGlobal.query(query, res, connection, 'function/account/user/updateByCode', resolve)
    })
}

export async function updateFirebaseToken({ res, connection }: typeGlobal.functions, { firebase_token, email, password }: { firebase_token: string, email: string, password: string }, { business }: { business: { code: string } }) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    SET
                        a.v_firebase_token = '${firebase_token}'
                    WHERE a.b_isactive = 1
                        AND LOWER(b.v_code) = '${business.code}'
                        AND LOWER(a.v_email) = '${email}'
                        AND a.v_password = '${password}'`
        functionGlobal.query(query, res, connection, 'function/account/user/updateFirebaseToken', resolve)
    })
}

export async function updateFirebaseTokenByCode({ res, connection }: typeGlobal.functions, { firebase_token, code }: { firebase_token: string, code: string } ) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    SET
                        a.v_firebase_token = '${firebase_token}'
                    WHERE a.b_isactive = 1
                        AND a.i_code = '${code}'`
        functionGlobal.query(query, res, connection, 'function/account/user/updateFirebaseTokenByCode', resolve)
    })
}

type getCode = {
    code: number
}
export async function getCode({ res, connection }: typeGlobal.functions, { email, password }: { email: string, password: string }, { business }: { business: { code: string } }): Promise<Array<getCode>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                            a.i_code AS code
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    JOIN dvw_account.vw_businessowner c ON b.fk_businessowner = c.i_code
                    WHERE a.b_isactive = 1
                    AND 
                    (
                        b.b_isactive = 0
                        OR c.b_isactive = 0
                    )
                    AND LOWER(b.v_code) = '${business.code}'
                    AND LOWER(a.v_email) = '${email}'
                    AND a.v_password = '${password}'`
        functionGlobal.query(query, res, connection, 'function/account/user/getCode', resolve)
    })
}

export async function getCode2({ res, connection }: typeGlobal.functions, { email, password }: { email: string, password: string }, { business }: { business: { code: string } }): Promise<Array<getCode>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_code AS code
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    JOIN dvw_account.vw_businessowner c ON b.fk_businessowner = c.i_code
                    WHERE a.b_isactive = 1
                    AND 
                    (
                        b.b_isactive = 2
                        OR c.b_isactive = 2
                    )
                    AND LOWER(b.v_code) = '${business.code}'
                    AND LOWER(a.v_email) = '${email}'
                    AND a.v_password = '${password}'`
        functionGlobal.query(query, res, connection, 'function/account/user/getCode2', resolve)
    })
}

type checkToken = {
    code: number,
    name: string,
    email: string,
    owner: number,
    manager: number,
    business: number,
    business_name: string,
    business_code: string,
    special: number,
    pin_void_use: number,
    pin_void: string,
    access_global_transaction: number
}
export async function checkToken({ res, connection }: typeGlobal.functions, { hash }: { hash: string }): Promise<checkToken> {
    return new Promise(async (resolve, reject) => {
        if (!hash) return resolve(undefined!)
        let result: checkToken
        let business = 0
        let query = `SELECT 
                        a.i_code AS "code",
                        a.v_name AS "name",
                        a.v_email AS "email",
                        a.b_isowner AS "owner",
                        a.b_ismanager AS "manager",
                        a.fk_business AS "business",
                        b.v_name AS "business_name",
                        b.v_code AS "business_code",
                        b.b_pinvoid AS "pin_void_use",
                        b.v_pinvoid AS "pin_void",
                        a.b_globaltransaction AS 'access_global_transaction',
                        0 AS "special",
                        IFNULL(c.v_maybank, '') AS "maybank",
                        IFNULL(c.v_maybank_key, '') AS "maybank_key",
                        IFNULL(c.i_qris_type, '3') AS "qris_type"
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b On a.fk_business = b.i_code
                    LEFT JOIN dvw_setting.vw_mode c ON b.i_code = c.fk_business
                    WHERE a.b_isactive >= 0
                        AND (
                            SHA1(a.fk_business) = '${hash}'
                            OR a.v_hash = '${hash}'
                            OR a.v_hash_backoffice = '${hash}'
                            OR a.v_hash_pos = '${hash}'
                            OR a.v_hash_monitor = '${hash}'
                        )
                    ORDER BY a.b_isowner DESC`
        result = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/account/user/checkToken', resolve))
        if (result) business = result.business
        if (business === 0) {
            query = `SELECT 
                        c.i_code AS 'code',
                        c.v_name AS 'name',
                        c.v_email AS 'email',
                        c.b_isowner AS 'owner',
                        a.fk_business AS 'business',
                        b.v_name AS 'business_name',
                        b.v_code AS 'business_code',
                        b.b_pinvoid AS 'pin_void_use',
                        b.v_pinvoid AS 'pin_void',
                        1 AS 'access_global_transaction',
                        1 AS 'special',
                        IFNULL(d.v_maybank, '') AS 'maybank',
                        IFNULL(d.v_maybank_key, '') AS 'maybank_key',
                        IFNULL(d.i_qris_type, '3') AS 'qris_type'
                    FROM dvw_account.vw_business_user a
                    JOIN dvw_account.vw_business b On a.fk_business = b.i_code
                    JOIN dvw_account.vw_user c On a.fk_user = c.i_code
                    LEFT JOIN dvw_setting.vw_mode d ON b.i_code = d.fk_business
                    WHERE a.v_token = '${hash}'`
            result = await new Promise((resolve, reject) => functionGlobal.querySingle(query, res, connection, 'function/account/user/checkToken', resolve))
            if (result) return resolve(result)
            else return resolve(undefined!)
        } else {
            if (result) return resolve(result)
            else return resolve(undefined!)
        }
    })
}

type getAccess = {
    access_master: number,
    access_production: number,
    access_inventory: number,
    access_expense: number,
    access_relation: number,
    access_transaction: number,
    access_transaction_global: number,
    access_invoice: number,
    access_operational: number,
    access_finance: number,
    access_stock_adjustment: number
}
export async function getAccess({ res, connection }: typeGlobal.functions, { code }: { code: number }): Promise<getAccess> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.b_master AS \`access_master\`,
                        a.b_production AS \`access_production\`,
                        a.b_inventory AS \`access_inventory\`,
                        a.b_expense AS \`access_expense\`,
                        a.b_relation AS \`access_relation\`,
                        a.b_transaction AS \`access_transaction\`,
                        a.b_globaltransaction AS \`access_transaction_global\`,
                        a.b_invoice AS \`access_invoice\`,
                        a.b_operational AS \`access_operational\`,
                        a.b_finance AS \`access_finance\`,
                        a.b_stock_adjustment AS \`access_stock_adjustment\`
                    FROM dvw_account.vw_user a
                    WHERE a.b_isactive = 1
                        AND a.i_code = ${code}`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getAccess', resolve)
    })
}

type getCodeNToken = {
    code: number,
    token: string
}
export function getCodeNToken({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<getCodeNToken> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_hash_backoffice AS \`token\`
                    FROM dvw_account.vw_user a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = "${fk_business}"
                        AND a.b_isowner = 1`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getCodeNToken', resolve)
    })
}

export function updateBackofficeToken({ res, connection }: typeGlobal.functions, { i_code, token }: { i_code: number, token: string }) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    SET
                        a.v_hash_backoffice = '${token}'
                    WHERE a.i_code = '${i_code}'`
        functionGlobal.query(query, res, connection, 'function/account/user/updateBackofficeToken', resolve)
    })
}

type checkOwner = {
    code: number, 
    name: string,
    email: string, 
    password: string,
    address: string, 
    phone: string,
    hash: string
}
export function checkOwner({ res, connection }: typeGlobal.functions, { hash }: { hash: string }): Promise<Array<checkOwner>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                            a.i_code AS code,
                            a.v_name AS name,
                            a.v_email AS email,
                            a.v_password AS password,
                            a.v_address AS address,
                            a.v_phone AS phone,
                            a.v_hash AS hash
                        FROM dvw_account.vw_businessowner a
                        WHERE a.b_isactive = 1
                        AND a.v_hash = ${hash}`
        functionGlobal.query(query, res, connection, 'function/additional/getAdditionalByName', resolve);
    })
}

type loginLoyalty = {
    username: string, 
    password: string,
}
export function loginLoyalty({ res, connection }: typeGlobal.functions, { username, password }: { username: string, password: string }): Promise<Array<loginLoyalty>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                            a.v_email AS username,
                            a.v_password AS password, 
                            a.v_otp AS otp,
                            a.v_name AS name,
                            a.v_address AS address,
                            a.v_birthdate AS birthday,
                            a.b_isgender AS gender,
                            a.dt_created AS date_join,
                            a.v_phone AS phone,
                            b.i_value_left AS last_point,
                            b.dt_expired AS date_expired_point
                        FROM tkd_crm.db_user a
                        JOIN tkd_crm.db_point_movement b ON a.i_code = b.fk_user
                        WHERE a.v_email = ${username}
                                AND a.v_password = ${password}`
        functionGlobal.query(query, res, connection, 'function/user/loginLoyalty', resolve);
    })
}

type getBusinessBranch = {
    token_mobile: any,
    token_backoffice: any,
    code: any,
    name: any,
    business: any,
    owner: any,
    manager: any,
    business_expired: any,
    business_code: any,
    business_name: any,
    business_plan: any,
    business_address: any,
    business_city: any,
    business_phone: any,
    email: any,
    image: any,
    master: any,
    production: any,
    inventory: any,
    expense: any,
    relation: any,
    transaction: any,
    globaltransaction: any,
    invoice: any,
    operational: any,
    finance: any,
    tax: any,
    sc: any,
    startorder: any,
    multidevice: any,
    extradevice: any,
    useformulasell: any,
    roundedtype: any,
    currency: any,
    thousandseparator: any,
    decimalpoint: any,
    loyalty: any,
    module_production: any,
    module_inventory: any,
    module_purchaseorder: any,
    module_barcodesystem: any,
    module_package: any,
    module_openbill: any,
    module_openbillonline: any,
    module_splitbill: any,
    module_websitereport: any,
    module_reportfiltering: any,
    module_printer: any,
    module_invoice: any,
    module_shift: any,
    module_variantprice: any,
    module_multiunit: any,
    module_customerloyalty: any,
    module_whatsapp: any,
    module_limit_master: any,
    module_limit_transaction: any,
    branch: any,
    feature_absence: any,
    feature_receipt_purchase_order: any,
    feature_relx: any,
    feature_jvape: any,
    feature_income: any,
    feature_commision: any,
    feature_superselling: any,
    feature_profit_sharing: any,
    feature_broadcast: any,
    feature_marketplace: any,
    limit_master: any,
    limit_transaction: any,
    pin_void: any,
    pin_discount: any,
    pin_po: any,
    lastpayment: any
}
export function getBusinessBranch({res, connection}: typeGlobal.functions, {fk_business_owner, v_email}: {fk_business_owner: number, v_email: string}): Promise<Array<getBusinessBranch>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_hash AS \`token_mobile\`,
                        a.v_hash_backoffice AS \`token_backoffice\`,
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        a.fk_business AS \`business\`,
                        a.b_isowner AS \`owner\`,
                        a.b_ismanager AS \`manager\`,
                        b.dt_expired AS \`business_expired\`,
                        b.v_code AS \`business_code\`,
                        b.v_name AS \`business_name\`,
                        b.v_currentplan AS \`business_plan\`,
                        b.v_address AS \`business_address\`,
                        b.v_city AS \`business_city\`,
                        b.v_phone AS \`business_phone\`,
                        a.v_email AS \`email\`,
                        CASE
                            WHEN b.v_image = '' THEN ''
                            ELSE CONCAT('https://www.woogigs.com/assets/img/business/', b.v_code, '/', b.v_image, '')
                        END AS \`image\`,
                        a.b_master AS \`master\`,
                        a.b_production AS \`production\`,
                        a.b_inventory AS \`inventory\`,
                        a.b_expense AS \`expense\`,
                        a.b_relation AS \`relation\`,
                        a.b_transaction AS \`transaction\`,
                        a.b_globaltransaction AS \`globaltransaction\`,
                        a.b_invoice AS \`invoice\`,
                        a.b_operational AS \`operational\`,
                        a.b_finance AS \`finance\`,
                        b.i_tax AS \`tax\`,
                        b.i_servicecharge AS \`sc\`,
                        a.i_startorder AS \`startorder\`,
                        b.b_ismultidevice AS \`multidevice\`,
                        b.i_extradevice-1 AS \`extradevice\`,
                        b.b_useformulasell AS \`useformulasell\`,
                        b.i_roundedtype AS \`roundedtype\`,
                        b.v_currency AS \`currency\`,
                        b.v_thousandseparator AS \`thousandseparator\`,
                        b.v_decimalpoint AS \`decimalpoint\`,
                        b.b_loyalty AS \`loyalty\`,
                        b.b_productionmodule AS \`module_production\`,
                        b.b_inventorymodule AS \`module_inventory\`,
                        b.b_purchaseordermodule AS \`module_purchaseorder\`,
                        b.b_barcodesystemmodule AS \`module_barcodesystem\`,
                        b.b_packagesalemodule AS \`module_package\`,
                        b.b_openbillmodule AS \`module_openbill\`,
                        b.b_openbillonlinemodule AS \`module_openbillonline\`,
                        b.b_splitbillmodule AS \`module_splitbill\`,
                        b.b_websitereportmodule AS \`module_websitereport\`,
                        b.b_reportfilteringmodule AS \`module_reportfiltering\`,
                        b.b_printermodule AS \`module_printer\`,
                        b.b_invoicemodule AS \`module_invoice\`,
                        b.b_shiftmodule AS \`module_shift\`,
                        b.b_variantpricemodule AS \`module_variantprice\`,
                        b.b_multiunitmodule AS \`module_multiunit\`,
                        b.b_customerloyaltymodule AS \`module_customerloyalty\`,
                        b.b_whatsappmodule AS \`module_whatsapp\`,
                        b.b_limit_mastermodule AS \`module_limit_master\`,
                        b.b_limit_transactionmodule AS \`module_limit_transaction\`,
                        IFNULL(e.b_branch, '0') AS \`branch\`,
                        IFNULL(e.b_absence, 0) AS \`feature_absence\`,
                        IFNULL(e.b_receipt_purchase_order, '') AS \`feature_receipt_purchase_order\`,
                        IFNULL(e.b_relx, '') AS \`feature_relx\`,
                        IFNULL(e.b_jvape, '') AS \`feature_jvape\`,
                        IFNULL(e.b_income, '') AS \`feature_income\`,
                        IFNULL(e.b_commision, '') AS \`feature_commision\`,
                        IFNULL(e.b_superselling, '') AS \`feature_superselling\`,
                        IFNULL(e.b_profit_sharing, '0') AS \`feature_profit_sharing\`,
                        IFNULL(e.b_broadcast, '') AS \`feature_broadcast\`,
                        IFNULL(e.b_marketplace, '') AS \`feature_marketplace\`,
                        b.i_limitmaster AS \`limit_master\`,
                        b.i_limittransaction AS \`limit_transaction\`,
                        b.b_pinvoid AS \`pin_void\`,
                        b.b_pindiscount AS \`pin_discount\`,
                        b.b_pinpo AS \`pin_po\`,
                        b.dt_lastpayment AS \`lastpayment\`
                    FROM dvw_account.vw_user a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    JOIN dvw_account.vw_businessowner d ON b.fk_businessowner = d.i_code
                    LEFT JOIN dvw_setting.vw_other e ON b.i_code = e.fk_business
                    WHERE a.b_isactive = 1
                        AND (b.b_isactive = 1 OR b.b_isactive = 2)
                        AND fk_businessowner = ${fk_business_owner}
                        AND LOWER(a.v_email) = '${v_email}'`
        functionGlobal.query(query, res, connection, 'function/account/user/getBusinessBranch', resolve)
    })
}

export function updateHash({res, connection}: typeGlobal.functions, {v_hash, i_code}: {v_hash: string, i_code: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a 
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                    SET
                        a.v_hash = '${v_hash}'
                    WHERE a.i_code = ${i_code}`
        functionGlobal.query(query, res, connection, 'function/account/user/updateHash', resolve)
    })
}

type checkOwnerOrManager = {
    '1': 1
}
export function checkOwnerOrManager({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}): Promise<Array<checkOwnerOrManager>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 1
                    FROM dvw_account.vw_user a
                    WHERE a.v_name LIKE '${v_name}'
                        AND a.fk_business = ${fk_business}
                        AND b_isactive = 1
                        AND
                        (
                            a.b_isowner = 1
                            OR
                            a.b_ismanager = 1
                        )`
        functionGlobal.query(query, res, connection, 'function/account/user/checkOwnerOrManager', resolve)
    })
}

type getBusiness = {
    business: number
}
export function getBusiness({res, connection}: typeGlobal.functions, {i_code}: {i_code: number}): Promise<getBusiness> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.fk_business AS \`business\`
                    FROM dvw_account.vw_user a
                    WHERE a.b_isactive = 1
                        AND a.i_code= ${i_code}`
        functionGlobal.querySingle(query, res, connection, 'function/account/user/getBusiness', resolve)
    })
}

type logout = ResultSetHeader;
export function logout({res, connection}: typeGlobal.functions, {hash}: {hash: string}): Promise<logout> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_user a SET
                                a.v_hash = '',
                                a.v_token = ''
                            WHERE a.b_isactive = 1
                            AND a.v_hash = '${hash}'`
        functionGlobal.query(query, res, connection, 'function/account/user/logout', resolve)
    })
}

export function getById({res, connection}: typeGlobal.functions, {v_email, vw_business}: {v_email: string, vw_business: {v_code: string}}): Promise<{code: number}> {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT a.i_code as code
            FROM dvw_account.vw_user a
            JOIN dvw_account.vw_business b ON b.i_code = a.fk_business
            WHERE 
                a.v_email = '${v_email}'
                AND b.v_code = '${vw_business.v_code}'
                AND a.b_isactive = 1
                AND b.b_isactive = 1
        `
        functionGlobal.querySingle(query, res, connection, 'function/account/user', resolve)
    })
}