BEGIN
    INSERT INTO 
        tkd_log.log_purchaseorder
    SET 
        `v_code` = UUID(),
        `i_code` = NEW.`i_code`,
        `fk_business` = NEW.`fk_business`,
        `fk_user` = NEW.`fk_user_modify`,
        `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
        `v_activity` = 'INSERT',
        `fk_supplier_new` = NEW.`fk_supplier`,
        `v_receipt_new` = NEW.`v_receipt`,
        `i_price_new` = NEW.`i_price`,
        `i_price_adjusted_new` = NEW.`i_price_adjusted`,
        `i_tax_new` = NEW.`i_tax`,
        `i_tax_adjusted_new` = NEW.`i_tax_adjusted`,
        `i_discount_new` = NEW.`i_discount`,
        `i_discount_adjusted_new` = NEW.`i_discount_adjusted`,
        `i_pricenet_new` = NEW.`i_pricenet`,
        `i_pricenet_adjusted_new` = NEW.`i_pricenet_adjusted`,
        `i_extracharge_new` = NEW.`i_extracharge`,
        `dt_order_new` = NEW.`dt_order`,
        `dt_paid_new` = NEW.`dt_paid`,
        `dt_received_new` = NEW.`dt_received`,
        `b_ispaid_new` = NEW.`b_ispaid`,
        `b_isconfirm_new` = NEW.`b_isconfirm`,
        `v_notes_new` = NEW.`v_notes`
END