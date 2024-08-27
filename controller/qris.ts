import { Response } from "express"
import PoolConnection from "mysql2/typings/mysql/lib/PoolConnection"
import pool from "../config/connect"
import * as errors from "../function/global_function"
import * as functionGlobal from "../function/global_function"

import * as typeQris from "../type/qris"

import * as functionBusiness from "../function/account/business"
import * as functionRules from "../function/setting/rules"
import * as functionPaymentMethod from "../function/master/paymentmethod"
import * as functionCustomer from "../function/master/customer"
import * as functionQRIS from "../function/operational/qris"
import moment from "moment"

var md5 = require('md5')

function checkHash(res: Response, connection: PoolConnection, hash: string): Promise<{
    business: number,
    business_owner: number,
    business_name: string,
    business_code: string,
    business_email: string,
    lat: string,
    lon: string,
    xendit: string,
    maybank: string,
    maybank_key: string,
    qris_type: number,
}> {
    return new Promise( async (resolve, reject) => {
        let resBusinessGet = await functionBusiness.get({res, connection}, {code: parseInt(hash), SHA1$code: hash})
        return resolve({
            business: resBusinessGet.business,
            business_owner: resBusinessGet.business_owner,
            business_name: resBusinessGet.business_name,
            business_code: resBusinessGet.business_code,
            business_email: resBusinessGet.business_email,
            lat: resBusinessGet.lat,
            lon: resBusinessGet.lon,
            xendit: resBusinessGet.xendit,
            maybank: resBusinessGet.maybank,
            maybank_key: resBusinessGet.maybank_key,
            qris_type: resBusinessGet.qris_type
        })
    })
}

function generateCode() {
    let message = md5("2023-02-25 03:34:53" + ( (Math.random() * 90) + 10 ).toString())
    return message.substring(0, 12).toUpperCase()
}

export async function insert({body}: typeQris.insert, res: Response) {
    let checkBody = await functionGlobal.checkBodyRequest({requestBody: body, requiredKeys: [
        {key: 'hash', value_type: ['string']},
        {key: 'amount', value_type: ['string']},
        {key: 'fee', value_type: ['string']},
        {key: 'receipt', value_type: ['string']}
    ]})
    if (!checkBody.success) return res.status(400).json({success: false, message: checkBody.message})

    body.code = body.code ?? generateCode()
    body.fee = "0"
    body.receipt = body.code ?? generateCode()

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/qris/insert')
        let user = await checkHash(res, connection, body.hash)
        if (!user.business === undefined) return functionGlobal.sendResponse(res, connection, 401, false, 'Credential not valid.')
        else {
            let resRulesGetvalue = await functionRules.getValue({res, connection})
            let generateQris = true
            if (resRulesGetvalue && parseInt(resRulesGetvalue.value) === 0) generateQris = false
            if (user.business === 6 || user.business === 57) generateQris = true
            if (generateQris) {
                connection.beginTransaction(async function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/qris/insert')
                    try {
                        if (body.paymentMethodName === "SUPERSELLING") {
                            let resGetMDR = await functionPaymentMethod.getMDR({res, connection}, {fk_business: user.business})
                            if (resGetMDR) body.fee = resGetMDR.fee.toString()
                        }

                        let isTransaction = 0
                        if (body.notes === "trx") {
                            body.notes = ""
                            isTransaction = 1
                        }

                        let codeCustomer = 0
                        if (body.customerName !== "" && body.customerPhone !== "") {
                            let resCustomerGetCodeName = await functionCustomer.getCodeName({res, connection}, {fk_business: user.business, phone: body.customerPhone ?? ""})
                            if (resCustomerGetCodeName) codeCustomer = resCustomerGetCodeName.code
                            else {
                                let resCustomerInsert = await functionCustomer.insert({res, connection}, {fk_business: user.business, name: body.customerName ?? "", phone: body.customerPhone ?? ""})
                            }
                        }

                        body.code = body.code + '-' + body.amount
                        let resQRISGetQR = await functionQRIS.getQR({res, connection}, {fk_business: user.business, external_id: body.code})
                        if (resQRISGetQR) {return connection.commit(function (err) {
                            if (err) return errors.rollback(connection, res, err, 'controller/qris/insert')
                            res.status(200).json({success: true, message: "ok", data: resQRISGetQR.qris})
                        })} 
                        else {
                            let url = "https://merchant.emobile.co.id/qrmaybank";
                            let timestamp = moment().format('YYYYMMDDHHmmss')
                            let method = "aes-256-cbc"
                            let key = user.maybank_key
                            let subMerchantCode = user.maybank
                            let trxCode = 'LOGIN'

                            let parameter = JSON.stringify({
                                trxCode: trxCode,
                                authenticationKey: key,
                                timestamp: timestamp
                            })
                            let headers = [
                                'X-submerchantcode: '+subMerchantCode
                            ]
                            let enrcypted = "123123123123123123" //maybank_encrypt here
                            let result = {} //curl here
                            if (result["status"] === "PAID") {
                                let paid = "1"
                                
                            }

                        }
                    } catch {

                    }
                })
            }
        }

        connection.beginTransaction(function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/qris/insert')
        })
    })
}

export async function check({body}: typeQris.check, res: Response) {
    let user = checkHash(res)
}
// export function insert({body})