$(document).ready(

    function () {

        var cache = new PlayersCache();

        //players list
        var players = new Players(cache);

        //bench
        var bench = new Bench(cache);

        //field
        var field = new Field(cache);
        //field.showTeamForTurn(1);


        cache.updatePlayers();

        friendAdder = new FriendAdder(players.containerId);

        $('#turnToggle1').bind('click', function (event) {
            field.showTeamForTurn(1);
        });
        $('#turnToggle2').bind('click', function (event) {
            field.showTeamForTurn(2);
        });

        //bind events to buttons
        $('#addPlayer').bind('click', function (event) {
            friendAdder.addFriend();
        });

        $(".tt").tooltip({
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
                show: 400,
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
    this.firstTurnPlayers; // = this.shuffle(playerList.getPlayersOfTurn(1));
    this.secondTurnPlayers; // = this.shuffle(playerList.getPlayersOfTurn(2));

}
Field.prototype.onChange = function(players){
    this.firstTurnPlayers = this.shuffle(this.getPlayersOfTurn(players, 1));
    this.secondTurnPlayers = this.shuffle(this.getPlayersOfTurn(players, 2));
    this.showTeamForTurn(1);
}
Field.prototype.showTeamForTurn = function (turn) {
    this.updateTeams(turn);
};
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
Field.prototype.updateTeams = function (turn) {
    $('.fieldContainer').find(".playerField").remove();

    players = turn == 1 ? this.firstTurnPlayers : this.secondTurnPlayers;

    if (players !== null) {
        this.addPlayersToTeam('white', players.slice(0, Math.floor(players.length / 2)));
        this.addPlayersToTeam('black', players.slice(Math.floor(players.length / 2)), players.length);
    }

};
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

Field.prototype.addPlayersToTeam = function (team, players) {
    var $departments = $('#' + team + 'Team').find('.department');
    var p = 0;
    while (p < players.length) {
        for (var i = 0; i < $departments.length && p < players.length; i++) {
            $departments[i].innerHTML += "<div class=\"playerField " + team + "\">" + players[p++].Name + "</div>";
        }
    }
    $departments.hide().fadeIn();
};
