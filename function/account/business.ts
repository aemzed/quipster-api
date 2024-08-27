import * as typeGlobal from "../../type/global";
import * as typeBusiness from "../../type/business";

import * as functionGlobal from "../global_function";
import { ResultSetHeader } from "mysql2";
import { iam_v1 } from "googleapis";

type list = {
  code: string;
  name: string;
  date_expired: string;
  date_joined: string;
};
export function list(
  { res, connection }: typeGlobal.functions,
  { name }: { name?: string }
): Promise<list[]> {
  if (!name) name = "";

  return new Promise(async (resolve, reject) => {
    let query = `SELECT 
                        SHA1(a.i_code) AS code,
                        a.v_name AS name,
                        a.dt_expired AS date_expired,
                        a.dt_created AS date_joined
                    FROM dvw_account.vw_business a
                    WHERE a.b_isactive = 1
                        AND a.v_name LIKE '%${name}%'
                    ORDER BY a.i_code ASC`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/business/list",
      resolve
    );
  });
}

export function updateDateExpired(
  { res, connection }: typeGlobal.functions,
  {
    business,
    type,
    interval,
  }: { business: number; type: number; interval: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE dvw_account.vw_business SET 
                            dt_expired = DATE_ADD(DATE_FORMAT(dt_expired, '%Y-%m-%d %T'), INTERVAL ${interval} ${
      type == 1 ? "DAY" : "MONTH"
    }),
                            b_isactive = 1
                        WHERE i_code = ${business}
`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/business/updateDateExpired",
      resolve
    );
  });
}

type getFeatures = {
  ppnScType: number;
  monitorOrder: number;
  fkBusinessDuplicate: number;
  maxDuplicate: number;
  laundry: number;
  whatsappTransaction: number;
  whatsappShift: number;
  whatsappAbsence: number;
};
export function getFeatures({
  res,
  connection,
  fk_business,
}: typeGlobal.functions & { fk_business: number }): Promise<getFeatures> {
  return new Promise(async (resolve, reject) => {
    type queryResult = {
      ppn_sc_type: number;
      monitor_order: number;
      business_duplicate: number;
      max_duplicate: number;
      laundry: number;
      whatsapp_transaction: number;
      whatsapp_shift: number;
      whatsapp_absence: number;
    };
    let query = `SELECT 
                        IFNULL(b.b_ppn_sc_type, 0) AS "ppn_sc_type",
                        IFNULL(b.b_monitor_order, 0) AS "monitor_order",
                        IFNULL(b.fk_business_duplicate, 0) AS "business_duplicate",
                        IFNULL(b.i_max_duplicate, 0) AS "max_duplicate",
                        IFNULL(b.b_laundry, 0) AS "laundry",
                        IFNULL(c.b_transaction, 0) AS "whatsapp_transaction",
                        IFNULL(c.b_shift, 0) AS "whatsapp_shift",
                        IFNULL(c.b_absence, 0) AS "whatsapp_absence"
                    FROM dvw_account.vw_business a
                    RIGHT JOIN dvw_setting.vw_other b ON a.i_code = b.fk_business
                    RIGHT JOIN dvw_setting.vw_whatsapp c ON a.i_code = c.fk_business
                    WHERE a.i_code = ${fk_business}`;

    let result: queryResult = await new Promise((resolve, reject) =>
      functionGlobal.querySingle(query, res, connection, "", resolve)
    );
    resolve(<getFeatures>{
      ppnScType: result.ppn_sc_type,
      fkBusinessDuplicate: result.business_duplicate,
      laundry: result.laundry,
      maxDuplicate: result.max_duplicate,
      monitorOrder: result.monitor_order,
      whatsappAbsence: result.whatsapp_absence,
      whatsappShift: result.whatsapp_shift,
      whatsappTransaction: result.whatsapp_transaction,
    });
  });
}

type getNamePhoneAndBusinessOwnerName = {
  phone: string;
  owner: string;
  businessName: string;
};
export async function getNamePhoneAndBusinessOwnerName(
  { res, connection }: typeGlobal.functions,
  { code }: { code: number }
): Promise<getNamePhoneAndBusinessOwnerName> {
  return new Promise(async (resolve, reject) => {
    type queryResult = {
      phone: string;
      name: string;
      business: string;
    };
    let query = `SELECT 
                        a.v_phone AS "phone",
                        b.v_name AS "name",
                        a.v_name AS "business"
                    FROM dvw_account.vw_business a
                    JOIN dvw_account.vw_businessowner b ON a.fk_businessowner = b.i_code
                    WHERE a.i_code = ${code}`;
    let result: queryResult = await new Promise((resolve, reject) =>
      functionGlobal.querySingle(
        query,
        res,
        connection,
        "function/accouunt/business/getNamePhoneAndBusinessOwnerName",
        resolve
      )
    );
    resolve(<getNamePhoneAndBusinessOwnerName>{
      businessName: result.business,
      owner: result.name,
      phone: result.phone,
    });
  });
}

type getMergeCustomer = {
  merge: number;
};
export async function getMergeCustomer(
  { res, connection }: typeGlobal.functions,
  { code }: { code: number }
): Promise<getMergeCustomer> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                        b.b_mergecustomer AS "merge"
                    FROM dvw_account.vw_business a
                    JOIN dvw_account.vw_businessowner b ON a.fk_businessowner = b.i_code
                    WHERE a.b_isactive = 1
                        AND a.i_code = ${code}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getMergeCustomer",
      resolve
    );
  });
}

type getBusinessowner = {
  code: number;
};
export async function getBusinessowner(
  { res, connection }: typeGlobal.functions,
  { fk_business }: { fk_business: number }
): Promise<getBusinessowner> {
  return new Promise((resolve, reject) => {
    let query = `SELECT z.fk_businessowner AS "code"
                    FROM dvw_account.vw_business z
                    WHERE z.i_code = ${fk_business}
                        AND z.b_isactive = 1`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getBusinessowner",
      resolve
    );
  });
}

type getCode = {
  code: string;
};
export function getCode(
  { res, connection }: typeGlobal.functions,
  { code }: { code: number }
): Promise<getCode> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_code AS code
                    FROM dvw_account.vw_business a
                    WHERE a.b_isactive = 1
                        AND a.i_code = ${code}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getCode",
      resolve
    );
  });
}

type get = {
  business: number;
  business_owner: number;
  business_name: string;
  business_code: string;
  business_email: string;
  lat: string;
  lon: string;
  xendit: string;
  maybank: string;
  maybank_key: string;
  qris_type: number;
};
export function get(
  { res, connection }: typeGlobal.functions,
  { code, SHA1$code }: { code: number; SHA1$code: string }
): Promise<get> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                        a.i_code AS "business",
                        a.fk_businessowner AS "business_owner",
                        a.v_name AS "business_name",
                        a.v_code AS "business_code",
                        a.v_email AS "business_email",
                        IFNULL(a.v_latitude, '') AS "lat",
                        IFNULL(a.v_longitude, '') AS "lon",
                        IFNULL(b.v_token_xendit, '') AS "xendit",
                        IFNULL(b.v_maybank, '') AS "maybank",
                        IFNULL(b.v_maybank_key, '') AS "maybank_key",
                        IFNULL(b.i_qris_type, 3) AS "qris_type"
                    FROM dvw_account.vw_business a
                    LEFT JOIN dvw_setting.vw_mode b ON a.i_code = b.fk_business
                    WHERE a.b_isactive = 1
                        AND (
                            a.i_code = '${code}'
                            OR SHA1(a.i_code) = '${SHA1$code}'
                        )`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/get",
      resolve
    );
  });
}

type getName = {
  name: string;
  code: number;
};

export async function getNameFromOwner(
  { res, connection }: typeGlobal.functions,
  { fk_businessowner }: { fk_businessowner: number }
): Promise<Array<getName>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_name AS \`name\`,
                        a.i_code AS \`code\`
                    FROM dvw_account.vw_business a
                    WHERE a.fk_businessowner = ${fk_businessowner}
                        AND a.b_isactive = 1
                    ORDER BY a.i_code`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getName",
      resolve
    );
  });
}

export async function getNameFromUser(
  { res, connection }: typeGlobal.functions,
  { vw_business_user }: { vw_business_user: { fk_user: number } }
): Promise<Array<getName>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_name AS \`name\`,
                        a.i_code AS \`code\`
                    FROM dvw_account.vw_business a
                    JOIN dvw_account.vw_business_user b ON a.i_code = b.fk_business
                    WHERE b.fk_user = ${vw_business_user.fk_user}
                        AND a.b_isactive = 1
                    ORDER BY a.i_code`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getNameFromUser",
      resolve
    );
  });
}

type getAllBusinessCodeFromOwner = {
  code: number;
};
export async function getAllBusinessCodeFromOwner(
  { res, connection }: typeGlobal.functions,
  { fk_businessowner }: { fk_businessowner: number }
): Promise<Array<getAllBusinessCodeFromOwner>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT a.i_code as \`code\`
                    FROM dvw_account.vw_business a
                    WHERE a.fk_businessowner = ${fk_businessowner}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getAllBusinessCodeFromOwner",
      resolve
    );
  });
}

export async function getNameCodeAndQtyOwner(
  { res, connection }: typeGlobal.functions,
  { fk_businessowner }: { fk_businessowner: number },
  { vw_item }: { vw_item: { v_code: string } },
  {
    vw_stockreport,
  }: { vw_stockreport?: { dt_created?: { end_date?: string } } }
) {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_name AS \`business\`, 
                        a.i_code AS \`business_code\`, 
                        COALESCE(SUM(d.i_qty), 0) AS \`qty\`
                    FROM dvw_account.vw_business a
                    LEFT JOIN dvw_master.vw_item b ON b.fk_business = a.i_code AND b.b_isactive = 1 AND b.v_code = '${
                      vw_item.v_code
                    }'
                    LEFT JOIN dvw_master.vw_material c ON c.fk_business = a.i_code AND b.b_isactive = 1
                    LEFT JOIN dvw_operational.vw_stockreport d ON d.fk_business = a.i_code AND IF(d.b_type = 1, d.fk_itemmaterial = b.i_code, d.fk_itemmaterial = c.i_code) AND d.b_isactive = 1
                                ${
                                  vw_stockreport?.dt_created?.end_date
                                    ? `AND d.dt_created <= '${vw_stockreport.dt_created?.end_date}'`
                                    : ""
                                }
                    WHERE a.fk_businessowner = ${fk_businessowner}
                        AND a.b_isactive = 1
                    GROUP BY a.i_code
                    ORDER BY a.i_code`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getNameCodeAndQty",
      resolve
    );
  });
}

export async function getNameCodeAndQtyUser(
  { res, connection }: typeGlobal.functions,
  { fk_user }: { fk_user: number },
  { vw_item }: { vw_item: { v_code: string } },
  {
    vw_stockreport,
  }: { vw_stockreport?: { dt_created?: { end_date?: string } } }
) {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_name AS \`business\`, 
                        a.i_code AS \`business_code\`, 
                        COALESCE(SUM(e.i_qty), 0) AS \`qty\`
                    FROM dvw_account.vw_business a
                    JOIN dvw_account.vw_business_user b ON a.i_code = b.fk_business
                    LEFT JOIN dvw_master.vw_item c ON c.fk_business = b.fk_business AND c.b_isactive = 1 AND c.v_code = '${
                      vw_item.v_code
                    }'
                    LEFT JOIN dvw_master.vw_material d ON d.fk_business = b.fk_business AND c.b_isactive = 1
                    LEFT JOIN dvw_operational.vw_stockreport e ON e.fk_business = b.fk_business AND IF(e.b_type = 1, e.fk_itemmaterial = c.i_code, e.fk_itemmaterial = d.i_code) AND e.b_isactive = 1
                        ${
                          vw_stockreport?.dt_created?.end_date
                            ? `AND e.dt_created <= '${vw_stockreport.dt_created?.end_date}'`
                            : ""
                        }
                    WHERE b.fk_user = ${fk_user}
                        AND c.b_isactive = 1
                        AND c.b_hasstock = 1
                    GROUP BY a.i_code
                    ORDER BY c.v_name`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getNameCodeAndQtyUser",
      resolve
    );
  });
}

type getFullBusiness = {
  business: number;
  wooblazz: string;
  name: string;
  ID: string;
  business_type: number;
  business_name: string;
  business_email: string;
  business_expired: string;
  business_plan: string;
  business_address: string;
  business_phone: string;
  business_state: string;
  business_city: string;
  business_zipcode: string;
  business_operational_hour: string;
  image: string;
  pin_void: string;
  pin_discount: string;
  pin_operational: string;
  tax: number;
  service_charge: number;
  rounded_type: number;
  limit_user: number;
  module_production: number;
  module_inventory: number;
  module_purchase_order: number;
  module_barcode: number;
  module_printer: number;
  module_invoice: number;
  module_shift: number;
  module_variant_price: number;
  module_multi_unit: number;
  module_customer_loyalty: number;
  module_whatsapp: number;
  branch: number;
  feature_absence: number;
  feature_broadcast: number;
  feature_marketplace: number;
  feature_formula: number;
  feature_table_management: number;
  feature_printer_special_laundry: number;
  feature_printer_special_fnb: number;
  feature_customer_phone_priority: number;
  feature_ppn_sc_type: number;
  feature_price_distributor_automatic: number;
  feature_sku_important: number;
  feature_delivery_order: number;
  feature_receipt_purchase_order: number;
  feature_nfc_customer: number;
  feature_relx: number;
  feature_jvape: number;
  feature_income: number;
  feature_commision: number;
  feature_superselling: number;
  feature_profit_sharing: number;
  feature_pos_website: number;
  feature_monitor_order: number;
  feature_online_store: number;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  qris_type: number;
  qris_pending: number;
  identity: string;
  bank_name: string;
  bank_number: string;
  bank_account: string;
  qris: number;
  cash: number;
  online_name: string;
  online_address: string;
  online_postcode: string;
  online_phone: string;
  online_information: string;
  color_primary: string;
  color_text: string;
  shipping_mode: number;
  shipping_cost: number;
  latitude: number;
  longitude: number;
  city_expedisi: number;
  expedisi: number;
  banner: string;
  background_order: string;
  order_online: number;
  withdraw_qris_avaiable: number;
  business_owner: string;
  feature_auto_retur: number;
  feature_scan_discount: number;
};
export async function getFullBusiness(
  { res, connection }: typeGlobal.functions,
  { fk_business }: { fk_business: number },
  { vw_user }: { vw_user: { name: string } }
): Promise<getFullBusiness> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                        a.i_code AS \`business\`,
                        a.fk_wooblazz AS wooblazz,
                        '${vw_user.name.replaceAll("'", "''")}' AS \`name\`,
                        a.v_code AS \`ID\`,
                        a.b_category AS \`business_type\`,
                        a.v_name AS \`business_name\`,
                        a.v_email AS \`business_email\`,
                        a.dt_expired AS \`business_expired\`,
                        a.v_currentplan AS \`business_plan\`,
                        a.v_address AS \`business_address\`,
                        a.v_phone AS \`business_phone\`,
                        a.v_state AS \`business_state\`,
                        a.v_city AS \`business_city\`,
                        a.v_zipcode AS \`business_zipcode\`,
                        a.v_openinghours AS \`business_operational_hour\`,
                        CASE
                            WHEN a.v_image = '' THEN ''
                            ELSE CONCAT('https://www.woogigs.com/assets/img/business/', a.v_code, '/', a.v_image, '')
                        END AS \`image\`,
                        a.v_pinvoid AS \`pin_void\`,
                        a.v_pindiscount AS \`pin_discount\`,
                        a.v_pinpo AS \`pin_operational\`,
                        a.i_tax AS \`tax\`,
                        a.i_servicecharge AS \`service_charge\`,
                        a.i_roundedtype AS \`rounded_type\`,
                        a.i_extradevice AS \`limit_user\`,
                        a.b_productionmodule AS \`module_production\`,
                        a.b_inventorymodule AS \`module_inventory\`,
                        a.b_purchaseordermodule AS \`module_purchase_order\`,
                        a.b_barcodesystemmodule AS \`module_barcode\`,
                        a.b_printermodule AS \`module_printer\`,
                        a.b_invoicemodule AS \`module_invoice\`,
                        a.b_shiftmodule AS \`module_shift\`,
                        a.b_variantpricemodule AS \`module_variant_price\`,
                        a.b_multiunitmodule AS \`module_multi_unit\`,
                        a.b_customerloyaltymodule AS \`module_customer_loyalty\`,
                        a.b_whatsappmodule AS \`module_whatsapp\`,
                        IFNULL(b.b_branch, 0) AS \`branch\`,
                        IFNULL(b.b_absence, 0) AS \`feature_absence\`,
                        IFNULL(b.b_broadcast, 0) AS \`feature_broadcast\`,
                        IFNULL(b.b_marketplace, 0) AS \`feature_marketplace\`,
                        IFNULL(b.b_formula, 0) AS \`feature_formula\`,
                        IFNULL(b.b_table_management, 0) AS \`feature_table_management\`,
                        IFNULL(b.b_printer_special, 0) AS \`feature_printer_special_laundry\`,
                        IFNULL(b.b_printer_special_fnb, 0) AS \`feature_printer_special_fnb\`,
                        IFNULL(b.b_customer_phone_priority, 0) AS \`feature_customer_phone_priority\`,
                        IFNULL(b.b_ppn_sc_type, 0) AS \`feature_ppn_sc_type\`,
                        IFNULL(b.b_price_distributor_automatic, 0) AS \`feature_price_distributor_automatic\`,
                        IFNULL(b.b_sku_important, 0) AS \`feature_sku_important\`,
                        IFNULL(b.b_delivery_order, 0) AS \`feature_delivery_order\`,
                        IFNULL(b.b_receipt_purchase_order, 0) AS \`feature_receipt_purchase_order\`,
                        IFNULL(b.b_nfc_customer, 0) AS \`feature_nfc_customer\`,
                        IFNULL(b.b_relx, 0) AS \`feature_relx\`,
                        IFNULL(b.b_jvape, 0) AS \`feature_jvape\`,
                        IFNULL(b.b_income, 0) AS \`feature_income\`,
                        IFNULL(b.b_commision, 0) AS \`feature_commision\`,
                        IFNULL(b.b_superselling, 0) AS \`feature_superselling\`,
                        IFNULL(b.b_profit_sharing, 0) AS \`feature_profit_sharing\`,
                        IFNULL(b.b_pos_website, 0) AS \`feature_pos_website\`,
                        IFNULL(b.b_monitor_order, 0) AS \`feature_monitor_order\`,
                        IFNULL(b.b_auto_retur, 0) AS \`feature_auto_retur\`,
                        IFNULL(b.b_scan_discount, 0) AS \`feature_scan_discount\`,
                        CASE
                            WHEN DATE(a.dt_expired) >= DATE(NOW()) THEN 1
                            ELSE 0
                        END AS \`feature_online_store\`,
                        IFNULL(d.v_monday, '') AS \`monday\`,
                        IFNULL(d.v_tuesday, '') AS \`tuesday\`,
                        IFNULL(d.v_wednesday, '') AS \`wednesday\`,
                        IFNULL(d.v_thursday, '') AS \`thursday\`,
                        IFNULL(d.v_friday, '') AS \`friday\`,
                        IFNULL(d.v_saturday, '') AS \`saturday\`,
                        IFNULL(d.v_sunday, '') AS \`sunday\`,
                        IFNULL(c.i_qris_type, 0) AS \`qris_type\`,
                        IFNULL(c.b_qris_pending, 0) AS \`qris_pending\`,
                        IFNULL(c.v_identity, 0) AS \`identity\`,
                        IFNULL(c.v_bank_name, 0) AS \`bank_name\`,
                        IFNULL(c.v_bank_number, 0) AS \`bank_number\`,
                        IFNULL(c.v_bank_account, 0) AS \`bank_account\`,
                        IFNULL(c.b_qris, 0) AS \`qris\`,
                        IFNULL(c.b_manual, 0) AS \`cash\`,
                        IFNULL(d.v_name, a.v_name) AS \`online_name\`,
                        IFNULL(d.v_address, a.v_address) AS \`online_address\`,
                        IFNULL(d.v_postcode, '') AS \`online_postcode\`,
                        IFNULL(d.v_phone, a.v_phone) AS \`online_phone\`,
                        IFNULL(d.v_information, '') AS \`online_information\`,
                        IFNULL(d.v_color_background, '#3B97D2') AS \`color_primary\`,
                        IFNULL(d.v_color_text, '#ffffff') AS \`color_text\`,
                        IFNULL(d.b_shipping_cost_mode, '0') AS \`shipping_mode\`,
                        IFNULL(d.i_shipping_cost, '0') AS \`shipping_cost\`,
                        IFNULL(d.d_latitude, '0') AS \`latitude\`,
                        IFNULL(d.d_longitude, '0') AS \`longitude\`,
                        IFNULL(d.fk_city, '0') AS \`city_expedisi\`,
                        IFNULL(d.j_expedisi, '[]') AS \`expedisi\`,
                        CASE
                            WHEN IFNULL(d.v_banner, '') <> '' THEN CONCAT(d.v_banner, '?', TIME_FORMAT(NOW(), '%H%i%s'))
                            ELSE ''
                        END AS \`banner\`,
                        CASE
                            WHEN IFNULL(d.v_background_order, '') <> '' THEN CONCAT(d.v_background_order, '?', TIME_FORMAT(NOW(), '%H%i%s'))
                            ELSE ''
                        END AS \`background_order\`,
                        IFNULL(c.b_order_online, 0) AS \`order_online\`,
                        IFNULL((
                            SELECT a.i_balance
                            FROM dvw_operational.vw_deposit_business_statement a
                            WHERE a.fk_business = ${fk_business}
                            ORDER BY a.dt_created DESC, a.i_order DESC
                            LIMIT 1
                        ), 0) AS \`withdraw_qris_avaiable\`,
                        e.v_name AS \`business_owner\`
                    FROM dvw_account.vw_business a
                    LEFT JOIN dvw_setting.vw_other b ON b.fk_business = a.i_code
                    LEFT JOIN dvw_setting.vw_mode c ON c.fk_business = a.i_code
                    LEFT JOIN dvw_setting.vw_online d ON d.fk_business = a.i_code
                    LEFT JOIN dvw_account.vw_businessowner e ON a.fk_businessowner = e.i_code
                    WHERE a.b_isactive = 1
                        AND a.i_code = ${fk_business}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getFullBusiness",
      resolve
    );
  });
}

type checkWooblazz = {
  binded_phone: string;
};
export async function getWooblazzConnection(
  { res, connection }: typeGlobal.functions,
  { fk_business }: { fk_business: number }
): Promise<checkWooblazz> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                        fk_wooblazz AS \`binded_phone\`
                    FROM 
                        dvw_account.vw_business 
                    WHERE 
                        i_code = ${fk_business}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/acccount/business/checkWooblazz",
      resolve
    );
  });
}

type setWooblazzConnection = ResultSetHeader;
export async function setWooblazzConnection(
  { res, connection }: typeGlobal.functions,
  { i_code, fk_wooblazz }: { i_code: number; fk_wooblazz: string }
): Promise<setWooblazzConnection> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE
                        dvw_account.vw_business
                    SET
                        fk_wooblazz = '${fk_wooblazz}'
                    WHERE
                        i_code = ${i_code}
                        AND b_isactive = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/setWooblazzConnection",
      resolve
    );
  });
}

type unsetWooblazzConnection = ResultSetHeader;
export async function unsetWooblazzConnection(
  { res, connection }: typeGlobal.functions,
  { i_code }: { i_code: number }
): Promise<unsetWooblazzConnection> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE
                        dvw_account.vw_business
                    SET
                        fk_wooblazz = ''
                    WHERE
                        i_code = ${i_code}
                        AND b_isactive = 1`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/unsetWooblazzConnection",
      resolve
    );
  });
}

type getWooblazz = {
  phone: string;
  name: string;
  bc_user_code: number;
};
export async function getWooblazz(
  { res, connection }: typeGlobal.functions,
  { i_code }: { i_code: number }
): Promise<getWooblazz> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.fk_wooblazz AS \`phone\`,
                        b.v_name AS \`name\`,
                        b.i_code AS \`bc_user_code\`
                    FROM
                        dvw_account.vw_business a
                    JOIN
                        tkd_broadcast.bc_user b ON a.fk_wooblazz = b.v_phone
                    WHERE
                        a.i_code = ${i_code}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getWooblazz",
      resolve
    );
  });
}

type getWooblazzCredits = {
  type: number;
  credit: number;
  credit_full: number;
};
export async function getWooblazzCredits(
  { res, connection }: typeGlobal.functions,
  { fk_user }: { fk_user: number }
): Promise<Array<getWooblazzCredits>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        a.v_number AS \`phone\`,
                        a.b_type AS \`type\`,
                        COALESCE(SUM(b.i_credit), 0) AS \`credit\`,
                        COALESCE(SUM(b.i_credit_full), 0) AS \`credit_full\`,
                        IF(a.v_number_key = '' OR IFNULL(b.b_status, 0) = 0, 0, 1) AS \`active\`,
                        b.dt_expiration AS \`date_expired\`
                    FROM
                        tkd_broadcast.bc_user_number a
                    LEFT JOIN
                        tkd_broadcast.bc_user_credit b ON a.i_code = b.fk_user_number
                    WHERE
                        a.fk_user = ${fk_user}
                    GROUP BY
                        a.i_code
                    `;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getWooblazzCredit",
      resolve
    );
  });
}
type getBusinessUser = {
  code: number;
  name: string;
  startorder: number;
  username: string;
  manager: number;
  master: number;
  production: number;
  inventory: number;
  expense: number;
  finance: number;
  relation: number;
  transaction: number;
  globaltransaction: number;
  invoice: number;
  communityads: number;
  operational: number;
};
export async function getBusinessUser(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    whereadditional,
  }: { fk_business: number; whereadditional: string }
): Promise<getBusinessUser> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                            i_code AS code,
                            v_name AS name,
                            i_startorder AS startorder,
                            v_email AS username,
                            b_ismanager AS manager,
                            b_master AS master,
                            b_production AS production,
                            b_inventory AS inventory,
                            b_expense AS expense,
                            b_finance AS finance,
                            b_relation AS relation,
                            b_transaction AS transaction,
                            b_globaltransaction AS globaltransaction,
                            b_invoice AS invoice,
                            b_communityads AS communityads,
                            b_operational AS operational
                        FROM dvw_account.vw_user
                        WHERE b_isactive = 1
                            AND fk_business = ${fk_business}
                            ${whereadditional}
                        ORDER BY b_isowner DESC, i_code ASC`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/getBusinessUser",
      resolve
    );
  });
}

type getExpiredNDiscountNDiscountStatusNPrices = {
  businessExpired: string;
  discount: number;
  discount_status: number;
  price: number;
  price_1: number;
  price_3: number;
  price_12: number;
  feature_branch: number;
  feature_auto_retur: number;
};

export function getExpiredNDiscountNDiscountStatusNPrices(
  { res, connection }: typeGlobal.functions,
  { i_code }: { i_code: number }
): Promise<getExpiredNDiscountNDiscountStatusNPrices> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        c.v_phone AS business_phone,
                        a.dt_expired AS businessExpired,
                        CASE
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) <= 30 THEN 100000
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) > 30 THEN 0
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_activated), 7) <= 30 THEN 100000
                            ELSE 0
                        END AS discount,
                        CASE
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) <= 30 THEN 0
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_created), 7) > 30 THEN 0
                            WHEN IFNULL(DATEDIFF(a.dt_expired, a.dt_activated), 7) <= 30 THEN 0
                            ELSE 0
                        END AS discount_status,
                        150000 AS price,
                        299000 AS price_1,
                        829000 AS price_3,
                        3199000 AS price_12,
                        a.b_voidtransactionpin AS pin_void_transaction_use,
                        a.v_pin AS pin_void_transaction,
                        a.b_pinvoid AS pin_void_use,
                        a.v_pinvoid AS pin_void,
                        a.b_pindiscount AS pin_discount_use,
                        a.v_pindiscount AS pin_discount,
                        a.v_pinpo AS pin_purchase_order,
                        a.b_pinpo AS pin_purchase_order_use,
                        a.b_productionmodule AS productionmodule,
                        a.b_inventorymodule AS inventorymodule,
                        IFNULL(b.b_branch, 0) AS feature_branch,
                        IFNULL(b.b_auto_retur, 0) AS feature_auto_retur,
                        IFNULL(b.b_package_use_tax, 1) AS package_use_tax,
                        IFNULL(b.b_package_use_service_charge, 1) AS package_use_service_charge,
                        a.fk_wooblazz_salestype AS wooblazz_salestype
                    FROM dvw_account.vw_business a
                    LEFT JOIN dvw_setting.vw_other b ON a.i_code = b.fk_business
                    JOIN dvw_account.vw_businessowner c ON a.fk_businessowner = c.i_code
                    WHERE a.i_code = ${i_code}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getExpiredNDiscountNDiscountStatusNPrices",
      resolve
    );
  });
}

type selectUsername = {
  username: string;
};
export async function selectUsername(
  { res, connection }: typeGlobal.functions,
  { fk_business, email }: { fk_business: number; email: string }
): Promise<Array<selectUsername>> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                            a.v_email AS username
                        FROM dvw_account.vw_user a
                        WHERE a.b_isactive = 1
                            AND a.fk_business = ${fk_business}
                            AND a.v_email = '${email}'
                        ORDER BY b_isowner DESC, i_code ASC`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/selectUsername",
      resolve
    );
  });
}

type insertBusinessUser = ResultSetHeader;
export async function insertBusinessUser(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    name,
    startorder,
    username,
    password,
    manager,
    master,
    production,
    inventory,
    expense,
    finance,
    relation,
    transaction,
    globaltransaction,
    communityads,
    operational,
    invoice,
  }: {
    fk_business: number;
    name: string;
    startorder: number;
    username: string;
    password: string;
    manager: number;
    master: number;
    production: number;
    inventory: number;
    expense: number;
    finance: number;
    relation: number;
    transaction: number;
    globaltransaction: number;
    communityads: number;
    operational: number;
    invoice: number;
  }
): Promise<insertBusinessUser> {
  return new Promise((resolve, reject) => {
    let query = `INSERT INTO dvw_account.vw_user
                        (fk_business, b_isowner, v_name, i_startorder, v_email, v_password, b_ismanager, b_master, b_production, b_inventory, b_expense, b_finance, b_relation, b_transaction, b_globaltransaction, b_communityads, b_operational, b_invoice)
                        VALUES (${fk_business}, 0, '${name}', ${startorder}, '${username}', '${password}', ${manager}, ${master}, ${production}, ${inventory}, ${expense}, ${finance}, ${relation}, ${transaction}, ${globaltransaction}, ${communityads}, ${operational}, ${invoice})`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/insertBusinessUser",
      resolve
    );
  });
}

type removeBusinessUser = ResultSetHeader;
export async function removeBusinessUser(
  { res, connection }: typeGlobal.functions,
  { fk_business, code }: { fk_business: number; code: number }
): Promise<removeBusinessUser> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_user SET
                                b_isactive = 0
                            WHERE i_code = ${code}
                                AND fk_business = ${fk_business}
                                AND b_isowner = 0`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/removeBusinessUser",
      resolve
    );
  });
}

type updateBusinessUserWithoutPassword = ResultSetHeader;
export async function updateBusinessUserWithoutPassword(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    code,
    name,
    startorder,
    username,
    manager,
    master,
    production,
    inventory,
    expense,
    finance,
    relation,
    transaction,
    globaltransaction,
    invoice,
    communityads,
    operational,
  }: {
    fk_business: number;
    code: number;
    name: string;
    startorder: number;
    username: string;
    manager: number;
    master: number;
    production: number;
    inventory: number;
    expense: number;
    finance: number;
    relation: number;
    transaction: number;
    globaltransaction: number;
    invoice: number;
    communityads: number;
    operational: number;
  }
): Promise<updateBusinessUserWithoutPassword> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_user SET
                            v_name = '${name}',
                            i_startorder = ${startorder},
                            v_email = '${username}',
                            b_ismanager = ${manager},
                            b_master = ${master},
                            b_production = ${production},
                            b_inventory = ${inventory},
                            b_expense = ${expense},
                            b_finance = ${finance},
                            b_relation = ${relation},
                            b_transaction = ${transaction},
                            b_globaltransaction = ${globaltransaction},
                            b_invoice = ${invoice},
                            b_communityads = ${communityads},
                            b_operational = ${operational}
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updateBusinessUserWithoutPassword",
      resolve
    );
  });
}

type selectOwnerBusiness = {
  isowner: string;
  businessowner: string;
};
export async function selectOwnerBusiness(
  { res, connection }: typeGlobal.functions,
  { fk_business, code }: { fk_business: number; code: number }
): Promise<selectOwnerBusiness> {
  return new Promise((resolve, reject) => {
    let query = `SELECT 
                            a.b_isowner AS isowner,
                            b.fk_businessowner AS businessowner
                        FROM dvw_account.vw_user a
                        JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                        WHERE a.i_code = ${code}
                        AND a.fk_business = ${fk_business}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/selectOwnerBusiness",
      resolve
    );
  });
}

type updateBusinessUserWithPassword = ResultSetHeader;
export async function updateBusinessUserWithPassword(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    code,
    username,
    password,
    manager,
    master,
    production,
    inventory,
    expense,
    finance,
    relation,
    transaction,
    globaltransaction,
    invoice,
    communityads,
    operational,
  }: {
    fk_business: number;
    code: number;
    username: string;
    password: string;
    manager: number;
    master: number;
    production: number;
    inventory: number;
    expense: number;
    finance: number;
    relation: number;
    transaction: number;
    globaltransaction: number;
    invoice: number;
    communityads: number;
    operational: number;
  }
): Promise<updateBusinessUserWithPassword> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_user SET
                            v_email = '${username}',
                            v_password = '${password}',
                            b_ismanager = ${manager},
                            b_master = ${master},
                            b_production = ${production},
                            b_inventory = ${inventory},
                            b_expense = ${expense},
                            b_finance = ${finance},
                            b_relation = ${relation},
                            b_transaction = ${transaction},
                            b_globaltransaction = ${globaltransaction},
                            b_invoice = ${invoice},
                            b_communityads = ${communityads},
                            b_operational = ${operational}
                        WHERE i_code = ${code}
                        AND fk_business = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updateBusinessUserWithPassword",
      resolve
    );
  });
}

type updatePasswordOwner = ResultSetHeader;
export async function updatePasswordOwner(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    username,
    password,
    businessowner,
  }: {
    fk_business: number;
    username: string;
    password: string;
    businessowner: string;
  }
): Promise<updatePasswordOwner> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_user a
                        JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                        SET
                            v_password = '${password}'
                        WHERE a.b_isowner = 1
                            AND b.fk_businessowner = ${businessowner}
                            AND a.v_email = '${username}'
                        AND fk_business = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updatePasswordOwner",
      resolve
    );
  });
}

type updatePasswordBusinessOwner = ResultSetHeader;
export async function updatePasswordBusinessOwner(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    username,
    password,
    businessowner,
  }: {
    fk_business: number;
    username: string;
    password: string;
    businessowner: string;
  }
): Promise<updatePasswordBusinessOwner> {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_businessowner a
                        SET
                            v_password = '${password}'
                        WHERE a.i_code = ${businessowner}
                            AND a.v_email = '${username}'
                        AND fk_business = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updatePasswordBusinessOwner",
      resolve
    );
  });
}

type updatePasswordUser = ResultSetHeader;
export async function updatePasswordUser(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    username,
    password,
    businessowner,
  }: {
    fk_business: number;
    username: string;
    password: string;
    businessowner: string;
  }
): Promise<updatePasswordUser> {
  return new Promise((resolve, reject) => {
    let query = `   UPDATE dvw_account.vw_user a
                        JOIN dvw_account.vw_business b ON a.fk_business = b.i_code
                        SET
                            v_password = ${password}
                        WHERE a.b_isowner = 1
                            AND b.fk_businessowner = ${businessowner}
                            AND a.v_email = '${username}'
                            AND a.fk_business = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updatePasswordUser",
      resolve
    );
  });
}

type updateSetting = ResultSetHeader;
export async function updateSetting(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    dueday,
    setting_dueday,
  }: {
    fk_business: number;
    dueday: number;
    setting_dueday: number;
  }
): Promise<updateSetting> {
  return new Promise((resolve, reject) => {
    let query = `   UPDATE dvw_account.vw_business a
                        SET
                            a.i_setting_due = ${dueday},
                            a.b_setting_due_before_today = ${setting_dueday}
                        WHERE a.i_code = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updateSetting",
      resolve
    );
  });
}
export async function updateAddressPhoneStateCity(
  { res, connection }: typeGlobal.functions,
  {
    fk_business,
    v_address,
    v_phone,
    v_state,
    v_city,
  }: {
    fk_business: number;
    v_address: string;
    v_phone: string;
    v_state: string;
    v_city: string;
  }
) {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_business SET
                        v_address = '${v_address}',
                        v_phone = '${v_phone}',
                        v_state = '${v_state}',
                        v_city = '${v_city}'
                    WHERE i_code = ${fk_business}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/updateAddressPhoneStateCity",
      resolve
    );
  });
}

export function update(
  { res, connection }: typeGlobal.functions,
  {
    v_name,
    v_email,
    v_address,
    v_phone,
    v_city,
    v_state,
    i_tax,
    i_servicecharge,
    b_pinvoid,
    v_pinvoid,
    b_pindiscount,
    v_pindiscount,
    b_pinpo,
    v_pinpo,
    v_openinghours,
    i_code,
  }: {
    i_code: number;
    v_name: string;
    v_email: string;
    v_address: string;
    v_phone: string;
    v_city: string;
    v_state: string;
    i_tax: number;
    i_servicecharge: number;
    b_pinvoid: number;
    v_pinvoid: string;
    b_pindiscount: number;
    v_pindiscount: string;
    b_pinpo: number;
    v_pinpo: string;
    v_openinghours: string;
  }
) {
  return new Promise((resolve, reject) => {
    let query = `UPDATE dvw_account.vw_business SET
                        v_name = '${v_name}',
                        v_email = '${v_email}',
                        v_address = '${v_address}',
                        v_phone = '${v_phone}',
                        v_city = '${v_city}',
                        v_state = '${v_state}',
                        i_tax = ${i_tax},
                        i_servicecharge = ${i_servicecharge},
                        b_pinvoid = ${b_pinvoid},
                        v_pinvoid = '${v_pinvoid}',
                        b_pindiscount = ${b_pindiscount},
                        v_pindiscount = '${v_pindiscount}',
                        b_pinpo = ${b_pinpo},
                        v_pinpo = '${v_pinpo}',
                        v_openinghours = '${v_openinghours}'
                    WHERE i_code = ${i_code}`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/update",
      resolve
    );
  });
}

export function updateImage(
  { res, connection }: typeGlobal.functions,
  { i_code, v_image }: { i_code: number; v_image: string }
) {
  return new Promise((resolve, reject) => {
    let query = `UPDATE
                        dvw_account.vw_business
                    SET
                        v_image = '${v_image}'
                    WHERE
                        i_code = ${i_code}
                    `;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/bussiness/updateImage",
      resolve
    );
  });
}

export function softDeleteImage(
  { res, connection }: typeGlobal.functions,
  { i_code }: { i_code: number }
) {
  return new Promise((resolve, reject) => {
    let query = `UPDATE
                        dvw_account.vw_business
                    SET
                        v_image = ''
                    WHERE
                        i_code = ${i_code}
                    `;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/account/business/deleteImage",
      resolve
    );
  });
}

type getCustomerMergeNCustomerPhone = {
  merge: number;
  customer_phone: number;
};
export function getCustomerMergeNCustomerPhone(
  { res, connection }: typeGlobal.functions,
  { fk_business }: { fk_business: number }
): Promise<getCustomerMergeNCustomerPhone> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                                b.b_mergecustomer AS merge,
                                IFNULL(c.b_customer_phone_priority, 1) AS customer_phone
                            FROM dvw_account.vw_business a
                            JOIN dvw_account.vw_businessowner b ON a.fk_businessowner = b.i_code
                            LEFT JOIN dvw_setting.vw_other c ON a.i_code = c.fk_business
                            WHERE a.b_isactive = 1
                                AND a.i_code = ${fk_business}
                    `;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/customer/getCustomerMergeNCustomerPhone",
      resolve
    );
  });
}

type getOpenClose = {
  open: string;
  close: string;
};
export function getOpenClose(
  { res, connection }: typeGlobal.functions,
  { fk_business, dateNow }: { fk_business: number; dateNow: string }
): Promise<getOpenClose> {
  return new Promise((resolve, reject) => {
    let query = `SELECT
                        IFNULL
                        (
                            CASE
                                WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${dateNow}') THEN CONCAT(DATE('${dateNow}') - INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                ELSE CONCAT((DATE('${dateNow}') + INTERVAL 1 DAY) - INTERVAL 1 day, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                            END,
                            CONCAT(DATE('${dateNow}')- INTERVAL 1 day, ' 00:00')
                        ) AS \`open\`,
                        IFNULL
                        (
                            CASE
                                WHEN SUBSTRING_INDEX(b.v_openinghours,'-',-1) >= TIME('${dateNow}') THEN CONCAT(DATE('${dateNow}'), ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                                ELSE CONCAT(DATE('${dateNow}') + INTERVAL 1 DAY, ' ', SUBSTRING_INDEX(b.v_openinghours,'-',-1))
                            END,
                            CONCAT(DATE('${dateNow}'), ' 00:00')
                        ) AS \`close\`,
                        COUNT(1)
                    FROM dvw_account.vw_business b
                    WHERE b.i_code = ${fk_business}`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/selectOpenCloseShift",
      resolve
    );
  });
}

export function getById(
  { res, connection }: typeGlobal.functions,
  { v_code }: { v_code: string }
) {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT i_code
            FROM dvw_account.vw_business
            WHERE 
                v_code = '${v_code}'
                AND b_isactive = 1
        `;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/account/business/getById",
      resolve
    );
  });
}
