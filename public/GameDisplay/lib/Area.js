
class Area extends GameObject
{
    constructor()
    {
        super();
        
        this.objectShape = eObjectShape.RECTANGLE;
    }

    draw(gridSettings)
    {
        const finalPosition = new Vector();
        const finalSize     = new Size();

        finalPosition.x = this.position.x * gridSettings.squareSize;
        finalPosition.y = this.position.y * gridSettings.squareSize;

        finalSize.cx    = this.size.cx * gridSettings.squareSize; 
        finalSize.cy    = this.size.cy * gridSettings.squareSize; 
        
        push();

        translate(
            finalPosition.x,
            finalPosition.y);

        rotate(this.rotation);

        rectMode(CENTER);
        noStroke(0);
        fill(192, 64, 64, 64);

        rect(
            0,
            0,
            finalSize.cx,
            finalSize.cy);

        pop();
    }
    
}

class GoalArea extends Area
{
    constructor()
    {
        super();
        this.playerIndex = 0;
    }

    setPlayerIndex(playerIndex)
    {
        this.playerIndex = playerIndex;
    }

    getPlayerIndex()
    {
        return this.playerIndex;
    }
}