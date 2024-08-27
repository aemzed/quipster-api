import { Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as typeMaterial from "../type/material"

import * as functionMaterial from "../function/master/material"
import * as functionStockReport from "../function/operational/stockreport"
import * as functionUser from '../function/account/user'

export async function select({body}: typeMaterial.select, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/material/select')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/material/select')
            let resGet = await functionMaterial.get({res, connection}, {fk_business: parseInt(body.business)})
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/material/select')
                res.status(200).json({
                    success: true,
                    message: "ok",
                    data: resGet
                })
            })
        })
    })
}

export async function addStock({body}: typeMaterial.addStock, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/material/addStock')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/material/addStock')
            let resStockreportInsert = await functionStockReport.insert({res, connection}, {fk_business: parseInt(body.business), fk_itemmaterial: parseInt(body.code), b_source: 3, b_type: 2, qty: parseFloat(body.qty), notes: body.notes})
            connection.commit(function (err) {
                if (err) errors.rollback(connection, res, err, 'controller/material/addStock')
                if (resStockreportInsert) res.status(200).json({
                    success: true,
                    message: "Update Stock Success",
                })
            })
        })
    })
}

export function addStockV3(req: typeMaterial.addStockV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'qty', 'notes'])
            let requestBody = {
                code: req.body.code,
                qty: parseFloat(req.body.qty),
                notes: req.body.notes.replaceAll(`'`,`\\'`)
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/material/addStockV3')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/material/addStockV3')
            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(400).json({success: false, message: "Credential not valid."})
    
                let requestBody = convertBody()!
                if (res.headersSent) return
    
                let resInsert = await functionStockReport.insert({res, connection}, {b_source: 3, b_type: 2, fk_business: user.business, fk_itemmaterial: requestBody.code, fk_user: user.code, qty: requestBody.qty, notes: requestBody.notes})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/material/addStockV3')

                    return res.status(500).json({success: true, message: "Added Stock Successfully", data: resInsert})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/material/addStockV3')
            }
        })
    })
}