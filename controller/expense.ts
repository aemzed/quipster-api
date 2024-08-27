import { Request, Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typeExpense from '../type/expense'

//========== Functions ===============
import * as functionExpense from '../function/master/expense'
import * as functionUser from '../function/account/user'
import { globalHandler } from "../function/global"
import { executeQuery } from "../util/mysql"
import { User } from "../type/user"

const uniqid = require('uniqid')

type selectV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function selectV3(req: selectV3Request, res: Response) {
    function convertBody() {
        let requestBody = {
            user: req.body.user
        }
        return requestBody
    }
    await globalHandler('controller/expense/selectV3', req, res, async () => {
        let requestBody = convertBody()
        let resultSelect = await executeQuery(`
            SELECT
                a.i_code AS code,
                a.v_name AS name,
                a.fk_systemexpense AS system
            FROM dvw_master.vw_expense a
            WHERE a.b_isactive = 1
                AND a.fk_business = ${requestBody.user.business_code}
        `)
        return res.status(200).json({success: true, message: 'OK', data: resultSelect})
    })
}
export async function oldselectV3(req: typeExpense.selectV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/selectV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetExpense  = await functionExpense.get({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resGetExpense})
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/selectV3')
        }
    })
}

type selectSystemV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function selectSystemV3(req: selectSystemV3Request, res: Response) {
    await globalHandler('controller/expense/selectSystem', req, res, async () => {
        let resultSelectSystem = await executeQuery(`
            SELECT
                i_code AS code,
                v_name AS name
            FROM dvw_system.vw_expense
            WHERE b_isactive = 1
        `)
        return res.status(200).json({success: true, message: 'OK', data: resultSelectSystem})
    })
}
export async function oldselectSystemV3(req: typeExpense.selectV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/selectSystemV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetExpense  = await functionExpense.getSystem({res, connection},{})
            return res.status(200).json({success: true, message: "OK", data: resGetExpense})
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/selectSystemV3')
        }
    })
}

export async function insertV3(req: typeExpense.insertV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/expense/insertV3/beginTransaction')
                let resGetExpenses = await functionExpense.getExpense({res, connection}, {fk_business: user.business, name: req.body.name, code:0})
                if(resGetExpenses.length > 0 ) return res.status(200).json({success: true, message: `Data Already Added`, data: []})
                let resInsertExpense = await functionExpense.insert({res, connection}, {fk_business: user.business, name: req.body.name, system:req.body.system, fk_user_modify: user.code})
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/expense/insertV3/commit')
                    return res.status(200).json({success: true, message: `Data Added Successfully`, data: resInsertExpense})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/insertV3')
        }
    })
}

export async function deleteV3(req: typeExpense.deleteV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/expense/deleteV3/beginTransaction')
                let resDeletePaymentMethod = await functionExpense.remove({res, connection}, {code: parseFloat(req.body.code), fk_business: user.business, fk_user_modify: user.code})
                if (resDeletePaymentMethod.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/expense/deleteV3/commit')
                    return res.status(200).json({success: true, message: "OK", data: resDeletePaymentMethod})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/deleteV3')
        }
    })
}

export async function updateV3(req: typeExpense.updateV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/updateV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/expense/updateV3/beginTransaction')
                let resUpdateExpense = await functionExpense.update({res, connection}, {fk_business: user.business, name: req.body.name, system: parseFloat(req.body.system), code: parseFloat(req.body.code), fk_user_modify: user.code})
                if (resUpdateExpense.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found."})

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/expense/updateV3/commit')
                    return res.status(200).json({success: true, message: `Data Update Successfully.`, data: resUpdateExpense})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/updateV3')
        }
    })
}

export async function selectSimilarV3(req: typeExpense.selectSimilarV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: parseFloat(req.body.code)
            }
            errors.checkNaN(requestBody.code)
            return requestBody
        } catch(err: any) {
            res.status(400).json({success: false, message: err})
        }
        
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/selectSimilarV3/getConnection')

        let requestBody = convertBody()!
        if (res.headersSent) return
        let responseBody: Array<Partial<{
            code: number,
            name: string,
            business_name: string,
            token: string
        }>> = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resExpenseGetNameBusinessowner = await functionExpense.getNameBusinessOwner({res, connection}, {i_code: requestBody.code})
            if (resExpenseGetNameBusinessowner) {
                let resExpense = await functionExpense.getInOtherBusiness({res, connection}, {fk_business: user.business, i_code: requestBody.code, v_name: resExpenseGetNameBusinessowner.name, vw_business: {fk_businessowner: resExpenseGetNameBusinessowner.owner}})
                for(let eachExpense of resExpense) {
                    let eachResponseBody: typeof responseBody[0] = {}
                    eachResponseBody.code = eachExpense.code
                    eachResponseBody.business_name = eachExpense.business_name
                    eachResponseBody.name = eachExpense.name
                    let resUserGetCodeToken = await functionUser.getCodeNToken({res, connection}, {fk_business: user.business})
                    if (!resUserGetCodeToken.token) {
                        let newToken = uniqid()
                        await functionUser.updateBackofficeToken({res, connection}, {i_code: resUserGetCodeToken.code, token: newToken})
                        eachResponseBody.token = newToken
                    } else {
                        eachResponseBody.token = resUserGetCodeToken.token
                    }
                    responseBody.push(eachResponseBody)
                }
                return res.status(200).json({success: true, message: "OK", data: responseBody})
            }
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/selectSimilarV3')
        }
    })
}

export async function deleteOperationalExpenseV3(req: typeExpense.deleteOperationalExpenseV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: parseFloat(req.body.code)
            }
            errors.checkNaN(requestBody.code)
            return requestBody
        } catch(err: any) {
            res.status(400).json({success: false, message: err})
        }
        
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/expense/deleteOperationalExpenseV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let requestBody = convertBody()!
            if (res.headersSent) return

            let removeOperationalExpense = await functionExpense.removeOperationalExpense({res, connection}, {code: requestBody.code, fk_business :user.business})
            if(removeOperationalExpense.affectedRows > 0) return res.status(200).json({success: true, message: "Data Deleted"})
            else return res.status(400).json({success: false, message: "Data Not Found"}) 
        } catch {
            return errors.rollback(connection, res, err, 'controller/expense/deleteOperationalExpenseV3')
        }
    })
}