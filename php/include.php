<?php
	global $mysql_server;
	global $mysql_user;
	global $mysql_pass;
	global $mysql_db;

	$res=mysql_connect($mysql_server,$mysql_user,$mysql_pass);
	mysql_select_db($mysql_db);

?>
