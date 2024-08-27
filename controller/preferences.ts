import { Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typePreferences from '../type/preferences'

//========== Functions ===============
import * as functionPreferences from '../function/master/preferences'
import * as functionUser from '../function/account/user'

export async function selectV3(req: typePreferences.selectV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/preferences/getV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetPreferences  = await functionPreferences.get({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resGetPreferences})
        } catch {
            return errors.rollback(connection, res, err, 'controller/preferences/getV3')
        }
    })
}


export async function insertV3(req: typePreferences.insertV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/preferences/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/preferences/insertV3/beginTransaction')

                let resInsertPreferences = await functionPreferences.insert({res, connection}, {fk_business: user.business, name: req.body.name, fk_user_modify: user.code})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/preferences/insertV3/commit')
                    return res.status(200).json({success: true, message: `Data Added`, data: resInsertPreferences})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/preferences/insertV3')
        }
    })
}


export async function updateV3(req: typePreferences.updateV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/preferences/updateV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/preferences/updateV3/beginTransaction')
                let resUpdatePreferences = await functionPreferences.update({res, connection}, {code: parseInt(req.body.code), name: req.body.name, fk_business: user.business, fk_user_modify: user.code})
                if (resUpdatePreferences.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/preferences/updateV3/commit')
                    return res.status(200).json({success: true, message: "Data updated", data: resUpdatePreferences})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/preferences/updateV3')
        }
    })
}


export async function deleteV3(req: typePreferences.deleteV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/preferences/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/preferences/deleteV3/beginTransaction')
                let resDeletePreference = await functionPreferences.remove({res, connection}, {code: parseFloat(req.body.code), fk_business: user.business, fk_user_modify: user.code})
                if (resDeletePreference.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/preferences/deleteV3/commit')
                    return res.status(200).json({success: true, message: "OK", data: resDeletePreference})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/preferences/deleteV3')
        }
    })
}