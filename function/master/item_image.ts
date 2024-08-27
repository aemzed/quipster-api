import * as typeGlobal from '../../type/global'

import * as functionGlobal from '../../function/global_function'

type getCodeNImage = {
    code: any,
    image: any
}
export function getCodeNImage({res, connection}: typeGlobal.functions, {fk_item}: {fk_item: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.v_code AS \`code\`,
                        a.v_image AS \`image\`
                    FROM dvw_master.vw_item_image a
                    WHERE a.fk_item = ${fk_item}
                        AND a.b_isactive =1
                    ORDER BY a.v_code`
        functionGlobal.query(query, res, connection, 'function/master/item_image', resolve)
    })
}