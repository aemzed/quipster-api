import pool from "../config/connect"
import * as errors from "../function/global_function"
import { Response } from "express"

import * as typeAbsence from "../type/absence"

import * as functionAbsence from "../function/operational/absence"
import * as functionEmployee from "../function/master/employee"
import * as functionBusiness from "../function/account/business"
import * as functionGlobal from "../function/global_function"
import * as functionUser from '../function/account/user'

import fs from "fs"
import moment from "moment"
import sha1 from 'sha1'

export async function checkAbsences({body}: typeAbsence.checkAbsences, res: Response) {
    if (!body.employee) return res.json({
        success: false,
        message: "employee not defined"
    })
    pool.getConnection(function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/absence/checkAbsences')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/absence/checkAbsences')
            let resAbsenceSelectCheck = await functionAbsence.absenceSelectCheck({res, connection}, {fk_employee: parseInt(body.employee)})
            connection.commit(function(err) {
                if (err) return errors.rollback(connection, res, err, 'controller/absence/checkAbsences')
                res.status(200).json({
                    succcess: true,
                    message: "ok",
                    data: resAbsenceSelectCheck
                })
                connection.release()
            })
        })
    })
}

export async function insertAbsence({body}: typeAbsence.insertAbsences, res: Response, req: typeAbsence.checkV3) {

    function saveImageToPath(hashNew: string, images: Buffer, code: String) {
        const uploadPath = '/var/www/ws/'
        const localPath = `${uploadPath}/images/business/${code}/absence/${moment().format("YYYY-MM")}/`
        const path = `/${moment().format("YYYY-MM")}`
        const filename = `${hashNew}.png`
        if (!fs.existsSync(`${uploadPath}`)) fs.mkdirSync(`${uploadPath}`, {recursive: true})
        if (!fs.existsSync(localPath)) fs.mkdirSync(localPath, {recursive: true})
        fs.writeFileSync(localPath + filename, images, 'base64')
        return { filename, uploadPath, path, localPath }
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/absence/insertAbsence')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/absence/insertAbsence')
            
            // let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            // if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            body.employee = body.employee || "0"
            body.hash = body.hash || ""

            let resSelectAbsences = await functionEmployee.getCodes({res, connection}, {code: parseInt(body.employee || "0"), pin: body.pin})
            if (resSelectAbsences.length < 1) return functionGlobal.sendResponse(res, connection, 200, false, 'Employee not found or wrong pin')
            
            let hashNew = sha1(body.business + body.employee + body.date)
            let imagename = ""

            if (body.image !== "") {
                let images = saveImageToPath(hashNew, Buffer.from(body.image, 'base64'), resSelectAbsences[0].code)
                body.image = 'https://quipster-ws.looyal.id/'+ images.localPath + images.filename
            }

            let resInsertAbsence = await functionAbsence.insert({res, connection}, {
                hash: hashNew,
                fk_business: parseInt(body.business),
                fk_user: parseInt(body.user),
                fk_employee: parseInt(body.employee || "0"),
                fk_absence_type: parseInt(body.absence_type),
                image: body.image,
                latitude: parseFloat(body.latitude),
                longitude: parseFloat(body.longitude),
                fk_customer: parseInt(body.customercode),
                notes: body.notes
            })
            if (resInsertAbsence) return functionGlobal.sendResponse(res, connection, 400, false, "Data not inserted")
            if(body.hash) {
                let insertHash = await functionAbsence.updateHash({res, connection}, {fk_end: hashNew, hash: hashNew})
                let insertHashs = await functionAbsence.updateHashs({res, connection}, {fk_end: hashNew, hash: body.hash})
            }
            connection.commit(function(err) {
                if (err) return errors.rollback(connection, res, err, 'controller/absence/insertAbsence')
                res.status(200).json({
                    success: true,
                    message: "ok"
                })
                connection.release()
            })
        })
    })
}

export async function absenceCheckV3(req: typeAbsence.checkV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['employee'])

            let requestBody = {
                employee: <number> parseFloat(req.body.employee),
            }
    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/absence/absenceCheckV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let requestBody = convertBody()!
            if (res.headersSent) return
            let responseBody: {
                hash: string,
                date_in: string,
                absence_type: number
            }

            let resGetAbsenceCheck  = await functionAbsence.absenceSelectCheck({res, connection}, {fk_employee: requestBody.employee})
            
            responseBody = resGetAbsenceCheck[0]
            
            if (resGetAbsenceCheck.length > 0) return res.status(200).json({success: true, message: "OK", data: responseBody})
            else return res.status(200).json({success: true, message: "null", data: []})
        } catch {
            return errors.rollback(connection, res, err, 'controller/absence/absenceCheckV3')
        }
    })
}