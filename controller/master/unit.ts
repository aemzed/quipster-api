import { Request, Response, response } from "express"

import pool from "../../config/connect"
import * as errors from "../../function/global_function"
import uniqid from 'uniqid'

//========== Types ===================
import * as typeGlobal from '../../type/global'
import * as typeUnit from '../../type/unit'

//========== Functions ===============
import * as functionUnit from '../../function/master/unit'
import * as functionUser from '../../function/account/user'
import { User } from "../../type/user"
import { globalHandler } from "../../function/global"
import { executeQuery, startTransaction } from "../../util/mysql"

type selectV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
        name: string
    }
}
export async function selectV3(req: selectV3Request, res: Response) {

    function convertBody() {
        let requestBody = {
            user: req.body.user,
            name: req.body.name
        }
        return requestBody
    }

    await globalHandler('controller/unit/selectV3', req, res, async () => {
        let requestBody = convertBody()
        let resultSelectUnit = await executeQuery(`
        SELECT *
        FROM (
            SELECT
                a.i_code AS \`code\`,
                a.v_name AS \`name\`,
                IFNULL(z.i_code, 99) AS \`system\`,
                a.fk_unit AS \`smallest\`,
                IFNULL((SELECT b.v_name FROM dvw_master.vw_unit b WHERE b.i_code = a.fk_unit and b.b_isactive = 1), '') AS \`smallest_name\`,
                a.i_conversion AS \`conversion\`,
                (SELECT COUNT(1) FROM dvw_master.vw_unit b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS \`bigger_count\`,
                (SELECT COUNT(1) FROM dvw_master.vw_item b WHERE b.fk_unit = a.i_code and b.b_isactive = 1) AS \`used_by_item\`
            FROM dvw_master.vw_unit a
            JOIN dvw_system.vw_unit z ON a.fk_systemunit = z.i_code AND z.b_isactive = 1
            WHERE a.b_isactive = 1
                AND a.fk_business = ${req.body.user.business_code}
                ${requestBody.name ?
                `AND a.v_name LIKE '${requestBody.name}'`
                :``}
        ) \`temp\`
        `)
        return res.status(200).json({success: true, message: `${resultSelectUnit.length} data/s found.` , data: resultSelectUnit})
    })
}

type selectSystemUnitV3 = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function selectSytemUnitV3(req: selectSystemUnitV3, res: Response) {
    
    function convertBody() {
        let requestBody = {
            user: req.body.user
        }
        return requestBody
    }

    await globalHandler('controller/unit/selectSystemUnitV3', req, res, async () => {
        let requestBody = convertBody()
        let resultGetSystemUnit = await executeQuery(`
            SELECT
                i_code AS code,
                v_name AS name
            FROM dvw_system.vw_unit
            WHERE b_isactive = 1
            ORDER BY v_name
        `)
        return res.status(200).json({success: true, message: `${resultGetSystemUnit.length} data/s found.`, data: resultGetSystemUnit})
    })

}

type insertV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        name: string,
        system: string,
        smallest: string,
        conversion: string
    }
}
export async function insertV3(req: insertV3Request, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['name', 'system'])
        let requestBody = {
            user: req.body.user,
            name: <string>req.body.name,
            system: parseFloat(req.body.system),
            smallest: parseFloat(!req.body.smallest || req.body.smallest === '' ? '0' : req.body.smallest),
            conversion: parseFloat(!req.body.conversion || req.body.conversion === '' ? '1' : req.body.conversion)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }

    await globalHandler('controller/unit/insertV3', req, res, async () => {
        let requestBody = convertBody()
        let resultInsert = await startTransaction(async function (executeQuery) {
            let resultGetUnitByName = await executeQuery(`
                SELECT 
                    a.i_code AS code,
                    a.v_name AS name
                FROM dvw_master.vw_unit a
                WHERE a.b_isactive = 1
                    AND a.v_name = '${requestBody.name}'
                    AND a.fk_business = ${requestBody.user.business_code}
            `)
            if (resultGetUnitByName.length > 0) throw({httpResponse: {code: 400, success: false, message: 'Nama unit telah digunakan.'}})
            let resultInsertUnit = await executeQuery(`
                INSERT INTO 
                    dvw_master.vw_unit
                SET 
                    v_name = '${requestBody.name}', 
                    fk_business = ${requestBody.user.business_code},
                    fk_systemunit = ${requestBody.system},
                    fk_unit = ${requestBody.smallest},
                    i_conversion = ${requestBody.conversion},
                    fk_user_modify = ${requestBody.user.user_code}
            `)
            return resultInsertUnit
        })
        return res.status(200).json({success: true, message: 'Satuan berhasil ditambahkan.', data: resultInsert.insertId, info: resultInsert})
    })

}

type updateV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string,
        name: string,
        system: string,
        smallest: string,
        conversion: string
    }
}
export async function updateV3(req: updateV3Request, res: Response) {

    function convertBody() {
        errors.newCheckField(req.body, ['code', 'name', 'system'])
        let requestBody = {
            user: req.body.user,
            code: parseFloat(req.body.code),
            name: req.body.name,
            system: parseFloat(req.body.system),
            smallest: parseFloat(!req.body.smallest || req.body.smallest === '' ? '0' : req.body.smallest),
            conversion: parseFloat(!req.body.conversion || req.body.conversion === '' ? '1' : req.body.conversion)
        }
        errors.newCheckNaN(requestBody)
        return requestBody
    }

    await globalHandler('controller/unit/updateV3', req, res, async () => {
        let requestBody = convertBody()
        let resultUpdate = await startTransaction(async function (executeQuery) {
            let resultGetUnitByName = await executeQuery(`
                SELECT 
                    a.i_code AS code,
                    a.v_name AS name
                FROM dvw_master.vw_unit a
                WHERE a.b_isactive = 1
                    AND a.v_name = '${requestBody.name}'
                    AND a.fk_business = ${requestBody.user.business_code}
            `)
            if (resultGetUnitByName.length > 0) throw({httpResponse: {code: 400, success: false, message: 'Nama unit telah digunakan.'}})
            let resultUpdateUnit = await executeQuery(`
                UPDATE 
                    dvw_master.vw_unit 
                SET 
                    v_name = '${requestBody.name}', 
                    fk_systemunit = ${requestBody.system},
                    fk_unit = ${requestBody.smallest},
                    i_conversion = ${requestBody.conversion},
                    fk_user_modify = ${requestBody.user.user_code}
                WHERE i_code = ${requestBody.code}
                    AND fk_business = ${requestBody.user.business_code}
                    AND b_isactive = 1
            `)
            return resultUpdateUnit
        })
        return res.status(200).json({success: true, message: 'Satuan berhasil diperbarui.', data: requestBody.code, info: resultUpdate})
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
        errors.newCheckField(req.body, ['code'])
        let requestBody = {
            user: req.body.user,
            code: parseFloat(req.body.code)
        }
        errors.newCheckNaN(requestBody)
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

    await globalHandler('controller/unit/selectSimilarV3', req, res, async () => {
        let requestBody = convertBody()
        let resultSelectSimilar = await startTransaction(async (executeQuery) => {
            let resultGetUnitInOtherBusiness = await executeQuery(`
                SELECT
                    a.i_code AS unit_code,
                    a.v_name AS unit_name,
                    b.i_code AS business_code,
                    b.v_name AS business_name
                FROM dvw_master.vw_unit a
                JOIN dvw_account.vw_business b ON a.fk_business = b.i_code AND b.i_code != ${requestBody.user.business_code}
                WHERE 
                    a.v_name = (SELECT v_name FROM dvw_master.vw_unit WHERE i_code = ${requestBody.code})
                    AND b.fk_businessowner = (SELECT fk_businessowner FROM dvw_account.vw_business WHERE i_code = ${requestBody.user.business_code})
                    AND a.b_isactive = 1
                    AND b.dt_expired > NOW()
            `)
            for (let eachUnit of resultGetUnitInOtherBusiness) {
                await handleBusinessToken(executeQuery, eachUnit.business_code)
            }
            return resultGetUnitInOtherBusiness
        })
        return res.status(200).json({success: true, message: `${resultSelectSimilar.length} data/s found.`, data: resultSelectSimilar})
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
            code: parseFloat(req.body.code)
        }
        return requestBody
    }
    await globalHandler('controller/unit/deleteV3', req, res, async () => {
        let requestBody = convertBody()
        let resultDelete = await executeQuery(`
            UPDATE dvw_master.vw_unit 
            SET 
                b_isactive = 0,
                fk_user_modify = ${requestBody.user.user_code}
            WHERE i_code = ${requestBody.code}
        `)
        return res.status(200).json({success: true, message: 'Unit berhasil dihapus.', data: requestBody.code, info: resultDelete})
    })
}