
class Pad extends GameObject
{
    constructor()
    {
        super();
        
        this.objectShape = eObjectShape.RECTANGLE;
        this.size.set(18, 2);
        this.position.set(75,85);

        this.minimumPositionX = 0;
        this.maximumPositionX = 0;

        this.friction = 5;

        this.resetPosition();
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
        fill(26, 91, 49);
        
        rect(
            0,
            0,
            finalSize.cx,
            finalSize.cy);

        if (false)
        {
            // Draw velocity
            stroke(0, 0, 255);
            line(0, 0, this.velocity.x, this.velocity.y);

            // Draw acceleration
            stroke(122, 0, 122);
            line(0, 0, this.acceleration.x, this.acceleration.y);

            // Draw Last Position
            if (this.prevPosition.x != 0 && this.prevPosition.y != 0)
            {
                fill('orange');
                stroke(0, 0, 0);
                strokeWeight(2);
                ellipseMode(CENTER);
                ellipse((this.prevPosition.x - this.position.x) * gridSettings.squareSize,
                        (this.prevPosition.y - this.position.y) * gridSettings.squareSize,
                        7,
                        7);
            }
        }

        pop();
    }

    KeepInBounds()
    {
        if (this.position.x < this.minimumPositionX)
        {
            this.position.x = this.minimumPositionX;
            this.velocity.x = 0;
            this.acceleration.x = 0;
        }

        if (this.position.x > this.maximumPositionX)
        {
            this.position.x = this.maximumPositionX;
            this.velocity.x = 0;
            this.acceleration.x = 0;
        }
    }

    resetPosition()
    {
        this.position.x = this.minimumPositionX + ((this.maximumPositionX - this.minimumPositionX) / 2);
    }

}