

class GameObject
{
    constructor()
    {
        this.objectShape = eObjectShape.RECTANGLE;
        this.position = new Vector();
        this.prevPosition = new Vector();
        this.rotation = 0;
        this.size = new Size();
        this.velocity = new Vector();
        this.acceleration = new Vector();
        this.friction = 0;
        this.enabled = true;
    }
    
    applyStep(step)
    {
        const lastPosition = new Vector();
        lastPosition.copy(this.position);

        // Calculate the new velocity based on the acceleration
        this.velocity = addVectors(this.velocity, this.acceleration.scale(step));

        // Change velocity to simulate friction
        this.velocity = this.velocity.scale(1 - (this.friction * step));
                
        // Calculate the new position based on the velocity
        this.position = addVectors(this.position, this.velocity.scale(step));

        // Only overwrite the previous position if there is a new position
        if ((this.position.x != lastPosition.x) || 
            (this.position.y != lastPosition.y))
        {
            this.prevPosition.copy(lastPosition);
        }

        // Just to confirm that we always have a valid situation
        //if ((this.position.x == this.prevPosition.x) && 
        //    (this.position.y == this.prevPosition.y))
        //{
        //    console.log(`*** Game Objects positions are the same!! ***`);
        //}
    }
/*
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

        switch (this.objectShape)
        {
            case eObjectShape.RECTANGLE:
                {
                    rectMode(CENTER);
                    rect(
                        0,
                        0,
                        finalSize.cx,
                        finalSize.cy);

                }
                break;
            case eObjectShape.ELLIPSE:
                {
                    fill('red');
                    strokeWeight(3);
                    ellipseMode(CENTER);
                    ellipse(0,
                            0,
                            finalSize.cx,
                            finalSize.cy);
                }
                break;
        }

        if (true)
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

        //drawSelf(gridSettings);

        pop();
    }   
    */
}