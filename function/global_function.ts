var https = require('follow-redirects').https;
const Password = require('node-php-password')

import { Request, Response } from 'express';
import { url } from 'inspector';
import moment from 'moment';
import { PoolConnection } from 'mysql2/typings/mysql/lib/PoolConnection';
import pool from '../config/connect';

import * as typeGlobal from "../type/global"
import * as functionUser from "../function/account/user"

import crypto from "crypto"
import { Stream } from 'stream';

export function error(connection: any, res: any, notes: string) {
    res.status(400).json({
        code: 400,
        success: false,
        message: notes
    })
    connection.release();
}

export function rollback(connection: any, res: any, error: any, notes: string, req?: any) {
    console.log(`Error occured in ${notes}`)
    connection.rollback(function() {
        console.log({error})
        if (error) {
            let queryInsertError = ''
            if (error.sql && error.sqlMessage) {
                queryInsertError =  `
                                    INSERT INTO 
                                        dvw_system.vw_error 
                                    SET 
                                        v_query = '${error.sql}', 
                                        v_error = '${error.sqlMessage}',
                                        v_notes = '${notes}'
                                    `
            } else {
                queryInsertError =  `
                                    INSERT INTO 
                                        dvw_system.vw_error 
                                    SET 
                                        v_query = '', 
                                        v_error = '${error.message}',
                                        v_notes = '${notes}'        
                                    `
            }   
            connection.query(queryInsertError, function(err: any) {
                if (err) throw err;
                connection.release();
                throw error
            })
            
        }
        res.status(500).json({
            code: 500,
            success: false,
            message: "error",
            description: error
        })
    });
}

export async function APIError(connection: PoolConnection, error: any, req: any, res: Response, notes: string, rollback?: boolean) {
    console.log(`====Error occured in ${notes}====`)
    console.log(error.sqlMessage ?? error.message ?? '')
    console.log('========================================================')
    try {
        let queryInsertError =  `
                                INSERT INTO
                                    dvw_system.vw_error
                                SET
                                    v_query = '',
                                    v_error = '${Object.getOwnPropertyNames(error).map((key) => `${key}: ${error[key]}`).join(',\\n\\n').replaceAll(`'`, `''`)}',
                                    v_notes = '${notes}'
                                `
        await new Promise((resolve, reject) => {
            connection.query(queryInsertError, function (err: any) {
                if (err) reject (err)
                resolve(null)
            })
        }).catch(err => {throw(err)})
        if (rollback) {
            await new Promise((resolve, reject) => {
                connection.rollback(function (err) {
                    if (err) console.log('Error rollbacking transaction in controller/unit/insertV3')
                    resolve(null)
                })
            })
        }
        return res.status(500).json({success: false, message: 'API Error. Please contact the developer.'})
    } catch (err: any) {
        console.log("=======Error inserting error to database.===============")
        console.log(Object.getOwnPropertyNames(err).map((key) => `${key}: ${err[key]}`).join(' AND '))
        console.log("========================================================")
        return res.status(500).json({success: false, message: 'API Error. Please contact the developer.'})
    }
}

export function sendResponse(res: Response, connection: PoolConnection, status: number, success: boolean, message: string, data?: any) {
    res.status(status).json({
        success: success,
        message: message,
        ...(data && {data: data})
    })
    connection.release()
}

function isDate(key: string, value: any) {
    let indicatedDateSubstring = ['dt_', 'date', 'created', 'businessExpired', 'lastpayment']
    let exception = {'user_created': true}
    for(let substring of indicatedDateSubstring) {
        if (key.indexOf(substring) >= 0 && !(key in exception) && key !== 'dates') {
            return true
        }
    }
    return false
}

function isValidDate(date: Date) {
    if ( Object.prototype.toString.call(date) === "[object Date]" ) {
        if ( !isNaN(date.getTime()) ) {
            return true
        } else {
           return false
        }
     } else {
     
        return false
     }
}

export function checkField (requestBody: any, requiredKeys: Array<string>) {
    for (let requiredKey of requiredKeys) {
        if(requestBody[requiredKey] === undefined) throw new Error(`${requiredKey} is not defined.`)
    }
    return false
}
export function checkNaN (datas: any) {
    for (let key of Object.keys(datas)) {
        if (typeof(datas[key]) === 'number' && isNaN(datas[key])) throw new Error(`${key} must be a number.`)
    }
    return false
}
export function newCheckField (requestBody: any, requiredKeys: Array<string>) {
    for (let requiredKey of requiredKeys) {
        if(requestBody[requiredKey] === undefined) throw ({httpResponse: {code: 400, success: false, message: `${requiredKey} is not defined.`}})
    }
    return false
}
export function newCheckNaN (datas: any) {
    for (let key of Object.keys(datas)) {
        if (typeof(datas[key]) === 'number' && isNaN(datas[key])) throw ({httpResponse: {code: 400, success: false, message: `${key} must be a number.`}})
    }
    return false
}

export function requestBodyGate (datas: Array<{key: string, value: any, type: 'string' | 'number' | 'object' | 'array', object?: any}>, res: Response) {
    let requestBody: any = {}
    for (let eachData of datas) {
        if (eachData.type === 'string') requestBody[eachData.key] = <string>eachData.value.toString()
        else if (eachData.type === 'number') {
            if (isNaN(parseFloat(eachData.value))) {
                res.status(400).json({success: false, message: `Parameter ${eachData.key} must be a number`})
                throw new Error('Request not valid')
            }
            requestBody[eachData.key] = <number>parseFloat(eachData.value)
        }
        else if (eachData.type === 'object') {
            if (typeof(eachData.value) === 'object') requestBody[eachData.key] = <object>eachData.value
            else {
                try {
                    requestBody[eachData.key] = <object>JSON.parse(requestBody[eachData.key])
                } catch {
                    res.status(400).json({success: false, message: `Parameter ${eachData.key} must be an object`})
                    throw new Error('Request not valid')
                }
            }
        }
        else if (eachData.type === 'array') {
            if (Array.isArray(eachData.value)) requestBody[eachData.key] = <Array<any>>eachData.value
            else {
                try {
                    requestBody[eachData.key] = <Array<object>>JSON.parse(requestBody[eachData.key])
                    if (!Array.isArray(requestBody[eachData.key])) throw new Error('Request not valid')
                } catch {
                    res.status(400).json({success: false, message: `Parameter ${eachData.key} must be an array`})
                    throw new Error('Request not valid')
                }
            }
        }
    }
    return {...requestBody}
}

export function query(query: string, res: any, connection: any, notes: string, resolve: any, {id=""}= {id:""}): any {
    connection.query(`${query}`, function(error: any, results: any) {
        if (error) {
            rollback(connection, res, error, notes);
        } else {
            let newResults
            try {
                newResults = results.map((result: any) => {
                    let newResult: any = {}
                    Object.keys(result).map((key) => {
                        if (isDate(key, result[key]) && result[key] != null) {
                            if (moment(result[key].toString(), 'YYYY-MM-DD', true).isValid() || moment(result[key].toString(), 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                                newResult[key] = result[key]
                            }
                            else {
                                newResult[key] = moment(result[key], 'ddd MMM DD YYYY hh:mm:ss [GMT]ZZ').format('YYYY-MM-DD HH:mm:ss')
                            }
                            if (newResult[key] === 'Invalid date' || newResult[key] === '1899-11-30 00:00:00') newResult[key] = ''
                        }
                        else newResult[key] = result[key]
                    })
                    return newResult
                })
            } catch{
                newResults = results
            }
            if(id!="") newResults["insertId"] = id
            resolve(newResults);
            connection.release();
        }
    })
}

export function querySingle(query:string, res: any, connection: any, notes: string, resolve: any) {
    try {
        connection.query(`${query}`, function(error: any, [result]: any) {
            if (error) {
                rollback(connection, res, error, notes);
            } else {
                let newResult: any
                try {
                    newResult = {}
                    Object.keys(result).map((key) => {
                        if (isDate(key, result[key]) && result[key] != null) {
                            if (moment(result[key].toString(), 'YYYY-MM-DD', true).isValid() || moment(result[key].toString(), 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                                newResult[key] = result[key]
                            }
                            else {
                                newResult[key] = moment(result[key], 'ddd MMM DD YYYY hh:mm:ss [GMT]ZZ').format('YYYY-MM-DD HH:mm:ss')
                            }
                            if (newResult[key] === 'Invalid date' || newResult[key] === '1899-11-30 00:00:00') newResult[key] = ''
                        }
                        else newResult[key] = result[key]
                    })
                } catch {
                    newResult = result
                }
                resolve(newResult);
                connection.release();
            }
        })
    } catch (err) {
        console.log({err})
        rollback(connection, res, err, notes);
    }
}




export async function gcp(resolve: any, {feature="", key="AIzaSyBzZMJxcxwP6z957V9k5YItrTiHNcotnp8", query=""}:{feature?:string, key?:string, query?:string}) {
    var options = {
        'method': 'GET',
        'hostname': 'maps.googleapis.com',
        'path': '/maps/api/' + feature + '/json?key=' + key + (query!='' ? '&' + query : ''),
        'headers': {
            'Content-Type': 'application/json'
        },
        'maxRedirects': 20
    };

    let url = `https://maps.googleapis.com/maps/api/${feature}/json?key=${key}${ query != '' ? `&${query}` : ''}`
    let resGetData = await fetch(url, {
        'method': 'GET',
        'headers': {
            'Content-Type': 'application/json'
        }
    }).then((response: any) => response.json()).then((result: any) => result)
    
    return resGetData
}

export function curlFCMWeb(title: string, body: string, code: string, token: string, entity: string = "", responseCode: number = 0) {
    let serverKey = 'AAAA1WU9O24:APA91bF1fGiOqQ0AWTG-FilhVbW6UaKIuYXs9CbaFzKEf-IR-C7Aa3IP0ApcEIIWrZNQMRT5UQFMIB76W5JTKEGoc8hWG_UT_VcYzkDe7alHQ1nkIPM2HCi3H-7gPDrLl6GndGfaSIjl'
    var options = {
        'method': 'POST',
        'hostname': 'fcm.googleapis.com',
        'path': '/fcm/send',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'key='+serverKey
        },
        'maxRedirects': 20
    };
    
    var req = https.request(options, function( res: Response) {
        var chunks: any = []

        res.once("data", function (chunk: any) {
            chunks.push(chunk);
        });
    
        res.once("end", function (chunk: any) {  
            var body: any = Buffer.concat(chunks);
            body = JSON.parse(body);
            curlFCMWeb(postData, body, code, token, entity, responseCode)
        });
    
        res.once("error", function (error: any) {
            console.error(error);
        });

        var postData = JSON.stringify({
            'registration_ids': [token],
            'notification': {
                'title': title,
                'body': body,
            },
            'data': {
                'title': title,
                'body': body,
                'code': code,
                'entity': entity,
                'response_code': responseCode
            },
            "priority": "high",
        })

        req.write(postData)

        req.end()
    })
}

export async function curlQRIS(phone: string, resolve:any, apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/validate_number',
        'headers': {
            'Content-Type': 'application/json'
        },
        'maxRedirects': 20
        };
        
        var req = https.request(options, function (res: any) {
            var chunks: any = [];
            
            res.once("data", function (chunk: any) {
                chunks.push(chunk);
            });
            
            res.once("end", function (chunk: any) {
                var body: any = Buffer.concat(chunks);
                body = JSON.parse(body);
                
                if(body.message==null) checkWA(phone, resolve)
                else if(body.status==1005) resolve(500)
                else resolve(200)
            });
            
            res.once("error", function (error: any) {
                console.error(error);
            });
        });
        
        var postData = JSON.stringify({
            "api_key": apiKey,
            "number_key": numberKey,
            "phone_no": phone
        });
        
        await req.write(postData);
        
        req.end();
}

export async function checkWA(phone: string, resolve:any, apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/validate_number',
        'headers': {
            'Content-Type': 'application/json'
        },
        'maxRedirects': 20
        };
        
        var req = https.request(options, function (res: any) {
            var chunks: any = [];
            
            res.once("data", function (chunk: any) {
                chunks.push(chunk);
            });
            
            res.once("end", function (chunk: any) {
                var body: any = Buffer.concat(chunks);
                body = JSON.parse(body);
                
                if(body.message==null) checkWA(phone, resolve)
                else if(body.status==1005) resolve(500)
                else resolve(200)
            });
            
            res.once("error", function (error: any) {
                console.error(error);
            });
        });
        
        var postData = JSON.stringify({
            "api_key": apiKey,
            "number_key": numberKey,
            "phone_no": phone
        });
        
        await req.write(postData);
        
        req.end();
}

export function sendWA(to: string, message: string, from = "6287714041231", type = "chat"){
    var options = {
        'method': 'POST',
        'hostname': 'wa.looyal.id',
        'path': '/send',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
          if(body.status==1005) sendWA(to, message, from, type);
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "to": to,
        "from": from,
        "type": type,
        "message": message
      });
      req.write(postData);
      
      req.end();
}

export async function sendNewWA(to: string,  message: string,  from: string) {
    await fetch('https://wa.looyal.id/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            number: from,
            message: message,
            type: 'chat',
            to: to
        })
    })
    return
}

export function sendImageWA(phone: string, message: string, image: string, apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/send_image_url',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
          if(body.status==1005) sendImageWA(phone, message, apiKey, numberKey);
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "api_key": apiKey,
        "number_key": numberKey,
        "phone_no": phone,
        "message": message,
        "url": image
      });
      
      req.write(postData);
      
      req.end();
}

export async function sendImageNewWAWithCaption(caption: string, from: string, to: string, url: string) {
    await fetch('https://wa.looyal.id/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            number: from,
            message: caption,
            type: 'imagecapt',
            to: to,
            urlni: url
        })
    })
    return
}

export async function sendVideoNewWAWithCaption(caption: string, from: string, to: string, url: string) {
    await fetch('https://wa.looyal.id/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            number: from,
            message: caption,
            type: 'videocapt',
            to: to,
            urlni: url
        })
    })
    return
}

export async function sendFilePDFNewWAWithCaption(caption: string, from: string, to: string, url: string, filename: string) {
    await fetch('https://wa.looyal.id/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            number: from,
            message: caption,
            type: 'filepdf',
            to: to,
            urlni: url,
            filename: filename
        })
    })
    return
}
export function sendFileWA(phone: string, message: string, image: string, apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/send_file_url',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
          if(body.status==1005) sendFileWA(phone, message, apiKey, numberKey);
          else{
            if(message != "") sendWA(phone, message, apiKey, numberKey);
          } 
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "api_key": apiKey,
        "number_key": numberKey,
        "phone_no": phone,
        "message": message,
        "url": image
      });
      
      req.write(postData);
      
      req.end();
}

export function watzapGetWebhook(apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/get_webhook',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
          console.log(body)
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "api_key": apiKey,
        "number_key": numberKey
      });
      
      req.write(postData);
      
      req.end();
}

export function watzapSetWebhook(apiKey = "V1KQRTC3EMA02MJZ", numberKey = "oqJe6CugDEiCuBNn", endpointUrl = 'https://api-dev.looyal.id/v3/watzap/receive_message'){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/set_webhook',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "api_key": apiKey,
        "number_key": numberKey,
        "endpoint_url": endpointUrl
      });
      
      req.write(postData);
      
      req.end();
}

export function watzapUnsetWebhook(apiKey = "V1KQRTC3EMA02MJZ", numberKey = "s9evtiUy6TD8Z6b8"){
    var options = {
        'method': 'POST',
        'hostname': 'api.watzap.id',
        'path': '/v1/unset_webhook',
        'headers': {
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res: any) {
        var chunks: any = [];
      
        res.once("data", function (chunk: any) {
          chunks.push(chunk);
        });
      
        res.once("end", function (chunk: any) {
          var body: any = Buffer.concat(chunks);
          body = JSON.parse(body);
        });
      
        res.once("error", function (error: any) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "api_key": apiKey,
        "number_key": numberKey
      });
      
      req.write(postData);
      
      req.end();
}

export function hexToString(hexx: string) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export function isBetweenDate({date_check="", date_start, date_end}:{date_check?:string, date_start:string, date_end:string}) : boolean{
    const dateStart = Date.parse(date_start);
    const dateEnd = Date.parse(date_end);

    var dateCheck
    if(dateCheck=="") dateCheck = Date.now()
    else dateCheck = Date.parse(date_check);

    return (dateCheck.valueOf() >= dateStart.valueOf() && dateCheck.valueOf() <= dateEnd.valueOf())
}

export function hashText(text: string, cost: number): string {
    let options = {
        "cost": cost
    }
    return Password.hash(cost+text+cost, "PASSWORD_DEFAULT", options)
}

export function getSelectOptionsFromRequest (req: {body: {keyword?: string, start?: string, limit?: string, order?: string}}) {
    return {
        ...(req.body.keyword && {keyword: req.body.keyword}),
        ...(req.body.start && {start: parseInt(req.body.start)}),
        ...(req.body.limit && {limit: parseInt(req.body.limit)}),
        ...(req.body.order && {order: req.body.order})
    }
}

type checkBodyRequest = {
    success: boolean,
    message: string
}
export function checkBodyRequest({requestBody, requiredKeys}: {requestBody: any, requiredKeys: Array<{key: string, value_type: Array<"string" | "number" | "boolean" | "object">}>}): checkBodyRequest {
    for (let requiredKey of requiredKeys) {
        let validKeyType = false
        if (!requestBody[requiredKey.key]) return {success: false, message: `${requiredKey.key} is not defined`}
        // for (let requiredKeyType of requiredKey.value_type) {
        //     if (typeof(requestBody[requiredKey.key]) === requiredKeyType) {
        //         validKeyType = true
        //         break
        //     }
        // }
        // if (!validKeyType) return {success: false, message: `${requiredKey.key} must be type of ${requiredKey.value_type.map((value, index) => value).toString().replaceAll(',', '|')}`}
    }
    return {success: true, message: "OK"}
}

export function getSortAndFilterQuery(order_by: Array<string>, limit: {value?: number, start?: number}) {
    let query: Partial<{
        order: string,
        limit: string
    }> = {}
    query.order = `ORDER BY ${order_by.map((eachOrder) => {return '\`' + eachOrder + '\`'}).toString()}`
    query.limit = limit.value ? `LIMIT ${limit.start ? `${limit.start}, ` : ''} ${limit.value}` : ``
    return query
}

export function handleJSONRequestBody(keyName: string, data: any, isArray: boolean) {
    let newData: any
    try {
        newData = JSON.parse(data)
    } catch {
        newData = data
    } finally {
        if (isArray && !Array.isArray(newData)) throw new Error(`${keyName} is not an Array`)
        if (typeof(newData) !== 'object') throw new Error(`${keyName} is not an Object`)
    }
    return newData
}

export function prepareBase64ImageUpload(base64string: string) {
    let imageInfo = base64string.split(";base64,")
    let imageExtension = imageInfo[0].replace("data:image/","")
    let imageData = imageInfo[1]
    const imageBuffer = new (Buffer.from as any)(imageData, 'base64')
    const bufferStream = new Stream.PassThrough()
    bufferStream.end(imageBuffer)
    return {
        imageExtension,
        imageData,
        imageToUpload: bufferStream
    }
}

// export function maybank_encrypt(key: string, dat: string, iv: number) {
//     let key = crypto.createHash('')
//     let x = 21312312
// }

type stringTypes = "ascii" | "base64" | "base64url" | "binary" | "hex" | "latin1" | "ucs-2"  | "ucs2" | "utf-8" | "utf16le" | "utf8"
export function convert (from: stringTypes, to: stringTypes) {
    return function(text: string) {
        return Buffer.from(text, from).toString(to)
    }
}

// export async function checkHash({res, connection}: {res: Response, connection: PoolConnection}, {hash}: {hash: string}) {
//     if (hash === "") return false
//     else {
//         let business = 0
//         let resGetUserBusinessByHash = await functionUser.getUserBusinessByHash({res, connection}, {hash})
//         if (resGetUserBusinessByHash) resGetUserBusinessByHash.business

//         if (business === 0) {
            
//         }
//     }
// }