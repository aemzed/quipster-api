import pool from "../config/connect"
import * as errors from "../function/global_function"
import { Response } from "express"

import * as typeSalesType from "../type/sales_type"

import * as functionGlobal from "../function/global_function"
import * as functionUser from "../function/account/user"
import * as functionSalesType from "../function/master/sales_type"

export async function selectV3(req: typeSalesType.selectV3, res: Response) {
    pool.getConnection(async function  (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/salestype/selectV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetSalesType = await functionSalesType.get({res, connection}, {fk_business: user.business}, {...functionGlobal.getSelectOptionsFromRequest(req)})
            return res.status(200).json({success: true, message: "OK", data: resGetSalesType})
        } catch {
            return errors.rollback(connection, res, err, 'controller/salestype/selectV3')
        }
    })
}

export async function insertV3(req: typeSalesType.insertV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/sales_type/insertV3/getConnection')

        try {
            req.body.name = req.body.name.trim().replaceAll("'", "\\'")

            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, "controller/sales_type/insertV3/beginTransaction")

                let resGetSalesType = await functionSalesType.get({res, connection}, {fk_business: user.business, v_name: req.body.name}, {})
                if (resGetSalesType.length > 0) return res.status(400).json({success: false, message: "Salestype already created"})
                let resInsertSalesType = await functionSalesType.insert({res, connection}, {
                    fk_business: user.business, 
                    fk_systemsalestype: parseInt(req.body.system), 
                    v_name: req.body.name,
                    fk_user_modify: user.code,
                    ...(req.body.tax && {tax: parseInt(req.body.tax)}), 
                    ...(req.body.sc && {sc: parseInt(req.body.sc)})
                })
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/sales_type/insertV3/commit')
                    return res.status(200).json({success: true, message: `Data inserted.`, data: resInsertSalesType.insertId})
                })
                return connection.release()
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/sales_type/insertV3')
        }
    })
}

export async function updateV3(req: typeSalesType.updateV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/sales_type/updateV3')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resUpdateSalesType = await functionSalesType.update({res, connection}, {
                i_code: parseInt(req.body.code),
                fk_business: user.business,
                fk_user_modify: user.code,
                ...(req.body.name && {v_name: req.body.name}),
                ...(req.body.system && {fk_systemsalestype: parseInt(req.body.system)}),
                ...(req.body.tax && {b_tax: parseInt(req.body.tax)}),
                ...(req.body.sc && {b_sc: parseInt(req.body.sc)}),
            })
            return res.status(200).json({success: true, message: "Data updated."})
        } catch {
            return errors.rollback(connection, res, err, 'controller/sales_type/updateV3')
        }
    })
}

export async function deleteV3(req: typeSalesType.deleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/sales_type/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resDeleteSalesType = await functionSalesType.softDelete({res, connection}, {fk_business: user.business, i_code: req.body.code, fk_user_modify: user.code})
            if (!resDeleteSalesType.changedRows) return res.status(401).json({success: false, message: "Data not found or has been deleted."})
            res.status(200).json({success: true, message: "Data deleted."})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/sales_type/deleteV3')
        }
    })
}