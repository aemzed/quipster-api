import * as typeGlobal from "./global"

export type selectV3 = typeGlobal.requestV3

export type updateV3 = typeGlobal.requestV3 & {
    body: {
        price_2: string,
        use_price_2: string,
        type_2: string,
        automatic_2: string,
        use2: string,
        name2: string,
        
        price_3: string,
        use_price_3: string,
        type_3: string,
        automatic_3: string,
        use3: string,
        name3: string,
        
        price_4: string,
        use_price_4: string,
        type_4: string,
        automatic_4: string,
        use4: string,
        name4: string,
        
        price_5: string,
        use_price_5: string,
        type_5: string,
        automatic_5: string,
        use5: string,
        name5: string,
        
    }
}