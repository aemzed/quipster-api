import pool from "../config/connect"
import * as task from '../function/operational/task'
import * as broadcast from '../function/broadcast/broadcast'
import * as broadcastContact from '../function/broadcast/broadcast_contact'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as typeBroadcast from '../type/broadcast'
import * as typeBroadcastUser from '../type/broadcast_user'
import * as typeBroadcastList from '../type/broadcast_list'
import * as typeBroadcastContact from '../type/broadcast_contact'
import { timeStamp } from "console"
import { getPhone } from "../function/account/business_whatsapp"


export async function get({body:{phone, code="%"}}:{body:{phone:string, code?:string}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/get');
            } 
            else {
                var results:any = await broadcast.get({
                    connection: connection,
                    res: res
                },{
                    phone: phone,
                    code: code
                });

                const getDetail = async (code:string) => {
                    var resultDetail = await broadcast.getDetailByBroadcast({
                        connection: connection,
                        res: res
                    },{
                        broadcast_code: code
                    });
                    return resultDetail
                }

                if(code=="%"){
                    for(var i=0; i<results.length; i++){
                        var resultDetail = await getDetail(results[i].code)
                        results[i].message_detail = resultDetail;
                    }
                }
                else{
                    var resultDetail = await getDetail(results.code)
                    results.message_detail = resultDetail;
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/get');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "OK",
                            data: results
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}

type sendMessage = {
    user_number:string, 
    phone:string, 
    message:string
}
export async function sendMessage({body:data}: {body: sendMessage} , res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/sendMessage');
            } 
            else {
                var results = await broadcast.checkCreditMessage({
                    connection: connection,
                    res: res
                },{
                    user_number: data.user_number
                });

                if(results){
                    await broadcast.sendMessage({
                        connection: connection,
                        res: res
                    },{
                        phone_from: data.user_number,
                        credit_code: results.code,
                        api_key: results.api_key,
                        number_key: results.number_key,
                        phone_to: data.phone,
                        message: data.message
                    });

                    connection.commit(function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/broadcast/sendMessage');
                        } 
                        else {
                            res.status(200).json({
                                code: 200,
                                success: true,
                                message: "OK",
                                data: results
                            })
                            connection.release();
                        };
                    })
                }
                else{
                    res.status(400).json({
                        code: 400,
                        success: false,
                        message: "Credit is not enough"
                    })
                    connection.release();
                }
            }
        })
    })
}

type save = {
    phone:string, 
    user_package_code:string, 
    list_code:string, 
    name:string, 
    content_a:string, 
    content_b:string, 
    content_c:string, 
    content_d:string, 
    content_e:string, 
    interval:number,
    status?:number,
    code?:string
}
export async function save({body:data}: {body: save}, res: any) {
    data.status = data.status ?? 1;
    data.code = data.code ?? "";

    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/save');
            } 
            else {
                var user: typeBroadcastUser.broadcastUser = await broadcast.getUserByPhone({
                    connection: connection,
                    res: res,
                    phone: data.phone
                });

                var results: any 
                var broadcastId: any
                if(data.code == ""){
                    results = await broadcast.save({
                        connection: connection,
                        res: res
                    }, data);
                    broadcastId = results["insertId"]
                }
                else{
                    results = await broadcast.update({
                        connection: connection,
                        res: res
                    }, data);
                    broadcastId = data.code
                }

                if(data.status == 1){
                    var resultsList: typeBroadcastList.broadcastList = await broadcast.getList({
                        connection: connection,
                        res: res,
                        phone: data.phone,
                        code: data.list_code
                    });

                    var resultsUserNumber: typeBroadcast.responseUserPackage = await broadcast.getUserPackage({
                        connection: connection,
                        res: res,
                        phone: data.phone,
                        code: data.user_package_code
                    });

                    var resultsContact: typeBroadcastContact.broadcastContact[] = await broadcastContact.get({
                        connection: connection,
                        res: res,
                        data: {
                            list: data.list_code
                        }
                    });

                    var resultsBroadcast: broadcast.get = await broadcast.get({
                        connection: connection,
                        res: res
                    }, {
                        phone: data.phone,
                        code: broadcastId
                    });
    
                    var dataMessage = [];
                    var dataImage = [];
                    if(data.content_a != ""){
                        dataMessage.push(data.content_a)
                        dataImage.push(resultsBroadcast.image_1)
                    }
                    if(data.content_b != ""){
                        dataMessage.push(data.content_b)
                        dataImage.push(resultsBroadcast.image_2)
                    }
                    if(data.content_c != ""){
                        dataMessage.push(data.content_c)
                        dataImage.push(resultsBroadcast.image_3)
                    }
                    if(data.content_d != ""){
                        dataMessage.push(data.content_d)
                        dataImage.push(resultsBroadcast.image_4)
                    }
                    if(data.content_e != ""){
                        dataMessage.push(data.content_e)
                        dataImage.push(resultsBroadcast.image_5)
                    }
    
                    var timeout:number = 0
                    var indexTimeout:number = 0
                    var temp:any = [];
                    for(var i=0; i<resultsContact.length; i++){
                        var message = dataMessage[i%dataMessage.length]
                        var image = dataImage[i%dataImage.length]
                        message = decodeURIComponent(message)

                        if(image == "null" || image == null) image = "";

                        message = message.replaceAll("[Nama Kontak]", resultsContact[i].name)
                        message = message.replaceAll("[Nomor Whatsapp]", resultsContact[i].phone)

                        if(resultsList.param_1 != "") message = message.replaceAll("[" + resultsList.param_1! + "]", resultsContact[i].param_1!)
                        if(resultsList.param_2 != "") message = message.replaceAll("[" + resultsList.param_2! + "]", resultsContact[i].param_2!)
                        if(resultsList.param_3 != "") message = message.replaceAll("[" + resultsList.param_3! + "]", resultsContact[i].param_3!)
                        if(resultsList.param_4 != "") message = message.replaceAll("[" + resultsList.param_4! + "]", resultsContact[i].param_4!)
                        if(resultsList.param_5 != "") message = message.replaceAll("[" + resultsList.param_5! + "]", resultsContact[i].param_5!)
                        if(resultsList.param_6 != "") message = message.replaceAll("[" + resultsList.param_6! + "]", resultsContact[i].param_6!)
                        if(resultsList.param_7 != "") message = message.replaceAll("[" + resultsList.param_7! + "]", resultsContact[i].param_7!)
                        if(resultsList.param_8 != "") message = message.replaceAll("[" + resultsList.param_8! + "]", resultsContact[i].param_8!)
                        if(resultsList.param_9 != "") message = message.replaceAll("[" + resultsList.param_9! + "]", resultsContact[i].param_9!)
                        if(resultsList.param_10 != "") message = message.replaceAll("[" + resultsList.param_10! + "]", resultsContact[i].param_10!)

                        message = encodeURIComponent(message)
                        var results: any = await broadcast.saveDetail({
                            connection: connection,
                            res: res
                        },{
                            broadcast: broadcastId,
                            message: message,
                            image: image,
                            name: resultsContact[i].name,
                            phone: resultsContact[i].phone
                        });
                    }
    
                    await task.savePending({
                        connection: connection,
                        res: res
                    },{
                        type: 1,
                        task_reference: broadcastId
                    })

                    broadcast.runBroadcast({
                        connection: connection,
                        res: res
                    },{
                        code: broadcastId
                    })
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/save');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "OK",
                            data: broadcastId
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}

type saveImage = {
    code:string,
    position:number,
    image:string,
    image_name:string
}
export async function saveImage({body:data}: {body: saveImage}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/saveImage');
            } 
            else {
                var results: any = await broadcast.saveImage({
                    connection: connection,
                    res: res
                }, data);

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/saveImage');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "OK"
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}



type broadcastStatus = {
    code:string
}
export async function pauseBroadcast({body:data}: {body: broadcastStatus}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/pauseBroadcast');
            } 
            else {
                await broadcast.pauseBroadcast({
                    connection: connection,
                    res: res
                }, data);

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/pauseBroadcast');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "OK"
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}

export async function continueBroadcast({body:data}: {body: broadcastStatus}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/continueBroadcast');
            } 
            else {
                await broadcast.continueBroadcast({
                    connection: connection,
                    res: res
                }, data);

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/continueBroadcast');
                    } 
                    else {
                        res.status(200).json({
                            code: 200,
                            success: true,
                            message: "OK"
                        })
                        connection.release();
                    };
                })
            }
        })
    })
}


export async function checkNumber({body:{phone}}: typeBroadcast.getOtp, res: any) {
    
    var status = await new Promise(async function(resolve, reject) {
        await functionGlobal.checkWA(phone, function(response:any){
            resolve(response);
        });
    })

    res.status(200).json({
        code: status,
        success: (status==200) ? true : false,
        message: (status==200) ? "valid" : "not valid"
    })
}

export async function getOtp({body:{phone}}: typeBroadcast.getOtp, res: any) {
    let otp:string = Math.floor(100000 + Math.random() * 900000) + ""
    
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/getOtp');
            } 
            else {
                var results = await broadcast.getUserByPhone({
                    connection: connection,
                    res: res,
                    phone: phone
                });
                
                if(!results){
                    var result:any = await broadcast.insertNewUser({
                        connection: connection,
                        res: res,
                        phone: phone,
                        otp: otp
                    });
                    var user = result["insertId"]

                    var result:any = await broadcast.insertNewNumber({
                        connection: connection,
                        res: res,
                        apiKey: "",
                        numberKey: "",
                        maxSend: 400,
                        type: 2,
                        user: user,
                        phone: phone
                    });

                    // await broadcast.insertNewCredit({
                    //     connection: connection,
                    //     res: res,
                    //     user_number: result["insertId"],
                    //     credit: 50,
                    //     expired: 7
                    // });

                    // await broadcast.insertNewNumber({
                    //     connection: connection,
                    //     res: res,
                    //     apiKey: "",
                    //     numberKey: "",
                    //     maxSend: 400,
                    //     type: 2,
                    //     user: user,
                    //     phone: phone
                    // });
                }
                else await broadcast.updateUserOtp({
                    connection: connection,
                    res: res,
                    phone: phone,
                    otp: otp
                });

                functionGlobal.sendWA(phone, "[WooBlazz] Kode Verifikasi Anda " + otp);

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller_broadcast/getOtp');
                    } else {
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

export async function getUser({body:{phone}}: {body: typeBroadcast.onlyPhone}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/getUser');
            } 
            else {
                var result: any = await broadcast.getUserByPhone({
                    connection: connection,
                    res: res,
                    phone: phone
                });
                
                if(result){
                    res.status(200).json({
                        code: 200,
                        success: true,
                        message: "ok",
                        data: result
                    })
                    connection.release();
                }
                else{
                    res.status(200).json({
                        code: 400,
                        success: false,
                        message: "User tidak ditemukan"
                    })
                    connection.release();
                }
            }
        })
    })
}

export async function submitOtp({body:{phone, otp}}: typeBroadcast.submitOtp, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller_broadcast/submitOtp');
            } 
            else {
                var result: any = await broadcast.getUserByPhone({
                    connection: connection,
                    res: res,
                    phone: phone
                });
                
                if(result){
                    if(result.otp == otp){
                        delete result['otp']
                        delete result['code']
                        
                        var token = Date.now().toString(36) + Math.random().toString(36)
                        await broadcast.updateUserToken({
                            connection: connection,
                            res: res,
                            phone: phone,
                            token: token
                        });

                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'controller/broadcast/submitOtp');
                            } 
                            else {
                                res.status(200).json({
                                    code: 200,
                                    success: true,
                                    message: "ok",
                                    data: result
                                })
                                connection.release();
                            };
                        })
                    }
                    else{
                        res.status(200).json({
                            code: 400,
                            success: false,
                            message: "OTP tidak sesuai"
                        })
                        connection.release();
                    }
                }
                else{
                    res.status(200).json({
                        code: 400,
                        success: false,
                        message: "User tidak ditemukan"
                    })
                    connection.release();
                }
            }
        })
    })
}


export async function completeData({body:{phone, name, referral}}: typeBroadcast.completeData, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller_broadcast/completeData');
            } 
            else {
                await broadcast.updateUser({
                    connection: connection,
                    res: res,
                    v_phone: phone,
                    v_name: name,
                    v_referral: referral
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller_broadcast/completeData');
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


export async function getUserPackage({body:data}: {body: typeBroadcast.getUserPackage}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/getUserPackage');
            } 
            else {
                var results: any = await broadcast.getUserPackage({
                    connection: connection,
                    res: res,
                    phone: data.phone
                });

                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "OK",
                    data: results
                })
                connection.release();
            }
        })
    })
}

export async function getUserCredit({body:data}: {body: typeBroadcast.getUserCredit}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/getUserCredit');
            } 
            else {
                var results: any = await broadcast.getUserCredit({
                    connection: connection,
                    res: res,
                    phone: data.phone,
                    packagee: data.package
                });

                var totalCredit = 0;
                if(results){
                    for(var i=0; i<results.length; i++){
                        totalCredit += results[i]['credit_left'];
                    }
                }

                res.status(200).json({
                    code: 200,
                    success: true,
                    message: totalCredit,
                    data: results
                })
                connection.release();
            }
        })
    })
}




export async function getTransactionHistory({body:data}: {body: typeBroadcast.getTransactionHistory}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/getTransactionHistory');
            } 
            else {
                var results: any = await broadcast.getTransactionHistory({
                    connection: connection,
                    res: res,
                    phone: data.phone
                });

                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "OK",
                    data: results
                })
                connection.release();
            }
        })
    })
}

export async function buyPackage({body:data}: {body: typeBroadcast.buyPackage}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/buyPackage');
            } 
            else {
                var hash = "bc-" + Date.now().toString(36)

                var results: any = await broadcast.buyPackage({
                    connection: connection,
                    res: res,
                    hash: hash,
                    number: data.number,
                    phone: data.phone,
                    packagee: data.package,
                    price: data.price
                });

                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                    data: {
                        "hash": hash
                    }
                })
                connection.release();
            }
        })
    })
}




export async function getList({body:{phone, code="%"}}: {body: typeBroadcast.getList}, res: any) {
    
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller_broadcast/getList');
            } 
            else {
                var results: typeBroadcastList.broadcastList = await broadcast.getList({
                    connection: connection,
                    res: res,
                    phone: phone,
                    code: code
                })

                res.status(200).json({
                    code: 200,
                    success: true,
                    message: "ok",
                    data: results
                })
                connection.release();
            }
        })
    })
}


export async function insertList({body: {phone, name, description, param=[]}}: {body: typeBroadcastList.insert}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller_broadcast/insertList');
            } 
            else {
                var result:any = await broadcast.insertList({
                    connection: connection,
                    res: res,
                    phone: phone,
                    name: name,
                    description: description
                });

                var code = result["insertId"];

                for(var i=0; i<param.length; i++){
                    await broadcast.updateListParam({
                        connection: connection,
                        res: res,
                        code: code,
                        index: i+1,
                        name: param[i]
                    }); 
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller_broadcast/insertList');
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
        })
    })
}


export async function updateListParam({body: {code, param=[]}}: typeBroadcast.updateListParam, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/updateListParam');
            } 
            else {
                for(var i=0; i<param.length; i++){
                    await broadcast.updateListParam({
                        connection: connection,
                        res: res,
                        code: code,
                        index: i+1,
                        name: param[i]
                    }); 

                    if(param[i] == ""){
                        await broadcastContact.deleteParam({
                            connection: connection,
                            res: res,
                            list: code,
                            index: i+1
                        }); 
                    }
                }

                for(var j=param.length-1; j>=0; j--){
                    if(param[j] == ""){
                        await broadcast.deleteListParam({
                            connection: connection,
                            res: res,
                            code: code,
                            index: j+1
                        });
                    }
                }

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/updateListParam');
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


export async function updateList({body: {phone, code, name, description, param=[]}}: {body: typeBroadcastList.update}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/updateList');
            } 
            else {
                var result:any = await broadcast.updateList({
                    connection: connection,
                    res: res,
                    code: code,
                    name: name,
                    description: description
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/updateList');
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


export async function deleteList({body: {phone, code}}: {body: typeBroadcastList.update}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/broadcast/deleteList');
            } 
            else {
                var result:any = await broadcast.deleteList({
                    connection: connection,
                    res: res,
                    code: code
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/broadcast/deleteList');
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