import { Request, Response } from "express"
import { User } from "../type/User"
import { executeQuery } from '../util/mysql'
import { globalHandler } from '../function/global'

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typePromotion from '../type/promotion'

//========== Functions ===============
import * as functionPromotion from '../function/master/promotion'
import * as functionUser from '../function/account/user'

export async function selectV3(req: typePromotion.selectV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/promotion/getV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetPromotion = await functionPromotion.get({ res, connection }, { fk_business: user.business })
            return res.status(200).json({ success: true, message: "OK", data: resGetPromotion })
        } catch {
            return errors.rollback(connection, res, err, 'controller/promotion/getV3')
        }
    })
}

export async function deleteV3(req: typePromotion.deleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/promotion/deleteV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/promotion/deleteV3')

                let resDelete = await functionPromotion.remove({ res, connection }, { fk_business: user.business, code: parseFloat(req.body.code) })
                if (resDelete.affectedRows < 1) return res.status(400).json({ success: false, message: "Data not found." })
                return res.status(200).json({ success: true, message: "Data deleted." })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/promotion/deleteV3')
        }
    })
}

export async function insertV3(req: typePromotion.insertV3, res: Response) {
    let resGetValuePromotion : any;
    let value: any;
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/promotion/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/promotion/insertV3/beginTransaction')
                let resGetNamePromotion = await functionPromotion.getNamePromotion({ res, connection }, { fk_business: user.business, name: req.body.name, alias: req.body.alias })
                if (resGetNamePromotion.length > 0) return res.status(400).json({ success: false, message: `Promotion Already Used`, data: [] })
                if (user.business == 57 || user.business == 1721 || user.business == 1811 || user.business == 1812) {
                    let resGetBusinessPromotion = await functionPromotion.getBusinessPromotion({ res, connection }, { fk_business: user.business })
                    if (resGetBusinessPromotion.length > 0) {
                        for (let i = 0; i < resGetBusinessPromotion.length; i++) {
                            if(req.body.type == 3){
                                resGetValuePromotion = await functionPromotion.getValuePromotion({res, connection}, {fk_business: user.business, code: req.body.value, businessTarget: resGetBusinessPromotion[i]["business"] })
                                value = -1
                                if(resGetValuePromotion.length > 0){
                                    value = resGetValuePromotion[0].value;
                                }
                            }
                            if(value != -1){
                                let insertPromotion = await functionPromotion.insertPromotion({res, connection}, {fk_business: resGetBusinessPromotion[i]["business"], alias: req.body.alias, name: req.body.name, type: req.body.type, value: req.body.value, start: req.body.start, end: req.body.end, notes: req.body.notes, usepin: req.body.usepin, pin: req.body.pin, minimumSpend: req.body.minimumSpend, maximumPromo: req.body.maximumPromo, online: req.body.online, monday: req.body.monday, tuesday: req.body.tuesday, wednesday: req.body.wednesday, thursday: req.body.thursday, friday: req.body.friday, saturday: req.body.saturday, sunday: req.body.sunday })
                            }
                        }
                    }
                } else {
                    let insertPromotion = await functionPromotion.insertPromotion({res, connection}, {fk_business: String(user.business), alias: req.body.alias, name: req.body.name, type: req.body.type, value: req.body.value, start: req.body.start, end: req.body.end, notes: req.body.notes, usepin: req.body.usepin, pin: req.body.pin, minimumSpend: req.body.minimumSpend, maximumPromo: req.body.maximumPromo, online: req.body.online, monday: req.body.monday, tuesday: req.body.tuesday, wednesday: req.body.wednesday, thursday: req.body.thursday, friday: req.body.friday, saturday: req.body.saturday, sunday: req.body.sunday })
                }
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/promotion/insertV3/commit')
                    return res.status(200).json({ success: true, message: `Data Added`, data: [] })
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/promotion/insertV3')
        }
    })
}

type getByCodeRequestV3 = Omit<Request, 'body'> & {
    body: {
        user: User,
        promotion_id: string
    }
}
export async function getByCodeV3(req: getByCodeRequestV3, res: Response) {

    function convertBody() {
        errors.checkField(req.body, ['promotion_id'])
        let requestBody = {
            user: req.body.user,
            promotion_id: req.body.promotion_id
        }
        return requestBody
    }

    await globalHandler(`controller/promotion/getByCodeV3`, req, res, async () => {
        let requestBody = convertBody()
        let resultGet = await executeQuery(`
            SELECT
                i_code AS promotion_id,
                v_name AS promotion_name,
                v_value AS promotion_value,
                fk_systempromotion AS promotion_system,
                i_minimum_spend AS promotion_minimum_spend
            FROM dvw_master.vw_promotion
            WHERE
                b_isactive = 1
                AND LOWER(v_code) = LOWER('${requestBody.promotion_id}')
                AND fk_business = ${requestBody.user.business_code}
        `)
        return res.status(200).json({success: true, message: `${resultGet.length} data/s found.`, data: resultGet})
    })
}