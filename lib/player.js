
class Player
{
    constructor()
    {
        this.playerID = 0;
        this.score = 0;
        this.index = 0;
        this.game = 0;
        this.name = 0;
    }

    resetScore()
    {
        this.score = 0;
    }

    setIndex(index)
    {
        this.index = index;
    }

    setGame(game)
    {
        this.game = game;
    }
}

module.exports = Player;