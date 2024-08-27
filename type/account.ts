import * as typeGlobal from "./global"

export type checkUser = {
    body: {
        hash?: string,
        now?: string
    }
}

export type checkOwner = {
    body: {
        hash: string
    }
}

export type login = {
    body: {
        username: string,
        password: string,
        businessCode: string,
        application?: string,
        sdk?: string,
        android?: string,
        idsmartphone?: string,
        smartphone?: string,
        now?: string,
        firebaseToken?: string,
        apps_name: string
    }
}

export type logoutV3 = typeGlobal.requestV3

export type loginV3 = {
    body: {
        business_code: any,
        username: any,
        password: any,
        version_woogigs?: any,
        version_mobile?: any,
        imei?: any,
        smartphone?: any,
        now?: any,
        firebase_token?: any,
        source?: any,
        browser?: any
    }
}

export type loginLoyalty = {
    body: {
        username: any,
        password: any,
        phone?: any
    }
}
