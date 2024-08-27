import pool from "../../config/connect";
import * as absenceType from "../../function/master/absence_type";
import * as errors from "../../function/global_function";
import * as functionGlobal from "../../function/global_function";
import * as type from "../../type/absence_type";
import { Request, Response } from "express";
import * as functionUser from "../../function/account/user";
import { ResultSetHeader } from "mysql2";
import { User } from "../../type/user";
import { globalHandler } from "../../function/global";
import { executeQuery, startTransaction } from "../../util/mysql";

export async function get(
  { body: { business } }: { body: type.get },
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/absence_type/get 1");
      } else {
        var results: type.absenceType[] = await absenceType.get({
          connection: connection,
          res: res,
          business: business,
        });

        connection.commit(function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/absence_type/get 2"
            );
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

export async function insert({ body: data }: { body: type.insert }, res: any) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/absence_type/insert 1"
        );
      } else {
        var result: any = await absenceType.get({
          connection: connection,
          res: res,
          business: data.business,
          name: data.name,
        });

        if (result)
          functionGlobal.error(
            connection,
            res,
            "Tipe Absen sudah ada sebelumnya"
          );
        else {
          result = await absenceType.insert({
            connection: connection,
            res: res,
            data: data,
          });

          connection.commit(function (err) {
            if (err) {
              errors.rollback(
                connection,
                res,
                err,
                "controller/absence_type/insert 2"
              );
            } else {
              res.status(200).json({
                code: 200,
                success: true,
                message: "ok",
                data: result["insertId"],
              });
              connection.release();
            }
          });
        }
      }
    });
  });
}

export async function update({ body: data }: { body: type.update }, res: any) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/absence_type/update 1"
        );
      } else {
        var result: any = await absenceType.get({
          connection: connection,
          res: res,
          business: data.business,
          name: data.name,
          code_exclude: data.code,
        });

        if (result)
          functionGlobal.error(
            connection,
            res,
            "Tipe Absen sudah ada sebelumnya"
          );
        else {
          await absenceType.update({
            connection: connection,
            res: res,
            data: data,
          });

          connection.commit(function (err) {
            if (err) {
              errors.rollback(
                connection,
                res,
                err,
                "controller/absence_type/update 2"
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
        }
      }
    });
  });
}

export async function del({ body: data }: { body: type.del }, res: any) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(connection, res, err, "controller/absence_type/del 1");
      } else {
        await absenceType.del({
          connection: connection,
          res: res,
          data: data,
        });

        connection.commit(function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/absence_type/del 2"
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
      }
    });
  });
}

type selectV3Request = Omit<Request, "body"> & {
  body: {
    user: User;
  };
};
export async function selectV3(req: selectV3Request, res: Response) {
  function convertBody() {
    let requestBody = {
      user: req.body.user,
    };
    return requestBody;
  }

  await globalHandler(
    "controller/master/absence_type/selectV3",
    req,
    res,
    async () => {
      let requestBody = convertBody();
      let resultGet = await executeQuery(`
            SELECT
                a.i_code AS code,
                a.v_name AS name,
                a.i_start_hour AS start_hour,
                a.i_start_minute AS start_minute,
                a.i_end_hour AS end_hour,
                a.i_end_minute AS end_minute,
                a.i_zone AS zone
            FROM dvw_master.vw_absence_type a
            WHERE a.b_isactive = 1
                AND a.fk_business = ${requestBody.user.business_code}
        `);
      return res
        .status(200)
        .json({
          success: true,
          message: `${resultGet.length} data/s found.`,
          data: resultGet,
        });
    }
  );
}

type insertV3Request = Omit<Request, "body"> & {
  body: {
    user: User;
    name: string;
    start_hour: string;
    start_minute: string;
    end_hour: string;
    end_minute: string;
    zone?: string;
  };
};
export async function insertV3(req: insertV3Request, res: Response) {
  function convertBody() {
    errors.newCheckField(req.body, [
      "name",
      "start_hour",
      "start_minute",
      "end_hour",
      "end_minute",
    ]);
    let requestBody = {
      user: req.body.user,
      name: req.body.name,
      start_hour: parseFloat(req.body.start_hour),
      start_minute: parseFloat(req.body.start_minute),
      end_hour: parseFloat(req.body.end_hour),
      end_minute: parseFloat(req.body.end_minute),
      zone: parseFloat(
        req.body.zone === "" || req.body.zone == undefined ? "1" : req.body.zone
      ),
    };
    errors.newCheckNaN({ ...requestBody });
    return requestBody;
  }

  await globalHandler(
    "controller/master/absence_type/insertV3",
    req,
    res,
    async () => {
      let requestBody = convertBody();
      let resultInsert = await startTransaction(async (executeQuery) => {
        let resultGetSimilarAbsenceTypeName = await executeQuery(`
                SELECT 
                    a.v_name AS name
                FROM dvw_master.vw_absence_type a
                WHERE a.b_isactive = 1
                    AND a.fk_business = ${requestBody.user.business_code}
                    AND a.v_name = '${requestBody.name}'
                    AND a.i_code <> 0
            `);
        if (resultGetSimilarAbsenceTypeName.length > 0)
          throw {
            httpResponse: {
              code: 400,
              success: false,
              message: "Nama tipe absensi telah digunakan.",
            },
          };
        let resultInsertAbsenceType = await executeQuery(`
                INSERT INTO 
                    dvw_master.vw_absence_type
                SET
                    fk_user_modify = ${requestBody.user.user_code},
                    fk_business = ${requestBody.user.business_code},
                    v_name = '${requestBody.name}',
                    i_start_hour = ${requestBody.start_hour},
                    i_start_minute = ${requestBody.start_minute},
                    i_end_hour = ${requestBody.end_hour},
                    i_end_minute = ${requestBody.end_minute},
                    i_zone = ${requestBody.zone}
            `);
        return resultInsertAbsenceType;
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Tipe absensi berhasil ditambahkan.",
          data: resultInsert.insertId,
          info: resultInsert,
        });
    }
  );
}

type updateV3Request = Omit<Request, "body"> & {
  body: {
    user: User;
    code: string;
    name: string;
    start_hour: string;
    start_minute: string;
    end_hour: string;
    end_minute: string;
    zone?: string;
  };
};
export async function updateV3(req: updateV3Request, res: Response) {
  function convertBody() {
    errors.newCheckField(req.body, [
      "code",
      "name",
      "start_hour",
      "start_minute",
      "end_hour",
      "end_minute",
    ]);
    let requestBody = {
      user: req.body.user,
      code: parseFloat(req.body.code),
      name: req.body.name,
      start_hour: parseFloat(req.body.start_hour),
      start_minute: parseFloat(req.body.start_minute),
      end_hour: parseFloat(req.body.end_hour),
      end_minute: parseFloat(req.body.end_minute),
      zone: parseFloat(
        req.body.zone === "" || req.body.zone == undefined ? "1" : req.body.zone
      ),
    };
    errors.newCheckNaN({ ...requestBody });
    return requestBody;
  }

  await globalHandler(
    "controller/master/absence_type/updateV3",
    req,
    res,
    async () => {
      let requestBody = convertBody();
      let resultUpdate = await startTransaction(async (executeQuery) => {
        let resultGetSimilarAbsenceTypeName = await executeQuery(`
                SELECT a.v_name AS name
                FROM dvw_master.vw_absence_type a
                WHERE 
                    a.b_isactive = 1
                    AND a.fk_business = ${requestBody.user.business_code}
                    AND a.v_name = '${requestBody.name}'
                    AND a.i_code <> ${requestBody.code}
            `);
        if (resultGetSimilarAbsenceTypeName.length > 0)
          throw {
            httpResponse: {
              code: 400,
              success: false,
              message: "Nama tipe absensi telah digunakan.",
            },
          };
        let resultUpdateAbsenceType = await executeQuery(`
                UPDATE dvw_master.vw_absence_type 
                SET
                    fk_user_modify = ${requestBody.user.user_code},
                    v_name = '${requestBody.user.user_name}',
                    i_start_hour = ${requestBody.start_hour},
                    i_start_minute = ${requestBody.start_minute},
                    i_end_hour = ${requestBody.end_hour},
                    i_end_minute = ${requestBody.end_minute},
                    i_zone = ${requestBody.zone}
                WHERE i_code = ${requestBody.code}
                AND fk_business = ${requestBody.user.business_code}
            `);
        return resultUpdateAbsenceType;
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Tipe absensi berhasil diperbarui.",
          data: requestBody.code,
          info: resultUpdate,
        });
    }
  );
}

type deleteV3Request = Omit<Request, "body"> & {
  body: {
    user: User;
    code: string;
  };
};
export async function deleteV3(req: deleteV3Request, res: Response) {
  function convertBody() {
    errors.newCheckField(req.body, ["code"]);
    let requestBody = {
      user: req.body.user,
      code: parseFloat(req.body.code),
    };
    errors.newCheckNaN({ ...requestBody });
    return requestBody;
  }

  await globalHandler(
    "controller/master/absence_type/deleteV3",
    req,
    res,
    async () => {
      let requestBody = convertBody();
      let resultDelete = await executeQuery(`
            UPDATE dvw_master.vw_absence_type 
            SET
                fk_user_modify = ${requestBody.user.user_code},
                b_isactive = 0
            WHERE i_code = ${requestBody.code}
                AND fk_business = ${requestBody.user.business_code}
        `);
      return res
        .status(200)
        .json({
          success: true,
          message: "Tipe absensi berhasil dihapus.",
          data: requestBody.code,
          info: resultDelete,
        });
    }
  );
}
