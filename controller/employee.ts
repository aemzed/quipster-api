import { Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as typeEmployee from "../type/employee"

import * as functionEmployee from "../function/master/employee"
import * as functionGlobal from "../function/global_function"
import * as functionUser from '../function/account/user'

export function get({body}: typeEmployee.select, res: Response) {
    pool.getConnection(function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/select')
        connection.beginTransaction(async function (error) {
            if (err) return errors.rollback(connection, res, error, 'controller/employee/select')
            let resGetEmployee = await functionEmployee.getEmployees({res, connection}, {fk_business: parseInt(body.business)})
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, error, 'controller/employee/select')
                if (resGetEmployee.length > 1) res.status(200).json({
                    success: true,
                    message: "ok",
                    data: resGetEmployee
                })
                else res.status(204).json({
                    success: true,
                    message: "no data",
                    data: []
                })
                connection.release()
            })
        })
    })
}

export function insert({body}: typeEmployee.insert, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/insert')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/employee/insert')
            let resInsert = await functionEmployee.insert({res, connection}, {
                fk_business: parseInt(body.business),
                v_name: body.name,
                v_email: body.email,
                v_idnumber: body.idnumber,
                b_gender: parseInt(body.gender || '1'),
                v_address: body.address,
                v_phone: body.phone,
                v_pin: body.pin
            })
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/insert')
                if (resInsert) res.status(200).json({
                    success: true,
                    message: `Data inserted`,
                    data: resInsert.insertId
                })
                else res.status(200).json({
                    success: false,
                    message: 'Data not inserted',
                    data: null
                })
                connection.release()
            })
        })
    })
}

export function update({body}: typeEmployee.update, res: Response) {
    pool.getConnection(function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/update')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/employee/update')
            let resEmployeeUpdate = await functionEmployee.update({res, connection}, {
                name: body.name,
                email: body.email,
                idnumber: body.idnumber,
                gender: parseInt(body.gender),
                address: body.address,
                phone: body.phone,
                pin: body.pin,
                code: parseInt(body.code)
            })
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/update')
                if (resEmployeeUpdate.affectedRows) {
                    res.status(200).json({
                        success: true,
                        message:  "Data updated",
                    })
                }  
                else {
                    res.status(200).json({
                        success: false,
                        message: "Data not found"
                    })
                }
                connection.release()
            })
        })
    })
}

export function remove({body}: typeEmployee.remove, res: Response) {
    if(!body.code) res.status(400).json({
        success: false,
        message: "code not defined"
    })
    pool.getConnection(function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/remove')
        connection.beginTransaction(async function(err) {
            if (err) return errors.rollback(connection, res, err, 'controller/employee/remove')
            let resEmployeeRemove = await functionEmployee.remove({res, connection}, {code: parseInt(body.code)})
            if (!resEmployeeRemove.changedRows) return functionGlobal.sendResponse(res, connection, 400, false, "Data not deleted")
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/remove')
                if (resEmployeeRemove) res.status(200).json({
                    success: true,
                    message: "Data deleted"
                })
                else res.status(204).json({
                    success: false,
                    message: "Data not deleted"
                })
                connection.release()
            })
        })
    })
}

export async function selectV3(req: typeEmployee.selectV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/selectV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetPaymentMethod  = await functionEmployee.getEmployees({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resGetPaymentMethod})
        } catch {
            return errors.rollback(connection, res, err, 'controller/employee/selectV3')
        }
    })
}

export async function insertV3(req: typeEmployee.insertV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/insertV3/beginTransaction')
                let resGetEmployee = await functionEmployee.getEmployeeName({res, connection}, {fk_business: user.business, name: req.body.name, code: 0})
                if(resGetEmployee.length > 0 ) return res.status(200).json({success: true, message: `Data Already Added`, data: []})
                let resInsertEmployee = await functionEmployee.insertV3({res, connection}, {fk_user_modify: user.code, fk_business: user.business, v_name: req.body.name, v_email: req.body.email, v_idnumber: req.body.idnumber, b_gender: parseInt(req.body.gender), v_address: req.body.address, v_phone: req.body.phone, v_pin: req.body.pin })
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/employee/insertV3/commit')
                    return res.status(200).json({success: true, message: `Data Added Successfully`, data: resInsertEmployee})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/employee/insertV3')
        }
    })
}

export async function updateV3(req: typeEmployee.updateV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/updateV3/getConnection')
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/updateV3/beginTransaction')
                let resGetEmployee = await functionEmployee.getEmployeeName({res, connection}, {fk_business: user.business, name: req.body.name, code: parseFloat(req.body.code)})
                if(resGetEmployee.length > 0 ) return res.status(200).json({success: true, message: `Data Already Added`, data: []})
                let resUpdateEmployee = await functionEmployee.updateV3({res, connection}, {fk_user_modify: user.code, fk_business: user.business, name: req.body.name, email: req.body.email, idnumber: req.body.idnumber, gender: parseInt(req.body.gender), address: req.body.address, phone: req.body.phone, pin: req.body.pin , code: parseInt(req.body.code)})
                if (resUpdateEmployee.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/employee/updateV3/commit')
                    return res.status(200).json({success: true, message: `Data Update Successfully`, data: resUpdateEmployee})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/employee/updateV3')
        }
    })
}

export async function deleteV3(req: typeEmployee.deleteV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/employee/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/employee/deleteV3/beginTransaction')
                let resDeletePaymentMethod = await functionEmployee.softDelete({res, connection}, {fk_user_modify: user.code, i_code: parseFloat(req.body.code), fk_business: user.business})
                if (resDeletePaymentMethod.affectedRows! < 1) return res.status(400).json({success: false, message: "Data not found"})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/employee/deleteV3/commit')
                    return res.status(200).json({success: true, message: "OK", data: resDeletePaymentMethod})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/employee/deleteV3')
        }
    })
}