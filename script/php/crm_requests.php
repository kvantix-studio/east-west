<?
header('Content-Type: text/html; charset=utf-8');
$magic_count = 0;

//возвращает запрос через api в виде массива
function executeREST($method, $params, &$call_count) {
	
    $call_count++;

    // тормозим перед выполнением каждого третьего запроса
    if ($call_count == 2) {
        sleep(1);
        $call_count = 0;
    }

	$queryUrl = 'https://b24-7jxc9k.bitrix24.ru/rest/1/rcdql0q1jq2qve09/' . $method . '.json';
	$queryData = http_build_query($params);

	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_SSL_VERIFYPEER => 0,
		CURLOPT_POST => 1,
		CURLOPT_HEADER => 0,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $queryUrl,
		CURLOPT_POSTFIELDS => $queryData,
	));

	$result = json_decode(curl_exec($curl), true);
	curl_close($curl);

	return $result;
	
};

//получаем list из CRM
function get_list($method, $params) {
	$total = executeREST($method, $params, $magic_count)['total'];
	$calls = ceil($total / 50);
	$current_call = 0;
	$batch = array();
	$result = array();
	$list = array();

	do {
		$current_call++;
		$batch['get_' . $current_call] =
			$method.'?'.http_build_query(
				array_merge(
					array(
						"start" => ($current_call - 1) * 50,
					),
					$params
				)
			);

		if ((count($batch) == 50) || ($current_call == $calls)) {
			$batch_result = executeREST('batch', array('cmd' => $batch), $magic_count);
			$result = array_merge($result, $batch_result[result][result]);
			$batch = array();
		}
	} while ($current_call < $calls);

	//записываем результат в массив $contacts в более удобном виде
	foreach($result as $key => $value) {
		$list = array_merge($list, $value);
	}

	return $list;

}

?>