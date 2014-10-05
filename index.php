<?php
require_once("php/BL.php");

$sum=( isset($_GET["p"])?1:0 )+ (isset($_GET["m"])?1:0) + (isset($_GET["sec"])?1:0);

if ($sum==3){

    /* player */
	$p=$_GET["p"];

	$player=Player::GetById($p);

	if ($player==null){
		die("errore2");
	}

    /* match/event */
	$eventId=$_GET["m"];
	$event=Event::GetEventById($eventId);

	if ($event==null){
		die("errore3");
	}

	$SEC=$player->GetSecureCode($event->Id);

    /*secure*/
	if ($SEC!=$_GET["sec"]){
		die("errore4");
	}

    /*choice*/
	if(isset($_GET["c"])){
		$choice=$_GET["c"];
		$player->UpdateChoice($event,$choice);
	}

	$choice=$player->GetChoice($event);

	$group = $player->Group;
}
else if($sum==0){
    /*do nothing: read-only*/
}
else{
	die("errore1");
}

?>

<html>

<head>
    <title>CalcioPark</title>
    <link rel="icon" href="favicon.ico">

    <script src="http://code.jquery.com/jquery-2.1.0.min.js"></script>

    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>

    <link rel="stylesheet" type="text/css" href="css/Flaticon_WebFont/flaticon.css">
    <link rel="stylesheet" href="css/toggle-switch.css">
    <link rel="stylesheet" href="css/stylesheet.css">
    <script src="js/main.js"></script>

</head>

<body>

    <nav class="navbar navbar-inverse" role="navigation">
        <a class="navbar-brand">CalcioPark</a>

        <div class="btn-group">
            <button id="lastEvent" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                 <span class="caret"></span>
            </button>
            <ul id="otherEvents" class="dropdown-menu" role="menu">
                <li><a href="#">...</a>
                </li>
            </ul>
        </div>
<? if(isset($player)){
	$playerGroupStr="";
	if($player->Group != null){
		$playerGroupStr = "(". $player->Group.")";
	}
	echo "<span class='navbar-link'>Benvenuto ".$player->Nickname."! ".$playerGroupStr."</span>";
}?>

<!--  <button type="button" class="btn btn-default" onclick="commitTeam(readTeamFromScreen('white'))">Submit Team</button>-->
    </nav>
    <div class="container">
	<div class="leftContainer">
		<div class="players">
			<div class="playerHeader">
				<h4><b> Giocatori <span id="addPlayer" class="tt glyphicon glyphicon-plus pull-right" title="Aggiungi un amico"></span> </b></h4>
			</div>
			<div class="hourRow">
				<div class="hour">
					<span class="glyphicon glyphicon-time"></span> 19:00</div>
				<div class="progress">
					<div id="progress1-both" class="progress-bar progress-bar-success" style="width: 0%"></div>
					<div id="progress1-movable" class="progress-bar progress-bar-warning" style="width: 0%"></div>
					<div id="progress1-mandatory" class="progress-bar progress-bar-danger" style="width: 0%"></div>
				</div>
			</div>
			<div class="hourRow">
				<div class="hour">
					<span class="glyphicon glyphicon-time"></span> 20:00</div>
				<div class="progress">
					<div id="progress2-both" class="progress-bar progress-bar-success" style="width: 0%"></div>
					<div id="progress2-movable" class="progress-bar progress-bar-warning" style="width: 0%"></div>
					<div id="progress2-mandatory" class="progress-bar progress-bar-danger" style="width: 0%"></div>
				</div>
			</div>
			<div id="playersContainer">
			</div>
		</div>

		<div class="players">
			<div class="playerHeader">
				<h4><b>Panchina</b></h4>
			</div>
			<div id="benchContainer">
			</div>
		</div>
	</div>

<div class="rightContainer">
	<!--
		<div class="switch-toggle switch-ios" style="float:left;position:relative;top:10px;width:45%;">
			<input id="turno1" name="view" type="radio" checked>
			<label id="turnToggle1" for="turno1">1&deg; turno</label>

			<input id="turno2" name="view" type="radio">
			<label id="turnToggle2" for="turno2">2&deg; turno</label>
			<a></a>
		</div>
-->
	<div class="result"> <span class="flaticon-simple35 whiteScore"></span>? - ?<span class="flaticon-brazil6 blackScore"></span>
	</div>

	<div id="fieldsCarousel" class="carousel slide" style="float:left;" data-interval="false" data-wrap="false">
		<!-- tools sidebar -->
		<div class="teamTools">
			<span class="toolIcon tt flaticon-minus2" style="font-size:200%;color:#d9534f;cursor:default;" title="Squadre non definitive"></span>
			<? if(isset($player) && $player->Group == "admin"){
					echo "<span id='commitTeams' class='toolIcon tt flaticon-check33' style='font-size:200%;' title='Conferma squadre'
					onclick='committAllTeams(\"".$player->Id."\",\"".$SEC."\");'></span>";
				}?>
			<!--<span class="toolIcon disabled tt flaticon-check33" style="font-size:200%;" title="Squadre definitive"></span>-->
			<span class="toolIcon disabled tt flaticon-share21" title="Proponi squadre"></span>
			<!--					<span class="toolIcon disabled tt flaticon-two298"   title="Copia squadre dall'altro turno"></span>-->
			<!--<span id="shuffleButton" class="toolIcon tt flaticon-refresh7" title="Genera squadre casuali"></span>-->
			<span class="toolIcon disabled tt flaticon-thumb52" title="Vota queste squadre"></span>
<!--			<span id="shuffleButton" class="toolIcon tt glyphicon glyphicon-refresh" title="Genera squadre casuali"></span>-->
		</div>

		<!-- Indicators -->
		<!--
		  <div class="carousel-indicators" style="z-index:100;">
			<span data-target="#carousel-example-generic" data-slide-to="0" class="active">19</span>
			<span data-target="#carousel-example-generic" data-slide-to="1">20</span>
		  </div>
			-->
		<!-- Wrapper for slides -->
		<div class="carousel-inner">
			<div id="field1" class="fieldContainer item active">

				<img src="img/soccer-field-rotated_6.jpg" id="fieldImg1" />
				<div id="whiteTeam1" class="teamContainer top">
					<div class="department gk">
						<div class="subDepartment gk" id="1.white.Gk"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="1.white.Def.L"></div>
						<div class="subDepartment" id="1.white.Def.C"></div>
						<div class="subDepartment" id="1.white.Def.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="1.white.Cc.L"></div>
						<div class="subDepartment" id="1.white.Cc.C"></div>
						<div class="subDepartment" id="1.white.Cc.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="1.white.Atk.L"></div>
						<div class="subDepartment" id="1.white.Atk.C"></div>
						<div class="subDepartment" id="1.white.Atk.R"></div>
					</div>
				</div>
				<div id="blackTeam1" class="teamContainer bottom">
					<div class="department">
						<div class="subDepartment" id="1.black.Atk.L"></div>
						<div class="subDepartment" id="1.black.Atk.C"></div>
						<div class="subDepartment" id="1.black.Atk.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="1.black.Cc.L"></div>
						<div class="subDepartment" id="1.black.Cc.C"></div>
						<div class="subDepartment" id="1.black.Cc.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="1.black.Def.L"></div>
						<div class="subDepartment" id="1.black.Def.C"></div>
						<div class="subDepartment" id="1.black.Def.R"></div>
					</div>
					<div class="department gk">
						<div class="subDepartment gk" id="1.black.Gk"></div>
					</div>
				</div>

			</div>

			<div id="field2" class="fieldContainer item">

				<img src="img/soccer-field-rotated_6.jpg" id="fieldImg2" />
				<div id="whiteTeam2" class="teamContainer top">
					<div class="department gk">
						<div class="subDepartment gk" id="2.white.Gk"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="2.white.Def.L"></div>
						<div class="subDepartment" id="2.white.Def.C"></div>
						<div class="subDepartment" id="2.white.Def.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="2.white.Cc.L"></div>
						<div class="subDepartment" id="2.white.Cc.C"></div>
						<div class="subDepartment" id="2.white.Cc.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="2.white.Atk.L"></div>
						<div class="subDepartment" id="2.white.Atk.C"></div>
						<div class="subDepartment" id="2.white.Atk.R"></div>
					</div>
				</div>
				<div id="blackTeam2" class="teamContainer bottom">
					<div class="department">
						<div class="subDepartment" id="2.black.Atk.L"></div>
						<div class="subDepartment" id="2.black.Atk.C"></div>
						<div class="subDepartment" id="2.black.Atk.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="2.black.Cc.L"></div>
						<div class="subDepartment" id="2.black.Cc.C"></div>
						<div class="subDepartment" id="2.black.Cc.R"></div>
					</div>
					<div class="department">
						<div class="subDepartment" id="2.black.Def.L"></div>
						<div class="subDepartment" id="2.black.Def.C"></div>
						<div class="subDepartment" id="2.black.Def.R"></div>
					</div>
					<div class="department gk">
						<div class="subDepartment gk" id="2.black.Gk"></div>
					</div>
				</div>

			</div>
		</div>
		<!-- Carousel controls-->
		<a id="carouselLeft" class="left carousel-control" style="z-index:100;" href="#fieldsCarousel" role="button" data-slide="prev">
			<span class="glyphicon glyphicon-chevron-left"></span>
		</a>
		<a id="carouselRight" class="right carousel-control" style="z-index:100;" href="#fieldsCarousel" role="button" data-slide="next">
			<span class="glyphicon glyphicon-chevron-right"></span>
		</a>
	</div>

</div>
	</div>
</body>

</html>
