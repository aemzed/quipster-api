import { Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typePrice from '../type/price'

//========== Functions ===============
import * as functionPrice from '../function/master/price'
import * as functionUser from '../function/account/user'

export async function selectV3(req: typePrice.selectV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/price/selectV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetPaymentMethod = await functionPrice.getV3({ res, connection }, { fk_business: user.business })
            return res.status(200).json({ success: true, message: "OK", data: resGetPaymentMethod })
        } catch {
            return errors.rollback(connection, res, err, 'controller/price/selectV3')
        }
    })
}

export async function updateV3(req: typePrice.updateV3, res: Response) {
    
    function convertBody() {
        try {
            // errors.checkField(req.body, ['price_2', 'use_price_2', 'price_3', 'use_price_3', 'price_4', 'use_price_4', 'price_5', 'use_price_5'])
            let requestBody = {
                price_2: <string>(req.body.price_2 ?? req.body.name2),
                use_price_2: parseFloat(req.body.use_price_2 ?? req.body.use2),
                type_2: parseFloat(!req.body.type_2 || req.body.type_2 === '' ? "0" : req.body.type_2),
                automatic_2: parseFloat(!req.body.automatic_2 || req.body.automatic_2 === '' ? '0' : req.body.automatic_2),
                
                price_3: <string>(req.body.price_3 ?? req.body.name3),
                use_price_3: parseFloat(req.body.use_price_3 ?? req.body.use3),
                type_3: parseFloat(!req.body.type_3 || req.body.type_3 === '' ? "0" : req.body.type_3),
                automatic_3: parseFloat(!req.body.automatic_3 || req.body.automatic_3 === '' ? '0' : req.body.automatic_3),

                price_4: <string>(req.body.price_4 ?? req.body.name4),
                use_price_4: parseFloat(req.body.use_price_4 ?? req.body.use4),
                type_4: parseFloat(!req.body.type_4 || req.body.type_4 === '' ? "0" : req.body.type_4),
                automatic_4: parseFloat(!req.body.automatic_4 || req.body.automatic_4 === '' ? '0' : req.body.automatic_4),

                price_5: <string>(req.body.price_5 ?? req.body.name5),
                use_price_5: parseFloat(req.body.use_price_5 ?? req.body.use5),
                type_5: parseFloat(!req.body.type_5 || req.body.type_5 === '' ? "0" : req.body.type_5),
                automatic_5: parseFloat(!req.body.automatic_5 || req.body.automatic_5 === '' ? '0' : req.body.automatic_5),
            }
            // errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/price/updateV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let requestBody = convertBody()!
            if (res.headersSent) return
            connection.beginTransaction(async function (err) {
                let resultPriceGetModes = await functionPrice.getModes({res, connection}, {fk_business: user.business})

                if (err) return errors.rollback(connection, res, err, 'controller/price/updateV3/beginTransaction')
                if (resultPriceGetModes.mode2 === 0) await functionPrice.insert({ res, connection }, { fk_business: user.business, v_name: requestBody.price_2, b_automatic: requestBody.automatic_2, b_isactive: requestBody.use_price_2, b_type: requestBody.type_2, i_position: 2 })
                else if (resultPriceGetModes.mode2 === 1) await functionPrice.update({ res, connection }, { fk_business: user.business, v_name: requestBody.price_2, b_automatic: requestBody.automatic_2, b_isactive: requestBody.use_price_2, b_type: requestBody.type_2, i_position: 2 })
                if (resultPriceGetModes.mode3 === 0) await functionPrice.insert({ res, connection }, { fk_business: user.business, v_name: requestBody.price_3, b_automatic: requestBody.automatic_3, b_isactive: requestBody.use_price_3, b_type: requestBody.type_3, i_position: 3 })
                else if (resultPriceGetModes.mode3 === 1) await functionPrice.update({ res, connection }, { fk_business: user.business, v_name: requestBody.price_3, b_automatic: requestBody.automatic_3, b_isactive: requestBody.use_price_3, b_type: requestBody.type_3, i_position: 3 })
                if (resultPriceGetModes.mode4 === 0) await functionPrice.insert({ res, connection }, { fk_business: user.business, v_name: requestBody.price_4, b_automatic: requestBody.automatic_4, b_isactive: requestBody.use_price_4, b_type: requestBody.type_4, i_position: 4 })
                else if (resultPriceGetModes.mode4 === 1) await functionPrice.update({ res, connection }, { fk_business: user.business, v_name: requestBody.price_4, b_automatic: requestBody.automatic_4, b_isactive: requestBody.use_price_4, b_type: requestBody.type_4, i_position: 4 })
                if (resultPriceGetModes.mode5 === 0) await functionPrice.insert({ res, connection }, { fk_business: user.business, v_name: requestBody.price_5, b_automatic: requestBody.automatic_5, b_isactive: requestBody.use_price_5, b_type: requestBody.type_5, i_position: 5 })
                else if (resultPriceGetModes.mode5 === 1) await functionPrice.update({ res, connection }, { fk_business: user.business, v_name: requestBody.price_5, b_automatic: requestBody.automatic_5, b_isactive: requestBody.use_price_5, b_type: requestBody.type_5, i_position: 5 })

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/price/updateV3/commit')
                    return res.status(200).json({ success: true, message: `Price`})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/price/updateV3')
        }
    })
}