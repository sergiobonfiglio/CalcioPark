<?php
require_once("BL.php");

//get all proposed teams
$event=Event::GetLastEvent();

$proposedTeams = ProposedTeam::GetProposedTeams($event->Id);

echo json_encode($proposedTeams);


?>
