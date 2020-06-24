<?php
    header('Content-type: application/json');
    $settings = file_get_contents('php://input');
    file_put_contents('../../settings.json', $settings);
?>