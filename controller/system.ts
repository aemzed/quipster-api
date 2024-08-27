import { Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as typeGlobal from '../type/global'
import * as typeSystem from "../type/system"

import * as location from "../function/system/location"
import * as functionUser from "../function/account/user"
import * as functionSalesType from "../function/master/sales_type"

export async function locationGetRecommendation(req: typeGlobal.requestV3 & {body: {address: string}}, res: any) {
    let data = await location.getRecommendation({res: res, address: req.body.address})
    return res.status(200).json({success: false, message: "OK", data: data})
}

export function salesTypeV3(req: typeSystem.salesTypeV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/system/salesTypeV3/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/system/salesType/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let resGetSystem = await functionSalesType.getSystem({res, connection})
                return res.status(200).json({success: false, message: "OK", data: resGetSystem})
            } catch {
                return errors.rollback(connection, res, err, 'controller/system/salesTypeV3')
            }
        })
    })
}