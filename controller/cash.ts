import pool from '../config/connect'
import * as errors from '../function/global_function'

import * as typeGlobal from '../type/global'

import * as functionBusiness from '../function/account/business'
import * as functionCash from '../function/operational/cash'
import * as functionExpense from '../function/operational/expense'
import * as functionGlobal from '../function/global_function'
import * as functionUser from '../function/account/user'
import { Response } from 'express'

type insertCash = typeGlobal.requestV3 & {
    body: {
        type: string,
        value: string,
        notes?: string,
        date: string
    }
}