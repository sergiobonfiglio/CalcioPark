$(document).ready(

    function () {

        //players list
        var players = new Players();
        players.updatePlayers();

        //bench
        var bench = new Bench();
        bench.updateBench(bench);

        //field
        var field = new Field(players);
        field.showTeamForTurn(1);

        friendAdder = new FriendAdder(players.containerId);

        $('#turnToggle1').bind('click', function (event) {
            field.showTeamForTurn(1);
        });
        $('#turnToggle2').bind('click', function (event) {
            field.showTeamForTurn(2);
        });

        //bind events to buttons
        $('#addPlayer').bind('click', function (event) {
            friendAdder.addFriend()
        });


        //init tooltip
        $('.tt').tooltip({
            placement: 'left',
            'delay': {
                show: 400,
            }
        });
    }

);

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
}

FriendAdder.prototype.commitFriend = function (write) {
    $('#newPlayer').fadeOut().remove();
    $('#addingAlert').fadeOut().remove();
    this.addingFriend = false;
}


//Players base class
function PlayersList(containerId) {

    this.containerId = containerId;

    this.addPlayer = function (name, divClass, badgeClass, badgeContent, tooltip) {
        var title = "";
        if (tooltip != null) {
            badgeClass += " tt";
            title = "title='" + tooltip + "'";
        }
        $(this.containerId).append(
            "<div class=\"player " + divClass + "\">" + name +
            "<span class=\"" + badgeClass + " badge pull-right\" " + title + ">" +
            badgeContent +
            "</span></div>"
        );
    }
}

Players.prototype = new PlayersList('#playersContainer');
Players.constructor = Players;

function Players() {
    this.addingFriend = false;
    this.players = this.getPlayers();


}
Players.prototype.getPlayersOfTurn = function (turn) {
    var playersOfTurn = [];
    var count = 0;
    for (var i = 0; i < this.players.length; i++) {
        var p = this.players[i];
        if (p.turn == 3 || p.turn == turn) {
            playersOfTurn[count++] = p;
        }
    }
    return playersOfTurn;
}

Players.prototype.getPlayers = function () {
    var players = [
        {
            name: "Luca",
            turn: 3
            }, {
            name: "Marzio",
            turn: 3
        }, {
            name: "Paolo",
            turn: 3
        }, {
            name: "Piero",
            turn: 3
        }, {
            name: "Pirlo",
            turn: 3
        }, {
            name: "Scavo",
            turn: 3
        }, {
            name: "SerBo",
            turn: 3
        }, {
            name: "Rondine",
            turn: 1
        }, {
            name: "Massena",
            turn: 1,
            mandatory: true
        }
        , {
            name: "Amico",
            turn: 1,
            mandatory: true,
            proposed: true,
        }

    ];
    return players;
}


Players.prototype.updatePlayers = function () {
    this.players = this.getPlayers();
    $(this.containerId).text("");
    for (var i = 0; i < this.players.length; i++) {
        var p = this.players[i];
        var tooltip;
        var divClass = p.proposed ? "proposed" : "";
        var badgeClass = "";
        if (p.mandatory) {
            tooltip = "Solo " + p.turn + "&deg; turno";
            badgeClass = "mandatory";
        } else if (!p.mandatory && p.turn < 3) {
            badgeClass = "preferred";
            tooltip = "Preferibilmente " + p.turn + "&deg; turno";
        }
        //badgeClass = p.mandatory ? "mandatory" : p.turn < 3 ? "preferred" : "";

        var badgeContent = p.turn == 3 ? "1&deg;-2&deg;" : p.turn.toString() + "&deg;";

        //add players to list
        this.addPlayer(p.name, divClass, badgeClass, badgeContent, tooltip);
    }
    this.updateCounts()
}
Players.prototype.setProgressBar = function (turn, type, count) {
    var prefix = "#progress";
    var sep = "-";
    var id = prefix + turn + sep + type;
    //$(id).css("width", (100 * count / 14) + "%");
    $(id).animate({
        width: (100 * count / 14) + "%"
    });
    $(id).text((!isNaN(count) && count != 0) ? count : "");
}
Players.prototype.updateCounts = function () {
    var countsBoth = 0;
    var countsFirstTurn = {};
    var countsSecondTurn = {};
    //init
    countsFirstTurn['movable'] = 0;
    countsSecondTurn['movable'] = 0;
    countsFirstTurn['mandatory'] = 0;
    countsSecondTurn['mandatory'] = 0;

    for (var i = 0; i < this.players.length; i++) {
        var p = this.players[i];

        if (p.turn == 3) {
            countsBoth++;
        } else {
            countsFirstTurn['movable'] += (p.turn == 1 && (p.mandatory == null || p.mandatory == false)) ? 1 : 0;
            countsSecondTurn['movable'] += (p.turn == 2 && (p.mandatory == null || p.mandatory == false)) ? 1 : 0;
            countsFirstTurn['mandatory'] += (p.turn == 1 && p.mandatory == true) ? 1 : 0;
            countsSecondTurn['mandatory'] += (p.turn == 2 && p.mandatory == true) ? 1 : 0;
        }

    }

    this.setProgressBar(1, "both", countsBoth);
    this.setProgressBar(2, "both", countsBoth);
    this.setProgressBar(1, "movable", countsFirstTurn['movable']);
    this.setProgressBar(2, "movable", countsSecondTurn['movable']);
    this.setProgressBar(1, "mandatory", countsFirstTurn['mandatory']);
    this.setProgressBar(2, "mandatory", countsSecondTurn['mandatory']);
}




function Bench() {}
Bench.prototype = new PlayersList('#benchContainer');
Bench.prototype.getBench = function () {
    var players = [
        {
            name: "Luca",
            answer: "x"
        },
        {
            name: "Marzio",
            answer: "?"
        },
        {
            name: "Paolo"
        },
        {
            name: "Piero"
        }
    ];
    return players;
}
Bench.prototype.updateBench = function () {
    var players = this.getBench();
    $(this.containerId).text("");
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var tooltip = "Nessuna risposta";
        var badgeClass = "unknown";
        var divClass = (p.answer == null) ? "unknown" : "";
        if (p.answer != null && p.answer == "x") {
            badgeClass = "mandatory";
            tooltip = "Assente";
        } else if (p.answer != null && p.answer == "?") {
            badgeClass = "preferred";
            tooltip = "Non so ancora";
        }
        var badgeContent = (p.answer == null) ? "-" : p.answer;

        //add players to list
        this.addPlayer(p.name, divClass, badgeClass, badgeContent, tooltip);

    }
}

function Field(playerList) {
    //this.players = playerList;
    this.firstTurnPlayers = this.shuffle(playerList.getPlayersOfTurn(1));
    this.secondTurnPlayers = this.shuffle(playerList.getPlayersOfTurn(2));

}
Field.prototype.showTeamForTurn = function (turn) {
    this.updateTeams(turn);
}

Field.prototype.updateTeams = function (turn) {
    $('.fieldContainer').find(".playerField").remove()

    players = turn == 1 ? this.firstTurnPlayers : this.secondTurnPlayers;
    //players = this.shuffle(playersOfTurn);

    this.addPlayersToTeam('white', players.slice(0, Math.floor(players.length / 2)));
    this.addPlayersToTeam('black', players.slice(Math.floor(players.length / 2)), players.length);

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
}

Field.prototype.addPlayersToTeam = function (team, players) {
    var $departments = $('#' + team + 'Team').find('.department');
    var p = 0;
    while (p < players.length) {
        for (var i = 0; i < $departments.length && p < players.length; i++) {
            $departments[i].innerHTML += "<div class=\"playerField " + team + "\">" + players[p++].name + "</div>";
        }
    }
    $departments.hide().fadeIn();
}
