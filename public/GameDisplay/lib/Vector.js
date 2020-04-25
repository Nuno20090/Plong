
class Vector
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
    }

    copy(v)
    {
        this.x = v.x;
        this.y = v.y;
    }

    set(x, y)
    {
        this.x = x;
        this.y = y;
    }

    getX()
    {
        return this.x;
    }

    getY()
    {
        return this.y;
    }

    scaleTo(factor)
    {
        this.x *= factor;
        this.y *= factor;
    }

    scale(factor)
    {
        var newVec = new Vector;
        newVec.set(this.x * factor, 
                   this.y * factor);
                   
        return newVec;
    }

    magnitude()
    {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    angle()
    {
        if (this.magnitude() == 0)
        {
            return NaN;
        }

        const newVector = new Vector();
        newVector.copy(this);
        
        newVector.normalize();
           
        // Check special case when the line is vertical

        if (newVector.x == 0)
        {
            if (newVector.y > 0)
            {
                return PI * 0.5;
            }
            else
            {
                return PI * 1.5;
            }
        }

        var t = Math.atan(newVector.y / newVector.x);

        // Adjust the y axis because we have it inverted
        //if (t != 0)
        //{
        if (newVector.x < 0)
        {
            t += PI;
        }
        if (newVector.x > 0 && newVector.y < 0)
        {
            t = (TWO_PI + t);
        }
        
        return t;
    }

    fromAngle(angle)
    {
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
    }

    normalize()
    {
        const mag = this.magnitude();
        if (mag > 0)
        {
            this.x = this.x / mag;
            this.y = this.y / mag;
        }
    }

    reverse()
    {
        this.x = -this.x;
        this.y = -this.y;
    }    

    toDegree(r)
    {
        while (r >= TWO_PI)
        {
            r-= TWO_PI;
        }
        
        return (r * 360) / (2 * PI);
    }

    toRadians(d)
    {   
        while (d >= 360)
        {
            d -= 360;
        }
        return (d * 2 * PI) / (360);
    }

    static AngleBetween(v1, v2)
    {
        const angle1 = v1.angle();
        const angle2 = v2.angle();

        const diff1 = angle1 - angle2;
        const diff2 = angle1 - (angle2 + TWO_PI);
        
        return Math.min(abs(diff1), abs(diff2));  
    }

    static AdjustAngleToNearest(referenceAngle, angleToAdjust, targetDiff)
    {
        const diff1 = referenceAngle - angleToAdjust;
        const diff2 = referenceAngle - (angleToAdjust + TWO_PI);

        if (abs(diff1) < abs(diff2))
        {
            return referenceAngle - targetDiff;
        }
        else
        {
            return referenceAngle + targetDiff;
        }
    }
}

function addVectors(v1, v2)
{
    var newVec = new Vector;

    newVec.set(v1.getX() + v2.getX(),
               v1.getY() + v2.getY());

    return newVec;
}