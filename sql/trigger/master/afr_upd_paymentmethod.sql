BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_paymentmethod
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`fk_systempaymentmethod_old` = OLD.`fk_systempaymentmethod`,
            `v_name_old` = OLD.`v_name`,
            `i_mdr_old` = OLD.`i_mdr`,
            `v_notes_old` = OLD.`v_notes`
    ELSE
		INSERT INTO 
            tkd_log.log_paymentmethod
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
			`fk_systempaymentmethod_old` = OLD.`fk_systempaymentmethod`,
            `fk_systempaymentmethod_new` = NEW.`fk_systempaymentmethod`,
            `v_name_old` = OLD.`v_name`,
            `v_name_new` = NEW.`v_name`,
            `i_mdr_old` = OLD.`i_mdr`,
            `i_mdr_new` = NEW.`i_mdr`,
            `v_notes_old` = OLD.`v_notes`,
            `v_notes_new` = NEW.`v_notes`
END