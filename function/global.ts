import { Request, Response } from "express"

export async function globalHandler(APIRoute: string, req: Request, res: Response, handler: () => Promise<unknown>) {
    try {
        await handler()
    } catch (error: any) {
        if (error.httpResponse) res.status(error.httpResponse.code).json(error.httpResponse)
        else res.status(500).json({success: false, message: "Terjadi kesalahan pada sistem."})
        delete error.httpResponse
        if (Object.keys(error).length > 0 || Object.getOwnPropertyNames(error).length > 0) {
            console.log(`==========ERROR OCCURED IN ${APIRoute}=========`)
            for (let key of Object.getOwnPropertyNames(error)) console.log(key + ': ' + error[key])
            console.log(`==========THIS IS THE REQUEST BODY =========`)
            console.log(req.body)
            console.log(`===============================================`)
        }
    }
}