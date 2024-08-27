import pool from '../config/connect'
import * as errors from '../function/global_function'
import { Response, response } from 'express'

import * as typeGlobal from '../type/global'
import * as typeStockOpname from '../type/stockopname'

import * as functionGlobal from '../function/global_function'
import * as functionUser from '../function/account/user'
import * as functionStockOpname from '../function/operational/stockopname'
import * as functionStockOpnameDetail from '../function/operational/stockopname_detail'
import * as functionStockReport from '../function/operational/stockreport'
import { randomUUID } from 'crypto'
import { error } from 'console'

export function selectV3(req: typeStockOpname.selectV3, res: Response) {

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/stockopname/select')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

            let responseBody:any = []
            let resSelectStockOpnames = await functionStockOpname.select({res, connection}, {fk_business: user.business, dt_created: {date_start: req.body.date_start, date_end: req.body.date_end}})
            for (let eachStockOpname of resSelectStockOpnames) {
                let resGetDetails = await functionStockOpnameDetail.getByStockOpnameId({res, connection}, {fk_business: user.business, fk_stockopname: eachStockOpname.id})
                responseBody.push({...eachStockOpname, qty: resGetDetails.length})
            }

            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/stockopname/select')
        }
    })
}

export function insertV3(req: typeStockOpname.insertV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['items'])
            let requestBody = {
                items: <Array<{
                    id: any,
                    type: any
                }>>errors.handleJSONRequestBody('items',req.body.items,true)
            }
            
            for (let eachItem of requestBody.items) {
                errors.checkField(eachItem, ['id', 'type'])
                eachItem.id = parseFloat(eachItem.id)
                eachItem.type = parseFloat(eachItem.type)
                errors.checkNaN(eachItem)
            }

            return requestBody
        } catch(err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/stock/insertV3/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/stock/insertV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
                if (!user) return res.status(401).json({success: false, message: "Credential not valid."})
                
                let requestBody = convertBody()!
                if (res.headersSent) return

                //Check unprocessed item in other stockopname
                let itemsId = []
                let materialsId = []
                for (let eachitem of requestBody.items) {
                    if (eachitem.type === 1) itemsId.push(eachitem.id)
                    else if (eachitem.type === 2) materialsId.push(eachitem.id)
                }

                let resItems = await functionStockOpnameDetail.getUnprocessedItemByItemId({connection, res}, {fk_business: user.business, fk_itemS: itemsId})
                let resMaterials = await functionStockOpnameDetail.getUnprocessedItemByMaterialId({connection, res}, {fk_business: user.business, fk_itemS: materialsId})
                let resItemsAndMaterials = resItems.concat(resMaterials)
                if (resItemsAndMaterials.length > 0) {
                    let generatedMessage = 'Terdapat item yang belum terselesaikan. Mohon selesaikan transaksi item : ' + resItemsAndMaterials.map((item) => `['${item.item_name}' pada tanggal '${item.date_created}']`).join(', ')
                    return res.status(400).json({
                        success: false, 
                        message: generatedMessage
                    })
                }

                let stockOpnameHeaderId = randomUUID()
                await functionStockOpname.insert({res, connection}, {v_hash: stockOpnameHeaderId, fk_business: user.business, fk_user: user.code})
                
                for (let eachItem of requestBody.items) {
                    let stockOpnameDetailId = randomUUID()
                    await functionStockOpnameDetail.insert({res, connection}, {fk_item: eachItem.id, fk_stockopname: stockOpnameHeaderId, v_hash: stockOpnameDetailId, b_type: eachItem.type})
                }
    
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/stockopname/insertV3/commit')

                    return res.status(200).json({success: true, message: "Stock Opname created successfully.", data: {
                        insertId: stockOpnameHeaderId
                    }})
                })
            } catch (err) {
                return errors.rollback(connection, res, err, 'controller/stockopname/insertV3')
            }
        })
    })

}

export function getDetailV3 (req: typeStockOpname.getDetailV3, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['id'])
            let requestBody = {
                id: req.body.id
            }
            return requestBody
        } catch (err: any){
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/stockopname/getV3')

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: 'Credential not found.'})

            let requestBody = convertBody()!
            if (res.headersSent) return
            let responseBody: Array<Partial<{
                    id: string,
                    item: {
                        id: number,
                        type: number,
                        name: string,
                        qty: number,
                        price: number,
                        hpp: number,
                        qty_system: number
                    },
                    date_input: string
            }>> = []

            let resGetStockOpnameDetail = await functionStockOpnameDetail.getByStockOpnameId({res, connection}, {fk_business: user.business, fk_stockopname: requestBody.id})
            for (let eachDetail of resGetStockOpnameDetail) {
                responseBody.push({
                    id: eachDetail.id,
                    item: {
                        id: eachDetail.item_id,
                        type: eachDetail.item_type,
                        name: eachDetail.item_name,
                        hpp: eachDetail.item_hpp,
                        price: eachDetail.item_price,
                        qty: eachDetail.item_qty,
                        qty_system: eachDetail.item_qty_system
                    },
                    date_input: eachDetail.date_input
                })
            }
            return res.status(200).json({success: true, message: "OK", data: responseBody})
        } catch {
            return errors.rollback(connection, res, err, 'controller/stockopname/getV3')
        }
    })
}
export function updateDetailV3 (req: typeStockOpname.updateDetailV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['id_stockopname_detail', 'qty', 'date_input'])
            let requestBody = {
                id_stockopname_detail: req.body.id_stockopname_detail,
                qty: parseFloat(req.body.qty),
                date_input: req.body.date_input
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/stockopname/updateDetailV3/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/stockopname/updateDetailV3/beginTransaction')

            try {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
                if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

                let requestBody = convertBody()!
                if (res.headersSent) return

                let resGetDetail = await functionStockOpnameDetail.get({res, connection}, {v_hash: requestBody.id_stockopname_detail})
                if (!resGetDetail) return res.status(400).json({success: false, message: 'Stock Opname Detail not found.'})

                await functionStockOpnameDetail.updateQTYNDateinput({res, connection}, {v_hash: requestBody.id_stockopname_detail, i_qty: requestBody.qty, dt_input: requestBody.date_input})
                
                //Penyesuaian stok
                if (resGetDetail.item_qty_system !== requestBody.qty) {
                    await functionStockReport.insert({res, connection}, {b_source: 3, b_type: resGetDetail.item_type, fk_business: user.business, fk_itemmaterial: resGetDetail.item_code, fk_user: user.code, qty: (requestBody.qty - resGetDetail.item_qty_system)})
                }
                
                let resCheckUnprocessedItem = await functionStockOpnameDetail.getUnprocessedItemByFKStockOpname({res, connection}, {fk_stockopname: resGetDetail.stockopname_id})
                if (resCheckUnprocessedItem.length === 0) await functionStockOpname.updateStatus({res, connection}, {v_hash: resGetDetail.stockopname_id, b_status: 2})

                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/stockopname/updateDetailV3/commit')

                    return res.status(200).json({success: true, message: 'Stock Opname Detail updated.'})
                })
            } catch {
                return errors.rollback(connection, res, err, 'controller/stockopname/updateDetailV3')
            }
        })
    })
}