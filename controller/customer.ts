import { Response } from "express";
import pool from "../config/connect";

import * as errors from "../function/global_function"

import * as typeGlobal from "../type/global"
import * as typeCustomer from "../type/customer"

import * as functionUser from "../function/account/user"
import * as functionLogApi from "../function/system/log_api"
import * as functionBusiness from "../function/account/business"
import * as functionCustomer from "../function/master/customer"
import moment from "moment";



type get = {
    body: {
        business: string
    }
}
export async function get({ body }: get, res: Response) {
    if (!body.business) res.status(500).json({
        code: 500,
        success: false,
        message: "business not defined"
    })
    pool.getConnection(function (err, connection) {
        functionLogApi.insert({ res, connection }, { fk_business: parseInt(body.business) })
        connection.beginTransaction(async function (err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/category/get');
            } else {
                let merge = 0
                let resGetMergeCustomer = await functionBusiness.getMergeCustomer({ res, connection }, { code: parseInt(body.business) })
                if (resGetMergeCustomer) merge = resGetMergeCustomer.merge
                if (parseInt(body.business) === 5828) merge = 0
                else if (parseInt(body.business) === 6512) merge = 0
                let result: any
                if (merge === 0) {
                    let resGetCustomer = await functionCustomer.getCustomer({ res, connection }, { fk_business: parseInt(body.business) })
                    for (let eachGetCustomer of resGetCustomer) {
                        eachGetCustomer.name = encodeURI(eachGetCustomer.name)
                    }
                    result = resGetCustomer
                }
                else if (merge === 1) {
                    let resGetBusinessOwner = await functionBusiness.getBusinessowner({ res, connection }, { fk_business: parseInt(body.business) })
                    let resGetCustomer = await functionCustomer.getCustomerWithMerge({ res, connection }, { fk_businessowner: resGetBusinessOwner.code })
                    result = resGetCustomer
                }
                connection.commit(function (err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/customer/get');
                    }
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: result
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}

export async function getV3(req: typeGlobal.requestV3, res: any) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/getV3');

        let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
        if (!user) return res.status(401).json({ success: false, message: req.headers["x-auth-token"] })

        var results = await functionCustomer.getCustomer({
            connection: connection,
            res: res,
        }, {
            fk_business: user.business
        });

        connection.commit(function (err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/customer/getV3');
            } else {
                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                    info: {
                        total: results.length
                    },
                    data: results
                })
                connection.release();
            };
        })
    })
}

export async function getPodsCustomerCount(req: typeGlobal.requestV3, res: any) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/getPodsCustomerCount');

        let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
        if (!user) return res.status(401).json({ success: false, message: 'Credential not valid.' })

        let results = await functionCustomer.getPodsCustomerCount({connection, res})
        return res.status(200).json({code: 200, success: true, message: 'ok', info: {total: results.length}, data: results})
    })
}

export async function getPodsCustomerList(req: typeGlobal.requestV3, res: any) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/getPodsCustomerList');

        let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
        if (!user) return res.status(401).json({ success: false, message: req.headers["x-auth-token"] })

        let results = await functionCustomer.getPodsCustomerList({connection, res});
        return res.status(200).json({code: 200, success: true, message: 'ok', info: {total: results.length}, data: results})
    })
}

export async function getPointV3(req: typeCustomer.getPointV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/getPointV3/getConnection')

        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetPointDetailReceiptDate = await functionCustomer.getPointDetailReceiptDate({ res, connection }, { fk_customer: parseInt(req.body.customer_code) })
            return res.status(200).json({ success: true, message: "OK", data: resGetPointDetailReceiptDate })
        } catch {
            return errors.rollback(connection, res, err, 'controller/customer/getPointV3')
        }
    })
}

export async function selectV3(req: typeCustomer.selectV3, res: Response) {

    type typeRequestBody = {
        keyword?: string,
        order?: string,
        start?: number,
        limit?: number,
        name?: string,
        filter_gender?: number,
        filter_birthdate?: { start_date: string, end_date: string },
        filter_new_customer?: { start_date: string, end_date: string },
        filter_recurring_customer?: { start_date?: string, end_date?: string, minimum_nominal?: number, minimum_transaction?: number },
        filter_favorite_item?: { item_code: number, start_date?: string, end_date?: string },
        filter_item_bought_by_transaction?: { item_code: number, minimum_transaction: number, start_date?: string, end_date?: string },
        filter_category_bought_by_transaction?: { category_code: number, minimum_transaction: number, start_date?: string, end_date?: string },
        filter_item_bought_by_nominal?: { item_code: number, minimum_value: number, start_date: string, end_date: string },
        filter_category_bought_by_nominal?: { category_code: number, minimum_value: number, start_date: string, end_date: string },
        filter_item_bought_by_qty?: { item_code: number, minimum_qty?: number, start_date?: string, end_date?: string },
        filter_category_bought_by_qty?: { category_code: number, minimum_qty?: number, start_date?: string, end_date?: string }
    }

    function bodyConverter() {
        let birthdate: { start_date: string, end_date: string }

        if (req.body.filter_birthdate) {
            birthdate = function () { try { return JSON.parse(req.body.filter_birthdate!) } catch { return req.body.filter_birthdate } }()
            if (!birthdate.start_date || !birthdate.end_date) throw new Error("filter_birthdate must be object containing 'start_date' and 'end_date' key")
            if (!moment(birthdate.start_date, 'YYYY-MM-DD', true).isValid()) throw new Error("filter_birthdate.start_date must be type of date string with format 'YYYY-MM-DD'")
            if (!moment(birthdate.end_date, 'YYYY-MM-DD', true).isValid()) throw new Error("filter_birthdate.end_date must be type of date string with format 'YYYY-MM-DD'")
        }

        return {
            ...(req.body.keyword && { keyword: req.body.keyword }),
            ...(req.body.order && { order: req.body.order }),
            ...(req.body.start && { start: parseInt(req.body.start) }),
            ...(req.body.limit && { limit: parseInt(req.body.limit) }),
            ...(req.body.name && { name: req.body.name }),
            ...(req.body.filter_gender && { filter_gender: parseInt(req.body.filter_gender) }),
            ...(req.body.filter_birthdate && { filter_birthdate: birthdate! }),
            ...(req.body.filter_favorite_item && { filter_favorite_item: function () { try { return JSON.parse(req.body.filter_favorite_item) } catch { return req.body.filter_favorite_item } }() }),
            ...(req.body.filter_new_customer && { filter_new_customer: function () { try { return JSON.parse(req.body.filter_new_customer) } catch { return req.body.filter_new_customer } }() }),
            ...(req.body.filter_recurring_customer && { filter_recurring_customer: function () { try { return JSON.parse(req.body.filter_recurring_customer) } catch { return req.body.filter_recurring_customer } }() }),
            ...(req.body.filter_item_bought_by_transaction && { filter_item_bought_by_transaction: function () { try { return JSON.parse(req.body.filter_item_bought_by_transaction) } catch { return req.body.filter_item_bought_by_transaction } }() }),
            ...(req.body.filter_category_bought_by_transaction && { filter_category_bought_by_transaction: function () { try { return JSON.parse(req.body.filter_category_bought_by_transaction) } catch { return req.body.filter_category_bought_by_transaction } }() }),
            ...(req.body.filter_item_bought_by_nominal && { filter_item_bought_by_nominal: function () { try { return JSON.parse(req.body.filter_item_bought_by_nominal) } catch { return req.body.filter_item_bought_by_nominal } }() }),
            ...(req.body.filter_category_bought_by_nominal && { filter_category_bought_by_nominal: function () { try { return JSON.parse(req.body.filter_category_bought_by_nominal) } catch { return req.body.filter_category_bought_by_nominal } }() }),
            ...(req.body.filter_item_bought_by_qty && { filter_item_bought_by_qty: function () { try { return JSON.parse(req.body.filter_item_bought_by_qty) } catch { return req.body.filter_item_bought_by_qty } }() }),
            ...(req.body.filter_category_bought_by_qty && { filter_category_bought_by_qty: function () { try { return JSON.parse(req.body.filter_category_bought_by_qty) } catch { return req.body.filter_category_bought_by_qty } }() })
        }
    }

    function prepareOtherParameter(requestBody: typeRequestBody) {
        let otherParameterFilter: {
            gender?: number,
            birthDate?: { startDate: string, endDate: string },
            newCustomer?: { startDate: string, endDate: string },
            recurringCustomer?: { startDate?: string, endDate?: string, minimumNominal?: number, minimumTransaction?: number },
            favoriteItem?: { itemCode: number, startDate?: string, endDate?: string },
            itemBoughtByTransaction?: { itemCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
            categoryBoughtByTransaction?: { categoryCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
            itemBoughtByNominal?: { itemCode: number, minimumValue: number, startDate?: string, endDate?: string },
            categoryBoughtByNominal?: { categoryCode: number, minimumValue: number, startDate?: string, endDate?: string },
            itemBoughtByQty?: { itemCode: number, minimumQty?: number, startDate?: string, endDate?: string },
            categoryBoughtByQty?: { categoryCode: number, minimumQty?: number, startDate?: string, endDate?: string }
        } = {}

        if (requestBody.filter_gender) otherParameterFilter.gender = requestBody.filter_gender
        if (requestBody.filter_birthdate) otherParameterFilter.birthDate = { startDate: requestBody.filter_birthdate?.start_date, endDate: requestBody.filter_birthdate?.end_date }
        if (requestBody.filter_favorite_item) otherParameterFilter.favoriteItem = { itemCode: requestBody.filter_favorite_item.item_code, startDate: requestBody.filter_favorite_item.start_date, endDate: requestBody.filter_favorite_item.end_date }
        if (requestBody.filter_new_customer) otherParameterFilter.newCustomer = { startDate: requestBody.filter_new_customer.start_date, endDate: requestBody.filter_new_customer.end_date }
        if (requestBody.filter_recurring_customer) otherParameterFilter.recurringCustomer = { startDate: requestBody.filter_recurring_customer.start_date, endDate: requestBody.filter_recurring_customer.end_date, minimumNominal: requestBody.filter_recurring_customer.minimum_nominal, minimumTransaction: requestBody.filter_recurring_customer.minimum_transaction }
        if (requestBody.filter_item_bought_by_transaction) otherParameterFilter.itemBoughtByTransaction = { itemCode: requestBody.filter_item_bought_by_transaction.item_code, minimumTransaction: requestBody.filter_item_bought_by_transaction.minimum_transaction, startDate: requestBody.filter_item_bought_by_transaction.start_date, endDate: requestBody.filter_item_bought_by_transaction.end_date }
        if (requestBody.filter_category_bought_by_transaction) otherParameterFilter.categoryBoughtByTransaction = { categoryCode: requestBody.filter_category_bought_by_transaction.category_code, minimumTransaction: requestBody.filter_category_bought_by_transaction.minimum_transaction, startDate: requestBody.filter_category_bought_by_transaction.start_date, endDate: requestBody.filter_category_bought_by_transaction.end_date }
        if (requestBody.filter_item_bought_by_nominal) otherParameterFilter.itemBoughtByNominal = { itemCode: requestBody.filter_item_bought_by_nominal.item_code, minimumValue: requestBody.filter_item_bought_by_nominal.minimum_value, startDate: requestBody.filter_item_bought_by_nominal.start_date, endDate: requestBody.filter_item_bought_by_nominal.end_date }
        if (requestBody.filter_category_bought_by_nominal) otherParameterFilter.categoryBoughtByNominal = { categoryCode: requestBody.filter_category_bought_by_nominal.category_code, minimumValue: requestBody.filter_category_bought_by_nominal.minimum_value, startDate: requestBody.filter_category_bought_by_nominal.start_date, endDate: requestBody.filter_category_bought_by_nominal.end_date }
        if (requestBody.filter_item_bought_by_qty) otherParameterFilter.itemBoughtByQty = { itemCode: requestBody.filter_item_bought_by_qty.item_code, minimumQty: requestBody.filter_item_bought_by_qty.minimum_qty, startDate: requestBody.filter_item_bought_by_qty.start_date, endDate: requestBody.filter_item_bought_by_qty.end_date }
        if (requestBody.filter_category_bought_by_qty) otherParameterFilter.categoryBoughtByQty = { categoryCode: requestBody.filter_category_bought_by_qty.category_code, minimumQty: requestBody.filter_category_bought_by_qty.minimum_qty, startDate: requestBody.filter_category_bought_by_qty.start_date, endDate: requestBody.filter_category_bought_by_qty.end_date }

        let otherParameter: any = {}
        if (req.body.keyword) otherParameter.keyword = req.body.keyword
        if (req.body.order) otherParameter.order = req.body.order
        if (req.body.start) otherParameter.start = parseInt(req.body.start)
        if (req.body.limit) otherParameter.limit = parseInt(req.body.limit)
        if (req.body.name) otherParameter.name = req.body.name
        otherParameter.filter = otherParameterFilter
        return otherParameter
    }

    let requestBody: typeRequestBody
    try {
        requestBody = bodyConverter()
    } catch (err: any) {
        if (err) return res.status(400).json({ success: false, message: err.message })
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/selectV3/getConnection')

        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resBusinessGetMerge = (await functionBusiness.getMergeCustomer({ res, connection }, { code: user.business })) ?? 0
            let restrictedMergeBusiness = { "5828": true, "6512": true, "7189": true }
            if (user.business in restrictedMergeBusiness) resBusinessGetMerge.merge = 0
            let resCustomerSelect
            if (resBusinessGetMerge.merge === 0) {
                resCustomerSelect = await functionCustomer.select({ res, connection }, {
                    fk_business: user.business,
                    _OTHER: prepareOtherParameter(requestBody)
                })
            }
            else {
                let resBusinessGetOwner = await functionBusiness.getBusinessowner({ res, connection }, { fk_business: user.business })
                if (!resBusinessGetOwner) {
                    console.log('Error Business Owner in Customer: ', {requestBody: req.body, requestHeaders: req.headers})
                    return res.status(400).json({success: false, message: 'Business owner tidak ditemukan'})
                }
                resCustomerSelect = await functionCustomer.selectMerge({ res, connection }, {
                    fk_businessowner: resBusinessGetOwner.code,
                    _OTHER: prepareOtherParameter(requestBody)
                })
            }
            return res.status(200).json({
                success: true,
                message: "OK",
                info: {
                    total: resCustomerSelect.length
                },
                data: resCustomerSelect
            })
        } catch (err) {
            return errors.rollback(connection, res, err, 'controller/customer/selectV3')
        }
    })
}

export async function selectMobileV3(req: typeCustomer.selectsV3, res: Response) {
    console.log("Tesradsada")
    let resGetCustomerMobile: Array<any> = []
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/selectMobileV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetCustomerMerge = await functionCustomer.selectMergeMobile({ res, connection }, { fk_business: user.business })
            if (resGetCustomerMerge.merge == 0) {
                resGetCustomerMobile = await functionCustomer.selectCustomerMobile({ res, connection }, { fk_business: user.business })
            } else if (resGetCustomerMerge.merge == 1) {
                resGetCustomerMobile = await functionCustomer.selectCustomerWithMergeMobile({ res, connection }, { fk_business: user.business })
            }
            return res.status(200).json({ success: true, message: "OK", data: resGetCustomerMobile })
        } catch {
            return errors.rollback(connection, res, err, 'controller/customer/selectMobileV3')
        }
    })
}

export async function insertV3(req: typeCustomer.insertV3, res: Response) {

    function convertBody() {
        try  {
            errors.checkField(req.body, ['name', 'gender', 'address', 'phone'])
            let requestBody = {
                alias: <string>req.body.alias ?? '',
                name: <string>req.body.name,
                email: <string>req.body.email ?? '',
                id_number: <string>req.body.id_number ?? '',
                date_birth: <string>req.body.date_birth ?? req.body.birthdate,
                gender: parseFloat(req.body.gender),
                address: <string>req.body.address,
                phone: <string>req.body.phone,
                notes: <string>req.body.notes ?? '',
                plafond: parseFloat(!req.body.plafond || req.body.plafond === '' ? '0' : req.body.plafond),
                price: parseFloat(!req.body.price || req.body.price === '' ? '0' : req.body.price)
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/insertV3/getConnection')
        
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/customer/insertV3')

            try {
                let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
                if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })
    
                let requestBody = convertBody()!
                if (res.headersSent) return

                let business = user.business
                let merge = 0
                let customerPhone = 1

                let resBusinessGetCustomerMergeNCustomerPhone = await functionBusiness.getCustomerMergeNCustomerPhone({ res, connection }, { fk_business: user.business })
                if (resBusinessGetCustomerMergeNCustomerPhone) {
                    merge = resBusinessGetCustomerMergeNCustomerPhone.merge,
                    customerPhone = resBusinessGetCustomerMergeNCustomerPhone.customer_phone
                }
                let resultGetCustomerPhone: Array<{
                    alias: string,
                    name: string,
                    phone: string
                }> = []
                if (customerPhone === 1) {
                    if (merge === 0) {
                        resultGetCustomerPhone = await functionCustomer.selectCustomerPhoneWithoutMerge({ res, connection }, { fk_business: user.business, v_code: requestBody.alias, v_phone: requestBody.phone })
                    } else if (merge === 1) {
                        resultGetCustomerPhone = await functionCustomer.selectCustomerPhoneWithMerge({ res, connection }, { fk_business: user.business, v_code: requestBody.alias, v_phone: requestBody.phone })
                    }
                } else {
                    if (merge === 0) {
                        resultGetCustomerPhone = await functionCustomer.selectCustomerPhoneWithoutMergeUsingName({ res, connection }, { fk_business: user.business, v_code: requestBody.alias, v_name: requestBody.name });
                    } else if (merge === 1) {
                        resultGetCustomerPhone = await functionCustomer.selectCustomerPhoneWithMergeUsingName({ res, connection }, { fk_business: user.business, v_code: requestBody.alias, v_name: requestBody.name });
                    }
                }

                if (resultGetCustomerPhone.length > 0) {
                    if (customerPhone === 1) {
                        if (resultGetCustomerPhone[0].phone === requestBody.phone) {
                            connection.rollback(function (err) {
                                if (err) throw(err)
                                return res.status(411).json({ success: false, message: "Phone Already Used", data: [] })
                            })
                            return
                        }
                        else {
                            connection.rollback(function (err) {
                                if (err) throw(err)
                                return res.status(410).json({ success: false, message: "Code Already Used", data: [] })
                            })
                            return
                        }
                    } else {
                        if (resultGetCustomerPhone[0].name == req.body.name) {
                            connection.rollback(function (err) {
                                if (err) throw(err)
                                return res.status(412).json({ success: false, message: "Name Already Used", data: [] })
                            })
                            return
                        }
                        else {
                            connection.rollback(function (err) {
                                if (err) throw(err)
                                return res.status(410).json({ success: false, message: "Code Already Used", data: [] })
                            })
                            return
                        }
                    }
                } else {
                    let result = await functionCustomer.insertCustomer({res, connection}, {
                        fk_business: user.business,
                        b_gender: requestBody.gender,
                        dt_birthdate: requestBody.date_birth,
                        fk_price: requestBody.price,
                        i_plafond: requestBody.plafond,
                        v_address: requestBody.address,
                        v_code: requestBody.alias,
                        v_email: requestBody.email,
                        v_idnumber: requestBody.id_number,
                        v_name: requestBody.name,
                        v_notes: requestBody.notes,
                        v_phone: requestBody.phone
                        
                    })
                    connection.commit(function (err) {
                        if (err){
                            errors.rollback(connection, res, err, 'controller/customer/insertV3/commit')
                        } 
                        else{
                            res.status(200).json({
                                code: 200,
                                success: true,
                                message: "ok",
                                data: result["insertId"]
                            })
                            connection.release();   
                        }
                    })
                }
            } catch (err) {
                errors.rollback(connection, res, err, 'controller/customer/insertV3')
            }
        })
    })
}

export async function showCodeV3(req: typeCustomer.showCodeV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/showCodeV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resShowCode = await functionCustomer.showCodeCustomer({ res, connection }, { fk_business: user.business, table: req.body.table, code: req.body.code ? parseFloat(req.body.code) : null })
            return res.status(200).json({ success: true, message: "OK", data: resShowCode })
        } catch {
            return errors.rollback(connection, res, err, 'controller/customer/showCodeV3')
        }
    })
}

export async function updateCustomerV3(req: typeCustomer.updateV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/customer/updateCustomerV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resUpdateCustomer = await functionCustomer.updateCustomerCustomer({ res, connection }, { fk_business: user.business, customcode: req.body.customcode, phone: req.body.phone, name: req.body.name, email: req.body.email, idnumber: req.body.idnumber, birthdate: req.body.birthdate, gender: req.body.gender, address: req.body.address, notes: req.body.notes, plafond: req.body.plafond, price: req.body.price, code: parseFloat(req.body.code) })
            if(resUpdateCustomer.affectedRows > 0) return res.status(200).json({ success: true, message: "Data Not Found", data: [] })

            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/customer/updateCustomerV3/commit')
                return res.status(200).json({success: true, message: `Data inserted`, data: resUpdateCustomer.insertId})
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/customer/updateCustomerV3')
        }
    })
}