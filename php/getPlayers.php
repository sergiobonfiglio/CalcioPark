<?php
require_once("BL.php");
/*
$opzioni[-1]=("NESSUNA RISPOSTA");
$opzioni[0]=("NON SO ANCORA");
$opzioni[1]=("ASSENTE");

$opzioni[2]=("PRIMO TURNO (19-20)");
$opzioni[3]=("SECONDO TURNO (20-21)");
$opzioni[4]=("ENTRAMBI I TURNI");
$opzioni[5]=("PREFERIBILMENTE PRIMO (19-20)");
$opzioni[6]=("PREFERIBILMENTE SECONDO (20-21) ");
$opzioni[7]=("UNO A SCELTA");
*/

class EventPlayer{
	public $Name;
	public $Turn;
	public $Mandatory;
	public $Proposed;
	public $Answer;

	public function __construct($player){

		$this->Name = $player->Nickname;
		$this->initFromChoice($player->Choice);
		//TODO: add proposed flag
	}


	public function initFromChoice($choice){
		if($choice == 2){
			$this->Turn = 1;
			$this->Mandatory = true;
		} else if($choice == 3){
			$this->Turn = 2;
			$this->Mandatory = true;
		} else if($choice == 4){
			$this->Turn = 3;
			$this->Mandatory = false;
		} else if($choice == 5){
			$this->Turn = 1;
			$this->Mandatory = false;
		} else if($choice == 6){
			$this->Turn = 2;
			$this->Mandatory = false;
		} else if($choice ==-1){
			//no answer;
		} else if($choice == 0){
			$this->Answer = "?";
		} else if($choice == 1){
			$this->Answer = "x";
		} else if(isset($choice)){
			//echo "Choice not supported: ".$choice;
			die("Choice not supported: ".$choice);
		}

	}

}

 $event=Event::GetLastEvent();

 $players = Player::GetEventPlayers($event);
 $transcodedPlayers = array();
foreach($players as $p){
	$transcodedPlayers[] = new EventPlayer($p);
}

echo json_encode($transcodedPlayers);


?>
