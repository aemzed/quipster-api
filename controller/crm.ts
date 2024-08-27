import pool from "../config/connect";
import * as crm from "../function/crm";
import * as transactionDetail from "../function/transaction/transactiondetail";
import * as transactionAdditional from "../function/transaction/transactionadditional";
import * as transactionPromotionDetail from "../function/transaction/transactionpromotiondetail";
import * as transactionpayment from "../function/transaction/transactionpayment";
import * as transactionpromotion from "../function/transaction/transactionpromotion";
import * as errors from "../function/global_function";
import * as functionGlobal from "../function/global_function";
import { v4 as uuidv4 } from "uuid";
import util from "util";

export async function getVariable(
  { body: data }: { body: { brand: string } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/getVariable");
      } else {
        var results = await crm.getVariable(
          {
            connection: connection,
            res: res,
          },
          {
            brand: data.brand,
          }
        );

        connection.commit(function (err) {
          if (err) {
            errors.rollback(connection, res, err, "controller/crm/getVariable");
          } else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
              data: results,
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function generateOtp(
  { body: data }: { body: { phone: string } },
  res: any
) {
  let otp: string = Math.floor(1000 + Math.random() * 9000) + "";

  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/generateOtp");
      } else {
        var results = await crm.getUser(
          {
            connection: connection,
            res: res,
          },
          {
            phone: data.phone,
          }
        );

        if (!results) {
          var result: any = await crm.insertNewUser(
            {
              connection: connection,
              res: res,
            },
            {
              phone: data.phone,
              otp: otp,
            }
          );
          var user = result["insertId"];
        } else
          await crm.updateUserOtp(
            {
              connection: connection,
              res: res,
            },
            {
              phone: data.phone,
              otp: otp,
            }
          );

        await functionGlobal.sendNewWA(
          data.phone,
          "[OTP] Kode Verifikasi Anda " + otp,
          "62811961006"
        );

        connection.commit(function (err) {
          if (err) {
            errors.rollback(connection, res, err, "controller/crm/generateOtp");
          } else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function login(
  { body: data }: { body: { phone: string; otp: string } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/login");
      } else {
        var result = await crm.getUser(
          {
            connection: connection,
            res: res,
          },
          {
            phone: data.phone,
          }
        );

        if (result) {
          if (result.otp == data.otp) {
            connection.commit(async function (err) {
              if (err) {
                errors.rollback(connection, res, err, "controller/crm/login");
              } else {
                var results = await crm.getCustomerByPhone(
                  {
                    connection: connection,
                    res: res,
                  },
                  {
                    phone: data.phone,
                  }
                );

                if (results) {
                  let updateProfile = await crm.updateProfile(
                    {
                      connection: connection,
                      res: res,
                    },
                    {
                      id: result.id,
                      name: results.name,
                      email: results.email,
                      address: results.address,
                      date_birth: results.birthdate,
                      gender: results.gender,
                      business: results.business_code,
                    }
                  );

                  if (updateProfile) {
                    var resultss = await crm.getUser(
                      {
                        connection: connection,
                        res: res,
                      },
                      {
                        phone: data.phone,
                      }
                    );
                    res.status(200).json({
                      code: 200,
                      success: true,
                      message: "ok",
                      data: resultss,
                    });
                    connection.release();
                  } else {
                    res.status(200).json({
                      code: 200,
                      success: true,
                      message: "ok",
                      data: result,
                    });
                    connection.release();
                  }
                } else {
                  res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                    data: result,
                  });
                  connection.release();
                }
              }
            });
          } else {
            res.status(200).json({
              code: 400,
              success: false,
              message: "OTP tidak sesuai",
            });
            connection.release();
          }
        } else {
          res.status(200).json({
            code: 400,
            success: false,
            message: "User tidak ditemukan",
          });
          connection.release();
        }
      }
    });
  });
}

export async function generateBarcode(
  { body: data }: { body: { id: number; nominal: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/profile");
      } else {
        const uuid: string = uuidv4();
        var result = await crm.insertQrCode(
          {
            connection: connection,
            res: res,
          },
          {
            uuid: uuid,
            id: data.id,
            nominal: data.nominal,
          }
        );
        connection.commit(async function (err) {
          if (err) {
            errors.rollback(connection, res, err, "controller/crm/login");
          } else {
            if (result) {
              await crm.insertPointPending(
                {
                  connection: connection,
                  res: res,
                },
                {
                  code: uuid,
                  nominal: data.nominal,
                  user: data.id,
                }
              );

              var points = await crm.getPointsActive(
                {
                  connection: connection,
                  res: res,
                },
                {
                  id_user: data.id,
                }
              );

              var resupdatePoint: any;
              var pointsToReduce = data.nominal;

              for (let point of points) {
                console.log(point.value_left, pointsToReduce);
                if (point.value_left <= pointsToReduce) {
                  pointsToReduce -= point.value_left;
                  point.value_left = 0;
                } else {
                  point.value_left -= pointsToReduce;
                  pointsToReduce = 0;
                }

                resupdatePoint = await crm.updatePointLoyaltyQuipster(
                  {
                    connection: connection,
                    res: res,
                  },
                  {
                    user: data.id,
                    value_left: point.value_left,
                    code: point.code,
                  }
                );
              }

              if (resupdatePoint.affectedRows > 0) {
                await crm.insertHistoryPoint(
                  {
                    connection: connection,
                    res: res,
                  },
                  {
                    id: data.id,
                    nominal: data.nominal,
                    type: 4,
                    receipt: "CRMQRCODE",
                  }
                );

                var resultPointActive = await crm.getPointsActive(
                  {
                    connection: connection,
                    res: res,
                  },
                  {
                    id_user: data.id,
                  }
                );

                var total = 0;
                for (let point of resultPointActive) {
                  total += point.value_left;
                }

                var results: { total: number; uuid: string }[] = [];
                results.push({ total: total, uuid: uuid });

                res.status(200).json({
                  code: 200,
                  success: true,
                  message: "ok",
                  data: results,
                });
                connection.release();
              } else {
                res.status(400).json({
                  code: 400,
                  success: false,
                  message: "Gagal Generate QRCODE",
                });
                connection.release();
              }
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Gagal Generate QRCODE",
              });
              connection.release();
            }
          }
        });
      }
    });
  });
}

export async function getHistoryQrCode(
  { body: data }: { body: { id: number; nominal: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/getHistoryQrCode"
        );
      } else {
        var result = await crm.getPointAfterGenerateCode(
          {
            connection: connection,
            res: res,
          },
          {
            id: data.id,
          }
        );
        connection.commit(async function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getHistoryQrCode"
            );
          } else {
            if (result) {
              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result,
              });
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Data tidak ada",
              });
            }
          }
        });
      }
    });
  });
}

export async function getPointPending(
  { body: data }: { body: { id: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/getPointPending");
      } else {
        var result = await crm.getPointPending(
          {
            connection: connection,
            res: res,
          },
          {
            user: data.id,
          }
        );
        connection.commit(async function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getPointPending"
            );
          } else {
            if (result) {
              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result,
              });
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Data tidak ada",
              });
            }
          }
        });
      }
    });
  });
}

export async function updateStatusPointPending(
  { body: data }: { body: { receipt: string } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/updateStatusPointPending"
        );
      } else {
        var result = await crm.updateStatusPointPending(
          {
            connection: connection,
            res: res,
          },
          {
            receipt: data.receipt,
          }
        );
        connection.commit(async function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/updateStatusPointPending"
            );
          } else {
            if (result.affectedRows > 0) {
              await crm.updateStatusTransactionPending(
                {
                  connection: connection,
                  res: res,
                },
                {
                  receipt: data.receipt,
                }
              );

              res.status(200).json({
                code: 200,
                success: true,
                message: "Update Berhasil",
              });
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Data tidak ada",
              });
            }
          }
        });
      }
    });
  });
}

export async function updateQRAfterPaid(
  {
    body: data,
  }: {
    body: { code: string; nominal: number; id_user: number; receipt: string };
  },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/updateQRAfterPaid"
        );
      } else {
        var result = await crm.updateQRPaid(
          {
            connection: connection,
            res: res,
          },
          {
            code: data.code,
          }
        );
        connection.commit(async function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/updateQRAfterPaid"
            );
          } else {
            if (result.affectedRows > 0) {
              await crm.insertHistoryPoint(
                {
                  connection: connection,
                  res: res,
                },
                {
                  id: data.id_user,
                  nominal: data.nominal,
                  type: 1,
                  receipt: data.receipt,
                }
              );

              await crm.updateReceiptCode(
                {
                  connection: connection,
                  res: res,
                },
                {
                  code: data.code,
                  receipt: data.receipt,
                }
              );

              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
              });
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Data tidak ada",
              });
            }
          }
        });
      }
    });
  });
}

export async function profile(
  { body: data }: { body: { brand: string; id: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/profile");
      } else {
        var result = await crm.getUserById(
          {
            connection: connection,
            res: res,
          },
          {
            id: data.id,
          }
        );

        if (result) {
          var resultTransaction = await crm.getTransactionYearly(
            {
              connection: connection,
              res: res,
            },
            {
              brand: data.brand,
              phone: result.phone,
            }
          );
          result.transaction_count = resultTransaction.transaction_count;
          result.transaction_nominal = resultTransaction.transaction_nominal;

          connection.commit(function (err) {
            if (err) {
              errors.rollback(connection, res, err, "controller/crm/profile");
            } else {
              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result,
              });
              connection.release();
            }
          });
        } else {
          res.status(400).json({
            code: 400,
            success: false,
            message: "User tidak ditemukan",
          });
          connection.release();
        }
      }
    });
  });
}

export async function updateProfile(
  {
    body: data,
  }: {
    body: {
      id: number;
      name: string;
      email: string;
      address: string;
      date_birth: string;
      gender: number;
    };
  },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/profile");
      } else {
        await crm.updateProfile(
          {
            connection: connection,
            res: res,
          },
          {
            id: data.id,
            name: data.name,
            email: data.email,
            address: data.address,
            date_birth: data.date_birth,
            gender: data.gender,
            business: 9,
          },
        );

        connection.commit(async function (err) {
          if (err) {
            errors.rollback(connection, res, err, "controller/crm/profile");
          } else {
            connection.release();
            var result = await crm.getUserById(
              {
                connection: connection,
                res: res,
              },
              {
                id: data.id,
              }
            );

            if (result) {
              res.status(200).json({
                code: 200,
                success: true,
                message: "success Update",
                data: result,
              });
            }
          }
        });
      }
    });
  });
}

export async function getPoints(
  { body: data }: { body: { id_user: number; order: string } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/getPoints");
      } else {
        var resultPointActive = await crm.getPointsActive(
          {
            connection: connection,
            res: res,
          },
          {
            id_user: data.id_user,
            order: data.order,
          }
        );

        var total = 0;
        for (let point of resultPointActive) {
          total += point.value_left;
        }

        var result = {
          total: total,
          point_active: resultPointActive,
        };

        connection.commit(function (err) {
          if (err)
            errors.rollback(connection, res, err, "controller/crm/getPoints");
          else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
              data: result,
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function insertPointFromCRM(
  {
    body: data,
  }: {
    body: { id: number; nominal: number; code_qr: string };
  },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/insertPointFromCRM"
        );
      } else {
        var insertPoint:any = await crm.redeemPointPos(
          {
            connection: connection,
            res: res,
          },
          {
            user: data.id,
            point: data.nominal,
            receipt: "CRMQRCODE",
          }
        );

        if (insertPoint.affectedRows > 0) {
          await crm.removeQRCODE(
            {
              connection: connection,
              res: res,
            },
            {
              code: data.code_qr,
            }
          );

          await crm.insertHistoryPoint(
            {
              connection: connection,
              res: res,
            },
            {
              id: data.id,
              nominal: data.nominal,
              type: 3,
              receipt: "CRMQRCODE",
            }
          );
        }

        await crm.updatePointPendingQR(
          {
            connection: connection,
            res: res,
          },
          {
            code: data.code_qr,
          }
        );

        connection.commit(function (err) {
          if (err)
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/insertPointFromCRM"
            );
          else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function insertPointFromApps(
  {
    body: data,
  }: {
    body: { item: string; phone: string; receipt: string;  };
  },
  res: any
) {
  interface DataItem {
    code: string;
  }
  let result: any;
  const getConnection = util.promisify(pool.getConnection).bind(pool);
  let totalPoints: number = 0;

  try {
    const connection = await getConnection();
    await util.promisify(connection.beginTransaction).bind(connection)();

    const jsonData = JSON.parse(data.item);
    for (const dataItem of jsonData.datas) {
      const code = dataItem.code;
      const sellingprice = dataItem.sellingprice;
      const qty = dataItem.qty;
      result = await crm.getDiscountPointItem(
        {
          connection: connection,
          res: res,
        },
        {
          code: dataItem.code,
        }
      );

      var point =
        (dataItem.sellingprice * result[0]["point_discount"] * dataItem.qty) /
        100;
      totalPoints += point;
    }

    var rescustomerPhone = await crm.getUser(
      {
        connection: connection,
        res: res,
      },
      {
        phone: data.phone,
      }
    );

    if (rescustomerPhone) {
      await crm.insertHistoryPoint(
        {
          connection: connection,
          res: res,
        },
        {
          id: rescustomerPhone.id,
          nominal: totalPoints,
          type: 2,
          receipt: data.receipt,
        }
      );

      await crm.redeemPointPos(
        {
          connection: connection,
          res: res,
        },
        {
          user: rescustomerPhone.id,
          point: totalPoints,
          receipt: data.receipt,
        }
      );
    }

    await crm.updateStatusTransactionPending(
      {
        connection: connection,
        res: res,
      },
      {
        receipt: data.receipt,
      }
    );

    await util.promisify(connection.commit).bind(connection)();
    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
    });
    connection.release();
  } catch (err) {
    errors.rollback(getConnection, res, err, "controller/crm/insertPointFromApps");
  }
}

export async function deletePointPendingAfterScanDiscountApps(
  {
    body: data,
  }: {
    body: { code: string };
  },
  res: any
) {
  interface DataItem {
    code: string;
  }
  let result: any;
  const getConnection = util.promisify(pool.getConnection).bind(pool);
  let totalPoints: number = 0;
  
  try {
    const connection = await getConnection();
    await util.promisify(connection.beginTransaction).bind(connection)();
    var deletePointPending = await crm.updatePointPendingQR({
      connection: connection,
      res: res,
    },{
      code: data.code
    })
    await util.promisify(connection.commit).bind(connection)();
    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
    });
    connection.release();
  } catch (err) {
    errors.rollback(getConnection, res, err, "controller/crm/deletePointPendingAfterScanDiscountApps");
  }
}

export async function updatePointAfterScanCode(
  { body: data }: { body: { id: number; value_left: number; receipt: string } },
  res: any
) {
  const { value_left } = data;
  try {
    const connection = await util.promisify(pool.getConnection).bind(pool)();

    try {
      await util.promisify(connection.beginTransaction).bind(connection)();

      var points = await crm.getPointsActive(
        {
          connection: connection,
          res: res,
        },
        {
          id_user: data.id,
        }
      );

      var resupdatePoint: any;
      var pointsToReduce = data.value_left;

      for (let point of points) {
        console.log(point.value_left, pointsToReduce);
        if (point.value_left <= pointsToReduce) {
          pointsToReduce -= point.value_left;
          point.value_left = 0;
        } else {
          point.value_left -= pointsToReduce;
          pointsToReduce = 0;
        }

        resupdatePoint = await crm.updatePointLoyaltyQuipster(
          {
            connection: connection,
            res: res,
          },
          {
            user: data.id,
            value_left: point.value_left,
            code: point.code,
          }
        );
      }

      await crm.insertHistoryPoint(
        {
          connection: connection,
          res: res,
        },
        {
          id: data.id,
          nominal: data.value_left,
          type: 1,
          receipt: data.receipt,
        }
      );

      await util.promisify(connection.commit).bind(connection)();

      if (resupdatePoint) {
        res.status(200).json({
          code: 200,
          success: true,
          message: "ok",
        });
      } else {
        res.status(400).json({
          code: 400,
          success: false,
          message: "failed",
        });
      }
    } catch (err) {
      errors.rollback(
        connection,
        res,
        err,
        "controller/crm/updatePointAfterScanCode"
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

export async function getUserVoucher(
  { body: data }: { body: { id_user: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/getUserVoucher");
      } else {
        var result = await crm.getUserVoucher(
          {
            connection: connection,
            res: res,
          },
          {
            id_user: data.id_user,
          }
        );

        connection.commit(function (err) {
          if (err)
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getUserVoucher"
            );
          else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
              data: result,
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function getHistoryPoint(
  { body: data }: { body: { id: number } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/getHistoryPoint");
      } else {
        var result = await crm.getHistoryPoint(
          {
            connection: connection,
            res: res,
          },
          {
            id: data.id,
          }
        );

        connection.commit(function (err) {
          if (err)
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getHistoryPoint"
            );
          else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
              data: result,
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function getDiscountAfterScan(
  { body: data }: { body: { code: string } },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/getDiscountAfterScan"
        );
      } else {
        var result = await crm.getDiscountAfterScan(
          {
            connection: connection,
            res: res,
          },
          {
            discount_code: data.code,
          }
        );

        connection.commit(async function (err) {
          if (err)
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getDiscountAfterScan"
            );
          else {
            if (result.canScan == 1) {
              await crm.updateQRScan(
                {
                  connection: connection,
                  res: res,
                },
                {
                  code: data.code,
                }
              );
              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result,
              });
              connection.release();
            } else {
              res.status(400).json({
                code: 400,
                success: true,
                message: "QR Code sudah pernah di Scan",
              });
              connection.release();
            }
          }
        });
      }
    });
  });
}
export async function getNotification(
  { body: data }: { body: { brand: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getNotification(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

export async function getBanner(
  { body: data }: { body: { brand: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getBanner(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
  });
}

export async function getStore(
  { body: data }: { body: { brand: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getStore(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

export async function getProduct(
  { body: data }: { body: { brand: string; store: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getProduct(
      {
        connection: connection,
        res: res,
      },
      {
        store: data.store,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

export async function getProductByKeyword(
  { body: data }: { body: { brand: string; keyword: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getProductByKeyword(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
        keyword: data.keyword,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

export async function getVoucher(
  { body: data }: { body: { brand: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getVoucher(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

export async function buyVoucher(
  {
    body: data,
  }: { body: { brand: string; phone: string; voucher_id: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/buyVoucher");
      } else {
        var voucher: crm.getVoucher = await crm.getVoucher(
          {
            connection: connection,
            res: res,
          },
          {
            brand: data.brand,
            code: data.voucher_id,
          }
        );

        if (voucher) {
          var user = await crm.getUser(
            {
              connection: connection,
              res: res,
            },
            {
              phone: data.phone,
            }
          );

          var points = await crm.getPointsActive(
            {
              connection: connection,
              res: res,
            },
            {
              id_user: user.id,
              order: "ASC",
            }
          );

          if (points.length > 0) {
            var balance = points.reduce(
              (acc, data) => acc + data.value_left,
              0
            );

            let voucherPrice = voucher.price;
            if (
              functionGlobal.isBetweenDate({
                date_start: voucher.date_start_sale,
                date_end: voucher.date_end_sale,
              })
            )
              voucherPrice = voucher.price_sale;

            if (balance >= voucherPrice) {
              var userVoucher: any = await crm.buyVoucher(
                {
                  connection: connection,
                  res: res,
                },
                {
                  user: user,
                  voucher: voucher,
                }
              );

              if (userVoucher) {
                for (const point of points) {
                  if (voucherPrice > 0) {
                    var value = -(voucherPrice > point.value_left
                      ? point.value_left
                      : voucherPrice);
                    await crm.minusPoint(
                      {
                        connection: connection,
                        res: res,
                      },
                      {
                        user: user,
                        value: value,
                        source: userVoucher["insertId"],
                        type: 2,
                        source_point: point.code,
                      }
                    );

                    await crm.updatePoint(
                      {
                        connection: connection,
                        res: res,
                      },
                      {
                        user: user,
                        value_left: point.value_left + value,
                        source_point: point.code,
                      }
                    );

                    voucherPrice += value;
                  }
                }

                res.status(200).json({
                  code: 200,
                  success: true,
                  message: "ok",
                  data: userVoucher["insertId"],
                });
              }
            } else {
              res.status(400).json({
                code: 404,
                success: true,
                message: "Point tidak mencukupi!",
              });
            }
          } else {
            res.status(400).json({
              code: 404,
              success: true,
              message: "Point tidak mencukupi!",
            });
          }
        } else {
          res.status(400).json({
            code: 404,
            success: true,
            message: "voucher not found!",
          });
        }

        connection.release();
      }
    });
  });
}

type redeemPoint = { brand: string; phone: string; receipt: string };
export async function redeemPoint(
  { body: data }: { body: redeemPoint },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/crm/redeemPoint 1");
      } else {
        var resultUser = await crm.getUser(
          {
            connection: connection,
            res: res,
          },
          {
            phone: data.phone,
          }
        );

        var resultCheckPointUsed = await crm.checkPointUsed(
          {
            connection: connection,
            res: res,
          },
          {
            receipt: data.receipt,
          }
        );

        if (resultCheckPointUsed.count == 0) {
          var resultPointDetail = await crm.pointDetail(
            {
              connection: connection,
              res: res,
            },
            {
              brand: data.brand,
              receipt: data.receipt,
            }
          );

          if (resultPointDetail) {
            if (resultPointDetail.phone == data.phone) {
              await crm.redeemPoint(
                {
                  connection: connection,
                  res: res,
                },
                {
                  user: resultUser.id,
                  store: resultPointDetail.store,
                  point: resultPointDetail.point,
                  receipt: data.receipt,
                }
              );

              connection.commit(function (err) {
                if (err) {
                  errors.rollback(
                    connection,
                    res,
                    err,
                    "controller/crm/redeemPoint 2"
                  );
                } else {
                  res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                  });
                  connection.release();
                }
              });
            } else {
              res.status(400).json({
                code: 400,
                success: false,
                message: "Point milik pelanggan lain",
              });
              connection.release();
            }
          } else {
            res.status(400).json({
              code: 400,
              success: false,
              message: "Nota tidak valid",
            });
            connection.release();
          }
        } else {
          res.status(400).json({
            code: 400,
            success: false,
            message: "Point sudah di redeem sebelumnya",
          });
          connection.release();
        }
      }
    });
  });
}

type getHistory = {
  brand: string;
  phone: string;
};
export async function getHistory(
  { body: data }: { body: getHistory },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var results = await crm.getHistory(
      {
        connection: connection,
        res: res,
      },
      {
        brand: data.brand,
        phone: data.phone,
      }
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "ok",
      data: results,
    });
    connection.release();
  });
}

type getHistoryDetail = {
  receipt: string;
};
export async function getHistoryDetail(
  { body: data }: { body: getHistoryDetail },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    var resultsDetail = await transactionDetail.get(
      {
        connection: connection,
        res: res,
      },
      {
        receipt: data.receipt,
      }
    );

    for (var i = 0; i < resultsDetail.length; i++) {
      var resultsDetailAdditional = await transactionAdditional.get(
        {
          connection: connection,
          res: res,
        },
        {
          detail_code: resultsDetail[i].code,
        }
      );

      var resultsDetailPromotion = await transactionPromotionDetail.get(
        {
          connection: connection,
          res: res,
        },
        {
          detail_code: resultsDetail[i].code,
        }
      );

      resultsDetail[i]["additional"] = resultsDetailAdditional;
      resultsDetail[i]["promotion"] = resultsDetailPromotion;
    }

    var resultsPromotion = await transactionpromotion.get(
      {
        connection: connection,
        res: res,
      },
      {
        receipt: data.receipt,
      }
    );

    var resultsPayment = await transactionpayment.get(
      {
        connection: connection,
        res: res,
      },
      {
        receipt: data.receipt,
      }
    );

    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/crm/getHistoryDetail 1"
        );
      } else {
        var resultsDetail = await transactionDetail.get(
          {
            connection: connection,
            res: res,
          },
          {
            receipt: data.receipt,
          }
        );

        for (var i = 0; i < resultsDetail.length; i++) {
          var resultsDetailAdditional = await transactionAdditional.get(
            {
              connection: connection,
              res: res,
            },
            {
              detail_code: resultsDetail[i].code,
            }
          );

          var resultsDetailPromotion = await transactionPromotionDetail.get(
            {
              connection: connection,
              res: res,
            },
            {
              detail_code: resultsDetail[i].code,
            }
          );

          resultsDetail[i]["additional"] = resultsDetailAdditional;
          resultsDetail[i]["promotion"] = resultsDetailPromotion;
        }

        var resultsPromotion = await transactionpromotion.get(
          {
            connection: connection,
            res: res,
          },
          {
            receipt: data.receipt,
          }
        );

        var resultsPayment = await transactionpayment.get(
          {
            connection: connection,
            res: res,
          },
          {
            receipt: data.receipt,
          }
        );

        connection.commit(function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/crm/getHistoryDetail 2"
            );
          } else {
            var results: any = {
              detail: resultsDetail,
              promotion: resultsPromotion,
              payment: resultsPayment,
            };

            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
              data: results,
            });
            connection.release();
          }
        });
      }
    });
  });
}
