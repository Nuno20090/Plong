

//--------------------------------------------------
// Application Data

var MyApp =
{
    modules: {},

    expressApp: {},
    httpServer: {
        server: {},
        port: process.env.PORT
    },

    socketIO: {},

    games: [],
    connections2Games : new Map(),

    uniqueGameID: 1
};

async function main()
{
    // Load the modules

    await LoadModules();

    // Create the app

    MyApp.app = MyApp.modules.express();

    // Create the HTTP Server

    MyApp.httpServer.server = MyApp.modules.http.createServer(MyApp.app);

    // Setup Express - Not sure I want to do this?

    MyApp.app.use(MyApp.modules.express.static(__dirname + '/public'));

    // Init the Socket IO module

    MyApp.socketIO = MyApp.modules.socketIO(MyApp.httpServer.server);

    // Configure the Socket IO Events

    await ConfigureSocketIOEvents();

    // Start the HTTP Server

    MyApp.httpServer.server.listen(MyApp.httpServer.port, () =>
    {
        console.log(`Listening on port ${MyApp.httpServer.port}...`);
    });
}

async function LoadModules()
{
    MyApp.modules.express   = require('express');
    MyApp.modules.http      = require('http');
    MyApp.modules.socketIO  = require('socket.io');
    MyApp.modules.game      = require('./lib/game.js');
    MyApp.modules.player    = require('./lib/player.js');
    MyApp.modules.display   = require('./lib/display.js');
}

async function ConfigureSocketIOEvents()
{
    console.log('Configuring SocketIO Events...');

    MyApp.socketIO.on('connection', OnSocketIONewConnection);

    console.log('Done');
}

function OnSocketIONewConnection(socket)
{
    console.log(`New Client connected in socket ${socket.id}`);

    socket.on('disconnect', () =>
    {
        console.log(`A client had disconnected.`);
        
        const gameToUse = MyApp.connections2Games.get(socket.id);

        if (gameToUse)
        {
            // Check if the source was a controller

            var done = false;

            for (p = 0; p < gameToUse.players.length && done == false; p++)
            {
                if (gameToUse.players[p].playerID == socket.id)
                {
                    console.log(`  The player at index ${p} was removed from game ${gameToUse.gameID}`);

                    // Remove this player from the list
                    gameToUse.players.splice(p, 1);
                    gameToUse.reset(socket);

                    done = true;
                }
            }

            // Check if the source was a display.
            // If it was the last display, kill the game.

            var shouldRemoveGame = false;

            for (d = 0; d < gameToUse.displays.length && done == false; d++)
            {
                if (gameToUse.removeDisplay(socket.id))
                {
                    // Remove this display from the list
                    console.log(`  The display at index ${d} was removed from game ${gameToUse.gameID}`);

                    if (gameToUse.displays.length == 0)
                    {
                        shouldRemoveGame = true;
                    }
                    done = true;
                }
            }

            if (shouldRemoveGame)
            {
                console.log(`  No more screen for this game. Removing this game...`);
                for (var g = 0; g < MyApp.games.length; g++)
                {
                    if (MyApp.games[g].gameID == gameToUse.gameID)
                    {
                        console.log(`  Game ${gameToUse.gameID} is removed.`);
                        MyApp.games.splice(g, 1);
                    }
                }
            }
        }
    });

    socket.on('register', (data) =>
    {
        var gameToUse = null;

        // If we're registering a new display, create a new Game
        if (data.role == "gamedisplay")
        {
            // Create a new game            

            newGame = new MyApp.modules.game();
            newGame.gameID = MyApp.uniqueGameID++;
            newGame.socketIO = socket;
            MyApp.games.push(newGame);

            gameToUse = newGame;

            // Create a new game display

            console.log(`  Creating a new display...`);
            
            const newDisplay     = new MyApp.modules.display();
            newDisplay.displayID = socket.id;
            newDisplay.game      = gameToUse;
            gameToUse.addDisplay(newDisplay);

            // Indicate to the display what is the game ID generated
            socket.emit('gameID', gameToUse.gameID);

            // Save this connection into the map, so we can find the game quickly
            MyApp.connections2Games.set(socket.id, gameToUse);

        }
        else if (data.role == "controller") 
        {
            // Check if we can find the game with that ID
            
            for (var curGame = 0; curGame < MyApp.games.length; curGame++)
            {
                var game = MyApp.games[curGame];
                if (game.gameID == data.gameID)
                {
                    gameToUse = game;
                }
            }

            if (gameToUse !== null)
            {
                const newPlayer    = new MyApp.modules.player();
                newPlayer.playerID = socket.id;
                newPlayer.game     = gameToUse;
                newPlayer.name     = data.playerName;
                gameToUse.addPlayer(newPlayer);

                // Save this connection into the map, so we can find the game quickly
                MyApp.connections2Games.set(socket.id, gameToUse);

                gameToUse.transmitPlayerInfo(socket);
            }
            else
            {
                console.log(`The specified game was not found. GameID: ${data.gameID}`)
            }
        }
        else
        {
            console.log(`  This role is not known (?)`);
            return;
        }

        // Log the stats of this game
        if (gameToUse !== null)
        {
            gameToUse.log();
        }
    });

    socket.on('controllerUpdate', (data) => 
    {
        // Find the game associated with this socket ID

        let game = MyApp.connections2Games.get(socket.id);
        if (game)
        {
            game.processControllerInput(socket, socket.id, data);
        }
    });

    //socket.on('syncBallData', (data) => 
    //{
    //    // Find the game associated with this socket ID
    //
    //    let game = MyApp.connections2Games.get(socket.id);
    //    if (game)
    //    {
    //        game.processBallSyncData(socket, data);
    //    }
    //
    //});
}




main();