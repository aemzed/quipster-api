BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_package
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`v_name_old` = OLD.`v_name`,
			`b_distributor_old` = OLD.`b_distributor`,
			`i_price_old` = OLD.`i_price`,
			`i_price2_old` = OLD.`i_price2`,
			`i_price3_old` = OLD.`i_price3`,
			`i_price4_old` = OLD.`i_price4`,
			`i_price5_old` = OLD.`i_price5`,
			`i_pricenet_old` = OLD.`i_pricenet`,
			`v_notes_old` = OLD.`v_notes`
    ELSE
		INSERT INTO 
            tkd_log.log_package
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
			`v_name_old` = OLD.`v_name`,
			`v_name_new` = NEW.`v_name`,
			`b_distributor_old` = OLD.`b_distributor`,
			`b_distributor_new` = NEW.`b_distributor`,
			`i_price_old` = OLD.`i_price`,
			`i_price_new` = NEW.`i_price`,
			`i_price2_old` = OLD.`i_price2`,
			`i_price2_new` = NEW.`i_price2`,
			`i_price3_old` = OLD.`i_price3`,
			`i_price3_new` = NEW.`i_price3`,
			`i_price4_old` = OLD.`i_price4`,
			`i_price4_new` = NEW.`i_price4`,
			`i_price5_old` = OLD.`i_price5`,
			`i_price5_new` = NEW.`i_price5`,
			`i_pricenet_old` = OLD.`i_pricenet`,
			`i_pricenet_new` = NEW.`i_pricenet`,
			`v_notes_old` = OLD.`v_notes`,
			`v_notes_new` = NEW.`v_notes`
END