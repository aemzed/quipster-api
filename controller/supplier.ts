import { Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typeSupplier from '../type/supplier'

//========== Functions ===============
import * as functionSupplier from '../function/master/supplier'
import * as functionUser from '../function/account/user'

export async function selectV3(req: typeSupplier.selectV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/supplier/getV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetUnit = await functionSupplier.get({ res, connection }, { fk_business: user.business })
            return res.status(200).json({ success: true, message: "OK", data: resGetUnit })
        } catch {
            return errors.rollback(connection, res, err, 'controller/supplier/getV3')
        }
    })
}

export async function deleteV3(req: typeSupplier.deleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/supplier/deleteV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/supplier/deleteV3')

                let resDelete = await functionSupplier.remove({res, connection}, {fk_business: user.business, code: parseFloat(req.body.code), fk_user_modify: user.code})
                if (resDelete.affectedRows < 1) return res.status(400).json({success: false, message: "Data not found."})

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/supplier/deleteV3/commit')

                    return res.status(200).json({success: true, message: "Data deleted."})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/supplier/deleteV3')
        }
    })
}