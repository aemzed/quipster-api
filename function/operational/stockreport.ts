import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function insert({res, connection}:typeGlobal.functions, {fk_business, fk_itemmaterial, fk_user, b_source, b_type, qty, notes, i_price}: {fk_business: number, fk_itemmaterial: number, fk_user?: number, b_source: number, b_type: number, qty: number, notes?: string, i_price?: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO 
                        dvw_operational.vw_stockreport 
                    SET
                        fk_business = ${fk_business},
                        fk_itemmaterial = ${fk_itemmaterial},
                        b_source = ${b_source},
                        i_qty = ${qty},
                        ${b_type ?
                        `b_type = ${b_type},`
                        :``}
                        ${i_price ?
                        `i_price = ${i_price},`
                        : ``}
                        ${fk_user ?
                        `fk_user = ${fk_user},`
                        : ``}
                        v_notes = '${notes ?? ''}'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/insert', resolve)
    })
}

export async function purchaseOrderInsert({res, connection}: typeGlobal.functions, {fk_business, fk_purchaseorder}: {fk_business: number, fk_purchaseorder: number}) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_operational.vw_stockreport (fk_business, fk_itemmaterial, b_source, b_type, i_qty, i_price, v_notes) 
                    SELECT
                        ${fk_business},
                        a.fk_itemmaterial,
                        2,
                        a.b_type,
                        a.i_qty,
                        a.i_price,
                        CASE
                            WHEN b.v_notes = '' THEN CONCAT(b.v_code, ' - ', 'supplier: ', c.v_name)
                            ELSE CONCAT(b.v_code, ' - ', b.v_notes, 'supplier: ', c.v_name)
                        END
                    FROM dvw_operational.vw_purchaseorderdetail a
                    JOIN dvw_operational.vw_purchaseorder b ON a.fk_purchaseorder = b.i_code
                    LEFT JOIN dvw_master.vw_supplier c ON b.fk_supplier = c.i_code
                    WHERE a.fk_business = ${fk_business}
                        AND a.fk_purchaseorder = ${fk_purchaseorder}`
        
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/purchaseOrderInsert', resolve)
    })
}

type getReportStockConsolidaation = {
    code: number,
    sku: string,
    name: string,
    stock: number,
    hpp_total: number
}
export async function getReportStockConsolidation({res, connection}: typeGlobal.functions, {fk_business, dt_created} : {fk_business?: number, dt_created: {end_date: string}}, {vw_businessowner}: {vw_businessowner?: {code?: number}}): Promise<Array<getReportStockConsolidaation>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        IF (a.b_type = 1, b.i_code, c.i_code) AS \`code\`,
                        IF (a.b_type = 1, b.v_code, '-') AS \`sku\`,
                        IF (a.b_type = 1, b.v_name, c.v_name) AS \`name\`,
                        SUM(a.i_qty) AS \`stock\`,
                        IF (a.b_type = 1, b.i_qty * b.i_pricenet, c.i_qty * c.i_price) AS \`hpp_total\`
                    FROM 
                        dvw_operational.vw_stockreport a
                        LEFT JOIN dvw_master.vw_item b ON a.fk_itemmaterial = b.i_code AND a.b_type = 1
                        LEFT JOIN dvw_master.vw_material c ON a.fk_itemmaterial = c.i_code AND a.b_type = 2
                        LEFT JOIN dvw_account.vw_business d ON a.fk_business = d.i_code
                        LEFT JOIN dvw_account.vw_businessowner e ON d.fk_businessowner = e.i_code
                    WHERE
                        1 = 1
                        ${dt_created.end_date ?
                        `AND a.dt_created <= '${dt_created.end_date}'`
                        : ''}
                        ${vw_businessowner?.code ?
                        `AND e.i_code = ${vw_businessowner.code}`
                        : ''}
                        ${fk_business ?
                        `AND a.fk_business = ${fk_business}`
                        : ''}
                    GROUP BY \`code\`
                    HAVING
                        \`name\` IS NOT NULL`
        
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getReportStockConsolidation', resolve)
    })
}

type getReportStockConsolidationNew = {
    business_code: number,
    business_name: string,
    item_sku: string,
    item_name: string,
    hpp_total: string,
    stock: string
}
export async function getReportStockConsolidationOwner({res, connection}: typeGlobal.functions, {vw_businessowner, dt_created}: {vw_businessowner: {code: number}, dt_created?: string}): Promise<Array<getReportStockConsolidationNew>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b.i_code AS \`business_code\`,
                        b.v_name AS \`business_name\`,
                        d.v_code AS \`item_sku\`,	
                        d.v_name AS \`item_name\`,
                        SUM(a.i_qty) AS \`stock\`,
                        SUM(a.i_qty) * d.i_pricenet AS \`hpp_total\`
                    FROM dvw_operational.vw_stockreport a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code AND b.b_isactive = 1
                    JOIN dvw_account.vw_businessowner c ON b.fk_businessowner = c.i_code
                    JOIN dvw_master.vw_item d ON a.fk_itemmaterial = d.i_code AND d.b_isactive = 1 AND a.b_type = 1
                    WHERE c.i_code = ${vw_businessowner.code}
                    ${dt_created ?
                    `AND a.dt_created >= '${dt_created}'`
                    :''}
                    AND a.b_isactive = 1
                    GROUP BY d.i_code, b.i_code
                    ORDER BY item_sku`
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getReportStockConsolidationOwner', resolve)
    })
}

export async function getReportStockConsolidationUser({res, connection}: typeGlobal.functions, {vw_business_user, dt_created}: {vw_business_user: {code: number}, dt_created?: string}): Promise<Array<getReportStockConsolidationNew>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        b.i_code AS \`business_code\`,
                        b.v_name AS \`business_name\`,
                        d.v_code AS \`item_sku\`,	
                        d.v_name AS \`item_name\`,
                        SUM(a.i_qty) AS \`stock\`,
                        SUM(a.i_qty) * d.i_pricenet AS \`hpp_total\`
                    FROM dvw_operational.vw_stockreport a
                    JOIN dvw_account.vw_business b ON a.fk_business = b.i_code AND b.b_isactive = 1
                    JOIN dvw_account.vw_business_user c ON b.i_code = c.fk_business
                    JOIN dvw_master.vw_item d ON a.fk_itemmaterial = d.i_code AND d.b_isactive = 1 AND a.b_type = 1
                    WHERE c.fk_user = ${vw_business_user.code}
                    ${dt_created ?
                    `AND a.dt_created <= '${dt_created}'`
                    :''}
                    AND a.b_isactive = 1
                    GROUP BY d.i_code, b.i_code
                    ORDER BY item_sku`
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getReportStockConsolidationUser', resolve)
    })
}

export async function getReportStockMovingHeader({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        z.code,
                        z.type,
                        z.name,
                        z.customcode AS \`sku\`,
                        z.category,
                        z.unitname AS \`unit_name\`,
                        SUM(z.production) AS production,
                        SUM(z.po) AS \`purchase_order\`,
                        SUM(z.adjustment) AS adjustment,
                        SUM(z.transfer) AS transfer,
                        SUM(z.transactions) AS transactions,
                        SUM(z.voids) AS voids,
                        IFNULL((
                            SELECT 
                                SUM(b.i_qty)
                            FROM dvw_operational.vw_stockreport b
                            WHERE b.fk_business = ${fk_business}
                                AND DATE_FORMAT(b.dt_created, '%Y-%m-%d') < '${dt_created.date_start}'
                                AND b.fk_itemmaterial = z.code
                                AND b.b_type = z.\`type\`
                                AND b.b_isactive = 1
                            GROUP BY b.fk_itemmaterial, b.b_type
                        ), 0) AS \`first\`,
                        IFNULL((
                            SELECT 
                                CASE
                                    WHEN b.i_hpp >= 0 THEN SUM(b.i_hpp * b.i_qty)
                                    ELSE SUM(0)
                                END
                            FROM dvw_operational.vw_stockreport b
                            WHERE b.fk_business = ${fk_business}
                                AND DATE_FORMAT(b.dt_created, '%Y-%m-%d') < '${dt_created.date_start}'
                                AND b.fk_itemmaterial = z.code
                                AND b.b_type = z.\`type\`
                                AND b.b_isactive = 1
                            GROUP BY b.fk_itemmaterial, b.b_type
                        ), 0) AS \`first_hpp\`,
                        IFNULL((
                            SELECT 
                                SUM(b.i_qty)
                            FROM dvw_operational.vw_stockreport b
                            WHERE b.fk_business = ${fk_business}
                                AND DATE_FORMAT(b.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                                AND b.fk_itemmaterial = z.code
                                AND b.b_type = z.\`type\`
                                AND b.b_isactive = 1
                            GROUP BY b.fk_itemmaterial, b.b_type
                        ), 0) AS \`end\`,
                        IFNULL((
                            SELECT 
                                CASE
                                    WHEN b.i_hpp >= 0 THEN SUM(b.i_hpp * b.i_qty)
                                    ELSE SUM(0)
                                END
                            FROM dvw_operational.vw_stockreport b
                            WHERE b.fk_business = ${fk_business}
                                AND DATE_FORMAT(b.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                                AND b.fk_itemmaterial = z.code
                                AND b.b_type = z.\`type\`
                                AND b.b_isactive = 1
                            GROUP BY b.fk_itemmaterial, b.b_type
                        ), 0) AS \`last_hpp\`,
                        SUM(\`plus\`) AS \`plus\`,
                        SUM(\`minus\`) AS \`minus\`,
                        IFNULL(SUM(\`plus_hpp\`),0) AS \`plus_hpp\`,
                        IFNULL(SUM(\`minus_hpp\`),0) AS \`minus_hpp\`,
                        IFNULL(SUM(\`plus_price\`),0) AS \`plus_price\`,
                        IFNULL(SUM(\`minus_price\`),0) AS \`minus_price\`
                    FROM 
                    (						
                        SELECT 
                            a.fk_itemmaterial AS \`code\`,
                            a.b_type AS \`type\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.b_isactive FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT b.b_isactive FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                            END AS \`active\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.v_name FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT b.v_name FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                            END AS \`name\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.v_code FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN '-'
                            END AS \`customcode\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_unit c WHERE b.fk_unit = c.i_code AND a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT c.v_name FROM dvw_master.vw_material b, dvw_master.vw_unit c WHERE b.fk_unit = c.i_code AND a.fk_itemmaterial = b.i_code)
                            END AS \`unitname\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_category c WHERE b.fk_category = c.i_code AND a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN '-'
                            END AS \`category\`,
                            case a.b_source
                                when 1 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS production,
                            case a.b_source
                                when 2 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS po,
                            case a.b_source
                                when 3 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS adjustment,
                            case a.b_source
                                when 4 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS transfer,
                            case a.b_source
                                when 5 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS transactions,
                            case a.b_source
                                when 6 then SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS voids,
                            CASE 
                                WHEN a.i_qty > 0  THEN SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS \`plus\`,
                            CASE 
                                WHEN a.i_qty < 0  THEN SUM(a.i_qty)
                                ELSE SUM(0)
                            END AS \`minus\`,
                            IFNULL(CASE 
                                WHEN a.i_qty > 0  THEN SUM(IFNULL(a.i_hpp,0) * a.i_qty)
                                ELSE SUM(0)
                            END,0) AS \`plus_hpp\`,
                            IFNULL(CASE 
                                WHEN a.i_qty < 0  THEN SUM(IFNULL(a.i_hpp,0) * a.i_qty)
                                ELSE SUM(0)
                            END,0) AS \`minus_hpp\`,
                            IFNULL(CASE 
                                WHEN a.i_qty > 0  THEN SUM(IFNULL(a.i_price,0) * a.i_qty)
                                ELSE SUM(0)
                            END,0) AS \`plus_price\`,
                            IFNULL(CASE 
                                WHEN a.i_qty < 0  THEN SUM(IFNULL(a.i_price,0) * a.i_qty)
                                ELSE SUM(0)
                            END,0) AS \`minus_price\`
                        FROM dvw_operational.vw_stockreport a
                        WHERE a.fk_business = ${fk_business}
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                            AND a.i_qty <> 0
                            AND a.b_isactive = 1
                        GROUP BY a.fk_itemmaterial, a.b_type, a.b_source
                    ) AS z
                    WHERE z.active = 1
                    GROUP BY z.code, z.\`type\`
                    ORDER BY z.name;`
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getReportStockMovingHeader', resolve)
    })
}

export async function getReportStockMovingDetail({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created:{date_start: string, date_end: string}}, {itemmaterialname, itemmaterialtype}: {itemmaterialname: string, itemmaterialtype: number}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT \`date\`, \`type\`, \`name\`, \`sku\`, \`qty\`, \`price\`, \`hpp\`, b.v_name AS \`unit\`, \`category\`, \`movingtype\` AS \`moving_type\`, \`notes\` 
                    FROM
                    (
                        SELECT
                            a.i_code AS \`id\`,
                            a.dt_created AS \`date\`,
                            a.fk_itemmaterial AS \`code\`,
                            CASE a.b_type
                                WHEN 1 THEN 'Product'
                                WHEN 2 THEN 'Material'
                            END AS \`type\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.v_name FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT b.v_name FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                            END AS \`name\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.v_code FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN ''
                            END AS \`sku\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.fk_unit FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT b.fk_unit FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                            END AS \`unitcode\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.fk_category FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN 0
                            END AS \`categorycode\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_category c WHERE b.fk_category = c.i_code AND a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN '-'
                            END AS \`category\`,
                            i_qty AS \`qty\`,
                            CASE a.b_source
                                WHEN 0 THEN 'Initial Stock'
                                WHEN 1 THEN 'Production'
                                WHEN 2 THEN 'Purchase Order'
                                WHEN 3 THEN 'Stock Adjustment'
                                WHEN 4 THEN 'Stock Transfer'
                                WHEN 5 THEN 'Transaction'
                                WHEN 6 THEN 'Void Transaction'
                            END AS \`movingtype\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.b_hasstock FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN 1
                            END AS \`hasstock\`,
                            CASE a.b_type
                                WHEN 1 THEN (SELECT b.b_isactive FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                WHEN 2 THEN (SELECT b.b_isactive FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                            END AS \`active\`,
                            a.b_type AS \`typecode\`,
                            TRIM(a.v_notes) AS \`notes\`,
                            IFNULL(a.i_price, 0) AS \`price\`,
                            IFNULL(a.i_hpp, 0) AS \`hpp\`
                        FROM dvw_operational.vw_stockreport a
                        WHERE a.fk_business = ${fk_business}
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${dt_created.date_start}'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${dt_created.date_end}'
                            AND a.b_isactive = 1
                    ) AS temp
                    JOIN dvw_master.vw_unit b ON temp.unitcode = b.i_code
                    WHERE temp.active = 1
                        AND temp.hasstock = 1
                        AND trim(temp.name) LIKE trim('${itemmaterialname}')
                        AND temp.typecode = '${itemmaterialtype}'
                    ORDER BY temp.date, temp.id;`
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getStockMovingDetail', resolve)
    })
}

export async function getReportStockAdjustment({res, connection}: typeGlobal.functions, {fk_business, dt_created}: {fk_business: number, dt_created: {date_start: string, date_end: string}}) {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.dt_created AS \`date\`,
                        b.v_code AS \`sku\`,
                        b.v_name AS \`name\`,
                        a.i_hpp AS \`hpp\`,
                        a.i_price AS \`price\`,
                        IFNULL((
                            SELECT SUM(z.i_qty)
                            FROM dvw_operational.vw_stockreport z
                            WHERE z.fk_itemmaterial = a.fk_itemmaterial
                                AND z.fk_business = a.fk_business
                                AND z.b_type = a.b_type
                                AND z.i_code < a.i_code
                        ), 0) AS \`qty_old\`,
                        a.i_qty AS \`qty_new\`,
                        a.v_notes AS \`notes\`
                    FROM dvw_operational.vw_stockreport a
                    JOIN dvw_master.vw_item b ON a.fk_itemmaterial = b.i_code AND a.b_type = 1
                    WHERE a.fk_business = ${fk_business}
                        AND a.b_source = 3
                        AND a.dt_created >= '${dt_created.date_start}'
                        AND a.dt_created <= DATE_ADD('${dt_created.date_end}', INTERVAL 1 DAY)
                    ORDER BY a.dt_created ASC`
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getReportStockAdjustment', resolve)
    })
}

type getItemStockByName = {
    itemmaterialname: string,
    stock: number
}
export async function getItemStockByName({res, connection}: typeGlobal.functions, {fk_business, v_name}: {fk_business: number, v_name: string}): Promise<Array<getItemStockByName>> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        IF(a.b_type = 1, b.v_name, c.v_name) as itemmaterialname,
                        SUM(a.i_qty) as stock
                    FROM
                        dvw_operational.vw_stockreport a
                    LEFT JOIN
                        dvw_master.vw_item b ON a.b_type = 1 AND b.i_code = a.fk_itemmaterial AND b.fk_business = ${fk_business}
                    LEFT JOIN
                        dvw_master.vw_material c ON a.b_type = 2 AND c.i_code = a.fk_itemmaterial AND c.fk_business = ${fk_business}
                    WHERE
                        a.fk_business = ${fk_business}
                    GROUP BY
                        b.i_code, c.i_code
                    HAVING
                        itemmaterialname LIKE '%${v_name}%'
                    `
        functionGlobal.query(query, res, connection, 'function/operational/stockreport/getItemStockByName', resolve)
    })
}