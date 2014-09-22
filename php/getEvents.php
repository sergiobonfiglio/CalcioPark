<?php
require_once("BL.php");

$event=Event::GetLastEvent();

echo json_encode($event);

?>
