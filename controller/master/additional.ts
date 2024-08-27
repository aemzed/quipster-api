import { Request, Response } from "express"

import pool from "../../config/connect"
import * as errors from "../../function/global_function"

//========== Types ===================
import * as typeGlobal from '../../type/global'
import * as typeAdditional from '../../type/additional'

//========== Functions ===============
import * as functionAdditional from '../../function/master/additional'
import * as functionAdditionalPrice from '../../function/master/additionalprice'
import * as functionUser from '../../function/account/user'
import { ResultSetHeader } from "mysql2"
import uniqid from "uniqid"
import { globalHandler } from "../../function/global"
import { executeQuery, startTransaction } from "../../util/mysql"
import { User } from "../../type/user"
import PoolConnection from "mysql2/typings/mysql/lib/PoolConnection"

type selectV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function selectV3(req: selectV3Request, res: Response) {
    await globalHandler('controller/additional/selectV3', req, res, async () => {
        let resultGetAdditional = await executeQuery(
            `
            SELECT
                a.i_code AS code,
                a.v_name AS name,
                a.i_price AS price,
                a.i_pricenet AS price_net
            FROM dvw_master.vw_additional a
            WHERE a.b_isactive = 1
                AND a.fk_business = ${req.body.user.business_code}
            ORDER BY a.v_name
            `
        )
        return res.status(200).json({success: true, message: `${resultGetAdditional.length} data/s found.`, data: resultGetAdditional})
    })
}

type insertV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        name: string,
        price: string,
        hpp: string,
        notes: string
    }
}
export async function insertV3(req: insertV3Request, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['name', 'price', 'hpp', 'notes'])

        let requestBody = {
            user: req.body.user,
            name: <string>req.body.name,
            price: <number>parseFloat(req.body.price),
            hpp: <number>parseFloat(req.body.hpp),
            notes: <string>req.body.notes
        }

        errors.newCheckNaN({...requestBody})

        return requestBody
    }

    await globalHandler('controller/additional/insertV3', req, res, async () => {

        let requestBody = convertBody()
        let resultInsert = await startTransaction(async (executeQuery) => {
            let resultGetSimilarName = await executeQuery(
                `
                SELECT 
                    a.v_name AS name
                FROM dvw_master.vw_additional a
                WHERE a.v_name = '${requestBody.name}'
                    AND a.fk_business = ${requestBody.user.business_code}
                    AND a.b_isactive = 1
                `
            )
            if (resultGetSimilarName.length > 0) throw({httpResponse: {code: 400, success: false, message: 'Tambahan telah ada sebelumnya.'}})
            let resultInsertAdditional = await executeQuery(
                `
                INSERT INTO 
                    dvw_master.vw_additional 
                SET 
                    fk_user_modify = ${requestBody.user.user_code},
                    v_name = '${requestBody.name}', 
                    fk_business = ${requestBody.user.business_code},
                    i_price = ${requestBody.price},
                    i_pricenet = ${requestBody.hpp},
                    v_notes = '${requestBody.notes}'
                `
            )
            return resultInsertAdditional
        })
        return res.status(200).json({success: true, message: `Tambahan berhasil dimasukkan.`, data: resultInsert.insertId, info: resultInsert})
    })
}

type updateV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string,
        name: string
    }
}
export async function updateV3(req: updateV3Request, res: Response) {
    
    function convertBody() {
        errors.newCheckField(req.body, ['code', 'name'])
        let requestBody = {
            user: req.body.user,
            code: <number>parseFloat(req.body.code),
            name: <string>req.body.name
        }
        errors.newCheckNaN({...requestBody})
        return requestBody
    }

    await globalHandler('controller/additional/updateV3', req, res, async () => {

        let requestBody = convertBody()
        let resultUpdate = await startTransaction(async (executeQuery) => {
            let resultGetSimilarName = await executeQuery(
                `
                SELECT 
                    a.v_name AS name
                FROM dvw_master.vw_additional a
                WHERE a.v_name = '${requestBody.name}'
                    AND a.fk_business = ${requestBody.user.business_code}
                    AND a.b_isactive = 1
                    AND a.i_code != ${requestBody.code}
                `
            )
            if (resultGetSimilarName.length > 0) throw({httpResponse: {code: 400, success: false, message: 'Nama tambahan telah digunakan.'}})
            let resultUpdateAdditional = await executeQuery(
                `
                UPDATE 
                    dvw_master.vw_additional 
                SET
                    fk_user_modify = ${requestBody.user.user_code},
                    v_name = '${requestBody.name}'
                WHERE
                    i_code = ${requestBody.code}
                    AND fk_business = ${requestBody.user.business_code}
                `
            )
            return resultUpdateAdditional
        })
        return res.status(200).json({success: true, message: 'Tambahan berhasil diperbarui.', data: requestBody.code, info: resultUpdate})
    })
}

type deleteV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string
    }
}
export async function deleteV3(req: deleteV3Request, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['code'])
        let requestBody = {
            user: req.body.user,
            code: <number>parseFloat(req.body.code),
        }
        errors.newCheckNaN({...requestBody})
        return requestBody
    }

    await globalHandler('controller/additional/deleteV3', req, res, async () => {
        let requestBody = convertBody()
        let resultDelete = await startTransaction(async (executeQuery) => {
            let resultDeleteAdditional = await executeQuery(
                `
                UPDATE 
                    dvw_master.vw_additional 
                SET
                    fk_user_modify = ${requestBody.user.user_code},
                    b_isactive = 0
                WHERE i_code = ${requestBody.code}
                    AND fk_business = ${requestBody.user.business_code}
                    AND b_isactive = 1
                `
            )
            return resultDeleteAdditional
        })
        return res.status(200).json({success: true, message: 'Tambahan berhasil dihapus.', data: resultDelete})
    })
}

type updatePriceV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string,
        price: string,
        hpp: string
    }
}
export async function updatePriceV3(req: updatePriceV3Request, res: Response) {
    function convertBody() {
        errors.newCheckField(req.body, ['code', 'price', 'hpp'])
        let requestBody = {
            user: req.body.user,
            code: parseFloat(req.body.code),
            price: parseFloat(req.body.price),
            hpp: parseFloat(req.body.hpp)
        }
        errors.newCheckNaN({...requestBody})
        return requestBody
    }

    await globalHandler('controller/additional/updatePriceV3', req, res, async () => {
        let requestBody = convertBody()
        let resultUpdatePrice = await startTransaction(async (executeQuery) => {
            let resultDeletePriceAdditional = await executeQuery(
                `
                UPDATE 
                    dvw_master.vw_additionalprice 
                SET 
                    fk_user_modify = ${requestBody.user.user_code},
                    b_isactive = 0
                WHERE fk_business = ${requestBody.user.business_code}
                    AND fk_additional = ${requestBody.code}
                `
            )
            let resultInsertPriceAdditional = await executeQuery(
                `
                INSERT INTO 
                    dvw_master.vw_additionalprice 
                SET 
                    fk_user_modify = ${requestBody.user.user_code},
                    fk_business = ${requestBody.user.business_code}, 
                    fk_additional = ${requestBody.code}, 
                    i_price = ${requestBody.price}
                `
            )
            let resultUpdatePricenetAdditional = await executeQuery(
                `
                UPDATE 
                    dvw_master.vw_additional 
                SET 
                    fk_user_modify = ${requestBody.user.user_code},
                    i_pricenet = ${requestBody.hpp}
                WHERE i_code = ${requestBody.code}
                    AND fk_business = ${requestBody.user.business_code}
            `
            )
            return resultUpdatePricenetAdditional
        })
        return res.status(200).json({success: true, message: 'Harga tambahan berhasil diperbarui.', data: resultUpdatePrice})
    })
}

type selectSimilarV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string
    }
}
export async function selectSimilarV3(req: selectSimilarV3Request, res: Response) {

    function convertBody() {
        errors.checkField(req.body, ['code'])
        let requestBody = {
            user: req.body.user,
            code: parseFloat(req.body.code)
        }
        errors.checkNaN(requestBody)
        return requestBody
    }

    async function handleBusinessToken(executeQuery: (query: string) => Promise<any>, codeBusiness: number) {
        let resultGetTokenFromDatabase = await executeQuery(`
            SELECT
                a.v_hash_backoffice AS \`token\`
            FROM dvw_account.vw_user a
            WHERE a.b_isactive = 1
                AND a.fk_business = ${codeBusiness}
                AND a.b_isowner = 1
        `)
        if (resultGetTokenFromDatabase.length > 0) return
        else {
            let token = uniqid()
            await executeQuery(`
                UPDATE dvw_account.vw_user
                SET a.v_hash_backoffice = '${token}'
                WHERE a.i_code = ${codeBusiness}
            `)
        }
        return
    }

    await globalHandler('controller/additional/selectSimilarV3', req, res, async () => {
        let requestBody = convertBody()!
        let resultSelectSimilar = await startTransaction(async (executeQuery) => {
            let resultGetAdditionalInOtherBusiness = await executeQuery(`
                SELECT
                    a.i_code AS additional_code,
                    a.v_name AS additional_name,
                    b.i_code AS business_code,
                    b.v_name AS business_name
                FROM dvw_master.vw_additional a
                JOIN dvw_account.vw_business b ON a.fk_business = b.i_code AND b.i_code != ${requestBody.user.business_code}
                WHERE 
                    a.v_name = (SELECT v_name FROM dvw_master.vw_additional WHERE i_code = ${requestBody.code})
                    AND b.fk_businessowner = (SELECT fk_businessowner FROM dvw_account.vw_business WHERE i_code = ${requestBody.user.business_code})
                    AND a.b_isactive = 1
                    AND b.dt_expired > NOW()
            `)
            for (let eachAdditional of resultGetAdditionalInOtherBusiness) {
                await handleBusinessToken(executeQuery, eachAdditional.business_code)
            }
            return resultGetAdditionalInOtherBusiness
        })
        return res.status(200).json({success: true, message: `${resultSelectSimilar.length} data/s found.`, data: resultSelectSimilar})
    })
}