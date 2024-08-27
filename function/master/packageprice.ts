import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function softDelete({res, connection}: typeGlobal.functions, {fk_user_modify, fk_business, fk_package}: {fk_user_modify: number, fk_business: number, fk_package: number}) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE dvw_master.vw_packageprice SET
                        fk_user_modify = ${fk_user_modify},
                        b_isactive = 0
                    WHERE fk_business = ${fk_business}
                        AND fk_package = ${fk_package}`
        
        functionGlobal.query(query, res, connection, 'function/master/packageprice/softDelete', resolve)
    })
}

export async function insert({res, connection}: typeGlobal.functions, {
    fk_user_modify, fk_business, fk_package, hpp, price, price2, price3, price4, price5
} : {
    fk_user_modify: number, fk_business: number, fk_package: number, hpp: number, price: number, price2: number, price3: number, price4: number, price5: number
}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_master.vw_packageprice
                    SET
                        fk_user_modify = ${fk_user_modify},
                        fk_business = ${fk_business},
                        fk_package = ${fk_package},
                        i_hpp = ${hpp},
                        i_price = ${price},
                        i_price2 = ${price2},
                        i_price3 = ${price3},
                        i_price4 = ${price4},
                        i_price5 = ${price5},
                        b_usetrigger = 0,
                        v_notes = 'Perubahan HPP produk'`
        
        functionGlobal.query(query, res, connection, 'function/master/packageprice/insert', resolve)
    })
}