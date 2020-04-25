
class Collision
{
    static CheckOverlap(circle, rectangle)
    {
        //console.log(`Ball x=${circle.position.x} y=${circle.position.y}` )

        var result = {};
        result.collision = false;
        result.collisionVector = new Vector;

        // All we need to do for now, is check if a circle is inside a rectangle.
        // No need for making this complicated for now
        
        // Notes:
        // Rectangle cannot be rotated
        // Circle must really be a circle and not an ellipse
        
        const rectangleLeft    = rectangle.position.x - rectangle.size.cx / 2;
        const rectangleRight   = rectangleLeft + rectangle.size.cx;
        const rectangleTop     = rectangle.position.y - rectangle.size.cy / 2;
        const rectangleBottom  = rectangleTop + rectangle.size.cy;

        // Fast check to see of for sure there is no intersection
        // Afterwards we go more in depth to the weird cases

        if ((rectangleLeft    > circle.position.x + circle.size.cx / 2) ||
            (rectangleRight   < circle.position.x - circle.size.cx / 2) || 
            (rectangleTop     > circle.position.y + circle.size.cy / 2) || 
            (rectangleBottom  < circle.position.y - circle.size.cy / 2))
        {
            return result;            
        }

        // Test the cases where the circle is aligned the side of 
        // the rectangle, Meaning that it's not hitting the corners

        const ballOnLeft    = circle.position.x <= rectangleLeft;
        const ballOnRight   = circle.position.x >= rectangleRight;
        const ballOnTop     = circle.position.y <= rectangleTop;
        const ballOnBottom  = circle.position.y >= rectangleBottom;

        if (ballOnTop && (ballOnLeft == false && ballOnRight == false))
        {
            // Ball is hitting from the top
            result.collision = true;
            result.collisionVector.x = 0;
            result.collisionVector.y = 1;
            //console.log(`Ball is hitting from the top`);
            //return result;
        }

        if (ballOnBottom && (ballOnLeft == false && ballOnRight == false))
        {
            // Ball is hitting from the bottom
            result.collision = true;
            result.collisionVector.x = 0;
            result.collisionVector.y = -1;
            //console.log(`Ball is hitting from the bottom`);
            //return result;
        }

        if (ballOnLeft && (ballOnTop == false && ballOnBottom == false))
        {
            // Ball is hitting from the left
            result.collision = true;
            result.collisionVector.x = 1;
            result.collisionVector.y = 0;
            //console.log(`Ball is hitting from the left`);
            //return result;
        }

        if (ballOnRight && (ballOnTop == false && ballOnBottom == false))
        {
            // Ball is hitting from the right
            result.collision = true;
            result.collisionVector.x = -1;
            result.collisionVector.y = 0;
            //console.log(`Ball is hitting from the right`);
            //return result;
        }

        if (result.collision == true)
        {
            // Consider the movement of the rectangle to adjust the direction of the ball slightly

            const velocityMagnitude = result.collisionVector.magnitude();

            var newCollisionDirection = new Vector();
            newCollisionDirection.copy(result.collisionVector);

            // Just check horizontal velocity. This is for the pads only.
            // Not perfect but it's all we need for now
            
            var collisionAngle = newCollisionDirection.angle();
            var collisionAngleByVelocity = (rectangle.velocity.x * 0.005);
            if (collisionAngleByVelocity < 0)
            {
                collisionAngleByVelocity = Math.max(-(HALF_PI / 4), collisionAngleByVelocity);
            }
            else
            {
                collisionAngleByVelocity = Math.min((HALF_PI / 4), collisionAngleByVelocity);
            }
            
            newCollisionDirection.fromAngle(collisionAngle + collisionAngleByVelocity);
            newCollisionDirection.scaleTo(velocityMagnitude);

            result.collisionVector.copy(newCollisionDirection);
            
            return result;
        }

        // These are the cases where the circle might be near the corner of the rectangle
        // Check which corner is the ball near

        const corner = new Point;

        corner.x = ballOnLeft ? rectangleLeft : rectangleRight;
        corner.y = ballOnTop  ? rectangleTop  : rectangleBottom;

        // Calculate the distance between the corner and the center of the ball

        const distance = sqrt(Math.pow(corner.x - circle.position.x, 2) + 
                              Math.pow(corner.y - circle.position.y, 2));

        if (distance <= circle.size.cx / 2)
        {
            result.collisionVector.x = corner.x - circle.position.x;
            result.collisionVector.y = corner.y - circle.position.y;
            result.collisionVector.normalize();
            result.collision = true;

            //console.log(`Corner collision detected: x=${result.collisionVector.x.toFixed(2)} y=${result.collisionVector.y.toFixed(2)}`)
        }
        
        return result;
    }

    static ResolveIntrusion(circle, rectangle)
    {
        // If there is a collision is because the circle is inside the other object
        // Check the object previous position and interpolate until we resolve the current position
        const currentPosition = new Vector();
        currentPosition.copy(circle.position);

        const previousPosition = new Vector();
        previousPosition.copy(circle.prevPosition);

        if (false)
        {
            console.log(`Resolve Intrusion`);
            console.log(` Ball Step        : ${circle.step}`);
            console.log(` Previous Position: ${previousPosition.x}, ${previousPosition.y}`);
            console.log(` Current Position : ${currentPosition.x}, ${currentPosition.y}`);
        }
        // First of all, first, check that the previous position is valid
        
        const ballOnTestPos = new Ball();
        ballOnTestPos.copy(circle);

        ballOnTestPos.position.copy(previousPosition);
        
        const collisionDataPrevPos = Collision.CheckOverlap(ballOnTestPos, rectangle);        
        if (collisionDataPrevPos.collision == true)
        {
            console.log("*** Problem with the ResolveIntrusion method! Previous position is not valid!");
            return;
        }

        // Go 4 steps deep in finding the best position
        const startPos = new Vector();
        startPos.copy(previousPosition);

        const endPos = new Vector();
        endPos.copy(currentPosition);

        const midPos = new Vector();
        const bestGuess = new Vector();
        bestGuess.copy(startPos);

        let step = 0;
        for (step = 0; step < 5; step++)
        {
            // Calculate the middle position

            midPos.set(startPos.x + ((endPos.x - startPos.x) / 2),
                       startPos.y + ((endPos.y - startPos.y) / 2));

            // Evaluate this collision

            ballOnTestPos.position.copy(midPos);
            let collisionDataTestPos = Collision.CheckOverlap(ballOnTestPos, rectangle);
                       
            // Check if this position is a good one or not

            if (collisionDataTestPos.collision == true)
            {
                // If this is a collision, the next vector should be the first half
                endPos.copy(midPos);
            }
            else
            {
                // If this is not a collision, use the second part of the vector
                startPos.copy(midPos);
                bestGuess.copy(midPos);
            }
        }

        // This should be a good position
        //console.log(` Final Position   : ${bestGuess.x}, ${bestGuess.y}`);
        circle.position.copy(bestGuess);

        // Check if this is still a collision
        const collisionDataNewPos = Collision.CheckOverlap(circle, rectangle);
        if (collisionDataNewPos.collision)
        {
            console.log("*** Problem with the ResolveIntrusion method! BEST GUESS is not valid!");
        }
    }
}