<?
file_put_contents(
   __DIR__ . '/log/' . time() . '.txt',
   var_export($_REQUEST, true)
);