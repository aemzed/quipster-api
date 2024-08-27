import { Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"
import uniqid from 'uniqid'

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typePaymentMethod from '../type/paymentmethod'

//========== Functions ===============
import * as functionPaymentMethod from '../function/master/paymentmethod'
import * as functionUser from '../function/account/user'

export async function selectV3(req: typePaymentMethod.selectV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/selectV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetPaymentMethod  = await functionPaymentMethod.get({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resGetPaymentMethod})
        } catch {
            return errors.rollback(connection, res, err, 'controller/paymentmethod/selectV3')
        }
    })
}

export async function selectSimilarV3(req: typePaymentMethod.selectSimilarV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: parseFloat(req.body.code)
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch(err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/selectSimilarV3')

        try  {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return errors.rollback(connection, res, err, 'controller/paymentmethod/selectSimilarV3')

            let requestBody = convertBody()!
            if (res.headersSent) return

            let resPaymentMethodGetNameNOwner = await functionPaymentMethod.getNameNOwner({res, connection}, {i_code: requestBody.code, fk_business: user.business})
            if (!resPaymentMethodGetNameNOwner) return res.status(400).json({success: false, message: 'No data.'})
            
            let resultPaymentMethodGetSimilar = await functionPaymentMethod.getSimilar({res, connection}, {fk_business: user.business, i_code: requestBody.code, v_name: resPaymentMethodGetNameNOwner.name, vw_business: {fk_businessowner: resPaymentMethodGetNameNOwner.owner}})
            let responseBody: any = []
            for (let eachPaymentMethod of resultPaymentMethodGetSimilar) {
                let token = ''
                let resultUserGetCodeNToken = await functionUser.getCodeNToken({res, connection}, {fk_business: eachPaymentMethod.business})
                if (resultUserGetCodeNToken.token) token = resultUserGetCodeNToken.token
                else {
                    token = uniqid()
                    await functionUser.updateBackofficeToken({res, connection}, {i_code: resultUserGetCodeNToken.code, token: token})
                }
                responseBody.push({...eachPaymentMethod, token: token})
            }

            return res.status(200).json({success: true, message: "OK", data: responseBody})

        } catch (err) {
            console.log(err)
        }
    })
}

export async function insertV3(req: typePaymentMethod.insertV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/insertV3/beginTransaction')
                let resGetPaymentMethodName = await functionPaymentMethod.getNamePayment({res, connection}, {fk_business: user.business, name: req.body.name, code: 0})
                if(resGetPaymentMethodName.length > 0 ) return res.status(200).json({success: true, message: `Data Already Added`, data: []})
                let resInsertPaymentMethod = await functionPaymentMethod.insert({res, connection}, {fk_business: user.business, name: req.body.name, systempaymentmethod:req.body.system??req.body.systempaymentmethod, notes: req.body.notes, mdr: (req.body.mdr === '' || req.body.mdr == undefined ? 0 : parseFloat(req.body.mdr)), fk_user_modify: user.code})
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/insertV3/commit')
                    return res.status(200).json({success: true, message: `Data Added`, data: resInsertPaymentMethod})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/paymentmethod/insertV3')
        }
    })
}

export async function selectSystemV3(req: typePaymentMethod.selectSystemV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/selectSystem/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetSystemPaymentMethod  = await functionPaymentMethod.getSystem({res, connection}, {})
            return res.status(200).json({success: true, message: "OK", data: resGetSystemPaymentMethod})
        } catch {
            return errors.rollback(connection, res, err, 'controller/paymentmethod/selectSystem')
        }
    })
}

export async function updateV3(req: typePaymentMethod.updateV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/updateV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/updateV3/beginTransaction')
                let resGetPaymentMethodName = await functionPaymentMethod.getNamePayment({res, connection}, {fk_business: user.business, name: req.body.name, code: parseFloat(req.body.code)})
                if(resGetPaymentMethodName.length > 0 ) return res.status(200).json({success: true, message: `Data Already Added`, data: []})
                let resUpdatePaymentMethod = await functionPaymentMethod.update({res, connection}, {fk_business: user.business, name: req.body.name, systempaymentmethod:req.body.system??req.body.systempaymentmethod, notes: req.body.notes, mdr: req.body.mdr, code: parseFloat(req.body.code), fk_user_modify: user.code})
                if (resUpdatePaymentMethod.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/updateV3/commit')
                    return res.status(200).json({success: true, message: `Data Update`, data: resUpdatePaymentMethod})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/paymentmethod/updateV3')
        }
    })
}

export async function deleteV3(req: typePaymentMethod.deleteV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/deleteV3/beginTransaction')
                let resDeletePaymentMethod = await functionPaymentMethod.remove({res, connection}, {code: parseFloat(req.body.code), fk_business: user.business, fk_user_modify: user.code})
                if (resDeletePaymentMethod.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/paymentmethod/deleteV3/commit')
                    return res.status(200).json({success: true, message: "OK", data: resDeletePaymentMethod})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/paymentmethod/deleteV3')
        }
    })
}