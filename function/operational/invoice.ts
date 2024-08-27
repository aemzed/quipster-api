import * as functionGlobal from '../global_function'
import * as typeGlobal from '../../type/global'

export function getReportInvoiceDetail({res, connection}: typeGlobal.functions, {vw_customer, fk_business}: {vw_customer: {v_code: string}, fk_business: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_code AS \`code\`,
                        a.v_code AS \`invoice_code\`,
                        a.i_totalinvoice AS \`total_invoice\`,
                        a.i_totalleft AS \`total_left\`,
                        a.dt_invoice AS \`date\`
                    FROM dvw_operational.vw_invoice a
                    JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    WHERE b.v_code = '${vw_customer.v_code}'
                        AND a.fk_business = ${fk_business}
                    ORDER BY a.i_code DESC;`
        functionGlobal.query(query, res, connection, 'function/operational/invoice/getReportInvoiceDetail', resolve)
    })
}