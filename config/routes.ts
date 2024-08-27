const router = require("express").Router();

import * as absence from "../controller/absence";
import * as absenceType from "../controller/master/absence_type";
import * as account from "../controller/account";
import * as broadcast from "../controller/broadcast";
import * as broadcastContact from "../controller/broadcast_contact";
import * as broadcastPackage from "../controller/broadcast_package";
import * as business from "../controller/business";
import * as cart from "../controller/cart";
import * as category from "../controller/master/category";
import * as customer from "../controller/customer";
import * as employee from "../controller/employee";
import * as material from "../controller/material";
import * as stockopname from "../controller/stockopname";
import * as preferences from "../controller/preferences";
import * as product from "../controller/product";
import * as purchaseorder from "../controller/purchaseorder";
import * as report from "../controller/report";
import * as salesType from "../controller/sales_type";
import * as shift from "../controller/shift";
import * as subscribe from "../controller/subscribe";
import * as stock from "../controller/stock";
import * as system from "../controller/system";
import * as task from "../controller/task";
import * as transaction from "../controller/transaction";
import * as unit from "../controller/master/unit";
import * as util from "../controller/util";
import * as paymentmethod from "../controller/paymentmethod";
import * as expense from "../controller/expense";
import * as price from "../controller/price";
import * as packagee from "../controller/package";
import * as additional from "../controller/master/additional";
import * as promotion from "../controller/promotion";
import * as supplier from "../controller/supplier";

import * as pods from "../controller/pods";
import * as jvape from "../controller/jvape";
import * as crm from "../controller/crm";
import * as watzap from "../controller/watzap";
import * as wooblazz from "../controller/wooblazz";
import * as principle from "../controller/principle";

import * as coba from "../controller/coba";

import verifyToken from "../middleware/verifyToken";

router.post("/v1/account/login", account.login);
router.post("/v1/account/login_owner", account.loginOwner);
router.post("/v3/account/login", account.loginV3);

//====================================== WATZAP ==========================================
router.post("/v3/watzap/send_message", watzap.sendMessage);
router.post("/v3/watzap/receive_message", watzap.receiveMessage);

//=================================== BUSINESS ===========================================
router.post("/v3/business/list", business.list);
router.post("/v3/business/update_expired", business.updateDateExpired);
router.post("/v3/business/setting_dueday", business.insertSettingV3);
router.post("/v3/business/get", business.getV3);
router.post("/v3/business/get_wooblazz", business.getWooblazzV3);
router.post("/v3/business/bind_wooblazz", business.bindWooblazzV3);
router.post("/v3/business/unbind_wooblazz", business.unbindWooblazzV3);
router.post("/v3/business/getBusinessUser", business.selectBusinessV3);
router.post("/v3/business/insertBusinessUser", business.insertBusinessUserV3);
router.post("/v3/business/deleteBusinessUser", business.deleteBusinessUserV3);
router.post("/v3/business/updateBusinessUser", business.updateBusinessUserV3);
router.post("/v3/business/banner_delete", business.bannerDeleteV3);
router.post("/v3/business/banner_update", business.bannerUpdateV3);
router.post("/v3/business/complete", business.completeV3);
router.post("/v3/business/get_branch", business.getBranchV3);
router.post("/v3/business/set_operational_time", business.setOperationalTimeV3);
router.post("/v3/business/set_payment", business.setPaymentV3);
router.post("/v3/business/training", business.trainingV3);
router.post("/v3/business/update", business.updateV3);
router.post("/v3/business/image_update", business.imageUpdateV3);

//=================================== OPERATIONAL ===========================================
router.post("/wa/check", util.checkWhatsapp);
router.post("/v3/task/run", task.run);
//=================================== Promotion ===========================================
router.post("/v3/promotion/select", promotion.selectV3);
router.post("/v3/promotion/delete", promotion.deleteV3);
router.post("/v3/promotion/insert", promotion.insertV3);
//=================================== Price =============================================
router.post("/v3/price/select", price.selectV3);
router.post("/v3/price/update", price.updateV3);
//=================================== Package ===========================================
router.post("/v3/package/select", packagee.oldSelectV3);
router.post("/v3/package/delete", packagee.oldDeleteV3);
router.post("/v3/package/insert", packagee.oldInsertV3);
router.post("/v3/package/update", packagee.oldUpdateV3);
router.post("/v3/package/update_price", packagee.oldUpdatePriceV3);
//=================================== Expense ===========================================
router.post("/v3/expense/select_similar", expense.selectSimilarV3);
router.post("/v3/expense/insert", expense.insertV3);
router.post("/v3/expense/update", expense.updateV3);
router.post("/v3/expense/delete", expense.deleteV3);
//=================================== Payment Method ===========================================
router.post("/v3/payment_method/select", paymentmethod.selectV3);
router.post("/v3/payment_method/select_similar", paymentmethod.selectSimilarV3);
router.post("/v3/payment_method/insert", paymentmethod.insertV3);
router.post("/v3/payment_method/update", paymentmethod.updateV3);
router.post("/v3/payment_method/delete", paymentmethod.deleteV3);
router.post("/v3/payment_method/system", paymentmethod.selectSystemV3);

router.post("/v3/paymentmethod/select", paymentmethod.selectV3);
router.post("/v3/paymentmethod/insert", paymentmethod.insertV3);
router.post("/v3/paymentmethod/update", paymentmethod.updateV3);
router.post("/v3/paymentmethod/delete", paymentmethod.deleteV3);
router.post("/v3/paymentmethod/system", paymentmethod.selectSystemV3);
//=================================== Supplier ===========================================
router.post("/v3/supplier/select", supplier.selectV3);
router.post("/v3/supplier/delete", supplier.deleteV3);
//=================================== CATEGORY ===========================================
// router.post("/v3/category/select_price_member", category.getPriceMemberV3);
// router.post("/v3/category/insert_price_member", category.insertPriceMemberV3);
//================================== PREFERENCES =========================================
router.post("/v3/preferences/select", preferences.selectV3);
router.post("/v3/preferences/insert", preferences.insertV3);
router.post("/v3/preferences/update", preferences.updateV3);
router.post("/v3/preferences/delete", preferences.deleteV3);
//==================================== ABSENCE ===========================================
router.post("/v1/absence/check", absence.checkAbsences);
router.post("/v1/absence/insert", absence.insertAbsence);
router.post("/v3/absence/check", absence.absenceCheckV3);
//==================================== ACCOUNT ===========================================
router.post("/v1/account/checkUser", account.checkUser);
router.post("/v1/account/checkOwner", account.checkOwner);
router.post("/v3/account/logout", account.logoutV3);
//================================== ABSENCE TYPE ========================================
router.post("/v1/absence_type/insert", absenceType.insert);
router.post("/v1/absence_type/select", absenceType.get);
router.post("/v1/absence_type/update", absenceType.update);
router.post("/v1/absence_type/delete", absenceType.del);
//===================================== SHIFT ============================================
router.post("/v3/shift/insert", shift.insertV3);
router.post("/v1/cash/insertcash", shift.insert);
//===================================== REPORT ===========================================
router.post("/v1/report/expensereport", report.getExpense);
router.post("/v1/report/reportstockcomplete", report.getStockComplete);
// router.post('/v1/report/getshift', report.getShiftReport)
router.post("/v1/report/absence", report.getAbsenceReport);
router.post("/v3/report/list_add_on", report.listAddOnV3);
router.post("/v3/report/absence", report.absenceV3);
router.post("/v3/report/category_summary", report.categorySummaryV3);
router.post("/v3/report/commision", report.commisionV3);
router.post("/v3/report/commision_statement", report.commisionStatementV3);
router.post("/v3/report/customer_history_item", report.customerHistoryItemV3);
router.post(
  "/v3/report/customer_history_transaction",
  report.customerHistoryTransactionV3
);
router.post(
  "/v3/report/customer_history_item_group",
  report.customerHistoryItemGroupV3
);
router.post("/v3/report/daily_sales", report.dailySalesV3);
router.post("/v3/report/day", report.dayV3);
router.post("/v3/report/discount", report.discountV3);
router.post("/v3/report/expense", report.expenseV3);
router.post("/v3/report/hour", report.hourV3);
router.post("/v3/report/hourly_sales", report.hourlySalesV3);
router.post("/v3/report/invoice", report.invoiceV3);
router.post("/v3/report/invoice_detail", report.invoiceDetailV3);
router.post("/v3/report/invoice_history", report.invoiceHistoryV3);
router.post("/v3/report/invoice_paid", report.invoicePaidV3);
router.post("/v3/report/price_item", report.priceItemV3);
router.post("/v3/report/price_material", report.priceMaterialV3);
router.post("/v3/report/profit_sharing", report.profitSharingV3);
router.post("/v3/report/profit_sharing_detail", report.profitSharingDetailV3);
router.post("/v3/report/purchase_order_detail", report.purchaseOrderDetailV3);
router.post("/v3/report/purchase_order_summary", report.purchaseOrderSummaryV3);
router.post("/v3/report/receive", report.receiveV3);
router.post("/v3/report/revenue", report.revenueV3);
router.post("/v3/report/sales", report.salesV3);
router.post("/v3/report/sales_complete", report.salesCompleteV3);
router.post(
  "/v3/report/sales_product_by_customer",
  report.salesProductByCustomerV3
);
router.post("/v3/report/sales_superselling", report.salesSuperSellingV3);
router.post("/v3/report/stock_consolidation", report.stockConsolidationV3);
router.post(
  "/v3/report/stock_consolidation_business",
  report.stockConsolidationBusinessV3
);
router.post("/v3/report/shift_detail", report.shiftDetailV3);
router.post("/v3/report/sales_additional", report.salesAdditionalV3);
router.post("/v3/report/sales_customer", report.salesCustomerV3);
router.post("/v3/report/sales_customer_product", report.salesCustomerProductV3);
router.post("/v3/report/sales_customer_detail", report.salesCustomerDetailV3);
router.post("/v3/report/sales_detail", report.salesDetailV3);
router.post("/v3/report/sales_product", report.salesProductV3);
router.post("/v3/report/sales_product_simple", report.salesProductSimpleV3);
router.post("/v3/report/sales_product_detail", report.salesProductDetailV3);
router.post(
  "/v3/report/sales_product_detail_receipt",
  report.salesProductDetailReceiptV3
);
router.post("/v3/report/sales_product_hpp", report.salesProductHPPV3);
router.post("/v3/report/shift", report.shiftV3);
router.post("/v3/report/shift_detail", report.shiftDetailV3);
router.post("/v3/report/statement_qris", report.statementQrisV3);
router.post("/v3/report/stock", report.stock);
router.post("/v3/report/stock_moving_header", report.stockMovingHeaderV3);
router.post("/v3/report/stock_moving_detail", report.stockMovingDetailV3);
router.post("/v3/report/stock_adjustment", report.stockAdjustmentV3);
router.post("/v3/report/stock_opname", report.stockOpnameV3);
router.post("/v3/report/stock_opname_detail", report.stockOpnameDetailV3);
router.post(
  "/v3/report/stock_opname_ignore_detail",
  report.stockOpnameIgnoreDetailV3
);
router.post("/v3/report/summary", report.summaryV3);
router.post("/v3/report/transfer_stock_detail", report.transferStockDetailV3);
router.post("/v3/report/transfer_stock_summary", report.transferStockSummaryV3);
router.post("/v3/report/get_today_report", report.getTodayReportV3);
router.post("/v3/report/ticket_sales", report.ticketSalesV3);
router.post(
  "/v3/report/getExpenseOperationalToday",
  report.selectReportExpenseTodayV3
);

// ================================== OPERATIONAL EXPENSE =================================
router.post(
  "/v3/expenseoperational/delete",
  expense.deleteOperationalExpenseV3
);

//=================================== TRANSACTION ========================================
router.post("/v3/transaction/get", transaction.get);
router.post("/v3/transaction/checkin", transaction.checkin);
router.post("/v1/transaction/insert", transaction.saveTransaction);
//======================================= CART ===========================================
router.post("/v1/cart/save", cart.saveCart);
router.post("/v1/cart/get", cart.getOpenCart);
router.post("/v3/cart/select", cart.selectV3);
router.post("/v3/cart/save", cart.saveV3);
router.post("/v3/cart/void_detail", cart.voidDetailV3);
//===================================== CUSTOMER =========================================
router.post("/v1/customer/get", customer.get);
router.post("/v3/customer/select", customer.selectV3);
router.post(
  "/v3/customer/get_pods_customer_count",
  customer.getPodsCustomerCount
);
router.post(
  "/v3/customer/get_pods_customer_list",
  customer.getPodsCustomerList
);
router.post("/v3/customer/get_point", customer.getPointV3);
router.post("/v3/customer/select_mobile", customer.selectMobileV3);
router.post("/v3/customer/insert", customer.insertV3);
router.post("/v3/customer/show_code", customer.showCodeV3);
router.post("/v3/customer/update", customer.updateCustomerV3);
//===================================== EMPLOYEE =========================================
router.post("/v1/employee/get", employee.get);
router.post("/v1/employee/insert", employee.insert);
router.post("/v1/employee/update", employee.update);
router.post("/v1/employee/remove", employee.remove);
router.post("/v3/employee/select", employee.selectV3);
router.post("/v3/employee/insert", employee.insertV3);
router.post("/v3/employee/update", employee.updateV3);
router.post("/v3/employee/delete", employee.deleteV3);
//===================================== MATERIAL =========================================
router.post("/v1/material/select", material.select);
router.post("/v1/material/addstock", material.addStock);
router.post("/v3/material/add_stock", material.addStockV3);
//================================== PURCHASE ORDER ======================================
router.post("/v3/purchase_order/select", purchaseorder.selectV3);
router.post("/v3/purchase_order/detail", purchaseorder.detailV3);
router.post("/v3/purchase_order/insert", purchaseorder.insertV3);
router.post("/v3/purchase_order/update", purchaseorder.updateV3);
router.post("/v3/purchase_order/delete", purchaseorder.deleteV3);
router.post("/v3/purchase_order/confirm", purchaseorder.confirmV3);
router.post("/v3/purchase_order/item_material", purchaseorder.itemMaterialV3);
router.post("/v3/purchase_order/paid", purchaseorder.paidV3);
router.post("/v3/purchase_order/void", purchaseorder.voidV3);
router.post("/v3/purchase_order/adjust_price", purchaseorder.adjustPriceV3);
//================================== SALES TYPE ==========================================
router.post("/v3/sales_type/select", salesType.selectV3);
router.post("/v3/sales_type/insert", salesType.insertV3);
router.post("/v3/sales_type/update", salesType.updateV3);
router.post("/v3/sales_type/delete", salesType.deleteV3);
router.post("/v3/salestype/select", salesType.selectV3);
router.post("/v3/salestype/insert", salesType.insertV3);
router.post("/v3/salestype/update", salesType.updateV3);
router.post("/v3/salestype/delete", salesType.deleteV3);
//=================================== SUBSCRIBE ==========================================
router.post("/v3/subscribe/check", subscribe.checkV3);
//=================================== PRODUCT ============================================
router.post("/v3/product/add_stock", product.addStockV3);
router.post("/v3/product/delete", product.deleteV3);
router.post("/v3/product/formula_process", product.formulaProcessV3);
router.post("/v3/product/insert", product.insertV3);
router.post("/v3/product/update", product.updateV3);
router.post("/v3/product/select", product.selectV3);
router.post("/v3/product/select_similar", product.selectSimilarV3);
router.post("/v3/product/update_commission", product.updateCommissionV3);
router.post("/v3/product/update_image", product.updateImageV3);
router.post("/v3/product/update_image_new", product.updateImageNewV3);
router.post("/v3/product/update_price", product.updatePriceV3);

//====================================== PODS ===========================================
router.post("/pods/generate_otp", pods.generateOtp);
router.post("/pods/get_refferal_user", pods.getRefferalUser);
router.post("/pods/login", pods.login);
router.post("/pods/profile", pods.profile);
router.post("/pods/profile/update", pods.updateProfile);
router.post("/pods/point/get", pods.getPoints);
router.post("/pods/user/voucher", pods.getUserVoucher);
router.post("/pods/notification", pods.getNotification);
router.post("/pods/banner", pods.getBanner);
router.post("/pods/voucher", pods.getVoucher);
router.post("/pods/redeem_point", pods.redeemPoint);
router.post("/pods/buy_voucher", pods.buyVoucher);
router.post("/pods/get_member", pods.getMember);
router.post("/pods/update_refferal_code", pods.updateRefferalCode);
router.post("/pods/update_refferal_point", pods.updateRefferalPoint);
//====================================== JVAPE ===========================================
router.post("/jvape/variable", jvape.getVariable);
router.post("/jvape/generate_otp", jvape.generateOtp);
router.post("/jvape/login", jvape.login);
router.post("/jvape/profile", jvape.profile);
router.post("/jvape/profile/update", jvape.updateProfile);
router.post("/jvape/point/get", jvape.getPoints);
router.post("/jvape/user/voucher", jvape.getUserVoucher);
router.post("/jvape/notification", jvape.getNotification);
router.post("/jvape/banner", jvape.getBanner);
router.post("/jvape/store", jvape.getStore);
router.post("/jvape/product", jvape.getProduct);
router.post("/jvape/productByKeyword", jvape.getProductByKeyword);
router.post("/jvape/voucher", jvape.getVoucher);
router.post("/jvape/history", jvape.getHistory);
router.post("/jvape/history_detail", jvape.getHistoryDetail);
router.post("/jvape/redeem_point", jvape.redeemPoint);
router.post("/jvape/buy_voucher", jvape.buyVoucher);
//====================================== CRM ===========================================
router.post("/crm/variable", crm.getVariable);
router.post("/crm/generate_otp", crm.generateOtp);
router.post("/crm/qrcode", crm.generateBarcode);
router.post("/crm/history_qrcode", crm.getHistoryQrCode);
router.post("/crm/login", crm.login);
router.post("/crm/insert_point", crm.insertPointFromApps);
router.post("/crm/delete_point_pending", crm.deletePointPendingAfterScanDiscountApps);
router.post("/crm/history_point", crm.getHistoryPoint);
router.post("/crm/scan_discount", crm.getDiscountAfterScan);
router.post("/crm/update_qr_code", crm.updateQRAfterPaid);
router.post("/crm/insert_point_crm", crm.insertPointFromCRM);
router.post("/crm/update_point", crm.updatePointAfterScanCode);
router.post("/crm/get_point_pending", crm.getPointPending);
router.post("/crm/update_point_pending", crm.updateStatusPointPending);
// router.post('/crm/update_point_test', crm.updatePointLoyalty);
router.post("/crm/profile", crm.profile);
router.post("/crm/profile/update", crm.updateProfile);
router.post("/crm/point/get", crm.getPoints);
router.post("/crm/user/voucher", crm.getUserVoucher);
router.post("/crm/notification", crm.getNotification);
router.post("/crm/banner", crm.getBanner);
router.post("/crm/store", crm.getStore);
router.post("/crm/product", crm.getProduct);
router.post("/crm/productByKeyword", crm.getProductByKeyword);
router.post("/crm/voucher", crm.getVoucher);
router.post("/crm/history", crm.getHistory);
router.post("/crm/history_detail", crm.getHistoryDetail);
router.post("/crm/redeem_point", crm.redeemPoint);
router.post("/crm/buy_voucher", crm.buyVoucher);
router.post("/crm/quipster/login", account.loginLoyalty);
//====================================== PRINCIPLE ===========================================
router.post("/principle/login", principle.loginPrinciple);
router.post("/principle/inventory/select", principle.getInventory);
router.post("/principle/item_sku/select", principle.getSKUPrincipal);
router.post("/principle/item_sku/insert", principle.insertSKUPrincipal);
router.post("/principle/inventory/insert", principle.insertInventoryPrincipal);
router.post("/principle/sku/select", principle.getSKUInventoryForQuipster);
router.post("/principle/minipo/insert", principle.insertMiniPO);

//=================================== BROADCAST ==========================================
router.post("/v3/broadcast/send_message", broadcast.sendMessage);
router.post("/v3/broadcast/get", broadcast.get);
router.post("/v3/broadcast/save", broadcast.save);
router.post("/v3/broadcast/save_image", broadcast.saveImage);
router.post("/v3/broadcast/continue", broadcast.continueBroadcast);
router.post("/v3/broadcast/pause", broadcast.pauseBroadcast);
router.post("/v3/broadcast/check_number", broadcast.checkNumber);
router.post("/v3/broadcast/get_user", broadcast.getUser);
router.post("/v3/broadcast/get_otp", broadcast.getOtp);
router.post("/v3/broadcast/submit_otp", broadcast.submitOtp);
router.post("/v3/broadcast/complete_data", broadcast.completeData);
router.post("/v3/broadcast/get_user_package", broadcast.getUserPackage);
router.post("/v3/broadcast/get_user_credit", broadcast.getUserCredit);
router.post(
  "/v3/broadcast/get_transaction_history",
  broadcast.getTransactionHistory
);
router.post("/v3/broadcast/buy_package", broadcast.buyPackage);
router.post("/v3/broadcast/get_list", broadcast.getList);
router.post("/v3/broadcast/insert_list", broadcast.insertList);
router.post("/v3/broadcast/update_list", broadcast.updateList);
router.post("/v3/broadcast/delete_list", broadcast.deleteList);
router.post("/v3/broadcast/update_list_param", broadcast.updateListParam);

//=============================== BROADCAST CONTACT=======================================
router.post("/v3/broadcast/get_contact", broadcastContact.get);
router.post("/v3/broadcast/insert_contact", broadcastContact.insert);
router.post("/v3/broadcast/update_contact", broadcastContact.update);
router.post("/v3/broadcast/delete_contact", broadcastContact.del);
router.post("/v3/broadcast/update_contact_param", broadcastContact.updateParam);

//=============================== BROADCAST PACKAGE ======================================
router.post(
  "/v3/broadcast_package/get_transaction",
  broadcastPackage.getTransaction
);
router.post("/v3/broadcast_package/select", broadcastPackage.get);
router.post("/v3/broadcast_package/insert", broadcastPackage.insert);
router.post("/v3/broadcast_package/update", broadcastPackage.update);
router.post("/v3/broadcast_package/delete", broadcastPackage.del);

//====================================== SYSTEM ==========================================
router.post(
  "/system/location_get_recommendation",
  system.locationGetRecommendation
);
router.post("/v3/system/sales_type", system.salesTypeV3);

//====================================== STOCK ===========================================
router.post("/v3/stock/transfer", stock.transferV3);

//=================================== STOCK OPNAME =======================================
router.post("/v3/stockopname/select", stockopname.selectV3);
router.post("/v3/stockopname/insert", stockopname.insertV3);
router.post("/v3/stockopname/get_detail", stockopname.getDetailV3);
router.post("/v3/stockopname/update_detail", stockopname.updateDetailV3);

//======================================= COBA ===========================================
router.post("/v1/coba/get", coba.get);
router.post("/v1/coba/watzap_unset_webhook", coba.watzapUnsetWebhook);
router.post("/v1/coba/watzap_set_webhook", coba.watzapSetWebhook);
router.post("/v1/coba/watzap_get_webhook", coba.watzapGetWebhook);

//===================================== WOOBLAZZ =========================================
router.post("/v3/wooblazz/connect_new_api", wooblazz.connectNewAPI);
router.post("/v3/wooblazz/disconnect_new_api", wooblazz.disconnectNewAPI);

//=============================== Online Order Chatbot =====================================
router.post("/v3/cart/create_online_order", cart.createOnlineOrder);
router.post("/v3/cart/insert_item_online_order", cart.insertItemOnlineOrder);
router.post("/v3/cart/update_item_online_order", cart.updateItemOnlineOrder);
router.post("/v3/cart/submit_online_order", cart.submitOnlineOrder);
router.post("/v3/cart/get_online_order", cart.getOnlineOrder);

router.use(verifyToken);

//================================== Absence Type ==========================================
router.post("/v3/absence_type/insert", absenceType.insertV3);
router.post("/v3/absence_type/select", absenceType.selectV3);
router.post("/v3/absence_type/update", absenceType.updateV3);
router.post("/v3/absence_type/delete", absenceType.deleteV3);
//===================================== Account ============================================
router.post("/v3/account/check_user", account.checkUserV3);
//==================================== Additional ==========================================
router.post("/v3/additional/select", additional.selectV3);
router.post("/v3/additional/select_similar", additional.selectSimilarV3);
router.post("/v3/additional/insert", additional.insertV3);
router.post("/v3/additional/update", additional.updateV3);
router.post("/v3/additional/delete", additional.deleteV3);
router.post("/v3/additional/update_price", additional.updatePriceV3);
//====================================== Cart ==============================================
router.post("/v3/cart/get", cart.getV3);
//===================================== Category ===========================================
router.post("/v3/category/select", category.getV3);
router.post("/v3/category/select_quipster", category.getQuipsterV3);
router.post("/v3/category/insert", category.insertV3);
router.post("/v3/category/select_similar", category.selectSimilarV3);
router.post("/v3/category/update", category.updateV3);
router.post("/v3/category/delete", category.delV3);
//===================================== Expense ============================================
router.post("/v3/expense/select", expense.selectV3);
router.post("/v3/expense/system", expense.selectSystemV3);
//===================================== Package ============================================
router.post("/v3/package/new_select", packagee.selectV3);
router.post("/v3/package/new_delete", packagee.deleteV3);
router.post("/v3/package/new_insert", packagee.insertV3);
router.post("/v3/package/new_update", packagee.updateV3);
router.post("/v3/package/new_update_price", packagee.updatePriceV3);
//==================================== Promotion ===========================================
router.post("/v3/promotion/get_by_code", promotion.getByCodeV3);
//====================================== Report ============================================
router.post(
  "/v3/report/sales_complete_consolidation",
  report.salesCompleteConsolidationV3
);
//==================================== Transaction =========================================
router.post("/v3/transaction/insert", transaction.insertV3);
router.post("/v3/transaction/update_guest", transaction.updateGuestV3);
//======================================= Unit =============================================
router.post("/v3/unit/delete", unit.deleteV3);
router.post("/v3/unit/insert", unit.insertV3);
router.post("/v3/unit/select", unit.selectV3);
router.post("/v3/unit/select_similar", unit.selectSimilarV3);
router.post("/v3/unit/getSystemUnit", unit.selectSytemUnitV3);
router.post("/v3/unit/get_system_unit", unit.selectSytemUnitV3);
router.post("/v3/unit/update", unit.updateV3);
module.exports = router;
