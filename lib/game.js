
class Game
{
    constructor()
    {
        this.gameID = 0;
        this.players = [];
        this.displays = [];

        this.socketIO = {};
    }

    addPlayer(player)
    {
        this.players.push(player);
    }

    addDisplay(display)
    {
        this.displays.push(display);
    }
    
    removeDisplay(displayID)
    {
        for (var d = 0; d < this.displays.length; d++)
        {
            if (this.displays[d].displayID == displayID)
            {
                this.displays.splice(d, 1);

                return true;
            }
        }
        return false;        
    }

    log()
    {
        console.log(`Game Stats`);
        console.log(`  ID            : ${this.gameID}`);
        console.log(`  Players Count : ${this.players.length}`);
        for (var p = 0; p < this.players.length; p++)
        {
            console.log(`    ${this.players[p].playerID}`);
        }
        console.log(`  Displays Count: ${this.displays.length}`);
        for (var p = 0; p < this.displays.length; p++)
        {
            console.log(`    ${this.displays[p].displayID} : ${this.displays[p].master}`);
        }
    }

    processControllerInput(socketIO, playerID, data)
    {
        // Find the player that send the data
        var curPlayer = 0;
        for (; curPlayer < this.players.length; curPlayer++)
        {
            var player = this.players[curPlayer];
            if (player.playerID == playerID)
            {
                break;
            }
        }

        if (curPlayer != 0 && curPlayer != 1)
        {
            return;
        }

        // Append the player index to the data

        data.playerIndex = curPlayer;

        // We need to send data to all the displays

        for (var curDisplay = 0; curDisplay < this.displays.length; curDisplay++)
        {
            var display = this.displays[curDisplay];
            socketIO.broadcast.to(display.displayID).emit('controllerMessage', data);
        }
    }

    transmitPlayerInfo(socketIO)
    {
        var playersData = [];
        
        for (var curPlayer = 0; curPlayer < this.players.length; curPlayer++)
        {
            var playerInfo = {};

            playerInfo.index = this.players[curPlayer].index;
            playerInfo.score = this.players[curPlayer].score;
            playerInfo.name  = this.players[curPlayer].name;
            
            playersData.push(playerInfo);
        }        
        
        for (var curDisplay = 0; curDisplay < this.displays.length; curDisplay++)
        {
            var display = this.displays[curDisplay];
            socketIO.broadcast.to(display.displayID).emit(`playerInfo`, playersData);
        }
    }

    reset(socketIO)
    {
        // This should start a new game
        // Continue here

        for (var curPlayer = 0; curPlayer < this.players.length; curPlayer++)
        {
            this.players[curPlayer].score = 0;
        }

        this.transmitPlayerInfo(socketIO);
    }
}

module.exports = Game;

