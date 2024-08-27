import pool from "../config/connect"

import * as typeTransaction from '../type/transaction'
import * as typeCategory from '../type/category'
import * as typeBusiness from '../type/business'
import * as errors from "../function/global_function"

import * as functionBusiness from '../function/account/business'
import * as functionGlobal from '../function/global_function'
import { Request, Response } from "express"
import PoolConnection from "mysql2/typings/mysql/lib/PoolConnection"
import * as functionPaymentMethod from '../function/master/paymentmethod'
import * as functionDuplicate from "../function/transaction/duplicate"
import * as functionTransaction from "../function/transaction/transaction"
import * as functionSalestype from "../function/master/sales_type"
import * as functionMonitorOrder from "../function/transaction/monitor_order"
import * as functionTransactionDetail from "../function/transaction/transactiondetail"
import * as functionItem from "../function/master/item"
import * as functionTransactionAdditional from "../function/transaction/transactionadditional"
import * as functionAdditional from "../function/master/additional"
import * as functionTransactionPromotiondetail from "../function/transaction/transactionpromotiondetail"
import * as functionCommision from "../function/transaction/commision"
import * as functionMonitorOrderDetail from "../function/transaction/monitor_order_detail"
import * as functionLaundryTransactionRun from "../function/laundry/laundrytransactionrun"
import * as functionTransactionPromotion from "../function/transaction/transactionpromotion"
import * as functionTransactionPayment from "../function/transaction/transactionpayment"
import * as functionUser from "../function/account/user"
import * as functionBusinessWhatsapp from "../function/account/business_whatsapp"

import moment from "moment"
import * as functionEmployee from "../function/master/employee"
import { machine } from "os"
const sha1 = require('sha1')
const uniqid = require('uniqid')

import * as transaction from '../function/transaction/transaction'
import * as typeGlobal from '../type/global'
import { globalHandler } from "../function/global"
import { executeQuery, startTransaction } from "../util/mysql"
import { User } from "../type/user"

type get = typeGlobal.requestV3 & {
    body: {
        receipt?: string,
        date_start?: string,
        date_end?: string,
        checkin?: string,
    }
}
export async function get(req: get, res: any) {
    pool.getConnection(async function(err, connection) {
        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: "User not valid"})

        var results:transaction.get[] = await transaction.get({
            connection: connection,
            res: res
        },{
            business: user.business,
            date_start: req.body.date_start,
            date_end: req.body.date_end,
            receipt: req.body.receipt,
            checkin: req.body.checkin
        });
        
        if (results.length > 0){
            for (let i = 0; i < results.length; i++) {
                var resultDetails:transaction.getDetail[] = await transaction.getDetail({
                    connection: connection,
                    res: res
                },{
                    transaction: results[i].code
                });

                results[i].detail = resultDetails
            }
        }

        res.status(200).json({
            success: true, 
            message: "OK", 
            info: {
                total: results.length
            },
            data: results
        });

        connection.release();
    })
}


type checkin = typeGlobal.requestV3 & {
    body: {
        code: number,
        date: string
    }
}
export async function checkin(req: checkin, res: any) {
    pool.getConnection(async function(err, connection) {
        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: "User not valid"})

        var results = await transaction.checkin({
            connection: connection,
            res: res
        },{
            code: req.body.code,
            date: req.body.date
        });

        
        res.status(200).json({
            success: true, 
            message: "OK", 
        });
        connection.release();
    })
}





function endProgram (res:any) {
    res.status(200).json({
        code: 200,
        success: true,
        message: "ok",
        data: []
    })
}

export async function saveTransaction({body: saveTransaction}: typeTransaction.saveTransaction, res: any) {

    let data: any = {}
    let canAdd: boolean = false
    let canDuplicate: boolean = false
    let insertTransactionId: number
    let insertTransactionIdDuplicate: number
    let insertTransactionDetailId: string
    let monitorOrderId: string
    let paymentName: string
    let businessCode: number

    let success = false
    let total = 0
    let totalpromotion = 0
    let vatnominal = 0
    let scnominal = 0
    let totalnet = 0
    let paid = false
    let issplit = false
    let totalDuplicate = 0
    let queryTest = ""

    let globalItem = {
        alias: "",
        name: ""
    }
    let globalItemDetail = <{sku: string, price: number, quantity: number}>{}
    
    async function handleBusinessDuplicateFeature(connection: PoolConnection, fkBusinessDuplicate: number, maxDuplicate: number, monitorOrder: number, payments: typeTransaction.saveTransactionPayment[]) {
        let paymentMethodSystemCode: number = 0
        for (let payment of payments) {
            let tempPaymentMethodSystemCode = (await functionPaymentMethod.getPaymentMethodSystemCode({connection, res, code: parseInt(payment.paymentCode)})).fkPaymentMethodSystem
            if (tempPaymentMethodSystemCode && paymentMethodSystemCode < tempPaymentMethodSystemCode) paymentMethodSystemCode = tempPaymentMethodSystemCode
        }

        if (paymentMethodSystemCode === 1) {
            let {resultCount} = await functionDuplicate.getDuplicateCount({res, connection, fk_business: fkBusinessDuplicate, dt_duplicate: saveTransaction.datepaid})
           
            if (resultCount >= 3) resultCount = 0
            else canDuplicate = false
            
            resultCount++;
            await functionDuplicate.updateDuplicateCount({res, connection, dt_duplicate: saveTransaction.datepaid,  count: resultCount, fk_business: fkBusinessDuplicate})
        }
        else canDuplicate = false

        if (canDuplicate) {
            let {resultTotal} = await functionTransaction.getTransactionTotalNet({res, connection, fk_business: fkBusinessDuplicate, dt_paid: saveTransaction.datepaid})
            if (resultTotal > maxDuplicate) {
                let {code: codeDeleted, paymentMethodSystem} = await functionTransaction.getExistingTransaction({res, connection, fk_business: fkBusinessDuplicate, dt_paid: saveTransaction.datepaid})
                if (codeDeleted) {
                    await functionTransaction.softDeleteTransaction({res, connection, code: codeDeleted})
                }
                else if (paymentMethodSystem === 1) canDuplicate = false
            }
        }
    }

    async function handleMonitorOrderFeature(connection: PoolConnection) {
        monitorOrderId = functionGlobal.hashText(uniqid(), 4)
        await functionMonitorOrder.insertMonitorOrder({res, connection}, {
            code: monitorOrderId,
            customer: saveTransaction.customername,
            dt_created: saveTransaction.date,
            fk_business: parseInt(saveTransaction.business),
            fk_transaction: insertTransactionId,
            guest: saveTransaction.guest,
            receipt: saveTransaction.offlinecode
        })
    }

    async function handleLaundryFeature(connection: PoolConnection) {
        let isWashMachine = (globalItem.alias).indexOf("WM") >= 0
        let isWashMachine2 = (globalItem.alias).indexOf("WM-WM") >= 0
        let isDryMachine = (globalItem.alias).indexOf("DM") >= 0
        let isDryMachine2 = (globalItem.alias).indexOf("DM-DM")
        if (isWashMachine) await functionLaundryTransactionRun.insert({res, connection}, {offlinecode: saveTransaction.offlinecode, machinetype: "WM"})
        if (isWashMachine2) await functionLaundryTransactionRun.insert({res, connection}, {offlinecode:saveTransaction.offlinecode, machinetype: "WM" })
        if (isDryMachine) await functionLaundryTransactionRun.insert({res, connection}, {offlinecode: saveTransaction.offlinecode, machinetype: "DM"})
        if (isDryMachine2) await functionLaundryTransactionRun.insert({res, connection}, {offlinecode: saveTransaction.offlinecode, machinetype: "DM"})
    }

    async function handleTransactionDetail(connection: PoolConnection, fkBusinessDuplicate: number, monitorOrder: number, laundry: number, items: typeTransaction.saveTransactionItem[]) {
        for (let item of items) {
            let subtotal = 0
            let subtotalPromotion = 0
            
            let itemcode = parseInt(item.code)
            let alias = item.customcode
            let itemprice = parseFloat(item.sellingprice)
            let itemqty = parseFloat(item.qty)
            let preference = item.preferences
            let unit = parseInt(item.unit) ?? 0
            let isvoid = parseInt(item.isvoid) ?? 0
            let dtvoid = item.dtvoid ?? ""
            let voidby = item.voidby ?? ""
            let voidreason = item.voidreason ?? ""
            let isprinted = parseInt(item.isprinted) ?? 0
            let ispaid = parseInt(item.ispaid) ?? 0
            let type = parseInt(item.ispackage) ?? 1

            if(itemprice == 2500){
                itemcode = 666399
                ispaid = 1
                isvoid = 0
            }

            let additional: typeTransaction.saveTransactionItemAdditional[], promotion: typeTransaction.saveTransactionItemPromotion[], employee: typeTransaction.saveTransactionItemEmployee[]
            try {additional = JSON.parse(item.additional)} catch {additional = []}
            try {promotion = JSON.parse(item.promotion)} catch {promotion = []}
            try {employee = JSON.parse(item.employee)} catch {employee = []}

            type += 1
            queryTest = `INSERT INTO vw_transactiondetail(fk_business, fk_transaction, fk_item, fk_unit,i_qty, i_price, v_preference, v_createdby, dt_created, v_paidby, b_isvoid, dt_void, v_voidby, b_isprinted, b_type, b_ispaid, v_voidreason)
                        VALUES (${parseInt(saveTransaction.business)}, ${insertTransactionId}, ${itemcode}, ${unit}, ${itemqty}, ${itemprice}, ${preference}, ${saveTransaction.server}, ${saveTransaction.date}, ${saveTransaction.paidby}, ${isvoid}, ${dtvoid}, ${voidby}, ${isprinted}, ${type}, ${ispaid} ${voidreason})`
            insertTransactionDetailId = (await functionTransactionDetail.insertTransactionDetail({res, connection}, {
                createdby: saveTransaction.server, 
                dt_created: saveTransaction.date, 
                dt_void: dtvoid, 
                fk_business: parseInt(saveTransaction.business),
                fk_item: itemcode, 
                fk_transaction: insertTransactionId, 
                fk_unit: unit, 
                ispaid: ispaid, 
                isprinted: isprinted, 
                isvoid: isvoid, 
                paidby: saveTransaction.paidby, 
                preference: preference, 
                price: itemprice, 
                qty: itemqty, 
                type: type, 
                voidby: voidby, 
                voidreason: voidreason})
            ).insertId

            if(canDuplicate) {
                let {code: itemDetailCode, fkUnit: unitDuplicate} = await functionItem.getCodeAndFirstUnit({res, connection, fk_business: fkBusinessDuplicate, code: itemcode})
                let qtyDuplicate = itemqty
                let priceDuplicate = itemprice
                let notesDuplicate = preference
                
                await functionTransactionDetail.insertTransactionDetail({res, connection}, {fk_business: fkBusinessDuplicate, fk_transaction: insertTransactionIdDuplicate, fk_item: itemDetailCode, fk_unit: unitDuplicate, qty: qtyDuplicate, price: priceDuplicate, preference: notesDuplicate, createdby: "Kasir", dt_created: saveTransaction.datepaid, paidby: "Kasir", isvoid: 0, dt_void: "", voidby: "", isprinted: 1, type: 1, ispaid: 1, voidreason: ""})
                totalDuplicate += priceDuplicate * qtyDuplicate
            }

            if (type === 2) {
                await functionTransactionDetail.insertTransactionDetailForPackage({res, connection}, {fk_business: parseInt(saveTransaction.business), fk_transaction: insertTransactionId, createdby: saveTransaction.server, dt_created: saveTransaction.date, paidby: saveTransaction.paidby, isvoid: isvoid})
            }

            let monitorAdditional = ''
            for (let eachAdditional of additional) {
                let additionalCode = parseInt(eachAdditional.additionalCode)
                let additionalPrice = parseInt(eachAdditional.additionalPrice)
                let additionalQty = parseInt(eachAdditional.additionalQty)

                if (isvoid === 0)
                subtotal = subtotal + (additionalPrice * additionalQty)

                await functionTransactionAdditional.insertTransactionAdditional({res, connection}, {
                    fk_business: parseInt(saveTransaction.business),
                    fk_transaction: insertTransactionId,
                    fk_transactiondetail: insertTransactionDetailId,
                    fk_additional: additionalCode,
                    price: additionalPrice,
                    qty: additionalQty,
                    createdby: saveTransaction.server,
                    dt_created: saveTransaction.date 
                })

                let responseAdditional = await functionAdditional.getAdditionalName({res, connection}, {code: additionalCode, fk_business: parseInt(saveTransaction.business)})
                if (responseAdditional) {
                    if (monitorAdditional !== "") monitorAdditional += "\n"
                    monitorAdditional += additionalQty + " x " + responseAdditional.name
                }
            }

            for (let eachPromotion of promotion) {
                let promotionCode = parseInt(eachPromotion.promotionCode)
                let promotionValue = parseInt(eachPromotion.promotionValue)
                let promotionType = parseInt(eachPromotion.promotionType)
                let promotionMinimumSpend = parseInt(eachPromotion.promotionMinimumSpend)
                let promotionMaximumPromo = parseInt(eachPromotion.promotionMaximumPromo)

                let promotionNominal = promotionValue
                if (promotionType === 1) {
                    promotionNominal = itemprice * promotionNominal / 100
                    promotionNominal = Math.round(promotionNominal)
                }
                else if (promotionType === 3) {
                    promotionNominal = 0
                    promotionValue = 0
                }
                else if (promotionType === 4) {
                    promotionNominal = promotionValue
                    promotionValue = promotionValue
                }
                else {
                    if (itemprice < promotionValue) {
                        promotionNominal = itemprice
                        promotionValue = itemprice
                    }
                }
                
                if (promotionType !== 4) {
                    if (promotionNominal > promotionMaximumPromo && promotionMaximumPromo > 0) 
                        promotionNominal = promotionMaximumPromo
                }

                let canUse = true
                if (isvoid === 0 && promotionType !== 4) {
                    if (itemprice * itemqty < promotionMinimumSpend) canUse = false
                    else subtotalPromotion = subtotalPromotion + promotionNominal
                }

                if (canUse) {
                    let test = promotionType + '-' + itemprice + '-' + promotionNominal + '-' + promotionValue + '-' + promotionMaximumPromo + '-';
                    await functionTransactionPromotiondetail.insertTransactionPromotionDetail({res, connection}, {
                        fk_business: parseInt(saveTransaction.business),
                        fk_transaction: insertTransactionId,
                        fk_transactiondetail: insertTransactionDetailId,
                        fk_promotion: promotionCode,
                        promotion: promotionValue,
                        promotionnominal: promotionNominal,
                        createdby: saveTransaction.server,
                        dt_created: saveTransaction.date,
                        test: test
                    })
                }
            }

            if (isvoid === 0) {
                subtotal = subtotal + itemprice
                subtotal = subtotal + itemqty
                subtotalPromotion = subtotalPromotion * itemqty
            }
            else {
                subtotal = 0
                subtotalPromotion = 0
            }

            total = total + subtotal
            totalpromotion = totalpromotion + subtotalPromotion

            let commisionResponse = await functionItem.getCommision({res, connection}, {code: itemcode, fk_business: parseInt(saveTransaction.business)})
            let {name, commisionType, commisionValue} = commisionResponse
            globalItem.alias = commisionResponse.alias
            if (commisionResponse) {
                globalItemDetail = {...globalItemDetail, sku: alias, price: itemprice, quantity:itemqty}
                if (commisionType > 0) {
                    let employeeCommision = 0
                    if (commisionType === 2) employeeCommision = commisionValue / employee.length
                    else if (commisionType === 1) employeeCommision = (commisionValue * subtotal / 100) / employee.length
                    for (let eachEmployee of employee) {
                        let employeeCode = eachEmployee.employeeCode
                        let commisionCode = sha1(moment().format("YMMDDssmmhha") + employeeCode)

                        if (commisionType === 3) {
                            let employeeResponse = await functionEmployee.getCommision({res, connection}, {code: employeeCode, fk_business: parseInt(saveTransaction.business)})
                            if (employeeResponse) {
                                if (employeeResponse.commisionType === 2) employeeCommision = employeeResponse.commisionValue / employee.length
                                else if (employeeResponse.commisionType === 1) employeeCommision = (employeeResponse.commisionValue * subtotal / 100) / employee.length
                            }
                        }

                        await functionCommision.insertCommision({res, connection}, {
                            code: commisionCode,
                            fk_business: parseInt(saveTransaction.business),
                            fk_employee: employeeCode,
                            fk_transaction: insertTransactionId,
                            fk_item: itemcode,
                            item_name: name,
                            value: employeeCommision,
                            dt_created: saveTransaction.datepaid
                        })
                    }
                }
            }

            //Monitor Order 
            if (monitorOrder === 1) {
                for (let z = 0 ; z < itemqty ; z++) {
                    let monitorOrderDetailId = functionGlobal.hashText(uniqid(), 4)
                    let monitorNotes = ""
                    if (preference !== "") monitorNotes = "Catatan: " + preference
                    if (monitorAdditional !== "") {
                        if (monitorNotes !== "") monitorNotes += "\n"
                        monitorNotes += "Tambahan:\n" + monitorAdditional
                    }
                    await functionMonitorOrderDetail.insert({res, connection}, {
                        code: monitorOrderDetailId,
                        fk_transaction_detail: insertTransactionDetailId,
                        fk_monitor_order: monitorOrderId,
                        fk_item: itemcode,
                        item_name: name,
                        notes: monitorNotes
                    })
                }
            }

            await handleLaundryFeature(connection)
        }
    }

    
    async function handlePromotionTicket(connection: PoolConnection) {
        if (saveTransaction.promotion) {
            let promotion = saveTransaction.promotion.split('~')
            let promotionTicket = promotion[0]
            let promotionTicketNominal = parseFloat(promotion[1])
            let promotionTicketType = parseInt(promotion[2])
            let promotionTicketName = promotion[3]

            let discountTicket = promotionTicketNominal
            if(promotionTicketType === 1) discountTicket = (total - totalpromotion) * discountTicket / 100
            else {
                if (total - totalpromotion < promotionTicketNominal) {
                    discountTicket = total - totalpromotion
                    promotionTicketNominal = total - totalpromotion
                }
            }

            discountTicket = Math.round(discountTicket)
            totalpromotion = Math.ceil(totalpromotion + discountTicket)

            if (discountTicket > 0) {
                await functionTransactionPromotion.insert({res, connection}, {
                    fk_business: parseInt(saveTransaction.business),
                    fk_transaction: insertTransactionId,
                    fk_promotion: promotionTicket,
                    promotion: promotionTicketNominal,
                    promotionnominal: discountTicket,
                    promotionname: promotionTicketName,
                    createdby: saveTransaction.server,
                    dt_created: saveTransaction.date
                })
            }
        }
    }

    async function checkCanAdd(connection: PoolConnection) {
        let getTransactionsResult = await functionTransaction.getTransactions({res, connection, offlinecode: saveTransaction.offlinecode, fk_business: parseInt(saveTransaction.business)})
        canAdd = true
        for (let transactionResult of getTransactionsResult) {
            saveTransaction.offlinecode += "+"
            if (transactionResult.orderNumber === parseInt(saveTransaction.ordernumber) && transactionResult.dtPaid === saveTransaction.datepaid)
                canAdd = false
            if (transactionResult.orderNumber === parseInt(saveTransaction.ordernumber))
                canAdd = false
        }
        return
    }

    async function handlePayments(connection: PoolConnection, fkBusinessDuplicate: number, ppnScType: number) {
        let totalpaid = 0
        let payments = (JSON.parse(saveTransaction.payment)).datas
        let varPayment = ""
        await payments.forEach(async (payment: typeTransaction.saveTransactionPayment, index: number) => {
            if (index === 1) issplit = true
            let paymentMethod = parseInt(payment.paymentCode)
            let paidMoney = parseFloat(payment.paymentValue)
            let information = payment.paymentInformation
            paymentName = payment.paymentName ?? ""
            totalpaid = totalpaid + paidMoney

            if (!varPayment) varPayment = paymentName
            else varPayment += (", "+paymentName)

            await functionTransactionPayment.insert({res, connection}, {
                fk_business: parseInt(saveTransaction.business),
                fk_transaction: insertTransactionId,
                fk_paymentmethod: paymentMethod,
                paidmoney: paidMoney,
                information: information
            })

            //DUPLICATE
            if (canDuplicate) {
                let {paymentMethodCode} = await functionPaymentMethod.getDuplicatePaymentMethodCode({res, connection}, {fk_business: fkBusinessDuplicate, code: paymentMethod })
                if (paymentMethodCode) {
                    let nominal = paidMoney

                    await functionTransactionPayment.insert({res, connection}, {
                        fk_business: fkBusinessDuplicate,
                        fk_transaction: insertTransactionIdDuplicate,
                        fk_paymentmethod: paymentMethodCode,
                        paidmoney: nominal,
                        information: ""
                    })
                }
            }
        })
        
        totalnet = total - totalpromotion

        if (ppnScType === 0) {
            vatnominal = Math.floor(parseFloat(saveTransaction.tax) * totalnet / 100)
            scnominal = Math.floor(parseFloat(saveTransaction.servicecharge) * totalnet / 100)
            totalnet = (totalnet + vatnominal + scnominal)
        }
        else {
            scnominal = Math.floor(parseFloat(saveTransaction.servicecharge) * totalnet / 100)
            vatnominal = Math.floor(parseFloat(saveTransaction.tax) * (totalnet + scnominal) / 100)
            totalnet = totalnet + vatnominal + scnominal
        }

        if (totalpaid >= totalnet) paid = true
        await functionTransaction.update({res, connection}, {
            total: total,
            totalpromotion: totalpromotion,
            vatnominal: vatnominal,
            scnominal: scnominal,
            totalnet: totalnet,
            issplit: issplit ? 1 : 0,
            paidby: saveTransaction.paidby,
            dt_paid: saveTransaction.datepaid,
            ispaid: paid ? 1 : 0,
            code: insertTransactionId
        })

        //Duplicate
        if (canDuplicate) {
            functionTransaction.update({res, connection}, {
                total: totalDuplicate,
                totalpromotion: 0,
                vatnominal: 0,
                scnominal: 0,
                totalnet: totalDuplicate,
                issplit: 0,
                paidby: 'Kasir',
                dt_paid: saveTransaction.datepaid,
                ispaid: 1,
                code: insertTransactionIdDuplicate
            })
        }

        data.data = {...data.data,
            success: true,
            totalnet: totalnet,
            query: queryTest,
            id: insertTransactionId,
            detail: globalItemDetail
        }
    }

    async function handleNotification(connection: PoolConnection, fkBusinessDuplicate: number, whatsappNotification: number) {
        let {firebaseTokens} = await functionUser.getFirebaseTokenBackoffice({res, connection}, {fk_business:fkBusinessDuplicate})
        for(let firebaseToken of firebaseTokens) {
            let title = "Transaksi Baru"
            let body = "Nota: " + saveTransaction.offlinecode + "\n" + "Nominal: IDR " + (new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"})).format(totalnet)
            let code = "1"
            let url = "https://backoffice.woogigs.com/receipt/"+saveTransaction.offlinecode
            
            let responseFCM = functionGlobal.curlFCMWeb(title, body, saveTransaction.offlinecode, firebaseToken, "NEW_PAID_TRANSACTION", 1)
        }

        let businessResult = await functionBusiness.getNamePhoneAndBusinessOwnerName({res, connection}, {code: parseInt(saveTransaction.business)})
        if (businessResult) {
            if (businessResult.phone.indexOf('0') === 0) businessResult.phone = (businessResult.phone.substring(1))
            else if (businessResult.phone.indexOf('62') === 0) businessResult.phone = (businessResult.phone.substring(2))
            businessResult.phone = "62" + businessResult.phone
        }

        let date = moment().format("DD MMMM YYYY HH:mm")
        let customerParam = "-"
        if (saveTransaction.customername !== "" && saveTransaction.guest !== "") {
            customerParam = saveTransaction.customername + " (" + saveTransaction.guest + ")"
        }
        else if (saveTransaction.customername !== "") {
            customerParam = saveTransaction.customername
        }
        else if (saveTransaction.guest !== "") {
            customerParam = saveTransaction.guest
        }

        let message = `
        *Notifikasi Transaksi*

        Halo ${businessResult.owner}
        barusan saja ada transaksi ${paymentName} di *${businessResult.businessName}*

        Berikut rincian nya:
        Nominal: IDR ${(new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"})).format(totalnet)}
        Pelanggan: ${customerParam}
        Tanggal/Waktu: ${saveTransaction.date}
        Nota:
        https://www.looyal.id/receipt/${saveTransaction.offlinecode}

        Jabat Erat,
        Woogigs Powered by Looyal
        `

        let messageCustomer = `
        *Notifikasi Transaksi*

        Halo ${saveTransaction.customername}
        Berikut rincian transaksi Anda di *${businessResult.businessName}*,
        pada ${saveTransaction.date}

        Total bayar: IDR ${(new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"})).format(totalnet)}
        Nota:
        https://www.looyal.id/receipt/${saveTransaction.offlinecode}
        Terima kasih atas kedatangan nya di ${businessResult.businessName} !"

        Broadcast Otomatis oleh Looyal - Superselling Platform
        `

        let result: Array<any> = await functionTransaction.getCode({res, connection}, {offlinecode: saveTransaction.offlinecode, fk_business: parseInt(saveTransaction.business)})

        if (result.length > 1) connection.rollback((error) => console.log(error))
        else {
            connection.commit((function(err) {
                if (err) {
                    errors.rollback(connection, res, err, 'controller/jvape/getNotification');
                } else {
                    res.status(200).json({
                        code: 200,
                        success: true,
                        message: "ok",
                        data: "Berhasil :D"
                    })
                    connection.release();
                };
            }))

            if (whatsappNotification === 1) {
                let resultPhones = await functionBusinessWhatsapp.getPhone({res, connection}, {fk_business: parseInt(saveTransaction.business)})
                for (let phone of resultPhones) {
                    if (phone.indexOf('0') === 0) phone = phone.substring(1)
                    if (phone.indexOf('62') === 0) phone = phone.substring(2)
                    phone = "62" + phone
                    functionGlobal.sendWA(phone, message)
                }
            }
        }
        success = true
        businessCode = parseInt(saveTransaction.business)
    }

    if (saveTransaction.item !== "") {
        pool.getConnection(function (err, connection) {
            connection.beginTransaction(async function() {
                let features = await functionBusiness.getFeatures({res: res, connection: connection, fk_business: parseInt(saveTransaction.business)})
                if ( features.fkBusinessDuplicate !== 0) await handleBusinessDuplicateFeature(connection, features.fkBusinessDuplicate, features.maxDuplicate, features.monitorOrder, JSON.parse(saveTransaction.payment)['datas'])

                await checkCanAdd(connection)
                canAdd=true
                if (!canAdd) data.data = {success: true}
                else {
                    insertTransactionId = (await functionTransaction.insertTransaction({res, connection}, {
                        offlinecode: saveTransaction.offlinecode,
                        fk_business: parseInt(saveTransaction.business),
                        fk_customer: parseInt(saveTransaction.customer),
                        fk_salestype: parseInt(saveTransaction.salestype),
                        ordernumber: parseInt(saveTransaction.ordernumber),
                        createdby: saveTransaction.server,
                        dt_created: saveTransaction.date,
                        guest: saveTransaction.guest,
                        email: saveTransaction.email
                    })).insertId

                    if (canDuplicate) {
                        let {salesTypeCode} = await functionSalestype.getSalesTypeCode({res, connection}, {fk_business: features.fkBusinessDuplicate})
                        let receipt = saveTransaction.offlinecode+"."
                        insertTransactionIdDuplicate = (await functionTransaction.insertTransaction({res, connection}, {offlinecode: receipt, fk_business: features.fkBusinessDuplicate, fk_customer: 0, fk_salestype: salesTypeCode, ordernumber: parseInt(saveTransaction.ordernumber), createdby: 'Kasir', dt_created: saveTransaction.datepaid, email: '', guest: ''})).insertId    
                    }

                    if ( features.monitorOrder === 1) await handleMonitorOrderFeature(connection)
                    
                    await handleTransactionDetail(connection, features.fkBusinessDuplicate, features.monitorOrder, features.laundry, (JSON.parse(saveTransaction.item))['datas'])
                    await handlePromotionTicket(connection)
                    await handlePayments(connection, features.fkBusinessDuplicate, features.ppnScType)
                    await handleNotification(connection, features.fkBusinessDuplicate, features.whatsappTransaction)
                }
            })
        })
    }
    else {
        data = {...data, data: {...data.data, success: true}}
    }
}

type insertV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        transaction_receipt: string,
        transaction_orderNumber: string,
        transaction_guest: string,
        transaction_server: string,
        transaction_salesType_code: string,
        transaction_tax: string,
        transaction_serviceCharge: string,
        transaction_items: string,
        transaction_promotions: string,
        transaction_payments: string,
        transaction_paidBy?: string,
        transaction_dateCreated: string,
        transaction_datePaid?: string,
        transaction_isSplit?: string,
        transaction_customer_code: string,
        transaction_customer_name: string 
    }
} 
export async function insertV3(req: insertV3Request & {
    body: {
        transaction_items_totalPrice: number,
        transaction_payments_totalPaid: number,
        transaction_vatNominal: number,
        transaction_scNominal: number,
        transaction_totalNet: number
    }
}, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['transaction_receipt', 'transaction_orderNumber', 'transaction_guest', 'transaction_server', 'transaction_salesType_code', 'transaction_tax', 'transaction_serviceCharge', 'transaction_items', 'transaction_promotions', 'transaction_payments', 'transaction_dateCreated', 'transaction_customer_code', 'transaction_customer_name'])
        let requestBody = {
            user: req.body.user,
            transaction_receipt: req.body.transaction_receipt,
            transaction_orderNumber: parseFloat(req.body.transaction_orderNumber),
            transaction_guest: req.body.transaction_guest,
            transaction_server: req.body.transaction_server,
            transaction_salesType_code: parseFloat(req.body.transaction_salesType_code),
            transaction_tax: parseFloat(req.body.transaction_tax),
            transaction_serviceCharge: parseFloat(req.body.transaction_serviceCharge),
            transaction_items: errors.handleJSONRequestBody('transaction_items', req.body.transaction_items, true),
            transaction_promotions: errors.handleJSONRequestBody('transaction_promotions', req.body.transaction_promotions, true),
            transaction_payments: errors.handleJSONRequestBody('transaction_payments', req.body.transaction_payments, true),
            transaction_paidBy: req.body.transaction_paidBy,
            transaction_dateCreated: req.body.transaction_dateCreated,
            transaction_datePaid: req.body.transaction_datePaid,
            transaction_customer_code: parseFloat(req.body.transaction_customer_code),
            transaction_customer_name: req.body.transaction_customer_name,
            transaction_isSplit: parseFloat(!req.body.transaction_isSplit || req.body.transaction_isSplit === '' ? '0' : req.body.transaction_isSplit),
            transaction_items_totalPrice: 0,
            transaction_payments_totalPaid: 0,
            transaction_vatNominal: 0,
            transaction_scNominal: 0,
            transaction_totalNet: 0,
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }
    await globalHandler('controller/transaction/insertV3', req, res, async () => {
        let requestBody = convertBody()
        let resultInsert = await startTransaction(async (executeQuery) => {
            let resultCheckSameReceipt = await executeQuery(`
                SELECT i_code
                FROM dvw_transaction.vw_transaction
                WHERE s_offlinecode = '${requestBody.transaction_receipt}'
            `)
            if (resultCheckSameReceipt.length > 0) return res.status(400).json({success: false, message: 'Kode nota telah digunakan pada transaksi lain.'})
            let resultInsertTransaction = await executeQuery(`
                INSERT INTO dvw_transaction.vw_transaction
                SET
                    s_offlinecode = '${requestBody.transaction_receipt}',
                    fk_business = ${requestBody.user.business_code},
                    fk_customer = '${requestBody.transaction_customer_code}',
                    fk_salestype = '${requestBody.transaction_salesType_code}',
                    i_ordernumber = ${requestBody.transaction_orderNumber},
                    v_createdby = '${requestBody.transaction_server}',
                    dt_created = '${requestBody.transaction_dateCreated}',
                    v_guest = '${requestBody.transaction_guest}',
                    b_issplit = ${requestBody.transaction_isSplit}
            `)
            for (let item of requestBody.transaction_items) {
                await executeQuery(`
                    INSERT INTO dvw_transaction.vw_transactiondetail
                    SET
                        fk_business = ${requestBody.user.business_code},
                        fk_transaction = ${resultInsertTransaction.insertId},
                        fk_item = ${item.item_code},
                        fk_unit = ${item.unit_code},
                        i_qty = ${item.item_qty},
                        i_price = ${item.item_price},
                        v_preference = '${item.item_preference}',
                        v_createdby = '${requestBody.transaction_server}',
                        dt_created = '${requestBody.transaction_dateCreated}',
                        b_isvoid = ${item.item_isVoid},
                        v_voidby = '${item.item_voidBy}',
                        dt_void = '${item.item_dateVoid}',
                        b_isprinted = ${item.item_isPrinted},
                        b_type = ${item.item_type},
                        b_ispaid = ${item.item_isPaid},
                        v_voidreason = '${item.item_voidReason}'
                `)
                if (parseFloat(item.item_type) === 2) await executeQuery(`
                    INSERT INTO dvw_transaction.vw_transactiondetail 
                        (fk_business, fk_transaction, fk_item, fk_unit, i_qty, i_price, v_preference, v_createdby, dt_created, b_isvoid, b_type)
                    SELECT
                            ${requestBody.user.business_code},
                            ${resultInsertTransaction.insertId},
                            a.fk_item,
                            0,
                            a.i_qty * ${item.item_qty},
                            0,
                            '',
                            '${requestBody.transaction_server}',
                            '${requestBody.transaction_dateCreated}',
                            ${item.item_isVoid},
                            3
                    FROM dvw_master.vw_packagedetail a
                    WHERE a.fk_package = ${item.item_code};
                `)
                
                let subtotal = 0
                if (item.item_isVoid === 0) {
                    subtotal = subtotal + item.item_price
                    subtotal = subtotal * item.item_qty
                } else subtotal = 0
                requestBody.transaction_items_totalPrice += subtotal
            }
            for (let payment of requestBody.transaction_payments) {
                await executeQuery(`
                    INSERT INTO dvw_transaction.vw_transactionpayment
                    SET
                        fk_business = ${requestBody.user.business_code},
                        fk_transaction = ${resultInsertTransaction.insertId},
                        fk_paymentmethod = ${payment.paymentmethod_code},
                        i_paidmoney = ${payment.payment_value},
                        v_information = '${payment.payment_information ?? ''}'
                `)
            }
            requestBody.transaction_vatNominal = requestBody.transaction_tax * requestBody.transaction_items_totalPrice / 100
            requestBody.transaction_scNominal = requestBody.transaction_serviceCharge * requestBody.transaction_items_totalPrice / 100
            requestBody.transaction_totalNet = requestBody.transaction_items_totalPrice + requestBody.transaction_vatNominal + requestBody.transaction_scNominal

            await executeQuery(`
                UPDATE dvw_transaction.vw_transaction SET
                    i_total = ${requestBody.transaction_items_totalPrice},
                    i_totalpromotion = 0,
                    i_vatnominal = ${requestBody.transaction_vatNominal},
                    i_scnominal = ${requestBody.transaction_scNominal},
                    i_totalnet = ${requestBody.transaction_totalNet},
                    dt_paid = '${requestBody.transaction_datePaid}',
                    v_paidby = '${requestBody.transaction_paidBy}'
                WHERE i_code = ${resultInsertTransaction.insertId}
            `)

            if (requestBody.transaction_receipt.length === 5) {
                await executeQuery(`
                    INSERT INTO dvw_master.vw_promotion
                    SET
                        fk_business = ${requestBody.user.business_code},
                        fk_systempromotion = 2,
                        v_code = '${requestBody.transaction_receipt}',
                        v_name = 'Registrasi',
                        v_value = ${requestBody.transaction_items_totalPrice},
                        i_minimum_spend = ${requestBody.transaction_items_totalPrice},
                        dt_start = NOW(),
                        dt_end = DATE_ADD(NOW(), INTERVAL -30 DAY),
                        v_notes = 'Registrasi',
                        b_show = 0,
                        i_max_use = 1
                `)
            }
            return resultInsertTransaction
        })
        return res.status(200).json({success: true, message: 'OK', data: resultInsert.insertId, info: resultInsert})
    })
}

type updateGuestV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        transaction_receipt: string,
        transaction_guest: string
    }
}
export async function updateGuestV3(req: updateGuestV3Request, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, ['transaction_receipt', 'transaction_guest'])
        let requestBody = {
            user: req.body.user,
            transaction_receipt: req.body.transaction_receipt,
            transaction_guest: req.body.transaction_guest
        }
        return requestBody
    }
    await globalHandler('controller/transactiondetail', req, res, async () => {
        let requestBody = convertBody()
        let resultUpdate = await executeQuery(`
            UPDATE dvw_transaction.vw_transaction
            SET v_guest = '${requestBody.transaction_guest}'
            WHERE
                s_offlinecode = '${requestBody.transaction_receipt}'
                AND fk_business = ${requestBody.user.business_code}
        `)
        if (resultUpdate.affectedRows === 0) return res.status(400).json({success: false, message: 'Detil transaksi tidak ditemukan.'})
        if (resultUpdate.changedRows === 0) return res.status(400).json({success: false, message: 'Nama tamu sama seperti sebelumnya.'})
        return res.status(200).json({success: true, message: 'Tamu berhasil diperbarui', info: resultUpdate})
    })
}