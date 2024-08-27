import pool from "../config/connect";
import * as errors from "../function/global_function";

import * as typeGlobal from "../type/global";
import * as typeBusiness from "../type/business";

import * as functionGlobal from "../function/global_function";
import * as functionUser from "../function/account/user";
import * as functionBusiness from "../function/account/business";
import * as functionOnline from "../function/setting/online";
import * as functionMode from "../function/setting/mode";
import * as functionBillSetting from "../function/setting/billsetting";
import * as functionBusinessUser from "../function/account/business_user";
import * as functionTraining from "../function/account/training";

import { response, Response } from "express";
import drive from "../config/drive";
import { Stream } from "stream";
import { error } from "console";
import { stringify } from "querystring";
const uniqid = require("uniqid");
// const fs = require('fs')
const sha1 = require("sha1");

export async function list(
  { body: data }: { body: { name?: string } },
  res: any
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(connection, res, err, "controller/business/list");

    try {
      var results = await functionBusiness.list(
        {
          connection: connection,
          res: res,
        },
        {
          name: data.name,
        }
      );

      res.status(200).json({
        code: 200,
        success: true,
        message: "ok",
        info: {
          total: results.length,
        },
        data: results,
      });
      connection.release();
    } catch (error) {
      connection.release();
      return errors.rollback(connection, res, err, "controller/business/list");
    }
  });
}

type updateDateExpired = {
  body: {
    type: string;
    interval: string;
  };
};
export async function updateDateExpired(
  req: typeGlobal.requestV3 & updateDateExpired,
  res: any
) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(async function (err) {
      if (err) {
        errors.rollback(
          connection,
          res,
          err,
          "controller/business/updateDateExpired"
        );
      } else {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: req.headers["x-auth-token"] });

        var results = await functionBusiness.updateDateExpired(
          {
            connection: connection,
            res: res,
          },
          {
            business: user.business,
            type: parseInt(req.body.type),
            interval: parseInt(req.body.interval),
          }
        );

        connection.commit(function (err) {
          if (err) {
            errors.rollback(
              connection,
              res,
              err,
              "controller/business/updateDateExpired"
            );
          } else {
            res.status(200).json({
              code: 200,
              success: true,
              message: "ok",
            });
            connection.release();
          }
        });
      }
    });
  });
}

export async function getV3(req: typeBusiness.getV3, res: Response) {
  let responseBody = {
    business: 0,
    wooblazz: "",
    name: "",
    ID: "",
    business_type: 0,
    business_name: "",
    business_email: "",
    business_expired: "",
    business_plan: "",
    business_address: "",
    business_phone: "",
    business_state: "",
    business_city: "",
    business_zipcode: "",
    business_operational_hour: "",
    image: "",
    pin_void: "",
    pin_discount: "",
    pin_operational: "",
    tax: 0,
    service_charge: 0,
    rounded_type: 0,
    limit_user: 0,
    module_production: 0,
    module_inventory: 0,
    module_purchase_order: 0,
    module_barcode: 0,
    module_printer: 0,
    module_invoice: 0,
    module_shift: 0,
    module_variant_price: 0,
    module_multi_unit: 0,
    module_customer_loyalty: 0,
    module_whatsapp: 0,
    branch: 0,
    feature_absence: 0,
    feature_broadcast: 0,
    feature_marketplace: 0,
    feature_formula: 0,
    feature_table_management: 0,
    feature_printer_special_laundry: 0,
    feature_printer_special_fnb: 0,
    feature_customer_phone_priority: 0,
    feature_ppn_sc_type: 0,
    feature_price_distributor_automatic: 0,
    feature_sku_important: 0,
    feature_delivery_order: 0,
    feature_receipt_purchase_order: 0,
    feature_nfc_customer: 0,
    feature_relx: 0,
    feature_jvape: 0,
    feature_income: 0,
    feature_commision: 0,
    feature_superselling: 0,
    feature_profit_sharing: 0,
    feature_pos_website: 0,
    feature_monitor_order: 0,
    feature_online_store: 0,
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
    qris_type: 0,
    qris_pending: 0,
    identity: "",
    bank_name: "",
    bank_number: "",
    bank_account: "",
    qris: 0,
    cash: 0,
    online_name: "",
    online_address: "",
    online_postcode: "",
    online_phone: "",
    online_information: "",
    color_primary: "",
    color_text: "",
    shipping_mode: 0,
    shipping_cost: 0,
    latitude: 0,
    longitude: 0,
    city_expedisi: 0,
    expedisi: 0,
    banner: "",
    background_order: "",
    order_online: 0,
    withdraw_qris_avaiable: 0,
    business_owner: "",
    access_master: 0,
    access_production: 0,
    access_inventory: 0,
    access_expense: 0,
    access_relation: 0,
    access_transaction: 0,
    access_transaction_global: 0,
    access_invoice: 0,
    access_operational: 0,
    access_finance: 0,
    access_stock_adjustment: 0,
    feature_auto_retur: 0,
    feature_scan_discount: 0,
  };

  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/getV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let resGetFullBusiness = await functionBusiness.getFullBusiness(
        { res, connection },
        { fk_business: user.business },
        { vw_user: { name: user.name } }
      );

      responseBody.business = resGetFullBusiness.business;
      responseBody.wooblazz = resGetFullBusiness.wooblazz;
      responseBody.name = resGetFullBusiness.name;
      responseBody.ID = resGetFullBusiness.ID;
      responseBody.business_type = resGetFullBusiness.business_type;
      responseBody.business_name = resGetFullBusiness.business_name;
      responseBody.business_email = resGetFullBusiness.business_email;
      responseBody.business_expired = resGetFullBusiness.business_expired;
      responseBody.business_plan = resGetFullBusiness.business_plan;
      responseBody.business_address = resGetFullBusiness.business_address;
      responseBody.business_phone = resGetFullBusiness.business_phone;
      responseBody.business_state = resGetFullBusiness.business_state;
      responseBody.business_city = resGetFullBusiness.business_city;
      responseBody.business_zipcode = resGetFullBusiness.business_zipcode;
      responseBody.business_operational_hour =
        resGetFullBusiness.business_operational_hour;
      responseBody.image = resGetFullBusiness.image;
      responseBody.pin_void = resGetFullBusiness.pin_void;
      responseBody.pin_discount = resGetFullBusiness.pin_discount;
      responseBody.pin_operational = resGetFullBusiness.pin_operational;
      responseBody.tax = resGetFullBusiness.tax;
      responseBody.service_charge = resGetFullBusiness.service_charge;
      responseBody.rounded_type = resGetFullBusiness.rounded_type;
      responseBody.limit_user = resGetFullBusiness.limit_user;
      responseBody.module_production = resGetFullBusiness.module_production;
      responseBody.module_inventory = resGetFullBusiness.module_inventory;
      responseBody.module_purchase_order =
        resGetFullBusiness.module_purchase_order;
      responseBody.module_barcode = resGetFullBusiness.module_barcode;
      responseBody.module_printer = resGetFullBusiness.module_printer;
      responseBody.module_invoice = resGetFullBusiness.module_invoice;
      responseBody.module_shift = resGetFullBusiness.module_shift;
      responseBody.module_variant_price =
        resGetFullBusiness.module_variant_price;
      responseBody.module_multi_unit = resGetFullBusiness.module_multi_unit;
      responseBody.module_customer_loyalty =
        resGetFullBusiness.module_customer_loyalty;
      responseBody.module_whatsapp = resGetFullBusiness.module_whatsapp;
      responseBody.branch = resGetFullBusiness.branch;
      responseBody.feature_absence = resGetFullBusiness.feature_absence;
      responseBody.feature_broadcast = resGetFullBusiness.feature_broadcast;
      responseBody.feature_marketplace = resGetFullBusiness.feature_marketplace;
      responseBody.feature_formula = resGetFullBusiness.feature_formula;
      responseBody.feature_table_management =
        resGetFullBusiness.feature_table_management;
      responseBody.feature_printer_special_laundry =
        resGetFullBusiness.feature_printer_special_laundry;
      responseBody.feature_printer_special_fnb =
        resGetFullBusiness.feature_printer_special_fnb;
      responseBody.feature_customer_phone_priority =
        resGetFullBusiness.feature_customer_phone_priority;
      responseBody.feature_ppn_sc_type = resGetFullBusiness.feature_ppn_sc_type;
      responseBody.feature_price_distributor_automatic =
        resGetFullBusiness.feature_price_distributor_automatic;
      responseBody.feature_sku_important =
        resGetFullBusiness.feature_sku_important;
      responseBody.feature_delivery_order =
        resGetFullBusiness.feature_delivery_order;
      responseBody.feature_receipt_purchase_order =
        resGetFullBusiness.feature_receipt_purchase_order;
      responseBody.feature_nfc_customer =
        resGetFullBusiness.feature_nfc_customer;
      responseBody.feature_relx = resGetFullBusiness.feature_relx;
      responseBody.feature_jvape = resGetFullBusiness.feature_jvape;
      responseBody.feature_income = resGetFullBusiness.feature_income;
      responseBody.feature_commision = resGetFullBusiness.feature_commision;
      responseBody.feature_superselling =
        resGetFullBusiness.feature_superselling;
      responseBody.feature_profit_sharing =
        resGetFullBusiness.feature_profit_sharing;
      responseBody.feature_pos_website = resGetFullBusiness.feature_pos_website;
      responseBody.feature_monitor_order =
        resGetFullBusiness.feature_monitor_order;
      responseBody.feature_online_store =
        resGetFullBusiness.feature_online_store;
      responseBody.monday = resGetFullBusiness.monday;
      responseBody.tuesday = resGetFullBusiness.tuesday;
      responseBody.wednesday = resGetFullBusiness.wednesday;
      responseBody.thursday = resGetFullBusiness.thursday;
      responseBody.friday = resGetFullBusiness.friday;
      responseBody.saturday = resGetFullBusiness.saturday;
      responseBody.sunday = resGetFullBusiness.sunday;
      responseBody.qris_type = resGetFullBusiness.qris_type;
      responseBody.qris_pending = resGetFullBusiness.qris_pending;
      responseBody.identity = resGetFullBusiness.identity;
      responseBody.bank_name = resGetFullBusiness.bank_name;
      responseBody.bank_number = resGetFullBusiness.bank_number;
      responseBody.bank_account = resGetFullBusiness.bank_account;
      responseBody.qris = resGetFullBusiness.qris;
      responseBody.cash = resGetFullBusiness.cash;
      responseBody.online_name = resGetFullBusiness.online_name;
      responseBody.online_address = resGetFullBusiness.online_address;
      responseBody.online_postcode = resGetFullBusiness.online_postcode;
      responseBody.online_phone = resGetFullBusiness.online_phone;
      responseBody.online_information = resGetFullBusiness.online_information;
      responseBody.color_primary = resGetFullBusiness.color_primary;
      responseBody.color_text = resGetFullBusiness.color_text;
      responseBody.shipping_mode = resGetFullBusiness.shipping_mode;
      responseBody.shipping_cost = resGetFullBusiness.shipping_cost;
      responseBody.latitude = resGetFullBusiness.latitude;
      responseBody.longitude = resGetFullBusiness.longitude;
      responseBody.city_expedisi = resGetFullBusiness.city_expedisi;
      responseBody.expedisi = resGetFullBusiness.expedisi;
      responseBody.banner = resGetFullBusiness.banner;
      responseBody.background_order = resGetFullBusiness.background_order;
      responseBody.order_online = resGetFullBusiness.order_online;
      responseBody.withdraw_qris_avaiable =
        resGetFullBusiness.withdraw_qris_avaiable;
      responseBody.business_owner = resGetFullBusiness.business_owner;
      responseBody.feature_auto_retur = resGetFullBusiness.feature_auto_retur;
      responseBody.feature_scan_discount =
        resGetFullBusiness.feature_scan_discount;

      if (resGetFullBusiness) {
        if (user.code === 0) {
          responseBody.access_master = 1;
          responseBody.access_production = 1;
          responseBody.access_inventory = 1;
          responseBody.access_expense = 1;
          responseBody.access_relation = 1;
          responseBody.access_transaction = 1;
          responseBody.access_transaction_global = 1;
          responseBody.access_invoice = 1;
          responseBody.access_operational = 1;
          responseBody.access_finance = 1;
          responseBody.access_stock_adjustment = 1;
        } else {
          let resGetUser = await functionUser.getAccess(
            { res, connection },
            { code: user.code }
          );
          responseBody.access_master = resGetUser.access_master;
          responseBody.access_production = resGetUser.access_production;
          responseBody.access_inventory = resGetUser.access_inventory;
          responseBody.access_expense = resGetUser.access_expense;
          responseBody.access_relation = resGetUser.access_relation;
          responseBody.access_transaction = resGetUser.access_transaction;
          responseBody.access_transaction_global =
            resGetUser.access_transaction_global;
          responseBody.access_invoice = resGetUser.access_invoice;
          responseBody.access_operational = resGetUser.access_operational;
          responseBody.access_finance = resGetUser.access_finance;
          responseBody.access_stock_adjustment =
            resGetUser.access_stock_adjustment;
        }
      }
      return res
        .status(200)
        .json({ success: true, message: "OK", data: responseBody });
    } catch {
      return errors.rollback(connection, res, err, "controller/business/getV3");
    }
  });
}

export async function getWooblazzV3(
  req: typeBusiness.getWooblazzV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/getWooblazzV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let responseBody: Partial<{
        phone: string;
        name: string;
        credits: Array<{
          type: number;
          credit: number;
          credit_full: number;
        }>;
      }> = {};

      let resGetWooblazz = await functionBusiness.getWooblazz(
        { res, connection },
        { i_code: user.business }
      );
      if (!resGetWooblazz)
        return res.status(200).json({
          success: true,
          message: "Woogigs is not connected with any Wooblazz",
        });
      responseBody.name = resGetWooblazz.name;
      responseBody.phone = resGetWooblazz.phone;

      let resGetWooblazzCredits = await functionBusiness.getWooblazzCredits(
        { res, connection },
        { fk_user: resGetWooblazz.bc_user_code }
      );
      responseBody.credits = resGetWooblazzCredits;

      res
        .status(200)
        .json({ success: true, message: "OK", data: responseBody });
      return connection.release();
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/getWooblazzV3"
      );
    }
  });
}

export async function bindWooblazzV3(
  req: typeBusiness.bindWooblazzV3,
  res: Response
) {
  if (!req.body.phone)
    return res.status(400).json({ success: false, message: "Phone required" });
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/wooblazzV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      if (!req.body.force) {
        let resCheckWooblazz = await functionBusiness.getWooblazzConnection(
          { res, connection },
          { fk_business: user.business }
        );
        if (resCheckWooblazz.binded_phone)
          return res.status(400).json({
            success: false,
            message: "Wooblazz already binded with other account.",
          });
      }

      let resSetWooblazz = await functionBusiness.setWooblazzConnection(
        { res, connection },
        { i_code: user.business, fk_wooblazz: req.body.phone }
      );
      if (resSetWooblazz.affectedRows === 0)
        return res
          .status(400)
          .json({ success: false, message: "Business not found." });

      res
        .status(200)
        .json({ success: true, message: "Wooblazz binded successfully" });
      connection.release();
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/bindWooblazzV3"
      );
    }
  });
}

export async function unbindWooblazzV3(
  req: typeBusiness.unbindWooblazzV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/unbindWooblazzV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let resUnsetWooblazz = await functionBusiness.unsetWooblazzConnection(
        { res, connection },
        { i_code: user.business }
      );
      if (!resUnsetWooblazz.affectedRows)
        return res
          .status(400)
          .json({ success: false, message: "Business not found." });
      if (!resUnsetWooblazz.changedRows)
        return res.status(400).json({
          success: false,
          message: "Business is not bound with any Wooblazz",
        });

      res.status(200).json({ success: true, message: "Woogigs unbound" });
      connection.release();
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/unbindWooblazzV3"
      );
    }
  });
}

export async function selectBusinessV3(
  req: typeBusiness.selectBusinessV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/selectBusinessV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });
      let whereadditionals = "AND b_isowner = 0";
      if (req.body.manager == "0") whereadditionals = "";
      let resGetBusinessUser = await functionBusiness.getBusinessUser(
        { res, connection },
        { fk_business: user.business, whereadditional: whereadditionals }
      );

      res
        .status(200)
        .json({ success: true, message: "Found", data: resGetBusinessUser });
      connection.release();
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/selectBusinessV3"
      );
    }
  });
}

export async function insertBusinessUserV3(
  req: typeBusiness.insertBusinessUserV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/unit/insertBusinessUserV3/getConnection"
      );
    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      connection.beginTransaction(async function (err) {
        if (err)
          return errors.rollback(
            connection,
            res,
            err,
            "controller/unit/insertBusinessUserV3/beginTransaction"
          );
        let resGetUsername = await functionBusiness.selectUsername(
          { res, connection },
          { fk_business: user.business, email: req.body.username }
        );
        if (resGetUsername.length > 0)
          return res
            .status(200)
            .json({ success: true, message: `Data Already`, data: [] });
        let resInsertBusinessUser = await functionBusiness.insertBusinessUser(
          { res, connection },
          {
            fk_business: user.business,
            name: req.body.name,
            startorder: req.body.startorder,
            username: req.body.username,
            password: req.body.password,
            manager: req.body.manager,
            master: req.body.master,
            production: req.body.production,
            inventory: req.body.inventory,
            expense: 0,
            finance: req.body.finance,
            relation: req.body.relation,
            transaction: req.body.transaction,
            globaltransaction: req.body.globaltransaction,
            communityads: req.body.communityads,
            operational: req.body.operational,
            invoice: req.body.invoice,
          }
        );

        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/unit/insertBusinessUserV3/commit"
            );
          return res.status(200).json({
            success: true,
            message: `Data Added`,
            data: resInsertBusinessUser,
          });
        });
      });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/unit/insertBusinessUserV3"
      );
    }
  });
}

export async function deleteBusinessUserV3(
  req: typeBusiness.deleteBusinessUserV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/package/deleteBusinessUserV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      connection.beginTransaction(async function (err) {
        if (err)
          return errors.rollback(
            connection,
            res,
            err,
            "controller/package/deleteBusinessUserV3/beginTransaction"
          );
        let resDeleteBusinessUser = await functionBusiness.removeBusinessUser(
          { res, connection },
          { code: parseFloat(req.body.code), fk_business: user.business }
        );
        if (resDeleteBusinessUser.affectedRows! < 1)
          return res
            .status(400)
            .json({ success: false, message: "Data not found" });
        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/package/deleteBusinessUserV3/commit"
            );
          return res.status(200).json({
            success: true,
            message: "OK",
            data: resDeleteBusinessUser,
          });
        });
      });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/package/deleteBusinessUserV3"
      );
    }
  });
}

export async function updateBusinessUserV3(
  req: typeBusiness.updateBusinessUserV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/unit/updateBusinessUserV3/getConnection"
      );
    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      connection.beginTransaction(async function (err) {
        if (err)
          return errors.rollback(
            connection,
            res,
            err,
            "controller/unit/updateBusinessUserV3/beginTransaction"
          );
        if (req.body.password == "") {
          let updateBusinessUserWithoutPassword =
            await functionBusiness.updateBusinessUserWithoutPassword(
              { res, connection },
              {
                fk_business: user.business,
                code: parseFloat(req.body.code),
                name: req.body.name,
                startorder: req.body.startorder,
                username: req.body.username,
                manager: req.body.manager,
                master: req.body.master,
                production: req.body.production,
                inventory: req.body.inventory,
                expense: 0,
                finance: req.body.finance,
                relation: req.body.relation,
                transaction: req.body.transaction,
                globaltransaction: req.body.globaltransaction,
                invoice: req.body.invoice,
                communityads: req.body.communityads,
                operational: req.body.operational,
              }
            );
          if (updateBusinessUserWithoutPassword.affectedRows! < 1)
            return res
              .status(400)
              .json({ success: false, message: "Data not found" });
        } else {
          let updateBusinessUserWithPassword =
            await functionBusiness.updateBusinessUserWithPassword(
              { res, connection },
              {
                fk_business: user.business,
                code: parseFloat(req.body.code),
                username: req.body.username,
                password: sha1(req.body.password),
                manager: req.body.manager,
                master: req.body.master,
                production: req.body.production,
                inventory: req.body.inventory,
                expense: 0,
                finance: req.body.finance,
                relation: req.body.relation,
                transaction: req.body.transaction,
                globaltransaction: req.body.globaltransaction,
                invoice: req.body.invoice,
                communityads: req.body.communityads,
                operational: req.body.operational,
              }
            );
          if (updateBusinessUserWithPassword.affectedRows! < 1)
            return res
              .status(400)
              .json({ success: false, message: "Data not found" });
        }
        let isowner = "0";
        let businessowner = "0";
        let resGetOwner = await functionBusiness.selectOwnerBusiness(
          { res, connection },
          { fk_business: user.business, code: parseFloat(req.body.code) }
        );
        if (!resGetOwner.businessowner) {
          isowner = resGetOwner.isowner;
          businessowner = resGetOwner.businessowner;
          if (isowner == "1") {
            let updatePasswordBusinessOwner =
              await functionBusiness.updatePasswordBusinessOwner(
                { res, connection },
                {
                  fk_business: user.business,
                  username: req.body.username,
                  password: req.body.password,
                  businessowner: businessowner,
                }
              );
            if (updatePasswordBusinessOwner.affectedRows! < 1)
              return res
                .status(400)
                .json({ success: false, message: "Data not found" });
            let updatePasswordOwner =
              await functionBusiness.updatePasswordOwner(
                { res, connection },
                {
                  fk_business: user.business,
                  username: req.body.username,
                  password: req.body.password,
                  businessowner: businessowner,
                }
              );
            if (updatePasswordOwner.affectedRows! < 1)
              return res
                .status(400)
                .json({ success: false, message: "Data not found" });
          }
          let updatePasswordUser = await functionBusiness.updatePasswordUser(
            { res, connection },
            {
              fk_business: user.business,
              username: req.body.username,
              password: req.body.password,
              businessowner: businessowner,
            }
          );
          if (updatePasswordUser.affectedRows! < 1)
            return res
              .status(400)
              .json({ success: false, message: "Data not found" });
        }
        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/unit/updateBusinessUserV3/commit"
            );
          return res
            .status(200)
            .json({ success: true, message: `Data Added`, data: [] });
        });
      });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/unit/updateBusinessUserV3"
      );
    }
  });
}

export async function bannerDeleteV3(
  req: typeBusiness.bannerDeleteV3,
  res: Response
) {
  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/bannerDeleteV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/bannerDeleteV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        await functionOnline.removeBanner(
          { res, connection },
          { fk_business: user.business }
        );
        const responseList = await drive.files.list({
          q: "'1qPi3H-Tm-YARta_b8NmQ9H1oMMflPdPx' in parents",
        });
        responseList.data.files?.forEach(async function (file) {
          if (file.name?.split(".")[0] === user.business.toString()) {
            if (file.id)
              await drive.files.delete({
                fileId: file.id,
              });
          }
        });
        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/bannerDeleteV3/commit"
            );

          return res
            .status(200)
            .json({ success: true, message: "Banner deleted." });
        });
      } catch {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/bannerDeleteV3"
        );
      }
    });
  });
}

export async function bannerUpdateV3(
  req: typeBusiness.bannerUpdateV3,
  res: Response
) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["banner"]);
      let requestBody = {
        banner: req.body.banner,
      };
      errors.checkNaN(requestBody);
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/bannerUpdateV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/bannerUpdateV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        let requestBody = convertBody()!;
        if (res.headersSent) return;
        let responseBody: any = {};

        let resOnlineGet = await functionOnline.singleGet(
          { res, connection },
          { fk_business: user.business }
        );
        if (requestBody.banner === "")
          return res
            .status(400)
            .json({ success: false, message: "Please fill banner property." });
        const responseList = await drive.files.list({
          q: "'1qPi3H-Tm-YARta_b8NmQ9H1oMMflPdPx' in parents",
        });
        responseList.data.files?.forEach(async function (file) {
          if (file.name?.split(".")[0] === user.business.toString()) {
            if (file.id)
              await drive.files.delete({
                fileId: file.id,
              });
          }
        });
        if (req.body.banner) {
          let imageInfo = req.body.banner.split(";base64,");
          let imageExtension = imageInfo[0].replace("data:image/", "");
          let imageData = imageInfo[1];
          const imageBuffer = new (Buffer.from as any)(imageData, "base64");
          const bufferStream = new Stream.PassThrough();
          bufferStream.end(imageBuffer);

          const responseInsert = await drive.files.create({
            requestBody: {
              name: user.business.toString(),
              mimeType: "image/" + imageExtension,
              parents: ["1qPi3H-Tm-YARta_b8NmQ9H1oMMflPdPx"],
            },
            media: {
              mimeType: "image/" + imageExtension,
              body: bufferStream,
            },
          });
          await functionOnline.updateImage(
            { res, connection },
            {
              fk_business: user.business,
              v_banner: `https://drive.google.com/uc?export=view&id=${responseInsert.data.id}`,
            }
          );
        } else {
          await functionOnline.updateImage(
            { res, connection },
            { fk_business: user.business, v_banner: `` }
          );
        }

        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/bannerUpdateV3"
            );

          return res
            .status(200)
            .json({ success: true, message: "Banner updated." });
        });
      } catch (err) {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/bannerUpdateV3"
        );
      }
    });
  });
}

export function completeV3(req: typeBusiness.completeV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["address", "phone", "state", "city"]);
      let requestBody = {
        address: <string>req.body.address,
        phone: <string>req.body.phone,
        state: <string>req.body.state,
        city: <string>req.body.city,
      };
      errors.checkNaN(requestBody);
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/completeV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/completeV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        let requestBody = convertBody()!;
        if (res.headersSent) return;
        let responseBody: any;

        await functionBusiness.updateAddressPhoneStateCity(
          { res, connection },
          {
            fk_business: user.business,
            v_address: requestBody.address,
            v_city: requestBody.city,
            v_phone: requestBody.phone,
            v_state: requestBody.state,
          }
        );
        await functionBillSetting.updateHeaders(
          { res, connection },
          {
            fk_business: user.business,
            v_header2: requestBody.address,
            v_header3: requestBody.city,
            v_header4: requestBody.phone,
          }
        );

        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/completeV3/commit"
            );

          return res
            .status(200)
            .json({ success: true, message: "Data updated successfully." });
        });
      } catch {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/completeV3"
        );
      }
    });
  });
}

export function getBranchV3(req: typeBusiness.getBranchV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["source"]);
      let requestBody = {
        source: req.body.source,
      };
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/getBranchV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let requestBody = convertBody()!;
      if (res.headersSent) return;
      let responseBody: any[] = [];

      if (user.special === 0) {
        let resOwner = await functionBusiness.getBusinessowner(
          { res, connection },
          { fk_business: user.business }
        );
        if (!resOwner.code)
          res.status(200).json({ success: true, message: "No Data." });
        responseBody = await functionUser.getBusinessBranch(
          { res, connection },
          { fk_business_owner: resOwner.code, v_email: user.email }
        );
        if (responseBody.length > 0) {
          for (let eachBody of responseBody) {
            let token = "";
            if (requestBody.source === "APPLICATION") {
              token = eachBody.token_mobile;
              if (token === "") {
                token = uniqid();
                await functionUser.updateHash(
                  { res, connection },
                  { i_code: eachBody.code, v_hash: token }
                );
              }
            } else if (requestBody.source === "BACKOFFICE") {
              token = eachBody.token_backoffice;
              if (token === "") {
                token = uniqid();
                await functionUser.updateBackofficeToken(
                  { res, connection },
                  { i_code: eachBody.code, token: token }
                );
              }
            }
            eachBody.token = token;
            delete eachBody.token_backoffice, delete eachBody.token_mobile;
          }
          connection.commit(function (err) {
            if (err)
              return errors.rollback(
                connection,
                res,
                err,
                "controller/business/getBranchV3/commit1"
              );

            return res
              .status(200)
              .json({ success: true, message: "OK", data: responseBody });
          });
          return;
        }
        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/getBranchV3/commit2"
            );

          return res.status(200).json({ success: true, message: "No data." });
        });
        return;
      } else {
        let responseBody = await functionBusinessUser.getBusinessBranchSpecial(
          { res, connection },
          { fk_user: user.code }
        );
        if (responseBody.length > 0) {
          for (let eachBody of responseBody) {
            let token = eachBody.token;
            if (token === "") {
              token = uniqid();
              await functionBusinessUser.updateToken(
                { res, connection },
                {
                  fk_business: user.business,
                  fk_user: user.code,
                  v_token: token,
                }
              );
            }

            eachBody.token = token;
          }
          connection.commit(function (err) {
            if (err)
              return errors.rollback(
                connection,
                res,
                err,
                "controller/business/getBranchV3/commit3"
              );

            return res
              .status(200)
              .json({ success: true, message: "OK", data: responseBody });
          });
          return;
        } else {
          connection.commit(function (err) {
            if (err)
              return errors.rollback(
                connection,
                res,
                err,
                "controller/business/getBranchV3/commit4"
              );

            return res.status(200).json({ success: true, message: "No data." });
          });
          return;
        }
      }
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/getBranchV3"
      );
    }
  });
}

export function setOnlineV3(req: typeBusiness.setOnlineV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, [
        "name",
        "address",
        "phone",
        "information",
        "color_primary",
        "color_text",
      ]);
      let requestBody = {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        information: req.body.information,
        colorPrimary: req.body.color_primary,
        colorText: req.body.color_text,
      };
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/setOnlineV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setOnlineV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        let requestBody = convertBody()!;
        if (res.headersSent) return;

        let resGetOnline = await functionOnline.singleGet(
          { res, connection },
          { fk_business: user.business }
        );
        if (resGetOnline) {
          await functionOnline.update(
            { res, connection },
            {
              fk_business: user.business,
              v_address: requestBody.address,
              v_color_background: requestBody.colorPrimary,
              v_color_text: requestBody.colorText,
              v_information: requestBody.information,
              v_name: requestBody.name,
              v_phone: requestBody.phone,
            }
          );
        } else {
          await functionOnline.insert(
            { res, connection },
            {
              fk_business: user.business,
              v_address: requestBody.address,
              v_color_background: requestBody.colorPrimary,
              v_color_text: requestBody.colorText,
              v_information: requestBody.information,
              v_name: requestBody.name,
              v_phone: requestBody.phone,
            }
          );
        }

        connection.commit((err) => {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/setOnlineV3/commit"
            );

          return res.status(200).json({ success: true, message: "OK" });
        });
      } catch {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setOnlineV3"
        );
      }
    });
  });
}

export function setOperationalTimeV3(
  req: typeBusiness.setOperationalTimeV3,
  res: Response
) {
  function convertBody() {
    try {
      errors.checkField(req.body, [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ]);
      let requestBody = {
        sunday: req.body.sunday,
        monday: req.body.monday,
        tuesday: req.body.tuesday,
        wednesday: req.body.wednesday,
        thursday: req.body.thursday,
        friday: req.body.friday,
        saturday: req.body.saturday,
      };
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(async (err, connection) => {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/setOperationalTimeV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setOperationalTimeV3"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res.status(401).json({
            success: false,
            message: "controller/business/setOperationalTimeV3",
          });

        let requestBody = convertBody()!;
        if (res.headersSent) return;

        let resGetOnline = await functionOnline.select(
          { res, connection },
          { fk_business: user.business }
        );
        if (resGetOnline) {
          await functionOnline.updateOperationalTime(
            { res, connection },
            {
              fk_business: user.business,
              v_sunday: requestBody.sunday,
              v_monday: requestBody.monday,
              v_tuesday: requestBody.tuesday,
              v_wednesday: requestBody.wednesday,
              v_thursday: requestBody.thursday,
              v_friday: requestBody.friday,
              v_saturday: requestBody.saturday,
            }
          );
        } else {
          await functionOnline.insertOperationalTime(
            { res, connection },
            {
              fk_business: user.business,
              v_friday: requestBody.friday,
              v_monday: requestBody.monday,
              v_saturday: requestBody.saturday,
              v_sunday: requestBody.sunday,
              v_thursday: requestBody.thursday,
              v_tuesday: requestBody.tuesday,
              v_wednesday: requestBody.wednesday,
            }
          );
        }

        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/setOperationalTimeV3/commit"
            );

          return res
            .status(200)
            .json({ success: true, message: "Operational time set." });
        });
      } catch {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setOperationalTimeV3"
        );
      }
    });
  });
}

export function setPaymentV3(req: typeBusiness.setPaymentV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["order_online", "qris", "cashier"]);
      let requestBody = {
        order_online: parseInt(req.body.order_online),
        qris: parseInt(req.body.qris),
        cashier: parseInt(req.body.cashier),
      };
      errors.checkNaN(requestBody);
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: true, message: err.message });
    }
  }

  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/setPaymentV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setPaymentV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        let requestBody = convertBody()!;
        if (res.headersSent) return;

        let resSelectMode = await functionMode.select(
          { res, connection },
          { fk_business: user.business }
        );
        if (resSelectMode) {
          await functionMode.updateOrderOnlineQrisManual(
            { res, connection },
            {
              fk_business: user.business,
              b_manual: requestBody.cashier,
              b_order_online: requestBody.order_online,
              b_qris: requestBody.qris,
            }
          );
        } else {
          await functionMode.insert(
            { res, connection },
            {
              b_manual: requestBody.cashier,
              b_order_online: requestBody.order_online,
              b_qris: requestBody.qris,
              fk_business: user.business,
            }
          );
        }

        connection.commit(function (err) {
          if (err)
            return errors.rollback(
              connection,
              res,
              err,
              "controller/business/setPaymentV3/commit"
            );

          return res
            .status(200)
            .json({ success: true, message: "Payment set." });
        });
      } catch (err) {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/setPaymentV3"
        );
      }
    });
  });
}

export function trainingV3(req: typeBusiness.trainingV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["phone", "notes", "date"]);
      let requestBody = {
        phone: req.body.phone,
        notes: req.body.notes,
        date: req.body.date,
      };
      errors.checkNaN(requestBody);
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/trainingV3"
      );

    let user = await functionUser.checkToken(
      { res, connection },
      { hash: req.headers["x-auth-token"] }
    );
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Credential not valid." });

    let requestBody = convertBody()!;
    if (res.headersSent) return;

    await functionTraining.insert(
      { res, connection },
      {
        dt_appointment: requestBody.date,
        fk_business: user.business,
        v_business_name: user.business_name,
        v_name: user.name,
        v_notes: requestBody.notes,
        v_phone: requestBody.phone,
      }
    );
    return res.status(200).json({
      success: true,
      message: "Training is scheduled, you will be confirmed soon.",
    });
  });
}

export function updateV3(req: typeBusiness.updateV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, [
        "name",
        "email",
        "address",
        "phone",
        "city",
        "state",
        "tax",
        "service_charge",
        "use_pin_void",
        "pin_void",
        "use_pin_discount",
        "pin_discount",
        "use_pin_po",
        "pin_po",
      ]);
      let requestBody = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        city: req.body.city,
        state: req.body.state,
        tax: parseFloat(req.body.tax),
        serviceCharge: parseFloat(req.body.service_charge),
        usePinVoid: req.body.use_pin_void,
        pinVoid: req.body.pin_void,
        usePinDiscount: req.body.use_pin_discount,
        pinDiscount: req.body.pin_discount,
        usePinPo: req.body.use_pin_po,
        pinPo: req.body.pin_po,
        openingHours: req.body.opening_hours ?? "00:00-00:00",
      };
      errors.checkNaN(requestBody);
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/updateV3/getConnection"
      );

    connection.beginTransaction(async function (err) {
      if (err)
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/updateV3/beginTransaction"
        );

      try {
        let user = await functionUser.checkToken(
          { res, connection },
          { hash: req.headers["x-auth-token"] }
        );
        if (!user)
          return res
            .status(401)
            .json({ success: false, message: "Credential not valid." });

        let requestBody = convertBody()!;
        if (res.headersSent) return;

        await functionBusiness.update(
          { res, connection },
          {
            b_pindiscount: requestBody.pinDiscount,
            b_pinpo: requestBody.pinPo,
            b_pinvoid: requestBody.pinVoid,
            i_code: user.business,
            i_servicecharge: requestBody.serviceCharge,
            i_tax: requestBody.tax,
            v_address: requestBody.address,
            v_city: requestBody.city,
            v_email: requestBody.email,
            v_name: requestBody.name,
            v_openinghours: requestBody.openingHours,
            v_phone: requestBody.phone,
            v_pindiscount: requestBody.pinDiscount,
            v_pinpo: requestBody.pinPo,
            v_pinvoid: requestBody.pinVoid,
            v_state: requestBody.state,
          }
        );

        return res
          .status(200)
          .json({ success: true, message: "Business updated." });
      } catch {
        return errors.rollback(
          connection,
          res,
          err,
          "controller/business/updateV3"
        );
      }
    });
  });
}

export function imageUpdateV3(req: typeBusiness.imageUpdateV3, res: Response) {
  function convertBody() {
    try {
      errors.checkField(req.body, ["image"]);
      let requestBody = {
        image: req.body.image,
      };
      return requestBody;
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/imageUpdateV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let requestBody = convertBody()!;
      if (res.headersSent) return;

      let image = functionGlobal.prepareBase64ImageUpload(requestBody.image);

      let resGetImages = await drive.files.list({
        q: `'1QFnQkr6rQ3P1Ybouu5Uk-sMdXzRVh2DV' in parents`,
      });
      for (let eachImage of resGetImages.data.files ?? []) {
        if (eachImage.name?.toString() === user.business.toString()) {
          if (eachImage.id)
            await drive.files.delete({
              fileId: eachImage.id,
            });
        }
      }
      let resImageUpload = await drive.files.create({
        requestBody: {
          name: user.business.toString(),
          mimeType: "image/" + image.imageExtension,
          parents: ["1QFnQkr6rQ3P1Ybouu5Uk-sMdXzRVh2DV"],
        },
        media: {
          mimeType: "image/" + image.imageExtension,
          body: image.imageExtension,
        },
      });
      // await functionBusiness.updateImage({res, connection}, {i_code: user.business, v_image: `https://drive.google.com/uc?export=view&id=${resImageUpload.data.id}&sz=w200-h200`})
      return res.status(200).json({
        success: true,
        message: "Updated business image successfully.",
      });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/imageUpdateV3"
      );
    }
  });
}

export function deleteImageV3(req: typeBusiness.deleteImageV3, res: Response) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/deleteImageV3/getConnection"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      // await functionBusiness.softDeleteImage({res, connection}, {i_code: user.business})
      return res.status(200).json({
        success: true,
        message: "Deleted business image successfully.",
      });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/business/deleteImageV3"
      );
    }
  });
}

export async function insertSettingV3(
  req: typeBusiness.insertSettingV3,
  res: Response
) {
  pool.getConnection(async function (err, connection) {
    if (err)
      return errors.rollback(
        connection,
        res,
        err,
        "controller/sales_type/insertSettingV3"
      );

    try {
      let user = await functionUser.checkToken(
        { res, connection },
        { hash: req.headers["x-auth-token"] }
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Credential not valid." });

      let resUpdateSetting = await functionBusiness.updateSetting(
        { res, connection },
        {
          fk_business: user.business,
          setting_dueday: req.body.dueday_setting,
          dueday: req.body.dueday,
        }
      );
      return res.status(200).json({ success: true, message: "Data updated." });
    } catch {
      return errors.rollback(
        connection,
        res,
        err,
        "controller/sales_type/insertSettingV3"
      );
    }
  });
}
