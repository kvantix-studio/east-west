<?php
file_put_contents(
	"event.txt", 
	$_REQUEST['data']['FIELDS']['ID']."\n", 
	FILE_APPEND
);
