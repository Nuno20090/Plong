
class Wall extends GameObject
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

        rectMode(CENTER);
        noStroke(0);
        fill(74, 92, 219);

        rect(
            0,
            0,
            finalSize.cx,
            finalSize.cy);

        pop();
    }
}

class Brick extends GameObject
{
    constructor()
    {
        super();
        
        this.objectShape = eObjectShape.RECTANGLE;
        this.color = new Color();

        this.color.r = 243 + random(-50, 12);
        this.color.g = 147 + random(-30, 30);
        this.color.b =  50 + random(-30, 30);
    }

    draw(gridSettings)
    {
        if (this.enabled == false)
        {
            return;
        }

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

        rectMode(CENTER);

        strokeWeight(gridSettings.squareSize / 5);
        stroke(165, 87, 10);
        fill(this.color.r, this.color.g, this.color.b);

        rect(0,
             0,
             finalSize.cx,
             finalSize.cy);

        pop();
    }
}