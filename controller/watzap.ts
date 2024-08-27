import pool from '../config/connect'
import * as errors from '../function/global_function'
import { Request, Response } from 'express'

import * as typeGlobal from '../type/global'

import * as functionCustomer from '../function/master/customer'
import * as functionGlobal from '../function/global_function'
import * as functionItem from '../function/master/item'
import * as functionStockReport from '../function/operational/stockreport'
import * as functionWatzap from '../function/watzap'
import * as functionPromotion from '../function/master/promotion'
import * as functionWooblazz from '../function/wooblazz'
import { executeQuery } from "../util/mysql"
import md5 from 'md5'
import moment from 'moment'


type sendMessage = Omit<Request, 'body'> & {body: {
    phone_destination: any,
    message: any,
    api_key: any,
    number_key: any
}}

export async function sendMessage(req: sendMessage, res: Response) {

    function convertBody () {
        try {
            errors.checkField(req.body, ['phone_destination', 'message', 'api_key', 'number_key'])
            let requestBody = {
                phoneDestination: req.body.phone_destination,
                message: req.body.message,
                apiKey: req.body.api_key,
                numberKey: req.body.number_key 
            }
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    let requestBody = convertBody()!
    if (res.headersSent) return 

    let resultSendWA = await functionWatzap.sendMessage({phoneDestination: requestBody.phoneDestination, message: requestBody.message, sender: {apiKey: requestBody.apiKey, numberKey: requestBody.numberKey}})
    return res.status(200).json({success: true, message: 'OK', data: resultSendWA})
}

type receiveMessage = Omit<Request, 'body'> & {body: {
    type: 'incoming_chat',
    data: {
        number_key: string,
        chat_id: string,
        message_id: string,
        name: string,
        profile_picture: string,
        timestamp: {
            low: number,
            high: number,
            unsigned: boolean
        },
        message_body: string,
        message_ack: 'PENDING' | 'SERVER_ACK',
        has_media: boolean,
        media_mime: string,
        media_name: string,
        location_attached: {
            lat?: number,
            lng?: number
        },
        is_forwarding: boolean,
        is_from_me: true
    }
}}
export async function receiveMessage(req: receiveMessage, res: Response) {

    pool.getConnection( async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/watzap/receiveMessage')

       
        async function getPromotions(idBusiness: number) {
            return await functionPromotion.get({res, connection}, {fk_business: idBusiness})
        }

        async function getKodePromosiMessage(idBusiness: number) {
            let resultGetPromotions = await getPromotions(idBusiness)
            return resultGetPromotions.length === 0 ? 'Belum ada promosi pada saat ini.' : resultGetPromotions.map((promotion, index) => `${index}: ${promotion.name}`).join('\n')
        }

        try {
            if (err) return errors.rollback(connection, res, err, 'controller/watzap/receiveMessage')

            if ((req.body.data.name === '6287714041231' || req.body.data.name === '6285733006938') && !req.body.data.is_from_me) {
                let admin = await functionWatzap.getWoogigsUserNBusiness({res, connection}, {bc_user_number: {v_number_key: req.body.data.number_key}})
                if (!admin) return res.status(200).json({success: true, message: 'OK'})
                await functionWatzap.insertMessage({res, connection}, {b_from_admin: 0, fk_templatechat: 0, v_message: req.body.data.message_body, v_phone_admin: admin.phone, v_phone_user: req.body.data.name})
                
                const formatMessage = async (message: string): Promise<Array<string>> => {
                    if (message.includes('${namaUser}'))    message = message.replaceAll('${namaUser}', (await functionCustomer.getNameFromPhone({res,connection}, {fk_business: admin.idBusiness, v_phone: req.body.data.name})).name)
                    if (message.includes('${kodebisnis}'))  message = message.replaceAll('${kodebisnis}', admin.codeBusiness)
                    if (message.includes('${daftarpromosi}'))   message = message.replaceAll('${daftarpromosi}', await getKodePromosiMessage(admin.idBusiness))
                    if (message.includes('${buatKodeNota}'))    {
                        let kodeNota = md5(moment().format('YYYY-MM-DD HH:mm:ss')).substring(0, 12).toUpperCase()
                        message = message.replaceAll('${buatKodeNota}', kodeNota) 
                        await executeQuery(`
                            INSERT INTO
                                dvw_transaction.vw_cart
                            SET
                                s_offlinecode = '${kodeNota}',
                                fk_business = '${admin.idBusiness}',
                                fk_customer = (SELECT i_code from dvw_master.vw_customer WHERE v_phone = '${req.body.data.name}' AND b_isactive = 1),
                                fk_salestype = 10138,
                                i_ordernumber = (SELECT COALESCE(MAX(a.i_ordernumber), 0)+1 FROM dvw_transaction.vw_transaction a WHERE a.fk_business = ${admin.idBusiness} AND DATE(a.dt_created) = CURDATE()),
                                i_total = 1,
                                v_createdby = 'Chatbot Online Order',
                                dt_created = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                                v_guest = '',
                                b_issplit = '0'
                        `)
                    }
                    return message.split('${split}')
                }

                let resultGetLastMessageFromAdmin = await functionWatzap.getLastMessageFromAdmin({res, connection}, {fk_business: admin.idBusiness, v_phone_admin: admin.phone , v_phone_user: req.body.data.name})
                if (!resultGetLastMessageFromAdmin) {
                    let chatSender = await functionCustomer.getNameFromPhone({res,connection}, {fk_business: admin.idBusiness, v_phone: req.body.data.name})
                    if (!chatSender) {
                        let messageFromAdmin = await functionWatzap.getAdminResponseForNewCustomer({res, connection}, {fk_business: admin.idBusiness})
                        let adminMessages = await formatMessage(messageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    } else {
                        let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                        let adminMessages = await formatMessage(messageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    }
                    return res.status(200).json({success: true, message: 'OK'})
                } else {
                    if (resultGetLastMessageFromAdmin.typeMessage === -2) {
                        let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                        let adminMessages = await formatMessage(messageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    }
                    else if (resultGetLastMessageFromAdmin.typeMessage === -1) {
                        await functionCustomer.insert({res, connection}, {fk_business: admin.idBusiness, name: req.body.data.message_body, phone: req.body.data.name})
                        let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                        let adminMessages = await formatMessage(messageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    }
                    else if (resultGetLastMessageFromAdmin.typeMessage === 1) {
                        if (req.body.data.message_body === 'BYE') {
                            let messageFromAdmin = await functionWatzap.getAdminLastResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (req.body.data.message_body === 'OK') {
                            let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        let adminMessages = await formatMessage(resultGetLastMessageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    }
                    else if (resultGetLastMessageFromAdmin.typeMessage === 11) {
                        if (req.body.data.message_body === 'BYE') {
                            let messageFromAdmin = await functionWatzap.getAdminLastResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (req.body.data.message_body === 'OK') {
                            let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: resultGetLastMessageFromAdmin.message, phoneUser: req.body.data.name})
                    }
                    else if (resultGetLastMessageFromAdmin.typeMessage === 2) {
                        if (req.body.data.message_body === 'BYE') {
                            let messageFromAdmin = await functionWatzap.getAdminLastResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (req.body.data.message_body === 'OK') {
                            let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        let itemsStock: Array<any> = []
                        for (let keyword of req.body.data.message_body.split(/[\s,\n]+/)) {
                            let resultGetItemStock = await functionItem.getStockByName({res, connection}, {fk_business: admin.idBusiness, v_name: keyword})
                            itemsStock = itemsStock.concat(resultGetItemStock)
                        }
                        let messageFromAdmin: string
                        if (itemsStock.length === 0) messageFromAdmin = "Maaf, produk tidak ditemukan.\nKetik 'OK' untuk berhenti cek stok."
                        else messageFromAdmin = itemsStock.map((eachItem) => `${eachItem.itemName}: ${eachItem.stock > 0 ? `Stok tersedia` : `Stok habis`}`).join('\n') + "\n\nKetik 'OK' untuk berhenti cek stok.\nKetik 'BYE' untuk mengakhiri chat"
                        let adminMessages = await formatMessage(messageFromAdmin)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    } 
                    else if (resultGetLastMessageFromAdmin.typeMessage === 3) {
                        if (req.body.data.message_body === 'BYE') {
                            let messageFromAdmin = await functionWatzap.getAdminLastResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (req.body.data.message_body === 'OK') {
                            let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (!req.body.data.location_attached.lat || !req.body.data.location_attached.lng) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: "Tidak ada lokasi yang diberikan.\nSertakan attachment berupa lokasi pada Whatsapp.\n\nKetik 'OK' untuk berhenti cek ongkir\nKetik 'BYE' untuk mengakhiri chat", phoneUser: req.body.data.name})
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        let resultGetShipping = await functionWatzap.getShipping({res, connection}, {idBusiness: admin.idBusiness, location: {latitude: req.body.data.location_attached.lat, longitude: req.body.data.location_attached.lng}})
                        let messageFromAdmin: string
                        if (resultGetShipping.length === 0) messageFromAdmin = "Belum ada jasa pengiriman pada saat ini.\n\nKetik 'OK' untuk berhenti cek ongkir.\nKetik 'BYE' untuk mengakhiri chat"
                        else messageFromAdmin = resultGetShipping.map((eachShipping) => `${eachShipping.courier_name} (${eachShipping.courier_service_name} ${eachShipping.duration}) : ${eachShipping.price}`).join('\n') + "\n\nKetik 'OK' untuk berhenti cek ongkir.\nKetik 'BYE' untuk mengakhiri chat"
                        let adminMessages = await formatMessage(messageFromAdmin)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    } 
                    else if (resultGetLastMessageFromAdmin.typeMessage === 4) {
                        if (req.body.data.message_body === 'BYE') {
                            let messageFromAdmin = await functionWatzap.getAdminLastResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        if (req.body.data.message_body === 'OK') {
                            let messageFromAdmin = await functionWatzap.getAdminFirstResponse({res, connection}, {fk_business: admin.idBusiness})
                            let adminMessages = await formatMessage(messageFromAdmin.message)
                            for (let message of adminMessages) {
                                await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                            }
                            return res.status(200).json({success: true, message: 'OK'})
                        }
                        let promotions = await getPromotions(admin.idBusiness)
                        let promotion = await functionPromotion.getByName({res, connection}, {fk_business: admin.idBusiness, v_name: promotions[parseFloat(req.body.data.message_body)].name})
                        let messageFromAdmin = ''
                        if (promotion.length === 0) messageFromAdmin = `Mohon pilih angka yang tersedia.`
                        else messageFromAdmin = `Kode Promosi: ${promotion[0].promotion_code}${'\n'}Nama Promosi: ${promotion[0].promotion_name}${'\n'}Tipe Promosi: ${promotion[0].promotion_type}${'\n'}Nilai Promosi: ${promotion[0].promotion_value}${'\n'}Belanja Minimum: ${promotion[0].promotion_minimumSpend}${'\n'}Maksimal Promosi: ${promotion[0].promotion_maximumPromo}`
                        await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: messageFromAdmin, phoneUser: req.body.data.name})
                        await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: 'Ingin cek promo apalagi?', phoneUser: req.body.data.name})
                        await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: await getKodePromosiMessage(admin.idBusiness) + "\n\nKetik 'OK' untuk berhenti cek promosi\nKetik 'BYE' untuk mengakhiri chat", phoneUser: req.body.data.name})
                    }
                    else {
                        let messageFromAdmin = await functionWatzap.getAdminResponse({res, connection}, { fk_templatechat_from: resultGetLastMessageFromAdmin.idTemplateChat, fk_business: admin.idBusiness, v_answer: req.body.data.message_body})
                        if (!messageFromAdmin) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: 'Maaf, perintah tidak dikenali. Mohon ikuti petunjuk yang disediakan', phoneUser: req.body.data.name})
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: resultGetLastMessageFromAdmin.idTemplateChat, message: resultGetLastMessageFromAdmin.message, phoneUser: req.body.data.name})
                            return
                        }
                        let adminMessages = await formatMessage(messageFromAdmin.message)
                        for (let message of adminMessages) {
                            await functionWatzap.adminSentMessage({res, connection}, {admin: {apiKey: admin.apiKey, numberKey: admin.numberKey, phoneAdmin: admin.phone},idTemplateChat: messageFromAdmin.idTemplateChat, message: message, phoneUser: req.body.data.name})
                        }
                    }
                    return res.status(200).json({success: true, message: 'OK'})
                }
            }
        } catch (err) {
            console.log({err})
        }
    })

}