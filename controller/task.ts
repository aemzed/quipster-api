import pool from "../config/connect"
import * as errors from "../function/global_function"
import * as task from '../function/operational/task'

export async function run({}: {}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/task/run');
            } 
            else {
                var results = await task.run({
                    connection: connection,
                    res: res
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/task/run');
                    } else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: results
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}