import * as typeGlobal from "./global";

export type features = {
  ppn_sc_type: number;
  monitor_order: number;
  business_duplicate: number;
  max_duplicate: number;
  laundry: number;
  whatsapp_transaction: number;
  whatsapp_shift: number;
  whatsapp_absence: number;
};

export type getV3 = typeGlobal.requestV3;

export type getWooblazzV3 = typeGlobal.requestV3;
export type bindWooblazzV3 = typeGlobal.requestV3 & {
  body: {
    phone: string;
    force: boolean;
  };
};

export type unbindWooblazzV3 = typeGlobal.requestV3;

export type selectBusinessV3 = typeGlobal.requestV3 & {
  body: {
    manager: string;
  };
};

export type insertBusinessUserV3 = typeGlobal.requestV3 & {
  body: {
    name: string;
    startorder: number;
    username: string;
    password: string;
    manager: number;
    master: number;
    production: number;
    inventory: number;
    expense: number;
    finance: number;
    relation: number;
    transaction: number;
    globaltransaction: number;
    communityads: number;
    operational: number;
    invoice: number;
  };
};

export type deleteBusinessUserV3 = typeGlobal.requestV3 & {
  body: {
    code: string;
  };
};

export type updateBusinessUserV3 = typeGlobal.requestV3 & {
  body: {
    name: string;
    startorder: number;
    username: string;
    password: string;
    manager: number;
    master: number;
    production: number;
    inventory: number;
    expense: number;
    finance: number;
    relation: number;
    transaction: number;
    globaltransaction: number;
    communityads: number;
    operational: number;
    invoice: number;
    businessowner: number;
    code: string;
  };
};

export type bannerDeleteV3 = typeGlobal.requestV3;

export type bannerUpdateV3 = typeGlobal.requestV3 & {
  body: {
    banner: any;
  };
};

export type completeV3 = typeGlobal.requestV3 & {
  body: {
    address: any;
    phone: any;
    state: any;
    city: any;
  };
};

export type getBranchV3 = typeGlobal.requestV3 & {
  body: {
    source: any;
  };
};

export type imageUpdateV3 = typeGlobal.requestV3 & {
  body: {
    image: any;
  };
};

export type setOnlineV3 = typeGlobal.requestV3 & {
  body: {
    name: any;
    address: any;
    phone: any;
    information: any;
    color_primary: any;
    color_text: any;
  };
};

export type setOperationalTimeV3 = typeGlobal.requestV3 & {
  body: {
    sunday: any;
    monday: any;
    tuesday: any;
    wednesday: any;
    thursday: any;
    friday: any;
    saturday: any;
  };
};

export type setPaymentV3 = typeGlobal.requestV3 & {
  body: {
    order_online: any;
    qris: any;
    cashier: any;
  };
};

export type trainingV3 = typeGlobal.requestV3 & {
  body: {
    phone: any;
    notes: any;
    date: any;
  };
};

export type updateV3 = typeGlobal.requestV3 & {
  body: {
    name: any;
    email: any;
    address: any;
    phone: any;
    city: any;
    state: any;
    tax: any;
    service_charge: any;
    use_pin_void: any;
    pin_void: any;
    use_pin_discount: any;
    pin_discount: any;
    use_pin_po: any;
    pin_po: any;
    opening_hours?: any;
  };
};

export type deleteImageV3 = typeGlobal.requestV3;

export type insertSettingV3 = typeGlobal.requestV3 & {
  body: {
    dueday: number;
    dueday_setting: number;
  };
};
