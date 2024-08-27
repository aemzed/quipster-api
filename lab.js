// let crypto = require('crypto')
// const { MD5 } = require('crypto-js')
// let CryptoJS = require('crypto-js')
// let md5 = require('md5')
// const { unescape } = require('querystring')

//======================================================================Mecoba Enkripsi Dekripsi QRIS=========================================================================
// const iv = '16'
// const message = "1616"
// const key = '123456'
// const testing = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key), {
//     iv: CryptoJS.enc.Utf8.parse(iv),
//     padding: CryptoJS.pad.Pkcs7,
//     mode: CryptoJS.mode.CBC
// })
// const bufferText = Buffer.from(testing.toString(), 'utf8')
// console.log(bufferText.toString('hex'))

// let key = CryptoJS.enc.Hex.parse(
//     "814591256d331af80bec0fa2bef1123e37e9f181f363af374787e24160275bce"
//   );
//   let iv = CryptoJS.enc.Hex.parse("825b1f7c5f5edd614e8a0a0fef3c9ecf");
//   let ciphertext = CryptoJS.enc.Base64.parse("07KxrSbGIoPCIYh0I16maw==");
//   let encryptedCP = CryptoJS.lib.CipherParams.create({
//     ciphertext: ciphertext,
//     formatter: CryptoJS.format.OpenSSL
//   });
//   let decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, {
//     iv: iv
//   });
//   let decryptedUtf8 = decryptedWA.toString(CryptoJS.enc.Utf8);
// console.log(decryptedUtf8)

// const aesDecrypt = ({ toDecrypt }) => {
//     const decipher = crypto.createDecipheriv('aes-256-cbc', '123456', md5('1231312321'));
//     let decrypted = decipher.update(toDecrypt, 'base64', 'utf8');
//     return decrypted + decipher.final('utf8');
// };

// const aesEncrypt = (toEncrypt) => {
//     const cipher = crypto.createCipheriv('aes-256-cbc', '1234567890123456', '1234567890123456');
//     let encrypted = cipher.update(toEncrypt, 'utf8', 'base64'); // 1st Base64 encoding
//     encrypted += cipher.final('base64'); 
//     return Buffer.from(encrypted, 'utf8').toString('base64'); // 2nd Base64 encoding
// };

// CryptoJS.pad.NoPadding = {pad: function(){}, unpad: function(){}}
// let text = "1616"
// let key = "16"
// let iv = 16

// let encrypted = CryptoJS.AES.encrypt(text, key, {iv: iv, padding: CryptoJS.pad.NoPadding})

// console.log(encrypted.toString())
// const bufferText = Buffer.from(encrypted.toString(), 'utf8')
// console.log((bufferText.toString('hex')).toUpperCase())

//type stringTypes = "ascii" | "base64" | "base64url" | "binary" | "hex" | "latin1" | "ucs-2"  | "ucs2" | "utf-8" | "utf16le" | "utf8"

// function convert (from, to) {
//     return function(text) {
//         return Buffer.from(text, from).toString(to)
//     }
// }

//===================================================================

// CryptoJS.pad.NoPadding = {pad: function(){}, unpad: function(){}}
// let text = "123456HelloWorld"
// let key = "123456"
// let iv = 16
// let encrypted = CryptoJS.AES.encrypt(text, key, {iv: "c74d97b01eae257e44aa9d5bade97baf", padding: CryptoJS.pad.NoPadding})

// let funcHexToStr = convert('hex', 'ascii')
// console.log(encrypted.toString())
// const bufferText = Buffer.from(encrypted.toString(), 'utf8')
// let strToHex = bufferText.toString('hex').toUpperCase()
// console.log(strToHex)
// console.log(funcHexToStr(strToHex))

//===================================================================

// let CryptoJSAesJson = {
//     stringify: function (cipherParams) {
//         var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
//         if (cipherParams.iv) j.iv = cipherParams.iv.toString();
//         if (cipherParams.salt) j.s = cipherParams.salt.toString();
//         return JSON.stringify(j);
//     },
//     parse: function (jsonStr) {
//         var j = JSON.parse(jsonStr);
//         var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
//         if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
//         if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
//         return cipherParams;
//     }
// }
// CryptoJS.pad.NoPadding = {pad: function(){}, unpad: function(){}}
// let text = "8E62860E6282E930905BC0F8E4C95EF13CA5C3FD07272ED4E4C83080BCEAB9266D73F41BD552A76D3A48AD7824764F827880BDDBD311AB8896B7038370B215331C044D18D13EBFFC7EA2223A44151A3FA7AA090ACC776C7A6DE725209803F3A31E8CE68042528F6B80882E99A8789259BC9663588D95A17F484A35972F6C1C81"
// let funcHexToStr = convert('hex','ascii')
// let funcHexToBin = convert('hex', 'binary')
// // text = funcHexToStr(text)
// // console.log(text)
// let key = "123456"
// let iv = 16
// let decrypted = CryptoJS.AES.decrypt(text, "6a4f3a5be91ffa3ef36551b4b32e756802bc0952845f354c173818a294f268ca" , {iv: "c74d97b01eae257e44aa9d5bade97baf"})
// console.log(decryapted.toString(CryptoJS.enc.Utf8))

// ==========================================================================

// let rawtext = '8E62860E6282E930905BC0F8E4C95EF13CA5C3FD07272ED4E4C83080BCEAB9266D73F41BD552A76D3A48AD7824764F827880BDDBD311AB8896B7038370B215331C044D18D13EBFFC7EA2223A44151A3FA7AA090ACC776C7A6DE725209803F3A31E8CE68042528F6B80882E99A8789259BC9663588D95A17F484A35972F6C1C81'
// let rawkey = '6a4f3a5be91ffa3ef36551b4b32e756802bc0952845f354c173818a294f268ca'
// let rawiv = 'c74d97b01eae257e44aa9d5bade97baf'

// let ciphertext = CryptoJS.enc.Hex.parse(rawtext)
// let key = CryptoJS.enc.Utf8.parse(rawkey)
// console.log({key})
// let iv = CryptoJS.enc.Utf8.parse(rawiv)
// console.log({iv})
// let cipertextCP = {ciphertext: ciphertext}

// let decrypted = CryptoJS.AES.decrypt(
//     cipertextCP,
//     key,
//     {iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC}
// )

// console.log(decrypted.toString())
// =============================================================================================================================================================================

// let name
// if (!name || name.sembarang === "richard") console.log("Heello ga si")
// console.log("Ha")

// console.log(Math.floor(Date.parse("2022-09-26") / 1000))

// async function run(timeout){
//     let ret = new Promise(async(resolve,reject)=>{
//       setTimeout(() => {
//             if (!ret.isResolved){
//                 reject();
//             }
//         }, timeout);

//       await new Promise((resolve, reject) => setTimeout(() => {console.log("Resolved"), resolve()}, 2000)).catch(() => console.log("Error"));
//       resolve();
//     });
//     return ret;
// }
// run(1000).then(() => console.log("Hello")).catch("Error");

//==================================================================
// async function testing () {
//     await (() => setTimeout(() => console.log("satu"), 3000))
//     console.log('dua')
// }

// testing()

// let array = ['richard', 'yusril', 'fauzan', 'everyone']
// function terserah() {
//     for (let element of array) {
//         console.log(element)
//         if (element === 'yusril')
//         return ("ok")
//     }
// }

// console.log(terserah())

// let item = {
//     name : "Nasi Goreng",
//     additional: [
//         {
//             name: "Ayam",
//             qty: 1
//         },
//         {
//             name: "Telor",
//             qty: 2
//         }
//     ],
//     promotion: [
//         {
//             name: "Discount 10 November",
//             value: "20000"
//         }
//     ]
// }

// let stringitem = JSON.stringify(item)
// console.log(stringitem)
// let parseditem = JSON.parse(stringitem)
// console.log(parseditem)

// let json = [{
//     "code": 13274,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 2.0000,
//     "price": 25000.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13275,
//     "price": 25000.00,
//     "qty": 1.0000,
//     "preferences": "",
//     "isvoid": 0,
//     "dt_void": "0000-00-00 00:00:00",
//     "void_by": "",
//     "void_reason": "",
//     "isprinted": 1,
//     "ispaid": 0,
//     "ispackage": 0,
//     "unit": 712,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13275,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 2.0000,
//     "price": 25000.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13275,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 25000.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13275,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 2.0000,
//     "price": 25000.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13275,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 25000.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13283,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 38000.00,
//     "i_pricenet": 15225.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13297,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 52000.00,
//     "i_pricenet": 19845.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [
//             {
//                 "code": 14,
//                 "price": 5000.00,
//                 "qty": 1.00,
//             }
//         ],
//     "promotion": []
// },
// {
//     "code": 13304,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 45000.00,
//     "i_pricenet": 14999.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13312,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 58000.00,
//     "i_pricenet": 19793.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13312,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 58000.00,
//     "i_pricenet": 19793.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13318,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 89000.00,
//     "i_pricenet": 27038.00,
//     "preferences": "weldann",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13320,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 58000.00,
//     "i_pricenet": 17456.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13320,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 2.0000,
//     "price": 58000.00,
//     "i_pricenet": 17456.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 13459,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 38000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17914,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 30000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17916,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 30000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17917,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 30000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17917,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 30000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17919,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 30000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 17931,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 35000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// },
// {
//     "code": 18068,
//     "unit": 712,
//     "ispackage": 0,
//     "qty": 1.0000,
//     "price": 38000.00,
//     "i_pricenet": 0.00,
//     "preferences": "",
//     "isprinted": 1,
//     "void_reason": "",
//     "void_by": "",
//     "dt_void": "0000-00-00 00:00:00",
//     "isvoid": 0,
//     "ispaid": 0,
//     "additional": [],
//     "promotion": []
// }]

// console.log(JSON.parse('[{"code":13274,"unit":712,"ispackage":0,"qty":2,"price":25000,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13275,"price":25000,"qty":1,"preferences":"","isvoid":0,"dt_void":"0000-00-00 00:00:00","void_by":"","void_reason":"","isprinted":1,"ispaid":0,"ispackage":0,"unit":712,"additional":[],"promotion":[]},{"code":13275,"unit":712,"ispackage":0,"qty":2,"price":25000,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13275,"unit":712,"ispackage":0,"qty":1,"price":25000,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13275,"unit":712,"ispackage":0,"qty":2,"price":25000,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13275,"unit":712,"ispackage":0,"qty":1,"price":25000,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13283,"unit":712,"ispackage":0,"qty":1,"price":38000,"i_pricenet":15225,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13297,"unit":712,"ispackage":0,"qty":1,"price":52000,"i_pricenet":19845,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[{"code":14,"price":5000,"qty":1}],"promotion":[]},{"code":13304,"unit":712,"ispackage":0,"qty":1,"price":45000,"i_pricenet":14999,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13312,"unit":712,"ispackage":0,"qty":1,"price":58000,"i_pricenet":19793,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13312,"unit":712,"ispackage":0,"qty":1,"price":58000,"i_pricenet":19793,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13318,"unit":712,"ispackage":0,"qty":1,"price":89000,"i_pricenet":27038,"preferences":"weldann","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13320,"unit":712,"ispackage":0,"qty":1,"price":58000,"i_pricenet":17456,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13320,"unit":712,"ispackage":0,"qty":2,"price":58000,"i_pricenet":17456,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":13459,"unit":712,"ispackage":0,"qty":1,"price":38000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17914,"unit":712,"ispackage":0,"qty":1,"price":30000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17916,"unit":712,"ispackage":0,"qty":1,"price":30000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17917,"unit":712,"ispackage":0,"qty":1,"price":30000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17917,"unit":712,"ispackage":0,"qty":1,"price":30000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17919,"unit":712,"ispackage":0,"qty":1,"price":30000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":17931,"unit":712,"ispackage":0,"qty":1,"price":35000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]},{"code":18068,"unit":712,"ispackage":0,"qty":1,"price":38000,"i_pricenet":0,"preferences":"","isprinted":1,"void_reason":"","void_by":"","dt_void":"0000-00-00 00:00:00","isvoid":0,"ispaid":0,"additional":[],"promotion":[]}]'))
// let jsonPromotion = [{
//     "code": 286,
//     "value": 5400.00,
//     "type": 2
// }]
// console.log({promotion : JSON.stringify(jsonPromotion)})

// let jsonPayment = [{
// 			"i_code": 4,
// 			"fk_business": 1061,
// 			"fk_cart": 364,
// 			"fk_paymentmethod": 1260,
// 			"v_email": null,
// 			"v_reference": null,
// 			"i_paidmoney": 349999.00,
// 			"v_information": ""
// 		}]
// console.log({payment : JSON.stringify(jsonPayment)})
// var data = [{
//     "item_material_code": 55520,
//     "item_material_type": 1,
//     "qty": 1.00,
//     "price": 1000.00,
//     "discount_type": 2,
//     "notes": ""
// },
// {
//     "item_material_code": 84388,
//     "item_material_type": 1,
//     "qty": 1.00,
//     "price": 10000.00,
//     "discount_type": 1,
//     "notes": ""
// }];
// console.log(JSON.stringify(data))

// let json = '[{"item_material_type":1,"item_material_code":"574967","qty":"12","price":"5000","discount_type":"1","discount_value":"","notes":""}]'

// console.log(JSON.parse(json))

// function functionRandom() {
//     throw new Error("Pesan tidak diterima")
// }
// let req = {name: "richard"}
// try {
//     functionRandom()
// } catch(err) {
//     console.log(err.message)
// }

// console.log("Hahaha")

// console.log("Richard itu tampan sekali".indexOf("sad"))

// console.log({asd: JSON.stringify("1")})

// ["SPPEPPERMINT", "SPGUAVA", "SPROOTBREW", "SINGLEPODTARO", "SPBANFREEZE", "SPDS", "SPLIMESPARKLE", "SPLI", "SPMANGO", "SPMX", "SPOS", "SPSB", "SPTG", "SPWI", "SILICONECASErelx", "RXPP-SPT", "RXPP-STB", "VUSE001", "VUSE003", "VUSE002", "VUSE006", "VUSE009", "VUSE007", "VUSE008", "VUSE005", "VUSE004", "VUSE012", "VUSE015", "VUSE013", "VUSE014", "VUSE011", "VUSE010", "RXPP-WTM"].map((sku) => {
//     console.log(
// `
// IFNULL((
//     SELECT SUM(a.i_qty)
//     FROM dvw_operational.vw_stockreport a
//     RIGHT JOIN dvw_master.vw_item b ON a.b_type = 1 AND a.fk_itemmaterial = b.i_code AND b.b_isactive = 1 AND b.v_code = '${sku}'
//     WHERE a.fk_business = aa.i_code
//     AND a.b_isactive = 1
//     ), '-') AS \`${sku}\`,
// `
//     )
// })

// console.log( undefined ?? 11 ?? 23)
// console.log(Boolean({}))
// function testing({start, limit} = {start: 2}) {
//     console.log({start, limit})
// }

// testing({limit: 2})


// const emoji = Buffer.from('ðŸ˜²').toString(16); // The string ðŸ˜²
// const codePoint = emoji.charCodeAt(0); // Get the Unicode code point of the first character

// console.log(emoji)


// const emojiCodePoint = '0x1F602'; // Alternatively, you can store this as an integer: const emojiCodePoint = 0x1F602;
// const emoji = String.fromCodePoint(parseInt(emojiCodePoint, 16));
// console.log(emoji);

// let array =  [[   
//                      { "firstName" : "John",  
//                        "lastName"  : "Doe",
//                        "age"       : 23 },

//                      { "firstName" : "Mary",  
//                        "lastName"  : "Smith",
//                         "age"      : 32 }
//                  ],[ 
//                      { "firstName" : "Sally", 
//                        "lastName"  : "Green",
//                         "age"      : 27 },

//                      { "firstName" : "Jim",   
//                        "lastName"  : "Galley",
//                        "age"       : 41 }
//                  ] 
//                 ]

// console.log(JSON.parse(array))

// console.log(JSON.stringify(array))
// console.log("\n==================Pembatas===============\n")
// console.log(JSON.parse(JSON.stringify(array)))
// console.log("\n==================Pembatas===============\n")
// array.accounting = JSON.stringify(array.accounting)
// array.sales = JSON.stringify(array.sales)
// console.log(JSON.stringify(array))
// console.log("\n==================Pembatas===============\n")
// console.log(JSON.parse(JSON.stringify(array)))

// function ubahnama(data) {
//     console.log("Changed from " + data['nama'] + " To abbigu")
//     data['nama'] = 'abbigu'
// }
// function olahdata(data) {
//     ubahnama(data)
// }

// let mahasiswa = {
//     nama: "Richard",
//     umur: "17",
//     hobi: "Memancing, Makan, Minum"
// }
// olahdata(mahasiswa)
// console.log(mahasiswa)

// let text = "I am Richard's body"
// console.log(text.replaceAll(`'`, `\\'`))

// array = ['richard', 'asmarakandi', 'hengky']
// for (let eachElement of array) {
//     console.log(eachElement)
//     if (eachElement === 'asmarakandi')
//     return 'Masuk'
// }

// console.log(undefined == null)

// let responseBody = [
//     {
//         name: "Richard",
//         class: 23
//     },
//     {
//         name: "Hengky",
//         class: 33
//     }
// ]

// for (let eachBody of responseBody) {
//     eachBody.class = 55
// }

// console.log(responseBody)

// let items = [
//     {id: 38083},
//     {id: 104913},
//     {id: 191819},
//     {id: 230983}
// ]
// let items2 = [
//     {id: 3123213}
// ]
// let itemsunion = items.concat(items2)
// console.log(itemsunion)

// ====================================================================
// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// })

// async function finalSession() {
//     return new Promise(async (resolve, reject) => {
//         let timer = setTimeout(() => reject('Session closed'), 3000)

//         function resetTimeout() {
            
//         }
//     })
// }
// async function buySession() {
//     return new Promise(async (resolve, reject) => {
//         let timer = setTimeout(() => reject('Session closed'), 3000)

//         function resetTimeout() {
//             clearTimeout(timer)
//             timer = setTimeout(() => reject('Session closed', 3000))
//         }
        
//         let inputItem = await new Promise((resolve, reject) => {
//             readline.question(`Item apa yang ingin anda beli?\n1. Terong\n2. Telur\n3. Gajah\n`, async (item) => {
//                 if (item === '1') {
//                     let result = await new Promise((resolve, reject) => {
//                         clearTimeout(timer)
//                         console.log("Sedang membuatkan pesanan...");
//                         setTimeout(() => resolve('Pesanan berhasil diproses'), 3000)
//                     });
//                     console.log(result);
//                 }
//                 if (item === '2') {
//                     let result = await new Promise((resolve, reject) => {console.log("Sedang membuatkan pesanan...");setTimeout(() => resolve('Pesanan sedang diantarkan!. Terima kasih telah berbelanja'), 3000)});
//                     await 
//                 }
//                 if (item === '3') {
//                     let result = await new Promise((resolve, reject) => {console.log("Sedang membuatkan pesanan...");setTimeout(() => resolve('Pesanan sedang diantarkan!. Terima kasih telah berbelanja'), 3000)});
//                     console.log(result);
//                 }
//                 if (item === '4') {
//                     let result = await new Promise((resolve, reject) => {console.log("Sedang membuatkan pesanan...");setTimeout(() => resolve('Pesanan sedang diantarkan!. Terima kasih telah berbelanja'), 3000)});
//                     console.log(result);
//                 }
//                 if (item === '5') {
//                     let result = await new Promise((resolve, reject) => {console.log("Sedang membuatkan pesanan...");setTimeout(() => resolve('Pesanan sedang diantarkan!. Terima kasih telah berbelanja'), 3000)});
//                     console.log(result);
//                 }
//             })
//         })
//     })
// }

// async function sessionStart(name) {
//     return new Promise(async (resolve, reject) => {
//         let timer = setTimeout(() => reject('Session closed'), 3000)

//         function resetTimeout() {
//             clearTimeout(timer)
//             timer = setTimeout(() => reject('Session closed'), 3000)
//         }

//         let inputCommand = await new Promise((resolve, reject) => {
//             readline.question(`Halo ${name}, apa yang ingin anda lakukan?\n1. Beli\n2. Cek stok\n3. Komplain\n`, async (command) => {
//                 if (command === '1') {
//                     clearTimeout(timer)
//                     await buySession()
//                 }
//             })
//         })
//     })
// }

// async function initiateSession() {
//     return new Promise(async (resolve, reject) => {
//         let timer = setTimeout(() => reject('Session closed'), 3000)
//         let inputName = await new Promise((resolve, reject) => {
//             readline.question('Boleh tau namamu?\n', answer => {clearTimeout(timer);resolve(answer)})
//         })
//         await sessionStart(inputName)
//     })
// }

// async function main() {
//     try {
//         await initiateSession()
//     } catch (error) {
//         console.log(error)
//     }
// }

// main()
// =================================================================================================

// function transaction(fungsi) {
//     fungsi()
// }

// async function main() {
//     await transaction(async () => {
//         let result = await new Promise((resolve, reject) => {
//             setTimeout(() => resolve("Rujak"), 2000)
//         })
//         console.log(result)
//     })
//     console.log("Tahu")
// }

// // main()
// let x = parseFloat('')
// console.log(x || "Hello")

// let string = `some'thing`
// console.log(string.replaceAll(`'`, `\\'`))

// console.log(0.00 * 0.00 / 0.00)

// var moment = require('moment')
// console.log(moment('2023-03-31 00:01:00').diff(moment('2023-03-01 00:00:01'), 'days'))

// console.log((moment('2019-01-01 00:00:00').diff(moment('2019-12-31 00:00:00'), 'days')))

// async function something() {
//     await new Promise((resolve, reject) => {
//         let user = undefined
//         user.id
//     }).catch(err => {
//         console.log("Masuk sini kah")
//         console.log(err)
//     })
// }

// something()

// let x = 'something'
// console.log(x.split('${split}'))

// let x = [{
//     item_code: 83795,
//     item_qty: 20,
//     unit_code: 60,
//     item_price: 5000,
//     item_preference: 'Hello',
//     item_isVoid: 0,
//     item_voidBy: '',
//     item_dateVoid: '',
//     item_isPrinted: 1,
//     item_type: 1,
//     item_isPaid: 1,
//     item_voidReason: ''
// }, {
//     item_code: 735,
//     item_qty: 10,
//     unit_code: 65,
//     item_price: 7000,
//     item_preference: '',
//     item_isVoid: 1,
//     item_voidBy: 'Me',
//     item_dateVoid: '2023-02-02 14:14:04',
//     item_isPrinted: 1,
//     item_type: 1,
//     item_isPaid: 1,
//     item_voidReason: 'Gapapa, pengen aja'
// }]
// // console.log(JSON.stringify(x))

// let y = [{
//     paymentmethod_code: 365,
//     payment_value: 32000,
//     payment_information: 'Nothing'
// }]
// console.log(JSON.stringify(y))

// const md5 = require('md5')
// const moment = require('moment')
// console.log(md5(moment().format('YYYY-MM-DD HH:mm:ss')).substring(0, 12))
// const qrcode = require('qrcode')

// qrcode.toFile(`./assets/image/chatbottransactionsqrcode/something.png`, 'Encode this text in QR code', {
//     errorCorrectionLevel: 'H'
// }, function(err) {
//     if (err) throw err;
//     console.log('QR code saved!');
// })

console.log(('Aku').length)