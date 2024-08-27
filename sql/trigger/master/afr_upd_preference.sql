BEGIN
    IF (OLD.b_isactive = 1 AND NEW.b_isactive = 0) THEN
		INSERT INTO 
            tkd_log.log_preference
        SET 
			`v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'DELETE',
			`v_name_old` = OLD.`v_name`
    ELSE
		INSERT INTO 
            tkd_log.log_preference
        SET
            `v_code` = UUID(),
			`i_code` = OLD.`i_code`,
			`fk_business` = NEW.`fk_business`,
			`fk_user` = NEW.`fk_user_modify`,
            `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
			`v_activity` = 'UPDATE',
			`v_name_old` = OLD.`v_name`,
	        `v_name_new` = NEW.`v_name`
END