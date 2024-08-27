import pool from "../config/connect"
import * as jvape from '../function/jvape'
import * as transactionDetail from '../function/transaction/transactiondetail'
import * as transactionAdditional from '../function/transaction/transactionadditional'
import * as transactionPromotionDetail from '../function/transaction/transactionpromotiondetail'
import * as transactionpayment from '../function/transaction/transactionpayment'
import * as transactionpromotion from '../function/transaction/transactionpromotion'
import * as errors from "../function/global_function"
import * as functionGlobal from '../function/global_function'
import * as type from '../type/jvape'
import * as typeNotification from '../type/jvape_notification'
import { transactiondetail } from "../type/transaction"

export async function getVariable({body:{}}:{body:any}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/jvape/getVariable');
            } 
            else {
                var results = await jvape.getVariable({
                    connection: connection,
                    res: res
                });
                
                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/jvape/getVariable');
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

export async function generateOtp({body:data}:{body:{phone:string}}, res: any) {
    let otp:string = Math.floor(1000 + Math.random() * 9000) + ""
    
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/jvape/generateOtp');
            } 
            else {
                var results = await jvape.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: data.phone
                });
                
                if(!results){
                    var result:any = await jvape.insertNewUser({
                        connection: connection,
                        res: res
                    },{
                        phone: data.phone,
                        otp: otp
                    });
                    var user = result["insertId"]
                }
                else await jvape.updateUserOtp({
                    connection: connection,
                    res: res
                    
                },{
                    phone: data.phone,
                    otp: otp
                });

                functionGlobal.sendWA(data.phone, "[Jvape] Kode Verifikasi Anda " + otp);

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/jvape/generateOtp');
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
                errors.rollback(connection, res, err, 'controller/jvape/login');
            } 
            else {
                var result = await jvape.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: phone
                });
                
                if(result){
                    if(result.otp == otp){
                        connection.commit(function(err) {
                            if (err) {
                                errors.rollback(connection, res, err, 'controller/jvape/login');
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
                errors.rollback(connection, res, err, 'controller/jvape/profile');
            } 
            else {
                var result = await jvape.getUserById({
                    connection: connection,
                    res: res
                },{
                    id: id
                });
                
                if(result){
                    var resultTransaction = await jvape.getTransactionYearly({
                        connection: connection,
                        res: res
                    },{
                        phone: result.phone
                    });
                    result.transaction_count = resultTransaction.transaction_count
                    result.transaction_nominal = resultTransaction.transaction_nominal

                    connection.commit(function(err) {
                        if (err) {
                            errors.rollback(connection, res, err, 'controller/jvape/profile');
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

export async function updateProfile({body:data}:{body:{id:number, name:string, email:string, address:string, date_birth:string, gender:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/jvape/profile');
            } 
            else {
                await jvape.updateProfile({
                    connection: connection,
                    res: res
                },data);
                
                connection.commit(async function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/jvape/profile');
                    } 
                    else {
                        var result = await jvape.getUserById({
                            connection: connection,
                            res: res
                        },{
                            id: data.id
                        });
                        
                        if(result){
                            var resultTransaction = await jvape.getTransactionYearly({
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
        })
    })
}

export async function getPoints({body:data}:{body:{id_user:number}}, res: any) {
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/jvape/getPoints');
            } 
            else {
                var resultPointActive = await jvape.getPointsActive({
                    connection: connection,
                    res: res
                },{
                    id_user: data.id_user
                });

                var total = 0;
                for(let point of resultPointActive){
                    total += point.value_left
                }

                var resultPointStatement = await jvape.getPointsStatement({
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
                    if (err) errors.rollback(connection, res, err, 'controller/jvape/getPoints');
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
                errors.rollback(connection, res, err, 'controller/jvape/getUserVoucher');
            } 
            else {
                var result = await jvape.getUserVoucher({
                    connection: connection,
                    res: res
                },{
                    id_user: data.id_user
                });

                connection.commit(function(err) {
                    if (err) errors.rollback(connection, res, err, 'controller/jvape/getUserVoucher');
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


export async function getNotification({body:{}}: any, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getNotification({
            connection: connection,
            res: res
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
        var results = await jvape.getBanner({
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


export async function getStore({body:{}}: any, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getStore({
            connection: connection,
            res: res
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



export async function getProduct({body:data}: {body: type.getStore}, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getProduct({
            connection: connection,
            res: res,
            data: data
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


type getProductByKeyword = {
    keyword: string
}
export async function getProductByKeyword({body:data}: {body: getProductByKeyword}, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getProductByKeyword({
            connection: connection,
            res: res,
            data: data
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


export async function getVoucher({body:{}}: any, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getVoucher({
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
        var voucher:jvape.getVoucher = await jvape.getVoucher({
            connection: connection,
            res: res
        },{
            code: data.voucher_id
        });

        if(voucher){
            var user = await jvape.getUser({
                connection: connection,
                res: res
            },{
                phone: data.phone
            })
        
        
            var points = await jvape.getPointsActive({
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
                    var userVoucher:any = await jvape.buyVoucher({
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
                                await jvape.minusPoint({
                                    connection: connection,
                                    res: res
                                }, {
                                    user: user,
                                    value: value,
                                    source: userVoucher["insertId"],
                                    type: 2,
                                    source_point: point.code
                                })

                                await jvape.updatePoint({
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
                errors.rollback(connection, res, err, 'controller/jvape/redeemPoint 1');
            } 
            else {
                var resultUser = await jvape.getUser({
                    connection: connection,
                    res: res
                },{
                    phone: data.phone
                });


                var resultCheckPointUsed = await jvape.checkPointUsed({
                    connection: connection,
                    res: res
                },{
                    receipt: data.receipt
                });

                if(resultCheckPointUsed.count == 0){
                    var resultPointDetail = await jvape.pointDetail({
                        connection: connection,
                        res: res
                    },{
                        receipt: data.receipt
                    });

                    if(resultPointDetail){
                        if(resultPointDetail.phone == data.phone){
                            await jvape.redeemPoint({
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
                                    errors.rollback(connection, res, err, 'controller/jvape/redeemPoint 2');
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




type getHistory = {
    phone: string
}
export async function getHistory({body:data}: {body: getHistory}, res: any) {
    pool.getConnection(async function(err, connection) {
        var results = await jvape.getHistory({
            connection: connection,
            res: res,
            phone: data.phone
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


type getHistoryDetail = {
    receipt: string
}
export async function getHistoryDetail({body:data}: {body: getHistoryDetail}, res: any) {
    pool.getConnection(async function(err, connection) {
        var resultsDetail = await transactionDetail.get({
            connection: connection,
            res: res
        },{
            receipt: data.receipt
        });


        for(var i=0; i<resultsDetail.length; i++){
            var resultsDetailAdditional = await transactionAdditional.get({
                connection: connection,
                res: res
            },{
                detail_code: resultsDetail[i].code
            });
            
            
            var resultsDetailPromotion = await transactionPromotionDetail.get({
                connection: connection,
                res: res
            },{
                detail_code: resultsDetail[i].code
            });

            resultsDetail[i]['additional'] = resultsDetailAdditional;
            resultsDetail[i]['promotion'] = resultsDetailPromotion;
        }



        var resultsPromotion = await transactionpromotion.get({
            connection: connection,
            res: res,
        },{
            receipt: data.receipt
        });



        var resultsPayment = await transactionpayment.get({
            connection: connection,
            res: res,
        },{
            receipt: data.receipt
        });




        connection.beginTransaction(async function(err) {
            if (err) {
                errors.rollback(connection, res, err, 'controller/jvape/getHistoryDetail 1');
            } 
            else {
                var resultsDetail = await transactionDetail.get({
                    connection: connection,
                    res: res
                },{
                    receipt: data.receipt
                });

                for(var i=0; i<resultsDetail.length; i++){
                    var resultsDetailAdditional = await transactionAdditional.get({
                        connection: connection,
                        res: res
                    },{
                        detail_code: resultsDetail[i].code
                    });
                    
                    
                    var resultsDetailPromotion = await transactionPromotionDetail.get({
                        connection: connection,
                        res: res
                    },{
                        detail_code: resultsDetail[i].code
                    });

                    resultsDetail[i]['additional'] = resultsDetailAdditional;
                    resultsDetail[i]['promotion'] = resultsDetailPromotion;
                }



                var resultsPromotion = await transactionpromotion.get({
                    connection: connection,
                    res: res,
                },{
                    receipt: data.receipt
                });



                var resultsPayment = await transactionpayment.get({
                    connection: connection,
                    res: res,
                },{
                    receipt: data.receipt
                });

                connection.commit(function(err) {
                    if (err) {
                        errors.rollback(connection, res, err, 'controller/jvape/getHistoryDetail 2');
                    } else {
                        var results:any = {
                            'detail': resultsDetail,
                            'promotion': resultsPromotion,
                            'payment': resultsPayment
                        };

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