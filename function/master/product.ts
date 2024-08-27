import * as typeGlobal from "../../type/global";
import * as functionGlobal from "../global_function";

type getProducts = {
  code: any;
  sku: any;
  code_custom: any;
  name: any;
  image: any;
  category_code: any;
  category: any;
  formula: any;
  stock: any;
  unit: any;
  unit_code: any;
  unit_variance: any;
  use_price_distributor: any;
  price_bottom: any;
  price: any;
  price2: any;
  price3: any;
  price4: any;
  price5: any;
  price_point: any;
  price_net: any;
  qty: any;
  qty_alert: any;
  notes: any;
  sort: any;
  show_online_store: any;
  recommendation: any;
  commission_type: any;
  commission_value: any;
  description_item: string;
};
export async function getProducts(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    b_hasstock,
    b_showinplatform,
    fk_category,
    b_hasformula,
    vw_item_stock,
    vw_business,
    sortandfilter,
  }: {
    fk_business: number;
    b_hasstock?: number;
    b_showinplatform?: number;
    fk_category?: number;
    b_hasformula?: number;
    vw_item_stock: { fk_business: number };
    vw_business: { i_code: number };
    sortandfilter: typeGlobal.sortAndFilter;
  }
): Promise<Array<getProducts>> {
  return new Promise((resolve, reject) => {
    let query = `   SELECT *
                        FROM (
                            SELECT
                                a.i_code AS \`code\`,
                                a.v_code AS \`sku\`,
                                a.v_code AS \`code_custom\`,
                                a.v_name AS \`name\`,
                                CASE
                                    WHEN a.v_image IS NULL THEN 'https://quipster-ws.looyal.id/image/default/quipster.png?1234'
                                    WHEN a.v_image = '' THEN 'https://quipster-ws.looyal.id/image/default/quipster.png?1234'
                                    ELSE CONCAT(a.v_image,'?',NOW()) 
                                END AS \`image\`,
                                a.fk_category AS \`category_code\`,
                                b.v_name AS \`category\`,
                                a.b_hasformula AS \`formula\`,
                                a.b_hasstock AS \`stock\`,
                                c.v_name AS \`unit\`,
                                a.fk_unit AS \`unit_code\`,
                                IFNULL(a.v_unit_variance, '') AS \`unit_variance\`,
                                a.b_distributor AS \`use_price_distributor\`,
                                a.i_price_bottom AS \`price_bottom\`,
                                a.i_price AS \`price\`,
                                a.i_price2 AS \`price2\`,
                                a.i_price3 AS \`price3\`,
                                a.i_price4 AS \`price4\`,
                                a.i_price5 AS \`price5\`,
                                a.v_notes AS \`description_item\`,
                                IFNULL(a.i_point,0) AS \`price_point\`,
                                FLOOR(a.i_pricenet) AS \`price_net\`,
                                a.i_qty AS \`qty\`,
                                a.i_qtyalert AS \`qty_alert\`,
                                IFNULL(a.v_notes, '') AS \`notes\`,
                                a.i_sort AS \`sort\`,
                                b_showinplatform AS \`show_online_store\`,
                                b_recommendation AS \`recommendation\`,
                                a.b_commision AS \`commission_type\`,
                                a.i_commision AS \`commission_value\`,
                                (
                                    SELECT COUNT(aa.fk_item)
                                    FROM dvw_master.vw_item_price_distributor aa
                                    WHERE aa.fk_item = a.i_code
                                ) AS \`count_distributor\`,
                                a.b_favorite_not_include AS \`prevent_favorite\`
                            FROM dvw_master.vw_item a
                            JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                            JOIN dvw_master.vw_unit c ON a.fk_unit = c.i_code
                            JOIN dvw_account.vw_business d ON a.fk_business = d.i_code
                            WHERE a.b_isactive = 1
                                AND a.fk_business = '${fk_business}'
                                ${
                                  b_hasstock
                                    ? `AND a.b_hasstock = '${b_hasstock}'`
                                    : ``
                                }
                                ${
                                  b_showinplatform
                                    ? `AND a.b_showinplatform = '${b_showinplatform}'`
                                    : ``
                                }
                                ${
                                  fk_category
                                    ? `AND a.fk_category = '${fk_category}'`
                                    : ``
                                }
                                ${
                                  b_hasformula
                                    ? `AND a.b_hasformula = '${b_hasformula}'`
                                    : ``
                                }
                                ${
                                  sortandfilter.name
                                    ? `AND (
                                    a.v_name = '${sortandfilter.name}'
                                    OR b.v_name = '${sortandfilter.name}'
                                )`
                                    : ``
                                }
                        ) \`temp\`
                        ${
                          sortandfilter.order
                            ? `ORDER BY ${sortandfilter.order}`
                            : `ORDER BY temp.sort, temp.name`
                        }
                        ${
                          sortandfilter.limit
                            ? `LIMIT ${
                                sortandfilter.start
                                  ? `${sortandfilter.start}, `
                                  : ``
                              } ${sortandfilter.limit}`
                            : ``
                        }
                    `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/master/product/getProducts",
      resolve
    );
  });
}

export async function getProductsTravy(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    b_hasstock,
    b_showinplatform,
    fk_category,
    b_hasformula,
    vw_item_stock,
    vw_business,
    sortandfilter,
  }: {
    fk_business: number;
    b_hasstock?: number;
    b_showinplatform?: number;
    fk_category?: number;
    b_hasformula?: number;
    vw_item_stock: { fk_business: number };
    vw_business: { i_code: number };
    sortandfilter: typeGlobal.sortAndFilter;
  }
): Promise<Array<getProducts>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT *
                    FROM (
                        SELECT
                            a.i_code AS \`code\`,
                            a.v_code AS \`sku\`,
                            a.v_name AS \`name\`,
                            CASE
                                WHEN a.v_image IS NULL THEN 'https://travy-ws.looyal.id/images/travy.png'
                                WHEN a.v_image = '' THEN 'https://travy-ws.looyal.id/images/travy.png'
                                ELSE CONCAT(a.v_image,'?',NOW()) 
                            END AS \`image\`,
                            a.fk_category AS \`category_code\`,
                            b.v_name AS \`category\`,
                            a.b_hasformula AS \`formula\`,
                            a.b_hasstock AS \`stock\`,
                            c.v_name AS \`unit\`,
                            a.fk_unit AS \`unit_code\`,
                            a.v_unit_variance AS \`unit_variance\`,
                            a.b_distributor AS \`use_price_distributor\`,
                            a.i_price AS \`price\`,
                            a.i_price2 AS \`price2\`,
                            a.i_price3 AS \`price3\`,
                            a.i_price4 AS \`price4\`,
                            a.i_price5 AS \`price5\`,
                            IFNULL(a.i_point,0) AS \`price_point\`,
                            FLOOR(a.i_pricenet) AS \`price_net\`,
                            a.i_qty AS \`qty\`,
                            a.i_qtyalert AS \`qty_alert\`,
                            a.v_notes AS \`notes\`,
                            a.i_sort AS \`sort\`,
                            b_showinplatform AS \`show_online_store\`,
                            b_recommendation AS \`recommendation\`,
                            a.b_commision AS \`commission_type\`,
                            a.i_commision AS \`commission_value\`
                        FROM dvw_master.vw_item a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        JOIN dvw_master.vw_unit c ON a.fk_unit = c.i_code
                        JOIN dvw_account.vw_business d ON a.fk_business = d.i_code
                        WHERE a.b_isactive = 1
                            AND a.fk_business = '${fk_business}'
                            ${
                              b_hasstock
                                ? `AND a.b_hasstock LIKE '${b_hasstock}'`
                                : ``
                            }
                            ${
                              b_showinplatform
                                ? `AND a.b_showinplatform LIKE '${b_showinplatform}'`
                                : ``
                            }
                            ${
                              fk_category
                                ? `AND a.fk_category LIKE '${fk_category}'`
                                : ``
                            }
                            ${
                              b_hasformula
                                ? `AND a.b_hasformula LIKE '${b_hasformula}'`
                                : ``
                            }
                            ${
                              sortandfilter.name
                                ? `AND (
                                a.v_name = '${sortandfilter.name}'
                                OR b.v_name = '${sortandfilter.name}'
                            )`
                                : ``
                            }
                    ) \`temp\`
                    ${
                      sortandfilter.order
                        ? `ORDER BY ${sortandfilter.order}`
                        : ``
                    }
                    ${
                      sortandfilter.limit
                        ? `LIMIT ${
                            sortandfilter.start
                              ? `${sortandfilter.start}, `
                              : ``
                          } ${sortandfilter.limit}`
                        : ``
                    }
                    `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/master/product/getProductsTravy",
      resolve
    );
  });
}

type getName = {
  name: string;
};
export async function getName(
  { res, connection }: typeGlobal.functions,
  { i_code }: { i_code: number }
): Promise<getName> {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT v_name as name
            FROM dvw_master.vw_item
            WHERE i_code = ${i_code}
        `;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/master/product/getName",
      resolve
    );
  });
}

type getCodeInOtherBusiness = {
  code: number;
};
export async function getCodeInOtherBusiness(
  { res, connection }: typeGlobal.functions,
  {
    i_code,
    otherBusiness,
  }: { i_code: number; otherBusiness: { i_code: number } }
): Promise<getCodeInOtherBusiness> {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT i_code as code
            FROM dvw_master.vw_item
            WHERE
                v_code = (SELECT v_code FROM dvw_master.vw_item WHERE i_code = ${i_code})
                AND fk_business = ${otherBusiness.i_code}
                AND b_isactive = 1
        `;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/master/product",
      resolve
    );
  });
}
