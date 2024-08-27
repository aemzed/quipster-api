BEGIN
    INSERT INTO 
        tkd_log.log_employee
    SET 
        `v_code` = UUID(),
        `i_code` = NEW.`i_code`,
        `fk_business` = NEW.`fk_business`,
        `fk_user` = NEW.`fk_user_modify`,
        `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
        `v_activity` = 'INSERT',
        `v_pin_new` = NEW.`v_pin`,
        `v_name_new` = NEW.`v_name`,
        `v_email_new` = NEW.`v_email`,
        `v_idnumber_new` = NEW.`v_idnumber`,
        `b_gender_new` = NEW.`b_gender`,
        `v_address_new` = NEW.`v_address`,
        `v_phone_new` = NEW.`v_phone`
END