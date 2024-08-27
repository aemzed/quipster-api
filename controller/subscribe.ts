import { Request, Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as typeSubscribe from '../type/subscribe'

import * as functionBusiness from '../function/account/business'
import * as functionUser from '../function/account/user'
import { globalHandler } from "../function/global"
import { User } from "../type/user"
import { executeQuery } from "../util/mysql"

export function checkV3(req: typeSubscribe.checkV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/subscribe/check/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resSubscribeCheck = await functionBusiness.getExpiredNDiscountNDiscountStatusNPrices({res, connection}, {i_code: user.business})
            if (resSubscribeCheck) res.status(200).json({success: true, message: "OK", data: resSubscribeCheck})
            else res.status(200).json({success: true, message: "Data not found."})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/subscribe/check')
        }
    })
}