//var currentTurn=1;
var departments;
var field;
$(document).ready(

    function () {

        updateEventsList();

        var cache = new PlayersCache();

        //players list
        var players = new Players(cache);

        //bench
        var bench = new Bench(cache);

        //field
        field = new Field(cache);
//        field.showTeamForTurn(1);
//		field.showTeamForTurn(2);


        cache.updatePlayers();

        friendAdder = new FriendAdder(players.containerId);

		//events bindings

        //bind events to buttons
        $('#addPlayer').bind('click', function (event) {
            friendAdder.addFriend();
        });

		//tooltip
        $(".tt").tooltip({
            placement: 'right',
            'delay': {
                show: 300,
            }
        });

		$('#shuffleButton').bind('click', function (event) {
				$(this).animate({
					borderSpacing: 360
				}, {
					step: function (now, fx) {
						$(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
						$(this).css('-moz-transform','rotate('+now+'deg)');
					},
					duration: 600,
					easing: 'linear',
					complete: function(){
						$(this).css('border-spacing','0px');
						$(this).css('-webkit-transform', '');
						$(this).css('-moz-transform','');
					}
				});

			field.shuffleTeams();
		});

		$('#carouselLeft').hide();
		$('#fieldsCarousel').on('slide.bs.carousel', function (event) {
  			if($(event.relatedTarget)[0].id == 'field1'){
				$('#carouselLeft').fadeOut();
				setTimeout(function(){
					$('#carouselRight').fadeIn();}, 500);
			}else if($(event.relatedTarget)[0].id == 'field2'){
				$('#carouselRight').fadeOut();
				setTimeout(function(){
					$('#carouselLeft').fadeIn();}, 500);
			}
		})

		//drag and drop
		departments = document.querySelectorAll('.subDepartment, .carousel-control');
		[].forEach.call(departments, function(x) {
			x.addEventListener('dragstart', handleDragStart);
			x.addEventListener('dragenter', handleDragEnter);
		  	x.addEventListener('dragover', handleDragOver);
		  	x.addEventListener('dragleave', handleDragLeave);
			x.addEventListener('drop', handleDrop);
  			x.addEventListener('dragend', handleDragEnd);
		});

    }

);
//Drag and drop
var enteredElement;
var changeFieldTimeout;
function handleDragEnter(e) {
	// this / e.target is the current hover target.
	enteredElement = this;

	clearTimeout(changeFieldTimeout);

	//avoid glitches with dragLeave: remove all other over
	[].forEach.call(departments, function (x) {
		x.classList.remove('over');
	});
	this.classList.add('over');

	if($(this).hasClass('carousel-control')){
		changeFieldTimeout = setTimeout(function(){
			if($('#carouselRight').is(':visible')){
				$('#fieldsCarousel').carousel('next');
			}else{
				$('#fieldsCarousel').carousel('prev');
			}
		}, 1000);
	}
}

function handleDragLeave(e) {
	// this / e.target is previous target element.
	//if (this != enteredElement) {
		//this.classList.remove('over');
	//}
}

function handleDragEnd(e) {
	// this/e.target is the source node.
	$(dragSrcEl).removeClass('dragging');
	//e.currentTarget.classList.remove('dragging');

  [].forEach.call(departments, function (x) {
		x.classList.remove('over');
	});

}
var dragSrcEl = null;

function handleDragStart(e) {
	// this / e.target is the source node.
	this.classList.add('dragging');

	dragSrcEl = this;

	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDrop(e) {
	// this / e.target is current target element.

	if (e.stopPropagation) {
		e.stopPropagation(); // stops the browser from redirecting.
	}

	// Don't do anything if dropping the same column we're dragging.
	if (dragSrcEl != this) {

		//swap elements
		dragSrcEl.innerHTML = this.innerHTML;
		this.innerHTML = e.dataTransfer.getData('text/html');

		//$(dragSrcEl).children('.playerField').removeClass('hover');
		//$(this).children('.playerField').removeClass('hover');

		updatePlayerTeam(this);
		updatePlayerTeam(dragSrcEl);

	}

	handleDragEnd(e);
	handleDragEnd(dragSrcEl);

	return false;
}

function updatePlayerTeam(subDep) {
	var actualTeamId = subDep.parentNode.parentNode.attributes['id'].value;
	var actualTeam;
	if (actualTeamId.indexOf('white') >= 0) {
		actualTeam = 'white';
	} else if (actualTeamId.indexOf('black') >= 0) {
		actualTeam = 'black';
	}

	var elementTeam;

	if ($(subDep).children('.playerField').hasClass('white')) {
		elementTeam = 'white';
	} else if ($(subDep).children('.playerField').hasClass('black')) {
		elementTeam = 'black';
	}

	if (actualTeam != elementTeam) {
		$(subDep).children('.playerField').removeClass(elementTeam);
		$(subDep).children('.playerField').addClass(actualTeam);
	}
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	return false;
}



function updateEventsList(){
$.ajax({
        type: 'GET',
        url: 'php\\getEvents.php',
        complete: $.proxy(function (msg, status) {
            try {
                if (status == "success") {
                    var res = $.parseJSON(msg.responseText);
                    $('#lastEvent').append(res.Date.substr(0,10));
                } else {
                    throw "Bad response: status= " + status;
                }
            } catch (err) {
                alert("Si e' verificato un errore durante la richiesta della lista giocatori. [" + err + "]");
            }

        }, this)
    });
}


//Teams
function getProposedTeams(){}

function getDefaultTeam(event, turn, teamColor){}


function commitTeam(team){
    $.ajax({
            type: 'POST',
            url: 'php\\submitTeam.php',
            data: 'team='+JSON.stringify(team),
            complete: $.proxy(function (msg, status) {
                try {
                    if (status == "success" && msg.responseText == true) {
                        alert("Squadra inserita!");
                    } else {
                        throw "Bad response: status= " + status+" - msg= "+msg.responseText;
                    }
                } catch (err) {
                    alert("Si e' verificato un errore durante l'inserimento della squadra. [" + err + "]");
                }
            }, this)
        });
}

function readTeamFromScreen(team, turn, proposer){
    var players = new Array();
    var $playersScreen = $('#' + team + 'Team'+turn).find('.playerField.'+team);
    for (var i = 0; i < $playersScreen.length; i++) {
        var subDepSplit = $playersScreen[i].parentNode.attributes['id'].value.split('.');
        var pTurn = subDepSplit[0];//team (1/2)
		var pTeam = subDepSplit[1];//team (white/black)
        var pRole = subDepSplit[2];//role (Gk/Def/Cc/Atk)
        var pPos = subDepSplit[3];//position (L/C/R)
        var name = $playersScreen[i].innerHTML;
        players.push(new TeamPlayer(name, pRole, pPos));
    }

    return new Team(players, team, turn, proposer, true, true, null);
}

function committAllTeams(playerId, secureCode){
	var propserObj = new Proposer(playerId, secureCode);
	var teams = readAllTeams(propserObj);
	for(var i = 0; i< teams.length; i++){
		commitTeam(teams[i]);
	}
}

function readAllTeams(proposer){
	var teams = new Array();
	for(var i = 0; i<2; i++){
		teams.push(readTeamFromScreen('white', i+1, proposer));
		teams.push(readTeamFromScreen('black', i+1, proposer));
	}

	return teams;
}


function Proposer(id, secureCode){
	this.Id = id;
	this.SecureCode = secureCode;
}

function TeamPlayer(player, role, position){
    this.Name = player;
    this.Role = role;
    this.Position = position;
}


function Team(players, team, turn, proposer, isDefault, isFinal, voters){
    this.team = team ;//white/black
    this.turn = turn;
    this.proposer = proposer;
    this.isDefault = isDefault;
    this.voters = voters;
    this.players = players;
}

//Friend
function FriendAdder(containerId) {
    this.containerId = containerId;
    this.addingFriend = false;
}
FriendAdder.prototype.addFriend = function () {
    if (!this.addingFriend) {
        this.addingFriend = true;
        $(this.containerId).append(
            '<form id="newPlayer" class="form-inline" style="margin-top:10px;">' +
            '<div class="input-group" >' +
            '<span class="input-group-addon">' +
            'Solo <input type="checkbox">' +
            ' 1&deg; <input type="checkbox">' +
            ' 2&deg; <input type="checkbox">' +
            '</span>' +
            ' <input type="text" class="form-control" placeholder="Nome">' +

            '<span class"input-group-addon" style="position:absolute;top:5px;right:10px;z-index:1000;"><button id="addFriendAbort" type="button" class="close"">&times;</button></span>' +

            '</div>' +
            '</from>'
        );
        $('#newPlayer').hide().fadeIn().slideDown();

        $('#newPlayer').bind('submit', $.proxy(function () {
            this.commitFriend(true);
        }, this));

        $('#addFriendAbort').bind('click', $.proxy(function () {
            this.commitFriend(false);
        }, this));

    } else {
        $('#addingAlert').remove();
        $('#playersContainer').append(
            '<div id="addingAlert" class="alert alert-danger alert-dismissable" style="margin-top:10px;">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            '<strong>Uno alla volta!</strong><br/> Senza spingere...</div>');
    }
};

FriendAdder.prototype.commitFriend = function (write) {
    $('#newPlayer').fadeOut().remove();
    $('#addingAlert').fadeOut().remove();
    this.addingFriend = false;
};

function PlayersCache() {
    this.players = null;
    this.observers = [];
}
PlayersCache.prototype.notify = function () {
    for (var i = 0; i < this.observers.length; i++) {
        this.observers[i].onChange(this.players);
    }
}
PlayersCache.prototype.subscribe = function (observer) {
    this.observers.push(observer);
}
PlayersCache.prototype.updatePlayers = function () {
    $.ajax({
        type: 'GET',
        url: 'php\\getPlayers.php',
        complete: $.proxy(function (msg, status) {
            try {
                if (status == "success") {
                    var res = $.parseJSON(msg.responseText);
                    this.players = res;
                    this.notify();
                } else {
                    throw "Bad response: status= " + status;
                }
            } catch (err) {
                alert("Si e' verificato un errore durante la richiesta della lista giocatori. [" + err + "]");
            }

        }, this)
    });
};


//Players base class
function PlayersList(containerId, playersCache) {

    this.containerId = containerId;
    if (playersCache !== undefined) {
        playersCache.subscribe(this);
    }
    this.players;

    this.addPlayer = function (name, divClass, badgeClass, badgeContent, tooltip) {
        var title = "";
        if (tooltip !== undefined && tooltip !== null) {
            badgeClass += " tt";
            title = "title='" + tooltip + "'";
        }
        $(this.containerId).append(
            "<div class=\"player " + divClass + "\">" + name +
            "<span class=\"" + badgeClass + " badge pull-right\" " + title + ">" +
            badgeContent +
            "</span></div>"
        );

        $(this.containerId + " .tt").tooltip({
            placement: 'left',
            'delay': {
                show: 300,
            }
        });

    };

}


function Player(name, turn, mandatory, proposed, answer) {
    this.Name = name;
    this.Turn = turn;
    this.Mandatory = mandatory;
    this.Proposed = proposed;
    this.Answer = answer;
}

Players.prototype = new PlayersList;
Players.constructor = Players;

function Players(cache) {
    PlayersList.call(this, '#playersContainer', cache);
    this.addingFriend = false;
}
Players.prototype.onChange = function (players) {
    this.players = players;
    $(this.containerId).text("");
    for (var i = 0; i < this.players.length; i++) {
        var p = this.players[i];
        if (p.Turn !== null) {
            var tooltip;
            var divClass = p.Proposed ? "proposed" : "";
            var badgeClass = "";
            if (p.Mandatory) {
                tooltip = "Solo " + p.Turn + "&deg; turno";
                badgeClass = "mandatory";
            } else if (!p.Mandatory && p.Turn < 3) {
                badgeClass = "preferred";
                tooltip = "Preferibilmente " + p.Turn + "&deg; turno";
            }

            var badgeContent = p.Turn == 3 ? "1&deg;-2&deg;" : p.Turn.toString() + "&deg;";

            //add players to list
            this.addPlayer(p.Name, divClass, badgeClass, badgeContent, tooltip);
        }
    }
    this.updateCounts();
};
Players.prototype.setProgressBar = function (turn, type, count) {
    var prefix = "#progress";
    var sep = "-";
    var id = prefix + turn + sep + type;
    //$(id).css("width", (100 * count / 14) + "%");
    $(id).animate({
        width: (100 * count / 14) + "%"
    });
    $(id).text((!isNaN(count) && count !== 0) ? count : "");
};
Players.prototype.updateCounts = function () {
    var countsBoth = 0;
    var countsFirstTurn = {};
    var countsSecondTurn = {};
    //init
    countsFirstTurn.movable = 0;
    countsSecondTurn.movable = 0;
    countsFirstTurn.mandatory = 0;
    countsSecondTurn.mandatory = 0;

    for (var i = 0; i < this.players.length; i++) {
        var p = this.players[i];

        if (p.Turn == 3) {
            countsBoth++;
        } else {
            countsFirstTurn.movable += (p.Turn == 1 && (p.Mandatory === null || p.Mandatory === false)) ? 1 : 0;
            countsSecondTurn.movable += (p.Turn == 2 && (p.Mandatory === null || p.Mandatory === false)) ? 1 : 0;
            countsFirstTurn.mandatory += (p.Turn == 1 && p.Mandatory === true) ? 1 : 0;
            countsSecondTurn.mandatory += (p.Turn == 2 && p.Mandatory === true) ? 1 : 0;
        }

    }

    this.setProgressBar(1, "both", countsBoth);
    this.setProgressBar(2, "both", countsBoth);
    this.setProgressBar(1, "movable", countsFirstTurn.movable);
    this.setProgressBar(2, "movable", countsSecondTurn.movable);
    this.setProgressBar(1, "mandatory", countsFirstTurn.mandatory);
    this.setProgressBar(2, "mandatory", countsSecondTurn.mandatory);
};

Bench.prototype = new PlayersList;
Bench.prototype.constructor = Bench;

function Bench(cache) {
    PlayersList.call(this, '#benchContainer', cache);
}

Bench.prototype.onChange = function (players) {
    this.players = players;
    //var players = this.getBench();
    $(this.containerId).text("");
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (p.Turn === null) {
            var tooltip = "Nessuna risposta";
            var badgeClass = "unknown";
            var divClass = (p.Answer === null) ? "unknown" : "";
            if (p.Answer !== null && p.Answer == "x") {
                badgeClass = "mandatory";
                tooltip = "Assente";
            } else if (p.Answer !== null && p.Answer == "?") {
                badgeClass = "preferred";
                tooltip = "Non so ancora";
            }
            var badgeContent = (p.Answer === null) ? "-" : p.Answer;

            //add players to list
            this.addPlayer(p.Name, divClass, badgeClass, badgeContent, tooltip);
        }
    }
};

function Field(cache) {
    cache.subscribe(this);
    this.firstTurnPlayers;
    this.secondTurnPlayers;
	this.currentProposer;

}
Field.prototype.onChange = function(players){
    this.firstTurnPlayers = this.shuffle(this.getPlayersOfTurn(players, 1));
    this.secondTurnPlayers = this.shuffle(this.getPlayersOfTurn(players, 2));
	this.updateTeams(1);
	this.updateTeams(2);
}

Field.prototype.getPlayersOfTurn = function (players, turn) {
    var playersOfTurn = [];
    var count = 0;
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (p.Turn == 3 || p.Turn == turn) {
            playersOfTurn[count++] = p;
        }
    }
    return playersOfTurn;
};
Field.prototype.shuffleTeams = function(){
	this.firstTurnPlayers = this.shuffle(this.firstTurnPlayers);
	this.secondTurnPlayers = this.shuffle(this.secondTurnPlayers);

	this.updateTeams(1);
	this.updateTeams(2);
}

Field.prototype.updateTeams = function (turn) {
    $('#field'+turn).find(".playerField").remove();

    players = turn == 1 ? this.firstTurnPlayers : this.secondTurnPlayers;

    if (players !== null && players !== undefined) {
        this.addPlayersToTeam('white', turn, players.slice(0, Math.floor(players.length / 2)));
        this.addPlayersToTeam('black', turn, players.slice(Math.floor(players.length / 2)), players.length);
    }

};

Field.prototype.refreshPlayersFromScreen = function (){

}

Field.prototype.shuffle =
    function (array) {
        var m = array.length,
            t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
};

Field.prototype.addPlayersToTeam = function (team, turn, players) {
    var $departments = $('#' + team + 'Team'+turn).find('.subDepartment:not(.gk)');
    var p = 0;
	if($departments.length > 0){
		while (p < players.length) {
			for (var i = 0; i < $departments.length && p < players.length; i++) {
				var dep = i;
				if(team == 'black'){
					dep = $departments.length - 1 - i;
				}
				$departments[dep].innerHTML += "<div class=\"playerField " + team + "\" draggable=\"true\">" + players[p++].Name + "</div>";
			}
		}
	}
    $departments.hide().fadeIn();
};

Field.prototype.addPlayersToTeam = function (team, turn, players) {
    var $departments = $('#' + team + 'Team'+turn).find('.subDepartment:not(.gk)');
    var p = 0;
	if($departments.length > 0){
		while (p < players.length) {
			for (var i = 0; i < $departments.length && p < players.length; i++) {
				var dep = i;
				if(team == 'black'){
					dep = $departments.length - 1 - i;
				}
				$departments[dep].innerHTML += "<div class=\"playerField " + team + "\" draggable=\"true\">" + players[p++].Name + "</div>";
			}
		}
	}
    $departments.hide().fadeIn();
};



