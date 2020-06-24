<?

require('crm_requests.php');
$fields = executeREST('crm.lead.fields', array(), $magic_count)[result];
$crm_fields = array();

foreach ($_REQUEST as $key => $value) {
    $key = preg_replace('/_/', ' ', $key);
    foreach ($fields as $field_key => $field_value) {
        if ($key == $field_value[formLabel]) {
            if ($field_key == 'UF_CRM_1592315103815') {
                $crm_fields = array_merge($crm_fields, array($field_key => $value));
            } else {
                foreach ($field_value[items] as $item) {
                    if ($value == $item[VALUE]) {
                        $crm_fields = array_merge($crm_fields, array($field_key => $item[ID]));
                    }
                }
            }
        }
    }
}

$new_lead = executeREST(
    'crm.lead.add',
    array(
        'fields' => $crm_fields,
        'params'=> array("REGISTER_SONET_EVENT" => "N")
    ),
    $magic_count
)[result];

echo '<script>window.location = "https://b24-7jxc9k.bitrix24.ru/crm/lead/details/' . $new_lead . '/";</script>';

?>