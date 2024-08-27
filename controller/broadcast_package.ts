import pool from "../config/connect"
import * as broadcastPackage from '../function/broadcast/broadcast_package'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as type from '../type/broadcast_package'

type getTransaction = {
    date_start: string,
    date_end: string,
}
export async function getTransaction({body: data}: {body: getTransaction}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast_package/getTransaction');
            } 
            else {
                var results = await broadcastPackage.getTransaction({
                    connection: connection,
                    res: res
                },{
                    date_start: data.date_start,
                    date_end: data.date_end
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast_package/getTransaction');
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

export async function get({}: any, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast_package/get');
            } 
            else {
                var results:type.broadcastPackage[] = await broadcastPackage.get({
                    connection: connection,
                    res: res
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast_package/get');
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


export async function insert({body: data}: {body: type.insert}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast_package/insert');
            } 
            else {
                var result:any = await broadcastPackage.insert({
                    connection: connection,
                    res: res,
                    data: data
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast_package/insert');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok",
                            data: result["insertId"]
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}


export async function update({body: data}: {body: type.update}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast_package/update');
            } 
            else {
                await broadcastPackage.update({
                    connection: connection,
                    res: res,
                    data: data
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast_package/update');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok"
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}


export async function del({body: data}: {body: type.del}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast_package/del');
            } 
            else {
                var result:any = await broadcastPackage.del({
                    connection: connection,
                    res: res,
                    data: data
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast_package/del');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "ok"
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}