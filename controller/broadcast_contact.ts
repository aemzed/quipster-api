import pool from "../config/connect"
import * as broadcastContact from '../function/broadcast/broadcast_contact'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as type from '../type/broadcast_contact'


export async function get({body:data}: {body: type.get}, res: any) {
    
    pool.getConnection(async function(err, connection) {
        var results: type.broadcastContact[] = await broadcastContact.get({
            connection: connection,
            res: res,
            data: data
        })

        res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
            data: results
        })
        connection.release();
    })
}


export async function insert({body: data}: {body: type.insert}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/insertContact');
            } 
            else {
                var status = await new Promise(async function(resolve, reject) {
                    await functionGlobal.checkWA(data.phone, function(response:any){
                        resolve(response);
                    });
                })
            
                if(status==200){
                    var result:any = await broadcastContact.insert({
                        connection: connection,
                        res: res,
                        phone: data.phone,
                        data: data
                    });
    
                    var code = result["insertId"];
    
                    for(var i=0; i<data.param!.length; i++){
                        await broadcastContact.updateParam({
                            connection: connection,
                            res: res,
                            code: code,
                            index: i+1,
                            name: data.param![i]
                        }); 
                    }
    
                    connection.commit(function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/broadcast/insertContact');
                        } 
                        else {
                            res.status(200).json({
                                code: 200,
                                success: true,
                                message: "ok",
                                data: code
                            })
                            connection.release();
                        };
                    })
                }
                else{
                    res.status(400).json({
                        code: 400,
                        success: false,
                        message: "nomor "+ data.phone +" tidak valid"
                    })
                    connection.release();
                }
            }
        })
    })
}


export async function update({body: data}: {body: type.update}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/update');
            } 
            else {
                var result:any = await broadcastContact.update({
                    connection: connection,
                    res: res,
                    data: data
                });

                for(var i=0; i<data.param!.length; i++){
                    await broadcastContact.updateParam({
                        connection: connection,
                        res: res,
                        code: data.code,
                        index: i+1,
                        name: data.param![i]
                    }); 
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/update');
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


export async function updateParam({body: {code, param=[]}}: {body: type.updateParam}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/updateContactParam');
            } 
            else {
                for(var i=0; i<param.length; i++){
                    await broadcastContact.updateParam({
                        connection: connection,
                        res: res,
                        code: code,
                        index: i+1,
                        name: param[i]
                    }); 
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/updateContactParam');
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
                errors.rollback(connection, res, err, 'controller/broadcast/del');
            } 
            else {
                var result:any = await broadcastContact.del({
                    connection: connection,
                    res: res,
                    data: data
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/del');
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