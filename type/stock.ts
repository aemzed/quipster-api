import * as typeGlobal from './global'

export type transferV3 = typeGlobal.requestV3 & {
    body: {
        business_destination: any,
        item_material: any,
        item_material_destination: any,
        type: any,
        qty: any,
        notes: any
    }
}