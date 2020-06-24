<?php
require('crm_requests.php');
$list = get_list('crm.company.list', array(
    'order' => array('DATE_CREATE' => 'DESC'),
    'filter' => array(),
    'select' => array('TITLE', 'ASSIGNED_BY_ID', 'UF_*')
));
echo json_encode($list);
?>