import * as errors from "../function/global_function";
import * as functionGlobal from "../function/global_function";
import util from "util";
import pool from "../config/connect";
import * as principle from "../function/principle";
import { count } from "console";

export async function loginPrinciple(
  { body: data }: { body: { email: string; password: string } },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var resCheckSupplier = await principle.getSupplierCode(
        {
          connection: connection,
          res: res,
        },
        {
          email: data.email,
          password: data.password,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (resCheckSupplier) {
        let getUser = await principle.getUserSupplier(
          {
            connection: connection,
            res: res,
          },
          {
            code: resCheckSupplier.code,
          }
        );

        if (getUser) {
          res.status(200).json({
            code: 200,
            success: true,
            message: "Found",
            data: getUser,
          });
        } else {
          res.status(400).json({
            code: 400,
            success: false,
            message: "Account not Found",
          });
        }
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "Account not Found",
        });
      }
    } catch (err) {
      errors.rollback(connection, res, err, "controller/crm/loginPrinciple");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getInventory(
  { body: data }: { body: { hash: string } },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var resGetInventory:any = await principle.getInventoryList(
        {
          connection: connection,
          res: res,
        },
        {
          hash: data.hash,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (resGetInventory.length > 0) {
        res.status(200).json({
          code: 200,
          success: true,
          message: "Found",
          data: resGetInventory,
        });
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "not Found",
        });
      }
    } catch (err) {
      errors.rollback(connection, res, err, "controller/crm/getInventory");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSKUInventoryForQuipster(
  { body: data }: { body: { id: number } },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var resGetInventory: any = await principle.getInventoryForSKUQuipster(
        {
          connection: connection,
          res: res,
        },
        {
          id: data.id,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (resGetInventory.length > 0) {
        res.status(200).json({
          code: 200,
          success: true,
          message: "Found",
          data: resGetInventory,
        });
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "not Found",
        });
      }
    } catch (err) {
      errors.rollback(
        connection,
        res,
        err,
        "controller/crm/getSKUInventoryForQuipster"
      );
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}
export async function getSKUPrincipal(
  { body: data }: { body: { business: number } },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var resGetSkuPrincipal = await principle.getSkuPrincipal(
        {
          connection: connection,
          res: res,
        },
        {
          business: data.business,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (resGetSkuPrincipal) {
        res.status(200).json({
          code: 200,
          success: true,
          message: "Found",
          data: resGetSkuPrincipal,
        });
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "not Found",
        });
      }
    } catch (err) {
      errors.rollback(connection, res, err, "controller/crm/getSKUPrincipal");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

export async function insertSKUPrincipal(
  { body: data }: { body: { code: number; principal: string } },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var insertToPrincipal: any = await principle.insertToPrincipal(
        {
          connection: connection,
          res: res,
        },
        {
          principal: data.principal,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (insertToPrincipal) {
        var updateToPrincipal = await principle.updateSKUtoItem(
          {
            connection: connection,
            res: res,
          },
          {
            id: insertToPrincipal["insertId"],
            code: data.code,
          }
        );

        if (updateToPrincipal) {
          res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
          });
        } else {
          res.status(400).json({
            code: 400,
            success: false,
            message: "Failed Insert",
          });
        }
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "Failed Insert",
        });
      }
    } catch (err) {
      errors.rollback(connection, res, err, "controller/crm/getSKUPrincipal");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

export async function insertMiniPO(
  { body: data }: { body: { item: string, business : number} },
  res: any
) {
  try {
    const timestamp = Date.now(); 
    const randomNumber = Math.floor(Math.random() * 10000); 
    const uniqueCode = `${timestamp}-${randomNumber}`;

    let countQty: any
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    let purchaseorders: any = await principle.insertMiniPO({
      connection: connection,
      res: res,
    },{
      code_po: uniqueCode
    })

    const jsonData = JSON.parse(data.item);
    for (const dataItem of jsonData.datas){
      const code = dataItem.code;
      const qty = dataItem.qty
      let result = await principle.getStockQuipster({
        connection: connection,
        res: res,
      }, {
        code: code,
        fk_business : data.business
      })
      
      for(let i = 0; i<result.length; i++){
        countQty = parseInt(result[i].qty) - qty

        if(countQty < 0){
          let insertDetailMiniPO = await principle.insertDetailMiniPO({
            connection: connection,
            res: res,
          },{
            unit: "PCS",
            qty: Math.abs(countQty),
            fk_item: code,
            purchaseorder: purchaseorders.insertId
          })

          await principle.updateStockQuipster({
            connection: connection,
            res: res,
          },{
            qty: 0,
            code: code
          })
        } else {
          await principle.updateStockQuipster({
            connection: connection,
            res: res,
          },{
            qty: countQty,
            code: code
          })
        }
      }
    }
    
    try {
      await util.promisify(connection.beginTransaction).bind(connection)();


      await util.promisify(connection.commit).bind(connection)();
      res.status(200).json({
        code: 200,
        success: true,
        message: "ok"
      })
      
    } catch (err) {
      errors.rollback(connection, res, err, "controller/principal/insertMiniPO");
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

export async function insertInventoryPrincipal(
  {
    body: data,
  }: {
    body: {
      sku: string;
      name: string;
      unit: string;
      qty: number;
      id: number;
    };
  },
  res: any
) {
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var results: any = await principle.getSKUForInsertPrincipal(
        {
          connection: connection,
          res: res,
        },
        {
          code: data.sku,
        }
      );
      if (results.length > 0) {
        res.status(400).json({
          code: 400,
          status: false,
          message: "SKU sudah terdaftar",
        });
      } else {
        var insertToPrincipal = await principle.insertIntoPrincipalWeb(
          {
            connection: connection,
            res: res,
          },
          {
            principal: data.sku,
            name: data.name,
            unit: data.unit,
            qty: data.qty,
            id: data.id,
          }
        );
        await util.promisify(connection.commit).bind(connection)();

        if (insertToPrincipal) {
          res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
          });
        } else {
          res.status(400).json({
            code: 400,
            success: false,
            message: "Failed Insert",
          });
        }
      }
    } catch (err) {
      errors.rollback(
        connection,
        res,
        err,
        "controller/crm/insertInventoryPrincipal"
      );
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Failed to establish a database connection:", err);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
    });
  }
}
