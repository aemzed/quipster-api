import { error } from "console";
import { NextFunction, Request, Response } from "express";

function handleStringObject(data: any) {
    try {
        JSON.parse(data)
    } catch {
        throw error
    }
}

export default function (req: Request, res: Response, next: NextFunction) {
    console.log({requestBody: req.body})
    for (let key of Object.keys(req.body)) {
        if (typeof(req.body[key]) !== 'string') continue
        try  {
            handleStringObject(req.body[key])
        } catch {
            req.body[key] = req.body[key].replaceAll(`'`, `\\'`)
            req.body[key] = req.body[key].replaceAll(`"`, `\\"`)
        }
    }
    next()
}