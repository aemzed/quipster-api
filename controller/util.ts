import pool from "../config/connect"
import * as errors from "../function/global_function"
import * as functionGlobal from "../function/global_function"
import * as task from '../function/operational/task'

type checkWhatsapp = {
    phone: string
}
export async function checkWhatsapp({body: data}: {body: checkWhatsapp}, res: any) {
    var result = await new Promise(async function(resolve, reject) {
        await functionGlobal.checkWA(data.phone, function(response:any){
            resolve(response);
        });
    })

    res.status(200).json({
        code: 200,
        success: true,
        message: "ok",
        data: result
    })
}