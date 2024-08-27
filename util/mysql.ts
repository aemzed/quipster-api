import pool from "../config/connect";

export async function executeQuery(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
        pool.query(query, (error, data) => {
            if (error) {
                reject({code: 500, message: 'API query error.', error: error})
            }
            resolve(data)
        })
    }).catch(err => {
        throw(err)
    })
}

export async function startTransaction(
  transaction: (
    executeQuery: (query: string) => Promise<any>,
    reject: () => any
  ) => any
): Promise<any> {
  return new Promise((resolve, reject) => {
    pool.getConnection(async function (error, connection) {
      async function executeQuery(query: string): Promise<any> {
        return new Promise((resolve, reject) => {
          connection.query(query, (error, result) => {
            if (error)
              return reject({
                ...error,
                httpResponse: {
                  code: 500,
                  success: false,
                  message: "API Query Error",
                },
              });
            return resolve(result);
          });
        }).catch((error) => {
          throw error;
        });
      }

      if (!connection) {
        reject({
          message: "Database connection failed / not found",
          httpResponse: {
            code: 500,
            success: false,
            message: "Internal server error",
          },
        });
      }
      if (error) {
        await new Promise((reject) => {
          connection.rollback(function (error) {
            connection.release();
            return reject({
              ...error,
              httpResponse: {
                code: 500,
                success: false,
                message: "Internal Server Error",
                error: error,
              },
            });
          });
        }).catch((error) => reject(error));
        return;
      }
      connection.beginTransaction(async function (error) {
        if (error)
          throw {
            ...error,
            httpResponse: {
              code: 500,
              success: false,
              message: "API transaction error",
            },
          };
        try {
          let result = await transaction(executeQuery, reject);
          await new Promise((resolve, reject) => {
            connection.commit(function (error) {
              if (error)
                return reject({
                  ...error,
                  httpResponse: {
                    code: 500,
                    success: false,
                    message: "API commit error",
                  },
                });
              resolve(null);
            });
          });
          return resolve(result);
        } catch (error: any) {
          connection.rollback(function () {
            connection.release();
            return reject(error);
          });
        }
      });
    });
  });
}
