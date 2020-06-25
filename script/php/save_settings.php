<?php
    require('crm_requests.php');
    header('Content-type: application/json');
    $settings = file_get_contents('php://input');
    file_put_contents('../../settings.json', $settings);
    $fields = executeREST('crm.lead.fields', array(), $magic_count)[result];

    $leads = get_list('crm.lead.list', array('select' => array('ID', 'UF_*')), $magic_count);
    foreach ($leads as $lead) {
        $sum = 0;
        foreach ($fields as $key => $value) {
            foreach ($value[items] as $item) {
                if ($lead[$key] == $item[ID]) {
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
                'id' => $lead[ID],
                'fields' => array(
                    "UF_CRM_1592315103815" => $sum
                )
            ),
            $magic_count
        );
    }

    $companies = get_list('crm.company.list', array('select' => array('ID', 'UF_*')),$magic_count);
    foreach ($companies as $company) {
        $sum = 0;
        foreach ($fields as $key => $value) {
            foreach ($value[items] as $item) {
                if ($company[$key] == $item[ID]) {
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
                'id' => $company[ID],
                'fields' => array(
                    'UF_CRM_5EE8D58C70C04' => $sum,
                    'UF_CRM_1592318662799' => $sum - $company[UF_CRM_1592318645774]
                )
            ),
            $magic_count
        );
    }
?>