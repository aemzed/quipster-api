import { Request, Response } from "express"
import pool from "../config/connect"
import * as errors from "../function/global_function"

import * as typePurchaseOrder from "../type/purchaseorder"

import * as functionUser from "../function/account/user"
import * as functionPurchaseOrder from "../function/operational/purchaseorder"
import * as functionPurchaseOrderDetail from "../function/operational/purchaseorderdetail"
import * as functionStockReport from "../function/operational/stockreport"
import * as functionPackage from "../function/master/package"
import * as functionPackageDetail from "../function/master/packagedetail"
import * as functionPackagePrice from "../function/master/packageprice"
import * as functionFormula from "../function/operational/formula"
import * as functionItem from "../function/master/item"
import * as functionItemPrice from "../function/master/itemprice"

export async function selectV3(req: typePurchaseOrder.selectV3, res: Response) {
    req.body.language = req.body.language ?? "id"
    pool.getConnection(async function(err, connection) {
        if (err) errors.rollback(connection, res, err, 'controller/purchaseorder/select/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return errors.rollback(connection, res, err, 'controller/purchaseorder/select/getConnection')

            let resPurchaseOrderSelect = await functionPurchaseOrder.select({res, connection}, {fk_business: user.business, dt_created: {start_date: req.body.date_start, end_date: req.body.date_end}})
            return res.status(200).json({success: true, message: "OK", data: resPurchaseOrderSelect})
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/select')
        }
    })
}

export async function detailV3(req: typePurchaseOrder.detailV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/detailV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetSupplierAndTax = await functionPurchaseOrder.getSupplierAndTax({res, connection}, {fk_business: user.business, code: parseInt(req.body.purchase_order_code)})
            let resPurchaseOrderDetailGet = await functionPurchaseOrderDetail.get({res, connection}, {fk_business: user.business, fk_purchaseorder: parseInt(req.body.purchase_order_code)})

            return res.status(200).json({success: true, message: "OK", data: {PurchaseOrder: resGetSupplierAndTax ?? {}, PurchaseOrderDetail: resPurchaseOrderDetailGet}})
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/detailV3')
        }
    })
}

export async function insertV3(req: typePurchaseOrder.insertV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) {
            errors.rollback(connection, res, err, 'controller/purchaseorder/insertV3/getConnection')
        }

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) {
                    return errors.rollback(connection, res, err, 'controller/purchaseorder/insertV3/beginTransaction', req)
                }
                let resPurchaseOrderInsert = await functionPurchaseOrder.insert({res, connection}, {
                    fk_business: user.business,
                    fk_supplier: parseInt(req.body.supplier_code),
                    v_receipt: req.body.receipt,
                    i_price: parseFloat(req.body.subtotal),
                    i_tax: parseFloat(!req.body.tax || req.body.tax === '' ? '0' : req.body.tax),
                    i_discount: parseFloat(req.body.discount),
                    i_pricenet: parseFloat(req.body.total),
                    i_extracharge: parseFloat(req.body.extra),
                    dt_order: req.body.date_order,
                    v_notes: req.body.notes,
                    fk_user_modify: user.code
                })
                let details:any = JSON.parse(req.body.detail)
                for (let detail of details) {
                    let subtotal = parseFloat(detail.qty) * parseFloat(detail.price)
                    let discountType = parseFloat(detail.discount_type || '0')
                    let discountNominal = parseFloat(detail.discount_value || '0')
                    let notes = detail.notes ?? ""
                    
                    let discount = discountNominal * parseFloat(detail.qty)
                    if (discountType === 1) discount = (parseFloat(detail.price) * discountNominal / 100) * detail.qty
                    let total = subtotal - discount
                    let resPurchaseOrderDetailInsert = await functionPurchaseOrderDetail.insertV3({res, connection}, {
                        fk_business: user.business,
                        fk_purchaseorder: resPurchaseOrderInsert.insertId,
                        fk_itemmaterial: parseFloat(detail.item_material_code),
                        b_type: parseInt(detail.item_material_type),
                        i_qty: parseFloat(detail.qty),
                        i_price: parseFloat(detail.price),
                        i_discount: discountType,
                        i_discountnominal: discountNominal,
                        i_total: total,
                        v_notes: notes,
                        fk_user_modify: user.code
                    })
                }
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/insertV3/commit', req)

                    return res.status(200).json({success: true, message: `Data inserted.`, data: resPurchaseOrderInsert.insertId})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/insertV3', req)
        }
    })
}

export async function updateV3(req: typePurchaseOrder.updateV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/updateV3/getConnection', req)

        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/updateV3/beginTransaction', req)
            
            let resGetConfirmed = await functionPurchaseOrder.getConfirmed({res, connection}, {i_code: parseFloat(req.body.code)})
            if (resGetConfirmed.confirmed === 1) {
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/updatev3/commit1')

                    return res.status(400).json({success: false, message: "Confirmed purchase order can't be changed"})
                })
                return
            }

            let resUpdatePurchaseOrder = await functionPurchaseOrder.updateV3({res, connection}, {
                fk_business: user.business,
                i_code: parseFloat(req.body.code),
                fk_supplier: parseFloat(req.body.supplier_code),
                v_receipt: req.body.receipt,
                i_price: parseFloat(req.body.subtotal),
                i_tax: parseFloat(req.body.tax),
                i_discount: parseFloat(req.body.discount),
                i_pricenet: parseFloat(req.body.total),
                i_extracharge: parseFloat(req.body.extra),
                dt_order: req.body.date_order,
                v_notes: req.body.notes,
                fk_user_modify: user.code
            })

            await functionPurchaseOrderDetail.deleteV3({res, connection}, {
                fk_purchaseorder: parseFloat(req.body.code),
                fk_business: user.business
            })

            let details = JSON.parse(req.body.detail)
            for (let detail of details) {
                let subtotal = parseFloat(detail.qty) * parseFloat(detail.price)
                let discountType = parseInt(detail.discount_type || "0")
                let discountNominal = parseFloat(detail.discount_value || "0")

                let discount = discountNominal * detail.qty
                if (discountType === 1) discount = (detail.price * discountNominal / 100) * detail.qty
                let total = subtotal - discount

                await functionPurchaseOrderDetail.insertV3({res, connection}, {
                    fk_business: user.business,
                    fk_purchaseorder: parseInt(req.body.code),
                    fk_itemmaterial: parseInt(detail.item_material_code),
                    b_type: parseInt(detail.item_material_type),
                    i_qty: parseFloat(detail.qty),
                    i_price: parseFloat(detail.price),
                    i_discount: discountType,
                    i_discountnominal: discountNominal,
                    i_total: total,
                    fk_user_modify: user.code
                })
            }
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/updateV3', req)
                
                return res.status(200).json({success: true, message: "Data updated."})
            })
        })
    })
}

export async function deleteV3(req: typePurchaseOrder.deleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/deleteV3')

        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/deleteV3')

            await functionPurchaseOrder.softDelete({res, connection}, {code: req.body.code, fk_user_modify: user.code})
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/deleteV3/commit')
                return res.status(200).json({success: true, message: "Delete Success"})
            })
        })
    })
}

export async function confirmV3(req: typePurchaseOrder.confirmV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/confirmV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not Valid."})

            let resGetPurchaseOrder = await functionPurchaseOrder.getPurchaseOrder({res, connection}, {fk_business: user.business, code: parseFloat(req.body.purchase_order_code)})
            if (!resGetPurchaseOrder) {
                connection.beginTransaction(async function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/confirmV3/getConnection')
                    await functionPurchaseOrder.updateIsConfirm({res, connection}, {dt_received: req.body.date_received, code: parseFloat(req.body.purchase_order_code), fk_user_modify: user.code})
                    await functionStockReport.purchaseOrderInsert({res, connection}, {fk_business: user.business, fk_purchaseorder: parseFloat(req.body.purchase_order_code)})
                    let resGetItemMaterial = await functionPurchaseOrderDetail.getItemMaterial({res, connection}, {fk_business: user.business, fk_purchaseorder: parseFloat(req.body.purchase_order_code)})
                    for (let eachItemMaterial of resGetItemMaterial) {
                        let resSelectPackageHPPPrice = await functionPackageDetail.selectPackageHPPPrices({res, connection}, {fk_item: eachItemMaterial.item})
                        if (resSelectPackageHPPPrice.length > 0) {
                            for (let eachPackage of resSelectPackageHPPPrice) {
                                await functionPackage.updatePricenet({res, connection}, {fk_user_modify: user.code, pricenet: eachPackage.hpp, code: eachPackage.package})
                                await functionPackagePrice.softDelete({res, connection}, {fk_user_modify: user.code, fk_package: eachPackage.package, fk_business: user.business})
                                await functionPackagePrice.insert({res, connection}, {
                                    fk_user_modify: user.code,
                                    fk_business: user.business,
                                    fk_package: eachPackage.package,
                                    hpp: eachPackage.hpp,
                                    price: eachPackage.price_1,
                                    price2: eachPackage.price_2,
                                    price3: eachPackage.price_3,
                                    price4: eachPackage.price_4,
                                    price5: eachPackage.price_5
                                })
                            }
                        }
    
                        let resGetMaterial = await functionPurchaseOrderDetail.getMaterial({res, connection}, {fk_business: user.business, fk_purchaseorder: parseInt(req.body.purchase_order_code)})
                        
                        if (resGetMaterial.length > 0) {
                            for (let eachMaterial of resGetMaterial) {
                                let resSelectItemPricePoint = await functionFormula.selectItemPricePoint({res, connection}, {fk_material: eachMaterial.material})
    
                                if (resSelectItemPricePoint.length > 0) {
                                    for (let eachItemPricePoint of resSelectItemPricePoint) {
                                        await functionItem.updatePriceNet({res, connection}, {fk_user_modify: user.code, fk_business: user.business, pricenet: eachItemPricePoint.hpp, code: eachItemPricePoint.item})
                                        await functionItemPrice.softDelete({res, connection}, {fk_user_modify: user.code, fk_business: user.business, fk_item: eachItemPricePoint.item})
                                        await functionItemPrice.insert({res, connection}, {
                                            fk_user_modify: user.code,
                                            fk_business: user.business,
                                            fk_item: eachItemPricePoint.item,
                                            hpp: eachItemPricePoint.hpp,
                                            price: eachItemPricePoint.price_1,
                                            price2: eachItemPricePoint.price_2,
                                            price3: eachItemPricePoint.price_3,
                                            price4: eachItemPricePoint.price_4,
                                            price5: eachItemPricePoint.price_5,
                                            point: eachItemPricePoint.point
                                        })
                                    }
                                }
                            }
                        }
                    }

                    connection.commit(function (err) {
                        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/confirmV3/commit')

                        return res.status(200).json({success: true, message: "Confirmed Successfully"})
                    })
                })
            }
            else {
                return res.status(400).json({success: false, message: "Purchase Order not found or already confirmed."})
            }
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/confirmV3')
        }
    })
}

export async function itemMaterialV3(req: typePurchaseOrder.itemMaterialV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/itemMaterialV3/getConnection') 

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resItemMaterialGet = await functionItem.itemMaterialGet({res, connection}, {fk_business: user.business})
            return res.status(200).json({success: true, message: "OK", data: resItemMaterialGet})
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/itemMaterialV3')
        }
    })
}

export async function paidV3(req: typePurchaseOrder.paidV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/paidV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success:false, message: "Credential not valid."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/paidV3/beginTransaction')

                await functionPurchaseOrder.updateIsPaid({res, connection}, {dt_paid: req.body.date_paid, code: parseInt(req.body.purchase_order_code), fk_user_modify: user.code})
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'purchaseorder/paidV3/commit')
                    return res.status(200).json({success: true, message: "Paid Success"})
                })
            })
            
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/paidV3')
        }
    })
}

export async function adjustPriceV3(req: typePurchaseOrder.adjustPriceV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/adjustPriceV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resGetPOCodePriceQTYDiscount = await functionPurchaseOrderDetail.getPOCodePriceQTYDiscount({res, connection}, {business: user.business, code: parseInt(req.body.purchase_order_detail_code)})
            if (!resGetPOCodePriceQTYDiscount) return res.status(404).json({success: false, message: "Purchase order detail for this user not found."})
            if (resGetPOCodePriceQTYDiscount.adjusted_date !== null) return res.status(405).json({success: false, message: "Purchase order detail already adjusted."})

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/adjustPriceV3/beginTransaction')
                await functionPurchaseOrderDetail.updatePriceAdjusted({res, connection}, {code: parseInt(req.body.purchase_order_detail_code), price_adjusted: parseFloat(req.body.price), fk_user_modify: user.code})
                await functionPurchaseOrder.updatePriceAdjustedDiscountAdjusted({res, connection}, {code: resGetPOCodePriceQTYDiscount.po_code, fk_user_modify: user.code})
                await functionPurchaseOrder.updateTaxAdjusted({res, connection}, {code: resGetPOCodePriceQTYDiscount.po_code, fk_user_modify: user.code})
                await functionPurchaseOrder.updatePricenetAdjusted({res, connection}, {code: resGetPOCodePriceQTYDiscount.po_code, fk_user_modify: user.code})
                
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/adjustPriceV3/commit')
                    
                    return res.status(200).json({success: true, message: "Data updated."})
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/adjustPriceV3')
        }
    })
}

export function voidV3(req: typePurchaseOrder.voidV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['code', 'date_void'])
            let requestBody = {
                code: parseFloat(req.body.code),
                date_void: req.body.date_void
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (error: any) {
            res.status(400).json({success: false, message: error.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/purchaseorder/voidV3/getConnection')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
            if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

            let requestBody = convertBody()!
            if (res.headersSent) return

            await functionPurchaseOrder.updateDatevoid({res, connection}, {i_code: requestBody.code, dt_void: requestBody.date_void, fk_user_modify: user.code})
            return res.status(200).json({success: true, message: 'Void Purchase Order successfully.'})
        } catch {
            return errors.rollback(connection, res, err, 'controller/purchaseorder/voidV3')
        }
    })
}