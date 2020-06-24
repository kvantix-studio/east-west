<?php

require('crm_requests.php');

header('Content-Type: text/html; charset=utf-8');
$data = executeREST('crm.lead.get', array("id" => $_REQUEST['data']['FIELDS']['ID']), $magic_count)[result];
$settings = json_decode(file_get_contents("../data.json"), true);
$fields = executeREST('crm.lead.fields', array(), $magic_count)[result];
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
    'crm.lead.update',
    array(
        'id' => $_REQUEST['data']['FIELDS']['ID'],
        'fields' => array("UF_CRM_1592315103815" => $sum)
    ),
    $magic_count
);