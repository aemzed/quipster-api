import pool from "../config/connect"
import * as pods from '../function/pods'
import * as transactionDetail from '../function/transaction/transactiondetail'
import * as transactionAdditional from '../function/transaction/transactionadditional'
import * as transactionPromotionDetail from '../function/transaction/transactionpromotiondetail'
import * as transactionpayment from '../function/transaction/transactionpayment'
import * as transactionpromotion from '../function/transaction/transactionpromotion'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import { Response } from "express"

export async function generateOtp({body:data}:{body:{phone:string}}, res: any) {
    let otp:string = Math.floor(1000 + Math.random() * 9000) + ""
    
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/generateOtp');
            } 
            else {
                var results = await pods.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: data.phone
                });
                
                if(!results){
                    var result:any = await pods.insertNewUser({
                        connection: connection,
                        res: res
                    },{
                        phone: data.phone,
                        otp: otp
                    });
                    var user = result["insertId"]
                }
                else await pods.updateUserOtp({
                    connection: connection,
                    res: res
                    
                },{
                    phone: data.phone,
                    otp: otp
                });

                functionGlobal.sendWA(data.phone, "Kode OTP Anda untuk masuk ke aplikasi PODS Authentic adalah " + otp + ", jangan berikan kode ini ke siapapun!");

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/pods/generateOtp');
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

export async function login({body:{phone, otp}}:{body:{phone:string, otp:string}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/login');
            } 
            else {
                var result = await pods.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: phone
                });
                
                if(result){
                    if(result.otp == otp){
                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'controller/pods/login');
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

export async function profile({body:{id}}:{body:{id:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/profile/beginTransaction');
            } 
            else {
                var result = await pods.getUserById({
                    connection: connection,
                    res: res
                },{
                    id: id
                });
                
                if(result){
                    var resultTransaction = await pods.getTransactionYearly({
                        connection: connection,
                        res: res
                    },{
                        phone: result.phone
                    });
                    result.transaction_count = resultTransaction.transaction_count
                    result.transaction_nominal = resultTransaction.transaction_nominal

                    connection.commit(function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/pods/profile/commit');
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
                        message: "User tidak ditemukan"
                    })
                    connection.release();
                }
            }
        })
    })
}

export async function updateProfile({body:data}:{body:{id:any, name:string, email:string, address:string, date_birth:string, gender:number, refferal?:string}}, res: any) {
    if (data.id == undefined || isNaN(parseFloat(data.id))) return res.status(400).json({success: false, message: 'id tidak boleh kosong dan harus berupa angka.'})
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) errors.rollback(connection, res, err, 'controller/pods/updateProfile/beginTransaction');
            else {
                await pods.updateProfile({
                    connection: connection,
                    res: res
                },data);
                var canUpdate = true;

                if(data.refferal){
                    var resultRefferal = await pods.checkRefferal({
                        connection: connection,
                        res: res
                    }, {
                        refferal: data.refferal!
                    })

                    if(resultRefferal){
                        await pods.updateRefferal({
                            connection: connection,
                            res: res
                        },{
                            id: data.id,
                            refferal: data.refferal!
                        });
                    }
                    else canUpdate = false;
                }
                
                if(canUpdate){
                    connection.commit(async function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/pods/updateProfile/commit');
                        } 
                        else {
                            var result = await pods.getUserById({
                                connection: connection,
                                res: res
                            },{
                                id: data.id
                            });
                            
                            if(result){
                                var resultTransaction = await pods.getTransactionYearly({
                                    connection: connection,
                                    res: res
                                },{
                                    phone: result.phone
                                });
                                result.transaction_count = resultTransaction.transaction_count
                                result.transaction_nominal = resultTransaction.transaction_nominal
            
                                res.status(200).json({
                                    code: 200,
                                    success: true,
                                    message: "ok",
                                    data: result
                                })
                                connection.release();
                            }
                        };
                    })
                }
                else connection.rollback(() => {
                    return res.status(400).json({success: false, message: 'Referral tidak ditemukan.'})
                })
            }
        })
    })
}

export async function getRefferalUser({body:data}:{body:{id_user:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/getRefferalUser');
            } 
            else {
                var result = await pods.getRefferalUser({
                    connection: connection,
                    res: res
                },{
                    id: data.id_user
                });

                connection.commit(function(err) {
                    if (err) errors.rollback(connection, res, err, 'controller/pods/getRefferalUser');
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
        })
    })
}

export async function getPoints({body:data}:{body:{id_user:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/getPoints');
            } 
            else {
                var resultPointActive = await pods.getPointsActive({
                    connection: connection,
                    res: res
                },{
                    id_user: data.id_user
                });

                var total = 0;
                for(let point of resultPointActive){
                    total += point.value_left
                }

                var resultPointStatement = await pods.getPointsStatement({
                    connection: connection,
                    res: res
                },{
                    id_user: data.id_user
                });
                

                var result = {
                    "total": total,
                    "point_active": resultPointActive,
                    "point_statement": resultPointStatement
                }

                connection.commit(function(err) {
                    if (err) errors.rollback(connection, res, err, 'controller/pods/getPoints');
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
        })
    })
}

export async function getUserVoucher({body:data}:{body:{id_user:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/getUserVoucher');
            } 
            else {
                var result = await pods.getUserVoucher({
                    connection: connection,
                    res: res
                },{
                    id_user: data.id_user
                });

                connection.commit(function(err) {
                    if (err) errors.rollback(connection, res, err, 'controller/pods/getUserVoucher');
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
        })
    })
}


export async function getNotification({body:data}:{body:{id_user:number}}, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await pods.getNotification({
            connection: connection,
            res: res
        },{
            id_user: data.id_user
        });

        res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
            data: results
        })
        connection.release();
    })
}


export async function getBanner({body:{}}: any, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await pods.getBanner({
            connection: connection,
            res: res
        });

        res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
            data: results
        })
    })
}


export async function getVoucher({body:{}}: any, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await pods.getVoucher({
            connection: connection,
            res: res
        },{

        });

        res.status(200).json({
            code: 200,
            success: true,
            message: "ok",
            data: results
        })
        connection.release();
    })
}

type buyVoucher = {
    phone: string,
    voucher_id: string
}
export async function buyVoucher({body:data}: {body: buyVoucher}, res: any) {
    pool.getConnection(async function(err, connection) {
        var voucher:pods.getVoucher = await pods.getVoucher({
            connection: connection,
            res: res
        },{
            code: data.voucher_id
        });

        if(voucher){
            var user = await pods.getUser({
                connection: connection,
                res: res
            },{
                phone: data.phone
            })
        
            if (user) {
                var points = await pods.getPointsActive({
                    connection: connection,
                    res: res
                },{
                    id_user: user.id,
                    order: 'ASC'
                })
    
                if(points.length > 0){
                    var balance = points.reduce((acc, data) => acc + data.value_left, 0)
                
                    let voucherPrice = voucher.price
                    if(functionGlobal.isBetweenDate({date_start: voucher.date_start_sale, date_end: voucher.date_end_sale}) ) voucherPrice = voucher.price_sale
        
                    if(balance >= voucherPrice){
                        var userVoucher:any = await pods.buyVoucher({
                            connection: connection,
                            res: res
                        }, {
                            user: user,
                            voucher: voucher
                        })
    
                        if(userVoucher){
                            for(const point of points){
                                if(voucherPrice > 0){
                                    var value = -(voucherPrice > point.value_left ? point.value_left : voucherPrice)
                                    await pods.minusPoint({
                                        connection: connection,
                                        res: res
                                    }, {
                                        user: user,
                                        value: value,
                                        source: userVoucher["insertId"],
                                        type: 2,
                                        source_point: point.code
                                    })
    
                                    await pods.updatePoint({
                                        connection: connection,
                                        res: res
                                    },{
                                        user: user,
                                        value_left: point.value_left + value,
                                        source_point: point.code
                                    })
    
                                    
                                    voucherPrice += value
                                }
                            }
    
                            res.status(200).json({
                                code: 200,
                                success: true,
                                message: "ok",
                                data: userVoucher["insertId"]
                            })
                        }
                    }
                    else{
                        res.status(400).json({
                            code: 404,
                            success: true,
                            message: "Point tidak mencukupi!"
                        })
                    }
                }
                else{
                    res.status(400).json({
                        code: 404,
                        success: true,
                        message: "Point tidak mencukupi!"
                    })
                }
            } else {
                res.status(400).json({
                    code: 404,
                    success: true,
                    message: "user not found!"
                })
            }
        }
        else{
            res.status(400).json({
                code: 404,
                success: true,
                message: "voucher not found!"
            })
        }

        connection.release();
    })
}


type redeemPoint = {
    phone: string,
    receipt: string
}
export async function redeemPoint({body:data}:{body:redeemPoint}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/pods/redeemPoint 1');
            } 
            else {
                var resultUser = await pods.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: data.phone
                });


                var resultCheckPointUsed = await pods.checkPointUsed({
                    connection: connection,
                    res: res
                },{
                    receipt: data.receipt
                });

                if(resultCheckPointUsed.count == 0){
                    var resultPointDetail = await pods.pointDetail({
                        connection: connection,
                        res: res
                    },{
                        receipt: data.receipt
                    });

                    if(resultPointDetail){
                        if (resultPointDetail.phone.indexOf('0') === 0) resultPointDetail.phone = "62" + resultPointDetail.phone.substring(1)
                        else if (resultPointDetail.phone.indexOf('+') === 0) resultPointDetail.phone = resultPointDetail.phone.substring(1)

                        if (data.phone.indexOf('0') === 0) data.phone = "62" + data.phone.substring(1)
                        else if (data.phone.indexOf('+') === 0) data.phone = data.phone.substring(1)
                        else if (data.phone.indexOf('62') === 0) data.phone = data.phone
                        else data.phone = "62" + data.phone

                        if (resultPointDetail.phone.indexOf('0') === 0) resultPointDetail.phone = "62" + resultPointDetail.phone.substring(1)
                        else if (resultPointDetail.phone.indexOf('+') === 0) resultPointDetail.phone = resultPointDetail.phone.substring(1)
                        else if (resultPointDetail.phone.indexOf('62') === 0) resultPointDetail.phone = resultPointDetail.phone
                        else resultPointDetail.phone = "62" + resultPointDetail.phone

                        if(resultPointDetail.contain_package == 0){
                            if(resultPointDetail.phone == data.phone){
                                await pods.redeemPoint({
                                    connection: connection,
                                    res: res
                                },{
                                    user: resultUser.id,
                                    store: resultPointDetail.store,
                                    point: resultPointDetail.point,
                                    receipt: data.receipt
                                });
    
                                connection.commit(function(err) {
                                    if (err) {
                                        errors.rollback(connection, res, err, 'controller/pods/redeemPoint 2');
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
                            else{
                                res.status(400).json({
                                    code: 400,
                                    success: false,
                                    message: "Point milik pelanggan lain"
                                })
                                connection.release();
                            }
                        }
                        else{
                            res.status(400).json({
                                code: 400,
                                success: false,
                                message: "Nota tidak dapat di redeem"
                            })
                            connection.release();
                        }
                    }
                    else{
                        res.status(400).json({
                            code: 400,
                            success: false,
                            message: "Nota tidak valid"
                        })
                        connection.release();
                    }
                }
                else{
                    res.status(400).json({
                        code: 400,
                        success: false,
                        message: "Point sudah di redeem sebelumnya"
                    })
                    connection.release();
                }

            }
        })
    })
}

export function getMember(req: Request, res: Response) {
    pool.getConnection(async function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/pods/getMember')

        let resPodsGetMember = await pods.getMember({res, connection})
        return res.status(200).json({success: true, message: "OK", data: resPodsGetMember})
    })
}

type updateRefferalCode = {
    body: {
        id: string,
        refferal_code: string
    }
}
export function updateRefferalCode(req: updateRefferalCode, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['id', 'refferal_code'])
            let requestBody = {
                id: parseFloat(req.body.id),
                refferalCode: <string>req.body.refferal_code
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }

    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/pods/updateReferralCode')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/pods/updateReferralCode/beginTransaction')

            let requestBody = convertBody()!
            if (res.headersSent) return

            let resultCheckRefferal = await pods.checkRefferal({res, connection}, {refferal: req.body.refferal_code})
            if (resultCheckRefferal) return res.status(400).json({success: false, message: 'Refferal code telah digunakan. Gunakan refferal code lainnya'})

            let resultGetOldReferralCode = await pods.getRefferalCode({res, connection}, {id: requestBody.id})
            await pods.updateRefferalCode({res, connection}, {id: requestBody.id, refferal_code: requestBody.refferalCode})
            await pods.updateRefferalFromByRefferalCode({res, connection}, {refferal_from_before: resultGetOldReferralCode.refferal_code, refferal_from_after: requestBody.refferalCode})
            connection.commit(function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/pods/updateReferralCode/commit')
                
                return res.status(200).json({success: true, message: 'Refferal code updated.'})
            })
        })
    })
}

type updateRefferalPoint = {
    body: {
        id: string,
        refferal_point_get: string,
        refferal_point_give: string
    }
}
export function updateRefferalPoint(req: updateRefferalPoint, res: Response) {

    function convertBody() {
        try {
            errors.checkField(req.body, ['id'])
            let requestBody = {
                id: parseFloat(req.body.id),
                refferal_point_get: !req.body.refferal_point_get || req.body.refferal_point_get === '' ? undefined : parseFloat(req.body.refferal_point_get),
                refferal_point_give: !req.body.refferal_point_give || req.body.refferal_point_give === '' ? undefined : parseFloat(req.body.refferal_point_give) 
            }
            errors.checkNaN(requestBody)
            return requestBody
        } catch (err: any) {
            res.status(400).json({success: false, message: err.message})
        }
    }
    pool.getConnection(function (err, connection) {
        if (err) return errors.rollback(connection, res, err, 'controller/pods/updateRefferalPoint/getConnection')

        connection.beginTransaction(async function (err) {
            if (err) return errors.rollback(connection, res, err, 'controller/pods/updateRefferalPoint/beginTransaction')

            let requestBody = convertBody()!
            if (res.headersSent) return

            await pods.updateRefferalPoint({res, connection}, {id: requestBody.id, refferal_point_get: requestBody.refferal_point_get, refferal_point_give: requestBody.refferal_point_give})
            connection.commit( function (err) {
                if (err) return errors.rollback(connection, res, err, 'controller/pods/updateRefferalPoint')
                
                return res.status(200).json({success: true, message: 'Referral point updated.'})
            })
        })
    })
}