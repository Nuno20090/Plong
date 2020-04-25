
var MyControllerApp =
{
    ui:
    {
        colorBackgroudPressed:
        {
            r: 192,
            g: 128,
            b: 128
        },

        colorBackgroudNotPressed:
        {
            r: 92,
            g: 92,
            b: 92
        },

        fps: 30,
        pixelDensity: 1.0
    },

    socketIO: {},

    controller:
    {
        state : new ControllerState(),
        prevState : new ControllerState()
    }
};

function setup()
{
    // Initialize the socket library

    InitSocket();

    // Initialize the canvas 

    pixelDensity(MyControllerApp.ui.pixelDensity);
    createCanvas(windowWidth, windowHeight);
    frameRate(MyControllerApp.ui.fps);
}

function InitSocket()
{
    // Connect to the server
    MyControllerApp.socketIO = io();

    // Get the data inserted by the user
    var playerName = localStorage.getItem('playerName');
    var gameID     = localStorage.getItem('gameID');

    // Indicate what is our role
    var registerInfo = {};
    registerInfo.role       = "controller";
    registerInfo.playerName = playerName;
    registerInfo.gameID     = gameID;

    MyControllerApp.socketIO.emit("register", registerInfo);
}

function draw()
{
    ProcessInput();

    DrawBackground();
    DrawPressIndicators();
    DrawArrows();
}

function DrawBackground()
{
    const backColorNotPressed = MyControllerApp.ui.colorBackgroudNotPressed;

    background(
        backColorNotPressed.r,
        backColorNotPressed.g,
        backColorNotPressed.b);
}

function DrawPressIndicators()
{
    noStroke();
    
    const backColorPressed = MyControllerApp.ui.colorBackgroudPressed;

    if (MyControllerApp.controller.state.leftPressed)
    {
        fill(
            backColorPressed.r,
            backColorPressed.g,
            backColorPressed.b);

        rect(
            0,
            0,
            windowWidth / 2,
            windowHeight);
    }


    if (MyControllerApp.controller.state.rightPressed)
    {
        fill(
            backColorPressed.r,
            backColorPressed.g,
            backColorPressed.b);

        rect(
            windowWidth / 2, 
            0,
            windowWidth / 2, 
            windowHeight);
    }
}

function DrawArrows()
{
    fill(127, 127, 127);
    noStroke();

    beginShape();
    vertex(windowWidth * 0.20, windowHeight * 0.50);
    vertex(windowWidth * 0.30, windowHeight * 0.30);
    vertex(windowWidth * 0.30, windowHeight * 0.70);
    endShape(CLOSE);

    beginShape();
    vertex(windowWidth * 0.80, windowHeight * 0.50);
    vertex(windowWidth * 0.70, windowHeight * 0.30);
    vertex(windowWidth * 0.70, windowHeight * 0.70);
    endShape(CLOSE);
}

function ProcessInput()
{
    UpdateControlState();

    if (MyControllerApp.controller.state.IsEqual(MyControllerApp.controller.prevState) == false)
    {
        //MyControllerApp.controller.state.Log();

        // Create an update with the current set of data

        var controllerUpdate = 
        {
            leftPressed       : MyControllerApp.controller.state.leftPressed,
            leftPressedCount  : MyControllerApp.controller.state.leftPressedCount,

            rightPressed      : MyControllerApp.controller.state.rightPressed,
            rightPressedCount : MyControllerApp.controller.state.rightPressedCount
        }

        MyControllerApp.socketIO.emit('controllerUpdate', controllerUpdate);

        // Update the previous data
        MyControllerApp.controller.prevState.CopyFrom(MyControllerApp.controller.state);
    }
}

function UpdateControlState()
{
    var mouseStateLeft = false;
    var mouseStateRight = false;

    var touchStateLeft = false;
    var touchStateRight = false;

    // Check if the mouse is pressed

    if (mouseIsPressed)
    {
        //console.log("Mouse is pressed");
        if (mouseX < (windowWidth / 2))
        {
            mouseStateLeft = true;
        }
        else
        {
            mouseStateRight = true;
        }
    }
    else
    {
        //console.log("Mouse is not pressed");

        // If nothing is pressed, 
        mouseStateLeft = false;
        mouseStateRight = false;
    }

    // Check the touches

    if (touches.length > 0)
    {

        if (mouseX < (windowWidth / 2))
        {

            touchStateLeft = true;
        }
        else
        {
            touchStateRight = true;
        }
    }

    const finalCurrentStateLeft = mouseStateLeft || touchStateLeft;
    const finalCurrentStateRight = mouseStateRight || touchStateRight;

    // Update the vars

    if (finalCurrentStateLeft)
    {
        MyControllerApp.controller.state.leftPressed = true;
        MyControllerApp.controller.state.leftPressedCount++;
    }
    else
    {
        MyControllerApp.controller.state.leftPressed = false;
        MyControllerApp.controller.state.leftPressedCount = 0;
    }

    if (finalCurrentStateRight)
    {
        MyControllerApp.controller.state.rightPressed = true;
        MyControllerApp.controller.state.rightPressedCount++;
    }
    else
    {
        MyControllerApp.controller.state.rightPressed = false;
        MyControllerApp.controller.state.rightPressedCount = 0;
    }
}
