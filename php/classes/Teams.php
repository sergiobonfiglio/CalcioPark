<?php
include_once(dirname(__FILE__)."/../include.php");

class Teams{
    //TODO: this should use the ProposedTeam class
    public static function SubmitTeam($team)
    {
        require(dirname(__FILE__)."/../include.php");

        //select last event id
        $lastEvent = Event::GetLastEvent();

        try{
            mysql_query("START TRANSACTION");

            //insert team
            $queryTeam =
                "INSERT INTO
                teams (eventId, team, proposer, eventTime)
                VALUES (".$lastEvent->Id.",".
                          "'".$team->team."',".
                          $team->proposer->Id.",".
						  "'".$team->eventTime."'".
                ")";

            $teamInserted = mysql_query($queryTeam);

			$teamId = mysql_insert_id();

            if($teamInserted){
				$playerInserted = true;

                //insert team_players associations
                for($i=0; $i < sizeof($team->players) && $playerInserted; $i++){
                    $player = $team->players[$i];
                    $teamPlayer = new TeamPlayer($teamId,$player->Name, $player->Role, $player->Position);
                    $playerInsert = $teamPlayer->GetInsertTeamPlayerQuery();

                    $playerInserted &= mysql_query($playerInsert);
                }
            }

            if($teamInserted && $playerInserted){
                mysql_query("COMMIT");
                return true;
            }else{
                throw new Exception("Error while inserting a team (".mysql_error().")");
            }

        }catch(Exception $e){
            mysql_query("ROLLBACK");
			echo "error:".$e;
            return false;
        }
    }


}

class TeamPlayer{

   public $teamId;
   public $playerName;
   public $role;
   public $position;

   public function __construct($teamId, $playerName, $role, $position){
	   $this->teamId = $teamId;
	   $this->playerName = $playerName;
	   $this->role = $role;
	   $this->position = $position;
   }

   public function GetInsertTeamPlayerQuery(){

	   $id = Player::GetByNickName($this->playerName)->Id;

	   $query = "INSERT INTO team_players
				(teamId, playerId, role, position)
				VALUES (".
				   $this->teamId.",".
				   $id.",".
				   "'".$this->role."',".
				   "'".$this->position."'".
				")";
	   return $query;
   }
}


class ProposedTeam {
	public $id;
	public $teamColor;
	public $eventTime;
	public $status;
	public $proposer;
	public $teamPlayers;

	public function __construct($id, $teamColor, $eventTime, $status, $proposer, $teamPlayers){
		$this->id = $id;
		$this->teamColor = $teamColor;
		$this->eventTime = $eventTime;
		$this->status = $status;
		$this->proposer = $proposer;
		$this->teamPlayers = $teamPlayers;
	}

	public function AddPlayer($teamPlayer){
		if(!isset($this->teamPlayers)){
			$this->teamPlayers = array();
		}

		$this->teamPlayers[] = $teamPlayer;
	}


	/*Get all proposed teams for an event*/
	public static function GetProposedTeams($eventId){
		/*assume it's more convenient to get all proposal at once */
		require(dirname(__FILE__)."/../include.php");

		$queryTeams =   "SELECT t.id, t.eventTime, status, team, p.nickname
					FROM teams t
					JOIN player p on t.proposer = p.id
					WHERE t.eventId = ".$eventId;

		$result=mysql_query($queryTeams) or die(mysql_error());
		$proposedTeams=array();
		while($row = mysql_fetch_assoc($result)){

			$proposedTeam = new ProposedTeam(
				$row["id"],
				$row["team"],
				$row["eventTime"],
				$row["status"],
				$row["nickname"],//proposer
				null //players are populated with another query
			);
			$proposedTeams[] = $proposedTeam;
		}
		mysql_free_result($result);


		//for each team get players
		foreach($proposedTeams as $team){
			$queryTeamPlayers = "SELECT p.nickname, tp.position, tp.role
					FROM team_players tp
					JOIN player p ON tp.playerId = p.id
					WHERE teamId = ".$team->id;

			$result=mysql_query($queryTeamPlayers) or die(mysql_error());
			$players=array();
			while($row = mysql_fetch_assoc($result)){
				$player = new TeamPlayer(
					$team->id,
					$row["nickname"],
					$row["role"],
					$row["position"]
				);

				$team->AddPlayer($player);
			}
			mysql_free_result($result);
		}

		return $proposedTeams;
	}
}

?>
