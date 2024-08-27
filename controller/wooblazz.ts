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

type connectNewAPIRequest = Omit<Request, 'body'> & {
    body: {
        number: string
    }
}
export async function connectNewAPI(req: connectNewAPIRequest, res: Response) {
    
    function convertBody() {
        errors.newCheckField(req.body, ['number'])
        let requestBody = {
            number: req.body.number
        }
        return requestBody
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/watzap/connectNewAPI')

        await functionWooblazz.setWooblazzConnected({connection, res}, {v_number: req.body.number, b_connected: 1})
        return res.status(200).json({success: true, message: 'Connected Wooblazz successfully.'})
    })
}

type disconnectNewAPIRequest = Omit<Request, 'body'> & {
    body: {
        number: string
    }
}
export async function disconnectNewAPI(req: connectNewAPIRequest, res: Response) {
    
    function convertBody() {
        errors.newCheckField(req.body, ['number'])
        let requestBody = {
            number: req.body.number
        }
        return requestBody
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/watzap/connectNewAPI')

        await functionWooblazz.setWooblazzConnected({connection, res}, {v_number: req.body.number, b_connected: 0})
        return res.status(200).json({success: true, message: 'Connected Wooblazz successfully.'})
    })
}