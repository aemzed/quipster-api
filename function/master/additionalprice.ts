import { ResultSetHeader } from 'mysql2';

import * as typeGlobal from '../../type/global'

import * as functionGlobal from '../global_function'

type updatePrice = ResultSetHeader
export function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, fk_additional}: {fk_user_modify: number, fk_business: number, fk_additional: number}): Promise<updatePrice> {
    return new Promise(function(resolve, reject) {
        let query = `UPDATE 
                        dvw_master.vw_additionalprice 
                    SET 
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE fk_business = ${fk_business}
                        AND fk_additional = ${fk_additional}`;
        functionGlobal.query(query, res, connection, 'function/additional/updatePrice', resolve);
    })
}

type insertPrice = ResultSetHeader
export function insertPrice({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, fk_additional, i_price}: {fk_user_modify: number, fk_business: number, fk_additional: number, i_price: number}): Promise<insertPrice> {
    return new Promise(function(resolve, reject) {
        let query = `INSERT INTO 
                        dvw_master.vw_additionalprice 
                    SET 
                        fk_user_modify = ${fk_user_modify},
                        fk_business = ${fk_business}, 
                        fk_additional = ${fk_additional}, 
                        i_price = ${i_price}`;
        functionGlobal.query(query, res, connection, 'function/additional/insertPrice', resolve);
    })
}