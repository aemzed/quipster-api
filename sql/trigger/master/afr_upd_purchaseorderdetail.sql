BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_purchaseorderdetail
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`i_price_adjusted_old` = OLD.`i_price_adjusted`,
            `dt_adjusted_old` = OLD.`dt_adjusted`,
    ELSE
		INSERT INTO 
            tkd_log.log_purchaseorderdetail
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
            `i_price_adjusted_old` = OLD.`i_price_adjusted`,
            `i_price_adjusted_new` = NEW.`i_price_adjusted`,
            `dt_adjusted_old` = OLD.`dt_adjusted`,
            `dt_adjusted_new` = NEW.`dt_adjusted`
END