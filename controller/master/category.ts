import pool from '../../config/connect'

import * as typeGlobal from '../../type/global'
import * as typeCategory from '../../type/category'

import * as errors from '../../function/global_function'
import * as functionCategory from '../../function/master/category'
import * as functionUser from '../../function/account/user'
import { Request, Response } from 'express'
import { globalHandler } from '../../function/global'
import { User } from '../../type/user'
import { executeQuery, startTransaction } from '../../util/mysql'

const uniqid = require('uniqid')

type getV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function getV3(req: getV3Request, res: Response) {
    await globalHandler('controller/category/getV3', req, res, async () => {
        let resultGetCategory = await executeQuery(
            `
            SELECT
                a.i_code AS code,
                a.v_name AS name,
                CASE
                    WHEN b.v_name IS NULL THEN SUM(0)
                    ELSE SUM(1)
                END AS count,
                a.d_pph AS pph,
                b_use_tax AS use_tax,
                b_use_service_charge AS use_service_charge
            FROM dvw_master.vw_category a
            LEFT JOIN dvw_master.vw_item b ON a.i_code = b.fk_category AND b.b_isactive = 1
            WHERE a.b_isactive = 1
                AND a.fk_business = ${req.body.user.business_code}
            GROUP BY a.i_code
            ORDER BY a.v_name
            `
        )
        return res.status(200).json({success: true, message: `${resultGetCategory.length} data/s found.`, info: {categories: resultGetCategory.length}, data: resultGetCategory})
    })
}

type getQuipsterV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function getQuipsterV3(req: getQuipsterV3Request, res: Response) {
    await globalHandler('controller/master/category/getQuipsterV3', req, res, async() => {
        let resultGetQuipsterCategory = await executeQuery(
            `
            SELECT
                a.i_code AS code,
                a.v_name AS name,
                CASE
                    WHEN b.v_name IS NULL THEN SUM(0)
                    ELSE SUM(1)
                END AS count,
                a.d_pph AS pph,
                b_use_tax AS use_tax,
                b_use_service_charge AS use_service_charge,
                c.i_code AS supplier_code,
                c.v_name AS supplier_name
            FROM dvw_master.vw_category a
            LEFT JOIN dvw_master.vw_item b ON a.i_code = b.fk_category AND b.b_isactive = 1
            LEFT JOIN dvw_master.vw_supplier c ON a.fk_supplier = c.i_code AND c.b_isactive = 1
            WHERE a.b_isactive = 1
                AND a.fk_business = ${req.body.user.business_code}
            GROUP BY a.i_code
            ORDER BY a.v_name
            `
        )
        return res.status(200).json({success: true, message: `${resultGetQuipsterCategory.length} data/s found.`, info: {categories: resultGetQuipsterCategory.length}, data: resultGetQuipsterCategory})
    })
}
type getPriceMemberV3Request = Omit<Request, 'body'> & {
    body: {
        user: User
    }
}
export async function getPriceMemberV3(req: getPriceMemberV3Request, res: any) {
    await globalHandler('controller/category/getPriceMemberV3', req, res, async () => {
        let resultGetPriceMember = await executeQuery(
            `
            SELECT
                a.v_code AS code,
                a.v_name AS member,
                b.i_code AS category_code,
                b.v_name AS category_name,
                a.b_type AS type,
                a.i_value AS value
            FROM dvw_master.vw_category_price a
            JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
            ORDER BY a.v_name
            `
        )
        return res.status(200).json({success: true, message: `${resultGetPriceMember.length} data/s found.`, data: resultGetPriceMember})
    })
}

export async function oldgetPriceMemberV3(req: typeGlobal.requestV3 & {body: {category?: string, member?: string}}, res: any) {
    pool.getConnection(async function(err, connection) {
        let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
        if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

        var results = await functionCategory.getPriceMember({
            connection: connection,
            res: res
        },{
            category: req.body.category,
            member: req.body.member
        });

        connection.commit(function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/category/getPriceMemberV3');
            } else {
                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                    data: results
                })
                connection.release();
            };
        })
    })
}

type insertV3 = Omit<Request, 'body'> & {
    body: {
        user: User,
        name: string
    }
}
export async function insertV3(req: insertV3 & {body: {name: string}}, res: Response) {
    await globalHandler('controller/category/insertV3', req, res, async () => {
        let resutInsert = await startTransaction(async (executeQuery) => {
            let resultGetSimilarName = await executeQuery(
                `
                SELECT
                    i_code
                FROM
                    dvw_master.vw_category
                WHERE
                    fk_business = ${req.body.user.business_code}
                    AND v_name = '${req.body.name}'
                    AND b_isactive = 1
                `
            )
            if (resultGetSimilarName.length > 0) throw ({httpResponse: {code: 500, success: false, message: 'Kategori telah ada.'}})
            let resultInsertCategory = await executeQuery(
                `
                INSERT INTO 
                    dvw_master.vw_category 
                SET 
                    fk_user_modify = ${req.body.user.user_code},
                    v_name = '${req.body.name}', 
                    fk_business = ${req.body.user.business_code}
                `
            )
            return (resultInsertCategory)
        })

        return res.status(200).json({success: true, message: 'Kategori berhasil ditambahkan.', data: resutInsert.insertId, info: resutInsert})
    })
}


export async function insertPriceMemberV3(req: typeGlobal.requestV3 & {body: {member: string, model?: string, detail:[{category:number, type:number, value:number}]}}, res: any) {
    var model = req.body.model;
    if(!model) model = "";

    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/category/insertPriceMemberV3');
            } 
            else {
                let user = await functionUser.checkToken({res, connection}, {hash: req.headers["x-auth-token"]})
                if (!user) return res.status(401).json({success: false, message: 'Credential not valid.'})

                await functionCategory.delPriceMemberByMember({
                    connection: connection,
                    res: res
                },{
                    business: user.business + "",
                    member: req.body.member,
                    model: model
                });

                var detail = req.body.detail;
                if(Array.isArray(detail) == false) detail = JSON.parse(req.body.detail.toString());

                for(let i = 0; i < detail.length; i++) {
                    var result:any = await functionCategory.insertPriceMember({
                        connection: connection,
                        res: res
                    },{
                        fk_user_modify: user.code,
                        business: user.business,
                        member: req.body.member,
                        category: detail[i].category,
                        type: detail[i].type,
                        value: detail[i].value,
                        model: model
                    });
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/category/insertPriceMemberV3');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok"
                        })
                        connection.release();
                    };
                })
            }
        })
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
    await globalHandler('controller/category/updateV3', req, res, async () => {
        let resutUpdate = await startTransaction(async (executeQuery) => {
            let getSimilarName = await executeQuery(
                `
                SELECT
                    i_code
                FROM
                    dvw_master.vw_category
                WHERE
                    fk_business = ${req.body.user.business_code}
                    AND v_name = '${req.body.name}'
                    AND i_code <> ${req.body.code}
                    AND b_isactive = 1
                `
            )
            if (getSimilarName.length > 0) throw ({httpResponse: {code: 500, success: false, message: 'Kategori telah ada.'}})
            let resultUpdateCategory = await executeQuery(
                `
                    UPDATE 
                        dvw_master.vw_category 
                    SET
                        fk_user_modify = ${req.body.user.user_code},
                        v_name = '${req.body.name}'
                    WHERE i_code = ${req.body.code}
                `
            )
            return (resultUpdateCategory)
        })

        return res.status(200).json({success: true, message: 'Kategori berhasil diubah.', data: req.body.code, info: resutUpdate})
    })
}


type delV3Request = Omit<Request, 'body'> & {
    body: {
        user: User,
        code: string
    }
}
export async function delV3(req: delV3Request, res: Response) {
    await globalHandler('controller/category/delV3', req, res, async () => {
        let resutDelete = await startTransaction(async (executeQuery) => {
            let resultDeleteCategory = await executeQuery(
                `
                    UPDATE 
                        dvw_master.vw_category 
                    SET
                        fk_user_modify = ${req.body.user.user_code},
                        b_isactive = 0
                    WHERE i_code = ${req.body.code}
                `
            )
            return (resultDeleteCategory)
        })

        return res.status(200).json({success: true, message: 'Kategori berhasil dihapus.', data: req.body.code, info: resutDelete})
    })
}

export function selectSimilarV3(req: typeCategory.selectSimiliarV3, res: Response) {
    
    function convertBody() {
        try {
            errors.checkField(req.body, ['code'])
            let requestBody = {
                code: parseFloat(req.body.code)
            }
            errors.checkNaN(requestBody.code)
            return requestBody
        } catch(err: any) {
            res.status(400).json({success: false, message: err})
        }
        
    }

    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/category/selectSimilarV3/getConnection')

        let requestBody = convertBody()!
        if (res.headersSent) return
        let responseBody: Array<Partial<{
            code: number,
            name: string,
            business_name: string,
            token: string
        }>> = []

        try {
            let user = await functionUser.checkToken({res, connection}, {hash: req.headers['x-auth-token']})
            if (!user) return res.status(401).json({success: false, message: "Credential not valid."})

            let resCategoryGetNameBusinessowner = await functionCategory.getNameBusinessOwner({res, connection}, {i_code: requestBody.code})
            if (resCategoryGetNameBusinessowner) {
                let resCategory = await functionCategory.getInOtherBusiness({res, connection}, {fk_business: user.business, i_code: requestBody.code, v_name: resCategoryGetNameBusinessowner.name, vw_business: {fk_businessowner: resCategoryGetNameBusinessowner.owner}})
                for(let eachCategory of resCategory) {
                    let eachResponseBody: typeof responseBody[0] = {}
                    eachResponseBody.code = eachCategory.code
                    eachResponseBody.business_name = eachCategory.business_name
                    eachResponseBody.name = eachCategory.name
                    let resUserGetCodeToken = await functionUser.getCodeNToken({res, connection}, {fk_business: user.business})
                    if (!resUserGetCodeToken.token) {
                        let newToken = uniqid()
                        await functionUser.updateBackofficeToken({res, connection}, {i_code: resUserGetCodeToken.code, token: newToken})
                        eachResponseBody.token = newToken
                    } else {
                        eachResponseBody.token = resUserGetCodeToken.token
                    }
                    responseBody.push(eachResponseBody)
                }
                return res.status(200).json({success: true, message: "OK", data: responseBody})
            }
        } catch {
            return errors.rollback(connection, res, err, 'controller/category/selectSimilarV3')
        }
    })
}