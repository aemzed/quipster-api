import * as functionGlobal from "./global_function";
import * as typeGlobal from "../type/global";
import { ResultSetHeader } from "mysql2";

type getVariable = {
  key: string;
  value: string;
};
export function getVariable(
  { connection, res }: typeGlobal.functions,
  { brand }: { brand: string }
): Promise<getVariable[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_key AS 'key',
                            a.v_value AS 'value'
                        FROM tkd_crm.db_variable a
                        WHERE a.fk_brand = '${brand}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getVariable",
      resolve
    );
  });
}

type getUser = {
  id: number;
  otp: string;
  name: string;
  email: string;
  address: string;
  date_birth: string;
  phone: string;
  gender: number;
  date_join: string;
  member: number;
  business_code: number;
  transaction_count?: number;
  transaction_nominal?: number;
};
export function getUser(
  { connection, res }: typeGlobal.functions,
  { phone }: { phone: string }
): Promise<getUser> {
  if (phone.indexOf("0") === 0) phone = "62" + phone.substring(1);
  else if (phone.indexOf("+") === 0) phone = phone.substring(1);

  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.i_code AS id,
                            a.v_otp AS otp,
                            a.v_name AS name,
                            a.v_email AS email,
                            a.v_phone AS phone,
                            a.fk_business AS business_code,
                            a.v_address AS address,
                            a.v_birth_date AS date_birth,
                            a.b_gender AS gender,
                            a.b_member AS member,
                            a.dt_created AS date_join
                        FROM tkd_crm.db_user a
                        WHERE a.v_phone LIKE '${phone}'`;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/getUser",
      resolve
    );
  });
}

type getDiscountAfterScan = {
  nominal: number;
  status: number;
  customerphone: string;
  customername: string;
  customeraddress: string;
  gender: number;
  canScan: number;
  business_code: string;
};
export function getDiscountAfterScan(
  { connection, res }: typeGlobal.functions,
  { discount_code }: { discount_code: string }
): Promise<getDiscountAfterScan> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT  
                                b.i_code AS user_code,
                                b.v_email AS email,
                                a.i_nominal AS nominal, 
                                a.b_status AS status,  
                                b.fk_business AS business_code,
                                b.v_phone AS customerphone,
                                b.v_name AS customername,
                                b.v_address AS customeraddress,
                                b.b_gender AS gender,
                                a.b_canScan AS canScan
                        FROM tkd_crm.db_point_qr a 
                        JOIN tkd_crm.db_user b ON a.fk_user = b.i_code 
                        WHERE a.v_code = "${discount_code}"
                        AND a.b_status = 1`;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/getDiscountAfterScan",
      resolve
    );
  });
}

export function getUserById(
  { connection, res }: typeGlobal.functions,
  { id }: {  id: number }
): Promise<getUser> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.i_code AS id,
                            a.v_otp AS otp,
                            a.v_name AS name,
                            a.v_email email,
                            a.v_phone AS phone,
                            a.v_address AS address,
                            a.v_birth_date AS date_birth,
                            a.b_gender AS gender,
                            a.b_member AS member,
                            a.dt_created AS date_join
                        FROM tkd_crm.db_user a
                        WHERE a.i_code = ${id}`;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/getUserById",
      resolve
    );
  });
}

type getCustomerByPhone = {
  name: string;
  address: string;
  birthdate: string;
  email: string;
  gender: number;
  business_code: number;
};
export function getCustomerByPhone(
  { connection, res }: typeGlobal.functions,
  { phone }: { phone: string }
): Promise<getCustomerByPhone> {
  if (phone.indexOf("0") === 0) phone = "62" + phone.substring(1);
  else if (phone.indexOf("+") === 0) phone = phone.substring(1);
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            v_name AS name, 
                            fk_business AS business_code,
                            v_address AS address, 
                            v_email AS email, 
                            dt_birthdate AS birthdate,
                            b_gender AS gender
                        FROM dvw_master.vw_customer 
                        WHERE v_phone = '${phone}'
                        AND b_isactive = 1`;
    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/getCustomerByPhone",
      resolve
    );
  });
}

type getPointAfterGenerateCode = {
  code: string;
  nominal: number;
  date_expired: string;
};
export function getPointAfterGenerateCode(
  { connection, res }: typeGlobal.functions,
  { id }: { id: number }
): Promise<getPointAfterGenerateCode> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
		                    a.v_code AS code,
		                    a.i_nominal AS nominal,
                            a.dt_expired AS date_expired
		                FROM tkd_crm.db_point_qr a
                        WHERE a.fk_user = ${id}
                        AND a.b_status = 1`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getPointAfterGenerateCode",
      resolve
    );
  });
}

type updateQRPaid = ResultSetHeader;
export function updateQRPaid(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
): Promise<updateQRPaid> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_qr SET
                                b_status = 2
                        WHERE v_code = '${code}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateQRPaid",
      resolve
    );
  });
}

type updateReceiptCode = ResultSetHeader;
export function updateReceiptCode(
  { connection, res }: typeGlobal.functions,
  { code, receipt }: { code: string; receipt: string }
): Promise<updateReceiptCode> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_pending SET
                                s_offlinecode = '${receipt}'
                        WHERE v_qr_code = '${code}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateReceiptCode",
      resolve
    );
  });
}

type updateStatusPointPending = ResultSetHeader;
export function updateStatusPointPending(
  { connection, res }: typeGlobal.functions,
  { receipt }: { receipt: string }
): Promise<updateStatusPointPending> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_pending SET
                                b_isactive = 0
                        WHERE s_offlinecode = '${receipt}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateStatusPointPending",
      resolve
    );
  });
}

type updatePointPendingQR = ResultSetHeader;
export function updatePointPendingQR(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
): Promise<updatePointPendingQR> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_pending SET
                                b_isactive = 0
                        WHERE v_qr_code = '${code}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updatePointPendingQR",
      resolve
    );
  });
}

type updateStatusTransactionPending = ResultSetHeader;
export function updateStatusTransactionPending(
  { connection, res }: typeGlobal.functions,
  { receipt }: { receipt: string }
): Promise<updateStatusTransactionPending> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE dvw_transaction.vw_transaction SET
                                b_ispaidoff = 1
                        WHERE s_offlinecode = '${receipt}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateStatusTransactionPending",
      resolve
    );
  });
}

type getPointPending = {
  code_qr: string;
  nominal: number;
}
export function getPointPending(
  { connection, res }: typeGlobal.functions,
  { user }: { user: number }
): Promise<getPointPending> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT v_qr_code AS code_qr,
                            i_point AS nominal
                            FROM tkd_crm.db_point_pending
                            WHERE fk_user = ${user}
                            AND b_isactive = 1`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getPointPending",
      resolve
    );
  });
}

export function updateQRScan(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
): Promise<updateQRPaid> {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_qr SET
                                b_canScan = 0
                        WHERE v_code = '${code}'`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateQRScan",
      resolve
    );
  });
}

type getTransactionYearly = {
  transaction_count: number;
  transaction_nominal: number;
};
export function getTransactionYearly(
  { connection, res }: typeGlobal.functions,
  { brand, phone }: { brand: string; phone: string }
): Promise<getTransactionYearly> {
  phone = phone.replace(" ", "");
  phone = phone.replace("-", "");

  var prefix = "0";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  prefix = "62";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  prefix = "+62";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            COUNT(1) AS transaction_count,
                            SUM(a.i_totalnet) AS transaction_nominal
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        JOIN dvw_master.vw_customer d ON a.fk_customer = d.i_code
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND e.fk_brand = '${brand}'
                            AND a.b_isvoid = 0
                            AND YEAR(a.dt_paid) = YEAR(NOW())
                            AND (
                                d.v_phone = '0${phone}'
                                OR d.v_phone = '62${phone}'
                                OR d.v_phone = '+62${phone}'
                            ) `;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/cem/getTransactionYearly",
      resolve
    );
  });
}

export function insertNewUser(
  { connection, res }: typeGlobal.functions,
  { phone, otp }: { phone: string; otp: string }
) {
  if (phone.indexOf("0") === 0) phone = "62" + phone.substring(1);
  else if (phone.indexOf("+") === 0) phone = phone.substring(1);

  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_user SET
                            fk_business = 9,
                            v_phone = '${phone}',
                            v_otp = '${otp}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertNewUser",
      resolve
    );
  });
}

export function insertHistoryPoint(
  { connection, res }: typeGlobal.functions,
  {
    id,
    nominal,
    type,
    receipt,
  }: { id: number; nominal: number; type: number; receipt: string }
) {
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_log_history_point SET
                            fk_user = '${id}',
                            i_nominal = '${nominal}',
                            i_type = ${type},
                            dt_created = NOW(),
                            v_receipt = '${receipt}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertHistoryPoint",
      resolve
    );
  });
}

export function insertPointPending(
  { connection, res }: typeGlobal.functions,
  { nominal, code, user }: { nominal: number; code: string; user: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_point_pending SET
                            i_point = ${nominal},
                            v_qr_code = '${code}',
                            fk_user = ${user},
                            dt_created = NOW(),
                            b_isactive = 1`;
    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertPointPending",
      resolve
    );
  });
}

export function getHistoryPoint(
  { connection, res }: typeGlobal.functions,
  { id }: { id: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT a.i_code AS code,
                               a.i_nominal AS nominal,
                               a.i_type AS type,
                               a.dt_created AS date_created,
                               a.v_receipt AS receipt_code
                        FROM tkd_crm.db_log_history_point a
                        WHERE a.fk_user = ${id}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getHistoryPoint",
      resolve
    );
  });
}

export function insertQrCode(
  { connection, res }: typeGlobal.functions,
  { uuid, id, nominal }: { uuid: string; id: number; nominal: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_point_qr SET
                            v_code = '${uuid}',
                            fk_user = ${id},
                            i_nominal = ${nominal},
                            b_status = 1,
                            dt_created = NOW(),
                            dt_expired = DATE_ADD(NOW(), INTERVAL 5 MINUTE)`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/insertQrCode",
      resolve
    );
  });
}

export function updateUserOtp(
  { connection, res }: typeGlobal.functions,
  { phone, otp }: { phone: string; otp: string }
) {
  if (phone.indexOf("0") === 0) phone = "62" + phone.substring(1);
  else if (phone.indexOf("+") === 0) phone = phone.substring(1);

  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_user SET
                            v_otp = '${otp}'
                        WHERE v_phone = '${phone}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateUserOtp",
      resolve
    );
  });
}

export function updateProfile(
  { connection, res }: typeGlobal.functions,
  data: {
    id: number;
    name: string;
    email: string;
    address: string;
    date_birth: string;
    gender: number;
    business: number;
  }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_user SET
                            v_name = '${data.name}',
                            fk_business = ${data.business},
                            v_email = '${data.email}',
                            v_address = '${data.address}',
                            v_birth_date = '${data.date_birth}',
                            b_gender = ${data.gender}
                        WHERE i_code = ${data.id}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updateProfile",
      resolve
    );
  });
}

type getPointsActive = {
  code: string;
  store_code: string;
  value: number;
  value_left: number;
  type: number;
  date_expired: string;
  date_created: string;
  point_source: string;
};
export function getPointsActive(
  { connection, res }: typeGlobal.functions,
  { id_user, order = "DESC" }: { id_user: number; order?: string }
): Promise<getPointsActive[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            v_code AS code,
                            i_value AS value,
                            i_value_left AS value_left,
                            b_type AS type,
                            dt_expired AS date_expired,
                            dt_created AS date_created,
                            fk_point_source AS point_source
                        FROM tkd_crm.db_point_movement a
                        WHERE a.fk_user = ${id_user}
                            AND i_value_left > 0
                            AND DATE(dt_expired) > DATE(NOW())
                        ORDER BY dt_expired ${order}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getPointsActive",
      resolve
    );
  });
}

type getPointsStatement = {
  date: string;
  type: string;
  source: string;
  value: number;
  store_name: string;
};
export function getPointsStatement(
  { connection, res }: typeGlobal.functions,
  data: { id_user: number }
): Promise<getPointsStatement[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            a.dt_created AS date,
                            a.b_type AS type,
                            a.fk_source AS source,
                            (a.i_value) AS value,
                            IFNULL(b.v_name, '') AS store_name
                        FROM tkd_crm.db_point_movement a
                        LEFT JOIN dvw_account.vw_business b ON b.i_code = a.fk_store
                        WHERE a.fk_user = ${data.id_user}
                        ORDER BY a.dt_created DESC`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getPointsStatement",
      resolve
    );
  });
}

type getUserVoucher = {
  date: string;
  type: string;
  source: string;
  value: number;
  store_name: string;
};
export function getUserVoucher(
  { connection, res }: typeGlobal.functions,
  data: { id_user: number }
): Promise<getUserVoucher[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            a.v_code AS code,
                            a.dt_expired AS date_expired,
                            a.dt_created AS date_created,
                            a.b_status AS status,
                            b.v_name AS voucher_name,
                            b.v_product_sku AS voucher_product_name,
                            b.v_product_name AS voucher_product_sku
                        FROM tkd_crm.db_user_voucher a
                        JOIN tkd_crm.db_voucher b ON b.v_code = a.fk_voucher
                        WHERE a.fk_user = ${data.id_user}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getUserVoucher",
      resolve
    );
  });
}

type getNotification = {
  code: string;
  type: number;
  title: string;
  notification: string;
  date: string;
};
export function getNotification(
  { connection, res }: typeGlobal.functions,
  { brand }: { brand: string }
): Promise<getNotification[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_code AS 'code',
                            a.b_type AS 'type',
                            a.v_title AS 'title',
                            a.v_notification AS 'notification',
                            a.dt_created AS 'date'
                        FROM tkd_crm.db_notification a
                        WHERE a.fk_brand = '${brand}'
                            AND a.b_status = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getNotification",
      resolve
    );
  });
}

type getStore = {
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: string;
  longitude: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  banner: string;
};
export function getStore(
  { connection, res }: typeGlobal.functions,
  { brand }: { brand: string }
): Promise<getStore[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            SHA1(a.i_code) AS 'code',
                            a.v_name AS 'name',
                            a.v_address AS 'address',
                            a.v_city AS 'city',
                            a.v_phone AS 'phone',
                            IFNULL(a.v_latitude, '-6.189969278616248') AS 'latitude',
                            IFNULL(a.v_longitude, '106.82433322443394') AS 'longitude',
                            IFNULL(c.v_sunday, '-') AS 'sunday',
                            IFNULL(c.v_monday, '-') AS 'monday',
                            IFNULL(c.v_tuesday, '-') AS 'tuesday',
                            IFNULL(c.v_wednesday, '-') AS 'wednesday',
                            IFNULL(c.v_thursday, '-') AS 'thursday',
                            IFNULL(c.v_friday, '-') AS 'friday',
                            IFNULL(c.v_saturday, '-') AS 'saturday',
                            IFNULL(c.v_banner, '') AS 'banner'
                        FROM dvw_account.vw_business a
                        JOIN dvw_setting.vw_other b ON a.i_code = b.fk_business
                        LEFT JOIN dvw_setting.vw_online c ON a.i_code = c.fk_business
                        WHERE a.b_isactive = 1
                            AND b.fk_brand = '${brand}'
                            AND a.i_code <> 57
                        ORDER BY a.v_name `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getStore",
      resolve
    );
  });
}

type getProduct = {
  name: string;
  sku: string;
  photo: string;
  category: number;
  price: number;
  qty: number;
};
export function getProduct(
  { connection, res }: typeGlobal.functions,
  { store }: { store: string }
): Promise<getProduct[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_code AS 'sku',
                            a.v_image AS 'photo',
                            b.v_name AS 'category',
                            a.i_price AS 'price',
                            a.i_qty AS 'qty'
                        FROM dvw_master.vw_item a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        WHERE a.b_isactive = 1
                            AND SHA1(a.fk_business) = '${store}'
                        ORDER BY a.v_name `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getProduct",
      resolve
    );
  });
}

type getBanner = {
  name: string;
  banner: string;
};
export function getBanner(
  { connection, res }: typeGlobal.functions,
  { brand }: { brand: string }
): Promise<getBanner[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_banner AS 'banner'
                        FROM tkd_crm.db_banner a
                        WHERE a.fk_brand = '${brand}'
                            AND a.b_status = 1
                        ORDER BY a.i_order `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getBanner",
      resolve
    );
  });
}

type getDiscountPointItem = {
  point_discount: number;
};
export function getDiscountPointItem(
  { connection, res }: typeGlobal.functions,
  { code }: { code: number }
): Promise<getDiscountPointItem> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT 
                            a.i_point_discount as point_discount
                        FROM 
                            dvw_master.vw_item a
                        WHERE 
                            a.i_code = ${code}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getDiscountPointItem",
      resolve
    );
  });
}

type getProductByKeyword = {
  name: string;
  sku: string;
  photo: string;
  category: string;
  price: string;
  qty: string;
  store_code: string;
  store_name: string;
  store_latitude: string;
  store_longitude: string;
  store_city: string;
  store_sunday: string;
  store_monday: string;
  store_tuesday: string;
  store_wednesday: string;
  store_thursday: string;
  store_friday: string;
  store_saturday: string;
};
export function getProductByKeyword(
  { connection, res }: typeGlobal.functions,
  { brand, keyword }: { brand: string; keyword: string }
): Promise<getProductByKeyword[]> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_name AS 'name',
                            a.v_code AS 'sku',
                            a.v_image AS 'photo',
                            b.v_name AS 'category',
                            a.i_price AS 'price',
                            a.i_qty AS 'qty',
                            SHA1(c.i_code) AS 'store_code',
                            c.v_name AS 'store_name',
                            IFNULL(c.v_latitude, '-6.189969278616248') AS 'store_latitude',
                            IFNULL(c.v_longitude, '106.82433322443394') AS 'store_longitude',
                            c.v_city AS 'store_city',
                            IFNULL(d.v_sunday, '-') AS 'store_sunday',
                            IFNULL(d.v_monday, '-') AS 'store_monday',
                            IFNULL(d.v_tuesday, '-') AS 'store_tuesday',
                            IFNULL(d.v_wednesday, '-') AS 'store_wednesday',
                            IFNULL(d.v_thursday, '-') AS 'store_thursday',
                            IFNULL(d.v_friday, '-') AS 'store_friday',
                            IFNULL(d.v_saturday, '-') AS 'store_saturday'
                        FROM dvw_master.vw_item a
                        JOIN dvw_master.vw_category b ON a.fk_category = b.i_code
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        LEFT JOIN dvw_setting.vw_online d ON a.fk_business = d.fk_business
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND e.fk_brnad = '${brand}'
                            AND a.v_name LIKE '%${keyword}%'
                        ORDER BY a.v_name `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getProductByKeyword",
      resolve
    );
  });
}

//VOUCHER=====================================================================
export type getVoucher = {
  code: string;
  name: string;
  product_sku: string;
  price: number;
  price_sale: number;
  date_start_sale: string;
  date_end_sale: string;
};
export function getVoucher<t extends getVoucher | getVoucher[]>(
  { connection, res }: typeGlobal.functions,
  { brand, code = "%" }: { brand: string; code?: string }
): Promise<t> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.v_code AS code,
                            a.v_name AS name,
                            a.v_product_sku AS product_sku,
                            a.v_product_name AS product_name,
                            a.i_point AS price,
                            a.i_point_sale AS price_sale,
                            a.dt_start_sale AS date_start_sale,
                            a.dt_end_sale AS date_end_sale
                        FROM tkd_crm.db_voucher a
                        WHERE a.b_status = 1
                            AND a.fk_brand = '${brand}'
                            AND a.v_code LIKE '${code}'
                        ORDER BY a.dt_created DESC `;

    if (code == "%")
      functionGlobal.query(
        query,
        res,
        connection,
        "function/crm/getVoucher",
        resolve
      );
    else
      functionGlobal.querySingle(
        query,
        res,
        connection,
        "function/crm/getVoucher",
        resolve
      );
  });
}

export async function buyVoucher(
  { connection, res }: typeGlobal.functions,
  { user, voucher }: { user: getUser; voucher: getVoucher }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_user_voucher SET
                            v_code = '${hash}',
                            fk_user = '${user.id}',
                            fk_voucher = '${voucher.code}',
                            dt_expired = DATE_ADD(NOW(),INTERVAL 2 DAY)`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/buyVoucher",
      resolve,
      { id: hash }
    );
  });
}

export async function minusPoint(
  { connection, res }: typeGlobal.functions,
  {
    user,
    value,
    type,
    source,
    source_point,
  }: {
    user: getUser;
    value: number;
    type: number;
    source: string;
    source_point: string;
  }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);
  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_point_movement SET
                            v_code = '${hash}',
                            fk_source = '${source}',
                            fk_point_source = '${source_point}',
                            fk_user = '${user.id}',
                            i_value = ${value},
                            b_type = ${type}`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/minusPoint",
      resolve,
      { id: hash }
    );
  });
}

export async function selectPointLoyaltyQuipster(
  { connection, res }: typeGlobal.functions,
  { user, value_left }: { user: number; value_left: number }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_movement SET
                            i_value_left = ${value_left}
                        WHERE fk_user = ${user} 
                        ORDER BY ABS(DATEDIFF(dt_expired, CURRENT_TIMESTAMP)) 
                        LIMIT 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/selectPointLoyaltyQuipster",
      resolve
    );
  });
}

export async function updatePointLoyaltyQuipster(
  { connection, res }: typeGlobal.functions,
  { user, value_left, code }: { user: number; value_left: number; code: string }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_movement SET
                            i_value_left = ${value_left} 
                        WHERE fk_user = ${user} 
                        AND v_code = '${code}'
                        ORDER BY ABS(DATEDIFF(dt_expired, CURRENT_TIMESTAMP))
                        LIMIT 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updatePointLoyaltyQuipster",
      resolve
    );
  });
}

export async function updatePoint(
  { connection, res }: typeGlobal.functions,
  {
    user,
    value_left,
    source_point,
  }: { user: getUser; value_left: number; source_point: string }
) {
  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_movement SET
                            i_value_left = ${value_left}
                        WHERE v_code = '${source_point}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/updatePoint",
      resolve
    );
  });
}
//=====================================================================

//POINT ==============================================================
type checkPointUsed = {
  count: number;
};
export function checkPointUsed(
  { connection, res }: typeGlobal.functions,
  { receipt }: { receipt: string }
): Promise<checkPointUsed> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            COUNT(1) AS count
                        FROM tkd_crm.db_point_movement a
                        WHERE a.fk_source = '${receipt}' `;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/checkPointUsed",
      resolve
    );
  });
}

type pointDetail = {
  store: number;
  point: number;
  phone: string;
};
export function pointDetail(
  { connection, res }: typeGlobal.functions,
  { brand, receipt }: { brand: string; receipt: string }
): Promise<pointDetail> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.fk_business AS store,
                            FLOOR(a.i_totalnet / 10000) AS point,
                            b.v_phone AS phone
                        FROM dvw_transaction.vw_transaction a
                        JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                        JOIN dvw_setting.vw_other c ON a.fk_business = c.fk_business AND c.fk_brand = '${brand}'
                        WHERE a.s_offlinecode = '${receipt}'
                            AND a.b_isvoid = 0 `;

    functionGlobal.querySingle(
      query,
      res,
      connection,
      "function/crm/pointDetail",
      resolve
    );
  });
}

export function redeemPoint(
  { connection, res }: typeGlobal.functions,
  {
    receipt,
    user,
    store,
    point,
  }: { receipt: string; user: number; store: number; point: number }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);

  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_point_movement SET
                            v_code = '${hash}', 
                            fk_source = '${receipt}', 
                            fk_user = '${user}', 
                            fk_store = ${store}, 
                            i_value = ${point}, 
                            i_value_left = ${point},
                            dt_expired = CONCAT(YEAR(NOW()) + 1, '-01-01 00:00:00'),
                            b_type = 1 `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/redeemPoint",
      resolve,
      { id: hash }
    );
  });
}

export function redeemPointPos(
  { connection, res }: typeGlobal.functions,
  { user, point, receipt }: { user: number; point: number; receipt: string }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);

  return new Promise(function (resolve, reject) {
    let query = `   INSERT INTO tkd_crm.db_point_movement SET
                            v_code = '${hash}', 
                            fk_source = '${receipt}', 
                            fk_user = '${user}', 
                            i_value = ${point}, 
                            i_value_left = ${point},
                            dt_expired = CONCAT(YEAR(NOW()) + 1, '-01-01 00:00:00'),
                            b_type = 1 `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/redeemPointPos",
      resolve,
      { id: hash }
    );
  });
}

export function removeQRCODE(
  { connection, res }: typeGlobal.functions,
  { code }: { code: string }
) {
  var hash = Date.now().toString(36) + Math.random().toString(36);

  return new Promise(function (resolve, reject) {
    let query = `   UPDATE tkd_crm.db_point_qr SET
                            b_status = 0
                            WHERE v_code = '${code}'`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/removeQRCODE",
      resolve,
      { id: hash }
    );
  });
}
//=====================================================================

//TRANSACTION=====================================================================
type getHistory = {
  receipt: string;
  date: string;
  store: number;
  void_status: number;
  subtotal: number;
  discount: number;
  total: number;
  order_type: number;
};
export function getHistory(
  { connection, res }: typeGlobal.functions,
  {
    brand,
    phone,
    start = 0,
    limit = 100,
  }: { brand: string; phone: string; start?: number; limit?: number }
): Promise<getHistory[]> {
  phone = phone.replace(" ", "");
  phone = phone.replace("-", "");

  var prefix = "0";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  prefix = "62";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  prefix = "+62";
  if (phone.substring(0, prefix.length) == prefix)
    phone = phone.substring(prefix.length);

  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                            a.s_offlinecode AS receipt,
                            a.dt_paid AS date,
                            c.v_name AS store,
                            a.b_isvoid AS void_status,
                            a.i_total AS subtotal,
                            IFNULL(a.i_totalpromotion,0) AS discount,
                            a.i_totalnet AS total,
                            CASE
                                WHEN IFNULL(b.fk_transaction, 0) = 0 THEN 'on-site'
                                ELSE 'online'
                            END AS order_type
                        FROM dvw_transaction.vw_transaction a
                        LEFT JOIN dvw_transaction.vw_transaction_online b ON a.i_code = b.fk_transaction
                        JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                        JOIN dvw_master.vw_customer d ON a.fk_customer = d.i_code
                        JOIN dvw_setting.vw_other e ON a.fk_business = e.fk_business
                        WHERE a.b_isactive = 1
                            AND (
                                d.v_phone = '0${phone}'
                                OR d.v_phone = '62${phone}'
                                OR d.v_phone = '+62${phone}'
                            )
                        ORDER BY a.dt_paid DESC
                        LIMIT ${start},${limit} `;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/crm/getHistory",
      resolve
    );
  });
}
//=====================================================================
