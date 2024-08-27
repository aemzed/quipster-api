import pool from "../config/connect"
import * as errors from "../function/global_function"
import * as typeGlobal from "../type/global"
import * as typeProduct from "../type/product"
import drive from "../config/drive"

import * as functionAdditional from '../function/master/additional'
import * as functionBusiness from '../function/account/business'
import * as functionCategory from '../function/master/category'
import * as functionFormula from '../function/operational/formula'
import * as functionGlobal from "../function/global_function"
import * as functionItem from '../function/master/item'
import * as functionItemImage from '../function/master/item_image'
import * as functionItemPrice from '../function/master/itemprice'
import * as functionItemPriceDistributor from "../function/master/item_price_distributor"
import * as functionLog from '../function/master/log'
import * as functionPackage from '../function/master/package'
import * as functionPackageDetail from '../function/master/packagedetail'
import * as functionPackagePrice from '../function/master/packageprice'
import * as functionProduct from "../function/master/product"
import * as functionStockreport from '../function/operational/stockreport'
import * as functionUnit from '../function/master/unit'
import * as functionUser from "../function/account/user"
import * as functionView from '../function/master/view'
import { Response, response } from "express"
import { Stream } from "stream"
import { ResultSetHeader } from "mysql2"

let uniqid = require('uniqid')

export function selectV3(req: typeProduct.selectV3, res: Response) {
    function convertBody() {
        try {
            let requestBody = {
                start: <number>req.body.start != null ? parseFloat(req.body.start) : undefined,
                limit: <number>req.body.limit != null ? parseFloat(req.body.limit) : undefined,
                order: <string>req.body.order != null ? req.body.order : undefined,
                keyword: <string>req.body.keyword != null ? req.body.keyword : undefined,
                name: <string>req.body.name != null ? req.body.name : undefined,
                stock: <number>req.body.stock != null ? parseFloat(req.body.stock) : undefined,
                online: <number>req.body.online != null ? parseFloat(req.body.online) : undefined,
                category: <number>req.body.category != null ? parseFloat(req.body.category) : undefined,
                formula: <number>req.body.formula != null ? parseFloat(req.body.formula) : undefined
            }
    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/selectV3/getConnection')

        let requestBody = convertBody()!
        if (res.headersSent) return
        let responseBody: Array<Partial<{
            code: any,
            sku: any,
            name: any,
            image: any,
            category_code: any,
            category: any,
            formula: any,
            stock: any,
            unit: any,
            unit_code: any,
            unit_variance: any,
            use_price_distributor: any,
            price: any,
            price2: any,
            price3: any,
            price4: any,
            price5: any,
            price_point: any,
            price_net: any,
            price_bottom: any,
            qty: any,
            qty_alert: any,
            notes: any,
            sort: any,
            show_online_store: any,
            recommendation: any,
            commission_type: any,
            commission_value: any,
            price_distributor: any,
            images: any,
            formula_detail: any
        }>> = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resProductGetProducts = await functionProduct.getProducts({res, connection}, {fk_business: user.business, b_hasformula: requestBody.formula, b_hasstock: requestBody.stock, b_showinplatform: requestBody.online, fk_category: requestBody.category, vw_business: {i_code: user.business}, vw_item_stock: {fk_business: user.business}, sortandfilter: {keyword: requestBody.keyword, limit: requestBody.limit, name: requestBody.name, order: requestBody.order, start: requestBody.start}})
            if(resProductGetProducts.length > 0) {
                let counter = 0
                for (let eachProduct of resProductGetProducts) {
                    var resItemPriceDistributorGetMinOrderNPrice:any = [];
                    if(eachProduct.use_price_distributor == 1) resItemPriceDistributorGetMinOrderNPrice = await functionItemPriceDistributor.getMinOrderNPrice({res, connection}, {fk_item: eachProduct.code})
                    // let resItemImageGet = await functionItemImage.getCodeNImage({res, connection}, {fk_item: eachProduct.code})
                    // let resFormula = await functionFormula.getQTYNMaterialsNUnit({res, connection}, {fk_item: eachProduct.code})
                    responseBody.push({
                        ...eachProduct, 
                        price_distributor: resItemPriceDistributorGetMinOrderNPrice, 
                        // images: resItemImageGet, 
                        // formula_detail: resFormula
                    })
                    counter++
                }
            }
            res.status(200).json({success: true, message: "OK", data: responseBody})
            connection.release()
            return
        } catch {
            return errors.rollback(connection, res, err, "controller/product/selectV3/getConnection")
        }
    })
}

export async function updateV3(req: typeProduct.updateV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'name', 'sku', 'name', 'category_code', 'formula', 'stock', 'unit_code'])
            let requestBody = {
                code: parseFloat(req.body.code),
                name: <string>req.body.name,
                sku: <string>req.body.sku,
                category_code: parseFloat(req.body.category_code),
                formula: parseFloat(req.body.formula),
                stock: parseFloat(req.body.stock),
                qty_alert: parseFloat(!req.body.qty_alert || req.body.qty_alert === '' ? '0' : req.body.qty_alert),
                unit_code: parseFloat(req.body.unit_code),
                unit_variance: <string>req.body.unit_variance ?? '',
                notes: <string>req.body.notes ?? '',
                showOnlineStore: parseFloat(!req.body.show_online_store && req.body.show_online_store === '' ? '1' : req.body.show_online_store),
                recommendation: parseFloat(!req.body.recommendation || req.body.recommendation === '' ? '0' : req.body.qty_alert),
                duplicate: parseFloat(!req.body.duplicate || req.body.duplicate === '' ? '0' : req.body.qty_alert)
            }

            if (requestBody.unit_variance.toLocaleLowerCase() === 'null') requestBody.unit_variance = ''
            if (requestBody.notes.toLocaleLowerCase() === 'null') requestBody.unit_variance = ''
            
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/updateV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

            let requestBody = convertBody()!
            if (res.headersSent) return

            if (requestBody.duplicate === 1) {
                let resultCategoryGetCode = await functionCategory.getCode({res, connection}, {fk_business: user.business, i_code: requestBody.category_code})
                if (resultCategoryGetCode) {
                    requestBody.category_code = resultCategoryGetCode.code
                } else {
                    requestBody.category_code = 0
                }

                let resultUnitGetCode = await functionUnit.getCode({res, connection}, {fk_business: user.business, i_code: requestBody.unit_code})
                if (resultUnitGetCode) {
                    requestBody.unit_code = resultUnitGetCode.code
                } else {
                    requestBody.unit_code = 0
                }
            }

            if (requestBody.unit_code === 0) return res.status(400).json({success: false, message: 'Satuan tidak terdaftar.'})
            else if (requestBody.category_code === 0) return res.status(400).json({success: false, message: 'Kategori tidak terdaftar.'})
            
            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/product/updateV3/beginTransaction')

                let resultItemGetName = await functionItem.getNameFromCustomCode({res, connection}, {fk_business: user.business, i_code: requestBody.code, v_code: requestBody.sku})
                if (resultItemGetName) return res.status(400).json({success: false, message: 'SKU sudah terdaftar sebelumnya'})

                await functionItem.update({res, connection}, {
                    b_hasformula: requestBody.formula,
                    b_hasstock: requestBody.stock,
                    b_recommendation: requestBody.recommendation,
                    b_showinplatform: requestBody.showOnlineStore,
                    fk_category: requestBody.category_code,
                    fk_unit: requestBody.unit_code,
                    i_code: requestBody.code,
                    i_qtyalert: requestBody.qty_alert,
                    v_code: requestBody.sku,
                    v_name: requestBody.name,
                    v_notes: requestBody.notes,
                    v_unit_variance: requestBody.unit_variance
                })

                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/updateV3/commit')

                    return res.status(200).json({success: true, message: 'Item updated.'})
                })
            })

        } catch (error) {
            console.log(error)
        }
    })
}

export async function insertV3(req: typeProduct.insertV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['name', 'category_code', 'unit_code'])
    
            let requestBody = {
                sku: <string>(req.body.sku ? req.body.sku : req.body.customcode ?? ''),
                name: <string>req.body.name,
                category_code: <number>parseFloat(req.body.category_code),
                formula: <number>parseFloat(!req.body.formula || req.body.formula === '' ? "0" : req.body.formula),
                stock: <number>parseFloat(!req.body.stock || req.body.stock === '' ? "0" : req.body.stock),
                unit_code:<number>parseFloat(req.body.unit_code),
                unit_variance: <string>req.body.unit_variance ?? "",
                notes: <string>req.body.notes ?? "",
                qty: <number>parseFloat(!req.body.qty || req.body.qty === '' ? "0" : req.body.qty),
                qty_alert: <number>parseFloat(!req.body.qty_alert || req.body.qty_alert === '' ? "0" : req.body.qty_alert),
                price_net: <number>parseFloat(!req.body.price_net || req.body.price_net === '' ? "0" : req.body.price_net),
                price: <number>parseFloat(!req.body.price || req.body.price === '' ? "0" : req.body.price),
                price2: <number>parseFloat(!req.body.price2 || req.body.price2 === '' ? "0" : req.body.price2),
                price3: <number>parseFloat(!req.body.price3 || req.body.price3 === '' ? "0" : req.body.price3),
                price4: <number>parseFloat(!req.body.price4 || req.body.price4 === '' ? "0" : req.body.price4),
                price5: <number>parseFloat(!req.body.price5 || req.body.price5 === '' ? "0" : req.body.price5),
                price_point: <number>parseFloat(!req.body.price_point || req.body.price_point === '' ? "0" : req.body.price_point),
                all_branch: <number>parseFloat(!req.body.all_branch || req.body.all_branch === '' ? "0" : req.body.all_branch),
                is_limit: <number>parseFloat(!req.body.is_limit || req.body.is_limit === '' ? "1" : req.body.is_limit),
                show_online_store: <number>parseFloat(!req.body.show_online_store || req.body.show_online_store === '' ? "1" : req.body.show_online_store),
                recommendation: <number>parseFloat(!req.body.recommendation || req.body.recommendation === '' ? "0" : req.body.recommendation),
                mobile: <number>parseFloat(!req.body.mobile || req.body.mobile === '' ? "0" : req.body.mobile),
                use_price_distributor: <number>parseFloat(!req.body.use_price_distributor || req.body.use_price_distributor === '' ? "0" : req.body.use_price_distributor),
                price_distributors: <Array<{
                    min_order: number,
                    price: number
                }>> functionGlobal.handleJSONRequestBody('price_distributors', req.body.price_distributors ?? [], true),
                duplicate: <number>parseFloat(!req.body.duplicate || req.body.duplicate === '' ? "0" : req.body.duplicate),
                prevent_favorite: <number>parseFloat(!req.body.prevent_favorite || req.body.prevent_favorite === '' ? "0" : req.body.prevent_favorite)
            }
    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/insertV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let requestBody = convertBody()!
            if (res.headersSent) return
            let responseBody: ResultSetHeader

            if (requestBody.duplicate === 1) {
                let resCategoryGetCode = await functionCategory.getCode({res, connection}, {fk_business: user.business, i_code: requestBody.category_code})
                if (resCategoryGetCode) requestBody.category_code = resCategoryGetCode.code
                else requestBody.category_code = 0
                let resUnitGetCode = await functionUnit.getCode({res, connection}, {fk_business: user.business, i_code: requestBody.unit_code})
                if (resUnitGetCode) requestBody.unit_code = resUnitGetCode.code
                else requestBody.unit_code = 0
            }
            
            if (requestBody.unit_code === 0) return res.status(400).json({success: false, message: "Satuan tidak terdaftar."})
            else if (requestBody.category_code === 0) return res.status(400).json({success: false, message: "Kategori tidak terdaftar."})
            
            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/product/insertV3/beginTransaction')
                let businessOwner = 0
                if (requestBody.all_branch === 1) {
                    let resBusinessGetOwner = await functionBusiness.getBusinessowner({res, connection}, {fk_business: user.business})
                    if (resBusinessGetOwner.code) {
                        businessOwner = resBusinessGetOwner.code
                    }
                }
                let canAdd = true
                // if (requestBody.is_limit === 1) {
                //     let resItemGetTotalAndLimit = await functionItem.getTotalNLimit({res, connection}, {fk_business: user.business})
                //     if (resItemGetTotalAndLimit) {
                //         if (resItemGetTotalAndLimit.total >= resItemGetTotalAndLimit.limit) canAdd = false
                //     }
                // }

                if (canAdd) {
                    let resItemGetSKU = await functionItem.getSKU({res, connection}, {fk_business: user.business, v_code: requestBody.sku, v_name: requestBody.name})
                    if (resItemGetSKU) {
                        return res.status(400).json({success: false, message: "Item dengan SKU yang sama telah terdaftar."})
                    }

                    let resItemInsert = await functionItem.insert({res, connection}, {
                        fk_user_modify: user.code,
                        fk_business: user.business,
                        fk_business_owner: businessOwner,
                        v_code: requestBody.sku,
                        v_name: requestBody.name,
                        fk_category: requestBody.category_code,
                        b_hasformula: requestBody.formula,
                        b_hasstock: requestBody.stock,
                        fk_unit: requestBody.unit_code,
                        v_unit_variance: requestBody.unit_variance,
                        i_qtyalert: requestBody.qty_alert,
                        v_notes: requestBody.notes,
                        i_pricenet: requestBody.price_net,
                        b_distributor: requestBody.use_price_distributor,
                        b_showinplatform: requestBody.show_online_store,
                        b_recommendation: requestBody.recommendation
                    })

                    let resItemPriceInsert = await functionItemPrice.insert({res, connection}, {
                        fk_user_modify: user.code,
                        fk_business: user.business,
                        fk_item: resItemInsert.insertId,
                        hpp: requestBody.price_net,
                        price: requestBody.price,
                        price2: requestBody.price2,
                        price3: requestBody.price3,
                        price4: requestBody.price4,
                        price5: requestBody.price5,
                        point: requestBody.price_point
                    })

                    let resStockReportInsert = await functionStockreport.insert({res, connection}, {
                        fk_business: user.business,
                        fk_itemmaterial: resItemInsert.insertId,
                        b_source: 0,
                        b_type: 1,
                        qty: requestBody.qty,
                        notes: ''
                    })

                    for (let eachPriceDistributor of requestBody.price_distributors) {
                        let resItemPriceDistributorInsert = await functionItemPriceDistributor.insert({res, connection}, {fk_user_modify: user.code, fk_item: resItemInsert.insertId, i_min_order: eachPriceDistributor.min_order, i_price: eachPriceDistributor.price})
                    }

                    if (user.business === 3109) {
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3109, to: 3151}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3109, to: 3152}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3109, to: 3153}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3109, to: 3154}})
                    } else if (user.business === 3151 ) {
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3151, to: 3109}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3151, to: 3152}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3151, to: 3153}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3151, to: 3154}})
                    } else if (user.business === 3152 ) {
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3152, to: 3109}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3152, to: 3151}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3152, to: 3153}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3152, to: 3154}})
                    } else if (user.business === 3153 ) {
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3153, to: 3109}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3153, to: 3151}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3153, to: 3152}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3153, to: 3154}})
                    } else if (user.business === 3154 ) {
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3154, to: 3109}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3154, to: 3151}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3154, to: 3152}})
                        functionView.COPY_MASTER_ITEM({res, connection}, {fk_business: {from: 3154, to: 3153}})
                    }

                    let resItemGetSKUFromCode = await functionItem.getSKUfromCode({res, connection}, {i_code: resItemInsert.insertId})

                    connection.commit(async function (err) {
                        if (err) return errors.rollback(connection, res, err, 'controller/product/insertV3/commit')

                        return res.status(200).json({success: true, message: "Data inserted.", data: {...resItemInsert, insertSku: resItemGetSKUFromCode.sku}})
                    })
                } else {
                    connection.commit(function (err) {
                        if (err) return errors.rollback(connection, res, err, 'controller/product/insertV3/commit')

                        return res.status(400).json({success: false, message: "Quota runs out. Upgrade to premium."})
                    })
                }
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/products/insertV3')
        }
    })
}

export function updateCommissionV3(req: typeProduct.updateCommissionV3, res: Response) {

    function convertBody() {
        try {
           errors.checkField(req.body, ['code', 'type', 'commission'])
    
            let requestBody = {
                code: <number>parseFloat(req.body.code),
                type: <number>parseFloat(req.body.type),
                commission: <number>parseFloat(req.body.commission)
            }
    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/updateCommissionV3/getConnection')

        try {
            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/product/updateCommissionV3/beginTransaction')

                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return
                let responseBody: ResultSetHeader

                let resItemUpdateCommission = await functionItem.updateCommission({res, connection}, {fk_user_modify: user.code, i_code: requestBody.code, b_commission: requestBody.type, i_commission: requestBody.commission})
                responseBody = resItemUpdateCommission

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/updateCommissionV3/commit')

                    return res.status(200).json({success: true, message: "Data updated.", data: responseBody})
                })
            })

            
        } catch {
            return errors.rollback(connection, res, err, 'controller/product/updateCommissionV3')
        }
    })
}

export function updatePriceV3(req: typeProduct.updatePriceV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'hpp_manual', 'hpp', 'price', 'price2', 'price3', 'price4', 'price5', 'point', 'use_price_distributor', 'price_distributor'])
            let requestBody = {
                code: <number>parseFloat(req.body.code),
                hpp_manual: <number>parseFloat(req.body.hpp_manual),
                hpp: <number>parseFloat(req.body.hpp),
                price: <number>parseFloat(req.body.price),
                price2: <number>parseFloat(req.body.price2),
                price3: <number>parseFloat(req.body.price3),
                price4: <number>parseFloat(req.body.price4),
                price5: <number>parseFloat(req.body.price5),
                point: <number>parseFloat(req.body.point),
                use_price_distributor: <number>parseFloat(req.body.use_price_distributor),
                price_distributor: <Array<{
                                    min_order: number,
                                    price: number
                                    }>> functionGlobal.handleJSONRequestBody('price_distributor', req.body.price_distributor, true)
            }    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/updatePriceV3')

        try {
            connection.beginTransaction(async function (err) {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return
                let responseBody: ResultSetHeader

                await functionItemPrice.softDelete({res, connection}, {fk_user_modify: user.code, fk_business: user.business, fk_item: requestBody.code})
                await functionItemPrice.insert({res, connection}, {fk_user_modify: user.code, fk_business: user.business, fk_item: requestBody.code, hpp: requestBody.hpp, point: requestBody.point, price: requestBody.price, price2: requestBody.price2, price3: requestBody.price3, price4: requestBody.price4, price5: requestBody.price5})

                if (requestBody.use_price_distributor === 1 || requestBody.use_price_distributor === 2) {
                    await functionItem.updateDistributor({res, connection}, {fk_user_modify: user.code, b_distributor: requestBody.use_price_distributor, fk_business: user.business, i_code: requestBody.code})
                    if (requestBody.price_distributor.length > 0) {
                        await functionItemPriceDistributor.hardDelete({res, connection}, {fk_user_modify: user.code, fk_item: requestBody.code})
                        for (let eachPriceDistributor of requestBody.price_distributor) {
                            await functionItemPriceDistributor.insert({res, connection}, {fk_user_modify: user.code, fk_item: requestBody.code, i_min_order: eachPriceDistributor.min_order, i_price: eachPriceDistributor.price})
                        }
                    }
                }

                if (requestBody.hpp_manual === 1) {
                    await functionItem.updatePriceNet({res, connection}, {fk_user_modify: user.code, fk_business: user.business, code: requestBody.code, pricenet: requestBody.hpp})
                    let resPackageDetailGetPackageHPPPrices = await functionPackageDetail.selectPackageHPPPrices({res, connection}, {fk_item: requestBody.code})
                    if (resPackageDetailGetPackageHPPPrices.length > 0) {
                        for (let eachPackage of resPackageDetailGetPackageHPPPrices) {
                            await functionPackage.updatePricenet({res, connection}, {fk_user_modify: user.code, pricenet: eachPackage.hpp, code: eachPackage.package})
                            await functionPackagePrice.insert({res, connection}, {fk_user_modify: user.code, fk_business: user.business, fk_package: eachPackage.package, hpp: eachPackage.hpp, price: eachPackage.price_1, price2: eachPackage.price_2, price3: eachPackage.price_3, price4: eachPackage.price_4, price5: eachPackage.price_5})
                        }
                    }
                }
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/updatePriceV3/commit')

                    return res.status(200).json({success: true, message: "Data updated."})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/product/updatePriceV3/getConnection')
        }
    })
}

export function selectSimilarV3(req: typeProduct.selectSimilarV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: parseFloat(req.body.code)
            }    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/selectSimilarV3/getConnection')
        
        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let requestBody = convertBody()!
            if (res.headersSent) return
            let responseBody: Array<Partial<{
                                code: number,
                                sku: string,
                                name: string,
                                business_name: string,
                                business: number,
                                token: string
                            }>> = []
            
            let resItemGetNameSKUOwner = await functionItem.getNameSKUOwner({res, connection}, {i_code: requestBody.code})
            if (resItemGetNameSKUOwner) {
                resItemGetNameSKUOwner.name = resItemGetNameSKUOwner.name.replaceAll(`'`, `\\'`)
                resItemGetNameSKUOwner.sku = resItemGetNameSKUOwner.sku.replaceAll(`'`, `\\'`)
                let resItemGetCodeNSkuNNameNBusiness = await functionItem.getCodeNSKUNNameNBusiness({res, connection}, {fk_business: user.business, i_code: requestBody.code, v_code: resItemGetNameSKUOwner.sku, v_name: resItemGetNameSKUOwner.name, vw_business: {fk_businessowner: resItemGetNameSKUOwner.owner}})
                if (resItemGetCodeNSkuNNameNBusiness.length > 0) {
                    for (let eachItem of resItemGetCodeNSkuNNameNBusiness) {
                        let resUserGetCodeAndToken = await functionUser.getCodeNToken({res, connection}, {fk_business: eachItem.business})
                        if (resUserGetCodeAndToken.token === "") {
                            resUserGetCodeAndToken.token = uniqid()
                            let resUserUpdateToken = await functionUser.updateBackofficeToken({res, connection}, {i_code: resUserGetCodeAndToken.code, token: resUserGetCodeAndToken.token})
                        }
                        responseBody.push({...eachItem, token: resUserGetCodeAndToken.token})
                    }
                }
            }
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/product/selectSimilarV3')
        }
    })
}

export function formulaProcessV3(req: typeProduct.formulaProcessV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['item_code', 'qty'])
            let requestBody = {
                item_code: <number>parseFloat(req.body.item_code),
                qty: <number>parseFloat(req.body.qty)
            }    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/formulaProcessV3/getConnection')

        try {
            connection.beginTransaction(async function (err) {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return

                let hpp = 0
                let resFormulaGetMaterialNPriceNQty = await functionFormula.getMaterialNPriceNQty({res, connection}, {fk_item: requestBody.item_code, fk_business: user.business})
                if (resFormulaGetMaterialNPriceNQty.length > 0) {
                    for (let eachFormula of resFormulaGetMaterialNPriceNQty) {
                        hpp += eachFormula.price * eachFormula.qty
                        let resStockreportInsert = await functionStockreport.insert({res, connection}, {
                            fk_business: user.business,
                            fk_itemmaterial: eachFormula.material,
                            b_source: 1,
                            b_type: 2,
                            qty: (eachFormula.qty * -1 * requestBody.qty),
                            i_price: hpp
                        })
                    }
                    let resStockreportInsert = await functionStockreport.insert({res, connection}, {
                        fk_business: user.business,
                        fk_itemmaterial: requestBody.item_code,
                        b_source: 1,
                        b_type: 1,
                        qty: requestBody.qty,
                        i_price: hpp
                    })
                }

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/formulaProcessV3/commit')

                    return res.status(200).json({success: true, message: "Formula Processed Successfully"})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/product/formulaProcessV3')
        }
    })
}

export async function deleteV3(req: typeProduct.deleteV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: <number>parseFloat(req.body.code)
            }    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/deleteV3/getConnection')

        try {
            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/product/deleteV3/beginTransaction')
                
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return
                let responseBody: ResultSetHeader

                let resSoftDeleteItem = await functionItem.softDelete({res, connection}, {fk_user_modify: user.code, i_code: requestBody.code})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/deleteV3/commit')

                    return res.status(200).json({success: true, message: "Delete successfully.", data: resSoftDeleteItem})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/product/deleteV3')
        }
    })
}

export function updateImageV3(req: typeProduct.updateImageV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'image'])
            let requestBody = {
                code: <number>parseFloat(req.body.code),
                image: <string>req.body.image
            }    
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    async function deleteOldImages(imagename: string) {
        const responseList = await drive.files.list({
            q: "'1cOvhx2i8jcuMuNTCAloxY3oCtMNGTsus' in parents"           
        })
        responseList.data.files?.forEach(async function (file) {
            if (file.name?.split('.')[0] === imagename) {
                if (file.id) await drive.files.delete({
                    fileId: file.id
                })
            }
        })
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/updateImageV3/getConnection')
        
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/product/udateImageV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return

                if (requestBody.image.indexOf('data:image/') === 0 && requestBody.image.indexOf('base64')) {
                    await deleteOldImages(requestBody.code.toString())
                    let imageInfo = req.body.image.split(";base64,")
                    let imageExtension = imageInfo[0].replace("data:image/","")
                    let imageData = imageInfo[1]
                    const imageBuffer = new (Buffer.from as any)(imageData, 'base64')
                    const bufferStream = new Stream.PassThrough()
                    bufferStream.end(imageBuffer)
                    
                    const responseInsert = await drive.files.create({
                        requestBody: {
                            name: req.body.code + '.' + imageExtension,
                            mimeType: 'image/' + imageExtension,
                            parents: ['1cOvhx2i8jcuMuNTCAloxY3oCtMNGTsus']
                        },
                        media: {
                            mimeType: 'image/' + imageExtension,
                            body: bufferStream
                        }
                    })
                    await functionItem.updateImage({res, connection}, {fk_user_modify: user.code, i_code: parseFloat(req.body.code), v_image_link: `https://drive.google.com/uc?export=view&id=${responseInsert.data.id}`})
                }

                else if (requestBody.image === '') {
                    await functionItem.updateImage({res, connection}, {fk_user_modify: user.code, i_code: parseFloat(req.body.code), v_image: ``, v_image_link: ``})
                    await deleteOldImages(requestBody.code.toString())
                }

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/updateImageV3/commit')
                    
                    return res.status(200).json({success: true, message: "Image updated."})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/product/updateImageV3')
            }
        })
    })
}

export function updateImageNewV3(req: typeProduct.updateImageV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'image'])
            let requestBody = {
                code: <number>parseFloat(req.body.code),
                image: errors.handleJSONRequestBody('image', req.body.image, true)
            }
            requestBody.image = requestBody.image.join()
            errors.checkNaN({...requestBody})

            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    async function deleteOldImages(imagename: string) {
        const responseList = await drive.files.list({
            q: "'1cOvhx2i8jcuMuNTCAloxY3oCtMNGTsus' in parents"           
        })
        responseList.data.files?.forEach(async function (file) {
            if (file.name?.split('.')[0] === imagename) {
                if (file.id) await drive.files.delete({
                    fileId: file.id
                })
            }
        })
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/updateImageV3/getConnection')
        
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/product/udateImageV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

                let requestBody = convertBody()!
                if (res.headersSent) return

                if (requestBody.image.indexOf('data:image/') === 0 && requestBody.image.indexOf('base64')) {
                    await deleteOldImages(requestBody.code.toString())
                    let imageInfo = requestBody.image.split(";base64,")
                    let imageExtension = imageInfo[0].replace("data:image/","")
                    let imageData = imageInfo[1]
                    const imageBuffer = new (Buffer.from as any)(imageData, 'base64')
                    const bufferStream = new Stream.PassThrough()
                    bufferStream.end(imageBuffer)
                    
                    const responseInsert = await drive.files.create({
                        requestBody: {
                            name: requestBody.code + '.' + imageExtension,
                            mimeType: 'image/' + imageExtension,
                            parents: ['1cOvhx2i8jcuMuNTCAloxY3oCtMNGTsus']
                        },
                        media: {
                            mimeType: 'image/' + imageExtension,
                            body: bufferStream
                        }
                    })
                    await functionItem.updateImage({res, connection}, {fk_user_modify: user.code, i_code: parseFloat(req.body.code), v_image_link: `https://drive.google.com/uc?export=view&id=${responseInsert.data.id}`})
                }

                else if (requestBody.image === '') {
                    await functionItem.updateImage({res, connection}, {fk_user_modify: user.code, i_code: parseFloat(req.body.code), v_image: ``, v_image_link: ``})
                    await deleteOldImages(requestBody.code.toString())
                }

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/updateImageV3/commit')
                    return res.status(200).json({success: true, message: "Image updated."})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/product/updateImageV3')
            }
        })
    })
}

export function addStockV3(req: typeProduct.addStockV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'qty', 'notes'])
            let requestBody = {
                code: req.body.code,
                qty: parseFloat(req.body.qty),
                notes: req.body.notes.replaceAll(`'`,`\\'`)
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/product/addStockV3')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/product/addStockV3')
            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(400).json({success: false, message: "Credential not valid."})
    
                let requestBody = convertBody()!
                if (res.headersSent) return
    
                let resInsert = await functionStockreport.insert({res, connection}, {b_source: 3, b_type: 1, fk_business: user.business, fk_itemmaterial: requestBody.code, fk_user: user.code, qty: requestBody.qty, notes: requestBody.notes})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/product/addStockV3')

                    return res.status(500).json({success: true, message: "Added Stock Successfully", data: resInsert})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/product/addStockV3')
            }
        })
    })
}