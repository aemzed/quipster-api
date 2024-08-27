import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"
import { ResultSetHeader } from "mysql2"

export function insert(
    { res, connection }: typeGlobal.functions,
    { fk_business, name, phone }: { fk_business: number, name: string, phone: string }
): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO dvw_master.vw_customer(fk_business, v_name, v_phone, b_gender, v_email)
                    VALUES (${fk_business}, '${name}', '${phone}', 0, '')`
        functionGlobal.query(query, res, connection, 'function/master/customer/insert', resolve)
    })
}

type getCustomer = {
    code: number,
    customcode: string,
    price: number,
    name: string,
    image: string,
    email: string,
    idnumber: string,
    birthdate: string,
    gender: number,
    address: string,
    phone: string,
    notes: string,
    plafond: number,
    totalinvoice: number,
    totaldeposit: number,
    point: number,
    favourite: string,
    date_last_visit: string
    created: string
}
export async function getCustomer({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<getCustomer[]> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        i_code AS "code",
                        v_code AS "customcode",
                        fk_price AS "price",
                        dvw_view.PROPER(v_name) AS "name",
                        v_image AS "image",
                        v_email AS "email",
                        v_idnumber AS "idnumber",
                        dt_birthdate AS "birthdate",
                        b_gender AS "gender",
                        v_address AS "address",
                        v_phone AS "phone",
                        v_notes AS "notes",
                        FLOOR(i_plafond) AS "plafond",
                        FLOOR(i_total_invoice) AS "totalinvoice",
                        FLOOR(i_total_deposit) AS "totaldeposit",
                        a.i_point AS "point",
                        '' AS "favourite",
                        IFNULL(dt_lastvisit,'') AS "date_last_visit",
                        a.dt_created AS "date_created"
                    FROM dvw_master.vw_customer a
                    WHERE b_isactive = 1
                        AND fk_business = ${fk_business}
                    ORDER BY v_name`
        functionGlobal.query(query, res, connection, 'function/master/customer/getCustomer', resolve)
    })
}

type getPodsCustomerCount = {
    business: string,
    count: number,
}
export async function getPodsCustomerCount({ res, connection }: typeGlobal.functions): Promise<getPodsCustomerCount[]> {
    return new Promise((resolve, reject) => {
        let query = `   SELECT *
                        FROM (
                            SELECT 
                                c.v_name AS business, 
                                COUNT(1) AS 'count'
                            FROM dvw_master.vw_customer a
                            JOIN dvw_setting.vw_other b ON a.fk_business = b.fk_business
                            JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                            WHERE b.b_relx = 1
                                AND a.b_isactive = 1
                                AND a.fk_business <> 57
                                AND a.fk_business <> 6206
                                AND LENGTH(a.v_phone) > 6
                            GROUP BY a.fk_business
                            UNION
                            SELECT
                                'Aplikasi' AS business, 
                                COUNT(1) AS 'count'
                            FROM tkd_relx.rlx_users z
                            WHERE IFNULL(z.name, '') <> ''
                        ) temp
                        ORDER BY business`
        functionGlobal.query(query, res, connection, 'function/master/customer/getPodsCustomerCount', resolve)
    })
}

type getPodsCustomerList = {
    business: string,
    name: string,
    phone: string,
    gender: string,
    date_join: string,
}
export async function getPodsCustomerList({ res, connection }: typeGlobal.functions): Promise<getPodsCustomerList[]> {
    return new Promise((resolve, reject) => {
        let query = `   SELECT *
                        FROM (
                            SELECT
                                'Aplikasi' AS business,
                                a.name, 
                                a.phone, 
                                CASE 
                                    WHEN a.gender = 1 THEN 'Pria'
                                    WHEN a.gender = 2 THEN 'Wanita'
                                    ELSE '-'
                                END AS 'gender', 
                                a.created_at AS date_join
                            FROM tkd_relx.rlx_users a
                            WHERE IFNULL(a.name, '') <> ''
                            UNION
                            SELECT 
                                c.v_name AS business, 
                                a.v_name AS name, 
                                a.v_phone AS phone,
                                CASE 
                                    WHEN a.b_gender = 1 THEN 'Pria'
                                    WHEN a.b_gender = 2 THEN 'Wanita'
                                    ELSE '-'
                                END AS gender,
                                a.dt_created AS date_join
                            FROM dvw_master.vw_customer a
                            JOIN dvw_setting.vw_other b ON a.fk_business = b.fk_business
                            JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                            WHERE b.b_relx = 1
                                AND a.b_isactive = 1
                                AND a.fk_business <> 57
                                AND a.fk_business <> 6206
                                AND LENGTH(a.v_phone) > 6
                        ) temp
                        ORDER BY business, name`
        functionGlobal.query(query, res, connection, 'function/master/customer/getPodsCustomerList', resolve)
    })
}

type getCustomerWithMerge = {
    code: number,
    customcode: string,
    price: number,
    name: string,
    image: string,
    email: string,
    idnumber: string,
    birthdate: string,
    gender: number,
    address: string,
    phone: string,
    notes: string,
    plafond: number,
    totalinvoice: number,
    totaldeposit: number,
    point: number,
    dt_created: string
}
export async function getCustomerWithMerge({ res, connection }: typeGlobal.functions, { fk_businessowner }: { fk_businessowner: number }): Promise<Array<getCustomer>> {
    return new Promise(async (resolve, reject) => {
        let query = `SELECT
                        i_code AS "code",
                        v_code AS "customcode",
                        fk_price AS "price",
                        v_name AS "name",
                        v_image AS "image",
                        v_email AS "email",
                        v_idnumber AS "idnumber",
                        dt_birthdate AS "birthdate",
                        b_gender AS "gender",
                        v_address AS "address",
                        v_phone AS "phone",
                        v_notes AS "notes",
                        FLOOR(i_plafond) AS "plafond",
                        FLOOR(i_total_invoice) AS "totalinvoice",
                        FLOOR(i_total_deposit) AS "totaldeposit",
                        i_point AS "point",
                        dt_created AS "created"
                    FROM dvw_master.vw_customer
                    WHERE fk_businessowner = ${fk_businessowner}
                        AND b_isactive = 1
                    ORDER BY v_name
                    LIMIT 5`
        functionGlobal.query(query, res, connection, 'function/master/customer/getCustomer', resolve)
    })
}

type getCodeName = {
    code: number,
    name: string
}
export async function getCodeName({ res, connection }: typeGlobal.functions, { fk_business, phone }: { fk_business: number, phone: string }): Promise<getCodeName> {
    return new Promise((resolve, reject) => {
        let query = `SELECT 
                        a.i_code AS "code",
                        a.v_name AS "name"
                    FROM dvw_master.vw_customer a
                    WHERE a.b_isactive = 1
                        AND a.fk_business = ${fk_business}
                        AND a.v_phone = ${phone}`
        functionGlobal.query(query, res, connection, 'function/master/customer/getCodeName', resolve)
    })
}

type getPointDetailReceiptDate = {
    point: number,
    detail: string,
    transaction: string,
    date: string
}
export async function getPointDetailReceiptDate({ res, connection }: typeGlobal.functions, { fk_customer }: { fk_customer: number }): Promise<Array<getPointDetailReceiptDate>> {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.i_point AS \`point\`,
                        a.v_detail AS \`detail\`,
                        IFNULL(b.s_offlinecode, '') AS \`transaction\`,
                        a.dt_created AS \`date\`
                    FROM dvw_transaction.vw_historypoint a
                    LEFT JOIN dvw_transaction.vw_transaction b ON a.fk_transaction = b.i_code
                    WHERE a.fk_customer = ${fk_customer}
                    ORDER BY a.dt_created DESC`
        functionGlobal.query(query, res, connection, 'function/master/customer/getPointDetailReceiptDate', resolve)
    })
}

type select = {
    code: number,
    alias: string,
    price: number,
    name: string,
    email: string,
    id_number: number,
    date_birth: string,
    gender: string,
    address: string,
    phone: string,
    notes: string,
    plafond: number,
    total_invoice: number,
    total_deposit: number,
    point: number,
    total_transaction: number,
    total_transaction_nominal: number,
    favourite: string,
    date_last_visit: string,
    date_join: string,
}
export async function select(
    { res, connection }: typeGlobal.functions,
    { fk_business, _OTHER }: {
        fk_business: number,
        _OTHER?: {
            keyword?: string,
            order?: string,
            start?: number,
            limit?: number,
            name?: string,
            filter: {
                gender?: number,
                birthDate?: { startDate: string, endDate: string },
                newCustomer?: { startDate: string, endDate: string },
                recurringCustomer?: { startDate?: string, endDate?: string, minimumNominal?: number, minimumTransaction?: number },
                favoriteItem?: { itemCode: number, startDate?: string, endDate?: string },
                itemBoughtByTransaction?: { itemCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
                categoryBoughtByTransaction?: { categoryCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
                itemBoughtByNominal?: { itemCode: number, minimumValue: number, startDate?: string, endDate?: string },
                categoryBoughtByNominal?: { categoryCode: number, minimumValue: number, startDate?: string, endDate?: string },
                itemBoughtByQty?: { itemCode: number, minimumQty?: number, startDate?: string, endDate?: string },
                categoryBoughtByQty?: { categoryCode: number, minimumQty?: number, startDate?: string, endDate?: string }
            }
        }
    }
): Promise<Array<select>> {
    let subSelectQuery = {
        querySelectTotalTransaction: `(
                                    SELECT COUNT(1) 
                                    FROM dvw_transaction.vw_transaction b 
                                    WHERE b.fk_customer = a.i_code 
                                        AND b.b_ispaid = 1 
                                        AND b.b_isactive = 1 
                                        AND b.b_isvoid = 0
                                        ${_OTHER?.filter.recurringCustomer?.startDate ?
                `AND b.dt_paid >= '${_OTHER.filter.recurringCustomer.startDate}'`
                : ''}
                                        ${_OTHER?.filter.recurringCustomer?.endDate ?
                `AND b.dt_paid <= '${_OTHER.filter.recurringCustomer.endDate}'`
                : ''}
                                    )`,
        querySelectTotalTransactionNominal: `   (
                                                    SELECT SUM(b.i_totalnet) 
                                                    FROM dvw_transaction.vw_transaction b 
                                                    WHERE b.fk_customer = a.i_code 
                                                        AND b.b_ispaid = 1 
                                                        AND b.b_isactive = 1 
                                                        AND b.b_isvoid = 0
                                                        ${_OTHER?.filter.recurringCustomer?.startDate ?
                `AND b.dt_paid >= '${_OTHER.filter.recurringCustomer.startDate}'`
                : ''}
                                                        ${_OTHER?.filter.recurringCustomer?.endDate ?
                `AND b.dt_paid <= '${_OTHER.filter.recurringCustomer.endDate}'`
                : ''}
                                                    GROUP BY b.fk_customer
                                                )
                                            `,
        querySelectFavourite: `(
                                    SELECT GROUP_CONCAT(item_code) AS favorite_item_code FROM
                                    (
                                        SELECT item_name, customer_code, item_code, item_bought, MAX(item_bought) FROM
                                        (
                                            SELECT
                                                vw_item.v_name AS \`item_name\`,
                                                vw_customer.i_code AS \`customer_code\`,		
                                                vw_item.i_code AS \`item_code\`,
                                                SUM(vw_transactiondetail.i_qty) AS \`item_bought\`
                                            FROM
                                            dvw_transaction.vw_transactiondetail vw_transactiondetail
                                            JOIN dvw_transaction.vw_transaction vw_transaction ON vw_transactiondetail.fk_transaction = vw_transaction.i_code AND vw_transaction.b_isactive = 1 AND vw_transaction.b_ispaid = 1 AND vw_transaction.b_isvoid = 0
                                            INNER JOIN dvw_master.vw_customer vw_customer ON vw_customer.i_code = vw_transaction.fk_customer AND vw_customer.b_isactive = 1 AND vw_customer.fk_business = ${fk_business}
                                            LEFT JOIN dvw_master.vw_item vw_item ON vw_transactiondetail.fk_item = vw_item.i_code AND vw_item.b_isactive = 1 AND vw_item.fk_business = ${fk_business} AND vw_item.b_favorite_not_include = 0 AND vw_transactiondetail.b_type = 1
                                            WHERE vw_transactiondetail.b_isactive = 1
                                            AND vw_transactiondetail.b_isvoid = 0
                                            AND vw_transactiondetail.fk_business = ${fk_business}
                                            ${_OTHER?.filter.favoriteItem?.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.favoriteItem.startDate}'`
                : ''}
                                            ${_OTHER?.filter.favoriteItem?.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.favoriteItem.endDate}'`
                : ''}
                                            GROUP BY vw_item.i_code, vw_transaction.fk_customer
                                            HAVING item_code IS NOT NULL
                                            ORDER BY SUM(vw_transactiondetail.i_qty) DESC
                                        ) AS \`item_bought_table\`
                                        GROUP BY customer_code
                                    ) AS \`favorite_item_table\`
                                    WHERE customer_code = a.i_code
                                ) AS favorite_item,`,
        querySelectTotalTransactionByItem: _OTHER?.filter.itemBoughtByTransaction ? `(
                                            SELECT COUNT(*)
                                            FROM dvw_transaction.vw_transaction vw_transaction
                                            WHERE vw_transaction.fk_business = ${fk_business}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND (
                                                SELECT COUNT(*) 
                                                FROM dvw_transaction.vw_transactiondetail vw_transactiondetail
                                                WHERE vw_transactiondetail.fk_transaction = vw_transaction.i_code
                                                AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByTransaction.itemCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.itemBoughtByTransaction.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByTransaction.startDate}'`
                : ''}
                                                ${_OTHER.filter.itemBoughtByTransaction.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByTransaction.endDate}'`
                : ''}
                                                ) > 0
                                            ) AS \`total_transaction_by_item\`,` : '',
        querySelectTotalTransactionByCategory: _OTHER?.filter.categoryBoughtByTransaction ? `(
                                            SELECT COUNT(*)
                                            FROM dvw_transaction.vw_transaction vw_transaction
                                            WHERE vw_transaction.fk_business = ${fk_business}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND (
                                                SELECT COUNT(*) 
                                                FROM dvw_transaction.vw_transactiondetail vw_transactiondetail
                                                LEFT JOIN dvw_master.vw_item vw_item ON vw_transactiondetail.fk_item = vw_item.i_code AND vw_item.fk_business = ${fk_business} AND vw_item.b_isactive = 1
                                                WHERE vw_transactiondetail.fk_transaction = vw_transaction.i_code
                                                AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByTransaction.categoryCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.categoryBoughtByTransaction.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByTransaction.startDate}'`
                : ''}
                                                ${_OTHER.filter.categoryBoughtByTransaction.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByTransaction.endDate}'`
                : ''}
                                                ) > 0
                                            )  AS \`total_transaction_by_category\`,` : '',
        querySelectNominalTransactionByItem: _OTHER?.filter.itemBoughtByNominal ? `(
                                            SELECT SUM(i_pricenet) FROM dvw_transaction.vw_transaction vw_transaction
                                            LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction AND vw_transactiondetail.fk_business = ${fk_business}
                                            WHERE vw_transaction.fk_business = ${fk_business}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByNominal.itemCode}
                                            AND vw_transaction.b_ispaid = 1
                                            AND vw_transaction.b_isactive = 1
                                            AND vw_transactiondetail.b_isactive = 1
                                            AND vw_transaction.b_isvoid = 0
                                            AND vw_transactiondetail.b_isvoid = 0
                                            ${_OTHER.filter.itemBoughtByNominal.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByNominal.startDate}'`
                : ''}
                                            ${_OTHER.filter.itemBoughtByNominal.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByNominal.endDate}'`
                : ''}
                                            ) AS nominal_transaction_by_item,` : '',
        querySelectNominalTransactionByCategory: _OTHER?.filter.categoryBoughtByNominal ? `(
                                                SELECT SUM(vw_transactiondetail.i_pricenet) FROM dvw_transaction.vw_transaction vw_transaction
                                                LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction AND vw_transactiondetail.fk_business = ${fk_business}
                                                LEFT JOIN dvw_master.vw_item vw_item ON vw_item.i_code = vw_transactiondetail.fk_item AND vw_item.fk_business = ${fk_business}
                                                WHERE vw_transaction.fk_business = ${fk_business}
                                                AND vw_transaction.fk_customer = a.i_code
                                                AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByNominal.categoryCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                ${_OTHER.filter.categoryBoughtByNominal.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByNominal.startDate}'`
                : ''}
                                                ${_OTHER.filter.categoryBoughtByNominal.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByNominal.endDate}'`
                : ''}
                                                ) AS nominal_transaction_by_category,` : '',
        querySelectItemQty: _OTHER?.filter.itemBoughtByQty ? `(
                                                SELECT SUM(vw_transactiondetail.i_qty)
                                                FROM dvw_transaction.vw_transaction vw_transaction
                                                LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction AND vw_transactiondetail.fk_business = ${fk_business}
                                                WHERE vw_transaction.fk_business = ${fk_business}
                                                AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByQty.itemCode}
                                                AND vw_transaction.fk_customer = a.i_code
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.itemBoughtByQty.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByQty.startDate}'`
                : ''}
                                                ${_OTHER.filter.itemBoughtByQty.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByQty.endDate}'`
                : ''}
                                                ) AS qty_transaction_by_item,` : '',
        querySelectCategoryQty: _OTHER?.filter.categoryBoughtByQty ? `(
                                                                    SELECT SUM(vw_transactiondetail.i_qty)
                                                                    FROM dvw_transaction.vw_transaction vw_transaction
                                                                    LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction AND vw_transactiondetail.fk_business = ${fk_business}
                                                                    LEFT JOIN dvw_master.vw_item vw_item ON vw_item.i_code = vw_transactiondetail.fk_item
                                                                    WHERE vw_transaction.fk_business = ${fk_business}
                                                                    AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByQty.categoryCode}
                                                                    AND vw_transaction.fk_customer = a.i_code
                                                                    AND vw_transaction.b_ispaid = 1
                                                                    AND vw_transaction.b_isvoid = 0
                                                                    AND vw_transactiondetail.b_isvoid = 0
                                                                    AND vw_transaction.b_isactive = 1
                                                                    AND vw_transactiondetail.b_isactive = 1
                                                                    ${_OTHER.filter.categoryBoughtByQty?.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByQty.startDate}'`
                : ''}
                                                                    ${_OTHER.filter.categoryBoughtByQty?.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByQty.endDate}'`
                : ''}
                                                                    ) AS qty_transaction_by_category,` : '',
        querySelectItemName: _OTHER?.filter.itemBoughtByNominal || _OTHER?.filter.itemBoughtByQty || _OTHER?.filter.itemBoughtByTransaction ?
            `(
                            SELECT vw_item.v_name
                            FROM dvw_master.vw_item vw_item
                            WHERE vw_item.i_code = ${_OTHER.filter.itemBoughtByNominal?.itemCode ?? _OTHER.filter.itemBoughtByQty?.itemCode ?? _OTHER.filter.itemBoughtByTransaction?.itemCode}
                            ) AS item_name,
                            ` : ``,
        querySelectCategoryName: _OTHER?.filter.categoryBoughtByNominal || _OTHER?.filter.categoryBoughtByQty || _OTHER?.filter.categoryBoughtByTransaction ?
            `(
                            SELECT vw_category.v_name
                            FROM dvw_master.vw_category vw_category
                            WHERE vw_category.i_code = ${_OTHER.filter.categoryBoughtByNominal?.categoryCode ?? _OTHER.filter.categoryBoughtByQty?.categoryCode ?? _OTHER.filter.categoryBoughtByTransaction?.categoryCode}
                            ) AS category_name,
                            ` : ``

    }

    function filtersWhereQuery() {
        let query = ''
        if (_OTHER?.filter?.gender) query += ` AND (
                                                a.b_gender = ${_OTHER.filter.gender}
                                            )`
        if (_OTHER?.filter?.birthDate) query += ` AND ( 
                                                    ( MONTH(a.dt_birthdate) > MONTH('${_OTHER.filter.birthDate.startDate}') AND MONTH(a.dt_birthdate) < MONTH('${_OTHER.filter.birthDate.endDate}') )
                                                    OR ( MONTH(a.dt_birthdate) = MONTH('${_OTHER.filter.birthDate.startDate}') AND DAY(a.dt_birthdate) >= DAY('${_OTHER.filter.birthDate.startDate}') )
                                                    OR ( MONTH(a.dt_birthdate) = MONTH('${_OTHER.filter.birthDate.endDate}') AND DAY(a.dt_birthdate) <= DAY('${_OTHER.filter.birthDate.endDate}') )
                                                )`
        if (_OTHER?.filter?.newCustomer) query += ` AND (
                                                        a.dt_created >= '${_OTHER.filter.newCustomer.startDate}' AND a.dt_created <= '${_OTHER.filter.newCustomer.endDate}'
                                                    )`
        return query
    }

    function filtersHavingQuery() {

        let query = `HAVING 1 = 1 `

        if (_OTHER?.filter.recurringCustomer) query += `AND (
                                                            nominal_transaction >= ${_OTHER.filter.recurringCustomer.minimumNominal ?? 0}
                                                        )
                                                        AND (
                                                            total_transaction >= ${_OTHER.filter.recurringCustomer.minimumTransaction ?? 1}
                                                        )`
        if (_OTHER?.filter.itemBoughtByTransaction) query += `AND (
                                                                total_transaction_by_item >= ${_OTHER?.filter.itemBoughtByTransaction.minimumTransaction}
                                                            )`
        if (_OTHER?.filter.categoryBoughtByTransaction) query += `AND (
                                                                    total_transaction_by_category >= ${_OTHER.filter.categoryBoughtByTransaction.minimumTransaction}
                                                                )`
        if (_OTHER?.filter.itemBoughtByNominal) query += `AND (
                                                            nominal_transaction_by_item >= ${_OTHER.filter.itemBoughtByNominal.minimumValue}
                                                        )`
        if (_OTHER?.filter.categoryBoughtByNominal) query += `AND ( 
                                                                nominal_transaction_by_category >= ${_OTHER.filter.categoryBoughtByNominal.minimumValue}
                                                            )`
        if (_OTHER?.filter.itemBoughtByQty) query += `AND (
                                                        qty_transaction_by_item >= ${_OTHER.filter.itemBoughtByQty.minimumQty ?? 1}
                                                    )`
        if (_OTHER?.filter.categoryBoughtByQty) query += `AND (
                                                        qty_transaction_by_category >= ${_OTHER.filter.categoryBoughtByQty.minimumQty ?? 1}
                                                    )`
        if (_OTHER?.filter.favoriteItem?.itemCode) query += `AND (
                                                                FIND_IN_SET('${_OTHER.filter.favoriteItem.itemCode}', favorite_item)
                                                            )`

        return query
    }

    return new Promise((resolve, reject) => {
        let query = `
                        SELECT
                            a.i_code AS \`code\`,
                            a.v_code AS \`alias\`,
                            a.fk_price AS \`price\`,
                            dvw_view.PROPER(a.v_name) AS \`name\`,
                            a.v_email AS \`email\`,
                            a.v_image AS \`image\`,
                            a.v_idnumber AS \`id_number\`,
                            a.dt_birthdate AS \`date_birth\`,
                            a.b_gender AS \`gender\`,
                            a.v_address AS \`address\`,
                            a.v_phone AS \`phone\`,
                            a.v_notes AS \`notes\`,
                            FLOOR(a.i_plafond) AS \`plafond\`,
                            FLOOR(a.i_total_invoice) AS \`total_invoice\`,
                            FLOOR(a.i_total_deposit) AS \`total_deposit\`,
                            a.i_point AS \`point\`,
                            ${subSelectQuery.querySelectTotalTransaction} AS \`total_transaction\`,
                            ${subSelectQuery.querySelectTotalTransactionNominal} AS \`nominal_transaction\`,
                            ${subSelectQuery.querySelectTotalTransactionByItem}
                            ${subSelectQuery.querySelectTotalTransactionByCategory}
                            ${subSelectQuery.querySelectNominalTransactionByItem}
                            ${subSelectQuery.querySelectNominalTransactionByCategory}
                            ${subSelectQuery.querySelectItemQty}
                            ${subSelectQuery.querySelectCategoryQty}
                            ${subSelectQuery.querySelectItemName}
                            ${subSelectQuery.querySelectCategoryName}
                            ${subSelectQuery.querySelectFavourite}
                            IFNULL(a.dt_lastvisit,'') AS \`date_last_visit\`,
                            a.dt_created AS \`date_join\`,
                            a.v_idnumber as \`ktp\`,
                            a.fk_employee as \`employeess\`,
                            a.v_npwp as \`npwp\`,
                            a.v_image_store as \`image_store\`,
                            a.v_image_idcard as \`image_idcard\`,
                            a.v_image_npwp as \`image_npwp\`,
                            a.v_city as \`kota\`,
                            a.v_subdistrict as \`kecamatan\`,
                            a.v_ward as \`kelurahan\`
                        FROM dvw_master.vw_customer a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            ${filtersWhereQuery()}
                        ${filtersHavingQuery()}
                        ${_OTHER?.order ? `ORDER BY ${_OTHER?.order}` : `ORDER BY name`}
                        ${_OTHER?.limit ? _OTHER.start ? `LIMIT ${_OTHER.start}, ${_OTHER.limit}` : `LIMIT ${_OTHER.limit}` : ''}
                    `
        functionGlobal.query(query, res, connection, 'function/master/customer/select', resolve)
    })
}

export async function selectMerge(
    { res, connection }: typeGlobal.functions,
    { fk_businessowner, _OTHER }: {
        fk_businessowner: number,
        _OTHER?: {
            keyword?: string,
            order?: string,
            start?: number,
            limit?: number,
            name?: string,
            filter: {
                gender?: number,
                birthDate?: { startDate: string, endDate: string },
                newCustomer?: { startDate: string, endDate: string },
                recurringCustomer?: { startDate?: string, endDate?: string, minimumNominal?: number, minimumTransaction?: number },
                favoriteItem?: { itemCode: number, startDate?: string, endDate?: string },
                itemBoughtByTransaction?: { itemCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
                categoryBoughtByTransaction?: { categoryCode: number, minimumTransaction: number, startDate?: string, endDate?: string },
                itemBoughtByNominal?: { itemCode: number, minimumValue: number, startDate?: string, endDate?: string },
                categoryBoughtByNominal?: { categoryCode: number, minimumValue: number, startDate?: string, endDate?: string },
                itemBoughtByQty?: { itemCode: number, minimumQty?: number, startDate?: string, endDate?: string },
                categoryBoughtByQty?: { categoryCode: number, minimumQty?: number, startDate?: string, endDate?: string }
            }
        }
    }
): Promise<Array<select>> {
    let subSelectQuery = {
        querySelectTotalTransaction: `(
                                    SELECT COUNT(1) 
                                    FROM dvw_transaction.vw_transaction b 
                                    WHERE b.fk_customer = a.i_code 
                                        AND b.b_ispaid = 1 
                                        AND b.b_isactive = 1 
                                        AND b.b_isvoid = 0
                                        ${_OTHER?.filter.recurringCustomer?.startDate ?
                `AND b.dt_paid >= '${_OTHER.filter.recurringCustomer.startDate}'`
                : ''}
                                        ${_OTHER?.filter.recurringCustomer?.endDate ?
                `AND b.dt_paid <= '${_OTHER.filter.recurringCustomer.endDate}'`
                : ''}
                                    )`,
        querySelectTotalTransactionNominal: `   (
                                                    SELECT SUM(b.i_totalnet) 
                                                    FROM dvw_transaction.vw_transaction b 
                                                    WHERE b.fk_customer = a.i_code 
                                                        AND b.b_ispaid = 1 
                                                        AND b.b_isactive = 1 
                                                        AND b.b_isvoid = 0
                                                        ${_OTHER?.filter.recurringCustomer?.startDate ?
                `AND b.dt_paid >= '${_OTHER.filter.recurringCustomer.startDate}'`
                : ''}
                                                        ${_OTHER?.filter.recurringCustomer?.endDate ?
                `AND b.dt_paid <= '${_OTHER.filter.recurringCustomer.endDate}'`
                : ''}
                                                    GROUP BY b.fk_customer
                                                )
                                            `,
        querySelectFavourite: `(
                                    SELECT GROUP_CONCAT(item_code) AS favorite_item_code FROM
                                    (
                                        SELECT item_name, customer_code, item_code, item_bought, MAX(item_bought) FROM
                                        (
                                            SELECT
                                                vw_item.v_name AS \`item_name\`,
                                                vw_customer.i_code AS \`customer_code\`,		
                                                vw_item.i_code AS \`item_code\`,
                                                SUM(vw_transactiondetail.i_qty) AS \`item_bought\`
                                            FROM
                                            dvw_transaction.vw_transactiondetail vw_transactiondetail
                                            JOIN dvw_transaction.vw_transaction vw_transaction ON vw_transactiondetail.fk_transaction = vw_transaction.i_code AND vw_transaction.b_isactive = 1 AND vw_transaction.b_ispaid = 1 AND vw_transaction.b_isvoid = 0
                                            JOIN dvw_account.vw_business vw_business ON vw_business.i_code = vw_transaction.fk_business AND vw_business.b_isactive = 1
                                            INNER JOIN dvw_master.vw_customer vw_customer ON vw_customer.i_code = vw_transaction.fk_customer AND vw_customer.b_isactive = 1
                                            LEFT JOIN dvw_master.vw_item vw_item ON vw_transactiondetail.fk_item = vw_item.i_code AND vw_item.b_isactive = 1 AND vw_item.b_favorite_not_include = 0 AND vw_transactiondetail.b_type = 1
                                            WHERE vw_transactiondetail.b_isactive = 1
                                            AND vw_transactiondetail.b_isvoid = 0
                                            AND vw_business.fk_businessowner = ${fk_businessowner}
                                            ${_OTHER?.filter.favoriteItem?.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.favoriteItem.startDate}'`
                : ''}
                                            ${_OTHER?.filter.favoriteItem?.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.favoriteItem.endDate}'`
                : ''}
                                            GROUP BY vw_item.i_code, vw_transaction.fk_customer
                                            HAVING item_code IS NOT NULL
                                            ORDER BY SUM(vw_transactiondetail.i_qty) DESC
                                        ) AS \`item_bought_table\`
                                        GROUP BY customer_code
                                    ) AS \`favorite_item_table\`
                                    WHERE customer_code = a.i_code
                                ) AS favorite_item,`,
        querySelectTotalTransactionByItem: _OTHER?.filter.itemBoughtByTransaction ? `(
                                            SELECT COUNT(*)
                                            FROM dvw_transaction.vw_transaction vw_transaction
                                            JOIN dvw_account.vw_business vw_business ON vw_transaction.fk_business = vw_business.i_code
                                            WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND (
                                                SELECT COUNT(*) 
                                                FROM dvw_transaction.vw_transactiondetail vw_transactiondetail
                                                WHERE vw_transactiondetail.fk_transaction = vw_transaction.i_code
                                                AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByTransaction.itemCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.itemBoughtByTransaction.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByTransaction.startDate}'`
                : ''}
                                                ${_OTHER.filter.itemBoughtByTransaction.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByTransaction.endDate}'`
                : ''}
                                                ) > 0
                                            ) AS \`total_transaction_by_item\`,` : '',
        querySelectTotalTransactionByCategory: _OTHER?.filter.categoryBoughtByTransaction ? `(
                                            SELECT COUNT(*)
                                            FROM dvw_transaction.vw_transaction vw_transaction
                                            JOIN dvw_account.vw_business vw_business ON vw_business.i_code = vw_transaction.fk_business AND vw_business.b_isactive = 1
                                            WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND (
                                                SELECT COUNT(*) 
                                                FROM dvw_transaction.vw_transactiondetail vw_transactiondetail
                                                LEFT JOIN dvw_master.vw_item vw_item ON vw_transactiondetail.fk_item = vw_item.i_code AND vw_item.b_isactive = 1
                                                WHERE vw_transactiondetail.fk_transaction = vw_transaction.i_code
                                                AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByTransaction.categoryCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.categoryBoughtByTransaction.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByTransaction.startDate}'`
                : ''}
                                                ${_OTHER.filter.categoryBoughtByTransaction.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByTransaction.endDate}'`
                : ''}
                                                ) > 0
                                            )  AS \`total_transaction_by_category\`,` : '',
        querySelectNominalTransactionByItem: _OTHER?.filter.itemBoughtByNominal ? `(
                                            SELECT SUM(i_pricenet) FROM dvw_transaction.vw_transaction vw_transaction
                                            LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction
                                            JOIN dvw_account.vw_business vw_business ON vw_transactiondetail.fk_business = vw_business.i_code AND vw_business.b_isactive = 1
                                            WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                            AND vw_transaction.fk_customer = a.i_code
                                            AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByNominal.itemCode}
                                            AND vw_transaction.b_ispaid = 1
                                            AND vw_transaction.b_isactive = 1
                                            AND vw_transactiondetail.b_isactive = 1
                                            AND vw_transaction.b_isvoid = 0
                                            AND vw_transactiondetail.b_isvoid = 0
                                            ${_OTHER.filter.itemBoughtByNominal.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByNominal.startDate}'`
                : ''}
                                            ${_OTHER.filter.itemBoughtByNominal.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByNominal.endDate}'`
                : ''}
                                            ) AS nominal_transaction_by_item,` : '',
        querySelectNominalTransactionByCategory: _OTHER?.filter.categoryBoughtByNominal ? `(
                                                SELECT SUM(vw_transactiondetail.i_pricenet) 
                                                FROM dvw_transaction.vw_transaction vw_transaction
                                                JOIN dvw_account.vw_business vw_business ON vw_transaction.fk_business = vw_business.i_code AND vw_business.b_isactive = 1
                                                LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction
                                                LEFT JOIN dvw_master.vw_item vw_item ON vw_item.i_code = vw_transactiondetail.fk_item
                                                WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                                AND vw_transaction.fk_customer = a.i_code
                                                AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByNominal.categoryCode}
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                ${_OTHER.filter.categoryBoughtByNominal.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByNominal.startDate}'`
                : ''}
                                                ${_OTHER.filter.categoryBoughtByNominal.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByNominal.endDate}'`
                : ''}
                                                ) AS nominal_transaction_by_category,` : '',
        querySelectItemQty: _OTHER?.filter.itemBoughtByQty ? `(
                                                SELECT SUM(vw_transactiondetail.i_qty)
                                                FROM dvw_transaction.vw_transaction vw_transaction
                                                LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction
                                                JOIN dvw_account.vw_business vw_business ON vw_business.i_code = vw_transactiondetail.fk_business AND vw_business.b_isactive = 1
                                                WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                                AND vw_transactiondetail.fk_item = ${_OTHER.filter.itemBoughtByQty.itemCode}
                                                AND vw_transaction.fk_customer = a.i_code
                                                AND vw_transaction.b_ispaid = 1
                                                AND vw_transaction.b_isvoid = 0
                                                AND vw_transactiondetail.b_isvoid = 0
                                                AND vw_transaction.b_isactive = 1
                                                AND vw_transactiondetail.b_isactive = 1
                                                ${_OTHER.filter.itemBoughtByQty.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.itemBoughtByQty.startDate}'`
                : ''}
                                                ${_OTHER.filter.itemBoughtByQty.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.itemBoughtByQty.endDate}'`
                : ''}
                                                ) AS qty_transaction_by_item,` : '',
        querySelectCategoryQty: _OTHER?.filter.categoryBoughtByQty ? `(
                                                                    SELECT SUM(vw_transactiondetail.i_qty)
                                                                    FROM dvw_transaction.vw_transaction vw_transaction
                                                                    LEFT JOIN dvw_transaction.vw_transactiondetail vw_transactiondetail ON vw_transaction.i_code = vw_transactiondetail.fk_transaction
                                                                    JOIN dvw_account.vw_business vw_business ON vw_business.i_code = vw_transactiondetail.fk_business AND vw_business.b_isactive = 1
                                                                    LEFT JOIN dvw_master.vw_item vw_item ON vw_item.i_code = vw_transactiondetail.fk_item
                                                                    WHERE vw_business.fk_businessowner = ${fk_businessowner}
                                                                    AND vw_item.fk_category = ${_OTHER.filter.categoryBoughtByQty.categoryCode}
                                                                    AND vw_transaction.fk_customer = a.i_code
                                                                    AND vw_transaction.b_ispaid = 1
                                                                    AND vw_transaction.b_isvoid = 0
                                                                    AND vw_transactiondetail.b_isvoid = 0
                                                                    AND vw_transaction.b_isactive = 1
                                                                    AND vw_transactiondetail.b_isactive = 1
                                                                    ${_OTHER.filter.categoryBoughtByQty?.startDate ?
                `AND vw_transaction.dt_paid >= '${_OTHER.filter.categoryBoughtByQty.startDate}'`
                : ''}
                                                                    ${_OTHER.filter.categoryBoughtByQty?.endDate ?
                `AND vw_transaction.dt_paid <= '${_OTHER.filter.categoryBoughtByQty.endDate}'`
                : ''}
                                                                    ) AS qty_transaction_by_category,` : '',
        querySelectItemName: _OTHER?.filter.itemBoughtByNominal || _OTHER?.filter.itemBoughtByQty || _OTHER?.filter.itemBoughtByTransaction ?
            `(
                            SELECT vw_item.v_name
                            FROM dvw_master.vw_item vw_item
                            WHERE vw_item.i_code = ${_OTHER.filter.itemBoughtByNominal?.itemCode ?? _OTHER.filter.itemBoughtByQty?.itemCode ?? _OTHER.filter.itemBoughtByTransaction?.itemCode}
                            ) AS item_name,
                            ` : ``,
        querySelectCategoryName: _OTHER?.filter.categoryBoughtByNominal || _OTHER?.filter.categoryBoughtByQty || _OTHER?.filter.categoryBoughtByTransaction ?
            `(
                            SELECT vw_category.v_name
                            FROM dvw_master.vw_category vw_category
                            WHERE vw_category.i_code = ${_OTHER.filter.categoryBoughtByNominal?.categoryCode ?? _OTHER.filter.categoryBoughtByQty?.categoryCode ?? _OTHER.filter.categoryBoughtByTransaction?.categoryCode}
                            ) AS category_name,
                            ` : ``

    }

    function filtersWhereQuery() {
        let query = ''
        if (_OTHER?.filter?.gender) query += ` AND (
                                                a.b_gender = ${_OTHER.filter.gender}
                                            )`
        if (_OTHER?.filter?.birthDate) query += ` AND ( 
                                                    ( MONTH(a.dt_birthdate) > MONTH('${_OTHER.filter.birthDate.startDate}') AND MONTH(a.dt_birthdate) < MONTH('${_OTHER.filter.birthDate.endDate}') )
                                                    OR ( MONTH(a.dt_birthdate) = MONTH('${_OTHER.filter.birthDate.startDate}') AND DAY(a.dt_birthdate) >= DAY('${_OTHER.filter.birthDate.startDate}') )
                                                    OR ( MONTH(a.dt_birthdate) = MONTH('${_OTHER.filter.birthDate.endDate}') AND DAY(a.dt_birthdate) <= DAY('${_OTHER.filter.birthDate.endDate}') )
                                                )`
        if (_OTHER?.filter?.newCustomer) query += ` AND (
                                                        a.dt_created >= '${_OTHER.filter.newCustomer.startDate}' AND a.dt_created <= '${_OTHER.filter.newCustomer.endDate}'
                                                    )`
        return query
    }

    function filtersHavingQuery() {

        let query = `HAVING 1 = 1 `

        if (_OTHER?.filter.recurringCustomer) query += `AND (
                                                            nominal_transaction >= ${_OTHER.filter.recurringCustomer.minimumNominal ?? 0}
                                                        )
                                                        AND (
                                                            total_transaction >= ${_OTHER.filter.recurringCustomer.minimumTransaction ?? 1}
                                                        )`
        if (_OTHER?.filter.itemBoughtByTransaction) query += `AND (
                                                                total_transaction_by_item >= ${_OTHER?.filter.itemBoughtByTransaction.minimumTransaction}
                                                            )`
        if (_OTHER?.filter.categoryBoughtByTransaction) query += `AND (
                                                                    total_transaction_by_category >= ${_OTHER.filter.categoryBoughtByTransaction.minimumTransaction}
                                                                )`
        if (_OTHER?.filter.itemBoughtByNominal) query += `AND (
                                                            nominal_transaction_by_item >= ${_OTHER.filter.itemBoughtByNominal.minimumValue}
                                                        )`
        if (_OTHER?.filter.categoryBoughtByNominal) query += `AND ( 
                                                                nominal_transaction_by_category >= ${_OTHER.filter.categoryBoughtByNominal.minimumValue}
                                                            )`
        if (_OTHER?.filter.itemBoughtByQty) query += `AND (
                                                        qty_transaction_by_item >= ${_OTHER.filter.itemBoughtByQty.minimumQty ?? 1}
                                                    )`
        if (_OTHER?.filter.categoryBoughtByQty) query += `AND (
                                                        qty_transaction_by_category >= ${_OTHER.filter.categoryBoughtByQty.minimumQty ?? 1}
                                                    )`
        if (_OTHER?.filter.favoriteItem?.itemCode) query += `AND (
                                                                FIND_IN_SET('${_OTHER.filter.favoriteItem.itemCode}', favorite_item)
                                                            )`

        return query
    }

    return new Promise((resolve, reject) => {
        let query = `
                        SELECT
                            a.i_code AS \`code\`,
                            a.v_code AS \`alias\`,
                            a.fk_price AS \`price\`,
                            dvw_view.PROPER(a.v_name) AS \`name\`,
                            a.v_email AS \`email\`,
                            a.v_idnumber AS \`id_number\`,
                            a.dt_birthdate AS \`date_birth\`,
                            a.b_gender AS \`gender\`,
                            a.v_address AS \`address\`,
                            a.v_phone AS \`phone\`,
                            a.v_notes AS \`notes\`,
                            FLOOR(a.i_plafond) AS \`plafond\`,
                            FLOOR(a.i_total_invoice) AS \`total_invoice\`,
                            FLOOR(a.i_total_deposit) AS \`total_deposit\`,
                            a.i_point AS \`point\`,
                            ${subSelectQuery.querySelectTotalTransaction} AS \`total_transaction\`,
                            ${subSelectQuery.querySelectTotalTransactionNominal} AS \`nominal_transaction\`,
                            ${subSelectQuery.querySelectTotalTransactionByItem}
                            ${subSelectQuery.querySelectTotalTransactionByCategory}
                            ${subSelectQuery.querySelectNominalTransactionByItem}
                            ${subSelectQuery.querySelectNominalTransactionByCategory}
                            ${subSelectQuery.querySelectItemQty}
                            ${subSelectQuery.querySelectCategoryQty}
                            ${subSelectQuery.querySelectItemName}
                            ${subSelectQuery.querySelectCategoryName}
                            ${subSelectQuery.querySelectFavourite}
                            IFNULL(a.dt_lastvisit,'') AS \`date_last_visit\`,
                            a.dt_created AS \`date_join\`
                        FROM dvw_master.vw_customer a
                        JOIN dvw_account.vw_business vw_business ON a.fk_business = vw_business.i_code
                        WHERE a.b_isactive = 1
                            AND vw_business.fk_businessowner = ${fk_businessowner}
                            ${filtersWhereQuery()}
                        ${filtersHavingQuery()}
                        ${_OTHER?.order ? `ORDER BY ${_OTHER?.order}` : `ORDER BY name`}
                        ${_OTHER?.limit ? _OTHER.start ? `LIMIT ${_OTHER.start}, ${_OTHER.limit}` : `LIMIT ${_OTHER.limit}` : ''}
                    `
        functionGlobal.query(query, res, connection, 'function/master/customer/select', resolve)
    })
}

type merges = {
    merge: number
}
export function selectMergeMobile({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<merges> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                                b.b_mergecustomer AS merge
                            FROM dvw_account.vw_business a
                            JOIN dvw_account.vw_businessowner b ON a.fk_businessowner = b.i_code
                            WHERE a.b_isactive = 1
                                AND a.i_code = ${fk_business}`
        functionGlobal.querySingle(query, res, connection, 'function/customer/selectMergeMobile', resolve);
    })
}

type selectCustomer = {
    code: number,
    customcode: string,
    price: number,
    name: string,
    image: string,
    email: string,
    idnumber: string,
    birthdate: string,
    gender: number,
    address: string,
    phone: string,
    notes: string,
    plafond: number,
    totalinvoice: number,
    totaldeposit: number,
    point: number,
    favourite: string,
    date_last_visit: string,
    created: string,
}
export function selectCustomerMobile({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<selectCustomer>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                                a.i_code AS code,
                                a.v_code AS customcode,
                                a.fk_price AS price,
                                CASE
                                    WHEN (a.fk_business = 5887 OR a.fk_business = 6395) THEN dvw_view.PROPER(a.v_name)
                                    ELSE a.v_name
                                END AS name,
                                a.v_image AS image,
                                a.v_email AS email,
                                a.v_idnumber AS idnumber,
                                DATE_FORMAT(a.dt_birthdate, '%Y-%m-%d %T') AS birthdate,
                                a.b_gender AS gender,
                                a.v_address AS address,
                                a.v_phone AS phone,
                                a.v_notes AS notes,
                                FLOOR(a.i_plafond) AS plafond,
                                FLOOR(a.i_total_invoice) AS totalinvoice,
                                FLOOR(a.i_total_deposit) AS totaldeposit,
                                a.i_point AS point,
                                '' AS favourite,
                                IFNULL(DATE_FORMAT(a.dt_lastvisit, '%Y-%m-%d %T'),'') AS date_last_visit,
                                a.dt_created AS created
                            FROM dvw_master.vw_customer a
                            WHERE a.b_isactive = 1
                                AND a.fk_business = ${fk_business}
                            ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/customer/selectcustomermobile', resolve);
    })
}

export function selectCustomerWithMergeMobile({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }): Promise<Array<selectCustomer>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT
                                a.i_code AS code,
                                a.v_code AS customcode,
                                a.fk_price AS price,
                                a.v_name AS name,
                                a.v_image AS image,
                                a.v_email AS email,
                                a.v_idnumber AS idnumber,
                                a.dt_birthdate AS birthdate,
                                a.b_gender AS gender,
                                a.v_address AS address,
                                a.v_phone AS phone,
                                a.v_notes AS notes,
                                FLOOR(a.i_plafond) AS plafond,
                                FLOOR(a.i_total_invoice) AS totalinvoice,
                                FLOOR(a.i_total_deposit) AS totaldeposit,
                                a.i_point AS point,
                                a.dt_created AS created
                            FROM
                            (
                                SELECT z.fk_businessowner
                                FROM dvw_account.vw_business z
                                WHERE z.i_code = ${fk_business}
                            ) AS temp
                            JOIN dvw_master.vw_customer a ON a.fk_businessowner = temp.fk_businessowner
                            WHERE a.b_isactive = 1
                            ORDER BY a.v_name`
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerWithMerge', resolve);
    })
}

type selectCustomerPhone = {
    alias: string,
    name: string,
    phone: string
}
export function selectCustomerPhoneWithoutMerge({ res, connection }: typeGlobal.functions, { fk_business, v_code, v_phone }: { fk_business: number, v_code: string, v_phone: string }): Promise<Array<selectCustomerPhone>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                            a.v_code AS alias,
                            a.v_name AS name,
                            a.v_phone AS phone
                        FROM dvw_master.vw_customer a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND 
                            (
                                a.v_code = '${v_code}'
                                OR a.v_phone = '${v_phone}'
                            )
                    `
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerPhoneWithoutMerge', resolve);
    })
}


type customerphones = {
    customcode: string,
    name: string,
    phone: string
}
export function selectCustomerPhone({ res, connection }: typeGlobal.functions, { customcode, phone }: { customcode: string, phone: string }): Promise<customerphones> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                                a.v_code AS customcode,
                                a.v_name AS name,
                                a.v_phone AS phone
                            FROM dvw_master.vw_customer a
                            WHERE a.b_isactive = 1
                                AND a.fk_business = :business
                                AND 
                                (
                                    a.v_code = '${customcode}'
                                    OR a.v_phone = '${phone}'
                                )`
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerPhone', resolve);
    })
}

export function selectCustomerPhoneWithMerge({ res, connection }: typeGlobal.functions, { fk_business, v_code, v_phone }: { fk_business: number, v_code: string, v_phone: string }): Promise<Array<selectCustomerPhone>> {
    return new Promise(function (resolve, reject) {
        let query = `   
                    SELECT 
                        a.v_code AS alias,
                        a.v_name AS name,
                        a.v_phone AS phone
                    FROM
                    (
                        SELECT z.fk_businessowner
                        FROM dvw_account.vw_business z
                        WHERE z.i_code = ${fk_business}
                    ) AS \`temp\`
                    JOIN dvw_master.vw_customer a
                    WHERE a.b_isactive = 1
                        AND a.fk_businessowner = \`temp\`.fk_businessowner
                        AND 
                    (
                        a.v_code = '${v_code}'
                        OR a.v_phone = '${v_phone}'
                    )
                    `
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerPhoneWithMerge', resolve);
    })
}

export function selectCustomerPhoneWithoutMergeUsingName({ res, connection }: typeGlobal.functions, { fk_business, v_code, v_name }: { fk_business: number, v_code: string, v_name: string }): Promise<Array<selectCustomerPhone>> {
    return new Promise(function (resolve, reject) {
        let query = `   SELECT 
                                a.v_code AS alias,
                                a.v_name AS name,
                                a.v_phone AS phone
                            FROM dvw_master.vw_customer a
                            WHERE a.b_isactive = 1
                                AND a.fk_business = ${fk_business}
                                AND 
                                (
                                    a.v_code = '${v_code}'
                                    OR a.v_name = '${v_name}'
                                )
                    `
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerPhoneWithoutMergeUsingName', resolve);
    })
}

export function selectCustomerPhoneWithMergeUsingName({ res, connection }: typeGlobal.functions, { fk_business, v_code, v_name }: { fk_business: number, v_code: string, v_name: string }): Promise<Array<selectCustomerPhone>> {
    return new Promise(function (resolve, reject) {
        let query = `  SELECT 
                            a.v_code AS alias,
                            a.v_name AS name,
                            a.v_phone AS phone
                        FROM
                        (
                            SELECT z.fk_businessowner
                            FROM dvw_account.vw_business z
                            WHERE z.i_code = ${fk_business}
                        ) AS \`temp\`
                        JOIN dvw_master.vw_customer a
                        WHERE a.b_isactive = 1
                            AND a.fk_businessowner = \`temp\`.fk_businessowner
                            AND 
                            (
                                a.v_code = '${v_code}'
                                OR a.v_name = '${v_name}'
                            )
                    `
        functionGlobal.query(query, res, connection, 'function/customer/selectCustomerPhoneWithMergeUsingName', resolve);
    })
}

type insert = ResultSetHeader
export function insertCustomer({ res, connection }: typeGlobal.functions, { fk_business, v_code, v_phone, v_name, v_email, v_idnumber, dt_birthdate, b_gender, v_address, v_notes, i_plafond, fk_price }: { fk_business: number, v_code: string, v_phone: string, v_name: string, v_email: string, v_idnumber: string, dt_birthdate: string, b_gender: number, v_address: string, v_notes: string, i_plafond: number, fk_price: number }): Promise<insert> {
    return new Promise(function (resolve, reject) {
        let query = `  INSERT INTO dvw_master.vw_customer SET 
                            fk_business =${fk_business} , 
                            v_code = '${v_code}', 
                            v_name= '${v_name}',
                            v_email = '${v_email}', 
                            v_idnumber = '${v_idnumber}', 
                            dt_birthdate = '${dt_birthdate}',
                            b_gender = ${b_gender}, 
                            v_address = '${v_address}', 
                            v_phone = '${v_phone}', 
                            v_notes = '${v_notes}', 
                            i_plafond = ${i_plafond}, 
                            fk_price = ${fk_price}`
        functionGlobal.query(query, res, connection, 'function/customer/insertCustomer', resolve);
    })
}

type updateCustomer = ResultSetHeader
export function updateCustomerCustomer({ res, connection }: typeGlobal.functions, { fk_business, customcode, phone, name, email, idnumber, birthdate, gender, address, notes, plafond, price, code }: { fk_business: number, customcode: string, phone: string, name: string, email: string, idnumber: string, birthdate: string, gender: string, address: string, notes: string, plafond: number, price: number, code: number }): Promise<updateCustomer> {
    return new Promise(function (resolve, reject) {
        let query = `  
                        UPDATE dvw_master.vw_customer SET
                                                v_code = '${customcode}',
                                                v_name = '${name}',
                                                v_email = '${email}',
                                                v_idnumber = '${idnumber}',
                                                ${birthdate ?
                                                `dt_birthdate = ${birthdate},`
                                                : ""} 
                                                dt_birthdate = ${birthdate},
                                                b_gender = ${gender},
                                                v_address = '${address}',
                                                v_phone = '${phone}',
                                                v_notes = '${notes}',
                                                i_plafond = ${plafond},
                                                fk_price = ${price}
                                            WHERE i_code = ${code}
                                            AND fk_business = ${fk_business}`
        functionGlobal.query(query, res, connection, 'function/customer/updateCustomer', resolve);
    })
}


export function getReportInvoice({ res, connection }: typeGlobal.functions, { fk_business }: { fk_business: number }) {
    return new Promise((resolve, reject) => {
        let query = `SELECT
                        a.v_code AS \`customer_code\`,
                        a.v_name AS name,
                        a.i_total_invoice AS invoice,
                        a.i_plafond AS plafond,
                        a.i_total_deposit AS deposit
                    FROM dvw_master.vw_customer a
                    WHERE a.fk_business = ${fk_business}
                    and a.b_isactive = 1`
        functionGlobal.query(query, res, connection, 'function/master/customer/getReportInvoice', resolve)
    })
}

export function showCodeCustomer({ res, connection }: typeGlobal.functions, { fk_business, table, code }: { fk_business: number, table: string, code: any }) {
    return new Promise((resolve, reject) => {
        let query = `SELECT dvw_view.FC_SHOWCODE(${code}, '${table}', ${fk_business}) AS code;`
        functionGlobal.query(query, res, connection, 'function/master/customer/showCodeCustomer', resolve)
    })
}

type getNameFromPhone = {
    name: string
}
export function getNameFromPhone({res, connection}: typeGlobal.functions, {fk_business, v_phone}: {fk_business: number, v_phone: string}): Promise<getNameFromPhone> {
    return new Promise((resolve, reject) => {
        let query = `
                    SELECT
                        v_name as name
                    FROM
                        dvw_master.vw_customer
                    WHERE
                        fk_business = ${fk_business}
                        AND v_phone = '${v_phone}'
                        AND b_isactive = 1
                    `
        functionGlobal.querySingle(query, res, connection, 'function/master/customer', resolve)
    })
}

// export function getNameByPhone({res, connection}: typeGlobal.functions, {fk_business, v_phone}: {fk_business: number, v_phone: string}) {
//     return new Promise((resolve, reject)) => {
//         let query = `
//                     SELECT
//                         FROM dvw_master.vw_customer
//                     WHERE
//                         fk_business = ${fk_business}
//                         AND v_phone = '${v_phone}`
//     }
// }