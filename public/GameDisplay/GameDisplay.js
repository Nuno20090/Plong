
var MyGameDisplayApp =
{
    ui:
    {
        colorBackgroud:
        {
            r: 255,
            g: 255,
            b: 255
        },
        fps: 30,
        pixelDensity: 1.0,

        gridSettings : new GridSettings(),

        ballConfetti : new ConfettiExplosion(),

        brickConfettis : [],
        currentBrickConfetti : 0
    },

    socketIO: io(),

    game:
    {
        ball : new Ball(),
        
        pads : [],
        walls: [],
        bricks: [],
        goals: [],

        players: [],

        score: [0, 0]
    },

    sync:
    {
        gameID : 0,
    },

    control:
    {
        manualStep: false
    }
}

function setup()
{
    MyGameDisplayApp.ui.colorBackgroud.r = random(222, 255);
    MyGameDisplayApp.ui.colorBackgroud.g = random(222, 255);
    MyGameDisplayApp.ui.colorBackgroud.b = random(222, 255);
    
    console.log('function setup begin');

    // Initialize the socket library

    InitSocket();
    
    // Initialize the canvas 
    
    pixelDensity(MyGameDisplayApp.ui.pixelDensity);
    createCanvas(windowWidth * 0.9, windowHeight * 0.9);
    frameRate(MyGameDisplayApp.ui.fps);
    
    // Initialize the world

    SetupDebugGrid();

    SetupObjects(MyGameDisplayApp.ui.gridSettings);
}

function InitSocket()
{
    // Connect to the server
    MyGameDisplayApp.socketIO = io();

    // Indicate what is our role

    var registerInfo = {};
    registerInfo.role = `gamedisplay`;
    MyGameDisplayApp.socketIO.emit(`register`, registerInfo);

    MyGameDisplayApp.socketIO.on(`gameID`, (msg) =>
    {
        MyGameDisplayApp.sync.gameID = msg;
    });

    MyGameDisplayApp.socketIO.on(`playerInfo`, (msg) =>
    {
        var numPlayersReceived = msg.length;
        
        while (MyGameDisplayApp.game.players.length < numPlayersReceived)
        {
            MyGameDisplayApp.game.players.push(new Player);
        }

        for (var curPlayer = 0; curPlayer < MyGameDisplayApp.game.players.length; curPlayer++)
        {
            MyGameDisplayApp.game.players[curPlayer].clear();
        }

        for (var curPlayer = 0; curPlayer < numPlayersReceived; curPlayer++)
        {
            MyGameDisplayApp.game.players[curPlayer].name = msg[curPlayer].name;
            MyGameDisplayApp.game.players[curPlayer].score = msg[curPlayer].score;
        }

        ResetObjectsPositions();
    });

    MyGameDisplayApp.socketIO.on(`controllerMessage`, (msg) =>
    {
        //console.log(`New Socet message received for a controller update`);

        if (msg.playerIndex >= MyGameDisplayApp.game.pads.length)
        {
            return;
        }
        
        var padToChange = MyGameDisplayApp.game.pads[msg.playerIndex];

        // Process the cases where the user is changing direction

        if (msg.leftPressed == false && padToChange.acceleration.x < 0)
        {
            // Not going to left anymore, so we can set the accel to 0
            padToChange.acceleration.x = 0;
        }
        if (msg.rightPressed == false && padToChange.acceleration.x > 0)
        {
            // Not going to left anymore, so we can set the accel to 0
            padToChange.acceleration.x = 0;
        }

        const scale = 2;
        const initialBoost = 200;

        if (msg.leftPressed)
        {
            if (msg.leftPressedCount == 1)
            {
                padToChange.acceleration.x = -initialBoost;
            }
            else
            {
                padToChange.acceleration.x -= msg.leftPressedCount * scale;
            }
            
        }
        
        if (msg.rightPressed)
        {
            if (msg.rightPressedCount == 1)
            {
                padToChange.acceleration.x = initialBoost;
            }
            else
            {
                padToChange.acceleration.x += msg.rightPressedCount * scale;
            }
        }        
    });

    //MyGameDisplayApp.socketIO.on(`syncBallData`, (msg) =>
    //{
    //    var sync = MyGameDisplayApp.sync;
    //    // Confirm that we are not the master of this game
    //    if (MyGameDisplayApp.sync.master == true)
    //    {
    //        console.log(`There's been a mistake! I'm the master and I'm receiving this!!`);
    //        return;
    //    }
    //
    //    // Check if this sync data regarding the last collision is the same as we have
    //    //console.log(`Msg vs Us`)
    //    //console.log(`Position X : ${msg.lastCollisionPosition    .x.toFixed(2)} : ${sync.lastCollisionPosition    .x.toFixed(2)}`);
    //    //console.log(`Position Y : ${msg.lastCollisionPosition    .y.toFixed(2)} : ${sync.lastCollisionPosition    .y.toFixed(2)}`);
    //    //console.log(`Velocity X : ${msg.lastCollisionVelocity    .x.toFixed(2)} : ${sync.lastCollisionVelocity    .x.toFixed(2)}`);
    //    //console.log(`Velocity Y : ${msg.lastCollisionVelocity    .y.toFixed(2)} : ${sync.lastCollisionVelocity    .y.toFixed(2)}`);
    //    //console.log(`Accel    X : ${msg.lastCollisionAcceleration.x.toFixed(2)} : ${sync.lastCollisionAcceleration.x.toFixed(2)}`);
    //    //console.log(`Accel    Y : ${msg.lastCollisionAcceleration.y.toFixed(2)} : ${sync.lastCollisionAcceleration.y.toFixed(2)}`);
    //
    //    // Update the ball state
    //    MyGameDisplayApp.game.ball.position.copy(msg.lastCollisionPosition);
    //    MyGameDisplayApp.game.ball.velocity.copy(msg.lastCollisionVelocity);
    //    MyGameDisplayApp.game.ball.acceleration.copy(msg.lastCollisionAcceleration);
    //
    //    // Update the bricks state
    //    for (var b = 0; b < MyGameDisplayApp.game.bricks.length; b++)
    //    {
    //        MyGameDisplayApp.game.bricks[b].enabled = msg.bricks[b];
    //    }
    //});
}

function draw()
{
    const gs = MyGameDisplayApp.ui.gridSettings;

    // Update objects movements

    if (MyGameDisplayApp.control.manualStep == false)
    {
        ApplySteps();
    }
    
    // Draw objects

    push();

    translate(gs.position.x, 
              gs.position.y);

    DrawBackground();
    
    //DrawDebugGrid();

    DrawObjects();

    // Draw Score

    DrawScore();

    // Draw confetties

    MyGameDisplayApp.ui.ballConfetti.Draw(gs);

    for (var c = 0; c < MyGameDisplayApp.ui.brickConfettis.length; c++)
    {
        MyGameDisplayApp.ui.brickConfettis[c].Draw(gs);
    }


    pop();

    // Draw the game ID

    DrawGameID();

}

function DrawBackground()
{
    // Background of the whole area
    background(255, 255, 255);

    // Background of play area
    const backColor = MyGameDisplayApp.ui.colorBackgroud;

    noStroke();
    fill(backColor.r, backColor.g, backColor.b);

    rect(0, 0,
         MyGameDisplayApp.ui.gridSettings.numSquaresCX * MyGameDisplayApp.ui.gridSettings.squareSize,
         MyGameDisplayApp.ui.gridSettings.numSquaresCY * MyGameDisplayApp.ui.gridSettings.squareSize);

    //background(
    //    backColor.r,
    //    backColor.g,
    //    backColor.b);
}

function SetupDebugGrid()
{
    // Define how much squares we want to have

    const gs = MyGameDisplayApp.ui.gridSettings;

    gs.numSquaresCX = 152;
    gs.numSquaresCY = 100;

    console.log(`Screen Width : ${width} px`);
    console.log(`Screen Heigth : ${height} px`);

    // Define the available space

    const availableSpaceX = Math.floor(width * 0.90);
    const availableSpaceY = Math.floor(height * 0.90);

    console.log(`Available Space X: ${availableSpaceX} px`);
    console.log(`Available Space Y: ${availableSpaceY} px`);

    // Determine what is the best square size

    const sizeSquareX = Math.floor(width / gs.numSquaresCX);
    const sizeSquareY = Math.floor(height / gs.numSquaresCY);
   
    const squareSize = sizeSquareX < sizeSquareY ? sizeSquareX : sizeSquareY;

    console.log(`SquareSize : ${squareSize} px`);
    
    gs.squareSize = squareSize;

    console.log(`SquareSize : ${squareSize} px`);

    const gridSizeCX = squareSize * gs.numSquaresCX;
    const gridSizeCY = squareSize * gs.numSquaresCY;

    gs.gridSize.set(gridSizeCX, gridSizeCY);
    
    console.log(`Total GridSize : ${gridSizeCX} x ${gridSizeCY} px`);

    // Determine where to draw the grid

    const gridLocationX = Math.round((width - gridSizeCX) / 2);
    const gridLocationY = Math.round((height - gridSizeCY) / 2);

    gs.position.set(gridLocationX, gridLocationY);

    console.log(`Grid Location : ${gridLocationX} x ${gridLocationY}`);
}

function SetupObjects(gridSettings)
{
    // Players

    MyGameDisplayApp.game.players.push(new Player);
    MyGameDisplayApp.game.players.push(new Player);

    // Outside walls

    const leftWall = new Wall();
    leftWall.size.set(1, gridSettings.numSquaresCY);
    leftWall.position.set(0.5, gridSettings.numSquaresCY / 2);
    MyGameDisplayApp.game.walls.push(leftWall);
    
    const rightWall = new Wall();
    rightWall.size.set(1, gridSettings.numSquaresCY);
    rightWall.position.set(gridSettings.numSquaresCX - 0.5, gridSettings.numSquaresCY / 2);
    MyGameDisplayApp.game.walls.push(rightWall);

    const topWall = new Wall();
    topWall.size.set(gridSettings.numSquaresCX, 1);
    topWall.position.set(gridSettings.numSquaresCX / 2, 0.5);
    MyGameDisplayApp.game.walls.push(topWall);

    // Separator

    const separatorWall = new Wall();
    separatorWall.size.set(8, 20);
    separatorWall.position.set((gridSettings.numSquaresCX / 2), 
                                gridSettings.numSquaresCY - (separatorWall.size.cy / 2));
    MyGameDisplayApp.game.walls.push(separatorWall);

    // Bricks

    const numLines = 3;
    const brickSize = new Size();
    brickSize.set(5, 2);

    const startPos = (leftWall.position.x) + (leftWall.size.cx / 2) + 1;
    const endPos   = (separatorWall.position.x - separatorWall.size.cx / 2) - brickSize.cx;

    //var xOffsetRightArea = separatorWall.position.x + (separatorWall.size.cx) - (brickSize.cx / 2);
    
    var curPosY = gridSettings.numSquaresCY - (2 + (numLines * (brickSize.cy + 1)));

    for (var curLine = 0; curLine < numLines; curLine++)
    {
        var firstPosOnThisLine;
        if (curLine % 2 == 0)
        {
            firstPosOnThisLine = startPos;
        }
        else
        {
            firstPosOnThisLine = startPos + (brickSize.cx + 1) / 2;
        }

        for (var curPosX = firstPosOnThisLine; curPosX < endPos; curPosX += (brickSize.cx + 1))
        {
            var brickPosX = curPosX + (brickSize.cx / 2);

            // Create a new brick on the left

            var newBrick = new Brick;
            newBrick.position.set(brickPosX, curPosY);
            newBrick.size.copy(brickSize);
            MyGameDisplayApp.game.bricks.push(newBrick);

            // Create a new brick on the right
            var newBrick = new Brick;
            newBrick.position.set(gridSettings.numSquaresCX - brickPosX, curPosY);
            newBrick.size.copy(brickSize);
            MyGameDisplayApp.game.bricks.push(newBrick);
        }

        curPosY += brickSize.cy + 1;
    }
    
    // Goal Areas 

    const goalAreaLeft = new GoalArea();
    goalAreaLeft.setPlayerIndex(1); // Yes, it's inverted
    goalAreaLeft.size.set(gridSettings.numSquaresCX / 2, 10);
    goalAreaLeft.position.set(gridSettings.numSquaresCX / 4, gridSettings.numSquaresCY + 5);
    MyGameDisplayApp.game.goals.push(goalAreaLeft);

    const goalAreaRight = new GoalArea();
    goalAreaRight.setPlayerIndex(0);  // Yes, it's inverted
    goalAreaRight.size.set(gridSettings.numSquaresCX / 2, 10);
    goalAreaRight.position.set((gridSettings.numSquaresCX / 4) * 3, gridSettings.numSquaresCY + 5);
    MyGameDisplayApp.game.goals.push(goalAreaRight);

    // Pads

    padLeft = new Pad();
    padLeft.minimumPositionX = leftWall.position.x + (leftWall.size.cx / 2) + (padLeft.size.cx / 2);
    padLeft.maximumPositionX = separatorWall.position.x - (separatorWall.size.cx / 2) - (padLeft.size.cx / 2);
    padLeft.resetPosition();
    
    MyGameDisplayApp.game.pads.push(padLeft);

    padRight = new Pad();
    padRight.minimumPositionX = separatorWall.position.x + (separatorWall.size.cx / 2) + (padRight.size.cx / 2);
    padRight.maximumPositionX = rightWall.position.x - (leftWall.size.cx / 2) - (padRight.size.cx / 2);
    padRight.resetPosition();

    MyGameDisplayApp.game.pads.push(padRight);

    // UI elements
    
    for (var c = 0; c < 10; c++)
    {
        MyGameDisplayApp.ui.brickConfettis.push(new ConfettiExplosion);
    }

}

function DrawDebugGrid()
{
    push();

    const gs = MyGameDisplayApp.ui.gridSettings;

    strokeWeight(1);
    stroke(255, 192, 192);

    for (var curY = 0; curY <= gs.numSquaresCY; curY++)
    {
        line(
            0,
            curY * gs.squareSize, 
            gs.gridSize.cx, 
            curY * gs.squareSize);
    }
    for (var curX = 0; curX <= gs.numSquaresCX; curX++)
    {
        line(
            curX * gs.squareSize, 
            0,
            curX * gs.squareSize,
            gs.gridSize.cy); 
    }

    pop();
}

function DrawObjects()
{
    const game = MyGameDisplayApp.game;
    const gs = MyGameDisplayApp.ui.gridSettings;

    // Ball

    game.ball.draw(gs);

    // Pads

    for (var i = 0; i < game.pads.length; i++)
    {
        const pad = game.pads[i];
        pad.draw(gs);
    }

    // Walls

    for (var i = 0; i < game.walls.length; i++)
    {
        const wall = game.walls[i];
        wall.draw(gs);
    }

    // Bricks

    for (var i = 0; i < game.bricks.length; i++)
    {
        const brick = game.bricks[i];
        brick.draw(gs);
    }

    // Areas (for test only)

    //for (var i = 0; i < game.goals.length; i++)
    //{
    //    const goal = game.goals[i];
    //    goal.draw(gs);
    //}
}

function DrawScore()
{
    const gs = MyGameDisplayApp.ui.gridSettings;
    const game = MyGameDisplayApp.game;

    // Draw player's names

    fill(0, 0, 0);
    textSize(gs.squareSize * 7);

    const marginSide = 30;
    const marginTop = 5;

    push()
    textAlign(LEFT, TOP);
    translate(gs.squareSize * marginSide, 
              gs.squareSize * marginTop);

    text(`${game.players[0].name}`, 0, 0);
    pop();

    push()
    textAlign(RIGHT, TOP);
    translate(gs.squareSize * (gs.numSquaresCX - marginSide), 
              gs.squareSize * marginTop);
    text(`${game.players[1].name}`, 0, 0);
    pop();

    // SCORES

    textSize(gs.squareSize * 10);

    fill(0, 0, 0);

    push();
    textAlign(LEFT, TOP);
    translate((2 * gs.squareSize), 
              (4 * gs.squareSize));
    rotate(-(PI * 0.05));
    text(`${game.players[0].score}`, 0, 0);
    pop();

    // Draw score of player 2
    push();
    textAlign(RIGHT, TOP);
    translate(((gs.numSquaresCX - 2) * gs.squareSize), 
              (4 * gs.squareSize));
    rotate(PI * 0.05);
    text(`${game.players[1].score}`, 0, 0);
    pop();


}

function DrawGameID()
{
    const gs = MyGameDisplayApp.ui.gridSettings;

    textSize(gs.squareSize * 2);
    fill(92, 92, 92);
    textAlign(LEFT, TOP);
    text(`Game ID: ${MyGameDisplayApp.sync.gameID}`, 0, 0);
}

function ProcessCollisions()
{
    const ball = MyGameDisplayApp.game.ball;

    // Check the collisions between the ball and the goal areas

    for (var i = 0; i < MyGameDisplayApp.game.goals.length; i++)
    {
        const goalArea = MyGameDisplayApp.game.goals[i];
        if (checkAreaCollision(ball, goalArea))
        {
            const playerIndex = goalArea.getPlayerIndex();
            PlayerScored(playerIndex);
        }
    }

    // Check the pads

    var anyCollision = false;

    for (var i = 0; i < MyGameDisplayApp.game.pads.length; i++)
    {
        const pad = MyGameDisplayApp.game.pads[i];
        if (CheckCollision(ball, pad).collision == true)
        {
            anyCollision = true;
        }

    }    

    // Check against the walls

    for (var i = 0; i < MyGameDisplayApp.game.walls.length; i++)
    {
        const wall = MyGameDisplayApp.game.walls[i];
        if (CheckCollision(ball, wall).collision == true)
        {
            anyCollision = true;
        }
    }

    // Check against the bricks

    for (var i = 0; i < MyGameDisplayApp.game.bricks.length; i++)
    {
        const brick = MyGameDisplayApp.game.bricks[i];
        if (brick.enabled == false)
        {
            continue;
        }

        if (CheckBrickCollision(ball, brick).collision == true)
        {
            anyCollision = true;
        }
    }
}

function CheckCollision(ball, object)
{
    const overlap = Collision.CheckOverlap(ball, object);

    if (overlap.collision)
    {
        Collision.ResolveIntrusion(ball, object);

        // Get the magnitude of the velocity 

        const ballVelocityMagnitude = ball.velocity.magnitude();
        const angleVelocity = ball.velocity.angle();

        // Get the angle of the collision
        let angleCollision = overlap.collisionVector.angle();

        // Check if this collision needs to be ignored (Pull towards corner bug)
        const diffAngles = Vector.AngleBetween(ball.velocity, 
                                               overlap.collisionVector);

        if (abs(diffAngles) > HALF_PI)
        {
           // Adjust the angle of the collision until it becomes smaller than 90º
            
            const newAngleCollision = Vector.AdjustAngleToNearest(angleVelocity, angleCollision, HALF_PI * .75);

            //console.log(`** Collision adjusted because of PULL bug **`);
            //console.log(`COLLISION`);
            //console.log(`  angleVelocity      : ${angleVelocity.toFixed(4)}`);
            //console.log(`  diffAngles         : ${diffAngles.toFixed(4)}`);
            //console.log(`  angleCollision     : ${angleCollision.toFixed(4)}`);
            //console.log(`  newAngleCollision  : ${newAngleCollision.toFixed(4)}`);

            angleCollision = newAngleCollision;
        }

        // Calculate the reflection angle
        const reflexionAngle = (angleVelocity - angleCollision) - HALF_PI;

        // Calculate the new direction of the velocity
        const angleNewVelocity = angleVelocity - (reflexionAngle * 2);

        // Build a new vector with all the correct values
        const newVelocity = new Vector;

        newVelocity.fromAngle(angleNewVelocity);
        newVelocity.scaleTo(ballVelocityMagnitude);

        ball.velocity.copy(newVelocity);

        if (false)
        {
            console.log(`COLLISION`);
            console.log(`  angleVelocity   : ${angleVelocity.toFixed(4)}`);
            console.log(`  diffAngles      : ${diffAngles.toFixed(4)}`);
            console.log(`  angleCollision  : ${angleCollision.toFixed(4)}`);
            console.log(`  reflexionAngle  : ${reflexionAngle.toFixed(4)}`);
            console.log(`  angleNewVelocity: ${angleNewVelocity.toFixed(4)}`);
        }
    }

    return overlap;
}

function checkAreaCollision(ball, area)
{
    const overlap = Collision.CheckOverlap(ball, area);

    return overlap.collision;
}

function CheckBrickCollision(ball, brick)
{
    //return;
    const overlap = CheckCollision(ball, brick);
    
    if (overlap.collision)
    {
        brick.enabled = false;

        const cftExpl = getNextBrickConfetti();

        cftExpl.CreateExplosion(brick.position, new Vector(), 20, brick.color);
    }

    return overlap;
}

function getNextBrickConfetti()
{
    const ui = MyGameDisplayApp.ui;

    var exp = ui.brickConfettis[ui.currentBrickConfetti % ui.brickConfettis.length];
    ui.currentBrickConfetti++;
    return exp;

}

function keyPressed()
{
    if (keyCode == 77) // 'M'
    {
        MyGameDisplayApp.control.manualStep = !MyGameDisplayApp.control.manualStep;
    }
    if (keyCode == 32)
    {
        if (MyGameDisplayApp.control.manualStep)
        {
            ApplySteps();
        }
    }
}

function ApplySteps()
{
    const precision = 5;

    const game = MyGameDisplayApp.game;

    for (var i = 0; i < precision; i++)
    {   
        // Process the movement of the pads

        for (var currentPad = 0; currentPad < game.pads.length; currentPad++)
        {
            const pad = game.pads[currentPad];

            pad.applyStep(1 / (30 * precision));
            pad.KeepInBounds();
        }

        // Process the movement of the ball

        MyGameDisplayApp.game.ball.increseStep();
        MyGameDisplayApp.game.ball.applyStep(1 / (30 * precision));

        // Fancy stuff

        MyGameDisplayApp.ui.ballConfetti.step(1 / (30 * precision));
        for (var c = 0; c < MyGameDisplayApp.ui.brickConfettis.length; c++)
        {
            MyGameDisplayApp.ui.brickConfettis[c].step(1 / (30 * precision));
        }

        ProcessCollisions();
    }
}

function PlayerScored(playerIndex)
{
    const game = MyGameDisplayApp.game;

    const explosionColor = new Color();
    explosionColor.r = 244;
    explosionColor.g = 0;
    explosionColor.b = 0;

    var explosionPos = new Vector();
    explosionPos.set(50, 50);

    var explosionDirection = new Vector();
    explosionDirection.set(100, 0);

    MyGameDisplayApp.ui.ballConfetti.CreateExplosion(game.ball.position, 
                                                     game.ball.velocity.scale(1),
                                                     game.ball.velocity.magnitude(),
                                                     explosionColor);

    // Increase the score of the player
    game.players[playerIndex].score++;

    ResetObjectsPositions();
}

function ResetObjectsPositions()
{
    const game = MyGameDisplayApp.game;

    // Reset ball position

    game.ball.resetPosition();

    // Reset pads position

    for (var i = 0; i < game.pads.length; i++)
    {
        const pad = game.pads[i];
        pad.resetPosition();
    }

    // Reset bricks

    for (var i = 0; i < game.bricks.length; i++)
    {
        const brick = game.bricks[i];
        brick.enabled = true;
    }
}


