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
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                16/05/2014 <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">
                <li><a href="#">09/05/2014</a>
                </li>
                <li><a href="#">02/05/2014</a>
                </li>
                <li><a href="#">25/04/2014</a>
                </li>
                <li><a href="#">...</a>
                </li>
            </ul>
        </div>

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
            <div class="switch-toggle switch-ios" style="float:left;position:relative;top:10px;width:45%;">
                <input id="turno1" name="view" type="radio" checked>
                <label id="turnToggle1" for="turno1">1&deg; turno</label>

                <input id="turno2" name="view" type="radio">
                <label id="turnToggle2" for="turno2">2&deg; turno</label>
                <a></a>
            </div>
            <div class="result"> <span class="flaticon-simple35 whiteScore"></span>? - ?<span class="flaticon-brazil6 blackScore"></span>
            </div>
            <div class="fieldContainer">
                <img src="img/soccer-field-rotated_5.jpg" id="fieldImg" />
                <div id="whiteTeam" class="teamContainer top">
                    <div class="department">
                    </div>
                    <div class="department">
                    </div>
                    <div class="department">
                    </div>
                </div>
                <div id="blackTeam" class="teamContainer bottom">
                    <div class="department">
                    </div>
                    <div class="department">
                    </div>
                    <div class="department">
                    </div>
                </div>

            </div>
        </div>
    </div>
</body>

</html>
