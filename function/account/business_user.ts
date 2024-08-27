import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'

type getBusinessBranchSpecial = {
    token: any,
    code: any,
    name: any,
    business: any,
    owner: any,
    manager: any,
    business_code: any,
    business_name: any,
    business_plan: any,
    business_expired: any,
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
    feature_superselling: any,
    feature_broadcast: any,
    feature_marketplace: any,
    limit_master: any,
    limit_transaction: any,
    pin_void: any,
    pin_discount: any,
    pin_po: any,
    lastpayment: any
}

export function getBusinessBranchSpecial({res, connection}: typeGlobal.functions, {fk_user}: {fk_user: number}): Promise<Array<getBusinessBranchSpecial>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        z.v_token AS \`token\`,
                        a.i_code AS \`code\`,
                        a.v_name AS \`name\`,
                        z.fk_business AS \`business\`,
                        a.b_isowner AS \`owner\`,
                        a.b_ismanager AS \`manager\`,
                        b.dt_expired AS \`business_expired\`,
                        b.v_code AS \`business_code\`,
                        b.v_name AS \`business_name\`,
                        b.v_currentplan AS \`business_plan\`,
                        b.dt_expired AS \`business_expired\`,
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
                        IFNULL(e.b_superselling, '') AS \`feature_superselling\`,
                        IFNULL(e.b_broadcast, '') AS \`feature_broadcast\`,
                        IFNULL(e.b_marketplace, '') AS \`feature_marketplace\`,
                        b.i_limitmaster AS \`limit_master\`,
                        b.i_limittransaction AS \`limit_transaction\`,
                        b.b_pinvoid AS \`pin_void\`,
                        b.b_pindiscount AS \`pin_discount\`,
                        b.b_pinpo AS \`pin_po\`,
                        b.dt_lastpayment AS \`lastpayment\`
                    FROM dvw_account.vw_business_user z
                    JOIN dvw_account.vw_user a ON z.fk_user = a.i_code
                    JOIN dvw_account.vw_business b ON z.fk_business = b.i_code
                    LEFT JOIN dvw_setting.vw_other e ON b.i_code = e.fk_business
                    WHERE a.b_isactive = 1
                        AND (b.b_isactive = 1 OR b.b_isactive = 2)
                        AND z.fk_user = ${fk_user}`
        functionGlobal.query(query, res, connection, 'function/account/business_user', resolve)
    })
}

export function updateToken({res, connection}: typeGlobal.functions, {v_token, fk_business, fk_user}: {v_token: string, fk_business: number, fk_user: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_account.vw_business_user a SET
                        a.v_token = '${v_token}'
                    WHERE a.fk_user = $${fk_user}
                        AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/account/business_user/updateToken', resolve)
    })
}