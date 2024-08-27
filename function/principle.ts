import * as functionGlobal from "./global_function";
import * as typeGlobal from "../type/global";

type getSupplierCode = {
  code: number;
};
export function getSupplierCode(
  { connection, res }: typeGlobal.functions,
  { email, password }: { email: string; password: string }
): Promise<getSupplierCode> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            i_code as code
                        FROM dvw_master.vw_supplier 
                        WHERE b_isactive = 1
                            AND v_email = '${email}'
                            AND v_password = SHA1('${password}')`;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/principle/getSupplierCode",
      resolve
    );
  });
}

type getUserSupplier = {
  business_code: number;
  code_supplier: number;
  supplier_name: string;
  supplier_email: string;
  supplier_address: string;
  supplier_phone: string;
};
export function getUserSupplier(
  { connection, res }: typeGlobal.functions,
  { code }: { code: number }
): Promise<getUserSupplier> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                                b.fk_business AS business_code,
                                b.i_code AS code_supplier,
                                b.v_name AS supplier_name,
                                b.v_email AS supplier_email,
                                b.v_address AS supplier_address,
                                b.v_phone AS supplier_phone
                            FROM 
                                dvw_master.vw_supplier b
                            WHERE b.i_code = ${code}`;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/principle/getUserSupplier",
      resolve
    );
  });
}

type getInventoryList = {
  category_code: number;
  business_code: number;
  code_supplier: number;
  supplier_name: string;
  supplier_email: string;
  supplier_address: string;
  supplier_phone: string;
};
export function getInventoryList(
  { connection, res }: typeGlobal.functions,
  { hash }: { hash: string }
): Promise<getInventoryList> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                                a.i_code AS \`code\`,
                                a.v_code AS \`SKU_Principle\`,
                                a.v_name AS \`item_name\`,
                                a.v_unit AS \`unit_name\`,
                                a.i_qty AS \`qty\`,
                                b.i_code AS \`supplier_code\`,
                                b.v_name AS \`supplier_name\`
                            FROM dvw_master.vw_inventory_principle a 
                            JOIN dvw_master.vw_supplier b ON a.fk_supplier = b.i_code 
                            WHERE SHA1(b.i_code) = '${hash}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getInventoryList",
      resolve
    );
  });
}

type getInventoryForSKUQuipster = {
  code: number;
  sku_principal: string;
  item_name: string;
};
export function getInventoryForSKUQuipster(
  { connection, res }: typeGlobal.functions,
  { id }: { id: number }
): Promise<getInventoryForSKUQuipster> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                                a.i_code AS \`code\`,
                                a.v_code AS \`sku_principal\`,
                                a.v_name AS \`item_name\`
                            FROM dvw_master.vw_inventory_principle a 
                            WHERE a.fk_supplier = '${id}'
                            AND b_isactive = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getInventoryForSKUQuipster",
      resolve
    );
  });
}

type getSKUForInsertPrincipal = {
  code: number;
  sku_principal: string;
  item_name: string;
};
export function getSKUForInsertPrincipal(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
): Promise<getSKUForInsertPrincipal> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                                a.i_code AS \`code\`,
                                a.v_code AS \`sku_principal\`,
                                a.v_name AS \`item_name\`
                            FROM dvw_master.vw_inventory_principle a 
                            WHERE a.v_code = '${code}'
                            AND b_isactive = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getSKUForInsertPrincipal",
      resolve
    );
  });
}
type getSkuPrincipal = {
  item_code: number;
  sku: string;
  name: string;
  sku_principal: string;
  code_category: number;
  category_name: string;
  supplier_code: number;
  supplier_name: string;
  quantity_quipster: number;
  quantity_principal: number;
};
export function getSkuPrincipal(
  { connection, res }: typeGlobal.functions,
  { business }: { business: number }
): Promise<getSkuPrincipal> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT a.i_code AS item_code, 
                            a.v_code AS sku, 
                            a.v_name AS name, 
                            e.v_code AS sku_principal,
                            c.i_code AS code_category,
                            c.v_name AS category_name,
                            d.i_code AS supplier_code,
                            d.v_name AS supplier_name,
                            a.i_qty AS quantity_quipster,
                            IFNULL(b.i_qty, 0 ) AS quantity_principal
                        FROM dvw_master.vw_item a 
                        LEFT JOIN dvw_master.vw_sku_principal e ON a.fk_sku_principal = e.i_code
                        LEFT JOIN dvw_master.vw_inventory_principle b ON e.v_code = b.v_code
                        JOIN dvw_master.vw_category c ON a.fk_category = c.i_code
                        JOIN dvw_master.vw_supplier d ON c.fk_supplier = d.i_code
                        WHERE a.fk_business = ${business}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getSkuPrincipal",
      resolve
    );
  });
}

type getItemSKU = {
  item_code: number;
  sku: string;
  name: string;
  sku_principal: string;
};
export function getItemSKU(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
): Promise<getItemSKU> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT a.i_code AS item_code, 
                            a.v_code AS sku
                        FROM dvw_master.vw_item a 
                        WHERE a.i_code = ${code}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getItemSKU",
      resolve
    );
  });
}

export async function insertToPrincipal(
  { connection, res }: typeGlobal.functions,
  { principal }: { principal: string }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO dvw_master.vw_sku_principal SET
                            v_code = '${principal}',
                            b_isactive = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertToPrincipal",
      resolve
    );
  });
}

export async function insertIntoPrincipalWeb(
  { connection, res }: typeGlobal.functions,
  {
    principal,
    name,
    unit,
    qty,
    id,
  }: { principal: string; name: string; unit: string; qty: number; id: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO dvw_master.vw_inventory_principle SET
                            v_code = '${principal}',
                            v_name = '${name}',
                            v_unit = '${unit}',
                            i_qty = ${qty},
                            dt_created = NOW(),
                            fk_supplier = ${id}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertIntoPrincipalWeb",
      resolve
    );
  });
}

export async function insertMiniPO(
  { connection, res }: typeGlobal.functions,
  {
    code_po
  }: { code_po: string }
) {
  return new Promise(function (resolve, reject) {
    let query = `INSERT INTO 
                      dvw_operational.vw_purchaseorder_principal 
                          SET dt_po = NOW(), 
                              v_no_po = "${code_po}"`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principal/insertMiniPO",
      resolve
    );
  });
}

export async function insertDetailMiniPO(
  { connection, res }: typeGlobal.functions,
  {
    unit, qty, fk_item, purchaseorder
  }: { unit: string, qty: number, fk_item: number, purchaseorder: string }
) {
  return new Promise(function (resolve, reject) {
    let query = `INSERT INTO 
                      dvw_operational.vw_purchaseorderdetail_principal 
                          SET fk_item_principal = ${fk_item}, 
                              fk_purchaseorder_principal = ${purchaseorder},
                              v_unit = "${unit}",
                              i_qty = ${qty}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principal/insertDetailMiniPO",
      resolve
    );
  });
}

export async function updateSKUtoItem(
  { connection, res }: typeGlobal.functions,
  { id, code }: { id: number; code: number }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE dvw_master.vw_item SET 
                                            fk_sku_principal = ${id}
                                            WHERE i_code = ${code}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertToPrincipal",
      resolve
    );
  });
}

export async function updateStockQuipster(
  { connection, res }: typeGlobal.functions,
  { qty, code }: { qty: number; code: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE dvw_master.vw_item SET 
                                            i_qty = ${qty}
                                            WHERE i_code = ${code}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateStockQuipster",
      resolve
    );
  });
}

type getStockQuipster = {
  name: string;
  qty: string;
  code: number;
};

export function getStockQuipster(
  { connection, res }: typeGlobal.functions,
  { code, fk_business }: { code: number, fk_business: number }
): Promise<Array<getStockQuipster>> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT v_name as name, i_qty as qty, i_code as code FROM dvw_master.vw_item WHERE fk_business = ${fk_business} AND i_code = ${code}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getStockQuipster",
      resolve
    );
  });
}
