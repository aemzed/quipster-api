BEGIN
    INSERT INTO 
        tkd_log.log_absence_type
    SET 
        `v_code` = UUID(),
        `i_code` = NEW.`i_code`,
        `fk_business` = NEW.`fk_business`,
        `fk_user` = NEW.`fk_user_modify`,
        `v_user_name` = (SELECT a.v_name FROM dvw_account.vw_user a WHERE a.i_code = NEW.fk_user_modify),
        `v_activity` = 'INSERT',
        `v_name_new` = NEW.`v_name`
        `i_start_hour_new` = NEW.`i_start_hour`
        `i_start_minute_new` = NEW.`i_start_minute`
        `i_end_hour_new` = NEW.`i_end_hour`
        `i_end_minute_new` = NEW.`i_end_minute`
        `i_zone_new` = NEW.`i_zone`
END