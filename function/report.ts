import pool from '../config/connect';
import * as functionGlobal from './global_function';
import * as typeGlobal from '../type/global'
import * as type from '../type/report'


export function getExpense({connection, res, data}: typeGlobal.functions & {data: typeGlobal.functionsReport}): Promise<type.expense[]> {
    return new Promise(function(resolve, reject) {
        // let query = `   CALL dvw_view.RP_EXPENSE(${data.business}, '%', '${data.date_start}', '${data.date_end}', '0', 'ASC')`;

        let query = `   SELECT 
                            a.i_code AS code,
                            b.v_name AS type,
                            a.v_name AS name,
                            a.v_receipt AS receipt,
                            DATE(a.dt_expense) AS date,
                            a.dt_created AS date_complete,
                            a.i_type AS type_cash,
                            a.i_price AS total,
                            a.v_notes AS notes,
                            a.v_image AS image,
                            a.dt_created AS sort
                        FROM dvw_operational.vw_expense a
                        JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                        WHERE
                            a.fk_business = ${data.business}
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${data.date_start}'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${data.date_end}'
                            AND b.i_code LIKE '%'
                            AND a.b_isactive = 1
                        ORDER BY sort ASC, a.dt_expense;`;

        functionGlobal.query(query, res, connection, 'function/report/getExpense', resolve);
    })
}

export function getStockComplete({connection, res, data}: typeGlobal.functions & {data: typeGlobal.functionsReport}): Promise<type.stockComplete> {
    return new Promise(function(resolve, reject) {
        let query = `   SELECT
                            z.code,
                            z.type,
                            z.name,
                            z.customcode,
                            z.category,
                            z.unitname,
                            SUM(z.production) AS production,
                            SUM(z.po) AS po,
                            SUM(z.adjustment) AS adjustment,
                            SUM(z.transfer) AS transfer,
                            SUM(z.transactions) AS transactions,
                            SUM(z.voids) AS voids,
                            IFNULL((
                                SELECT 
                                    SUM(b.i_qty)
                                FROM dvw_operational.vw_stockreport b
                                WHERE b.fk_business = ${data.business}
                                    AND DATE_FORMAT(b.dt_created, '%Y-%m-%d') < '${data.date_start}'
                                    AND b.fk_itemmaterial = z.code
                                    AND b.b_type = z.type
                                    AND b.b_isactive = 1
                                GROUP BY b.fk_itemmaterial, b.b_type
                            ), 0) AS first,
                            SUM(plus) AS plus,
                            SUM(minus) AS minus,
                            SUM(plus_hpp) AS plus_hpp,
                            SUM(minus_hpp) AS minus_hpp
                        FROM 
                        (						
                            SELECT 
                                a.fk_itemmaterial AS code,
                                a.b_type AS type,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.b_isactive FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT b.b_isactive FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS active,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.v_name FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT b.v_name FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS name,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.v_code FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN '-'
                                END AS customcode,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_unit c WHERE b.fk_unit = c.i_code AND a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT c.v_name FROM dvw_master.vw_material b, dvw_master.vw_unit c WHERE b.fk_unit = c.i_code AND a.fk_itemmaterial = b.i_code)
                                END AS unitname,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_category c WHERE b.fk_category = c.i_code AND a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN '-'
                                END AS category,
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
                                END AS plus,
                                CASE 
                                    WHEN a.i_qty < 0  THEN SUM(a.i_qty)
                                    ELSE SUM(0)
                                END AS minus,
                                CASE 
                                    WHEN a.i_qty > 0  THEN SUM(a.i_hpp * a.i_qty)
                                    ELSE SUM(0)
                                END AS plus_hpp,
                                CASE 
                                    WHEN a.i_qty < 0  THEN SUM(a.i_hpp * a.i_qty)
                                    ELSE SUM(0)
                                END AS minus_hpp
                            FROM dvw_operational.vw_stockreport a
                            WHERE a.fk_business = ${data.business}
                                AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '${data.date_start}'
                                AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${data.date_end}'
                                AND a.b_isactive = 1
                                AND a.i_qty <> 0
                            GROUP BY a.fk_itemmaterial, a.b_type, a.b_source
                        ) AS z
                        WHERE z.active = 1
                        GROUP BY z.code, z.type
                        ORDER BY z.name`;

        functionGlobal.query(query, res, connection, 'function/report/getStockComplete', resolve);
    })
}

type listAddOn = {
    absence: number,
    product_by_customer: number,
    table_management: number,
    product_hpp: number,
    purchase_order_detail: number,
    purchase_order_summary: number,
    transfer_stock_detail: number,
    transfer_stock_summary: number,
    stock_adjustment: number,
    stock_opname: number,
    stock_opname_ignore: number,
    commision: number,
    profit_sharing: number,
    sales_product_consolidation: number
}
export async function listAddOn({res, connection}: typeGlobal.functions, {fk_business}: {fk_business: number}): Promise<listAddOn> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.b_absence AS 'absence',
                        a.b_product_by_customer AS 'product_by_customer',
                        a.b_table_management AS 'table_management',
                        a.b_product_hpp AS 'product_hpp',
                        a.b_purchase_order_detail AS 'purchase_order_detail',
                        a.b_purchase_order_summary AS 'purchase_order_summary',
                        a.b_transfer_stock_detail AS 'transfer_stock_detail',
                        a.b_transfer_stock_summary AS 'transfer_stock_summary',
                        a.b_stock_adjustment AS 'stock_adjustment',
                        a.b_stock_opname AS 'stock_opname',
                        a.b_stock_opname_ignore AS 'stock_opname_ignore',
                        IFNULL(b.b_commision, 0) AS 'commision',
                        IFNULL(b.b_ticketing, 0) AS 'ticketing',
                        IFNULL(b.b_profit_sharing, 0) AS 'profit_sharing',
                        IFNULL(c.b_sales_product_consolidation, 0) AS 'sales_product_consolidation'
                    FROM dvw_setting.vw_report a
                    LEFT JOIN dvw_setting.vw_other b ON a.fk_business = b.fk_business
                    LEFT JOIN dvw_setting.vw_report c ON a.fk_business = c.fk_business
                    WHERE a.fk_business = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/report/listAddOn', resolve)
    })
}

type getExpenseToday = {
    code: number, 
    expensecode: number,
    type: number,
    expense: string,
    name: string,
    receipt: string,
    price: number,
    dateexpense: string,
    notes: string, 
    confirm: number,
    image: string
}
export async function getExpenseToday({res, connection}: typeGlobal.functions, {fk_business, user}: {fk_business: number, user: string}): Promise<Array<getExpenseToday>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                            a.i_code AS code,
                            a.fk_expense AS expensecode,
                            a.i_type AS type,
                            b.v_name AS expense,
                            a.v_name AS name,
                            a.v_receipt AS receipt,
                            a.i_price AS price,
                            a.dt_expense AS dateexpense,
                            a.v_notes AS notes,
                            a.b_isconfirm AS confirm,
                            a.v_image AS image
                        FROM dvw_operational.vw_expense a
                        JOIN dvw_master.vw_expense b ON a.fk_expense = b.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${user ? `AND a.fk_user LIKE '${user}'` : ''}
                            AND DATE(a.dt_created) = DATE(NOW())
                        ORDER BY a.dt_expense`
        functionGlobal.query(query, res, connection, 'function/report/getExpenseToday', resolve)
    })
}


type stock = {
    code: number, 
    type: string,
    name: string,
    sku: string,
    qty: number,
    hpp: number,
    hpp_total: number,
    price: number,
    price_total: number,
    unit_name: string,
    category_name: string, 
    category_code: number
}
export async function stock({res, connection}: typeGlobal.functions, {business, date}: {business: number, date: string}): Promise<Array<stock>> {
    return new Promise((resolve, reject) => {
        let query = `   SELECT 
                            code, 
                            type, 
                            name, 
                            sku, 
                            qty, 
                            hpp, 
                            hpp_total, 
                            price, 
                            price_total, 
                            b.v_name AS unit_name, 
                            category AS category_name, 
                            categorycode AS category_code
                        FROM (
                            SELECT
                                a.fk_itemmaterial AS code,
                                CASE a.b_type
                                    WHEN 1 THEN 'Product'
                                    WHEN 2 THEN 'Material'
                                END AS type,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT TRIM(b.v_name) FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT TRIM(b.v_name) FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS name,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.v_code FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN ''
                                END AS sku,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.fk_unit FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT b.fk_unit FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS unitcode,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.b_hasformula FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN 0
                                END AS formula,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.fk_category FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN 0
                                END AS categorycode,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT c.v_name FROM dvw_master.vw_item b, dvw_master.vw_category c WHERE b.fk_category = c.i_code AND a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN '-'
                                END AS category,
                                SUM(i_qty) AS qty,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.i_pricenet FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT b.i_price FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS hpp,
                                CASE a.b_type
                                    WHEN 1 THEN SUM(i_qty) * (SELECT b.i_pricenet FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN SUM(i_qty) * (SELECT b.i_price FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS hpp_total,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.i_price FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN 0
                                END AS price,
                                CASE a.b_type
                                    WHEN 1 THEN SUM(i_qty) * (SELECT b.i_price FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN 0
                                END AS price_total,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT b.b_hasstock FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN 1
                                END AS hasstock,
                                CASE a.b_type
                                    WHEN 1 THEN (SELECT
                                                    CASE
                                                        WHEN b.b_hasstock = 0 THEN 0
                                                        ELSE b.b_isactive
                                                    END
                                                FROM dvw_master.vw_item b WHERE a.fk_itemmaterial = b.i_code)
                                    WHEN 2 THEN (SELECT b.b_isactive FROM dvw_master.vw_material b WHERE a.fk_itemmaterial = b.i_code)
                                END AS active,
                                a.b_type AS typecode
                            FROM dvw_operational.vw_stockreport a
                            WHERE a.fk_business = ${business}
                                AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '${date}'
                                AND a.b_isactive = 1
                            GROUP BY a.b_type, a.fk_itemmaterial
                        ) AS temp
                        JOIN dvw_master.vw_unit b ON temp.unitcode = b.i_code
                        WHERE active = 1`
        functionGlobal.query(query, res, connection, 'function/report/stock', resolve)
    })
}
