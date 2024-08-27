import * as broadcast from "../broadcast/broadcast"
import * as functionGlobal from "../global_function"
import * as typeGlobal from "../../type/global"

export async function savePending({res, connection}: typeGlobal.functions, {type, task_reference}: {type: number, task_reference: string}) {
    return new Promise((resolve, reject) => {
        let query = `   INSERT INTO dvw_system.vw_task_schedule SET
                            v_code = UUID(),
                            b_type = ${type},
                            fk_task = '${task_reference}' `
        functionGlobal.query(query, res, connection, 'function/operational/task/savePending', resolve)
    })
}

export type run = {
    code: string,
    type: number,
    task: string,
    date: string
}
export async function run({res, connection}: typeGlobal.functions) {
    var dataPending:run[] = await new Promise((resolve, reject) => {
        let query = `   SELECT 
                            v_code AS code,
                            b_type AS type,
                            fk_task AS task,
                            dt_created AS date
                        FROM dvw_system.vw_task_schedule a`
        functionGlobal.query(query, res, connection, 'function/operational/task/run', resolve)
    })

    for(var i=0; i<dataPending.length; i++){
        if(dataPending[i].type == 1){
            broadcast.runBroadcast({
                connection: connection,
                res: res
            },{
                code: dataPending[i].task
            })
        }
    }

    return
}