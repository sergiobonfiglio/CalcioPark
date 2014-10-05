<?php
include_once(dirname(__FILE__)."/../include.php");

class Teams{
    private $debug = true;
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
                teams (eventId, teamId, proposer)
                VALUES (".$lastEvent->Id.",".
                          "'".$team->team."',".
                          $team->proposer->Id.
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
                throw new Exception("Error while inserting a team");
            }

        }catch(Exception $e){
            mysql_query("ROLLBACK");
			echo "error:".$e;
            return false;
        }
    }


}

   class TeamPlayer{

       private $teamId;
       private $playerName;
       private $role;
       private $position;

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


?>
