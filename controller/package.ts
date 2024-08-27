import { Request, Response } from "express"

import pool from "../config/connect"
import * as errors from "../function/global_function"

//========== Types ===================
import * as typeGlobal from '../type/global'
import * as typePackage from '../type/package'

//========== Functions ===============
import * as functionPackage from '../function/master/package'
import * as functionProduct from '../function/master/product'
import * as functionUser from '../function/account/user'
import { User } from "../type/user"

export async function oldSelectV3(req: typePackage.selectV3, res: Response) {
    pool.getConnection(async function (err, connection) {

        let responseBody: Array<any> = []
        if (err) return errors.rollback(connection, res, err, 'controller/Package/getV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            let resGetPackage = await functionPackage.get({ res, connection }, { fk_business: user.business })
            if (resGetPackage.length > 0) {
                for (let eachPackage of resGetPackage) {
                    let tempEachPackage: any = eachPackage
                    let resGetSelectDetail = await functionPackage.selectDetail({ res, connection }, { code: eachPackage.code })
                    tempEachPackage.detail = resGetSelectDetail

                    let resGetSelectOrder = await functionPackage.selectOrder({ res, connection }, { code: eachPackage.code })
                    tempEachPackage.price_distributor = resGetSelectOrder
                    responseBody.push(tempEachPackage);
                }
            }
            return res.status(200).json({ success: true, message: "OK", data: responseBody })
        } catch {
            return errors.rollback(connection, res, err, 'controller/Package/selectV3')
        }
    })
}

type selectV3Request = Omit<Request, 'body'> & {
    user: User
}
export async function selectV3(req: selectV3Request, res: Response) {
    //TODO 1
}

export async function oldDeleteV3(req: typePackage.deleteV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/package/deleteV3/getConnection')

        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/package/deleteV3/beginTransaction')
                let resDeletePackage = await functionPackage.remove({ res, connection }, { code: parseFloat(req.body.code), fk_business: user.business, fk_user_modify: user.code })
                if (resDeletePackage.affectedRows! < 1) return res.status(400).json({ success: false, message: "Data not found" })
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/package/deleteV3/commit')
                    return res.status(200).json({ success: true, message: "OK", data: resDeletePackage })
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/package/deleteV3')
        }
    })
}

type deleteV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string
    }
}
export async function deleteV3(req: deleteV3Request, res: Response) {
    //TODO 2
}

export async function oldInsertV3(req: typePackage.insertV3, res: Response) {

    req.body.use_price_distributor = req.body.use_price_distributor ?? "0"
    req.body.price_distributor = req.body.price_distributor ?? ""
    let price_distributor: Array<any> = []
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/package/insertV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/package/insertV3/beginTransaction')
                let resGetPackage = await functionPackage.selectPackage({ res, connection }, { fk_business: user.business, name: req.body.name, code: 0 })
                if (resGetPackage.length > 0) return res.status(200).json({ success: true, message: `Data already added.`, data: [] })
                let resInsertGetPackage = await functionPackage.insert({ res, connection }, { fk_business: user.business, name: req.body.name, notes: req.body.notes, price1: req.body.price1, price2: req.body.price2, price3: req.body.price3, price4: req.body.price4, price5: req.body.price5, usePriceDistributor: parseFloat(req.body.use_price_distributor), fk_user_modify: user.code })
                if (req.body.price_distributor != "") {
                    price_distributor = JSON.parse(req.body.price_distributor);
                    for (let i = 0; i < price_distributor.length; i++) {
                        let minOrder: any = price_distributor[i]["min_order"]
                        let price: any = price_distributor[i]["price"]
                        let resInsert = await functionPackage.insertPrice({ res, connection }, { id: resInsertGetPackage.insertId, minOrder: minOrder, price: price, fk_user_modify: user.code })
                        if (resInsert.affectedRows == 0) return res.status(200).json({ success: true, message: `Insert price failed.`, data: [] })
                    }
                }
                let priceNet: number = 0
                let details = JSON.parse(req.body.detail);
                for (let detail of details) {
                    let itemCode = detail["item_code"]
                    let itemName = await functionProduct.getName({res, connection}, {i_code: itemCode})
                    if (itemName == undefined) return res.status(200).json({success: false, message: `Terdapat data produk yang tidak valid.`})
                    let itemQty = detail["qty"]
                    let resPriceNet = await functionPackage.selectPriceNet({ res, connection }, { itemCode: itemCode })

                    if (resPriceNet.length > 0) {
                        if (parseFloat(req.body.duplicate) === 1) {
                            let resProductGetCodeInOtherBusiness = await functionProduct.getCodeInOtherBusiness({res, connection}, {i_code: itemCode, otherBusiness: {i_code: user.business}})
                            if (!resProductGetCodeInOtherBusiness) {
                                connection.rollback((err) => {
                                    return res.status(200).json({success: false, message: `Produk ${itemName.name} tidak terdapat pada bisnis ${user.business_name}`})
                                })
                                return
                            }
                            let resInsertPackageDetail = await functionPackage.insertPackageDetail({ res, connection }, { fk_business: user.business, id: resInsertGetPackage.insertId, itemCode: resProductGetCodeInOtherBusiness.code, qty: itemQty, fk_user_modify: user.code })
                            if (resInsertPackageDetail.affectedRows == 0) {
                                connection.rollback((err) => {
                                    return res.status(200).json({ success: true, message: `Gagal menambahkan detil paket.`, data: [] })
                                })
                                return
                            }
                            for (let priceNets of resPriceNet) {
                                priceNet += parseFloat(priceNets.price_net) * parseFloat(itemQty);
                            }
                        }
                        else {
                            let resInsertPackageDetail = await functionPackage.insertPackageDetail({ res, connection }, { fk_business: user.business, id: resInsertGetPackage.insertId, itemCode: itemCode, qty: itemQty, fk_user_modify: user.code })
                            if (resInsertPackageDetail.affectedRows == 0) {
                                connection.rollback((err) => {
                                    return res.status(200).json({ success: true, message: `Gagal menambahkan detil paket.`, data: [] })
                                })
                                return
                            }
                            for (let priceNets of resPriceNet) {
                                priceNet += parseFloat(priceNets.price_net) * parseFloat(itemQty);
                            }
                        }
                    }
                }

                let resUpdatePackage = await functionPackage.updatePackage({ res, connection }, { fk_business: user.business, id: resInsertGetPackage.insertId, priceNet: priceNet, fk_user_modify: user.code })
                if (resUpdatePackage.affectedRows == 0) {
                    connection.rollback((err) => {
                        return res.status(200).json({ success: true, message: `Gagal memperbarui paket.`, data: [] })
                    })
                    return
                }
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/package/insertV3/commit')
                    return res.status(200).json({ success: true, message: `Data added.`, data: resInsertGetPackage })
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/package/insertV3')
        }
    })
}

type insertV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        name: string,
        price1: string, 
        price2: string,
        price3: string,
        price4: string,
        price5: string,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: string,
        duplicate: string
    }
}
export async function insertV3(req: insertV3Request, res: Response) {
    //TODO 3
    return res.status(200).json({success: true, message: 'ok'})
}

export async function oldUpdateV3(req: typePackage.updateV3, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/package/updateV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/package/updateV3/beginTransaction')

                let resGetPackage = await functionPackage.selectPackage({ res, connection }, { fk_business: user.business, name: req.body.name, code: parseFloat(req.body.code) })
                if (resGetPackage.length > 0) {
                    connection.rollback((err) => {
                        return res.status(200).json({ success: true, message: `Nama paket telah digunakan.`, data: [] })
                    })
                    return
                }

                let resUpdateNamePackage = await functionPackage.updateNamePackage({ res, connection }, { fk_business: user.business, name: req.body.name, notes: req.body.notes, code: parseFloat(req.body.code), fk_user_modify: user.code })
                if (resUpdateNamePackage.affectedRows == 0) {
                    connection.rollback((err) => {
                        return res.status(200).json({ success: true, message: `Gagal memperbarui paket.`, data: [] })
                    })
                    return
                }
                
                let resUpdatePackageDetail = await functionPackage.updatePackageDetail({ res, connection }, { fk_business: user.business, code: parseFloat(req.body.code), fk_user_modify: user.code })
                
                let priceNet: number = 0
                let details = JSON.parse(req.body.detail);
                for (let detail of details) {
                    let itemCode = detail["item_code"]
                    let itemName = await functionProduct.getName({res, connection}, {i_code: itemCode})
                    if (itemName == undefined) {
                        connection.rollback((err) => {
                            return res.status(200).json({success: false, message: `Terdapat data produk yang tidak valid.`})
                        })
                        return
                    }
                    let itemQty = detail["qty"]
                    let resPriceNet = await functionPackage.selectPriceNet({ res, connection }, { itemCode: itemCode })

                    if (resPriceNet.length > 0) {
                        if (parseFloat(req.body.duplicate) === 1) {
                            let resProductGetCodeInOtherBusiness = await functionProduct.getCodeInOtherBusiness({res, connection}, {i_code: itemCode, otherBusiness: {i_code: user.business}})
                            if (!resProductGetCodeInOtherBusiness) {
                                connection.rollback((err) => {
                                    return res.status(200).json({success: false, message: `Produk ${itemName.name} tidak terdapat pada bisnis ${user.business_name}`})
                                })
                                return
                            }
                            let resInsertPackageDetail = await functionPackage.insertPackageDetail({ res, connection }, { fk_business: user.business, id: parseFloat(req.body.code), itemCode: resProductGetCodeInOtherBusiness.code, qty: itemQty, fk_user_modify: user.code })
                            if (resInsertPackageDetail.affectedRows == 0) {
                                connection.rollback((err) => {
                                    return res.status(200).json({ success: true, message: `Gagal menambahkan detil paket.`, data: [] })
                                })
                                return
                            }
                            for (let priceNets of resPriceNet) {
                                priceNet += parseFloat(priceNets.price_net) * parseFloat(itemQty);
                            }
                        } else {
                            let resInsertPackageDetail = await functionPackage.insertPackageDetail({ res, connection }, { fk_business: user.business, id: parseFloat(req.body.code), itemCode: itemCode, qty: itemQty, fk_user_modify: user.code })
                            if (resInsertPackageDetail.affectedRows == 0) {
                                connection.rollback((err) => {
                                    return res.status(200).json({ success: true, message: `Gagal menambahkan detil paket.`, data: [] })
                                })
                                return
                            }
                            for (let priceNets of resPriceNet) {
                                priceNet += parseFloat(priceNets.price_net) * parseFloat(itemQty);
                            }
                        }
                    }
                }

                let resUpdatePackage = await functionPackage.updatePackage({ res, connection }, { fk_business: user.business, id: parseFloat(req.body.code), priceNet: priceNet, fk_user_modify: user.code })
                if (resUpdatePackage.affectedRows == 0) {
                    connection.rollback((err) => {
                        return res.status(200).json({ success: true, message: `Failed Update Package`, data: [] })
                    })
                    return
                }
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/package/updateV3/commit')
                    return res.status(200).json({ success: true, message: `Update Success`, data: [] })
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/package/updateV3')
        }
    })
}

type updateV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string,
        name: string,
        price1: string, 
        price2: string,
        price3: string,
        price4: string,
        price5: string,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: string,
        duplicate: string
    }
}
export async function updateV3(req: updateV3Request, res: Response) {
    //TODO 4
}

export async function oldUpdatePriceV3(req: typePackage.updatePriceV3, res: Response) {
    let price_distributor: Array<any> = []

    req.body.price_distributor = req.body.price_distributor ?? ""
    req.body.use_price_distributor = req.body.use_price_distributor ?? ""

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/package/updatePriceV3/getConnection')
        try {
            let user = await functionUser.checkToken({ res, connection }, { hash: req.headers["x-auth-token"] })
            if (!user) return res.status(401).json({ success: false, message: "Credential not valid." })

            connection.beginTransaction(async function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/package/updatePriceV3/beginTransaction')
                let resUpdateNamePackage = await functionPackage.updatePackagePrice({ res, connection }, { fk_business: user.business, code: parseFloat(req.body.code), fk_user_modify: user.code })
                // if (resUpdateNamePackage.affectedRows == 0) return res.status(200).json({ success: true, message: `Failed Update Package Price (Update Name)`, data: [] })
                let resUpdatePackageDetail = await functionPackage.updateInsertPrice({ res, connection }, { fk_business: user.business, code: parseFloat(req.body.code), price: req.body.price, price2: req.body.price2, price3: req.body.price3, price4: req.body.price4, price5: req.body.price5, fk_user_modify: user.code })
                if (resUpdatePackageDetail.affectedRows == 0) return res.status(200).json({ success: true, message: `Update package price failed.`, data: [] })
                if (req.body.use_price_distributor != "") {
                    let resUpdatePackageDistribution = await functionPackage.updatePackageDistributor({ res, connection }, { fk_business: user.business, code: parseFloat(req.body.code), usePriceDistributor: parseFloat(req.body.use_price_distributor), fk_user_modify: user.code })
                    if (req.body.price_distributor != "") {
                        price_distributor = JSON.parse(req.body.price_distributor);
                        let resDeletePackageDistribution = await functionPackage.deletePackageDistributor({ res, connection }, { code: parseFloat(req.body.code) })
                        for (let i = 0; i < price_distributor.length; i++) {
                            let minOrder: any = price_distributor[i]["min_order"]
                            let price: any = price_distributor[i]["price"]
                            let resInsert = await functionPackage.insertPrice({ res, connection }, { id: parseFloat(req.body.code), minOrder: minOrder, price: price, fk_user_modify: user.code })
                            if (resInsert.affectedRows == 0) return res.status(200).json({ success: true, message: `Insert price failed.`, data: [] })
                        }
                    }
                }
                if (req.body.price_net_manual == 1) {
                    let resUpdatePackage = await functionPackage.updatePackage({ res, connection }, { fk_business: user.business, id: parseFloat(req.body.code), priceNet: req.body.price_net, fk_user_modify: user.code })
                    if (resUpdatePackage.affectedRows == 0) return res.status(200).json({ success: true, message: `Update package failed.`, data: [] })
                }
                connection.commit(function (err) {
                    if (err) return errors.rollback(connection, res, err, 'controller/package/updatePriceV3/commit')
                    return res.status(200).json({ success: true, message: `Update price success.`, data: [] })
                })
            })
        } catch {
            return errors.rollback(connection, res, err, 'controller/package/updatePriceV3')
        }
    })
}

type updatePriceV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string,
        name: string,
        price: string, 
        price2: string,
        price3: string,
        price4: string,
        price5: string,
        notes: string, 
        detail: string,
        use_price_distributor: string,
        price_distributor: string,
        mobile: string,
        price_net_manual: string,
        price_net: string
    }
}
export async function updatePriceV3(req: updatePriceV3Request, res: Response) {
    //TODO 5
}