BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_salestype
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`fk_systemsalestype_old` = OLD.`fk_systemsalestype`,
            `v_name_old` = OLD.`v_name`,
            `b_tax_old` = OLD.`b_tax`,
            `b_sc_old` = OLD.`b_sc`,
    ELSE
		INSERT INTO 
            tkd_log.log_salestype
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
			`fk_systemsalestype_old` = OLD.`fk_systemsalestype`,
            `fk_systemsalestype_new` = NEW.`fk_systemsalestype`,
            `v_name_old` = OLD.`v_name`,
            `v_name_new` = NEW.`v_name`,
            `b_tax_old` = OLD.`b_tax`,
            `b_tax_new` = NEW.`b_tax`,
            `b_sc_old` = OLD.`b_sc`,
            `b_sc_new` = NEW.`b_sc`
END