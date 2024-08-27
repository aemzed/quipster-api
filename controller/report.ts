import pool from "../config/connect"
import * as report from '../function/report'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as type from '../type/report'
import * as typeGlobal from '../type/global'
import * as typeReport from '../type/report'

import * as functionBusiness from "../function/account/business"
import * as functionCash from '../function/operational/cash'
import * as functionCustomer from '../function/master/customer'
import * as functionDepositBusinessStatement from '../function/operational/deposit_business_statement'
import * as functionExpense from '../function/operational/expense'
import * as functionIncome from '../function/operational/income'
import * as functionInvoice from '../function/operational/invoice'
import * as functionTransaction from '../function/transaction/transaction'
import * as functionTransactionPromotion from "../function/transaction/transactionpromotion"
import * as functionTransactionPromotionDetail from "../function/transaction/transactionpromotiondetail"
import * as functionTransactionDetail from '../function/transaction/transactiondetail'
import * as functionTransactionPayment from '../function/transaction/transactionpayment'
import * as functionTransactionAdditional from '../function/transaction/transactionadditional'
import * as functionInvoicePayment from '../function/operational/invoicepayment'
import * as functionAbsence from "../function/operational/absence"
import * as functionUser from "../function/account/user"
import * as functionMaterialPrice from '../function/master/materialprice'
import * as functionMode from "../function/setting/mode"
import * as functionReport from "../function/report"
import * as functionReturn from "../function/transaction/return"
import * as functionCommision from "../function/transaction/commision"
import * as functionCommisionStatement from "../function/transaction/commisionstatement"
import * as functionPurchaseOrder from "../function/operational/purchaseorder"
import * as functionStockOpname from '../function/operational/stockopname'
import * as functionStockOpnameDetail from "../function/operational/stockopname_detail"
import * as functionStockReport from "../function/operational/stockreport"
import * as functionStockTransfer from "../function/operational/stocktransfer"
import * as functionItem from "../function/master/item"
import * as functionItemPrice from "../function/master/itemprice"
import * as iconv from 'iconv-lite'

import { Request, response, Response } from "express"
import { stringify } from "querystring"
import { globalHandler } from "../function/global"
import { User } from "../type/user"
import { executeQuery } from "../util/mysql"
const moment = require('moment')

//============================================================================================

export async function getExpense({body:data}: {body: typeGlobal.requestReportv1}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/report/getExpense');
            } 
            else {
                var dataNew: typeGlobal.functionsReport = {
                    business: data.business,
                    date_start: data.startdate,
                    date_end: data.enddate
                }

                var results:type.expense[]= await report.getExpense({
                    connection: connection,
                    res: res,
                    data: dataNew
                });

                var dataReturn:any = [];
                for(var i=0; i<results.length; i++){
                    var dataTemp:any = results[i]; 
                    dataTemp["typeCash"] = dataTemp["type_cash"];
                    
                    delete dataTemp["type_cash"];
                    delete dataTemp["sort"];
                    delete dataTemp["date_complete"];
                    dataReturn.push(dataTemp);
                }

                connection.commit(function(err) {
                    if (err) errors.rollback(connection, res, err, 'controller/report/getExpense');
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: dataReturn
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}


export async function getStockComplete({body:data}: {body: typeGlobal.requestReportv1}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/report/getStockComplete');
            } 
            else {
                var dataNew: typeGlobal.functionsReport = {
                    business: data.business,
                    date_start: data.startdate,
                    date_end: data.enddate
                }

                var results:type.stockComplete= await report.getStockComplete({
                    connection: connection,
                    res: res,
                    data: dataNew
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/report/getStockComplete');
                    } else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: results
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}

type getAbsenceReport = {
    employee: string,
    absence_type: string,
    date_start: string,
    image_start: string,
    user_start: string,
    different_start: string,
    latitude_start: number,
    longitude_start: number,
    end?: string,
    date_end: string,
    image_end: string,
    user_end: string,
    different_end: string,
    latitude_end: string,
    longitude_end: string
}
export function getAbsenceReport({body}: type.getAbsenceReport, res: Response) {
    let checkBody = functionGlobal.checkBodyRequest({requestBody: body, requiredKeys: [
        {key: 'business', value_type: ['number']},
        {key: 'date_start', value_type: ['string']},
        {key: 'date_end', value_type: ['string']}
    ]})
    if (checkBody.success === false) return res.status(400).json({success: false, messsage: checkBody.message})

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/getAbsenceReport/getConnection')
        connection.beginTransaction( async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/getAbsenceReport/beginTransction')
            let resGetAbsenceStart = await functionAbsence.getStartAbsence({res, connection}, {
                fk_business: parseInt(body.business),
                dt_absence: {
                    startdate: body.date_start,
                    enddate: body.date_end
                }
            })
            if (resGetAbsenceStart.length < 1) functionGlobal.sendResponse(res, connection, 400, false, 'Absence not found')
            let newAbsences: Array<getAbsenceReport> = []   
            for (let eachAbsence of resGetAbsenceStart) {
                let tempAbsence = <getAbsenceReport>{}   
                let resGetAbsenceEnd = await functionAbsence.getEndAbsence({res, connection}, {fk_end: eachAbsence.end ?? ""})
                tempAbsence.employee = eachAbsence.employee
                tempAbsence.absence_type = eachAbsence.absence_type
                tempAbsence.date_start = eachAbsence.date_start
                tempAbsence.image_start = eachAbsence.image_start
                tempAbsence.user_start = eachAbsence.user_start
                tempAbsence.different_start = eachAbsence.different_start
                tempAbsence.latitude_start = eachAbsence.latitude_start
                tempAbsence.longitude_start = eachAbsence.longitude_start
                tempAbsence.end = eachAbsence.end                
                if (eachAbsence.end === "" || !resGetAbsenceEnd) {
                    tempAbsence.date_end = ""
                    tempAbsence.image_end = ""
                    tempAbsence.user_end = ""
                    tempAbsence.different_end = ""
                    tempAbsence.latitude_end = ""
                    tempAbsence.longitude_end = ""
                } else {
                    tempAbsence.date_end = resGetAbsenceEnd.date_end,
                    tempAbsence.image_end = resGetAbsenceEnd.image_end,
                    tempAbsence.user_end = resGetAbsenceEnd.user_end,
                    tempAbsence.different_end = resGetAbsenceEnd.different_end,
                    tempAbsence.latitude_end = resGetAbsenceEnd.latitude,
                    tempAbsence.longitude_end = resGetAbsenceEnd.longitude
                }
                delete tempAbsence.end
                newAbsences.push(tempAbsence)
            }
            connection.commit(function (err) {
                if (err) errors.rollback(connection, res, err, 'controller/report/getAbsenceReport/commit')
                else functionGlobal.sendResponse(res, connection, 200, true, "ok", newAbsences)
            })
        })
    })
}

export function listAddOnV3(req: typeReport.listAddOn, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/listAddOn/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/listAddon/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
                let qris = 0
                let resGetQRISType = await functionMode.getQRISType({res, connection}, {fk_business: user.business})
                if (resGetQRISType) resGetQRISType.qris_type !== 0 ? qris = 1 : qris = 0
                let resReportListAddOn = await functionReport.listAddOn({res, connection}, {fk_business: user.business})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/report/listAddOnV3/commit')
                    if (resReportListAddOn) return res.status(200).json({success: true, message: "OK", data: {...resReportListAddOn, qris: qris}})
                    else return res.status(200).json({success: true, message: "OK", data: {
                        absence: 0,
                        product_by_customer: 0,
                        table_management: 0,
                        product_hpp: 0,
                        purchase_order_detail: 0,
                        purchase_order_summary: 0,
                        transfer_stock_detail: 0,
                        transfer_stock_summary: 0,
                        stock_adjustment: 0,
                        stock_opname: 0,
                        stock_opname_ignore: 0,
                        commision: 0,
                        sales_product_consolidation: 0,
                        profit_sharing: 0,
                        ticketing: 0,
                        qris: qris
                    }})
                })
                
            } catch {
                errors.rollback(connection, res, err, 'controller/report/listAddOn/getConnection')
            }
        })
    })
}

type absenceV3 = {
    employee: string,
    absence_type: string,
    date_start: string,
    image_start: string,
    user_start: string,
    different_start: string,
    latitude_start: number,
    longitude_start: number,
    end?: string,
    date_end: string,
    image_end: string,
    user_end: string,
    different_end: string,
    latitude_end: string,
    longitude_end: string
}
export async function absenceV3(req: typeReport.absence, res: Response ) {
    pool.getConnection(async function (err, connection) {
        if (err) errors.rollback(connection, res, err, 'controller/report/absenceV3/getConnection')

        let responseData: Array<Partial<absenceV3>> = []
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStartAbsence = await functionAbsence.getStartAbsence({res, connection}, {fk_business: user.business, dt_absence: {startdate: req.body.date_start, enddate: req.body.date_end}})
            if (resStartAbsence.length > 0) {
                for (let startAbsence of resStartAbsence) {
                    let tempAbsence = <absenceV3>startAbsence
                    if (startAbsence.end === "") {
                        tempAbsence.date_end = ""
                        tempAbsence.image_end = ""
                        tempAbsence.user_end = ""
                        tempAbsence.different_end = ""
                        tempAbsence.latitude_end = ""
                        tempAbsence.longitude_end = ""
                    } else {
                        let resGetEndAbsence = await functionAbsence.getEndAbsence({res, connection}, {fk_end: startAbsence.end})
                        tempAbsence.date_end = resGetEndAbsence.date_end
                        tempAbsence.image_end = resGetEndAbsence.image_end
                        tempAbsence.user_end = resGetEndAbsence.user_end
                        tempAbsence.different_end = resGetEndAbsence.different_end
                        tempAbsence.latitude_end = resGetEndAbsence.latitude
                        tempAbsence.longitude_end = resGetEndAbsence.longitude
                        if (!resGetEndAbsence) return errors.rollback(connection, res, err, 'controller/report/absenceV3/resGetEndAbsence')
                    }
                    delete tempAbsence.end
                    responseData.push(tempAbsence)
                }
            }
            return res.status(200).json({success: true, message: "OK", data: responseData})
        } catch {
            errors.rollback(connection, res, err, 'controller/report/absenceV3')
        }
    })
}

export async function categorySummaryV3(req: typeReport.categorySummary, res: Response) {
    pool.getConnection(function (err, connection) {
        if(err) return errors.rollback(connection, res, err, 'controller/report/categorySummary/getConnection')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/categorySummary/getConnection')

            let responseData:any = {}

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not Valid."})

                let resGetCategorySummary = await functionTransactionDetail.getCategorySummary({res, connection}, {fk_business: user.business, dt_paid: {start_date:req.body.date_start, end_date: req.body.date_end}})
                responseData = resGetCategorySummary
                connection.commit(function(err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/report/categorySummary')
                    return res.status(200).json({success: true, message: "OK", data: responseData})
                })
            } catch {
                errors.rollback(connection, res, err, 'controller/report/categorySummary')
            }
        })
    })
}

export async function commisionV3(req: typeReport.commision, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/commision/getConnection')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/commision/beginTransaction')

            let responseData:any = []

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
                
                let resGetReport = await functionCommision.getReport({res, connection}, {fk_business: user.business, dt_created: {startdate: req.body.date_start, enddate: req.body.date_end}})
                responseData = resGetReport
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/report/commision/commit')
                    return res.status(200).json({success: true, message: "OK", data: responseData})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/report/commision')
            }
        })
    })
}

export async function commisionStatementV3(req: typeReport.commision_statement, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/commisionStatement/getConnection')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/commisionStatement/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let resGetReport = await functionCommisionStatement.getReport({res, connection}, {fk_employee: parseInt(req.body.employee), dt_created: {startdate: req.body.date_start, enddate: req.body.date_end}})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/report/commisionStatement/commit')
                    return res.status(200).json({success: true, message: resGetReport.totalBefore.value, data: resGetReport.listResult})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/report/commisionStatement')
            }
        })
    })
}

export async function dailySalesV3(req: typeReport.dailySales, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/dailySales/getConnection')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/dailySales/beginTransaction')

            let responseData: any = []

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
                
                let resGetReport = await functionTransaction.getReport({res, connection}, {fk_business: user.business, dt_paid: {startdate: req.body.date_start, enddate: req.body.date_end}})
                responseData = resGetReport
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/report/dailySales/commit')
                    return res.status(200).json({success: true, message: "OK", data: responseData})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/report/dailySales')
            }
        })
    })
}

type day = {
    
}
export async function dayV3(req: typeReport.day, res: Response) {
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/day/getConnection')
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/report/day/beginTransaction')

            let dateStartReal = Math.floor(Date.parse(req.body.date_start) / 1000)
            let dateEndReal = Math.floor(Date.parse(req.body.date_end) / 1000)
            let dateDiff = Math.round( (dateEndReal - dateStartReal) / (60 * 60 * 24) ) + 1


            let responseData: any[] = []

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not Valid."})

                await functionTransaction.setVarForGetDayReport({res, connection}, {dt_paid: {end_date: req.body.date_end}})
                let resGetDay = await functionTransaction.getDayReport({res, connection}, {fk_business: user.business, dt_paid: {end_date: req.body.date_end, date_diff: dateDiff}})
                for (let eachDay of resGetDay) {
                    let tempEachResponseData:any = eachDay

                    let resTransactionGetDayReportSalesType = await functionTransaction.getDayReportSalesType({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, selected_date: eachDay.date, end_date: req.body.date_end}})
                    tempEachResponseData.salestype = resTransactionGetDayReportSalesType

                    let resTransactiondetailGetDayReportHPP = await functionTransactionDetail.getDayReportHPP({res, connection}, {fk_business: user.business, dt_paid: {selected_date: eachDay.date}})
                    tempEachResponseData.total_hpp = resTransactiondetailGetDayReportHPP.total_hpp

                    let resTransactiondetailGetDayReportQTY = await functionTransactionDetail.getDayReportQTY({res, connection}, {fk_business: user.business, dt_paid: {selected_date: eachDay.date}})
                    tempEachResponseData.total_qty = resTransactiondetailGetDayReportQTY.total_qty

                    responseData.push(tempEachResponseData)
                }

                connection.commit(function (err) {
                    if (err) errors.rollback(connection, res, err, 'controller/report/day/commit')
                    return res.status(200).json({success: true, message: "OK", data: responseData})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/report/day')
            }
        })
    })
}

export async function discountV3(req: typeReport.discount, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/discountV3')    
            let user = await functionUser.checkToken({res,connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

            let resGetReport = await functionTransactionPromotion.getReport({res, connection}, {fk_business: user.business}, {vw_transaction: {dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}}})
            return res.status(200).json({success: true, message: "OK", data: resGetReport})
    })
}

export async function expenseV3(req: typeReport.expenseV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/expenseV3/getConnection')
        
        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

        let resExpenseGetExpenseReport: any = await functionExpense.getExpenseReport({res, connection}, {fk_business: user.business, dt_created: { start_date : req.body.date_start, end_date: req.body.date_end}})
        return res.status(200).json({success: true, message: "OK", data: resExpenseGetExpenseReport})
    })
}

export async function hourV3(req: typeReport.hourV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/hourV3/getConnnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportHour({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})
            return connection.release()

        } catch {
            return errors.rollback(connection, res, err, 'controller/report/hourV3')
        }
    })
}

export async function hourlySalesV3(req: typeReport.hourlySalesV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/hourlySalesV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
    
            let resGetHourlySalesReport = await functionTransaction.getHourlySalesReport({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
            return res.status(200).json({success: true, message: "OK", data: resGetHourlySalesReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/hourlySalesV3')
        }
    })
}

export async function invoicePaidV3(req: typeReport.invoicePaidV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/invoicePaidV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not validl."})

            let resGetInvoicePaidReport = await functionInvoicePayment.getInvoicePaidreport({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
            return res.status(200).json({success: true, message: "OK", data: resGetInvoicePaidReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/invoicePaidV3')
        }
    })
}

export async function profitSharingV3(req: typeReport.profitSharingV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/profitSharingV3/getConnection')

        req.body.consolidation = req.body.consolidation || '0'

        let responseData = []
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            if (parseFloat(req.body.consolidation) === 0) responseData = await functionTransactionDetail.getProfitSharingBusinessV3({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
            else if(user.special === 0) {
                let resBusinessOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                responseData = await functionTransactionDetail.getProfitSharingBusinessOwnerV3({res, connection}, {fk_businessowner: resBusinessOwner.code, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
            }
            else responseData = await functionTransactionDetail.getProfitSharingUserV3({res, connection}, {fk_user: user.code, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})

            return res.status(200).json({success: true, message: "OK", data: responseData})

        } catch {
            return errors.rollback(connection, res, err, 'controller/report/profitSharingV3')
        }
    })
}

export async function profitSharingDetailV3(req: typeReport.profitSharingDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/profitSharingDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resReportProfitSharingDetail = await functionTransactionDetail.getReportProfitSharingDetail({res, connection}, {fk_item: parseInt(req.body.item_code)}, {vw_transaction: {dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}}})
            return res.status(200).json({success: true, message: "OK", data: resReportProfitSharingDetail})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/profitSharingDetailV3/getConnection')
        }
    })
}

export async function purchaseOrderDetailV3(req: typeReport.purchaseOrderDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/purchaseOrderDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetReportPurchaseOrderDetail = await functionPurchaseOrder.getReportPurchaseOrderDetail({res, connection}, {fk_business: user.business, dt_received: {start_date: req.body.date_start, end_date: req.body.date_end}})
            
            return res.status(200).json({success: true, message: "OK", data: resGetReportPurchaseOrderDetail.map((eachDetail) => ({...eachDetail, date: moment(eachDetail.date).format('YYYY-MM-DD')}))})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/purchaseOrderDetailV3')
        }
    })
}

export async function purchaseOrderSummaryV3(req: typeReport.purchaseOrderSummaryV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/purchaseOrderSummaryV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetPurchaseOrderSummary = await functionPurchaseOrder.getReportPurchaseOrderSummary({res, connection}, {fk_business: user.business, dt_received: {start_date: req.body.date_start, end_date: req.body.date_end}})
            return res.status(200).json({success: true, message: "OK", data: resGetPurchaseOrderSummary})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/purchaseOrderSummaryV3')
        }
    })
}

export async function revenueV3(req: typeReport.revenueV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/revenueV3/getConnection')

        req.body.consolidation = req.body.consolidation ?? "0"
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            if(parseInt(req.body.consolidation) === 0) {
                let resTransactionGetReport = await functionTransaction.getReportRevenue({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, v_createdby: '%', v_paidby: '%', vw_customer: {v_name: '%'}, vw_invoicepayment: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}})
                if (!resTransactionGetReport) return res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})
                let resTransactionPaymentGetReport = await functionTransactionPayment.getReportRevenue({res, connection}, {vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business, v_createdby: '%', v_paidby: '%'}, vw_customer: {v_name: '%'}, vw_paymentmethod: {i_code: '%'}})
                let resTransactionPromotionGetReport = await functionTransactionPromotion.getReportRevenue({res, connection}, {fk_business: user.business, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, v_createdby: '%', v_paidby: '%'}, vw_customer: {v_name: '%'}})
                let resExpenseGetReport = await functionExpense.getReportRevenue({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
                let resIncomeGetReport = await functionIncome.getReportRevenue({res, connection}, {fk_business: user.business, dt_income: {date_start: req.body.date_start, date_end: req.body.date_end}})
                return res.status(200).json({success: true, message: "OK", data: {...resTransactionGetReport, payment: resTransactionPaymentGetReport, expense: resExpenseGetReport, income: resIncomeGetReport, promotion: resTransactionPromotionGetReport}})
            }
            else {
                if (user.special === 0) {
                    let resBusinessGetOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                    let resTransactionGetConsolidationReport = await functionTransaction.getReportConsolidationRevenue({res, connection}, {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, v_createdby: '%', v_paidby: '%', vw_business: {fk_businessowner: resBusinessGetOwner.code}, vw_customer: {v_name: '%'}, vw_invoicepayment: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}})
                    if (!resTransactionGetConsolidationReport) return res.status(200).json({success: true, message: "OK", data: {}})
                    let resTransactionPaymentGetConsolidationReport = await functionTransactionPayment.getReportConsolidationRevenue({res, connection}, {vw_business: {fk_businessowner: resBusinessGetOwner.code}, vw_customer: {v_name: '%'}, vw_paymentmethod: {i_code: '%'}, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end:req.body.date_end}, v_createdby: '%', v_paidby: '%'}})
                    let resTransactionPromotionGetConsolidationReport = await functionTransactionPromotion.getReportConsolidationRevenue({res, connection}, {vw_business: {fk_businessowner: resBusinessGetOwner.code}, vw_customer: {v_name: '%'}, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, v_createdby: '%', v_paidby: '%'}})
                    let resExpenseGetConsolidationReport = await functionExpense.getReportConsolidationRevenue({res, connection}, {dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_business: {fk_businessowner: resBusinessGetOwner.code}})
                    let resIncomeGetConsolidationReport = await functionIncome.getReportConsolidationRevenue({res, connection}, {dt_income: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_business: {fk_businessowner: resBusinessGetOwner.code}})
                    return res.status(200).json({success: true, message: "OK", data: {...resTransactionGetConsolidationReport, payment: resTransactionPaymentGetConsolidationReport, expense: resExpenseGetConsolidationReport, income: resIncomeGetConsolidationReport, promotion: resTransactionPromotionGetConsolidationReport}})
                } else {
                    let resTransactionGetSpecialReport = await functionTransaction.getReportSpecialRevenue({res, connection}, {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_business_user: {fk_user: user.code}, vw_invoicepayment: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}})
                    if (!resTransactionGetSpecialReport) return res.status(200).json({success: true, message: "OK", data: {}})
                    let resTransactionPaymentGetSpecialReport = await functionTransactionPayment.getReportSpecialRevenue({res, connection}, {vw_business_user: {fk_user: user.code}, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}})
                    let resTransactionPromotionGetSpecialReport = await functionTransactionPromotion.getReportSpecialRevenue({res, connection}, {vw_business_user: {fk_user: user.code}, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}})
                    let resExpenseGetSpecialReport = await functionExpense.getReportSpecialRevenue({res, connection}, {dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_business_user: {fk_user: user.code}})
                    let resIncomeGetSpecialReport = await functionIncome.getReportSpecialRevenue({res, connection}, {dt_income: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_business_user: {fk_user: user.code}})
                    return res.status(200).json({success: true, message: "OK", data: {...resTransactionGetSpecialReport, payment: resTransactionPaymentGetSpecialReport, expense: resExpenseGetSpecialReport, income: resIncomeGetSpecialReport, promotion: resTransactionPromotionGetSpecialReport}})
                }
            }
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/revenueV3/getConnection')
        }
    })
}

export async function salesV3(req: typeReport.salesV3, res: Response) {

    function bodyConverter() {
        return<{
            date_start: string,
            date_end: string,
            void_status?: number
        }>{
            date_start: req.body.date_start,
            date_end: req.body.date_end,
            void_status: req.body.void_status
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesV3/getConnection')

        let requestBody = bodyConverter()
        let responseBody:any = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resFunctionTransactionGetReportSales = await functionTransaction.getReportSales({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}, ...(req.body.void_status && {isvoid: parseFloat(req.body.void_status)})})
            for (let eachTransactionReport of resFunctionTransactionGetReportSales) {
                let eachResponseBody:any = eachTransactionReport
                let resTransactionPaymentGetReportSales = await functionTransactionPayment.getReportSales({res, connection}, {fk_transaction: eachTransactionReport.code})
                eachResponseBody.payment = resTransactionPaymentGetReportSales
                responseBody.push(eachResponseBody)
            }
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesV3')
        }
    })
}

export async function salesSuperSellingV3(req: typeReport.superSellingV3, res: Response) {

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/superSellingV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetSalesSuperSellingReport = await functionTransaction.getReportSalesSuperselling({res, connection}, {fk_business: user.business, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
            return res.status(200).json({success: true, message: "OK", data: resTransactionGetSalesSuperSellingReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesSuperSellingV3')
        }
    })
}

export async function stockConsolidationV3(req: typeReport.stockConsolidationV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockConsolidationV3/getConnection')

        let responseBody: Array<{
            sku: string,
            name: string,
            qty: number,
            hpp_total: number,
            detail: Array<{
                        business_code: number,
                        business_name: string,
                        stock: string | number
                    }>
        }> = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            if (user.special === 0) {
                let resGetBusinessOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                let resGetAllBusinessNames = await functionBusiness.getNameFromOwner({res, connection}, {fk_businessowner: resGetBusinessOwner.code})
                let resGetReportStockConsolidationOwner = await functionStockReport.getReportStockConsolidationOwner({res, connection}, {vw_businessowner: {code: resGetBusinessOwner.code}})
                let tempReport: {
                    [sku: string]: {
                        sku: string,
                        name: string,
                        detail: {
                            [business_code: string]: {
                                business_code: number, 
                                business_name: string, 
                                stock: string, 
                                hpp_total: string
                            }
                        }
                    }
                } = {}
                for (let eachReport of resGetReportStockConsolidationOwner) {
                    if (!tempReport[eachReport.item_sku]) {
                        tempReport[eachReport.item_sku] = {
                            sku: eachReport.item_sku,
                            name: eachReport.item_name,
                            detail: {}
                        }
                        for (let eachBusinessName of resGetAllBusinessNames) {
                            tempReport[eachReport.item_sku].detail[eachBusinessName.name] = {
                                business_code: eachBusinessName.code,
                                business_name: eachBusinessName.name,
                                stock: "-",
                                hpp_total: "-"
                            }
                        }
                    }
                    tempReport[eachReport.item_sku].detail[eachReport.business_name] = {
                        business_code: eachReport.business_code,
                        business_name: eachReport.business_name,
                        stock: eachReport.stock,
                        hpp_total: eachReport.hpp_total
                    }
                }
                for (let reportKey of Object.keys(tempReport)) {
                    let eachResponseBody: {
                        sku: string,
                        name: string,
                        qty: number,
                        hpp_total: number,
                        detail: Array<{
                                    business_code: number,
                                    business_name: string,
                                    stock: string | number
                                }>
                    } = {
                        sku: tempReport[reportKey].sku,
                        name: tempReport[reportKey].name,
                        qty: Object.keys(tempReport[reportKey].detail).reduce((total, businessName) => tempReport[reportKey].detail[businessName].stock === "-" ? total : total + parseFloat(tempReport[reportKey].detail[businessName].stock), 0),
                        hpp_total: Object.keys(tempReport[reportKey].detail).reduce((total, businessName) => tempReport[reportKey].detail[businessName].hpp_total === "-" ? total : total + parseFloat(tempReport[reportKey].detail[businessName].hpp_total), 0),
                        detail: Object.keys(tempReport[reportKey].detail).map((businessName) => ({
                            business_code: tempReport[reportKey].detail[businessName].business_code,
                            business_name: tempReport[reportKey].detail[businessName].business_name,
                            stock: tempReport[reportKey].detail[businessName].stock,
                        }))
                    }
                    responseBody.push(eachResponseBody)
                }
            }
            else {
                let resGetAllBusinessNames = await functionBusiness.getNameFromUser({res, connection}, {vw_business_user: {fk_user: user.code}})
                let resGetReportStockConsolidationUser = await functionStockReport.getReportStockConsolidationUser({res, connection}, {vw_business_user: {code: user.code}, dt_created: req.body.date})
                let tempReport: {
                    [sku: string]: {
                        sku: string,
                        name: string,
                        detail: {
                            [business_code: string]: {
                                business_code: number, 
                                business_name: string, 
                                stock: string, 
                                hpp_total: string
                            }
                        }
                    }
                } = {}
                for (let eachReport of resGetReportStockConsolidationUser) {
                    if (!tempReport[eachReport.item_sku]) {
                        tempReport[eachReport.item_sku] = {
                            sku: eachReport.item_sku,
                            name: eachReport.item_name,
                            detail: {}
                        }
                        for (let eachBusinessName of resGetAllBusinessNames) {
                            tempReport[eachReport.item_sku].detail[eachBusinessName.name] = {
                                business_code: eachBusinessName.code,
                                business_name: eachBusinessName.name,
                                stock: "-",
                                hpp_total: "-"
                            }
                        }
                    }
                    tempReport[eachReport.item_sku].detail[eachReport.business_name] = {
                        business_code: eachReport.business_code,
                        business_name: eachReport.business_name,
                        stock: eachReport.stock,
                        hpp_total: eachReport.hpp_total
                    }
                }
                for (let reportKey of Object.keys(tempReport)) {
                    let eachResponseBody: {
                        sku: string,
                        name: string,
                        qty: number,
                        hpp_total: number,
                        detail: Array<{
                                    business_code: number,
                                    business_name: string,
                                    stock: string | number
                                }>
                    } = {
                        sku: tempReport[reportKey].sku,
                        name: tempReport[reportKey].name,
                        qty: Object.keys(tempReport[reportKey].detail).reduce((total, businessName) => tempReport[reportKey].detail[businessName].stock === "-" ? total : total + parseFloat(tempReport[reportKey].detail[businessName].stock), 0),
                        hpp_total: Object.keys(tempReport[reportKey].detail).reduce((total, businessName) => tempReport[reportKey].detail[businessName].hpp_total === "-" ? total : total + parseFloat(tempReport[reportKey].detail[businessName].hpp_total), 0),
                        detail: Object.keys(tempReport[reportKey].detail).map((businessName) => ({
                            business_code: tempReport[reportKey].detail[businessName].business_code,
                            business_name: tempReport[reportKey].detail[businessName].business_name,
                            stock: tempReport[reportKey].detail[businessName].stock,
                        }))
                    }
                    responseBody.push(eachResponseBody)
                }
            }
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockConsolidationV3')
        }
    })
}

export async function newStockConsolidationV3(req: typeReport.stockConsolidationV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockConsolidationV3/getConnection')

        let responseBody:any = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            if (user.special === 0) {
                let resGetBusinessOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                let resGetCodeNameQTYHPPOwner = await functionItem.getSKUNameQtyHPPTotalOwner({res, connection}, {fk_businessowner: resGetBusinessOwner.code})
                if (resGetCodeNameQTYHPPOwner.length > 0) {
                    for (let eachItem of resGetCodeNameQTYHPPOwner) {
                        let eachResponseBody:any = eachItem
                        let resBusinessGetNameCodeQTYOwner = await functionBusiness.getNameCodeAndQtyOwner({res, connection}, {fk_businessowner: resGetBusinessOwner.code}, {vw_item: {v_code: eachItem.sku}}, {vw_stockreport: {dt_created: {end_date: req.body.date}}})
                        eachResponseBody.detail = resBusinessGetNameCodeQTYOwner
                        responseBody.push(eachResponseBody)
                    }
                }
            }
            else {
                let resGetSKUNameQTYHPPUser = await functionItem.getSKUNameQtyHPPTotalUser({res, connection}, {fk_user: user.code})
                if (resGetSKUNameQTYHPPUser.length > 0) {
                    for (let eachItem of resGetSKUNameQTYHPPUser) {
                        let eachResponseBody:any = eachItem
                        let resBusinessgetNameCodeQTYUser = await functionBusiness.getNameCodeAndQtyUser({res, connection}, {fk_user: user.code}, {vw_item: {v_code: eachItem.sku}}, {vw_stockreport: {dt_created: {end_date: req.body.date}}})
                        eachResponseBody.detail = resBusinessgetNameCodeQTYUser
                        responseBody.push(eachResponseBody)
                    }
                }
            }
            
            connection.release()
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            connection.release()
            return errors.rollback(connection, res, err, 'controller/report/stockConsolidationV3')
        }
    })
}

// export async function shiftDetailV3(req: typeReport.shiftDetailV3, res: Response) {

//     let responseBody = {
//         cash_in: <any>[],
//         total_cash_in: <any> 0,
//         expense: <any>[],
//         total_expense: <any> 0,
//         payment_method: <any>[],
//         product: <any>[],
//         invoice_paid: <any> [],
//         total_products_sale: <any> 0,
//         qty_products_sale: <any> 0,
//         product_void: <any>[],
//         additional: <any> 0,
//         promotion: <any> 0,
//         tax: <any> 0,
//         service_charge: <any> 0,
//         total_income: <any> 0
//     }
//     pool.getConnection(async function (err, connection) {
//         if (err) return errors.rollback(connection, res, err, 'controller/report/getShiftDetailV3/getConnection')

//         try {
//             let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
//             if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

//             responseBody.cash_in = await functionCash.reportShiftCashin({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}},{vw_user: {name: req.body.user}})
//             for (let eachCashIn of responseBody.cash_in) 
//                 responseBody.total_cash_in += parseFloat(eachCashIn.value)

//             responseBody.expense = await functionExpense.reportShiftExpense({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}}, {vw_user: {name: req.body.user}})
//             for (let eachExpense of responseBody.expense) 
//                 responseBody.total_expense += parseFloat(eachExpense.total)

//             responseBody.payment_method = await functionTransaction.reportShiftPaymentmethod({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, paidby: req.body.user})
            
//             responseBody.product = await functionTransactionDetail.reportShiftProduct({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, paidby: req.body.user})
//             for (let eachProduct of responseBody.product) {
//                 responseBody.total_products_sale += parseFloat(eachProduct.total)
//                 responseBody.qty_products_sale += parseFloat(eachProduct.qty)
//             }

//             responseBody.invoice_paid = await functionInvoicePayment.getReportShiftDetail({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_user: {v_name: req.body.user}})
            
//             responseBody.product_void = await functionTransactionDetail.reportShiftProductVoid({res, connection}, {fk_business: user.business,  dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, paidby: req.body.user})
//             let others = await functionTransaction.reportShiftOtherDetail({res, connection}, {fk_business: user.business, paidby: req.body.user, dt_paid: {start_date: req.body.date_start, end_date: req.body.date_end}})
//             if (others) {
//                 responseBody.additional = others.total_sales_additional
//                 responseBody.promotion = others.total_promotion
//                 responseBody.tax = others.tax
//                 responseBody.service_charge = others.service_charge
//             }
//             responseBody.total_income = parseFloat(responseBody.total_products_sale) + parseFloat(responseBody.additional) + parseFloat(responseBody.tax) + parseFloat(responseBody.service_charge) - parseFloat(responseBody.promotion)

//             return res.status(200).json({success: true, message: "OK", data: responseBody})
//         } catch {
//             return errors.rollback(connection, res, err, 'controller/report/getShiftDetailV3')
//         }
//     })
// }

export async function stockConsolidationBusinessV3 (req: typeReport.stockConsolidationBusinessV3, res: Response) {
    
    let responseBody: Array<{name: string}> = []

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockConsolidationBusinessV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            if (user.special === 0) {
                let resGetOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                responseBody = await functionBusiness.getNameFromOwner({res, connection}, {fk_businessowner: resGetOwner.code})
            } else {
                responseBody = await functionBusiness.getNameFromUser({res, connection}, {vw_business_user: {fk_user: user.code}})
            }
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockConsolidationBusinessV3')
        }
    })
}

export async function salesCompleteV3 (req: typeReport.salesCompleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesCompleteV3/getConnection')

        req.body.void_status = req.body.void_status ?? '%'

        let responseBody: any = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportSalesComplete({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, isvoid: req.body.void_status})
            if (resTransactionGetReport.length > 0) {
                for (let eachReport of resTransactionGetReport) {
                    let resTransactionPaymentGetReport = await functionTransactionPayment.getReportSales({res, connection}, {fk_transaction: eachReport.code})
                    let resTransactionPromotionGetReport = await functionTransactionPromotion.getReportSalesComplete({res, connection}, {fk_transaction: eachReport.code})
                    let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesComplete({res, connection}, {fk_transaction: eachReport.code})
                    let tempTransactionDetail = []
                    if (resTransactionDetailGetReport.length > 0) {
                        for (let eachTransactionDetail of resTransactionDetailGetReport) {
                            let resTransactionAdditionalGetReport = await functionTransactionAdditional.getReportSalesComplete({res, connection}, {fk_transactiondetail: eachTransactionDetail.detail_code})
                            let resTransactionPromotionDetailGetReport = await functionTransactionPromotionDetail.getReportSalesComplete({res, connection}, {fk_transactiondetail: eachTransactionDetail.detail_code})
                            let promotion_cart_nominal = parseFloat(eachTransactionDetail.totalprice) * parseFloat(eachReport.promotion_value)
                            if (parseFloat(eachReport.totalnet_cart_price)) promotion_cart_nominal = promotion_cart_nominal / parseFloat(eachReport.totalnet_cart_price)
                            tempTransactionDetail.push({...eachTransactionDetail, additional: resTransactionAdditionalGetReport, promotion: resTransactionPromotionDetailGetReport, promotion_cart_nominal: promotion_cart_nominal})
                        }
                    }

                    let resReturnGetReport = await functionReturn.getReportSalesComplete({res, connection}, {s_offlinecode_transaction: eachReport.receipt})
                    if (resReturnGetReport.length > 0) {
                        if (parseInt(eachReport.void_status) === 1) eachReport.void_status = 2
                    }

                    responseBody.push({...eachReport, payment: resTransactionPaymentGetReport, promotion: resTransactionPromotionGetReport, detail: tempTransactionDetail, business_name: user.business_name})
                }
            }

            res.status(200).json({success: true, message: "OK", data: responseBody})
            connection.release()
            return
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesCompleteV3')
        }
    })
}

type salesCompleteConsolidationV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        date_start: string,
        date_end: string,
        void_status?: string
    }
}
export async function salesCompleteConsolidationV3 (req: salesCompleteConsolidationV3Request, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, ['date_start', 'date_end'])
        let requestBody = {
            user: req.body.user,
            date_start: req.body.date_start,
            date_end: req.body.date_end,
            void_status: (req.body.void_status == undefined || req.body.void_status === '') ? undefined : parseFloat(req.body.void_status)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }
    await globalHandler('controller/report/salesCompleteConsolidation', req, res, async () => {
        let requestBody = convertBody()
        let responseBody = []
        let resultGetTransactions = await executeQuery(`
            SELECT
                a.i_code AS \`code\`,
                a.i_ordernumber AS \`order_number\`,
                a.s_offlinecode AS \`receipt\`,
                a.v_code AS \`receipt_code\`,
                IFNULL(b.i_code, 0) AS \`customer_code\`,
                IFNULL(b.v_name, '') AS \`customer_name\`,
                IFNULL(a.v_guest, '') AS \`guest\`,
                a.v_createdby AS \`order_taker\`,
                a.v_paidby AS \`cashier\`,
                a.dt_created AS \`date\`,
                a.dt_paid AS \`date_paid\`,
                a.i_total AS \`subtotal\`,
                a.i_vatnominal AS \`tax\`,
                a.i_scnominal AS \`service_charge\`,
                IFNULL(a.i_vat, 0) AS \`tax_percent\`,
                IFNULL(a.i_sc, 0) AS \`service_charge_percent\`,
                IFNULL(d.i_promotionnominal, 0) AS \`promotion_value\`,
                e.v_name AS \`promotion_name\`,
                a.i_totalpromotion AS \`total_promotion\`,
                a.i_rounded AS \`rounded\`,
                a.i_totalnet AS \`total\`,
                COALESCE(SUM(j.i_pricenet * j.i_qty), 0) AS \`hpp\`,
                IFNULL(a.i_totalnet - a.i_vatnominal - a.i_scnominal - a.i_pph23 - SUM(j.i_pricenet * j.i_qty), '0') AS \`margin\`, 
                a.i_changes AS \`changes\`,
                a.b_isvoid AS \`void_status\`,
                a.fk_salestype AS \`salestype_code\`,
                c.v_name AS \`salestype_name\`,
                a.b_process AS \`process_status\`,
                (
                    SELECT SUM(z.i_qty)
                    FROM dvw_transaction.vw_transactiondetail z
                    WHERE z.fk_transaction = a.i_code
                        AND z.b_isactive = 1
                        AND z.b_isvoid = 0
                ) AS \`total_qty\`,
                IFNULL((
                    SELECT SUM(zz.i_price)
                    FROM dvw_transaction.vw_transactiondetail zz
                    WHERE zz.fk_transaction = a.i_code
                        AND zz.b_isactive = 1
                        AND zz.b_isvoid = 0
                ), 0) AS \`total_cart_price\`,
                IFNULL((
                    SELECT SUM((zzz.i_price * zzz.i_qty) - IFNULL((yyy.i_promotionnominal * zzz.i_qty), 0))
                    FROM dvw_transaction.vw_transactiondetail zzz
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail yyy ON yyy.fk_transactiondetail = zzz.i_code
                    WHERE zzz.fk_transaction = a.i_code
                        AND zzz.b_isactive = 1
                        AND zzz.b_isvoid = 0
                ), 0) AS \`totalnet_cart_price\`,
                CASE
                    WHEN IFNULL(k.b_relx, 0) = 1 THEN (
                                                        SELECT
                                                            COUNT(1)
                                                        FROM tkd_relx.rlx_point_movement a
                                                        WHERE a.fk_source = a.s_offlinecode
                                                        )
                    ELSE 0
                END as point_scanned
            FROM dvw_transaction.vw_transaction a
            LEFT JOIN dvw_account.vw_business z ON z.i_code = a.fk_business
            LEFT JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
            LEFT JOIN dvw_master.vw_salestype c ON a.fk_salestype = c.i_code
            LEFT JOIN dvw_transaction.vw_transactionpromotion d ON a.i_code = d.fk_transaction
            LEFT JOIN dvw_master.vw_promotion e ON d.fk_promotion = e.i_code
            LEFT JOIN dvw_account.vw_user h ON h.i_code = a.fk_usercreate
            LEFT JOIN dvw_account.vw_user i ON i.i_code = a.fk_userpaid
            LEFT JOIN dvw_transaction.vw_transactiondetail j ON j.fk_transaction = a.i_code AND j.b_isvoid = 0
            LEFT JOIN dvw_setting.vw_other k ON k.fk_business = a.fk_business
            WHERE a.b_isactive = 1
                AND z.fk_businessowner = ${requestBody.user.business_ownerCode}
                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') >= '${requestBody.date_start}'
                AND DATE_FORMAT(a.dt_paid, '%Y-%m-%d') <= '${requestBody.date_end}'
                ${requestBody.void_status != undefined ? `AND a.b_isvoid = ${requestBody.void_status}` : ``}
            GROUP BY a.i_code
        `)
        for (let eachTransaction of resultGetTransactions) {
            eachTransaction.payments = await executeQuery(`
                SELECT 
                    a.fk_paymentmethod AS \`payment_method_code\`, 
                    b.v_name AS \`payment_method_name\`,
                    a.i_paidmoney AS \`paid_money\`
                FROM dvw_transaction.vw_transactionpayment a
                JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                WHERE a.fk_transaction = ${eachTransaction.code}
            `)
            eachTransaction.promotions = await executeQuery(`
                SELECT 
                    a.fk_paymentmethod AS \`payment_method_code\`, 
                    b.v_name AS \`payment_method_name\`,
                    a.i_paidmoney AS \`paid_money\`
                FROM dvw_transaction.vw_transactionpayment a
                JOIN dvw_master.vw_paymentmethod b ON a.fk_paymentmethod = b.i_code
                WHERE a.fk_transaction = ${eachTransaction.code}
            `)
            eachTransaction.details = await executeQuery(`
                SELECT *
                FROM (
                    SELECT 
                        a.i_code AS detail_code,
                        a.fk_item AS item_code, 
                        b.v_code AS sku,
                        b.v_name AS item_name,
                        a.i_price AS price,
                        (a.i_price * a.i_qty) - (IFNULL(z.i_promotionnominal, 0) * a.i_qty) as totalprice,
                        a.i_pricenet AS hpp,
                        (a.i_price - a.i_pricenet) / a.i_pricenet * 100 AS margin,
                        a.i_qty AS qty,
                        a.fk_unit AS unit_code,
                        d.v_name AS \`unit_name\`,
                        a.v_preference AS notes,
                        a.b_isvoid AS void_status,
                        a.v_voidreason AS void_reason,
                        b.b_hasstock AS has_stock,
                        0 AS is_package,
                        a.d_pph AS category_pph,
                        c.v_name AS category,
                        c.i_code AS categorycode,
                        '' AS detail
                    FROM dvw_transaction.vw_transactiondetail a
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail z ON z.fk_transactiondetail = a.i_code
                    JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                    JOIN dvw_master.vw_category c ON b.fk_category = c.i_code
                    JOIN dvw_master.vw_unit d ON b.fk_unit = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.b_type = 1
                        AND a.fk_transaction = ${eachTransaction.code}
                    UNION ALL
                        SELECT 
                        d.i_code AS detail_code,
                        d.fk_item AS item_code, 
                        e.v_code AS sku,
                        e.v_name AS item_name,
                        d.i_price AS price,
                        (d.i_price * d.i_qty) - (IFNULL(z.i_promotionnominal, 0) * d.i_qty) as totalprice,
                        d.i_pricenet AS hpp,
                        (d.i_price - d.i_pricenet) / d.i_pricenet * 100 AS margin,
                        d.i_qty AS qty,
                        0 AS unit_code,
                        'Pcs' AS \`unit_name\`,
                        d.v_preference AS notes,
                        d.b_isvoid AS void_status,
                        d.v_voidreason AS void_reason,
                        0 AS has_stock,
                        1 AS is_package,
                        0 AS category_pph,
                        'Paket' AS category,
                        '0' AS categorycode,
                        (
                            SELECT GROUP_CONCAT(DISTINCT CONCAT('> ', g.v_name, ' (', ROUND(f.i_qty), ')') SEPARATOR '\n')
                            FROM dvw_master.vw_packagedetail f
                            JOIN dvw_master.vw_item g ON f.fk_item = g.i_code
                            WHERE f.fk_package = d.fk_item
                                AND f.b_isactive = 1
                        ) AS \`detail\`
                    FROM dvw_transaction.vw_transactiondetail d
                    LEFT JOIN dvw_transaction.vw_transactionpromotiondetail z ON z.fk_transactiondetail = d.i_code
                    JOIN dvw_master.vw_package e ON d.fk_item = e.i_code
                    WHERE d.b_isactive = 1
                        AND d.b_type = 2
                        AND d.fk_transaction = ${eachTransaction.code}
                ) AS \`temp\`
                ORDER BY \`temp\`.\`detail_code\`
            `)
            for (let eachDetail of eachTransaction.details) {
                eachDetail.additionals = await executeQuery(`
                    SELECT 
                        a.fk_additional AS code, 
                        b.v_name AS name,
                        a.i_price AS price,
                        a.i_qty AS qty
                    FROM dvw_transaction.vw_transactionadditional a
                    JOIN dvw_master.vw_additional b ON a.fk_additional = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transactiondetail = ${eachDetail.detail_code}
                `)
                eachDetail.promotions = await executeQuery(`
                    SELECT 
                        a.fk_promotion AS code, 
                        CASE
                            WHEN a.fk_promotion = 1 THEN CONCAT(b.v_name, ' (', c.v_currency, ' ', FLOOR(a.i_promotion), ')')
                            WHEN a.fk_promotion = 2 THEN CONCAT(b.v_name, ' (', FLOOR(a.i_promotion), '%)')
                            ELSE b.v_name
                        END AS name,
                        a.i_promotionnominal AS nominal,
                        a.i_promotion AS value,
                        b.fk_systempromotion AS \`type\`,
                        b.i_maximum_promo AS \`maximum_promo\`,
                        d.v_name AS \`type_name\`
                    FROM dvw_transaction.vw_transactionpromotiondetail a
                    JOIN dvw_master.vw_promotion b ON a.fk_promotion = b.i_code
                    JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                    JOIN dvw_system.vw_promotion d ON b.fk_systempromotion = d.i_code
                    WHERE a.b_isactive = 1
                        AND a.fk_transactiondetail = ${eachDetail.detail_code}
                `)
                if (parseFloat(eachTransaction.totalnet_cart_price)) eachDetail.promotion_cart_nominal = parseFloat(eachDetail.totalprice) * parseFloat(eachTransaction.promotion_value) / parseFloat(eachTransaction.totalnet_cart_price)
                else eachDetail.promotion_cart_nominal = parseFloat(eachDetail.totalprice) * parseFloat(eachTransaction.promotion_value)
            }
            let resultGetReturn = await executeQuery(`
                SELECT *
                FROM dvw_transaction.vw_return a
                WHERE a.s_offlinecode_transaction = '${eachTransaction.receipt}'
            `)
            if (resultGetReturn.length > 0 && parseFloat(eachTransaction.void_status) === 1) eachTransaction.void_status = 2
        }
        return res.status(200).json({success: true, message: `${resultGetTransactions.length} data/s found`, data: resultGetTransactions})
    })
}

export async function salesAdditionalV3(req: typeReport.salesAdditionalV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesAdditionalV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionAdditionalGetReport = await functionTransactionAdditional.getReportSalesAdditional({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resTransactionAdditionalGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesAdditionalV3')
        }
    })
}

export async function salesCustomerV3(req: typeReport.salesCustomerV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesCustomerV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesCustomer({res, connection}, {vw_transaction: {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}, vw_customer: {name: req.body.customer}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesCustomerV3')
        }
    })
}

export async function salesCustomerProductV3(req: typeReport.salesCustomerProductV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesCustomerProductV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesCustomerProduct({res, connection}, {vw_transaction: {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}, vw_customer: {code: req.body.customer}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesCustomerProductV3')
        }
    })
}

export async function salesCustomerDetailV3(req: typeReport.salesCustomerDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesCustomerDetailV3/getConnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesCustomerDetail({res, connection}, {type: parseInt(req.body.type), fk_item: parseInt(req.body.product), price: parseFloat(req.body.price), vw_customer: {code: req.body.customer}, vw_transaction: {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}, vw_transactionpromotiondetail: {fk_promotion: parseInt(req.body.promotion)}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesCustomerDetailV3')
        }
    })
}

export async function salesDetailV3(req: typeReport.salesDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
    
            let responseBody:any = {}

            let resTransactionGetReport = await functionTransaction.getReportSalesDetail({res, connection}, {fk_business: user.business, offlinecode: req.body.receipt})
            if (resTransactionGetReport) {
                let resTransactionPaymentGetReport = await functionTransactionPayment.getReportSalesDetail({res, connection}, {fk_transaction: parseInt(resTransactionGetReport.code)})
                let resTransactionPromotionGetReport = await functionTransactionPromotion.getReportSalesDetail({res, connection}, {fk_transaction: parseInt(resTransactionGetReport.code)})
                let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesDetail({res, connection}, {fk_transaction: parseInt(resTransactionGetReport.code)})
                let salesDetails:Array<any>= []
                if (resTransactionDetailGetReport.length > 0) {
                    for (let eachTransactionDetail of resTransactionDetailGetReport) {
                        let resTransactionAdditionalGetReport = await functionTransactionAdditional.getReportSalesComplete({res, connection}, {fk_transactiondetail: parseInt(eachTransactionDetail.detail_code)})
                        let resTransactionDetailPromotionGetReport = await functionTransactionPromotionDetail.getReportSalesComplete({res, connection}, {fk_transactiondetail: parseInt(eachTransactionDetail.detail_code)})
                        salesDetails.push({...eachTransactionDetail, additional: resTransactionAdditionalGetReport, promotion: resTransactionDetailPromotionGetReport})
                    }
                }
                responseBody = resTransactionGetReport
                responseBody.payment = resTransactionPaymentGetReport
                responseBody.promotion = resTransactionPromotionGetReport
                responseBody.detail = salesDetails

                res.status(200).json({success: true, message: "OK", data: responseBody})
                connection.release()
                return
            }
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesDetailV3')
        }
    })
}

export async function salesProductV3(req: typeReport.salesProductV3, res: Response) {
    pool.getConnection(async function (err, connection) {

        if(!req.body.order) req.body.order = "item"
        if (!req.body.order_type) req.body.order_type = ""
        if (!req.body.limit) req.body.limit = ""

        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductV3/getConnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportSalesProduct({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}}, {order_column: req.body.order, order_type: req.body.order_type})
            res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})     
            return connection.release()       
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductV3')
        }
    })
}

export async function salesProductSimpleV3(req: typeReport.salesProductSimpleV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductSimpleV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportSalesProductSimple({res, connection}, {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end},fk_business: user.business}, {limit: req.body.limit ? parseInt(req.body.limit) : undefined})
            res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductSimpleV3')
        }
    })
}

export async function salesProductDetailV3(req: typeReport.salesProductDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductDetailV3/getConnection')

        let responseBody:Array<any> = []
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesProductDetail({res, connection}, {type: parseInt(req.body.type), fk_item: parseInt(req.body.item_code), price: req.body.price ? parseFloat(req.body.price) : undefined, vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business}, vw_transactionpromotiondetail: {fk_promotion: parseInt(req.body.promotion_code)}, vw_customer: {v_code: req.body.customer || '%'}})
            
            if (resTransactionDetailGetReport.length > 0) {
                for (let eachReport of resTransactionDetailGetReport) {
                    let resTransactionPaymentGetName = await functionTransactionPayment.getName({res, connection}, {fk_transaction: eachReport.transaction_code})
                    responseBody.push({...eachReport, payment: resTransactionPaymentGetName})
                }
            }
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductDetailV3')
        }
    })
}

export async function salesProductDetailReceiptV3(req: typeReport.salesProductDetailReceiptV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['date_start', 'date_end'])

            let requestBody = {
                date_start: <string>req.body.date_start,
                date_end: <string>req.body.date_end,
                customer: <string>req.body.customer != null ? req.body.customer : undefined,
                type: <number>req.body.type != null ? parseFloat(req.body.type) : undefined,
                item_code: <number | undefined>req.body.item_code != null ? parseFloat(req.body.item_code) : undefined,
                promotion_code: <number | undefined>req.body.promotion_code != null ? parseFloat(req.body.promotion_code) : undefined,
                price: <number | undefined>req.body.price != null ? parseFloat(req.body.price) : undefined
            }
    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductDetailReceiptV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let requestBody = convertBody()!
            if (res.headersSent) return
            let responseBody: Array<Partial<{
                                date: string,
                                qty: number,
                                notes: string,
                                receipt: string,
                                customer: string,
                                guest: string,
                                payment: Array<{
                                    name: string
                                }>
                                receipt_detail: {
                                    code: number,
                                    order_number: number,
                                    receipt: string,
                                    customer_email: string,
                                    customer_code: number,
                                    customer_name: string,
                                    guest: string,
                                    order_server: string,
                                    order_cashier: string,
                                    order_date: string,
                                    total: number,
                                    tax: number,
                                    sc: number,
                                    total_promotion: number,
                                    total_net: number,
                                    changes: number,
                                    void: number,
                                    salestype_code: number,
                                    salestype_name: string,
                                    detail: Array<{
                                        code: number,
                                        sku: string,
                                        name: string,
                                        package: number,
                                        category_name: string,
                                        category_pph: number,
                                        price: number,
                                        hpp: number,
                                        margin: number,
                                        qty: number,
                                        unit: number,
                                        preferences: string,
                                        additional: Array<{
                                            code: number,
                                            name: string,
                                            price: number,
                                            qty: number
                                        }>,
                                        promotion: Array<{
                                            code: number,
                                            name: string,
                                            price: number,
                                            type: number
                                        }>,
                                        void: number,
                                        paid: number,
                                        printed: number,
                                        void_reason: string
                                    }>,
                                    promotion: Array<{
                                        code: number,
                                        name: string,
                                        promotion: number,
                                        nominal: number,
                                        type: number

                                    }>,
                                    payment: Array<{
                                        code: number,
                                        name: string,
                                        value: number
                                    }>
                                } | {}
            }>> = []

            let resGetHeader = await functionTransactionDetail.getPreferencesReportSalesProductDetailReceipt({res, connection}, {
                b_type: requestBody.type,
                fk_item: requestBody.item_code,
                vw_customer: {
                    v_code: requestBody.customer
                },
                vw_transaction: {
                    dt_paid: {
                        date_start: requestBody.date_start,
                        date_end: requestBody.date_end
                    },
                    fk_business: user.business
                },
                vw_transactionpromotiondetail: {
                    fk_promotion: requestBody.promotion_code
                },
                i_price: requestBody.price
            })
            
            for (let eachHeader of resGetHeader) {
                let tempDetail:Array<{
                    code: number,
                    sku: string,
                    name: string,
                    package: number,
                    category_name: string,
                    category_pph: number,
                    price: number,
                    hpp: number,
                    margin: number,
                    qty: number,
                    unit: number,
                    preferences: string,
                    additional: Array<{
                        code: number,
                        name: string,
                        price: number,
                        qty: number
                    }>,
                    promotion: Array<{
                        code: number,
                        name: string,
                        price: number,
                        type: number
                    }>,
                    void: number,
                    paid: number,
                    printed: number,
                    void_reason: string
                }> = []

                let resTransactionPaymentGetReport = await functionTransactionPayment.getReportSalesProductDetailReceipt({res, connection}, {fk_transaction: eachHeader.transaction_code})
                let tempReceiptDetail: Partial<{
                    code: number,
                    order_number: number,
                    receipt: string,
                    customer_email: string,
                    customer_code: number,
                    customer_name: string,
                    guest: string,
                    order_server: string,
                    order_cashier: string,
                    order_date: string,
                    total: number,
                    tax: number,
                    sc: number,
                    total_promotion: number,
                    total_net: number,
                    changes: number,
                    void: number,
                    salestype_code: number,
                    salestype_name: string,
                    detail: Array<{
                        code: number,
                        sku: string,
                        name: string,
                        package: number,
                        category_pph: number,
                        price: number,
                        hpp: number,
                        margin: number,
                        qty: number,
                        unit: number,
                        preferences: string,
                        additional: Array<{
                            code: number,
                            name: string,
                            price: number,
                            qty: number
                        }>,
                        promotion: Array<{
                            code: number,
                            name: string,
                            price: number,
                            type: number
                        }>,
                        void: number,
                        paid: number,
                        printed: number,
                        void_reason: string
                    }>,
                    promotion: Array<{
                        code: number,
                        name: string,
                        promotion: number,
                        nominal: number,
                        type: number

                    }>,
                    payment: Array<{
                        code: number,
                        name: string,
                        value: number
                    }>}> = {}
                let resGetReceiptDetail = await functionTransaction.getReportSalesProductDetailReceipt({res, connection}, {s_offlinecode: eachHeader.receipt})
                if (resGetReceiptDetail) {
                    let resGetDetail = await functionTransactionDetail.getReportSalesProductDetailReceipt({res, connection}, {fk_transaction: eachHeader.transaction_code})
                    for (let eachDetail of resGetDetail) {
                        
                        let tempDetailAdditional: Array<{
                            code: number,
                            name: string,
                            price: number,
                            qty: number
                        }> = []
                        let resGetDetailAdditional = await functionTransactionAdditional.getReportSalesComplete({res, connection}, {fk_transactiondetail: eachDetail.detailcode})
                        for (let eachDetailAdditional of resGetDetailAdditional) {
                            tempDetailAdditional.push({
                                code: eachDetailAdditional.code,
                                name: eachDetailAdditional.name,
                                price: eachDetailAdditional.price,
                                qty: eachDetailAdditional.qty
                            })
                        }

                        let tempDetailPromotion: Array<{
                            code: number,
                            name: string,
                            price: number,
                            type: number
                        }> = []
                        let resGetDetailPromotion = await functionTransactionPromotionDetail.getReportSalesComplete({res, connection}, {fk_transactiondetail: eachDetail.detailcode})
                        for (let eachDetailPromotion of resGetDetailPromotion) {
                            tempDetailPromotion.push({
                                code: eachDetailPromotion.code,
                                name: eachDetailPromotion.name,
                                price: eachDetailPromotion.value,
                                type: eachDetailPromotion.type
                            })
                        }
                        tempDetail.push({
                            code: eachDetail.itemcode,
                            sku: eachDetail.alias,
                            name: eachDetail.itemname,
                            package: eachDetail.ispackage,
                            category_name: eachDetail.category,
                            category_pph: eachDetail.categorypph,
                            price: eachDetail.price,
                            hpp: eachDetail.hpp,
                            margin: eachDetail.margin,
                            qty: eachDetail.qty,
                            unit: eachDetail.unit,
                            preferences: eachDetail.preference,
                            additional: tempDetailAdditional,
                            promotion: tempDetailPromotion,
                            void: eachDetail.isvoid,
                            paid: 1,
                            printed: 1,
                            void_reason: eachDetail.voidreason,
                        })
                    }

                    let tempPromotion: Array<{
                        code: number,
                        name: string,
                        promotion: number,
                        nominal: number,
                        type: number
                    }> = []
                    let tempPayment: Array<{
                        code: number,
                        name: string,
                        value: number
                    }> = []

                    let resGetPromotion = await functionTransactionPromotion.getReportSalesProductDetailReceipt({res, connection}, {fk_transaction: resGetReceiptDetail.code})
                    for (let eachPromotion of resGetPromotion) {
                        tempPromotion.push({
                            code: eachPromotion.promotioncode,
                            name: eachPromotion.promotionname,
                            promotion: eachPromotion.promotion,
                            nominal: eachPromotion.promotionnominal,
                            type: eachPromotion.promotiontypecode
                        })
                    }

                    let resGetPayment = await functionTransactionPayment.getPaymentReportSalesProductDetailReceipt({res, connection}, {fk_transaction: resGetReceiptDetail.code})
                    for (let eachPayment of resGetPayment) {
                        tempPayment.push({
                            code: eachPayment.paymentmethodcode,
                            name: eachPayment.paymentmethodname,
                            value: eachPayment.paidmoney
                        })
                    }

                    tempReceiptDetail = {
                        detail: tempDetail,
                        promotion: tempPromotion,
                        payment: tempPayment,
                        changes: resGetReceiptDetail.changes,
                        code: resGetReceiptDetail.code,
                        customer_code: resGetReceiptDetail.customer_code,
                        customer_email: resGetReceiptDetail.customer_email,
                        customer_name: resGetReceiptDetail.customer_name,
                        guest: resGetReceiptDetail.guest,
                        order_cashier: resGetReceiptDetail.order_cashier,
                        order_date: resGetReceiptDetail.order_date,
                        order_number: resGetReceiptDetail.order_number,
                        order_server: resGetReceiptDetail.order_server,
                        receipt: resGetReceiptDetail.offlinecode,
                        salestype_code: resGetReceiptDetail.salestype_code,
                        salestype_name: resGetReceiptDetail.salestype_name,
                        sc: resGetReceiptDetail.sc,
                        tax: resGetReceiptDetail.tax,
                        total: resGetReceiptDetail.total,
                        total_net: resGetReceiptDetail.total_net,
                        total_promotion: resGetReceiptDetail.total_promotion,
                        void: resGetReceiptDetail.void, 
                    }
                }

                responseBody.push({
                    date: eachHeader.date,
                    qty: eachHeader.qty,
                    notes: eachHeader.notes,
                    receipt: eachHeader.receipt,
                    customer: eachHeader.customer,
                    guest: eachHeader.guest,
                    payment: resTransactionPaymentGetReport,
                    receipt_detail: tempReceiptDetail
                })
            }

            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductDetailReceipt')
        }
    })
}

export async function salesProductHPPV3(req: typeReport.salesProductHPPV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductHPPV3/getConnnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportSalesProductHPP({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            for (let eachReport of resTransactionGetReport) {
                eachReport.category = errors.hexToString(eachReport.category)
            }
            res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductHPPV3')
        }
    })
}

export async function shiftDetailV3(req: typeReport.shiftDetailV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['date_start', 'date_end'])
            let requestBody = {
                dateStart: <string>req.body.date_start,
                dateEnd: <string>req.body.date_end
            }
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/getShiftReport')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(400).json({success: false, message: 'Credential not valid.'})
            if (user.business === 57 || user.business === 5546) user.name = '%'

            let requestBody = convertBody()!
            if (res.headersSent) return

            let responseBody: Partial<{
                cash_in: Array<{
                    date: string,
                    notes: string,
                    value: number
                }>,
                total_cash_in: number,

                expense: Array<{
                    name: string,
                    value: number,
                    notes: string,
                    date: string
                }>,
                total_expense: number,

                payment_method: Array<{
                    name: string,
                    subtotal: number,
                    changes: number,
                    total: number,
                    system: number
                }>
                total_payment: number,

                product_sales: Array<{
                    item_sku: string,
                    item_name: string,
                    item_qty: number,
                    category_code: number,
                    category_name: string,
                    total_price: number
                }>,
                product_sales_void: Array<{
                    item_sku: string,
                    item_name: string,
                    item_qty: number,
                    category_code: number,
                    category_name: string,
                    total_price: number
                }>
                total_price_product_sales: number

                other_detail: {
                    total_sales_additional: number,
                    total_promotion: number,
                    tax: number,
                    service_charge: number,
                    rounded: number
                }

                invoice_paid: Array<{
                    date: string,
                    value: number
                }>
                total_invoice_paid: number
            }> = {}


            responseBody.total_cash_in = 0
            responseBody.cash_in = []
            let resultGetCashIn = await functionCash.getReportShiftCashIn({res, connection}, {dt_created: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, fk_business: user.business, vw_user: {v_name: user.name}})
            for (let eachCashIn of resultGetCashIn) {
                responseBody.total_cash_in += parseFloat(eachCashIn.value)
                responseBody.cash_in.push({
                    date: eachCashIn.date,
                    notes: eachCashIn.notes,
                    value: parseFloat(eachCashIn.value)
                })
            }

            responseBody.total_expense = 0
            responseBody.expense = []
            let resultGetExpense = await functionExpense.getReportShiftExpense({res, connection}, {fk_business: user.business, dt_created: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, vw_user: {v_name: user.name}})
            for (let eachExpense of resultGetExpense) {
                responseBody.total_expense += parseFloat(eachExpense.value)
                responseBody.expense.push({
                    name: eachExpense.name,
                    notes: eachExpense.notes,
                    value: parseFloat(eachExpense.value),
                    date: eachExpense.date
                })
            }

            responseBody.total_payment = 0
            responseBody.payment_method = []
            let resultGetPaymentMethod = await functionTransaction.getReportShiftPaymentMethod({res, connection}, {dt_paid: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, fk_business: user.business, v_paidby: user.name})
            for (let eachPaymentMethod of resultGetPaymentMethod) {
                responseBody.total_payment += parseFloat(eachPaymentMethod.total)
                responseBody.payment_method.push({
                    name: eachPaymentMethod.name,
                    subtotal: parseFloat(eachPaymentMethod.subtotal),
                    changes: parseFloat(eachPaymentMethod.changes),
                    total: parseFloat(eachPaymentMethod.total),
                    system: parseFloat(eachPaymentMethod.systempaymentmethod)
                })
            }

            responseBody.total_price_product_sales = 0
            responseBody.product_sales = []
            let resultGetProductSales = await functionTransactionDetail.getReportShiftProductSales({res, connection}, {fk_business: user.business, vw_transaction: {v_paidby: user.name}, dt_paid: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}})
            for (let eachProductSales of resultGetProductSales) {
                responseBody.total_price_product_sales += parseFloat(eachProductSales.total_price)
                responseBody.product_sales.push({
                    category_code: parseFloat(eachProductSales.category_code),
                    category_name: eachProductSales.category_name,
                    item_sku: eachProductSales.sku,
                    item_name: eachProductSales.item_name,
                    item_qty: parseFloat(eachProductSales.total),
                    total_price: parseFloat(eachProductSales.total_price)
                })
            }
            responseBody.product_sales_void = []
            let resultGetProductSalesVoid = await functionTransactionDetail.getReportShiftProductSalesVoid({res, connection}, {dt_paid: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, fk_business: user.business, vw_transaction: {v_paidby: user.name}})
            for (let eachProductSalesVoid of resultGetProductSalesVoid) {
                responseBody.total_price_product_sales -= parseFloat(eachProductSalesVoid.total_price)
                responseBody.product_sales.push({
                    category_code: parseFloat(eachProductSalesVoid.category_code),
                    category_name: eachProductSalesVoid.category_name,
                    item_sku: eachProductSalesVoid.sku,
                    item_name: eachProductSalesVoid.item_name,
                    item_qty: parseFloat(eachProductSalesVoid.total),
                    total_price: parseFloat(eachProductSalesVoid.total_price)
                })
            }

            let resultGetOtherDetail = await functionTransactionAdditional.getReportShiftOtherDetail({res, connection}, {fk_business: user.business, dt_paid: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, v_paidby: user.name})
            responseBody.other_detail = {
                rounded: parseFloat(resultGetOtherDetail.rounded),
                service_charge: parseFloat(resultGetOtherDetail.sc),
                tax: parseFloat(resultGetOtherDetail.tax),
                total_promotion: parseFloat(resultGetOtherDetail.total_promotion),
                total_sales_additional: parseFloat(resultGetOtherDetail.total_sales_additional)
            }

            responseBody.total_invoice_paid = 0
            responseBody.invoice_paid = []
            let resultGetInvoicePaid = await functionInvoicePayment.getReportShiftInvoicePaid({res, connection}, {fk_business: user.business, dt_paid: {date_start: requestBody.dateStart, date_end: requestBody.dateEnd}, vw_user: {v_name: user.name}})
            for (let eachInvoicePaid of resultGetInvoicePaid) {
                responseBody.total_price_product_sales += parseFloat(eachInvoicePaid.value)
                responseBody.invoice_paid.push({
                    date: eachInvoicePaid.date,
                    value: parseFloat(eachInvoicePaid.value)
                })
            }

            return res.status(200).json({success: true, message: 'OK', data: responseBody})
        } catch (err: any) {
            await errors.APIError(connection, err, req, res, 'controller/report/getShiftReport', false)
        }
    })
}

export async function shiftV3(req: typeReport.shiftV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/shiftV3/getConnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "OK"})

            let resCashGetReport = await functionCash.getReportShift({res, connection}, {fk_business: user.business, dt_created: req.body.date})
            res.status(200).json({success: true, message: "OK", data: resCashGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/shiftV3')
        }
    })
}

export async function statementQrisV3(req: typeReport.statementQrisV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/statement/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resDepositBusinessStatementGetReport = await functionDepositBusinessStatement.getReportStatementQris({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resDepositBusinessStatementGetReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/statementQrisV3')
        }
    })
}

export async function stockMovingHeaderV3(req: typeReport.stockMovingHeaderV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockMovingHeaderV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockReportGetReport = await functionStockReport.getReportStockMovingHeader({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resStockReportGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockMovingHeaderV3/getConnection')
        }
    })
}

export async function stockMovingDetailV3(req: typeReport.stockMovingDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockMovingDetailV3/getConnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockReportGetReport = await functionStockReport.getReportStockMovingDetail({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}}, {itemmaterialtype: parseFloat(req.body.type), itemmaterialname: req.body.name})
            res.status(200).json({success: true, message: "OK", data: resStockReportGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockMovingDetailV3')
        }
    })
}

export async function stockAdjustmentV3(req: typeReport.stockAdjustmentV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockAdjustmentV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockReportGetReport = await functionStockReport.getReportStockAdjustment({res, connection}, {fk_business: user.business, dt_created:{ date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resStockReportGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockAdjustmentV3')
        }
    })
}

export async function stockOpnameV3(req: typeReport.stockOpnameV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockOpnameV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockOpnameGetReport = await functionStockOpname.getReportStockOpname({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resStockOpnameGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockOpnameV3')
        }
    })
}

export async function stockOpnameDetailV3(req: typeReport.stockOpnameDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockOpnameDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
            
            let resStockOpnameDetailGetReport = await functionStockOpnameDetail.getReportStockOpnameDetail({res, connection}, {fk_stockopname: req.body.hash})
            let resStockOpnameGetReport = await functionStockOpname.getReportStockOpnameDetail({res, connection}, {hash: req.body.hash})
            res.status(200).json({success: true, message: "OK", data: {
                stock_opname: resStockOpnameGetReport,
                stock_opname_detail: resStockOpnameDetailGetReport
            }})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockOpnameDetailV3')
        }
    })
}

export async function stockOpnameIgnoreDetailV3(req: typeReport.stockOpnameIgnoreDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stockOpnameIgnoreDetailV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resItemGetReport = await functionItem.getReportStockOpnameIgnoreDetail({res, connection}, {fk_business: user.business, fk_stockopname: req.body.hash})
            res.status(200).json({success: true, message: "OK", data: resItemGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/stockOpnameIgnoreDetailV3')
        }
    })
}

export async function summaryV3(req: typeReport.summaryV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/summaryV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReportDay = await functionTransaction.getReportDaySummary({res, connection}, {fk_business: user.business,dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}})
            let resTransacitonGetReportHour = await functionTransaction.getReportHourSummary({res, connection}, {fk_business: user.business, dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: {
                day: resTransactionGetReportDay,
                hour: resTransacitonGetReportHour
            }})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/summaryV3')
        }
    })
}

export async function transferStockDetailV3(req: typeReport.transferStockDetailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/transferStockDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockTransferGetReport = await functionStockTransfer.getReportTransferStockDetail({res, connection}, {fk_businessorigin: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resStockTransferGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/transferStockDetailV3')
        }
    })
}

export async function transferStockSummaryV3(req: typeReport.transferStockSummaryV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/transferStockSummaryV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resStockTransferGetReport = await functionStockTransfer.getReportTransferStockSummary({res, connection}, {fk_businessorigin: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            res.status(200).json({success: true, message: "OK", data: resStockTransferGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/transferStockSummary')
        }
    })
}

export async function invoiceDetailV3(req: typeReport.invoiceDetailV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/invoiceDetailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resInvoiceGetReport = await functionInvoice.getReportInvoiceDetail({res, connection}, {vw_customer: {v_code: req.body.customer_code}, fk_business: user.business})
            res.status(200).json({success: true, message: "OK", data: resInvoiceGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/invoiceDetailV3')
        }
    })
}

export async function customerHistoryItemV3(req: typeReport.customerHistoryItemV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/customerHistoryItemV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportCustomerHistoryItem({res, connection}, {vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business, fk_customer: parseInt(req.body.customer)}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/customerHistoryItemV3')
        }
    })
}

export async function customerHistoryItemGroupV3(req: typeReport.customerHistoryItemGroupV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/customerHistoryItemV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportCustomerHistoryItemGroup({res, connection}, {vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business, fk_customer: parseInt(req.body.customer)}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/customerHistoryItemGroupV3')
        }
    })
}

export async function customerHistoryTransactionV3(req: typeReport.customerHistoryTransactionV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/customerHistoryTransactionV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportCustomerHistoryTransaction({res, connection}, {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business, fk_customer: parseInt(req.body.customer)})
            res.status(200).json({success: true, message: "OK", data: resTransactionGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/customerHistoryTransactionV3')
        }
    })
}

export async function invoiceV3(req: typeReport.invoiceV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/invoiceV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resCustomerGetReport = await functionCustomer.getReportInvoice({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resCustomerGetReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/invoiceV3')
        }
    })
}

export async function invoiceHistoryV3(req: typeReport.invoiceHistoryV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/invoiceHistoryV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resInvoicePaymentGetReport = await functionInvoicePayment.getReportInvoiceHistory({res, connection}, {fk_business: user.business, vw_invoice: {v_code: req.body.invoice_code}})
            res.status(200).json({success: true, message: "OK", data: resInvoicePaymentGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/invoiceHistoryV3')
        }
    })
}

export async function salesProductByCustomerV3(req: typeReport.salesProductByCustomerV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/salesProductByCustomerV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionDetailGetReport = await functionTransactionDetail.getReportSalesProductByCustomer({res, connection}, {vw_transaction: {dt_paid: {date_start: req.body.date_start, date_end: req.body.date_end}, fk_business: user.business}})
            res.status(200).json({success: true, message: "OK", data: resTransactionDetailGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/salesProductByCustomerV3')
        }
    })
}

export async function receiveV3(req: typeReport.receiveV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/receiveV3/getConnection')

        let responseBody: Array<any> = []
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resBusinessGetCode = await functionBusiness.getCode({res, connection}, {code: user.business})
            let resTransactionGetReport = await functionTransaction.getReportReceive({res, connection}, {fk_business: user.business, dt_receive: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_customer: {v_name: '%'}})
            if (resTransactionGetReport.length > 0) {
                for (let eachReport of resTransactionGetReport) {
                    eachReport.receive_photo = 'https://www.woogigs.com/assets/img/business/' + resBusinessGetCode.code + "/receipt/" + eachReport.receive_photo
                    responseBody.push(eachReport)
                }
                res.status(200).json({success: true, message: "OK", data: responseBody})
            } else {
                res.status(200).json({success: true, message: "No data."})
            }
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/receiveV3')
        }
    })
}

export async function priceItemV3(req: typeReport.priceItemV3, res: Response) {

    
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/priceItemV3/getConnection')
        
        req.body.item_code = req.body.item_code || '%'

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resItemPriceGetReport = await functionItemPrice.getReportPriceItem({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_item: {i_code: isNaN(parseInt(req.body.item_code)) ? '%' : parseInt(req.body.item_code)}})
            if (resItemPriceGetReport.length < 1) res.status(200).json({success: true, message: "Data not found."})
            else res.status(200).json({success: true, message: "OK", data: resItemPriceGetReport})
            return connection.release()
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/priceItemV3')
        }
    })
}

export async function priceMaterialV3(req: typeReport.priceMaterialV3, res: Response) {

    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/priceMaterialV3/getConnection')
        
        req.body.material_code = req.body.material_code || '%'

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resMaterialPriceGetReport = await functionMaterialPrice.getReportPriceMaterial({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}, vw_material: {i_code: isNaN(parseInt(req.body.material_code)) ? '%' : parseInt(req.body.material_code)}})
            return res.status(200).json({success: true, message: "OK", data: resMaterialPriceGetReport})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/priceMaterialV3')
        }
    })
}

// Unfinished
export async function dashboardV3(req: typeReport.priceMaterialV3, res: Response) {
    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/priceMaterialV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resTransactionGetReport = await functionTransaction.getReportDashboard({res, connection}, {fk_business: user.business})
            let totalexpense = 0

        } catch {
            return errors.rollback(connection, res, err, 'controller/report/priceMaterialV3')
        }
    })
}

export function getTodayReportV3(req: typeReport.getTodayReportV3, res: Response) {

    pool.getConnection(async function(err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/getTodayReportV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let responseBody: Array<Partial<{
                total_sales_item: any,
                total_sales_additional: any,
                total_promotion: any,
                tax: any,
                sc: any,
                transaction: any,
                total_expense: any,
                top_item: any,
                payment: any,
                last7: any
            }>> = []

            let globalTransaction = 0
            if (user.owner || user.manager || user.access_global_transaction) globalTransaction = 1

            let totalSalesItem = 0
            let totalSalesAdditional = 0
            let totalPromotion = 0
            let tax = 0
            let sc = 0
            let totalTransaction = 0
            let totalExpense = 0

            let resTransactionGetSalesReportToday = await functionTransaction.getSalesReportToday({res, connection}, {fk_business: user.business, v_paidby: globalTransaction ? '%' : user.name})
            for (let eachReport of resTransactionGetSalesReportToday) {
                totalSalesItem = eachReport.total_sales_item
                totalSalesAdditional = eachReport.total_sales_additional
                totalPromotion = eachReport.total_promotion
                tax = eachReport.tax
                sc = eachReport.sc
                totalTransaction = eachReport.transaction
            }

            let resExpenseGetTotalToday = await functionExpense.getTotalExpenseToday({res, connection}, {fk_business: user.business, v_name: globalTransaction ? '%' : user.name})
            for (let eachExpense of resExpenseGetTotalToday) {
                totalExpense = eachExpense.totalexpense
            }

            let topItmes = ''

            let resTransactionGetSalesPaymentToday = await functionTransaction.getSalesPaymentToday({res, connection}, {fk_business: user.business, v_paidby: globalTransaction ? '%' : user.name})
            let payment: Array<{
                name: string,
                total: number
            }> = []
            for (let eachSalesPayment of resTransactionGetSalesPaymentToday) {
                payment.push({name: eachSalesPayment.name, total: eachSalesPayment.total})
            }

            let resTransactionGetSalesReportLast7Days = await functionTransaction.getSalesReportLast7Days({res, connection}, {fk_business: user.business, v_paidby: globalTransaction ? '%' : user.name})
            let last7: Array<{
                date: string,
                total_sales_item: number,
                total_sales_additional: number,
                total_promotion: number,
                tax: number,
                sc: number
            }> = []
            for (let eachSalesReport of resTransactionGetSalesReportLast7Days) {
                last7.push({
                    date: eachSalesReport.date,
                    sc: eachSalesReport.sc,
                    tax: eachSalesReport.tax,
                    total_promotion: eachSalesReport.total_promotion,
                    total_sales_additional: eachSalesReport.total_sales_additional,
                    total_sales_item: eachSalesReport.total_sales_item
                })
            }

            responseBody.push({
                last7: last7,
                payment: payment,
                sc: sc,
                tax: tax,
                top_item: topItmes,
                total_expense: totalExpense,
                total_promotion: totalPromotion,
                total_sales_additional: totalSalesAdditional,
                total_sales_item: totalSalesItem,
                transaction: totalTransaction
            })

            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/report/getTodayReportV3')
        }
    })
}

export function ticketSalesV3(req: typeReport.ticketSalesV3, res: Response) {

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/ticketSalesV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

            let resTransactionGetReport = await functionTransaction.getReportTicketSalesV3({res, connection}, {fk_business: user.business})
            let responseBody: Array<{
                receipt_code: string,
                item_name: string,
                customer_name: string,
                date_checkin: string
            }> = []
            for (let eachReport of resTransactionGetReport) {
                for (let i = 0; i < eachReport.item_qty; i++) {
                    responseBody.push({
                        customer_name: eachReport.customer_name,
                        date_checkin: eachReport.date_checkin,
                        item_name: eachReport.item_name,
                        receipt_code: eachReport.receipt_code
                    })
                }
            }
            return res.status(200).json({success: true, message: 'OK', data: responseBody})
        } catch (err) {
            await errors.APIError(connection, err, req, res, 'controller/report/ticketSalesV3')
        }
    })
}

export async function selectReportExpenseTodayV3(req: typeReport.getReportExpenseTodayV3, res: Response) {

    function convertBody() {
        try {
            let requestBody = {
                user: <string>req.body.user,
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/unit/selectReportExpenseTodayV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let requestBody = convertBody()!
            if (res.headersSent) return

            let resGetExepsenseToday = await functionReport.getExpenseToday({res,connection}, {fk_business: user.business, user: requestBody.user})
            if(resGetExepsenseToday.length > 0) return res.status(200).json({ success: true, message: `OK`, data: resGetExepsenseToday }) 
            else return res.status(400).json({ success: false, message: `Data Not Found` }) 
        } catch (err) {
            await errors.APIError(connection, err, req, res, 'controller/unit/selectReportExpenseTodayV3')
        }
    })
}

type stock = typeGlobal.requestV3 & {
    body: {
        date: string
    }
}
export async function stock(req: stock, res: Response) {
    function convertBody() {
        try {
            errors.checkField(req.body, ['date'])
            let requestBody = {
                date: <string>req.body.date
            }
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/report/stock/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let requestBody = convertBody()!
            if (res.headersSent) return

            let result = await functionReport.stock({res,connection}, {
                business: user.business,
                date: requestBody.date
            })
            
            res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result
            })
        } catch (err) {
            await errors.APIError(connection, err, req, res, 'controller/report/stock')
        }
    })
}

