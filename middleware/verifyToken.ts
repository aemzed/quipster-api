import { NextFunction, Request, Response } from "express";
import { executeQuery } from "../util/mysql";

export default async function (req: Request, res: Response, next: NextFunction) {
    let user:{
        user_code: any,
        user_name: any,
        user_email: any,
        user_isOwner: any,
        user_isManager: any,
        user_accessMaster: any,
        user_accessProduction: any,
        user_accessInventory: any,
        user_accessStockAdjustment: any,
        user_accessExpense: any,
        user_accessRelation: any,
        user_accessTransaction: any,
        user_accessGlobalTransaction: any,
        user_accessInvoice: any,
        user_accessOperational: any,
        user_accessFinance: any,
        user_startOrder: any,
        business_code: any,
        business_ownerCode: any,
        business_name: any,
        business_id: any,
        business_usePinVoid: any,
        business_pinVoid: any,
        user_special: any,
        user_maybank: any,
        user_maybankKey: any,
        user_qrisType: any
    }
    user = (await executeQuery(
        `
        SELECT 
            CASE
                WHEN SHA1(a.fk_business) = '${req.headers['x-auth-token']}' THEN 0
                ELSE a.i_code
            END AS user_code,
            CASE
                WHEN SHA1(a.fk_business) = '${req.headers['x-auth-token']}' THEN 'Woogigs'
                ELSE a.v_name
            END AS user_name,
            a.v_email AS user_email,
            a.b_isowner AS user_isOwner,
            a.b_ismanager AS user_isManager,
            a.b_master AS user_accessMaster,
            a.b_production AS user_accessProduction,
            a.b_inventory AS user_accessInventory,
            a.b_expense AS user_accessExpense,
            a.b_relation AS user_accessRelation,
            a.b_transaction AS user_accessTransaction,
            a.b_globaltransaction AS user_accessGlobalTransaction,
            a.b_invoice AS user_accessInvoice,
            a.b_operational AS user_accessOperational,
            CASE
                WHEN SHA1(a.fk_business) = '${req.headers['x-auth-token']}' THEN 0
                ELSE a.b_finance
            END AS user_accessFinance,
            a.i_startorder AS user_startOrder,
            a.fk_business AS business_code,
            b.fk_businessowner AS business_ownerCode,
            b.v_name AS business_name,
            b.v_code AS business_id,
            b.b_pinvoid AS business_usePinVoid,
            b.v_pinvoid AS business_pinVoid,
            0 AS user_special,
            IFNULL(c.v_maybank, '') AS user_maybank,
            IFNULL(c.v_maybank_key, '') AS user_maybankKey,
            IFNULL(c.i_qris_type, '3') AS user_qrisType
        FROM dvw_account.vw_user a
        JOIN dvw_account.vw_business b On a.fk_business = b.i_code
        LEFT JOIN dvw_setting.vw_mode c ON b.i_code = c.fk_business
        WHERE a.b_isactive >= 0
            AND (
                SHA1(a.fk_business) = '${req.headers['x-auth-token']}'
                OR a.v_hash = '${req.headers['x-auth-token']}'
                OR a.v_hash_backoffice = '${req.headers['x-auth-token']}'
                OR a.v_hash_pos = '${req.headers['x-auth-token']}'
                OR a.v_hash_monitor = '${req.headers['x-auth-token']}'
            )
        ORDER BY a.b_isowner DESC
        `
    ))[0]
    if (!user) return res.status(401).json({success: false, message: 'Credentials not valid.'})
    if (user.business_code === 0) user = (await executeQuery(
        `
        SELECT 
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
        WHERE a.v_token = '${req.headers['x-auth-token']}'
        `
    ))[0]
    req.body.user = user
    console.log(req.body.user)
    next()
}