<?php
require('crm_requests.php');
$list = executeREST('crm.company.fields', array(), $magic_count);
print_r('<pre>');
print_r($list);
print_r('</pre>');
?>