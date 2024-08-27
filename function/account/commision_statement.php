<?php
	include "../connection.php";
    include "../response.php";
    include "../../function/checkhash_v2.php";

    $headers = apache_request_headers();
	$token = "";
	foreach ($headers as $header => $value) {
		if(strtolower($header) == "x-auth-token") $token = $value;
	}
	
    header('Content-Type: application/json');
    $body = file_get_contents('php://input');
    if (is_object(json_decode($body))){
        $value = file_get_contents('php://input');
        $jsonObject = json_decode($value, true);
    }
    else parse_str(file_get_contents('php://input'), $jsonObject);
    
	$connection = $connection;
	$response_server = new Response();
    $response = [];

    $dateStart 	= $jsonObject["date_start"];
	$dateEnd 	= $jsonObject["date_end"];
    $employee 	= $jsonObject["employee"];
    
    $connection->beginTransaction();
    try {
        $user = checkhash($connection, $token);
		if(!$user["success"]) $response = $response_server->credential();
		else{
			$business = $user["business"];

            $query = "  SELECT 
                            a.dt_created AS `date`,
                            a.i_value AS `value`
                        FROM dvw_transaction.vw_commision_statement a
                        WHERE
                            a.fk_employee = $employee
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') >= '$dateStart'
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') <= '$dateEnd'
                        ORDER BY a.dt_created ASC";
            $stmt = $connection->prepare($query);
            $stmt->execute();
            $result  = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $query = "  SELECT 
                            IFNULL(SUM(a.i_value), 0) AS `value`
                        FROM dvw_transaction.vw_commision_statement a
                        WHERE
                            a.fk_employee = $employee
                            AND DATE_FORMAT(a.dt_created, '%Y-%m-%d') < '$dateStart'
                        ORDER BY a.dt_created ASC";
            $stmt = $connection->prepare($query);
            $stmt->execute();
            $resultStart  = $stmt->fetch(PDO::FETCH_ASSOC);

            $response = $response_server->ok($resultStart['value'], $result);
        }
    }
    catch (PDOException $e) {
        $connection->rollback();
		$response = $response_server->internalServerError($e);

        $queryError = "	INSERT INTO dvw_system.vw_error(v_query, v_notes, v_error)
                        VALUES (:query, 'v3/report/commision_statement', :error)";
        $stmt = $connection->prepare($queryError);
        $stmt->bindParam(":query", $query);
        $stmt->bindParam(":error", $e);
        $stmt->execute();
    }	

    echo json_encode($response);