import * as typeGlobal from '../../type/global'

import * as functionGlobal from '../global_function'
import * as functionLog from '../master/log'

type getMinOrderNPrice = {
    min_order: any,
    price: any
}
export function getMinOrderNPrice({res, connection}: typeGlobal.functions, {fk_item}: {fk_item: number}): Promise<Array<getMinOrderNPrice>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_min_order AS \`min_order\`,
                        a.i_price AS \`price\`
                    FROM dvw_master.vw_item_price_distributor a
                    WHERE a.fk_item = "${fk_item}"
                    ORDER BY a.i_min_order`
        functionGlobal.query(query, res, connection, 'function/master/item_price_distributer/getMinOrderPrice', resolve)
    })
}

export function hardDelete({res, connection}: typeGlobal.functions, {fk_user_modify, fk_item}: {fk_user_modify: number, fk_item: number}) {
    return new Promise(async (resolve, reject) => {
        let query = `DELETE FROM dvw_master.vw_item_price_distributor
                    WHERE fk_item = ${fk_item}`
        functionGlobal.query(query, res, connection, 'function/master/item_price_distributor/softDelete', resolve)
    })
}

export function insert({res, connection}: typeGlobal.functions, {fk_user_modify, fk_item, i_min_order, i_price}: {fk_user_modify: number, fk_item: number, i_min_order: number, i_price: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_master.vw_item_price_distributor
                    SET
                        fk_user_modify = ${fk_user_modify},
                        fk_item = ${fk_item}, 
                        i_min_order = ${i_min_order}, 
                        i_price = ${i_price}`
        functionGlobal.query(query, res, connection, 'function/master/item_price_distributor/insert', resolve)
    })
}