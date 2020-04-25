
class Ball extends GameObject
{
    constructor()
    {
        super();
        
        this.objectShape = eObjectShape.ELLIPSE;
        
        // These parameters cause the ball to be stuck in the corner at step 540!
        this.size.set(7, 7);
        this.position.set(78, 20);
        this.velocity.set(100, -20);
        this.acceleration.set(0, 200);

        this.resetPosition();
        
        this.step = 0;
    }

    log(message)
    {        
        //console.log(`Ball: Step: ${this.step} ${message} X: ${this.position.x.toFixed(4)} Y: ${this.position.y.toFixed(4)}`);
    }

    increseStep()
    {
        //console.log(`.`);
        this.step++;
    }

    copy(source)
    {
        this.objectShape = source.objectShape;
        this.size.copy(source.size);
        this.position.copy(source.position);
        this.velocity.copy(source.velocity);
        this.acceleration.copy(source.acceleration);
    }

    resetPosition()
    {
        this.size.set(7, 7);
        this.position.set(42, 10);
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;

        if (this.velocity.magnitude() > 50)
        {
            this.velocity.normalize();
            this.velocity.scaleTo(50);
        }

        // Debug code!!
        //this.position.set(40, 70);
        //this.velocity.set(0, 30);
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
        
        fill(210, 56, 4);
        noStroke(0);
        ellipseMode(CENTER);
        ellipse(0,
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

        if (false)
        {
            super.draw(gridSettings);
            textSize(18);
            textAlign(LEFT, TOP);
            text(`${this.step}`, (this.position.x + this.size.cx / 2) * gridSettings.squareSize, 
                                 (this.position.y + this.size.cy / 2) * gridSettings.squareSize);
        }
    }
}