

document.addEventListener("DOMContentLoaded", function()
{
    var prevPlayerName = localStorage.getItem('playerName');
    var prevGameID     = localStorage.getItem('gameID');

    document.getElementById("playerName").value = prevPlayerName;
    document.getElementById("gameID").value     = prevGameID;

    console.log(`Previous values: ${prevPlayerName}, ${prevGameID}`);
});

document.getElementById('join_game').onclick = function() 
{
    // Get the data in the edits

    var playerName = document.getElementById("playerName").value;
    var gameID     = document.getElementById("gameID").value;

    // Save the data

    localStorage.setItem('playerName', playerName);
    localStorage.setItem('gameID', gameID);
    
    console.log(`${playerName}, ${gameID}`);
       
    window.location.href = 'controller.html';
};

