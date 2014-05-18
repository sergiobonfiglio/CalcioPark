<?php
class Event{
	var $Id;
	var $Date;
	var $Location;
	var $A;
	var $B;

	public function GetDisplayDate(){
		$mysqldate=$this->Date;
		$date = new DateTime($mysqldate);
		//$date=date("Y-m-d H:i:s",$mysqldate);
		return date_format($date, 'd/m/Y');
	}


	public static function GetEventById($id){
		require(dirname(__FILE__)."/../include.php");

		$query="SELECT * FROM event where id='".$id."'";
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		$res=array();
		if($row = mysql_fetch_assoc($result)){
			$event=new Event();
			$event->Id=$row["id"];
			$event->Date=$row["date"];
			$event->Location=$row["location"];
			$event->A=$row["A"];
			$event->B=$row["B"];
			mysql_free_result($result);
			return $event;
		}

		return null;
	}

	public static function GetLastEvent(){
		require(dirname(__FILE__)."/../include.php");

		$query="SELECT * FROM event order by id desc limit 1";
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		$res=array();
		if($row = mysql_fetch_assoc($result)){
			$event=new Event();
			$event->Id=$row["id"];
			$event->Date=$row["date"];
			$event->Location=$row["location"];
			$event->A=$row["A"];
			$event->B=$row["B"];
			mysql_free_result($result);
			return $event;
		}

		return null;
	}

	private static function GetEventByDate($date){
		require(dirname(__FILE__)."/../include.php");

		$query="SELECT * FROM event where date='".$date."'";
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		$res=array();
		if($row = mysql_fetch_assoc($result)){
			$event=new Event();
			$event->Id=$row["id"];
			$event->Date=$row["date"];
			$event->Location=$row["location"];
			$event->A=$row["A"];
			$event->B=$row["B"];
			mysql_free_result($result);
			return $event;
		}

		return null;
	}

	private static function InsertEventByDate($date){
		require(dirname(__FILE__)."/../include.php");

		$query="INSERT into event (date) values ('".$date."')";
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
	}

	private function InsertEventDefaultAssociations(){
		require(dirname(__FILE__)."/../include.php");

		$query='INSERT into association (event_id,player_id) select '.$this->Id.
		' as event_id, id as player_id from player P where email is not null and not exists(select 0 from association A where A.event_id='.$this->Id.' and A.player_id=P.id)';
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
	}

	public function VerifyAssocition($player_id){
		require(dirname(__FILE__)."/../include.php");
		$query='INSERT into association (event_id,player_id) select '.$this->Id.
		' as event_id, '.$player_id.' as player_id from player P where email is not null and not exists(select 0 from association A where A.event_id='.$this->Id.' and A.player_id=P.id)';
		//echo $query;
		$result=mysql_query($query) or die(mysql_error());
		return mysql_affected_rows();
	}

	public static function GetNextEvent(){
		date_default_timezone_set('Europe/Rome');
		$day=date("N");
		$gg=($day+2)%7;
		if ($gg>0){
			$mancano=7-$gg;
			$venerdi=date('Y-m-d', strtotime('+'.$mancano.' day'));
			$event=self::GetEventByDate($venerdi);
			$addAssociations=true;
			if ($event==null){
				self::InsertEventByDate($venerdi);
				//$addAssociations=true;
			}
			$event=self::GetEventByDate($venerdi);
			if ($addAssociations){
				$event->InsertEventDefaultAssociations();
			}
			return $event;
		}
		return null; //lucaerror
	}

	public function GetAnswers(){
		require(dirname(__FILE__)."/../include.php");
		$query="SELECT player_id,choice,nickname FROM association a,player p where a.player_id=p.id and event_id='".$this->Id."' and a.active=1 order by a.choice,nickname";
		$result=mysql_query($query) or die(mysql_error());
		$res=array();
		while($row = mysql_fetch_assoc($result)){
			$res[$row["choice"]][]=array($row["player_id"],$row["nickname"],0);
		}

		$query="SELECT player,choice FROM temp where event_id='".$this->Id."' order by choice,player";
		$result=mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)){
			$res[$row["choice"]][]=array(0,$row["player"],1);
		}

		return $res;
	}

}
?>
