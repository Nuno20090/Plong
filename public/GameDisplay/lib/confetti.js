class Confetti
{
    constructor()
    {
        this.visible = false;

        this.position = new Vector;
        this.velocity = new Vector;
        this.acceleration = new Vector;
        this.size = new Size;

        this.friction = 20;
        this.color = new Color;
        this.opacity = 255;  
    }

    init(position, direction, strength, color)
    {
        this.visible = true;
        this.position.copy(position);

        var particleDirection = 0;
        if (direction.magnitude() == 0)
        {
            particleDirection = random(0, TWO_PI);
        }
        else
        {
            particleDirection = randomGaussian(direction.angle() + PI, .40);
        }
        
        this.velocity.fromAngle(particleDirection);
        this.velocity.scaleTo(strength * random(0.1, 5));

        this.color.copy(color);
        this.size.set(random(10, 100) / 100, random(10, 100) / 100);
        this.size.set(1, 1);

        this.opacity = 255;
    }

    step(step)
    {
        // Calculate the new velocity based on the acceleration
        this.velocity = addVectors(this.velocity, this.acceleration.scale(step));

        // Change velocity to simulate friction
        this.velocity = this.velocity.scale(1 - (this.friction * step));
                
        // Calculate the new position based on the velocity
        this.position = addVectors(this.position, this.velocity.scale(step));

        // Change the opacity
        this.opacity = this.opacity * 0.99;

        if (this.opacity < 10)
        {
            this.visible = false;
        }
    }

    Draw(gridSettings)
    {
        if (this.visible == false)
        {
            return false;
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
        
        fill(this.color.r, 
             this.color.g,
             this.color.b,
             this.opacity);

        noStroke(0);
        ellipseMode(CENTER);
        ellipse(0,
                0,
                finalSize.cx,
                finalSize.cy);
            
        pop();

        return true;
    }
}

class ConfettiExplosion
{
    constructor()
    {
        this.confetties = []

        for (var i = 0; i < 50; i++)
        {
            this.confetties.push(new Confetti);
        }
    }

    CreateExplosion(position, direction, strenght, color)
    {
        this.enabled = true;

        // Set all the confetties to be visible
        for (var c = 0; c < this.confetties.length; c++)
        {
            var confetti = this.confetties[c];
            confetti.init(position, direction, strenght, color);
        }
    }

    Draw(gridSettings)
    {
        if (this.enabled == false)
        {
            return;
        }

        var bAnyEnabled = false;
        for (var c = 0; c < this.confetties.length; c++)
        {
            var confetti = this.confetties[c];
            if (confetti.Draw(gridSettings))
            {
                bAnyEnabled = true;
            }
        }

        if (bAnyEnabled == false)
        {
            this.enabled = false;
        }
    }

    step(step)
    {
        if (this.enabled == false)
        {
            return;
        }

        // Set all the confetties to be visible
        for (var c = 0; c < this.confetties.length; c++)
        {
            var confetti = this.confetties[c];
            confetti.step(step);
        }
    }
}