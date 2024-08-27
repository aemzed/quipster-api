import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from 'mysql2';

export async function updatePricenet({ res, connection }: typeGlobal.functions, { fk_user_modify, pricenet, code }: { fk_user_modify: number, pricenet: number, code: number }) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_package SET
                        fk_user_modify = ${fk_user_modify},
                        i_pricenet = ${pricenet}
                    WHERE i_code = ${code}`
        
        functionGlobal.query(query, res, connection, 'function/master/package/updatePricenet', resolve)
    })
}

type get = {
    code: number,
    alias: string,
    name: string,
    image: string,
    use_price_distributor: string,
    price1: string,
    price2: string,
    price3: string,
    price4: string,
    price5: string,
    price_net: string,
    notes: string
}

export function get({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                            a.i_code AS code,
                            a.v_code AS alias,
                            a.v_name AS name,
                            a.v_image AS image,
                            a.b_distributor AS use_price_distributor,
                            a.i_price AS price1,
                            a.i_price2 AS price2,
                            a.i_price3 AS price3,
                            a.i_price4 AS price4,
                            a.i_price5 AS price5,
                            a.i_pricenet AS price_net,
                            a.v_notes AS notes,
                            (
                                SELECT COUNT(z.b_isactive)
                                FROM dvw_master.vw_packagedetail z
                                JOIN dvw_master.vw_item y ON z.fk_item = y.i_code
                                WHERE z.fk_package = a.i_code
                                    AND z.b_isactive = 1
                                    AND y.b_isactive = 1
                            ) AS count_detail
                        FROM dvw_master.vw_package a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/package/get', resolve);
    })
}

type selectDetail = {
    item_code: number,
    item_name: string,
    qty: number
}
export function selectDetail({ res, connection }: typeGlobal.functions, { code }: { code: number }): Promise<Array<selectDetail>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                            a.fk_item AS item_code,
                            b.v_name AS item_name,
                            a.i_qty AS qty
                        FROM dvw_master.vw_packagedetail a
                        JOIN dvw_master.vw_item b ON a.fk_item = b.i_code
                        WHERE a.b_isactive = 1
                            AND b.b_isactive = 1
                            AND a.fk_package = ${code}`
        functionGlobal.query(query, res, connection, 'function/package/select', resolve);
    })
}

type selectOrder = {
    min_order: string,
    price: number
}
export function selectOrder({ res, connection }: typeGlobal.functions, { code }: { code: number }): Promise<Array<selectOrder>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                            a.i_min_order AS min_order,
                            a.i_price AS price
                        FROM dvw_master.vw_package_price_distributor a
                        WHERE a.fk_package = ${code}
                        ORDER BY a.i_min_order`
        functionGlobal.query(query, res, connection, 'function/package/select', resolve);
    })
}

type selectPackage = {
    name: string
}
export function selectPackage({ res, connection }: typeGlobal.functions, { fk_business, name, code }: { fk_business: number, name: string, code: number }): Promise<Array<selectPackage>> {
    return new Promise(function (resolve, reject) {
        let query = ` SELECT 
                        a.v_name AS name
                    FROM dvw_master.vw_package a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.v_name = '${name}'
                        AND a.i_code <> ${code}`
        functionGlobal.query(query, res, connection, 'function/package/select', resolve);
    })
}

type remove = ResultSetHeader
export async function remove({ res, connection }: typeGlobal.functions, { fk_business, code, fk_user_modify }: { fk_business: number, code: number, fk_user_modify: number }): Promise<remove> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_package SET
                        b_isactive = 0,
                        fk_user_modify = ${fk_user_modify}
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/package/remove', resolve)
    })
}

type insert = ResultSetHeader
export async function insert({ res, connection }: typeGlobal.functions, { fk_business, name, notes, price1, price2, price3, price4, price5, usePriceDistributor, fk_user_modify }: { fk_business: number, name: string, notes: string, price1: number, price2: number, price3: number, price4: number, price5: number, usePriceDistributor: number, fk_user_modify: number }): Promise<insert> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_package(fk_business, v_code, v_name, v_notes, i_price, i_price2, i_price3, i_price4, i_price5, b_distributor, fk_user_modify)
                            VALUES (${fk_business}, '', '${name}', '${notes}', ${price1}, ${price2}, ${price3}, ${price4}, ${price5}, ${usePriceDistributor}, ${fk_user_modify})`
        functionGlobal.query(query, res, connection, 'function/master/package/insert', resolve)
    })
}

type insertPrice = ResultSetHeader
export async function insertPrice({ res, connection }: typeGlobal.functions, { id, minOrder, price, fk_user_modify }: { id: number, minOrder: number, price: number, fk_user_modify: number }): Promise<insertPrice> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_package_price_distributor(fk_package, i_min_order, i_price, fk_user_modify)
                                    VALUES (${id}, ${minOrder}, ${price}, ${fk_user_modify})`
        functionGlobal.query(query, res, connection, 'function/master/package/insertPrice', resolve)
    })
}

type selectPriceNet = {
    price_net: string
}
export async function selectPriceNet({ res, connection }: typeGlobal.functions, { itemCode }: { itemCode: number }): Promise<Array<selectPriceNet>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT a.i_pricenet AS price_net
                        FROM dvw_master.vw_item a
                        WHERE a.b_isactive = 1
                            AND a.i_code = ${itemCode}`
        functionGlobal.query(query, res, connection, 'function/master/package/selectPriceNet', resolve)
    })
}

type insertPackageDetail = ResultSetHeader
export async function insertPackageDetail({ res, connection }: typeGlobal.functions, { fk_business, id, itemCode, qty, fk_user_modify }: { fk_business: number, id: number, itemCode: number, qty: number, fk_user_modify: number }): Promise<insertPackageDetail> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_packagedetail(fk_business, fk_package, fk_item, i_qty, fk_user_modify)
                        VALUES (${fk_business}, ${id}, ${itemCode}, ${qty}, ${fk_user_modify})`
        functionGlobal.query(query, res, connection, 'function/master/package/insertPackageDetail', resolve)
    })
}

type updatePackage = ResultSetHeader
export async function updatePackage({ res, connection }: typeGlobal.functions, { fk_business, id, priceNet, fk_user_modify }: { fk_business: number, id: number, priceNet: number, fk_user_modify: number }): Promise<updatePackage> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_package SET
                            i_pricenet = ${priceNet},
                            fk_user_modify = ${fk_user_modify}
                        WHERE i_code = ${id}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/package/updatePackage', resolve)
    })
}

type updateNamePackage = ResultSetHeader
export async function updateNamePackage({ res, connection }: typeGlobal.functions, { fk_business, name, notes, code, fk_user_modify }: { fk_business: number, name: string, notes: string, code: number, fk_user_modify: number }): Promise<updateNamePackage> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_package SET
                        v_name = '${name}', 
                        v_notes = '${notes}',
                        fk_user_modify = ${fk_user_modify}
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/package/updateNamePackage', resolve)
    })
}

type updatePackageDetail = ResultSetHeader
export async function updatePackageDetail({ res, connection }: typeGlobal.functions, { fk_business, code, fk_user_modify }: { fk_business: number, code: number, fk_user_modify: number }): Promise<updatePackageDetail> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_packagedetail SET
                        b_isactive = 0,
                        fk_user_modify = ${fk_user_modify}
                    WHERE fk_package = ${code}
                    AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/package/updatePackageDetail', resolve)
    })
}

type updatePackagePrice = ResultSetHeader
export async function updatePackagePrice({ res, connection }: typeGlobal.functions, { fk_business, code, fk_user_modify }: { fk_business: number, code: number, fk_user_modify: number }): Promise<updatePackagePrice> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_packageprice SET 
                            b_isactive = 0,
                            fk_user_modify = ${fk_user_modify}
                        WHERE fk_package = ${code}
                        AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/master/package/updatePackagePrice', resolve)
    })
}

type updateInsertPrice = ResultSetHeader
export async function updateInsertPrice({ res, connection }: typeGlobal.functions, { fk_business, code, price, price2, price3, price4, price5, fk_user_modify }: { fk_business: number, code: number, price: number, price2: number, price3: number, price4: number, price5: number, fk_user_modify: number }): Promise<updateInsertPrice> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_packageprice(fk_business, fk_package, i_price, i_price2, i_price3, i_price4, i_price5, fk_user_modify) 
                        VALUES (${fk_business}, ${code}, ${price}, ${price2}, ${price3}, ${price4}, ${price5}, ${fk_user_modify})`
        functionGlobal.query(query, res, connection, 'function/master/package/updateInsertPrice', resolve)
    })
}

type updatePackageDistributor = ResultSetHeader
export async function updatePackageDistributor({ res, connection }: typeGlobal.functions, { fk_business, code, usePriceDistributor, fk_user_modify }: { fk_business: number, code: number, usePriceDistributor: number, fk_user_modify: number }): Promise<updatePackageDistributor> {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_package SET 
                        b_distributor = ${usePriceDistributor},
                        fk_user_modify = ${fk_user_modify}
                    WHERE fk_business = ${fk_business}
                        AND i_code = ${code}`
        functionGlobal.query(query, res, connection, 'function/master/package/updatePackageDistributor', resolve)
    })
}

type deletePackageDistributor = ResultSetHeader
export async function deletePackageDistributor({ res, connection }: typeGlobal.functions, { code }: { code: number }): Promise<deletePackageDistributor> {
    return new Promise((resolve, reject) => {
        let query = `DELETE FROM dvw_master.vw_package_price_distributor
                        WHERE fk_package = ${code}`
        functionGlobal.query(query, res, connection, 'function/master/package/deletePackageDistributor', resolve)
    })
}

