import * as functionGlobal from '../global_function';
import * as typeGlobal from '../../type/global';
import { ResultSetHeader } from 'mysql2';

type get = {
    code: number,
    customcode: string,
    name: string,
    image: string,
    email: string,
    address: string,
    phone: string,
    notes: string
}

export function get({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<get>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                            a.i_code AS code,
                            a.v_code AS customcode,
                            a.v_name AS name,
                            a.v_image AS image,
                            a.v_email AS email,
                            a.v_address AS address,
                            a.v_phone AS phone,
                            a.v_notes AS notes
                        FROM dvw_master.vw_supplier a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/supplier/get', resolve);
    })
}

type remove = ResultSetHeader
export function remove({ res, connection }: typeGlobal.functions, { fk_business, code, fk_user_modify }: { fk_business: number , code: number, fk_user_modify: number}): Promise<remove> {
    return new Promise(function (resolve, reject) {
        let query = `   UPDATE dvw_master.vw_supplier SET
                                b_isactive = 0,
                                fk_user_modify = ${fk_user_modify}
                            WHERE i_code = ${code}
                            AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/supplier/remove', resolve);
    })
}

