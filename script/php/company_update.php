<?php

require('crm_requests.php');

header('Content-Type: text/html; charset=utf-8');
$data = executeREST('crm.company.get', array("id" => $_REQUEST['data']['FIELDS']['ID']), $magic_count)[result];
$settings = json_decode(file_get_contents("../data.json"), true);
$fields = executeREST('crm.company.fields', array(), $magic_count)[result];
$sum = 0;
foreach ($fields as $key => $value) {
    foreach ($value[items] as $item) {
        if ($data[$key] == $item[ID]) {
            foreach ($settings as $setting) {
                foreach ($setting[options] as $option) {
                    if ($option[text] == $item[VALUE]) {
                        $sum += $option[value];
                        break 2;
                    }
                }  
            }
        }
    }
}

executeREST(
    'crm.company.update',
    array(
        'id' => $_REQUEST['data']['FIELDS']['ID'],
        'fields' => array(
            'UF_CRM_5EE8D58C70C04' => $sum,
            'UF_CRM_1592318662799' => abs($sum - $data[UF_CRM_1592318645774])
        )
    ),
    $magic_count
);