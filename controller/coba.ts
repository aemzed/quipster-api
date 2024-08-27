import { Request, Response } from "express"
import { type } from "os"
import pool from "../config/connect"

import * as functionGlobal from "../function/global_function"

export async function get(req: Request, res: Response) {
    pool.getConnection(function (err, connection) {
        functionGlobal.sendWA('6285755470947', 'Halo')
        return res.status(200).json({success: true, message: 'Message sent.'})
    })
}

export async function watzapSetWebhook(req: Request, res: Response) {
    functionGlobal.watzapSetWebhook(req.body.api_key, req.body.number_key, req.body.endpoint_url);
    res.status(200).json({
        message: "ok"
    })
}

export async function watzapUnsetWebhook(req: Request, res: Response) {
    functionGlobal.watzapUnsetWebhook();
    res.status(200).json({
        message: "ok"
    })
}

export async function watzapGetWebhook(req: Request, res: Response) {
    functionGlobal.watzapGetWebhook(req.body.api_key, req.body.number_key);
    res.status(200).json({
        message: "ok"
    })
}

type watzapEndpointWebhook = Omit<Request, 'body'> & {body: {
    type: 'incoming_chat',
    data: {
        number_key: string,
        chat_id: string,
        message_id: string,
        name: string,
        profile_picture: string,
        timestamp: {
            low: number,
            high: number,
            unsigned: boolean
        },
        message_body: string,
        message_ack: 'PENDING' | 'SERVER_ACK',
        has_media: boolean,
        media_mime: string,
        media_name: string,
        location_attached: {
            lat?: number,
            lng?: number
        },
        is_forwarding: boolean,
        is_from_me: true
    }
}}
export async function watzapEndpointWebhook(req: Request, res: Response) {
    if (req.body.data.name === '6285755470947') {
    }
}