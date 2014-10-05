<?php
require_once("BL.php");
require(dirname(__FILE__)."/include.php");

if(isset($_POST['team'])){

	try{
		//var_dump($_POST['team']);
		$team = json_decode($_POST['team']);
		//var_dump($team);

		//select last event id
        $lastEvent = Event::GetLastEvent();

		$supposedPlayer = Player::GetById($team->proposer->Id);
		$supposedCode = $supposedPlayer->GetSecureCode($lastEvent->Id);

		$res = false;
		if($supposedCode == $team->proposer->SecureCode
		   && $supposedPlayer->Group == "admin"){
			$res = Teams::submitTeam($team);
		}
		echo $res;

	}catch(Exception $e){
    	echo false;
	}
}

?>
