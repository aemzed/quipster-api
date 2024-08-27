BEGIN
    INSERT INTO 
        tkd_log.log_paymentmethod
    SET 
        `v_code` = UUID(),
        `i_code` = NEW.`i_code`,
        `fk_business` = NEW.`fk_business`,
        `fk_user` = NEW.`fk_user_modify`,
        `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
        `v_activity` = 'INSERT',
        `fk_systempaymentmethod_new` = NEW.`fk_systempaymentmethod`,
        `v_name_new` = NEW.`v_name`,
        `i_mdr_new` = NEW.`i_mdr`,
        `v_notes_new` = NEW.`v_notes`
END