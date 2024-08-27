import pool from '../config/connect'

import * as typeGlobal from '../type/global'
import * as typeStock from '../type/stock'

import * as errors from '../function/global_function'
import * as functionGlobal from '../function/global_function'
import * as functionUser from '../function/account/user'
import * as functionItem from '../function/master/item'
import * as functionMaterial from '../function/master/material'
import * as functionStockReport from '../function/operational/stockreport'
import * as functionStockTransfer from '../function/operational/stocktransfer'
import { Response } from 'express'

export function transferV3(req: typeStock.transferV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['business_destination', 'item_material', 'item_material_destination', 'type', 'qty', 'notes'])
            let requestBody = {
                businessDestination: parseFloat(req.body.business_destination),
                itemMaterial: parseFloat(req.body.item_material),
                itemMaterialDestination: parseFloat(req.body.item_material_destination),
                type: parseFloat(req.body.type),
                qty: parseFloat(req.body.qty),
                notes: req.body.notes
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/stock/transferV3/getConnection')


        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/stock/transferV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
    
                let requestBody = convertBody()!
                if (res.headersSent) return
                
                let itemMaterialPrice = 0
                let itemMaterialUnit = 0
                let itemMaterialDestinationPrice = 0
                let itemMaterialDestinationUnit = 0
    
                if (requestBody.type === 1) {
                    let resCheckStock = await functionItem.getQty({res, connection}, {fk_business: user.business, i_code: requestBody.itemMaterial})
                    if (!resCheckStock) return res.status(400).json({success: false, message: 'Item not found.'})
                    if (resCheckStock.qty < requestBody.qty) return res.status(400).json({success: false, message: 'Insufficient stock.'})
    
                    let resGetPricenetAndUnit = await functionItem.getPricenetNUnit({res, connection}, {i_code: requestBody.itemMaterial, fk_business: user.business})
                    itemMaterialPrice = resGetPricenetAndUnit.price_net
                    itemMaterialUnit = resGetPricenetAndUnit.unit
                    
                    let resGetDestinationPricenetAndUnit = await functionItem.getPricenetNUnit({res, connection}, {i_code: requestBody.itemMaterialDestination, fk_business: requestBody.businessDestination})
                    itemMaterialDestinationPrice = resGetDestinationPricenetAndUnit.price_net
                    itemMaterialDestinationUnit = resGetDestinationPricenetAndUnit.unit
                } else {
                    let resCheckStock = await functionMaterial.getQty({res, connection}, {fk_business: user.business, i_code: requestBody.itemMaterial})
                    if (!resCheckStock) return res.status(400).json({success: false, message: 'Item not found.'})
                    if (resCheckStock.qty < requestBody.qty) return res.status(400).json({success: false, message: 'Insufficient stock.'})
    
                    let resGetPricenetAndUnit = await functionMaterial.getPricenetNUnit({res, connection}, {fk_business: user.business, i_code: requestBody.itemMaterial}) 
                    itemMaterialPrice = resGetPricenetAndUnit.price_net
                    itemMaterialUnit = resGetPricenetAndUnit.unit
    
                    let resGetDestinationPricenetAndUnit = await functionMaterial.getPricenetNUnit({res, connection}, {i_code: requestBody.itemMaterialDestination, fk_business: requestBody.businessDestination})
                    itemMaterialDestinationPrice = resGetDestinationPricenetAndUnit.price_net
                    itemMaterialDestinationUnit = resGetDestinationPricenetAndUnit.unit
                }
    
                await functionStockReport.insert({res, connection}, {
                    b_source: 4,
                    b_type: requestBody.type,
                    fk_business: user.business,
                    fk_itemmaterial: requestBody.itemMaterial,
                    qty: requestBody.qty * -1,
                    i_price: itemMaterialPrice,
                    notes: requestBody.notes
                })
    
                await functionStockTransfer.insert({res, connection}, {
                    b_type: requestBody.type,
                    fk_businessdestination: req.body.business_destination,
                    fk_businessorigin: user.business,
                    fk_itemmaterialdestination: req.body.item_material_destination,
                    fk_itemmaterialorigin: req.body.item_material,
                    fk_unitdestination: itemMaterialDestinationUnit,
                    fk_unitorigin: itemMaterialUnit,
                    fk_usersent: user.code,
                    i_qtysent: requestBody.qty,
                    v_notes: requestBody.notes
                })
    
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/stock/transferV3/commit')
    
                    return res.status(200).json({success: true, message: "Stock transfered successfully."})
                 })
    
            } catch (err) {
                return errors.rollback(connection, res, err, 'controller/stock/transferV3')
            }
        })
    })
}