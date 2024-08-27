import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as type from '../type/shift'
import * as typeShift from '../type/shift'
import * as typeGlobal from '../type/global'

import * as shift from '../function/shift'
import * as functionCash from '../function/operational/cash'
import * as functionExpense from '../function/operational/expense'
import * as functionGlobal from '../function/global_function'
import * as functionUser from '../function/account/user'
import { ResultSetHeader } from "mysql2"

type insert = typeGlobal.requestV3 & {
    body: {
        type: string,
        value: string,
        notes?: string,
        date: string
    }
}
export async function insertV3(req: any, res: any) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['type', 'value', 'date'])
            let requestBody = {
                type: parseFloat(req.body.type),
                value: parseFloat(req.body.value),
                notes: <string>req.body.notes ?? '',
                date: req.body.date
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/shift/insert')

        connection.beginTransaction(async function (err) {
            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
                if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})
    
                let requestBody = convertBody()!
                if (res.headersSent) return
                let resultGetRecentCashIn = await functionCash.getRecentCashIn({res, connection}, {i_type: requestBody.type, dt_created: requestBody.date, fk_business: user.business, fk_user: user.code, i_value: requestBody.value})
                if (resultGetRecentCashIn.length > 0) return res.status(200).json({success: true, message: 'Cash in inserted.', data: resultGetRecentCashIn[0].code})

                let resInsertCash = await functionCash.insert({res, connection}, {fk_business: user.business, fk_user: user.code, dt_created: requestBody.date, i_type: requestBody.type, i_value: requestBody.value, v_notes: requestBody.notes})

                if (requestBody.type === 3) {
                    await functionCash.updateCashRecap({res, connection}, {fk_business: user.business, fk_user: user.code, fk_cashrecap: resInsertCash.insertId})
                    await functionExpense.updateCashRecap({res, connection}, {fk_business: user.business, fk_user: user.code, fk_cashrecap: resInsertCash.insertId})
                    connection.commit(function (err) {
                        if (err) return errors.rollback(connection, res, err, 'controller/shift/insert')
    
                        return res.status(200).json({success: true, message: 'Closed shift successfully.'})
                    })
                    return
                }

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/cash')

                    return res.status(200).json({success: true, message: 'Cash inserted successfully'})
                })
            } catch (err) {
                await errors.APIError(connection, err, req, res, 'controller/shift/insert', false)
            }
        })
    })

}

export async function insert({body}:{body: type.insertCash}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/shift/insert');
            } 
            else {
                var resultCheck:type.checkShift = await shift.checkCash({
                    connection: connection,
                    res: res,
                    data: body
                });

                if(resultCheck.count > 0) functionGlobal.error(connection, res, "Data Already Exist")
                else{
                    var resultOpenClose:type.getOpenClose = await shift.getOpenClose({
                        connection: connection,
                        res: res,
                        business: body.business,
                        date: body.date,
                    });


                    var result:ResultSetHeader = await shift.insertCash({
                        connection: connection,
                        res: res,
                        data: body
                    });

                    if (parseInt(body.type) === 3) {
                        await functionCash.updateCashRecapOld({res, connection}, {
                            fk_cashrecap: result.insertId,
                            fk_business: parseInt(body.business),
                            fk_user: parseInt(body.user),
                            dt_created: {
                                startdate: resultOpenClose.open,
                                enddate: resultOpenClose.close
                            }
                        })

                        await functionExpense.updateCashRecapOld({res, connection}, {
                            fk_cashrecap: result.insertId,
                            fk_business: parseInt(body.business),
                            fk_user: parseInt(body.user),
                            dt_expense: {
                                startdate: resultOpenClose.open,
                                enddate: resultOpenClose.close
                            }
                        })
                    }
    
                    connection.commit(function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/shift/insert');
                        } 
                        else {
                            res.status(200).json({
                                code: 200,
                                success: true,
                                message: "Add Cash Success",
                                data: result["insertId"]
                            })
                            connection.release();
                        };
                    })
                }
            }
        })
    })
}