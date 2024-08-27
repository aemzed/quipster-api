import { NextFunction, Request, Response } from "express"
import moment from "moment"

export default function (req: Request, res: Response, next: NextFunction) {
    if (req.body.date_start && req.body.date_end) {
        if ((moment(req.body.date_end).diff(moment(req.body.date_start), 'days')) > 365) return res.status(400).json({success: false, message: 'Date parameter out of range.'})
    }
    next()
}