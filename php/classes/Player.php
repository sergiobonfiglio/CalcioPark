<?php
class Player{
	var $Id;
	var $Name;
	var $Surname;
	var $Nickname;
	var $Email;
    var $Choice;
	var $Group;

	public static function GetEventPlayers($event){
		require(dirname(__FILE__)."/../include.php");

		$query="SELECT p.*, a.choice
				FROM player p, association a
				WHERE a.player_id=p.id AND
					  a.event_id='".$event->Id."' AND
					  a.active=1
				ORDER BY a.choice desc";
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		$res=array();
		while($row = mysql_fetch_assoc($result)){
			$player=new Player();
			$player->Id=$row["id"];
            //$player->Name=$row["name"];
            //$player->Surname=$row["surname"];
			$player->Nickname=$row["nickname"];
			//$player->Email=$row["email"];
            $player->Choice=$row["choice"];
			$res[]=$player;
		}
		mysql_free_result($result);
		return $res;
	}


    public static function GetByNickName($nickName){
        require(dirname(__FILE__)."/../include.php");

		if(isset($nickName)){
			$query="SELECT * FROM player WHERE nickname='".$nickName."'";
			//echo $query;
			$result=mysql_query($query) or die(mysql_error());
			if($row = mysql_fetch_assoc($result)){
				$player=new Player();
				$player->Id=$row["id"];
				$player->Name=$row["name"];
				$player->Surname=$row["surname"];
				$player->Nickname=$row["nickname"];
				$player->Email=$row["email"];
				mysql_free_result($result);
				return $player;
			}
		}
		return null;
    }


	public static function GetById($id){
		require(dirname(__FILE__)."/../include.php");

		$query="SELECT * FROM player where id=".$id;
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		if($row = mysql_fetch_assoc($result)){
			$player=new Player();
			$player->Id=$row["id"];
			$player->Name=$row["name"];
			$player->Surname=$row["surname"];
			$player->Nickname=$row["nickname"];
			$player->Email=$row["email"];
			$player->Group=$row["group"];
			mysql_free_result($result);
			return $player;
		}

		return null;
	}

	public function GetSecureCode($matchId){
		return sha1("giocatore".$this->Id)
		.sha1($this->Nickname)
		.sha1("partita".$matchId);
	}

	public function UpdateChoice($event,$choice){
		require(dirname(__FILE__)."/../include.php");
		$query="update association set active=0 where event_id=".$event->Id." and player_id=".$this->Id;
		$result=mysql_query($query) or die(mysql_error());

		$query="insert into association (event_id,player_id,choice) values (".$event->Id.",".$this->Id.",".$choice.")";
		$result=mysql_query($query) or die(mysql_error());
	}

	public function GetChoice($event){
		require(dirname(__FILE__)."/../include.php");
		$query="select * from association where active=1 and event_id=".$event->Id." and player_id=".$this->Id;
		$result=mysql_query($query) or die(mysql_error());
		if($row = mysql_fetch_assoc($result)){
			return $row["choice"];
		}
		return -1;
	}
}
?>
