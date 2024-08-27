import * as functionGlobal from "./global_function";
import * as typeGlobal from "../type/global";

type getDueDay = {
  forEach(arg0: (data: any) => Promise<void>): unknown;
  length: number;
  receipt_code: string;
  dueday: string;
  customer_name: string;
  customer_phone: number;
}
export function getDueDay(
  { connection, res }: typeGlobal.functions,
  { business }: { business: number }
): Promise<getDueDay> {
  return new Promise(function (resolve, reject) {
    let query = `   SELECT
                        a.s_offlinecode AS receipt_code,
                        a.dt_due AS dueday,
                        DATEDIFF(a.dt_due, CURRENT_DATE) AS amount_day,
                        (
                            SELECT a.i_setting_due 
                            FROM dvw_account.vw_business a 
                            WHERE a.i_code = ${business}
                        ) AS dueday,
                        b.v_name AS customer_name,
                        b.v_phone AS customer_phone
                    FROM
                        dvw_transaction.vw_transaction a
                    JOIN dvw_master.vw_customer b ON a.fk_customer = b.i_code
                    JOIN dvw_account.vw_business c ON a.fk_business = c.i_code
                    WHERE
                        a.fk_business = ${business}
                    AND a.dt_due > CURRENT_DATE
                    AND DATEDIFF(a.dt_due, CURRENT_DATE) = (
                        SELECT a.i_setting_due 
                        FROM dvw_account.vw_business a 
                        WHERE a.i_code = ${business}
                    )
                    AND c.b_setting_due_before_today = 1`;

    functionGlobal.query(
      query,
      res,
      connection,
      "function/principle/getDueDay",
      resolve
    );
  });
}
