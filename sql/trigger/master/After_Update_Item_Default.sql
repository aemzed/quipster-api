BEGIN
	DECLARE nodata VARCHAR(20);
	DECLARE olddate VARCHAR(20);
	
	IF(NEW.b_usetrigger = 1) THEN
		IF (NEW.i_qty <> OLD.i_qty) THEN
			IF (NEW.b_hasstock = 1) THEN
				IF (NEW.i_qty <= NEW.i_qtyalert) THEN
					SELECT COUNT(1), IFNULL(DATE_FORMAT(a.dt_created, '%Y-%m-%d'), '-') INTO nodata, olddate
					FROM dvw_operational.vw_notification a
					WHERE a.fk_business = NEW.fk_business
						AND a.v_activity = 'Item Alert'
						AND a.v_description = CONCAT('Item ', NEW.v_name)
					ORDER BY a.dt_created DESC LIMIT 1;
						
					IF (DATE_FORMAT(NEW.dt_created, '%Y-%m-%d') <> olddate) THEN
						INSERT INTO dvw_operational.vw_notification (fk_business, v_activity, v_description, v_table, v_value, v_type)
						VALUES (NEW.fk_business, 'Item Alert', CONCAT('Item ', NEW.v_name), 'vw_item', NEW.i_qty, 'danger');
					END IF;
					
				END IF;
			END IF;
		END IF;
	END IF;
END