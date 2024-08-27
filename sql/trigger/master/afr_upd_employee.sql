BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_employee
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`v_pin_old` = OLD.`v_pin`,
            `v_name_old` = OLD.`v_name`,
            `v_email_old` = OLD.`v_email`,
            `v_idnumber_old` = OLD.`v_idnumber`,
            `b_gender_old` = OLD.`b_gender`,
            `v_address_old` = OLD.`v_address`,
            `v_phone_old` = OLD.`v_phone`
    ELSE
		INSERT INTO 
            tkd_log.log_employee
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
			`v_pin_old` = OLD.`v_pin`,
            `v_pin_new` = NEW.`v_pin`,
            `v_name_old` = OLD.`v_name`,
            `v_name_new` = NEW.`v_name`,
            `v_email_old` = OLD.`v_email`,
            `v_email_new` = NEW.`v_email`,
            `v_idnumber_old` = OLD.`v_idnumber`,
            `v_idnumber_new` = NEW.`v_idnumber`,
            `b_gender_old` = OLD.`b_gender`,
            `b_gender_new` = NEW.`b_gender`,
            `v_address_old` = OLD.`v_address`,
            `v_address_new` = NEW.`v_address`,
            `v_phone_old` = OLD.`v_phone`,
            `v_phone_new` = NEW.`v_phone`
END