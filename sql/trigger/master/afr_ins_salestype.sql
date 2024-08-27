BEGIN
    INSERT INTO 
        tkd_log.log_salestype
    SET 
        `v_code` = UUID(),
        `i_code` = NEW.`i_code`,
        `fk_business` = NEW.`fk_business`,
        `fk_user` = NEW.`fk_user_modify`,
        `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
        `v_activity` = 'INSERT',
        `fk_systemsalestype_new` = NEW.`fk_systemsalestype`,
        `v_name_new` = NEW.`v_name`,
        `b_tax_new` = NEW.`b_tax`,
        `b_sc_new` = NEW.`b_sc`
END